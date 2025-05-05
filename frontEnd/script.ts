console.log("teste");
const page = document.getElementById('home');
const API_URL = 'http://localhost:3001/usuarios'
let users = [];

function navigate(page) {
	if (document.getElementById(page).classList.contains('active'))
		return;
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById(page).classList.add('active');
	history.pushState(null, '', `#${page}`);
	getWins();
	updateLoses();
	updatePlays();
	updateWins();
}

window.addEventListener('popstate', () => {
	const page = location.hash.replace('#', '') || 'home';
	navigate(page);
});

window.addEventListener('load', () => {
	const page = location.hash.replace('#', '') || 'home';
	navigate(page);
});

function updateWins(){
	document.getElementById('winNumberId').innerText = getWins();
}

function updateLoses(){
	document.getElementById('loseNumberId').innerText = getLoses();
}

function updatePlays(){
	document.getElementById('playNumberId').innerText = getPlays();
}

function getWins(){
	// console.log(users[0].nome);
	return users[0].wins;
}

function getLoses(){
	return users[0].loses;
}

function getPlays(){
	return users[0].plays;
}

fetch(API_URL)
	.then(res => res.json())
	.then(data =>{
		users = data;
		data.forEach(user =>{
			// console.log(user.id);
		})
	});

