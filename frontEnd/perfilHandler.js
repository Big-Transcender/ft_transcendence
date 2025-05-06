var API_URL = 'http://localhost:3001/usuarios';
var users = [];
function updateWins() {
    document.getElementById('winNumberId').innerText = getWins();
}
function updateLoses() {
    document.getElementById('loseNumberId').innerText = getLoses();
}
function updatePlays() {
    document.getElementById('playNumberId').innerText = getPlays();
}
function getWins() {
    if (users[0] === undefined)
        return "DEAD";
    return users[0].wins;
}
function getLoses() {
    if (users[0] === undefined)
        return "DEAD";
    return users[0].loses;
}
function getPlays() {
    if (users[0] === undefined)
        return "DEAD";
    return users[0].plays;
}
fetch(API_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
    users = data;
    data.forEach(function (user) {
        // console.log(user.id);
    });
});
