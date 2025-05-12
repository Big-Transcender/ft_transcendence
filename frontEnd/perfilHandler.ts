const API_URL = "http://127.0.0.1:3000/users";

let users = [];

fetch(API_URL)
	.then((res) => res.json())
	.then((data) => {
		users = data;
		data.forEach((user) => {
			console.log(user.email);
		});

		updateWins();
		updateLoses();
		updatePlays();
		updateNick();
	});

function updateWins() {
	document.getElementById("winNumberId").innerText = getWins();
}

function updateLoses() {
	document.getElementById("loseNumberId").innerText = getLoses();
}

function updatePlays() {
	document.getElementById("playNumberId").innerText = getPlays();
}

function updateNick() {
	document.getElementById("profileNickId").innerText = getNick();
}

function getNick() {
	if (users[0] === undefined) return "DEAD";
	return users[0].nickname;
}

function getWins() {
	if (users[0] === undefined) return "DEAD";
	return users[0].id;
}

function getLoses() {
	if (users[0] === undefined) return "DEAD";
	return users[0].loses;
}

function getPlays() {
	if (users[0] === undefined) return "DEAD";
	return users[0].plays;
}
