import React from 'react'
import { useState } from 'react'
import {Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel} from "@material-ui/core"
import {Link, useNavigate} from "react-router-dom"
import {Collapse} from "@material-ui/core"

CreateRoomPage.defaultProps = {
    votesToSkip: 2,
    guestCanPause : true,
    update: false,
    roomCode : null,
    updateCallback : () => {}
}

function renderCreateButtons(votesToSkip,guestCanPause){
    let navigate = useNavigate()
    return ( // gotta use a container if returning more than one grid item
        <Grid container spacing = {2}> 
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
    )
}

function renderUpdateButton(votesToSkip,guestCanPause,roomCode,setSuccessMessage,setErrorMessage,callback){
    return (
    <Grid item xs = {12} align = "center">
        <Button 
            color = "primary" 
            variant = "contained"
            onClick = {() => {
            const requestOptions = {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    votes_to_skip: votesToSkip,
                    guest_can_pause: guestCanPause,
                    code : roomCode
                }),
                }
                return fetch("/api/update-room", requestOptions)
                .then((response) => {
                    if (response.ok){
                        setSuccessMessage("Room Updated Successfully")
                    }else{
                        setErrorMessage("Error updating room..." + response.statusText.toString())
                    }
                    callback()
                });
            }}
            >
               Update Room
        </Button>
    </Grid>
    );
}

export default function CreateRoomPage(props){
    
    var minVotes = 2
    const [guestCanPause,setGuestCanPause] = useState(props.guestCanPause)
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip)
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")


    const title = props.update ? "Update Room" : "Create a Room"

    return (
       <Grid container spacing = {1}>
           <Grid item xs = {12} align = "center">
                <Collapse in = {errorMessage != "" || successMessage != ""}>
                   {
                      errorMessage
                   }
                   {
                        successMessage
                   }
                </Collapse>
           </Grid>
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
                    <RadioGroup row defaultValue = {props.guestCanPause.toString()} onChange = {
                        (e) => {
                            setGuestCanPause(e.target.value)
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
           {props.update ? renderUpdateButton(votesToSkip,guestCanPause,props.roomCode,setSuccessMessage,setErrorMessage,
            props.updateCallback) : renderCreateButtons(props.votesToSkip,props.guestCanPause)}
       </Grid>
    );
}

