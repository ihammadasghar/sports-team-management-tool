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
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trainer, Athlete, Member

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password')
        read_only_fields = ('id',)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class TrainerRegistrationSerializer(serializers.Serializer):
    user = UserSerializer()
    specialization = serializers.CharField(max_length=100, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        Trainer.objects.create(user_ptr_id=user.id, **validated_data)
        return user

class AthleteRegistrationSerializer(serializers.Serializer):
    user = UserSerializer()
    birth_date = serializers.DateField()
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    height = serializers.IntegerField()
    team_id = serializers.IntegerField(write_only=True) # Expect team ID for association

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        team_id = validated_data.pop('team_id')
        user = User.objects.create_user(**user_data)
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            raise serializers.ValidationError({"team_id": "Invalid team ID."})
        Athlete.objects.create(user_ptr_id=user.id, team=team, **validated_data)
        return user

class MemberRegistrationSerializer(serializers.Serializer):
    user = UserSerializer()
    join_date = serializers.DateField(required=False, allow_null=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        Member.objects.create(user_ptr_id=user.id, **validated_data)
        return user

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
    trainer = TrainerSerializer(read_only=True) 
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

        
    
    
