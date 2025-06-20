from django.db import models
from django.contrib.auth.models import AbstractUser # Or use your custom User model
from django.conf import settings # To reference AUTH_USER_MODEL

class User(AbstractUser):
    # You can add custom fields here if needed, e.g., 'date_of_birth', 'phone_number', etc.
    pass

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Or models.CASCADE if you want teams to be deleted when trainer is deleted
        related_name='teams_as_trainer',
        null=True,
        help_text="The user who created and manages this team (trainer)."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class TeamMembership(models.Model):
    class Role(models.TextChoices):
        TRAINER = 'trainer', 'Trainer'
        ATHLETE = 'athlete', 'Athlete'
        MEMBER = 'member', 'Member'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_memberships')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=Role.choices)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'team') # A user can only have one role per team

    def __str__(self):
        return f"{self.user.username} - {self.team.name} ({self.get_role_display()})"

class Post(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title[:30]}..."

class Event(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='events')
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events_created')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True) # Optional end time
    location = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title