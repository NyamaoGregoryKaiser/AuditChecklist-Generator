from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class Audit(models.Model):
    INDUSTRY_CHOICES = [
        ('manufacturing', 'Manufacturing'),
        ('healthcare', 'Healthcare'),
        ('retail', 'Retail'),
        ('technology', 'Technology'),
        ('finance', 'Finance'),
        ('education', 'Education'),
        ('construction', 'Construction'),
        ('transportation', 'Transportation'),
        ('energy', 'Energy'),
        ('agriculture', 'Agriculture'),
        ('other', 'Other'),
    ]
    
    STANDARD_CHOICES = [
        ('iso9001', 'ISO 9001'),
        ('iso14001', 'ISO 14001'),
        ('iso45001', 'ISO 45001'),
        ('iso27001', 'ISO 27001'),
        ('sox', 'SOX'),
        ('gdpr', 'GDPR'),
        ('hipaa', 'HIPAA'),
        ('other', 'Other'),
    ]
    
    SIZE_CHOICES = [
        ('small', 'Small (1-50 employees)'),
        ('medium', 'Medium (51-250 employees)'),
        ('large', 'Large (251-1000 employees)'),
        ('enterprise', 'Enterprise (1000+ employees)'),
    ]
    
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES)
    location = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audits')
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Audit for {self.company_name}"

class ChecklistCategory(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.audit.company_name} - {self.name}"

class ChecklistQuestion(models.Model):
    category = models.ForeignKey(ChecklistCategory, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.category.name} - Q{self.order}"

class AuditResponse(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(ChecklistQuestion, on_delete=models.CASCADE)
    score = models.IntegerField()  # 1-10 scale
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['audit', 'question']

class AuditResult(models.Model):
    audit = models.OneToOneField(Audit, on_delete=models.CASCADE, related_name='result')
    overall_score = models.FloatField()
    category_scores = models.JSONField()  # Store category-wise scores
    recommendations = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)
