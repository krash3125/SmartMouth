const socket = io();

socket.on('message', (data) => {
    console.log(data)
})

socket.on('connect', ()=>{
    socket.emit('userJoined', localStorage.getItem("name"))
    
})

socket.on('updatePlayerList', (playerList) => {
    let playerTable = document.getElementById('playerTable')
    playerTable.innerHTML = ""
    //console.log(playerList)
    playerList.forEach(player => {
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
    });
})


socket.on('letterChange', (data) => {
    console.log(data)
    document.getElementById("firstLetter").innerHTML = data[0]
    document.getElementById("secondLetter").innerHTML = data[1]
})

function genLetters() {
    socket.emit('genLetters')
}

function submitGuess(word){
    //word = word//.replace(/^[A-Za-z]+$/, "") //get better regex thing
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

    let guessBox = document.getElementById('guessBox')

    guessBox .addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        submitGuess(guessBox.value)
        guessBox.value = ""
        }
    });

}