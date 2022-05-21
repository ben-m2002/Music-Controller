import React from 'react'
import { useState } from 'react'
import {Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel} from "@material-ui/core"
import {Link, useNavigate} from "react-router-dom"


CreateRoomPage.defaultProps = {
    votesToSkip: 2,
    guestCanPause : true,
    update: false,
    roomCode : null,
    updateCallback : () => {}
}

export default function CreateRoomPage(props){
    
    var minVotes = 2
    const [guestCanPause,setGuestCanPause] = useState(props.guestCanPause)
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip)

    let navigate = useNavigate()
    const title = props.update ? "Update Room" : "Create a Room"

    return (
       <Grid container spacing = {1}>
           <Grid item xs = {12} align = "center">
                <Typography component = "h4" variant = "h4">
                    {title}
                </Typography>
           </Grid>
           <Grid item xs = {12} align = "center">
                <FormControl component = "fieldset">
                    <FormHelperText component = "span">
                        <div align = "center">
                            Guest Control of Playback State    
                        </div>
                        
                    </FormHelperText>
                    <RadioGroup row defaultValue = "true" onChange = {
                        (e) => {
                            setGuestCanPause(e.target.Value)
                        }
                    } >
                        <FormControlLabel
                         value = "true" 
                         control = {<Radio color = "primary"/>}
                         label = "Play/Pause"
                         labelPlacement = "bottom"
                         />
                         <FormControlLabel
                         value = "false" 
                         control = {<Radio color = "secondary"/>}
                         label = "No Control"
                         labelPlacement = "bottom"
                         />
                    </RadioGroup>
                </FormControl>
           </Grid>
           <Grid item xs = {12} align = "center">
                <FormControl>
                    <TextField 
                    required = {true} 
                    type = "number"
                    onChange = {(e) => setVotesToSkip(e.target.value)} 
                    defaultValue = {props.votesToSkip}
                    inputProps = {
                        {
                            min:1,
                            style : {textAlign : "center"},
                        }
                    }/>
                    <FormHelperText component = "span">
                        <div align = "center">
                            Votes Required To Skip Song    
                        </div>
                    </FormHelperText>
                </FormControl>
           </Grid>
           <Grid item xs = {12} align = "center">
               <Button 
               color = "primary" 
               variant = "contained"
               onClick = {() => {
                  const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        votes_to_skip: votesToSkip,
                        guest_can_pause: guestCanPause,
                    }),
                    }
                    return fetch("/api/create-room", requestOptions)
                    .then((response) => response.json())
                    .then((data) => navigate("/room/" + data.code));
               }}
               >
                   Create A Room
               </Button>
           </Grid>
           <Grid item xs = {12} align = "center">
               <Button color = "secondary" variant = "contained" to = "/" component = {Link}>
                   Back
               </Button>
           </Grid>
       </Grid>
    );
}

