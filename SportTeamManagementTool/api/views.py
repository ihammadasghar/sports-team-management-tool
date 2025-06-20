from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token # Import Token model
from rest_framework.permissions import AllowAny, IsAuthenticated # AllowAny for auth views
from django.contrib.auth import logout # For logging out

from .models import User, Team, TeamMembership, Post, Comment, Event
from .serializers import (
    UserSerializer, TeamSerializer, TeamMembershipSerializer,
    PostSerializer, CommentSerializer, EventSerializer, UserRegistrationSerializer, UserLoginSerializer
)
from .permissions import (
    IsTrainerOfTeam, IsTeamMember, IsTrainerOrTeamMemberForPostComments,
    IsPostAuthorOrTeamMember, IsCommentAuthorOrTrainer
)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] # Only authenticated users can view users

class TeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be created, viewed, updated or deleted.
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    # Removed default permission_classes to handle them dynamically in get_permissions

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            # For listing all teams or retrieving a single team's details,
            # any authenticated user should be able to see it, but has_object_permission
            # of IsTeamMember will ensure only actual members can view specific details.
            permission_classes = [IsAuthenticated, IsTeamMember]
        elif self.action == 'create':
            # Any authenticated user can create a team (they become the trainer)
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy', 'remove_member', 'transfer_trainer']:
            # Only the trainer of the team can update/delete the team or manage members
            permission_classes = [IsAuthenticated, IsTrainerOfTeam]
        elif self.action == 'add_member':
            # Any authenticated user can attempt to join a team
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated] # Default for other actions

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # When listing, we don't want to filter by membership here,
        # as the frontend dashboard needs to see *all* teams to decide which to join.
        # Object-level permissions will then restrict access to details.
        return Team.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        team = self.get_object()

        is_requesting_user_trainer = (team.trainer == request.user)

        target_username = request.data.get('username')
        target_role = request.data.get('role', TeamMembership.Role.MEMBER)

        if not target_role in [choice[0] for choice in TeamMembership.Role.choices]:
             return Response({"detail": f"Invalid role. Must be one of: {TeamMembership.Role.choices}"}, status=status.HTTP_400_BAD_REQUEST)

        user_to_add = None
        if is_requesting_user_trainer:
            if not target_username:
                return Response({"detail": "Username is required when trainer is adding a member."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                user_to_add = User.objects.get(username=target_username)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            if target_username and target_username != request.user.username:
                return Response({"detail": "Only team trainers can add other users. You can only join yourself to this team."}, status=status.HTTP_403_FORBIDDEN)
            if target_role == TeamMembership.Role.TRAINER:
                return Response({"detail": "You cannot join as a trainer unless you are already the team's trainer."}, status=status.HTTP_403_FORBIDDEN)
            user_to_add = request.user

        if not user_to_add:
            return Response({"detail": "Could not determine user to add."}, status=status.HTTP_400_BAD_REQUEST)

        if TeamMembership.objects.filter(team=team, user=user_to_add).exists():
            return Response({"detail": "User is already a member of this team."}, status=status.HTTP_409_CONFLICT)

        membership = TeamMembership.objects.create(team=team, user=user_to_add, role=target_role)
        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove-member') # Permissions handled by get_permissions
    def remove_member(self, request, pk=None):
        team = self.get_object()
        username = request.data.get('username')

        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_remove = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user_to_remove == team.trainer:
            return Response({"detail": "Cannot remove the trainer directly. Transfer team ownership first."}, status=status.HTTP_400_BAD_REQUEST)

        membership = get_object_or_404(TeamMembership, team=team, user=user_to_remove)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='transfer-trainer') # Permissions handled by get_permissions
    def transfer_trainer(self, request, pk=None):
        team = self.get_object()
        new_trainer_username = request.data.get('new_trainer_username')

        if not new_trainer_username:
            return Response({"detail": "New trainer username is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_trainer = User.objects.get(username=new_trainer_username)
        except User.DoesNotExist:
            return Response({"detail": "New trainer user not found."}, status=status.HTTP_404_NOT_FOUND)

        if not TeamMembership.objects.filter(team=team, user=new_trainer).exists():
            return Response({"detail": "The new trainer must already be a member of the team."}, status=status.HTTP_400_BAD_REQUEST)

        old_trainer_membership = TeamMembership.objects.get(team=team, user=team.trainer)
        old_trainer_membership.role = TeamMembership.Role.MEMBER
        old_trainer_membership.save()

        new_trainer_membership = TeamMembership.objects.get(team=team, user=new_trainer)
        new_trainer_membership.role = TeamMembership.Role.TRAINER
        new_trainer_membership.save()

        team.trainer = new_trainer
        team.save()

        serializer = TeamSerializer(team, context={'request': request})
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be created, viewed, updated or deleted.
    Posts are tied to a specific team.
    """
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsTeamMember, IsPostAuthorOrTeamMember]

    def get_queryset(self):
        team_pk = self.kwargs.get('team_pk')
        if team_pk:
            team = get_object_or_404(Team, pk=team_pk)
            # Ensure the user is a member of this team to see posts
            if not team.memberships.filter(user=self.request.user).exists():
                return Post.objects.none() # Return empty queryset if not a member
            return Post.objects.filter(team=team).order_by('-created_at')
        return Post.objects.none() # Or raise Http404

    def perform_create(self, serializer):
        team = get_object_or_404(Team, pk=self.kwargs.get('team_pk'))
        # Only trainers can create posts for a team
        if team.trainer != self.request.user:
            raise exceptions.PermissionDenied("Only the trainer can create posts for this team.")
        serializer.save(team=team)

class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows comments to be created, viewed, updated or deleted.
    Comments are tied to a specific post.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsTrainerOrTeamMemberForPostComments, IsCommentAuthorOrTrainer]

    def get_queryset(self):
        post_pk = self.kwargs.get('post_pk')
        if post_pk:
            post = get_object_or_404(Post, pk=post_pk)
            # Ensure the user is a member of the post's team to see comments
            if not post.team.memberships.filter(user=self.request.user).exists():
                return Comment.objects.none()
            return Comment.objects.filter(post=post).order_by('created_at')
        return Comment.objects.none()

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs.get('post_pk'))
        # Any team member can comment on a post
        if not post.team.memberships.filter(user=self.request.user).exists():
            raise exceptions.PermissionDenied("You must be a member of this team to comment on this post.")
        serializer.save(post=post)

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be created, viewed, updated or deleted.
    Events are tied to a specific team.
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsTeamMember] # IsTeamMember will check if user is part of the team

    def get_queryset(self):
        team_pk = self.kwargs.get('team_pk')
        if team_pk:
            team = get_object_or_404(Team, pk=team_pk)
            # Ensure the user is a member of this team to see events
            if not team.memberships.filter(user=self.request.user).exists():
                return Event.objects.none()
            return Event.objects.filter(team=team).order_by('start_time')
        return Event.objects.none()

    def perform_create(self, serializer):
        team = get_object_or_404(Team, pk=self.kwargs.get('team_pk'))
        # Only trainers can create events for a team
        if team.trainer != self.request.user:
            raise exceptions.PermissionDenied("Only the trainer can create events for this team.")
        serializer.save(team=team)

    def perform_update(self, serializer):
        team = get_object_or_404(Team, pk=self.kwargs.get('team_pk'))
        # Only trainers can update events for a team
        if team.trainer != self.request.user:
            raise exceptions.PermissionDenied("Only the trainer can update events for this team.")
        serializer.save()

    def perform_destroy(self, instance):
        # Only trainers can delete events for a team
        if instance.team.trainer != self.request.user:
            raise exceptions.PermissionDenied("Only the trainer can delete events for this team.")
        instance.delete()

class UserRegistrationView(APIView):
    """
    API endpoint for user registration.
    """
    permission_classes = [AllowAny] # Allow anyone to register

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "User registered successfully.",
                "user_id": user.id,
                "username": user.username,
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """
    API endpoint for user login and token generation.
    """
    permission_classes = [AllowAny] # Allow anyone to log in

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful.",
                "user_id": user.id,
                "username": user.username,
                "token": token.key
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    """
    API endpoint for user logout (deletes the current user's token).
    """
    permission_classes = [IsAuthenticated] # Only authenticated users can log out

    def post(self, request):
        # Delete the user's current authentication token
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        logout(request) # Log out from session if using SessionAuthentication
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
