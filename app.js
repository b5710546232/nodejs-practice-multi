const express = require('express')
const app = express()
const serv = require('http').Server(app)

app.get('/',(req,res)=>{ res.sendFile(__dirname+'/client/index.html')
})
app.use('/client',express.static(__dirname+'/client'))

serv.listen(2000)
console.log('Server started');

const SOCKET_LIST = []
const io = require('socket.io')(serv,{})
io.sockets.on('connection',(socket)=>{
  socket.id = Math.random()
  socket.x = 0
  socket.y = 0
  SOCKET_LIST[socket.id] = socket
  console.log('socket connection')

  socket.on('happy',(data)=>{
    console.log('happy'+data.reason)

  })
  socket.emit('serverMsg',{
    msg:'hello',
  })
})

setInterval(()=>{
  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.x++
    socket.y++
    socket.emit('newPostion',{
      x:socket.x,
      y:socket.y
    })
  }
},1000/25)
