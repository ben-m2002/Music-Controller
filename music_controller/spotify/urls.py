from django.urls import path, include #include allows you to access other url routes, so you can attach more routes to this one
from .views import AuthURL, spotify_callback,IsAuthenticated

urlpatterns = [
   path('get-auth-url',AuthURL.as_view()),
   path('redirect',spotify_callback),
   path('is-authenticated', IsAuthenticated.as_view()),
]