const express = require('express')
const app = express()
const serv = require('http').Server(app)

app.get('/',(req,res)=>{ res.sendFile(__dirname+'/client/index.html')
})
app.use('/client',express.static(__dirname+'/client'))

serv.listen(2000)
console.log('Server started');

const SOCKET_LIST = []
const PLAYER_LIST = []

let Player = (id)=>{
  let self = {
    x:250,
    y:250,
    id:id,
    number:""+Math.floor(10*Math.random()),
    pressingRight:false,
    pressingLeft:false,
    pressingUp:false,
    pressingDown:false,
    maxSpd:10,
  }
  self.updatePosition = ()=>{
    if(self.pressingRight){
      self.x += self.maxSpd
    }
    if(self.pressingLeft){
      self.x -= self.maxSpd
    }
    if(self.pressingDown){
      self.y += self.maxSpd
    }
    if(self.pressingUp){
      self.y -= self.maxSpd
    }
  }
  return self
}

const io = require('socket.io')(serv,{})
io.sockets.on('connection',(socket)=>{
  socket.id = Math.random()
  SOCKET_LIST[socket.id] = socket

  let player = Player(socket.id)
  PLAYER_LIST[socket.id] = player


  socket.on('disconnect',()=>{
    delete SOCKET_LIST[socket.id]
    delete PLAYER_LIST[socket.id]
  })

  socket.on('keyPress',(data)=>{
    if(data.inputId ==='left' )//d
      player.pressingLeft = data.state
    if(data.inputId ==='right' )//d
      player.pressingRight = data.state
    if(data.inputId ==='up' )//d
      player.pressingUp = data.state
    if(data.inputId ==='down' )//d
      player.pressingDown = data.state
  })
  console.log('socket connection')

  socket.on('happy',(data)=>{
    console.log('happy'+data.reason)

  })
  socket.emit('serverMsg',{
    msg:'hello',
  })
})

setInterval(()=>{
  let pack = []
  for(let i in PLAYER_LIST){
    let player = PLAYER_LIST[i]
    player.updatePosition()
    pack.push({
      x:player.x,
      y:player.y,
      number:player.number
    })
  }
  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('newPostion',pack)
  }

},1000/25)
