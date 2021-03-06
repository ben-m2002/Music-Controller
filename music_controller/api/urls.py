from django.urls import path
from api import urls
from .views import RoomView, ListView, CreateRoomView,GetRoom,JoinRoom,UserInRoom,LeaveRoom,UpdateRoom
app_name = 'api'

urlpatterns = [
    path('room', RoomView.as_view()),
    path('all', ListView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path("get-room",GetRoom.as_view()),
    path("join-room", JoinRoom.as_view()),
    path("user-in-room",UserInRoom.as_view()),
    path("leave-room",LeaveRoom.as_view(), name = "leave-room"),
    path("update-room",UpdateRoom.as_view()),
]
