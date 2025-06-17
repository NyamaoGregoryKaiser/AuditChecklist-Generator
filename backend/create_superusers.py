import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'audit_checklist.settings')
django.setup()

from django.contrib.auth.models import User

def create_superusers():
    # Create admin superuser
    admin_user = User.objects.create_user(
        username='admin@example.com',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )
    print(f"Created admin superuser: {admin_user.username}")

    # Create regular superuser
    regular_user = User.objects.create_user(
        username='user@example.com',
        email='user@example.com',
        password='user123',
        first_name='Regular',
        last_name='User',
        is_staff=False,
        is_superuser=False
    )
    print(f"Created regular user: {regular_user.username}")

if __name__ == '__main__':
    create_superusers() 