from django.contrib.auth.models import User
from django.db import models

class Trainer(User):
    specialization = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='trainers/', null=True, blank=True)

    def __str__(self):
        return f"Trainer: {self.username}"


class Member(User):
    join_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='members/', null=True, blank=True)

    def __str__(self):
        return f"Member: {self.username}"

class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    logo = models.ImageField(upload_to='teams/', null=True, blank=True)
    members = models.ManyToManyField(Member, through='Membership')
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE)

    def __str__(self):
        return f"Team: {self.name}"

class Athlete(User):
    birth_date = models.DateField()
    profile_picture = models.ImageField(upload_to='athletes/', null=True, blank=True)
    height = models.IntegerField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    def __str__(self):
        return f"Athlete: {self.username}"

class Membership(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    group = models.ForeignKey(Team, on_delete=models.CASCADE)
    date_joined = models.DateField()

class Publication(models.Model):
    title = models.CharField(max_length=150)
    text = models.CharField(max_length=500)
    author = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    date_published = models.DateField()

    def __str__(self):
        return self.title

class MemberComment(models.Model):
    text = models.CharField(max_length=500)
    author = models.ForeignKey(Member, on_delete=models.CASCADE)
    date_published = models.DateField()
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)

class AthleteComment(models.Model):
    text = models.CharField(max_length=500)
    author = models.ForeignKey(Athlete, on_delete=models.CASCADE)
    date_published = models.DateField()
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)

class TrainerComment(models.Model):
    text = models.CharField(max_length=500)
    author = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    date_published = models.DateField()
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)

class Event(models.Model):
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=500)
    created_by = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    datetime = models.DateTimeField()

    def __str__(self):
        return self.title

class Training(Event):
    attendance = models.ManyToManyField(Athlete, through='TrainingAttendance')

    def __str__(self):
        return self.title

class TrainingAttendance(models.Model):
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE)
    training = models.ForeignKey(Training, on_delete=models.CASCADE)

class Game(Event):
    opponent = models.CharField(max_length=100)
    attendance = models.ManyToManyField(Member, through='GameAttendance')
    participants = models.ManyToManyField(Athlete, through='GameParticipation')

    def __str__(self):
        return self.title

class GameAttendance(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

class GameParticipation(models.Model):
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)