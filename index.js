
const path = require('path')
const http = require('http')
const express = require('express')
const router = express.Router()
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

let serverCode

app.use(express.static(path.join(__dirname)));

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

 
//page routing
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'home.html'))
})

router.get('/game/:code', (req, res) => {
  if (req.params) {
    serverCode = (req.params.code)
  }
  res.sendFile(path.join(__dirname, 'docs', 'index.html'))
})

router.get('*', (req, res) => {
  //change path to /
  res.sendFile(path.join(__dirname, 'docs', 'home.html'))
})

console.log(serverCode)

//userclass
class User {
  constructor(socketId, name, points, roomCode) {
    this.socketId = socketId;
    this.name = name;
    this.points = points;
    this.roomCode = roomCode;
  }

  addPoints(p) {
    this.points += p
  }

}

//clients
const socketIdMap = new Map(); //a map of online usernames and their clients
const serverRooms = new Map(); //a map of room codes
const checkWord = require('check-word')
const dictionary = checkWord('en')
let gameStarted = false
const alphabet = "abcdefghijklmnopqrstuvwxyz"


io.on('connection', (socket) => {
  const userInit = (name) => { 
    const newUser = new User(socket.id, name, 0, serverCode)
    if (serverRooms.has(serverCode)) { // rand room code if no code exists
      serverRooms.get(serverCode).push( newUser )
    }
    else {
      serverRooms.set(serverCode, [ newUser ] )
    }
    socketIdMap.set(socket.id, newUser)

    console.log(serverRooms.get(serverCode)[0].name)
    socket.join(serverCode)
    console.log(serverRooms)
    console.log(socketIdMap)

    io.to(serverCode).emit('updatePlayerList', serverRooms.get(serverCode))
  }
  
  const newLetters = () => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
    let letters = [alphabet[Math.floor(Math.random() * alphabet.length)], alphabet[Math.floor(Math.random() * alphabet.length)]]
    io.to(serverCode).emit('letterChange', letters)
  }

  socket.on('userJoined', (name) => {
    userInit(name)

    socket.on('disconnect', () => {
      serverRooms.set(serverCode, serverRooms.get(serverCode).filter(user => user.socketId != socket.id))
      socketIdMap.delete(socket.id)
      console.log(serverRooms)
      console.log(socketIdMap)
      //close room if 0 players in game
      io.to(serverCode).emit('updatePlayerList', serverRooms.get(serverCode))
    })
  })

  socket.on('startGame', () => {
    io.to(serverCode).emit('startGameClients')
    setTimeout( () => newLetters() , 1000);
  })

  socket.on('submitGuess', (word) => {
    if (dictionary.check(word)) {
      socketIdMap.get(socket.id).addPoints(100)
      io.to(serverCode).emit('updatePlayerList', serverRooms.get(serverCode))
      io.to(serverCode).emit('clearInput')
      newLetters()
    }
  })

})

const PORT = process.env.PORT || 3000;

app.use('/', router)

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})
