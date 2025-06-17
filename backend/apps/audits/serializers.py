from rest_framework import serializers
from .models import Audit, ChecklistCategory, ChecklistQuestion, AuditResponse, AuditResult

class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

class ChecklistQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistQuestion
        fields = ['id', 'question_text', 'order']

class ChecklistCategorySerializer(serializers.ModelSerializer):
    questions = ChecklistQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChecklistCategory
        fields = ['id', 'name', 'description', 'order', 'questions']

class AuditResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditResponse
        fields = '__all__'

class AuditResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditResult
        fields = '__all__' 