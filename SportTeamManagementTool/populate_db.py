import os
import django
from datetime import date, datetime
from django.utils import timezone
import random
from faker import Faker

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SportTeamManagementTool.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
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

fake = Faker()

def create_users(num_users=10):
    """Create a mix of regular users, athletes, trainers, and members."""
    users = []
    for i in range(num_users):
        username = fake.user_name()
        while User.objects.filter(username=username).exists():
            username = fake.user_name()
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        password = 'password'
        user = User.objects.create_user(username=username, email=email, first_name=first_name, last_name=last_name,
                                       password=password)
        users.append(user)
    return users


def create_trainers(num_trainers=10):
    trainers = []
    for i in range(num_trainers):
        username = fake.user_name()
        while User.objects.filter(username=username).exists():
            username = fake.user_name()
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        password = 'password'
        specialization = fake.job()
        trainer = Trainer.objects.create(username=username, email=email, first_name=first_name, last_name=last_name,
                                       password=password, specialization=specialization)
        trainers.append(trainer)
    return trainers

def create_members(num_members=10):
    members = []
    for i in range(num_members):
        username = fake.user_name()
        while User.objects.filter(username=username).exists():
            username = fake.user_name()
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        password = 'password'
        join_date = fake.date_between(start_date='-5y', end_date='today')
        member = Member.objects.create(username=username, email=email, first_name=first_name, last_name=last_name,
                                       password=password, join_date=join_date)
        members.append(member)
    return members



def create_teams(trainers):
    teams = []
    for i in range(len(trainers)):
        name = fake.company()
        description = fake.text(max_nb_chars=200)
        trainer = trainers[i]
        team = Team.objects.create(name=name, description=description, trainer=trainer)
        teams.append(team)
    return teams



def create_athletes(num_athletes, teams):
    athletes = []
    for i in range(num_athletes):
        username = fake.user_name()
        while User.objects.filter(username=username).exists():
            username = fake.user_name()
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        password = 'password'
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=35)
        height = random.randint(150, 200)
        team = random.choice(teams)
        athlete = Athlete.objects.create(username=username, email=email, first_name=first_name, last_name=last_name,
                                       password=password, birth_date=birth_date, height=height, team=team)
        athletes.append(athlete)
    return athletes



def add_members_to_teams(teams, members):
    for team in teams:
        num_members = random.randint(1, len(members))
        selected_members = random.sample(members, num_members)
        for member in selected_members:
            join_date = fake.date_between(start_date='-2y', end_date='today')
            Membership.objects.create(member=member, group=team, date_joined=join_date)



def create_publications(teams, num_publications=20):
    """Create publications."""
    publications = []
    for _ in range(num_publications):
        team = random.choice(teams)
        trainer = team.trainer
        title = fake.sentence()
        text = fake.paragraph(nb_sentences=3)
        date_published = fake.date_between(start_date='-1y', end_date='today')
        publication = Publication.objects.create(
            title=title, text=text, author=trainer, team=team, date_published=date_published
        )
        publications.append(publication)
    return publications

def create_comments(publications, members, athletes, trainers, num_comments_per_publication=5):
    for publication in publications:
        for _ in range(num_comments_per_publication):
            commenter_type = random.choice(['member', 'athlete', 'trainer'])
            if commenter_type == 'member':
                if members:
                    author = random.choice(members)
                    comment = MemberComment.objects.create(
                        text=fake.sentence(),
                        author=author,
                        date_published=fake.date_between(start_date=publication.date_published, end_date='today'),
                        publication=publication,
                    )
            elif commenter_type == 'athlete':
                if athletes:
                    author = random.choice(athletes)
                    comment = AthleteComment.objects.create(
                        text=fake.sentence(),
                        author=author,
                        date_published=fake.date_between(start_date=publication.date_published, end_date='today'),
                        publication=publication,
                    )
            elif commenter_type == 'trainer':
                if trainers:
                    author = random.choice(trainers)
                    comment = TrainerComment.objects.create(
                        text=fake.sentence(),
                        author=author,
                        date_published=fake.date_between(start_date=publication.date_published, end_date='today'),
                        publication=publication,
                    )

def create_events(teams, num_events=5):
    events = []
    for _ in range(num_events):
        title = fake.sentence()
        description = fake.paragraph(nb_sentences=2)
        team = random.choice(teams)
        created_by = team.trainer
        datetime = fake.date_time_between(start_date='now', end_date='+1y')
        event = Event.objects.create(
            title=title, description=description, created_by=created_by, team=team, datetime=datetime
        )
        events.append(event)
    return events

def create_training_sessions(num_events, athletes, teams):
    trainings = []
    for i in range(num_events):
        title = fake.sentence()
        description = fake.paragraph(nb_sentences=2)
        team = random.choice(teams)
        created_by = team.trainer
        datetime = fake.date_time_between(start_date='now', end_date='+1y')
        training = Training.objects.create(
            title=title, description=description, created_by=created_by, team=team, datetime=datetime,
        )
        trainings.append(training)
        num_attendees = random.randint(0, len(athletes))
        attendees = random.sample(athletes, num_attendees)
        for athlete in attendees:
            TrainingAttendance.objects.create(athlete=athlete, training=training)
    return trainings

def create_games(num_events, members, athletes, teams):
    games = []
    for i in range(num_events):
        title = fake.sentence()
        description = fake.paragraph(nb_sentences=2)
        team = random.choice(teams)
        created_by = team.trainer
        datetime = fake.date_time_between(start_date='now', end_date='+1y')
        opponent = fake.company()
        game = Game.objects.create(
            title=title, description=description, created_by=created_by, team=team, datetime=datetime,
            opponent=opponent
        )
        games.append(game)
        num_attendees = random.randint(0, len(members))
        attendees = random.sample(members, num_attendees)
        for member in attendees:
            GameAttendance.objects.create(member=member, game=game)
        num_participants = random.randint(0, len(athletes))
        participants = random.sample(athletes, num_participants)
        for athlete in participants:
            GameParticipation.objects.create(athlete=athlete, game=game)
    return games

def populate_database():
    trainers = create_trainers(num_trainers=2)
    teams = create_teams(trainers)
    publications = create_publications(teams)

    athletes = create_athletes(20, teams)

    members = create_members(num_members=30)
    add_members_to_teams(teams, members)

    create_comments(publications, members, athletes, trainers)

    create_training_sessions(8, athletes, teams)
    create_games(8, members, athletes, teams)


if __name__ == '__main__':
    print('Populating database...')
    populate_database()
    print('Database populated!')