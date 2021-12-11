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

// console.log(serverCode)

//userclass
class User {
  constructor(socketId, name, points, roomCode) {
    this.socketId = socketId;
    this.name = name;
    this.points = points;
    this.roomCode = roomCode;
    this.voteSkip = false;
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
const firstLetters = "wmplctsthpmbsdlngkakenogoerywacdyrbh"
const secondLetters = "ypmgmsewodetrbonpnlkgkawdbsyrhtacclh"


io.on('connection', (socket) => {
  const userInit = (name) => {
    const newUser = new User(socket.id, name, 0, serverCode)
    if (serverRooms.has(serverCode)) { // rand room code if no code exists
      serverRooms.get(serverCode).push(newUser)
    }
    else {
      serverRooms.set(serverCode, [newUser])
    }
    socketIdMap.set(socket.id, newUser)
    socket.join(serverCode)

    io.to(serverCode).emit('updatePlayerList', serverRooms.get(serverCode))
  }

  const newLetters = () => {
    let letters = [firstLetters[Math.floor(Math.random() * firstLetters.length)], secondLetters[Math.floor(Math.random() * secondLetters.length)]]
    io.to(serverCode).emit('letterChange', letters)
  }

  socket.on('userJoined', (name) => {
    userInit(name)
  })

  socket.on('disconnect', () => {
    if (serverRooms.get(serverCode) != null) {

      serverRooms.set(serverCode, serverRooms.get(serverCode).filter(user => user.socketId != socket.id))
      socketIdMap.delete(socket.id)
      // console.log(serverRooms)
      // console.log(socketIdMap)
      //close room if 0 players in game
      if (serverRooms.get(serverCode).length == 0) {
        serverRooms.delete(serverCode)
      }
      io.to(serverCode).emit('updatePlayerList', serverRooms.get(serverCode))
    }
  })

  socket.on('startGame', () => {
    io.to(serverCode).emit('startGameClients')
    setTimeout(() => newLetters(), 1000);
  })

  socket.on('submitGuess', (word) => {
    if (dictionary.check(word)) {
      socketIdMap.get(socket.id).addPoints(100)
      io.to(serverCode).emit('playerCorrectGuess', serverRooms.get(serverCode), word)
      newLetters()
    }
  })

  socket.on('voteSkip', () => {
    socketIdMap.get(socket.id).voteSkip = !socketIdMap.get(socket.id).voteSkip
    let voteSkipCount = 0
    serverRooms.get(serverCode).forEach((user) => {
      if (user.voteSkip == true) {
        voteSkipCount++
      }
    })
    if (voteSkipCount / serverRooms.get(serverCode).length > .6) {
      serverRooms.get(serverCode).forEach((user) => {
        user.voteSkip = false
      })
      io.to(serverCode).emit('lettersSkipped')
      newLetters()
    }
    else {
      io.to(serverCode).emit('updateVoteSkip', voteSkipCount)
    }
  })

})

const PORT = process.env.PORT || 3000;

app.use('/', router)

server.listen(PORT, () => {
  // console.log(`listening at http://localhost:${PORT}`)
})
