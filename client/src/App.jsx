import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import LobbyScreen from './screens/Lobby';
import { useSocket } from './context/SocketProvider';
import RoomPage from './screens/RoomPage';

function App() {
  const socket = useSocket()
  return (
    <div >
      <Routes>
        <Route path='/' element={<LobbyScreen/>}/>
        <Route path='/room/:roomId' element={<RoomPage/>}/>
      </Routes>
    </div>
  )
}

export default App;
