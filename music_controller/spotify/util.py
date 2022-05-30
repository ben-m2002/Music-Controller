import base64
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_token(session_id):
    user_tokens = SpotifyToken.objects.filter(user = session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token,refresh_token2 = None):
    tokens = get_user_token(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    if tokens:
        if refresh_token2 != None: #fix the refresh token bug, sometimes we dont get a new refresh token
            refresh_token = refresh_token2
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields = ['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user = session_id, access_token = access_token, refresh_token = refresh_token, token_type = token_type, expires_in = expires_in)
        tokens.save()

def is_spotify_authenticated(session_id):
    tokens = get_user_token(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
          refresh_spotify_token(session_id) 
        return True
    return False        

def refresh_spotify_token(session_id):
    refresh_token = get_user_token(session_id).refresh_token
    code_formula = "{}:{}".format(CLIENT_ID,CLIENT_SECRET)
    encoded_bytes  = code_formula.encode("ascii")
    encoded = base64.b64encode(encoded_bytes)
    encodedString = encoded.decode('ascii')
    print(encodedString)
    headers = {'Content-Type': 'application/x-www-form-urlencoded', 
    'Authorization': 'Basic '+ encodedString}
    response = post(
        url = 'https://accounts.spotify.com/api/token', 
        headers = headers,
        data = {
            'grant_type' : 'refresh_token',
            'refresh_token' : refresh_token,
            'client_id' : CLIENT_ID,
            'client_secret' : CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token2 = response.get('refresh_token')

    update_or_create_user_tokens(
        session_id, 
        access_token,
        token_type,
        expires_in,
        refresh_token,
        refresh_token2,
    )

def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_token(session_id)
    if tokens == None:
        return {'Error' : 'No Tokens'}
    header = {'Content-Type' : 'application/json', 'Authorization' : "Bearer " + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers = header)
    if put_:
        put(BASE_URL + endpoint, headers = header)
    
    response = get(BASE_URL + endpoint, {}, headers = header)

    try:
        return response.json()
    except:
        return {'Error':'Issue with request'}