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

const userSocketIdMap = new Map(); //a map of online usernames and their clients
const checkWord = require('check-word')
const words = checkWord('en')
let gameStarted = false

io.on('connection', (socket) => {
  socket.on('userJoined', (name)=>{
    userSocketIdMap.set(socket.id, [name, 0]);
    //console.log(userSocketIdMap)
    
    // console.log(userSocketIdMap.values())
    io.emit('updatePlayerList', (Array.from(userSocketIdMap)))

    // console.log(userSocketIdMap.keys())
    // console.log(userSocketIdMap.values())

    socket.on('disconnect', () => {
      userSocketIdMap.delete(socket.id)
      io.emit('updatePlayerList', (Array.from(userSocketIdMap)))
     // console.log(userSocketIdMap)
    })
    })

  socket.on('startGame', ()=>{
    gameStarted = true
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    let letters = [alphabet[Math.floor(Math.random() * alphabet.length)], alphabet[Math.floor(Math.random() * alphabet.length)]]
    io.emit('letterChange', letters)
    socket.broadcast.emit('updateStartBtn')
  })

  socket.on('submitGuess', (word) => {
    if(gameStarted && words.check(word)){
      userSocketIdMap.get(socket.id)[1] += 100
      io.emit('updatePlayerList', (Array.from(userSocketIdMap)))
      gameStarted = false
      io.emit('updateStartBtn')
      //console.log(true)
    }
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
