
const newGame = () => {
    window.location.href = "/game/" + genCode(4)
}

const joinGame = () => {
    //needs to check if room exists
    let code = $("#codeInput").val()
    if (code.length == 4) {
        window.location.href = "/game/" + code
    }
}

const genCode = (length) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result;
}

window.onload = () => {
    $('#newGame').click(() => newGame())
    $('#joinGame').click(() => joinGame())
}
