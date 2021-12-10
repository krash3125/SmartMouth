const socket = io();


$(document).ready(function(){
    
    $('#joinGame').click(()=>joinGame())
    $('#startGame').click(()=> socket.emit('startGame') )

    $('#guessBox').keypress( function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            submitGuess($('#guessBox').val());  
        }
    } );
})

const joinGame = () => {
    sessionStorage.setItem('name', $("#name").val())
    socket.emit('userJoined', $("#name").val())
    
    $('#nameSet').hide()
    $('#preGame').show()

    $('#gameUrl').html(window.location.href)
}

socket.on('startGameClients', () => {
    $('#preGame').hide()
    $('#game').show()    
})



socket.on('updatePlayerList', (playerList) => {
    $('#playerList').html("")
    $('#playerGameDisplay').html("")
    playerList.forEach(player => {
        $('#playerList').append("<p>"+ player.name +"</p>")
        $('#playerGameDisplay').append("<p>"+ player.name +" | " + player.points +"</p>")
    });
})


socket.on('letterChange', (data) => {
    $("#firstLetter").html(data[0])
    $("#secondLetter").html(data[1])
})

socket.on('clearInput', ()=>$('#guessBox').val(''))


function submitGuess(word){
    //word = word//.replace(/^[A-Za-z]+$/, "") //get better regex thing
    word = word.toLowerCase()
    if(word.length>2){
        if(word.charAt(0)==$("#firstLetter").html()){
            if(word.charAt(word.length-1)==$("#secondLetter").html()){
                socket.emit('submitGuess', word)
            }
        }
    }
    $('#guessBox').val('')
}
