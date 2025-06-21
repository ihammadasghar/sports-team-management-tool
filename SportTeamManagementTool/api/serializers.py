from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import User, Team, TeamMembership, Post, Comment, Event

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        try:
            temp_user = User(username=data.get('username'), email=data.get('email'))
            validate_password(data['password'], user=temp_user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        # Check if username or email already exists
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})

        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials. Please try again.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        data['user'] = user
        return data

class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Nested serializer for user details
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = TeamMembership
        fields = ['id', 'user', 'role', 'role_display', 'joined_at']
        read_only_fields = ['joined_at']

class TeamSerializer(serializers.ModelSerializer):
    trainer = UserSerializer(read_only=True)
    memberships = TeamMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'trainer', 'memberships', 'created_at', 'updated_at']
        read_only_fields = ['trainer', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['trainer'] = self.context['request'].user
        team = Team.objects.create(**validated_data)
        TeamMembership.objects.create(team=team, user=self.context['request'].user, role=TeamMembership.Role.TRAINER)
        return team

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at', 'post']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    # FIX: Nested comments for Post detail view
    comments = CommentSerializer(many=True, read_only=True) # This will include full comment objects

    class Meta:
        model = Post
        fields = ['id', 'team', 'author', 'title', 'content', 'created_at', 'updated_at', 'comments_count', 'comments']
        read_only_fields = ['author', 'created_at', 'updated_at', 'team']

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class EventSerializer(serializers.ModelSerializer):
    trainer = UserSerializer(read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'team', 'trainer', 'title', 'description', 'start_time', 'end_time', 'location', 'created_at', 'updated_at']
        read_only_fields = ['trainer', 'created_at', 'updated_at', 'team']

    def create(self, validated_data):
        validated_data['trainer'] = self.context['request'].user
        return super().create(validated_data)
