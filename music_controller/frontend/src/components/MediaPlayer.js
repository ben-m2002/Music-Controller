import React, {Component, useEffect} from 'react'
import { useState} from 'react'
import CreateRoomPage from './CreateRoomPage'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import {Grid, Typography} from "@material-ui/core"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause'
import LinearProgress from '@mui/material/LinearProgress';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import {Link, useParams, useNavigate} from "react-router-dom"


MediaPlayer.defaultProps = {
    song : {
        'title' : "None",
        'artist' : "No artist",
        'duration' : 0,
        'time' : 0,
        'image_url': "",
        'is_playing' : false,
        'votes' : 0,
        'id' : "",
    },
}

export default function MediaPlayer(props){

    return (
        
        <Card>
            <Grid container alignItems = "center">
                <Grid item align = "center" xs = {4}>
                    <CardMedia
                    component = "img"
                    height = "200"
                    image = {props.song.image_url}
                    alt={props.song.title}
                />  
                </Grid> 
                <Grid item align = "center" xs = {8}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {props.song.title}
                            </Typography>
                        <Typography variant="subtitle1" color = "textSecondary">
                            {props.song.artist}
                            <div>
                                <IconButton>
                                    <SkipPreviousIcon/>
                                </IconButton>
                                <IconButton onClick = {() => {
                                    if (props.song.is_playing){
                                        const requestOptions = {
                                            method : "PUT",
                                            headers : {"Content-Type":"application/json"},
                                        }
                                        fetch("/spotify/pause-song",requestOptions).then((response)=>{
                                            return response.ok
                                        })
                                    }
                                    else{
                                        const requestOptions = {
                                            method : "PUT",
                                            headers : {"Content-Type":"application/json"}
                                        }
                                        fetch("/spotify/resume-song", requestOptions).then((response)=>{
                                            return response.ok
                                        })
                                    }   
                                }}>
                                    {props.song.is_playing ? <PauseIcon/> : <PlayArrowIcon/> }
                                </IconButton>
                                <IconButton onClick = {
                                    () => {
                                        const requestOptions = {
                                            method : "POST",
                                            headers : {"Content-Type" : "application/json"}
                                        }
                                        fetch("/spotify/skip-song", requestOptions)
                                    }
                                }>
                                    <SkipNextIcon/>
                                </IconButton>
                            </div>
                        </Typography>
                        <Typography variant = 'subtitle2' component = 'div'>
                            {props.song.votes} / {props.song.votes_required} 
                        </Typography>
                        <LinearProgress variant = "determinate" value = {(props.song.time/props.song.duration) * 100}>

                        </LinearProgress>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>



        
        //<Grid item xs = {12} align = "center">
           // <Card sx = {{Width : 545, Hieght : 545 , maxWidth : 545, maxHeight : 545}}>
           //    <CardMedia
            //        component = "img"
            //        height="300"
            //        image = {props.song.image_url}
           //         alt={props.song.title}
            //    />  
            //    
        //    </Card>
      //  </Grid>

     
    );
}