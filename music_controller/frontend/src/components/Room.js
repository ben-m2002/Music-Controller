import React, {Component} from 'react'
import { useState} from 'react'
import CreateRoomPage from './CreateRoomPage'
import {Button, Grid, Typography, ButtonGroup, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel} from "@material-ui/core"
import {Link, useParams, useNavigate} from "react-router-dom"


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
                updateCallback = {()=>{}}
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

export default function Room (props){
    const [votesToSkip,setVotesToSkip] = useState(2)
    const [guestCanPause,setGuestCanPause] = useState(false)
    const [isHost, setIsHost] = useState(false)
    const [showSettings,setShowSettings] = useState(false)

    let roomCode = useParams().roomCode;
    let navigate = useNavigate();

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
    })

    if (showSettings){
        return showSettingsPage(votesToSkip,guestCanPause,roomCode,setShowSettings)
    }

    return (
        <Grid container spacing = {1}>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h3" component = "h3">
                    Room Code is : {roomCode}
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h6" component = "h6">
                    Votes to skip is : {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h6" component = "h6">
                    guest Can Pause is : {guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h6" component = "h6">
                    Host : {isHost.toString()}
                </Typography>
            </Grid>
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
            {isHost ? showButton(setShowSettings) : null}
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