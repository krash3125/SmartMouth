const socket = io();

socket.on('message', (data) => {
    console.log(data)
})

socket.on('connect', ()=>{
    socket.emit('userJoined', sessionStorage.getItem("name"))
})

const showCode = (code) => {
    document.getElementById("codeDisplay").innerHTML = code
}

socket.on('updatePlayerList', (playerList, code) => {
    showCode(code)
    let playerTable = document.getElementById('playerTable')
    playerTable.innerHTML = ""
    //console.log(playerList)
    playerList.forEach(player => {
        if(player[1][2]==code){
            let tr = document.createElement('tr')
            tr.className = "playerTable"
            let td1 = document.createElement('td')
            let td2 = document.createElement('td')
            // console.log(player[1][0])
            // console.log(player[1][1])
            td1.innerHTML = player[1][0]
            td2.innerHTML = player[1][1]
            tr.appendChild(td1)
            tr.appendChild(td2)
            playerTable.appendChild(tr)
            //console.log(tr)
        }
    });
})


socket.on('letterChange', (data) => {
    //console.log(data)
    document.getElementById("firstLetter").innerHTML = data[0]
    document.getElementById("secondLetter").innerHTML = data[1]
})

socket.on('updateStartBtn', ()=>{
    document.getElementById('start').disabled = !document.getElementById('start').disabled
})

function genLetters() {
    socket.emit('genLetters')
}

function startGame() {
    socket.emit('startGame')
    //document.getElementById('start').disabled = true
}

function submitGuess(word){
    //word = word//.replace(/^[A-Za-z]+$/, "") //get better regex thing
    word = word.toLowerCase()
    if(word.length>2){
        if(word.charAt(0)==document.getElementById("firstLetter").innerHTML){
            if(word.charAt(word.length-1)==document.getElementById("secondLetter").innerHTML){
                socket.emit('submitGuess', word)
            }
        }
    }
}


window.onload = () => {
    document.getElementById("generate").addEventListener('click', () => genLetters())
    document.getElementById("leave").addEventListener('click', () => window.location.href = "/home")
    document.getElementById("start").addEventListener('click', () => startGame())


    let guessBox = document.getElementById('guessBox')

    guessBox .addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        submitGuess(guessBox.value)
        guessBox.value = ""
        }
    });

}