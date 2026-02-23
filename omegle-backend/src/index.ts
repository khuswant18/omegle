import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import { Server } from "socket.io";
import express from "express"
import http from "http"


const app = express()
const PORT = process.env.PORT || 3000
const server = http.createServer(app) 
import { UserManager } from "./managers/UserManager.js";


const io = new Server(server,{
    cors:{ 
        origin:"*" 
    } 
});

// app.use("/api/turn",(req,res)=>{
//   res.json({
//     urls: "turn:free.expressturn.com:3478",
//     username: process.env.TURN_USERNAME,
//     credential: process.env.TURN_PASSWORD 
//   })
// })

const userManager = new UserManager() 
io.on('connection', (socket:Socket) => {
  console.log('a user connected');
  socket.on("join",({name})=>{
    userManager.addUser(name, socket); 
  })
  
  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  }) 
});

app.get('/',(req,res)=>{
  res.send("Server is healthy")
})

server.listen(PORT, () => {
  console.log("server running at PORT",PORT);
});
  
 