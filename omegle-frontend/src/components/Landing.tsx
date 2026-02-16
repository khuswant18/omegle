import { Link } from 'react-router-dom'
import React, { useState,useEffect } from 'react'

const Landing = () => {
    const [name,setName] = useState('')
    const [joined,setJoined] = useState(false) 

  return (
    <div>
        <input type="text" onChange={(e)=>{setName(e.target.value)}}/>
        <Link to={`/room/?name=${name}`} onClick={()=>{}}>Join</Link>
    </div> 
  )
}

export default Landing
