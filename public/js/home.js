
function newGame() {
    window.location.href = "/game/" + (Math.floor(1000 + Math.random() * 9000));
}

function joinGame() {
    //needs to check if room exists
    let code = $("#codeInput").val()
    if(code.length==4){
        window.location.href = "/game/" + code
    } 
}


window.onload = () => {
    $('#newGame').click(()=> newGame())
    $('#joinGame').click(()=> joinGame())
}
