"""
WSGI config for audit_checklist project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'audit_checklist.settings')

application = get_wsgi_application() 