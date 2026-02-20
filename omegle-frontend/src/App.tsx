import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Room from './components/Room'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/room" element={<Room name="Default Name" localAudioTrack={null} localVideoTrack={null} />}/>
      </Routes>

      </BrowserRouter>
  ) 
}

export default App                  
