import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';

const LobbyScreen = ()=>{
    const navigate = useNavigate()
    const [email,setEmail] = useState("");
    const [room,setRoom] = useState("");
    const socket = useSocket(); 
    
    
    const handleSubmitForm =useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join',{email,room})
    },[email,room,socket])

    const handleJoinRoom = useCallback((data)=>{
        const {email,room} = data;
        navigate(`room/${room}`)

    },[])

    useEffect(()=>{
        socket.on('room:join',handleJoinRoom)
    return()=>{
        socket.off('room:join',handleJoinRoom)
    }
    },[socket])

    return(
        <div>
            <h1 style={{color:"black"}}>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email Id</label>
                <input onChange={(e)=>setEmail(e.target.value)} type='email' id='email'/>
                <br />
                <label htmlFor="number">Room no.</label>
                <input onChange={(e)=>setRoom(e.target.value)} type='number' id='number'/>
                <br />
                <button>Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;