from rest_framework import permissions
from .models import TeamMembership, Post, Event, Team # Import Team directly

class IsTrainerOfTeam(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST' and view.basename == 'teams':
            return request.user.is_authenticated

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Team):
            return obj.trainer == request.user
        return False

class IsTeamMember(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST' and (view.basename == 'team-posts' or view.basename == 'team-events'):
            return request.user.is_authenticated

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if isinstance(obj, Post) or isinstance(obj, Event):
                return obj.team.memberships.filter(user=request.user).exists()
            elif isinstance(obj, Team):
                return obj.memberships.filter(user=request.user).exists()
        return False

class IsTrainerOrTeamMemberForPostComments(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Comment):
            return obj.post.team.memberships.filter(user=request.user).exists()
        return False

class IsPostAuthorOrTeamMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.team.memberships.filter(user=request.user).exists()

        return obj.author == request.user

class IsCommentAuthorOrTrainer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:

        if request.method in ['PUT', 'PATCH']:
            return obj.author == request.user

        if request.method == 'DELETE':
            return obj.author == request.user or obj.post.team.trainer == request.user
        return False