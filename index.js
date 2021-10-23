const path = require('path')
const http = require('http')
const express = require('express')
const router = express.Router();
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'))
})

io.on('connection', (socket) => {
      
  socket.on('userJoined', (data)=>{
    socket.broadcast.emit('message', (data + " has joined the channel"))
    socket.broadcast.emit('addUserToList', (data))
    socket.on('disconnect', () => {
      socket.broadcast.emit('message', (data + " has left the channel"))
      socket.broadcast.emit('removeUserFromList', data)
    })
  })
  
  socket.on('genLetters', () => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    let letters = [alphabet[Math.floor(Math.random() * alphabet.length)], alphabet[Math.floor(Math.random() * alphabet.length)]]
    io.emit('letterChange', letters)
  })
})





const PORT = process.env.PORT || 3000;

app.use('/', router)

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})
