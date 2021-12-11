const socket = io();


$(document).ready(function () {

    $('#joinGame').click(() => joinGame())
    $('#startGame').click(() => socket.emit('startGame'))

    $('#guessBox').keypress(function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            submitGuess($('#guessBox').val());
        }
    });

    $('#voteSkip').click(() => {
        socket.emit('voteSkip')
        $("#guessBox").focus();
    })
})

const joinGame = () => {
    sessionStorage.setItem('name', $("#name").val())
    socket.emit('userJoined', $("#name").val())

    $('#nameSet').hide()
    $('#preGame').show()

    $('#gameUrl').html(window.location.href)
}

const updatePlayerList = (playerList) => {
    $('#playerList').html("")
    $('#playerGameDisplay').html("")
    let totalPlayerCount = 0
    playerList.forEach(player => {
        totalPlayerCount++
        $('#playerList').append("<p>" + player.name + "</p>")
        $('#playerGameDisplay').append("<p>" + player.name + " | " + player.points + "</p>")
    });
    $('#totalPlayerCount').html(totalPlayerCount)
}

socket.on('lettersSkipped', () => {
    $('#skipCount').html(0)
    $('#guessBox').val('')
})

socket.on('updateVoteSkip', count => {
    $('#skipCount').html(count)
})

socket.on('playerCorrectGuess', (playerList, word) => {
    console.log(word)
    console.log("word")
    updatePlayerList(playerList)
    $('#guessBox').val('')
    $('#lastWord').html(word)
})


socket.on('startGameClients', () => {
    $('#preGame').hide()
    $('#game').show()
})

socket.on('updatePlayerList', (playerList) => {
    updatePlayerList(playerList)
})

socket.on('letterChange', (data) => {
    $("#firstLetter").html(data[0])
    $("#secondLetter").html(data[1])
})

socket.on('clearInput', () => $('#guessBox').val(''))

function submitGuess(word) {
    //word = word//.replace(/^[A-Za-z]+$/, "") //get better regex thing
    word = word.toLowerCase()
    if (word.length > 2) {
        if (word.charAt(0) == $("#firstLetter").html()) {
            if (word.charAt(word.length - 1) == $("#secondLetter").html()) {
                socket.emit('submitGuess', word)
            }
        }
    }
    $('#guessBox').val('')
}
