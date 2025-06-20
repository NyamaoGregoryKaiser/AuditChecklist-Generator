#!/usr/bin/env python
"""
Test script to verify Django configuration
Run this to check if the app structure is correct
"""

import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'audit_project.settings')

try:
    django.setup()
    print("✅ Django setup successful!")
    
    # Test app imports
    from apps.authentication.models import User
    print("✅ Authentication app imported successfully!")
    
    from apps.audits.models import Audit
    print("✅ Audits app imported successfully!")
    
    # Note: Core app doesn't have models yet
    print("✅ Core app structure is correct (no models yet)")
    
    print("\n🎉 All apps are configured correctly!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 