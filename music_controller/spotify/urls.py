from django.urls import path, include #include allows you to access other url routes, so you can attach more routes to this one
from .views import *

urlpatterns = [
   path('get-auth-url',AuthURL.as_view()),
   path('redirect',spotify_callback),
   path('is-authenticated', IsAuthenticated.as_view()),
   path('current-song',CurrentSong.as_view()),
   path('pause-song',PauseCurrentSong.as_view()),
   path('resume-song',ResumeCurrentSong.as_view()),
   path('skip-song', SkipSong.as_view()),
]