import React, {Component} from 'react'
import { useState } from 'react'
import {Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel} from "@material-ui/core"
import {Link, useParams, useNavigate} from "react-router-dom"


export default function RoomJoinPage(props){
   
    const [error,setError] = useState(false)
    const [errorText,setErrorText] = useState("")
    const[roomCode,setRoomCode] = useState("")

    let navigate = useNavigate()

    return (
        <Grid container spacing = {1}>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h4" component = "h4">
                    Join A Room
                </Typography>
            </Grid>
            <Grid item xs = {12} align = 'center'>
                <TextField 
                label = "Room Code"
                error = {error}
                variant = "outlined"
                placeholder = "Enter A Room Code"
                value = {roomCode}
                helperText = {errorText}
                onChange = {(e) => setRoomCode(e.target.value)}
                >
                </TextField>
            </Grid>
            <Grid item xs = {12} align = 'center'>
                <Button variant = "contained" color = "primary"
                onClick = {
                    () => {
                        const requestOptions = {
                            method : "POST",
                            headers : {"Content-Type" : "application/json"},
                            body : JSON.stringify({
                                "code" : roomCode
                            })
                        }
                        return(
                            fetch("/api/join-room", requestOptions).then((response) => {
                                if (!response.ok) {
                                    return setError(true), setErrorText(response.statusText)
                                }
                                return navigate("/room/" + roomCode)
                            })
                        )
                    }
                }
                >
                    Enter A Room
                </Button>
            </Grid>
            <Grid item xs = {12} align = 'center'>
                <Button variant = "contained" color = "secondary" to = "/" component = {Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}
