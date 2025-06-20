#!/usr/bin/env python
"""
Script to help migrate from SQLite to PostgreSQL
Run this script after setting up your PostgreSQL database
"""

import os
import django
from django.core.management import execute_from_command_line

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'audit_project.settings')
django.setup()

def main():
    print("Starting migration to PostgreSQL...")
    
    # Make sure we have the DATABASE_URL set
    if not os.getenv('DATABASE_URL'):
        print("ERROR: DATABASE_URL environment variable not set!")
        print("Please set it to your PostgreSQL connection string.")
        return
    
    try:
        # Create migrations
        print("Creating migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Run migrations
        print("Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("Migration completed successfully!")
        print("You can now create a superuser with: python manage.py createsuperuser")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        print("Please check your DATABASE_URL and try again.")

if __name__ == '__main__':
    main() 