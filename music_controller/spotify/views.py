from django.shortcuts import render, redirect
import requests
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request,post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote

class AuthURL (APIView):
    def get(self, request, format =  None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
        url = Request("GET", 'https://accounts.spotify.com/authorize', params = {
            'scope' : scopes
            ,'response_type' : 'code'
            ,'redirect_uri' : REDIRECT_URI
            ,'client_id' : CLIENT_ID 
        }).prepare().url

        return Response({'url' : url}, status = status.HTTP_200_OK)


def spotify_callback(request, format = None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if (error == "access_denied"):
        headers = {"Content-Type": "application/json"}
        # just go back to the frontend page because we didnt get access]
        response = post('http://127.0.0.1:8000/api/leave-room',
        headers = headers,
        ).json()
        print(response.get('message'))
        return redirect("frontend:")
    
    
    response = post("https://accounts.spotify.com/api/token", data = {
        'grant_type' : 'authorization_code',
        'code' : code,
        'redirect_uri' : REDIRECT_URI,
        'client_id' : CLIENT_ID,
        'client_secret' :  CLIENT_SECRET
    }).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    # always check and make a session key just in cause
    if not request.session.exists(request.session.session_key):
        request.session.create()
    
    update_or_create_user_tokens(
        request.session.session_key,
        access_token,
        token_type, 
        expires_in,
        refresh_token
    )

    return redirect("frontend:") #this will take us to a different app, it will start us at the home page unless with a put a differnt view after the ':'

def RemoveAllSpotifyTokens ():
    SpotifyToken

class IsAuthenticated(APIView):
    def get(self,request,format =  None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        is_authenticated = is_spotify_authenticated(request.session.session_key)
        return Response({'status': is_authenticated},status.HTTP_200_OK)

def UserInRoom(session):
    roomCode = session.get('room_code')
    print(roomCode)
    roomQuery = Room.objects.filter(code = roomCode)
    if roomQuery.exists():
        return True, roomQuery[0]
    return False

class CurrentSong(APIView):
    def get(self, request,format = None):
        # always check and make a session key just in cause
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get("room_code")
        roomQuery = Room.objects.filter(code=room_code)
        if roomQuery.exists():
            room = roomQuery[0]
            host = room.host
            endpoint = "player/currently-playing"
            response = execute_spotify_api_request(host, endpoint)
            
            if 'error' in response or 'item' not in response:
                return Response({"message" : "No current song"}, status = status.HTTP_400_BAD_REQUEST)

            item = response.get('item')
            duration = item.get('duration_ms')
            progress = response.get("progress_ms")
            song_cover = item.get("album").get('images')[0].get("url")
            song_name = item.get('name')
            song_id = item.get('id')
            artist_string = ""
            is_playing = response.get("is_playing")

            for i, artist in enumerate(item.get('artists')):
                if i > 0:
                    artist_string += ", "
                name = artist.get("name")
                artist_string += name

            votes = len(Vote.objects.filter(room = room, song_id = room.current_song))

            song = {
                'title' : song_name,
                'artist' : artist_string,
                'duration' : duration,
                'time' : progress,
                'image_url': song_cover,
                'is_playing' : is_playing,
                'votes' : votes,
                'votes_required' : room.votes_to_skip,
                'id' : song_id,
            }

            self.update_room_song(room,song_id)

            return Response(song, status = status.HTTP_200_OK)
        return Response({"message":"Not in a room"}, status = status.HTTP_404_NOT_FOUND)

    def update_room_song(self, room, song_id):
        current_song = room.current_song
        if current_song != song_id:
           room.current_song = song_id
           room.save(update_fields=["current_song"])
           votes = Vote.objects.filter(room = room).delete()

class PauseCurrentSong(APIView):
    def put (self,request,format =  None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        endpoint = "player/pause"
        value, room = UserInRoom(self.request.session)
        if value:
            host = room.host
            guest_can_pause = room.guest_can_pause
            if not guest_can_pause: 
                if request.session.session_key != host: # check to see if user is the host
                    return Response({"message":"Not the host"}, status = status.HTTP_401_UNAUTHORIZED)
            response = execute_spotify_api_request(host, endpoint, put_=True)

            if ('error' in response):
                Response({'message' : 'Not in a room'}, status = status.HTTP_404_NOT_FOUND)

            return Response({'message' : 'Valid'},status = status.HTTP_200_OK)
        return Response({'message' : 'Not in a room'}, status = status.HTTP_400_BAD_REQUEST)

class ResumeCurrentSong(APIView):
    def put (self,request,format =  None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        endpoint = "player/play"
        value, room = UserInRoom(self.request.session)
        if value:
            host = room.host
            guest_can_pause = room.guest_can_pause
            if not guest_can_pause: 
                if request.session.session_key != host: # check to see if user is the host
                 return Response({"message":"Not the host"}, status = status.HTTP_401_UNAUTHORIZED) 
            tokens = get_user_token(host)
            if tokens == None:
                return {'Error' : 'No Tokens'}
            header = {'Content-Type' : 'application/json', 'Authorization' : "Bearer " + tokens.access_token}
            response = requests.put("https://api.spotify.com/v1/me/" + endpoint,headers = header)

            if ('error' in response):
                Response({'message' : 'Not in a room'}, status = status.HTTP_404_NOT_FOUND)

            return Response({'message' : 'Valid'},status = status.HTTP_200_OK)
        return Response({"message":"Not in a room"}, status = status.HTTP_404_NOT_FOUND)

class SkipSong(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get("room_code")
        roomQuery = Room.objects.filter(code = room_code)
        if roomQuery.exists():
            room = roomQuery[0]
            votes = Vote.objects.filter(room = room, song_id = room.current_song)
            votes_needed = room.votes_to_skip
            #check to see if this user has already voted for this song
            userVotes = Vote.objects.filter(room = room, song_id = room.current_song, user = self.request.session.session_key)
            if userVotes.exists():
                return Response({'message' : 'Already voted'}, status = status.HTTP_406_NOT_ACCEPTABLE)
            if self.request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
                votes.delete()
                spotify_api_skipsong(room.host)
            else:
               vote = Vote(user = self.request.session.session_key, room = room, song_id = room.current_song)
               vote.save()
        return Response({}, status = status.HTTP_204_NO_CONTENT)
