from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow admins to access any object
        if request.user.role == 'admin':
            return True
        
        # Allow users to access their own objects
        return obj.user == request.user 