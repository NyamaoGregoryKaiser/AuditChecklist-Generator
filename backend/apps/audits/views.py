from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Audit, ChecklistCategory, ChecklistQuestion, AuditResponse, AuditResult
from .serializers import AuditSerializer, ChecklistCategorySerializer, AuditResponseSerializer, AuditResultSerializer
from .ai_service import AuditAIService
from apps.authentication.permissions import IsAdminOrOwner

class AuditViewSet(viewsets.ModelViewSet):
    serializer_class = AuditSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Audit.objects.all()
        return Audit.objects.filter(created_by=self.request.user)
    
    def get_view_name(self):
        if 'list' in self.request.path:
            return 'Audit List'
        elif 'create' in self.request.path:
            return 'Create Audit'
        return super().get_view_name()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate_checklist(self, request, pk=None):
        audit = self.get_object()
        
        if audit.checklists.exists():
            return Response(
                {'error': 'Checklist already exists for this audit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare data for AI service
        audit_data = {
            'company_name': audit.company_name,
            'industry': audit.industry,
            'location': audit.location
        }
        
        # Generate checklist using AI
        checklist_data = AuditAIService.generate_checklist(audit_data)
        
        # Save to database
        with transaction.atomic():
            for idx, category_data in enumerate(checklist_data['categories']):
                category = ChecklistCategory.objects.create(
                    audit=audit,
                    name=category_data['name'],
                    description=category_data.get('description', ''),
                    order=idx + 1
                )
                
                for q_idx, question_text in enumerate(category_data['questions']):
                    ChecklistQuestion.objects.create(
                        category=category,
                        question_text=question_text,
                        order=q_idx + 1
                    )
        
        return Response({'message': 'Checklist generated successfully'})
    
    @action(detail=True, methods=['get'])
    def checklist(self, request, pk=None):
        audit = self.get_object()
        categories = audit.categories.all()
        serializer = ChecklistCategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_responses(self, request, pk=None):
        audit = self.get_object()
        responses_data = request.data.get('responses', {})
        
        with transaction.atomic():
            # Save responses
            for question_id, score in responses_data.items():
                AuditResponse.objects.update_or_create(
                    audit=audit,
                    question_id=question_id,
                    defaults={'score': score}
                )
            
            # Calculate results
            category_scores = {}
            total_score = 0
            total_questions = 0
            
            for category in audit.categories.all():
                category_total = 0
                category_count = 0
                
                for question in category.questions.all():
                    try:
                        response = AuditResponse.objects.get(audit=audit, question=question)
                        category_total += response.score
                        category_count += 1
                        total_score += response.score
                        total_questions += 1
                    except AuditResponse.DoesNotExist:
                        pass
                
                if category_count > 0:
                    category_scores[category.name] = category_total / category_count
            
            overall_score = total_score / total_questions if total_questions > 0 else 0
            
            # Generate AI recommendations
            audit_data = {
                'company_name': audit.company_name,
                'industry': audit.industry,
                'location': audit.location
            }
            
            recommendations = AuditAIService.generate_recommendations(audit_data, category_scores)
            
            # Save results
            AuditResult.objects.update_or_create(
                audit=audit,
                defaults={
                    'overall_score': overall_score,
                    'category_scores': category_scores,
                    'recommendations': recommendations
                }
            )
            
            audit.is_completed = True
            audit.save()
        
        return Response({'message': 'Audit completed successfully'})
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        audit = self.get_object()
        try:
            result = audit.result
            serializer = AuditResultSerializer(result)
            return Response(serializer.data)
        except AuditResult.DoesNotExist:
            return Response(
                {'error': 'Results not available'},
                status=status.HTTP_404_NOT_FOUND
            )
