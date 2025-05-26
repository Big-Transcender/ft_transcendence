let winsNumber = document.getElementById("boxWinsNumber");

// winsNumber.textContent = "0";

async function flipboardNumberAnimation(target: string, flips: number = 80, delay: number = 100) {
	winsNumber.textContent = "";

	console.log("Teste final");
	// Inicializa todos os dígitos como "0"
	const spans: HTMLSpanElement[] = [];
	for (let i = 0; i < target.length; i++) {
		const span = document.createElement("span");
		span.textContent = "0";
		winsNumber.appendChild(span);
		spans.push(span);
	}

	// Array para controlar se o dígito já acertou
	const locked: boolean[] = new Array(target.length).fill(false);

	for (let f = 0; f < flips; f++) {
		let allLocked = true;
		for (let i = 0; i < target.length; i++) {
			if (!locked[i]) {
				const randomDigit = Math.floor(Math.random() * 10).toString();
				spans[i].textContent = randomDigit;
				if (randomDigit === target[i]) {
					locked[i] = true;
				} else {
					allLocked = false;
				}
			}
		}
		if (allLocked) break;
		await new Promise((res) => setTimeout(res, delay));
	}

	// Garante que todos os dígitos finais estão corretos
	for (let i = 0; i < target.length; i++) {
		spans[i].textContent = target[i];
	}
}

flipboardNumberAnimation("23");

// runNumberAnimation("23");

// const API_URL = "http://127.0.0.1:3000/users";

// let users = [];

// fetch(API_URL)
// 	.then((res) => res.json())
// 	.then((data) => {
// 		users = data;
// 		data.forEach((user) => {
// 			console.log(user.email);
// 		});

// 		updateWins();
// 		updateLoses();
// 		updatePlays();
// 		updateNick();
// 	});

// function updateWins() {
// 	document.getElementById("winNumberId").innerText = getWins();
// }

// function updateLoses() {
// 	document.getElementById("loseNumberId").innerText = getLoses();
// }

// function updatePlays() {
// 	document.getElementById("playNumberId").innerText = getPlays();
// }

// function updateNick() {
// 	document.getElementById("profileNickId").innerText = getNick();
// }

// function getNick() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].nickname;
// }

// function getWins() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].id;
// }

// function getLoses() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].loses;
// }

// function getPlays() {
// 	if (users[0] === undefined) return "DEAD";
// 	return users[0].plays;
// }
