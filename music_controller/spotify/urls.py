from django.urls import path, include #include allows you to access other url routes, so you can attach more routes to this one
from .views import AuthURL

urlpatterns = [
   path('get-auth-url',AuthURL.as_view())
]