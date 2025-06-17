from django.db import models
from django.contrib.auth import get_user_model

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
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES)
    location = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audits')
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
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