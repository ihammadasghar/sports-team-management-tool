from rest_framework import permissions
from .models import TeamMembership, Post, Event, Team # Import Team directly

class IsTrainerOfTeam(permissions.BasePermission):
    """
    Custom permission to only allow trainers of a team to access/modify team-specific resources.
    """
    def has_permission(self, request, view):
        # Allow trainers to create teams (handled in serializer)
        if request.method == 'POST' and view.basename == 'teams':
            return request.user.is_authenticated

        # For other actions, check if the user is authenticated
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # For Team objects, check if the user is the trainer of this specific team
        # Corrected: Use imported 'Team' model directly
        if isinstance(obj, Team):
            return obj.trainer == request.user
        return False

class IsTeamMember(permissions.BasePermission):
    """
    Custom permission to only allow members (trainer, athlete, member) of a team to access
    team-specific resources (e.g., posts, events).
    """
    def has_permission(self, request, view):
        # Allow trainers to create new posts/events for a team (handled in view)
        if request.method == 'POST' and (view.basename == 'team-posts' or view.basename == 'team-events'): # Use actual basename
            return request.user.is_authenticated

        # For other actions, check if the user is authenticated
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            # Corrected: Use imported 'Post' and 'Event' models directly
            if isinstance(obj, Post) or isinstance(obj, Event):
                return obj.team.memberships.filter(user=request.user).exists()
            # For Team objects, check if the user is a member of this specific team
            # Corrected: Use imported 'Team' model directly
            elif isinstance(obj, Team):
                return obj.memberships.filter(user=request.user).exists()
        return False

class IsTrainerOrTeamMemberForPostComments(permissions.BasePermission):
    """
    Custom permission to allow trainers or any team member to comment on a post.
    """
    def has_permission(self, request, view):
        # Only authenticated users can create comments
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # For Comment objects, check if the user is a member of the post's team
        # Corrected: Use imported 'Comment' model directly
        if isinstance(obj, Comment):
            return obj.post.team.memberships.filter(user=request.user).exists()
        return False

class IsPostAuthorOrTeamMember(permissions.BasePermission):
    """
    Custom permission to allow the post author or any team member to view a post.
    Only the post author can update/delete the post.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any team member
        if request.method in permissions.SAFE_METHODS:
            return obj.team.memberships.filter(user=request.user).exists()

        # Write permissions are only allowed to the author of the post
        return obj.author == request.user

class IsCommentAuthorOrTrainer(permissions.BasePermission):
    """
    Custom permission to allow the comment author or the team's trainer to delete a comment.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any team member (handled by IsTeamMember for the parent Post)
        if request.method in permissions.SAFE_METHODS:
            return True # Already handled by the parent Post permission logic or nested view logic

        # Write permissions (update/delete)
        # Only the comment author can update their comment
        if request.method in ['PUT', 'PATCH']:
            return obj.author == request.user

        # Only the comment author or the team's trainer can delete a comment
        if request.method == 'DELETE':
            return obj.author == request.user or obj.post.team.trainer == request.user
        return False