from django.urls import path, include #include allows you to access other url routes, so you can attach more routes to this one
from .views import index
app_name = "frontend"

urlpatterns = [
    path('', index, name = ''), #the redirect function uses the name not the url path
    path('join',index),
    path('create',index),
    path('room/<str:roomCode>', index)
]