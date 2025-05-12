const API_URL = 'http://localhost:3000/users';
let users = [];


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
	if (users[0] === undefined)
		return "DEAD";
	return users[0].wins;
}

function getLoses(){
	if (users[0] === undefined)
		return "DEAD";
	return users[0].loses;
}

function getPlays(){
	if (users[0] === undefined)
		return "DEAD";
	return users[0].plays;
}


fetch(API_URL)
	.then(res => res.json())
	.then(data =>{
		users = data;
		data.forEach(user =>{
			 console.log(user.nickname);
		})
	});

