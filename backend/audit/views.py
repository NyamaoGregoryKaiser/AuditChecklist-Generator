from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Audit, Checklist, AdminInvitation
from .serializers import (
    UserCreateSerializer, LoginSerializer, AuditSerializer,
    ChecklistSerializer, AdminInvitationSerializer
)
from rest_framework_simplejwt.views import TokenRefreshView
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework_simplejwt.tokens import RefreshToken
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from chat import AuditChecklistGenerator
from django.db import transaction
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Debug print to check if the API key is loaded
print("GEMINI_API_KEY:", os.getenv('GEMINI_API_KEY'))

# Configure the Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Authentication Views
@extend_schema_view(
    register=extend_schema(
        description="Register a new user (always as regular user)",
        responses={201: UserCreateSerializer, 400: None}
    ),
    login=extend_schema(
        description="Unified login for both admin and regular users",
        responses={200: LoginSerializer, 400: None}
    )
)
class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer  # Default serializer for documentation

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        """Unified login for both admin and regular users"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            return Response({
                'token': serializer.validated_data['token'],
                'refresh': serializer.validated_data['refresh'],
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        """Register a new user (always as regular user)"""
        data = request.data.copy()
        email = data.get('email', '')
        
        # Generate a unique username from email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        
        # Keep trying until we find a unique username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        data['username'] = username
        serializer = UserCreateSerializer(data=data)
        
        if serializer.is_valid():
            user = serializer.save(is_staff=False)  # Ensure new registrations are not staff
            
            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User Management Views
@extend_schema_view(
    me=extend_schema(
        description="Get current user's profile",
        responses={200: UserCreateSerializer}
    )
)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['me']:
            return [IsAuthenticated()]
        return [IsAdminUser()]  # Only admins can manage users

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# Audit Management Views
class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        with transaction.atomic():
            # Save the audit first
            audit = serializer.save(created_by=self.request.user)
            
            # Initialize the checklist generator
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise Exception("GEMINI_API_KEY not found in environment variables")
            
            generator = AuditChecklistGenerator(api_key)
            
            # Generate checklist using chat.py
            checklist_text = generator.generate_checklist(
                audit_type=audit.audit_type,
                organization=audit.organization,
                industry=audit.industry,
                specific_requirements=audit.specific_requirements,
                complexity_level=audit.complexity_level
            )
            
            # Process the checklist text
            current_category = None
            order = 1
            
            for line in checklist_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                # Check if this is a category line
                if line.startswith('Category'):
                    current_category = line
                    # Create the category as a checklist item
                    Checklist.objects.create(
                        audit=audit,
                        item=current_category,
                        order=order,
                        is_completed=False
                    )
                    order += 1
                # Check if this is a question line (starts with -)
                elif line.startswith('-'):
                    question = line[1:].strip()  # Remove the - and any extra spaces
                    Checklist.objects.create(
                        audit=audit,
                        item=question,
                        order=order,
                        is_completed=False
                    )
                    order += 1

    def get_queryset(self):
        if self.request.user.is_staff:
            return Audit.objects.all()
        return Audit.objects.filter(created_by=self.request.user)

# Checklist Management Views
class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.all()
    serializer_class = ChecklistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Checklist.objects.all()
        return Checklist.objects.filter(audit__created_by=self.request.user)

# Admin Management Views
@extend_schema_view(
    validate_token=extend_schema(
        description="Validate an admin invitation token",
        responses={200: AdminInvitationSerializer, 400: None}
    )
)
class AdminInvitationViewSet(viewsets.ModelViewSet):
    queryset = AdminInvitation.objects.all()
    serializer_class = AdminInvitationSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        invitation = serializer.save(invited_by=self.request.user)
        
        # Send invitation email
        context = {
            'invitation': invitation,
            'registration_url': f"{settings.FRONTEND_URL}/register?token={invitation.token}"
        }
        html_message = render_to_string('email/admin_invitation.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            'Admin Invitation - Audit Checklist System',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [invitation.email],
            html_message=html_message,
            fail_silently=False,
        )

    @action(detail=False, methods=['get'])
    def validate_token(self, request):
        """Validate an admin invitation token"""
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=400)
        
        try:
            invitation = AdminInvitation.objects.get(token=token)
            if not invitation.is_valid():
                return Response({'error': 'Invalid or expired invitation'}, status=400)
            return Response({'email': invitation.email})
        except AdminInvitation.DoesNotExist:
            return Response({'error': 'Invalid invitation token'}, status=400) 