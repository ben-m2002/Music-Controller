import React, {Component, useState, useEffect} from 'react'
import RoomJoinPage from "./RoomJoinPage"
import CreateRoomPage from "./CreateRoomPage"
import Room from "./Room"
import {Button, Grid, Typography, TextField, FormHelperText, FormControl,ButtonGroup} from "@material-ui/core"
import {BrowserRouter as Router, Switch, Route, Link, useNavigate,Navigate,useHistory,Routes} from "react-router-dom"


export function RenderHomePage(props) {

   let navigate = useNavigate() // using navigate like this prevents bugs

    useEffect(() => { // didComponentUpdate hook, everytime the component updates it runs this
       if (props.code != null) {
           navigate(`/room/${props.code}`)
       }
   })


    return (
        <Grid container spacing = {3}>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h3" component = "h3">
                    Welcome to Music Controller!
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <ButtonGroup disableElevation variant = "contained" color = "primary">
                    <Button color = "primary" to = "/join" component = {Link}>
                        Join A Room
                    </Button>
                    <Button color = "secondary" to = "/create" component = {Link}>
                        Create A Room
                    </Button>
                </ButtonGroup>
            </Grid>
        </Grid>
    )
}

export default function Homepage(props){
   
    const [roomCode,setRoomCode] = useState(null)

    useEffect(() => { // This didComponentMount except for functional components
        async function Request(){
            fetch("/api/user-in-room").then((response) => response.json()).then((data) => {
                setRoomCode(data.code)
            })
        }
        Request()
    } , [])

    return (
        <Router>
            <Routes>
                <Route exact path = "/" element = {<RenderHomePage code = {roomCode}/>}/>
                <Route exact path = "/join" element = {<RoomJoinPage/>}/>
                <Route exact path = "/create" element = {<CreateRoomPage/>}/>
                <Route exact path = "/room/:roomCode" element = {<Room leaveRoomCallBack = {() => setRoomCode(null)}/>}/> 
            </Routes>
        </Router>
    );
}
