from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Audit, Checklist, AdminInvitation
from rest_framework_simplejwt.tokens import RefreshToken
from typing import List, Dict, Any, Optional
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = UserResponseSerializer(read_only=True)

    def validate(self, data):
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not password:
            raise serializers.ValidationError('Password is required.')

        if not username and not email:
            raise serializers.ValidationError('Either username or email is required.')

        try:
            if username:
                user = User.objects.get(username=username)
            else:
                user = User.objects.get(email=email)
            
            if not user.check_password(password):
                raise serializers.ValidationError('Invalid credentials.')
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        refresh = RefreshToken.for_user(user)
        data['token'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        data['user'] = user
        return data

class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checklist
        fields = ('id', 'audit', 'item', 'is_completed', 'notes', 'order')

class AuditSerializer(serializers.ModelSerializer):
    checklists = serializers.SerializerMethodField()
    created_by = UserResponseSerializer(read_only=True)

    class Meta:
        model = Audit
        fields = ('id', 'title', 'audit_type', 'organization', 'industry', 
                 'specific_requirements', 'complexity_level', 'created_at', 
                 'updated_at', 'created_by', 'is_completed', 'completion_date', 
                 'checklists')
        read_only_fields = ['created_by', 'created_at', 'updated_at', 
                           'is_completed', 'completion_date']

    @extend_schema_field(List[ChecklistSerializer])
    def get_checklists(self, obj: Audit) -> List[Dict[str, Any]]:
        checklists = obj.checklists.all().order_by('order')
        return ChecklistSerializer(checklists, many=True).data

class AdminInvitationSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    invited_by = UserResponseSerializer(read_only=True)

    class Meta:
        model = AdminInvitation
        fields = ('id', 'email', 'token', 'created_at', 'expires_at', 
                 'is_used', 'invited_by', 'status')
        read_only_fields = ('token', 'created_at', 'expires_at', 'is_used')

    @extend_schema_field(str)
    def get_status(self, obj: AdminInvitation) -> str:
        if obj.is_used:
            return 'used'
        if obj.expires_at < timezone.now():
            return 'expired'
        return 'valid' 