console.log("teste");
var page = document.getElementById('home');
var API_URL = 'http://localhost:3001/usuarios';
var users = [];
function navigate(page) {
    if (document.getElementById(page).classList.contains('active'))
        return;
    document.querySelectorAll('.page').forEach(function (p) { return p.classList.remove('active'); });
    document.getElementById(page).classList.add('active');
    history.pushState(null, '', "#".concat(page));
    getWins();
    updateLoses();
    updatePlays();
    updateWins();
}
window.addEventListener('popstate', function () {
    var page = location.hash.replace('#', '') || 'home';
    navigate(page);
});
window.addEventListener('load', function () {
    var page = location.hash.replace('#', '') || 'home';
    navigate(page);
});
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
    // console.log(users[0].nome);
    return users[0].wins;
}
function getLoses() {
    return users[0].loses;
}
function getPlays() {
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
