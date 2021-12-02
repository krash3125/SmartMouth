const path = require('path')
const http = require('http')
const express = require('express')
const router = express.Router();
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

let serverCode

app.use(express.static(path.join(__dirname)));

router.get('/game/:code', (req, res) => {
  if(req.params){
    serverCode = (req.params.code)
  }
  res.sendFile(path.join(__dirname, 'docs', 'index.html'))
})

console.log(serverCode)

router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'home.html'))
})

const userSocketIdMap = new Map(); //a map of online usernames and their clients
const serverRooms = new Map(); //a map of room codes
const checkWord = require('check-word')
const words = checkWord('en')
let gameStarted = false

io.on('connection', (socket) => {
  socket.on('userJoined', (name)=>{
    if(serverCode == null) {
      serverCode = Math.floor(1000 + Math.random() * 9000);
    }
    userSocketIdMap.set(socket.id, [name, 0, serverCode]);
    //console.log(userSocketIdMap)
    if(serverCode!=null){
      if(serverRooms.has(serverCode)){
        serverRooms.get(serverCode).push(socket.id)
      }
      else{
        serverRooms.set(serverCode, [socket.id])
      }
    }
    console.log(userSocketIdMap.get(socket.id)[2])
    console.log(serverCode)
    socket.join(serverCode)
    //console.log(Array.from(serveyrRooms))

    // console.log(userSocketIdMap.values())
    io.to(serverCode).emit('updatePlayerList', (Array.from(userSocketIdMap)), serverCode)

    // console.log(userSocketIdMap.keys())
    // console.log(userSocketIdMap.values())

    socket.on('disconnect', () => {
      userSocketIdMap.delete(socket.id)
      io.to(serverCode).emit('updatePlayerList', (Array.from(userSocketIdMap)), serverCode)
     // console.log(userSocketIdMap)
    })
    })

  socket.on('startGame', ()=>{
    //console.log(userSocketIdMap.get(socket.id)[2])
    gameStarted = true
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    let letters = [alphabet[Math.floor(Math.random() * alphabet.length)], alphabet[Math.floor(Math.random() * alphabet.length)]]
    io.to(userSocketIdMap.get(socket.id)[2]).emit('letterChange', letters)
    io.to(userSocketIdMap.get(socket.id)[2]).emit('updateStartBtn')
  })

  socket.on('submitGuess', (word) => {
    if(gameStarted && words.check(word)){
      userSocketIdMap.get(socket.id)[1] += 100
      io.to(userSocketIdMap.get(socket.id)[2]).emit('updatePlayerList', (Array.from(userSocketIdMap)))
      gameStarted = false
      io.to(userSocketIdMap.get(socket.id)[2]).emit('updateStartBtn')
      console.log(userSocketIdMap)
      //console.log(true)
    }
  })
  
  socket.on('genLetters', () => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    let letters = [alphabet[Math.floor(Math.random() * alphabet.length)], alphabet[Math.floor(Math.random() * alphabet.length)]]
    console.log(serverCode)
    io.to(userSocketIdMap.get(socket.id)[2]).emit('letterChange', letters)
  })
})

const PORT = process.env.PORT || 3000;

app.use('/', router)

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})
