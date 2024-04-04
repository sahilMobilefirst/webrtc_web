import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";


const RoomPage = ()=>{
    const [remoteSocketId,setRemoteSocketId] = useState(null);
    const [stream,setStream] = useState();
    const [remoteStream,setRemoteStream] = useState();
    const socket = useSocket();

    const handleUserJoined= useCallback(({email,id})=>{
        console.log(`Email ${email} joined the room`);
        setRemoteSocketId(id)
    },[])

    const handleCallUser = useCallback(async(e)=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio:false,video:true});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId,offer})
        setStream(stream)
    },[remoteSocketId,socket])

    const handleIncomingCall = useCallback(async({from,offer})=>{
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({audio:false,video:true});
        setStream(stream)
        console.log(`Incoming call`,from,offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted",{to:from,ans})

    },[socket])

    const sendStreams = useCallback(()=>{
        for(const track of stream.getTracks()){
            peer.peer.addTrack(track,stream)
        }
    },[stream])

    const handleCallAccepted = useCallback(async({from,ans})=>{
        console.log("handleaccepted offer",ans);
        await peer.setLocalDescription(ans);
        console.log("call accepted!");
        sendStreams();
    },[sendStreams])

    const handleNegotiationNeeded = useCallback(async()=>{
        const offer = await peer.getOffer()
         socket.emit("peer:nego:needed",{offer,to:remoteSocketId}) 
    },[remoteSocketId,socket])

    const handleNegoNeedIncoming = useCallback(async({from,offer})=>{
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done',{to:from,ans})
    },[socket])

    const handleNegotiationFinal = useCallback(async({ans})=>{
       await peer.setLocalDescription(ans)
    },[])

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegotiationNeeded)
        return ()=>{
            peer.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded)
        }
    },[handleNegotiationNeeded])

    useEffect(()=>{
        peer.peer.addEventListener('track',async (e)=>{
            console.log("Got tracks",e.streams);
            setRemoteStream(e.streams[0]);
            console.log(remoteStream);
        })
    },[])

    useEffect(()=>{
        socket.on('user:joined',handleUserJoined);
        socket.on("incoming:call",handleIncomingCall)
        socket.on("call:accepted",handleCallAccepted);
        socket.on("peer:nego:needed",handleNegoNeedIncoming)
        socket.on("peer:nego:final",handleNegotiationFinal)
    return()=>{
        socket.off('user:joined',handleUserJoined);
        socket.off('incoming:call',handleIncomingCall);
        socket.off("call:accepted",handleCallAccepted);
        socket.off("peer:nego:needed",handleNegoNeedIncoming)
        socket.off("peer:nego:final",handleNegotiationFinal);
    }   
    },[socket,handleUserJoined,handleIncomingCall,handleCallAccepted,handleIncomingCall,handleNegotiationFinal])
    return (
        <div>
            <h1>Room Page</h1>
            <h3>{remoteSocketId ? "connected":"No one is in Room"}</h3>
            {stream && <button
            onClick={sendStreams}
            >Send Stream</button>}
            {remoteSocketId && 
            <button onClick={handleCallUser}>Call</button>
            }
            
            {stream && 
            <>
            <h1>Mystream</h1>
            <ReactPlayer
            playing
            height="200px" width="300px" url={stream}/>
            </>
            }

            {remoteStream && 
            <>
            <h1>Remote stream</h1>
            <ReactPlayer
            playing
            height="200px" width="300px" url={remoteStream}/>
            </>
            }
        </div>
    )
}

export default RoomPage;