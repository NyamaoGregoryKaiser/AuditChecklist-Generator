from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditViewSet

router = DefaultRouter()
router.register(r'create', AuditViewSet, basename='audit')

urlpatterns = [
    path('', include(router.urls)),
] 