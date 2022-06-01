import React, {Component, useEffect} from 'react'
import { useState} from 'react'
import CreateRoomPage from './CreateRoomPage'
import {Button, Grid, Typography, ButtonGroup, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel, Box} from "@material-ui/core"
import {Link, useParams, useNavigate} from "react-router-dom"
import MediaPlayer from "./MediaPlayer"

function showButton(setShowSettings) {
    return (
    <Grid item xs = {12} align = "center">    
        <Button color = "secondary" variant = "contained" onClick = {() => setShowSettings(true)}>
            Settings
        </Button> 
     </Grid>)
}

function showSettingsPage(votesToSkip, guestCanPause,roomCode,setShowSettings){
    return (
        <Grid container spacing = {2}>
            <Grid item xs = {12} align = "center">
                <CreateRoomPage 
                update = {true} 
                votesToSkip = {votesToSkip} 
                guestCanPause = {guestCanPause}
                roomCode = {roomCode} 
                updateCallback = {()=> getRoomDetails}
                />
            </Grid>
            <Grid item xs = {12} align = "center">
                <Button variant = "contained"
                color = "secondary"
                onClick = {() => {setShowSettings(false)}}
                >
                Close
                </Button>
            </Grid>
        </Grid>
    )
}

function authenticateSpotify(setisAuthenticated,setSong)
{
    fetch('/spotify/is-authenticated').
    then((response) => response.json()). then((data) => {
        setisAuthenticated(data.status)
        //authenticate them if they are not already authenticated
        if (!data.status){
            fetch('/spotify/get-auth-url').then((response) => response.json())
            .then((data) => {
                window.location.replace(data.url)
            })
        }
    })
}


function getCurrentSong(setSong){
    fetch('/spotify/current-song').then((response)=>{
        if (!response.ok){
            return {}
        }else{
            return response.json()
        }
    }).then((data)=>{
        setSong(data)
    })
}

function getRoomDetails(props,roomCode,setVotesToSkip,setGuestCanPause,setIsHost,setisAuthenticated,setSong){
    fetch('/api/get-room' + '?code=' + roomCode).then((response) => {
        if (!response.ok){
            props.leaveRoomCallBack()
            return navigate("/")
        }
        return response.json()
    })
    .then((data) => {
        setVotesToSkip(data.votes_to_skip)
        setGuestCanPause(data.guest_can_pause)
        setIsHost(data.is_host)
        if (data.is_host == true){
            authenticateSpotify(setisAuthenticated,setSong)
        }
    })
}

export default function Room (props){
    const [votesToSkip,setVotesToSkip] = useState(2)
    const [guestCanPause,setGuestCanPause] = useState(false)
    const [isHost, setIsHost] = useState(false)
    const [showSettings,setShowSettings] = useState(false)
    const [isAuthenticated,setisAuthenticated] = useState(false)
    const [startSongRequest,setStartSongRequest] = useState(true) // this is used to fix the looping error
    const [song,setSong] = useState({})
    let roomCode = useParams().roomCode;
    let navigate = useNavigate();

    useEffect(() => { // didComponentMounthook, fires when component is rendered on the screen
        let interval = setInterval( () => {
            getCurrentSong(setSong)
        }, 1000);

        return () => clearInterval(interval) // this only runs when the component is about to unmount
    },[])

    getRoomDetails(props,roomCode,setVotesToSkip,setGuestCanPause,setIsHost,setisAuthenticated,setSong)

    if (showSettings){
        return showSettingsPage(votesToSkip,guestCanPause,roomCode,setShowSettings)
    } 


    return (
        <Grid container spacing = {1}>
            <Grid item xs = {12} align = "center" >
                <Typography variant = "h3" component = "h3">
                    Room Code is : {roomCode}
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <MediaPlayer song = {song}/>
            </Grid>
            {isHost ? showButton(setShowSettings) : null}
            <Grid item xs = {12} align = "center">
                <Button color = "primary" variant = "contained" onClick = {() => {
                    const requestOptions = {
                        method : "POST",
                        headers : {"Content-Type" : "application/json"},
                    }
                    return fetch('/api/leave-room', requestOptions).then((response) => {
                        props.leaveRoomCallBack()
                        return navigate("/")
                    })
                }}>
                    Leave
                </Button>
            </Grid>
        </Grid>

        /*
        <div>
            <h1>
                Room Code is : {roomCode}
            </h1>
            <p>
                Votes to skip is : {votesToSkip}
            </p>
            <p>
                guest Can Pause is : {guestCanPause.toString()}
            </p>
            <p>
                Host : {isHost.toString()}
            </p>
        </div> */
    )

}