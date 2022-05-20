import React, {Component} from "react";
import {render} from "react-dom";
import HomePage from "./Homepage"



export default function App (props){

    return (
        <div className = "center"> 
            <HomePage/>
        </div>
    )

}

//const appDiv = document.getElementById("app")
//render(<App/>, appDiv)