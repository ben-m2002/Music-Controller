from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request,post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room

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
        if not request.session.exists(request.session.session_key):
            request.session.create()
        is_authenticated = is_spotify_authenticated(request.session.session_key)
        return Response({'status': is_authenticated},status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request,format = None):
        # always check and make a session key just in cause
        if not request.session.exists(request.session.session_key):
            request.session.create()
        room_code = self.request.session.get("room_code")
        roomQuery = Room.objects.filter(code=room_code)
        if roomQuery.exists():
            room = roomQuery[0]
            host = room.host
            endpoint = "player/currently-playing"
            response = execute_spotify_api_request(host, endpoint)

            if 'error' in response or 'item' not in response:
                return Response({}, status = status.HTTP_204_NO_CONTENT)
            
            item = response.get('item')
            duration = item.get('duration')
            progress = response.get("progress_ms")
            song_cover = item.get("album").get('images')[0].get("url")
            song_name = item.get('name')
            song_id = item.get('id')
            artist_string = ""

            for i, artist in enumerate(item.get('artists')):
                if i > 0:
                    artist_string += ", "
                name = artist.get("name")
                artist_string += name

            print(artist_string)

            song = {
                'title' : song_name,
                'artist' : artist_string,
                'duration' : duration,
                'time' : progress,
                'image_url': song_cover,
                'is_playing' : item.get("is_playing"),
                'votes' : 0,
                'id' : song_id,
            }    

            return Response(song, status = status.HTTP_200_OK)
        return Response({"message":"Not in a room"}, status = status.HTTP_404_NOT_FOUND)

