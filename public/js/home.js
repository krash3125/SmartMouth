

function join() {
    localStorage.setItem("name", document.getElementById("name").value);
    window.location.href = "/"
}

window.onload = () => {
    document.getElementById('join').addEventListener('click', ()=> join() )
}
