from rest_framework import serializers
from django.contrib.auth.models import User
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')

class AthleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Athlete
        fields = '__all__'

class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    #trainer = TrainerSerializer(read_only=True)  # Display trainer details
    class Meta:
        model = Team
        fields = '__all__'

class PublicationSerializer(serializers.ModelSerializer):
    author = TrainerSerializer(read_only=True) # Display trainer details
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Publication
        fields = '__all__'

class MemberCommentSerializer(serializers.ModelSerializer):
    author = MemberSerializer(read_only=True)

    class Meta:
        model = MemberComment
        fields = '__all__'

class AthleteCommentSerializer(serializers.ModelSerializer):
    author = AthleteSerializer(read_only=True)

    class Meta:
        model = AthleteComment
        fields = '__all__'

class TrainerCommentSerializer(serializers.ModelSerializer):
    author = TrainerSerializer(read_only=True)

    class Meta:
        model = TrainerComment
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    created_by = TrainerSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class TrainingSerializer(EventSerializer):
    attendance = AthleteSerializer(many=True, read_only=True)

    class Meta:
        model = Training
        fields = '__all__'

class TrainingAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingAttendance
        fields = '__all__'

class GameSerializer(EventSerializer):
    attendance = MemberSerializer(many=True, read_only=True)
    participants = AthleteSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = '__all__'

class GameAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttendance
        fields = '__all__'

class GameParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameParticipation
        fields = '__all__'