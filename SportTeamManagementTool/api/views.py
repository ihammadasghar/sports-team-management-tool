from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from .models import (
    Athlete,
    Trainer,
    Member,
    Team,
    Membership,
    Publication,
    MemberComment,
    AthleteComment,
    TrainerComment,
    Event,
    Training,
    TrainingAttendance,
    Game,
    GameAttendance,
    GameParticipation,
)
from .serializers import (
    AthleteSerializer,
    TrainerSerializer,
    MemberSerializer,
    TeamSerializer,
    MembershipSerializer,
    PublicationSerializer,
    MemberCommentSerializer,
    AthleteCommentSerializer,
    TrainerCommentSerializer,
    EventSerializer,
    TrainingSerializer,
    TrainingAttendanceSerializer,
    GameSerializer,
    GameAttendanceSerializer,
    GameParticipationSerializer,
)

def get_user_type(user):
    """
    Determine the type of user (Athlete, Trainer, or Member).
    Returns None if the user doesn't belong to any of these.
    """
    if hasattr(user, 'athlete'):
        return 'athlete'
    elif hasattr(user, 'trainer'):
        return 'trainer'
    elif hasattr(user, 'member'):
        return 'member'
    return None

class TeamList(generics.ListCreateAPIView):
    """
    List all teams (public) and allow creating a new team (protected for Trainers).
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [AllowAny] # Anyone can list.

    def create(self, request, *args, **kwargs):
        """Only trainers can create teams"""
        if not hasattr(request.user, 'trainer'):
            return Response({"detail": "Only trainers can create teams."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


class TeamDetail(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a team.
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [AllowAny] # Anyone can view.  Update should be protected.

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        # Only the trainer of the team can update it.
        if request.user != team.trainer.user_ptr:
            return Response({"detail": "Only the trainer of this team can update it."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)



class TeamPublicationList(generics.ListAPIView):
    """
    List publications for a specific team.
    """
    serializer_class = PublicationSerializer
    permission_classes = [AllowAny]  # Public
    def get_queryset(self):
        team_id = self.kwargs['pk']
        return Publication.objects.filter(team_id=team_id)

class TeamAthleteList(generics.ListAPIView):
    """
    List athletes for a specific team.
    """
    serializer_class = AthleteSerializer
    permission_classes = [AllowAny]  # Public
    def get_queryset(self):
        team_id = self.kwargs['pk']
        return Athlete.objects.filter(team__id=team_id)

class TeamAthleteCreateView(generics.CreateAPIView):
    """
    Add an athlete to a team.  Only a trainer of the team can do this.
    """
    serializer_class = AthleteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team_id = self.kwargs['pk']
        team = Team.objects.get(pk=team_id)
        if not hasattr(self.request.user, 'trainer') or self.request.user != team.trainer.user_ptr:
            raise Exception("Only trainers of this team can add athletes.")
        serializer.save(team=team)

class TeamMemberList(generics.ListAPIView):
    """
    List members for a specific team.
    """
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]  # Public
    def get_queryset(self):
        team_id = self.kwargs['pk']
        team = Team.objects.get(pk=team_id)
        return [membership.member for membership in team.membership_set.all()]

class TeamTrainingList(generics.ListAPIView):
    """
    List trainings for a specific team.
    """
    serializer_class = TrainingSerializer
    permission_classes = [AllowAny]  # Public
    def get_queryset(self):
        team_id = self.kwargs['pk']
        return Training.objects.filter(team__id=team_id)

class TeamTrainingCreateView(generics.CreateAPIView):
    """
     Create a training session for a team. Only trainers of that team.
    """
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team_id = self.kwargs['pk']
        team = Team.objects.get(pk=team_id)
        if not hasattr(self.request.user, 'trainer') or self.request.user != team.trainer.user_ptr:
            raise Exception("Only trainers of this team can create trainings.")
        serializer.save(team=team)

class TeamGameList(generics.ListAPIView):
    """
    List games for a specific team.
    """
    serializer_class = GameSerializer
    permission_classes = [AllowAny]  # Public

    def get_queryset(self):
        team_id = self.kwargs['pk']
        return Game.objects.filter(team__id=team_id)

class TeamGameCreateView(generics.CreateAPIView):
    """
    Create a game for a team. Only trainers of that team.
    """
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team_id = self.kwargs['pk']
        team = Team.objects.get(pk=team_id)
        if not hasattr(self.request.user, 'trainer') or self.request.user != team.trainer.user_ptr:
            raise Exception("Only trainers of this team can create games.")
        serializer.save(team=team)

# ===============================
# Trainers
# ===============================

class TrainerList(generics.ListCreateAPIView):
    """
    List all trainers (public) and allow creating a new trainer (protected -  admin only).
    """
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [AllowAny] #  Anyone can list, but creation is restricted

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"detail": "Only admin users can create trainers."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class TrainerDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a trainer.
    """
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [IsAuthenticated] # Only authenticated users can access.  Further restriction may be needed

    def update(self, request, *args, **kwargs):
        trainer = self.get_object()
        if request.user != trainer.user_ptr and not request.user.is_staff:
            return Response({"detail": "You do not have permission to update this trainer."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        trainer = self.get_object()
        if request.user != trainer.user_ptr and not request.user.is_staff:
            return Response({"detail": "You do not have permission to delete this trainer."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

# ===============================
# Publications
# ===============================

class PublicationList(generics.ListCreateAPIView):
    """
    List all publications (public), create (trainers in team).
    """
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'trainer'):
            return Response({"detail": "Only trainers can create publications."}, status=status.HTTP_403_FORBIDDEN)

        # Ensure the trainer is part of the team.
        team_id = request.data.get('team')  # Assuming the request includes the team ID
        if not Team.objects.filter(id=team_id, trainer=request.user.trainer).exists():
            return Response({"detail": "Trainer must belong to the team to create a publication."}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)


class PublicationDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a publication.
    """
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [AllowAny] #  Anyone can view.  Update/delete restricted

    def update(self, request, *args, **kwargs):
        publication = self.get_object()
        if request.user != publication.author.user_ptr:
             return Response({"detail": "Only the author can update this publication."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        publication = self.get_object()
        if request.user != publication.author.user_ptr:
            return Response({"detail": "Only the author can delete this publication."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class PublicationCommentList(generics.ListAPIView):
    """
    List comments for a specific publication (public).
    """
    def get_queryset(self):
        publication_id = self.kwargs['pk']
        publication = get_object_or_404(Publication, pk=publication_id)
        member_comments = MemberComment.objects.filter(publication=publication)
        athlete_comments = AthleteComment.objects.filter(publication=publication)
        trainer_comments = TrainerComment.objects.filter(publication=publication)
        return sorted(list(member_comments) + list(athlete_comments) + list(trainer_comments), key=lambda x: x.date_published)

    def get_serializer_class(self):
        if self.queryset:
            first_comment = self.queryset[0]
            if isinstance(first_comment, MemberComment):
                return MemberCommentSerializer
            elif isinstance(first_comment, AthleteComment):
                return AthleteCommentSerializer
            elif isinstance(first_comment, TrainerComment):
                return TrainerCommentSerializer
        return MemberCommentSerializer
    permission_classes = [AllowAny]

class CommentCreate(APIView):
    """
    Create a comment on a publication.  Authenticated user.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        publication_id = request.data.get('publication_id')
        text = request.data.get('text')
        date_published = request.data.get('date_published')
        publication = get_object_or_404(Publication, pk=publication_id)
        user_type = get_user_type(request.user)

        if user_type == 'member':
            comment = MemberComment.objects.create(text=text, author=request.user.member, publication=publication, date_published=date_published)
            serializer = MemberCommentSerializer(comment)
        elif user_type == 'athlete':
            comment = AthleteComment.objects.create(text=text, author=request.user.athlete, publication=publication, date_published=date_published)
            serializer = AthleteCommentSerializer(comment)
        elif user_type == 'trainer':
            comment = TrainerComment.objects.create(text=text, author=request.user.trainer, publication=publication, date_published=date_published)
            serializer = TrainerCommentSerializer(comment)
        else:
            return Response({'error': 'Invalid user type to comment'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

# ===============================
# Events, Training, Games
# ===============================
class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Event.  Only trainers of the team can create, update, delete.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]  #  Authenticated.  Further restriction in methods.

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'trainer') or not Team.objects.filter(id=request.data['team'], trainer=request.user.trainer).exists():
            return Response({"detail": "Only trainers of the team can create events."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if request.user != event.created_by.user_ptr:
            return Response({"detail": "Only the creator can update this event."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()
        if request.user != event.created_by.user_ptr:
            return Response({"detail": "Only the creator can delete this event."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class TrainingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Training.
    """
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated] #  Authenticated.

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'trainer') or not Team.objects.filter(id=request.data['team'], trainer=request.user.trainer).exists():
            return Response({"detail": "Only trainers of the team can create trainings."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        training = self.get_object()
        if request.user != training.created_by.user_ptr:
            return Response({"detail": "Only the creator can update this training."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        training = self.get_object()
        if request.user != training.created_by.user_ptr:
             return Response({"detail": "Only the creator can delete this training."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
class TrainingAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingAttendance.  Only trainers can create and delete.
    """
    queryset = TrainingAttendance.objects.all()
    serializer_class = TrainingAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        training_id = request.data['training']
        training = Training.objects.get(pk=training_id)
        if request.user != training.created_by.user_ptr:
            return Response({"detail": "Only the trainer can add attendance."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        attendance = self.get_object()
        if request.user != attendance.training.created_by.user_ptr:
            return Response({"detail": "Only the trainer can delete attendance."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Game.
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'trainer') or not Team.objects.filter(id=request.data['team'], trainer=request.user.trainer).exists():
            return Response({"detail": "Only trainers of the team can create games."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        game = self.get_object()
        if request.user != game.created_by.user_ptr:
            return Response({"detail": "Only the creator can update this game."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        game = self.get_object()
        if request.user != game.created_by.user_ptr:
            return Response({"detail": "Only the creator can delete this game."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class GameAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GameAttendance. Only trainers can create and delete.
    """
    queryset = GameAttendance.objects.all()
    serializer_class = GameAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        game_id = request.data['game']
        game = Game.objects.get(pk=game_id)
        if request.user != game.created_by.user_ptr:
            return Response({"detail": "Only the trainer can add attendance."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        attendance = self.get_object()
        if request.user != attendance.game.created_by.user_ptr:
            return Response({"detail": "Only the trainer can delete attendance."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class GameParticipationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GameParticipation. Only trainers can create and delete.
    """
    queryset = GameParticipation.objects.all()
    serializer_class = GameParticipationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        game_id = request.data['game']
        game = Game.objects.get(pk=game_id)
        if request.user != game.created_by.user_ptr:
            return Response({"detail": "Only the trainer can add participants."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        participation = self.get_object()
        if request.user != participation.game.created_by.user_ptr:
            return Response({"detail": "Only the trainer can delete participants."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
class UserMeView(APIView):
    """
    Endpoint para obter os dados do utilizador autenticado e o tipo (role).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = get_user_type(user)  
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role  # Ex: 'trainer', 'athlete', 'member', ou None
        })
