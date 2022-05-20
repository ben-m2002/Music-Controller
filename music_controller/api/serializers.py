from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer): # more like a get
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')

class CreateRoomSerializer(serializers.ModelSerializer): #using this to post/create so only need 2 fields
     class Meta:
         model = Room
         fields = ('guest_can_pause', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
     code = serializers.CharField(validators=[])
     class Meta:
         model = Room
         fields = ('guest_can_pause', 'votes_to_skip','code')