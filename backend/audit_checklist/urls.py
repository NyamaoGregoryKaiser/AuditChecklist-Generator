from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from audit.views import (
    AuthViewSet, UserViewSet, AuditViewSet, 
    ChecklistViewSet, AdminInvitationViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.views.generic import RedirectView

# Create routers for different API groups
auth_router = DefaultRouter()
auth_router.register(r'', AuthViewSet, basename='auth')

user_router = DefaultRouter()
user_router.register(r'list', UserViewSet, basename='user')

audit_router = DefaultRouter()
audit_router.register(r'list', AuditViewSet, basename='audit')
audit_router.register(r'checklists', ChecklistViewSet)

admin_router = DefaultRouter()
admin_router.register(r'admin-invitations', AdminInvitationViewSet)

urlpatterns = [
    # Root redirect to Swagger
    path('', RedirectView.as_view(url='/swagger', permanent=False)),
    
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/', include(auth_router.urls)),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User management endpoints
    path('api/users/', include([
        path('list/', UserViewSet.as_view({'get': 'list'}), name='user-list'),
        path('list/<int:pk>/', UserViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }), name='user-detail'),
        path('me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
        path('', UserViewSet.as_view({'post': 'create'}), name='user-create'),
    ])),
    
    # Audit management endpoints
    path('api/audits/', include([
        path('list/', AuditViewSet.as_view({'get': 'list'}), name='audit-list'),
        path('list/<int:pk>/', AuditViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }), name='audit-detail'),
        path('create/', AuditViewSet.as_view({'post': 'create'}), name='audit-create'),
    ])),
    
    # Admin management endpoints
    path('api/admin/', include(admin_router.urls)),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] 