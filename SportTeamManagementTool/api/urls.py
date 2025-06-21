from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    UserViewSet, TeamViewSet, PostViewSet, CommentViewSet, EventViewSet,
    UserRegistrationView, UserLoginView, UserLogoutView # Add these
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'teams', TeamViewSet, basename='teams')

# Nested router for posts under teams
teams_router = routers.NestedSimpleRouter(router, r'teams', lookup='team')
teams_router.register(r'posts', PostViewSet, basename='team-posts')
teams_router.register(r'events', EventViewSet, basename='team-events')

# Nested router for comments under posts
posts_router = routers.NestedSimpleRouter(teams_router, r'posts', lookup='post')
posts_router.register(r'comments', CommentViewSet, basename='post-comments')

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    path('', include(router.urls)),
    path('', include(teams_router.urls)),
    path('', include(posts_router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]