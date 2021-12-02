

function join() {
    if(document.getElementById("name").value!=""){
        sessionStorage.setItem("name", document.getElementById("name").value);
        window.location.href = "/game/" + (Math.floor(1000 + Math.random() * 9000));

    } 
}

window.onload = () => {
    document.getElementById('join').addEventListener('click', ()=> join() )
}
