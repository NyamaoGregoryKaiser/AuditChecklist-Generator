from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta

class Audit(models.Model):
    COMPLEXITY_CHOICES = [
        ('basic', 'Basic'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    audit_type = models.CharField(max_length=100, default='General Audit')
    organization = models.CharField(max_length=200, default='General Organization')
    industry = models.CharField(max_length=100, default='General')
    specific_requirements = models.TextField(blank=True)
    complexity_level = models.CharField(
        max_length=20,
        choices=COMPLEXITY_CHOICES,
        default='intermediate'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class Checklist(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='checklists')
    item = models.TextField()
    order = models.IntegerField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.audit.title} - Item {self.order}"

class AdminInvitation(models.Model):
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = get_random_string(64)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Invitation for {self.email}" 