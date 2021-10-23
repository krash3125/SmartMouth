const socket = io();

socket.on('message', (data) => {
    console.log(data)
})

socket.on('connect', ()=>{
    socket.emit('userJoined', localStorage.getItem("name"))
    
})

socket.on('addUserToList', (data)=>{
    let user = document.createElement('h4')
    user.id = data
    user.value = data
    user.innerHTML = data
    document.getElementById('playerList').appendChild(user)
})

socket.on('removeUserFromList', (data)=>{
    document.getElementById(data).remove();
})

socket.on('letterChange', (data) => {
    console.log(data)
    document.getElementById("firstLetter").innerHTML = data[0]
    document.getElementById("secondLetter").innerHTML = data[1]
})

function genLetters() {
    socket.emit('genLetters')
}

window.onload = () => {
    document.getElementById("generate").addEventListener('click', () => genLetters())
    document.getElementById("leave").addEventListener('click', () => window.location.href = "/home")
}