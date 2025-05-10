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
var buttons = document.querySelectorAll('.buttonHitBox');
var div = document.querySelector('.buttonBG');
var mouseIn = false;
var buttonSoundIn = new Audio('audios/in.wav');
var buttonSoundOut = new Audio('audios/out.wav');
var musicMenuIn = new Audio('audios/musicMenuIn.wav');
var musicMenuOut = new Audio('audios/musicMenuOut.wav');
var musicMenu = document.querySelector('.musicPlayerHitBox');
var musicIn = false;
// bgMusic.play()
buttons.forEach(function (button) {
    button.addEventListener('mouseenter', function () {
        if (!mouseIn) {
            buttonSoundIn.play();
            mouseIn = true;
            // console.log("teste1");
        }
    });
    button.addEventListener('mouseleave', function () {
        if (mouseIn) {
            buttonSoundOut.play();
            // console.log("teste2");
            mouseIn = false;
        }
    });
});
musicMenu.addEventListener('mouseenter', function () {
    if (!musicIn) {
        musicMenuIn.play();
        musicIn = true;
    }
});
musicMenu.addEventListener('mouseleave', function () {
    if (musicIn) {
        musicMenuOut.play();
        musicIn = false;
    }
});
console.log(today.getHours());
// console.log(bgMusic.title);
// botao.addEventListener('mouseenter', () => {
// 	jaPassou = true;
// });
// botao.addEventListener('mouseleave', () => {
// 	if (jaPassou) {
// 		div.classList.add('animar');
// 		console.log("entrou");
// 		// Se quiser remover depois de um tempo:
// 		// setTimeout(() => {
// 		//   div.classList.remove('animar');
// 		// }, 1000);
// 	}
// });
