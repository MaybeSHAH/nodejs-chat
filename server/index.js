const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
app.use(express.json());
app.use(authRoutes);
const http = require('http').createServer(app);
const socketio = require('socket.io');
const mongoose = require('mongoose');
const { addUser, removeUser, getUser } = require('./helper')
const mongoDB = "mongodb+srv://maybeshah:Pass@1234@cluster0.odvsl.mongodb.net/chat-database?retryWrites=true&w=majority"
const io = socketio(http);
const PORT = process.env.PORT || 5000
const Room = require('./models/Room');
const Message = require('./models/Message');
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology:true }).then(()=> console.log('connected')).catch(err=> console.log(err));


io.on('connection', (socket) => {
  console.log(socket.id);
  Room.find().then(result=> {
    
    socket.emit('output-rooms', result);
  })
  socket.on('create-room', name => {
      //console.log('The room name received is:', name)
      const room = new Room({name});
      room.save().then(result=>{
        io.emit('room-created', result);
      })
  })
  socket.on('join', ({name, room_id, user_id})=> {
    const {error, user} = addUser({
      socket_id: socket.id,
      name,
      room_id,
      user_id
    })
      if(error){
        console.log('join error', error)
      }
      else{
        console.log('join user', user)
      }
  })
  socket.on('sendMessage', (message, room_id, callback)=>{
    const user= getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text:message
    }
      console.log('message', msgToStore)
      const msg = new Message(msgToStore);
      msg.save().then(result=>{
        io.to(room_id).emit('message', result);
        callback()
      })
      

  })
  socket.on('disconnect',() =>{
    const user= removeUser(socket.id);
  })
  
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});