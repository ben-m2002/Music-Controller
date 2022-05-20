from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

#Create your views here

class RoomView(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class ListView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class JoinRoom(APIView):
    dataField = "code"
    def post(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()   
        code = request.data.get(self.dataField)
        if code != None:
            rooms = Room.objects.filter(code = code)
            if (rooms.exists()):
                room = rooms[0]
                self.request.session['room_code'] = code
                return Response({"message" : "Room Was Joined!"}, status = status.HTTP_200_OK)
            return Response({"Bad Request" : "Room Does Not Exist"}, status = status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request" : "Invalid Post Data"}, status = status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key

            queryset = Room.objects.filter(host = host)
            if queryset.exists(): #checking if any rooms in database have the same host
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields = ["guest_can_pause","votes_to_skip"]) #if your ever updating a model make sure to save it, and put an arguement for the fields updated
                self.request.session['room_code'] = room.code
                return Response (RoomSerializer(room).data, status = status.HTTP_200_OK)
            else:
                room = Room(host = host, guest_can_pause = guest_can_pause, votes_to_skip = votes_to_skip)
                room.save() #also save when creating a model, no need for update_fields since we created a new model not updated and existing one
                self.request.session['room_code'] = room.code
                return Response (RoomSerializer(room).data, status = status.HTTP_201_CREATED)
        
        else:
            return Response({'Bad Request' : 'Invalid data'},status = status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    serializer_class = RoomSerializer

    def get(self,request,format = None):
        if not self.request.session.exists(self.request.session.session_key):
           self.request.session.create()

        data = {
            'code': self.request.session.get("room_code")
        } 

        return JsonResponse(data, status = status.HTTP_200_OK)

class LeaveRoom(APIView):
    def post(self,request,format = None):
        if 'room_code' in self.request.session:
            code = self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            query = Room.objects.filter(host = host_id)
            if query.exists():
                room = query[0]
                room.delete()
            return Response({'message' : 'Room deleted'}, status = status.HTTP_200_OK)    
        return Response({'message' : 'User left room'}, status = status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self,request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")
            query = Room.objects.filter(code = code)
            if query.exists():
                room = query[0]
                user_id = self.request.session.session_key
                if room.host == user_id:
                    room.guest_can_pause = guest_can_pause
                    room.votes_to_skip = votes_to_skip
                    room.save(update_fields = ["guest_can_pause", "votes_to_skip"])
                    return Response(RoomSerializer(room).data, status = status.HTTP_200_OK)
                return Response({"Bad Request" : "Not Host"}, status = status.HTTP_401_UNAUTHORIZED)
            return Response({"Bad Request" : "Invalid Code"}, status = status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request' : "Invalid Data"}, status = status.HTTP_400_BAD_REQUEST)
                    


