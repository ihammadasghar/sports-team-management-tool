from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views


urlpatterns = [
    path('teams/', views.TeamList.as_view()),
    path('teams/<int:pk>/', views.TeamDetail.as_view()),
    path('teams/<int:pk>/publications/', views.TeamPublicationList.as_view()),
    path('teams/<int:pk>/athletes/', views.TeamAthleteList.as_view()),
    path('teams/<int:pk>/athletes/', views.TeamAthleteCreateView.as_view()), # added
    path('teams/<int:pk>/members/', views.TeamMemberList.as_view()),
    path('teams/<int:pk>/trainings/', views.TeamTrainingList.as_view()),
    path('teams/<int:pk>/trainings/', views.TeamTrainingCreateView.as_view()), # Added
    path('teams/<int:pk>/games/', views.TeamGameList.as_view()),
    path('teams/<int:pk>/games/', views.TeamGameCreateView.as_view()), # Added
    path('trainers/', views.TrainerList.as_view()),
    path('trainers/<int:pk>/', views.TrainerDetail.as_view()),
    path('publications/', views.PublicationList.as_view()),
    path('publications/<int:pk>/', views.PublicationDetail.as_view()),
    path('publications/<int:pk>/comments/', views.PublicationCommentList.as_view()),
    path('comments/', views.CommentCreate.as_view()),
    path("me/", views.UserMeView.as_view()),
    path('register/trainer/', views.TrainerRegistrationView.as_view(), name='register-trainer'),
    path('register/athlete/', views.AthleteRegistrationView.as_view(), name='register-athlete'),
    path('register/member/', views.MemberRegistrationView.as_view(), name='register-member'),

]

urlpatterns = format_suffix_patterns(urlpatterns)