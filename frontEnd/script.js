console.log("teste");
var page = document.getElementById('home');
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
