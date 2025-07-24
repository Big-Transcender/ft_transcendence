const joinContestButton = document.getElementById("joinContestId");
const createContesButton = document.getElementById("createContestId");
const enterContestButton = document.getElementById("enterContestButtonId");
const genericBackButton = document.querySelectorAll(".genericBackButton");
const createNewContestButton = document.getElementById("createNewContestButtonId");
const startContestButton = document.getElementById("startContestButtonId");

const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
const joinedContestPage = document.getElementById("contestJoinedSelectorId");
const createContestPage = document.getElementById("contestCreateId");

const pinBox = document.querySelector(".contestPinBox");
var pin;

function genericBackFunctionContest() {
	const currentActive = document.querySelector(".contestId.active");
	if (currentActive) {
		currentActive.classList.remove("active");

		if (currentActive.id === "contestJoinSelectorId") {
			contestMainPage.classList.add("active");
		} else if (currentActive.id === "contestJoinedSelectorId") {
			contestMainPage.classList.add("active");
			stopContestPolling();
		} else if (currentActive.id === "contestCreateId") {
			contestMainPage.classList.add("active");
		}
	}
}

let isPlaying = false;

async function displayWarning(text: string) {
	const warningBubble = document.querySelector(".defaultWarning");
	const warningText = document.getElementById("warningContest");
	if (!isPlaying) {
		isPlaying = true;
		warningText.textContent = text;
		warningBubble.classList.add("warning");
		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});
		warningBubble.classList.remove("warning");
		isPlaying = false;
	}
}

async function betterWait(time: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, time);
	});
}

document.addEventListener("DOMContentLoaded", () => {
	//Enter Join Page
	joinContestButton.addEventListener("click", async () => {
		if (!checkIfLogged()) {
			displayWarning("You need to log in.");
		} else {
			await betterWait(100);
			changePageTo(contestMainPage, joinContestPage);
		}
	});

	//Enter create Contest Page
	createContesButton.addEventListener("click", async () => {
		if (!checkIfLogged()) {
			displayWarning("You need to log in.");
		} else {
			await betterWait(100);

			changePageTo(contestMainPage, createContestPage);
		}
	});

	//JOIN THE CONTEST BUTTON
	enterContestButton.addEventListener("click", async () => {
		const inputPin = (document.getElementById("inputPin") as HTMLInputElement).value.trim();
		if (!inputPin.length) {
			displayWarning("Invalid pin.");
		} else if (await checkIsValidPin(inputPin)) {
			await betterWait(100);
			if (await joinTournament(getNickOnLocalStorage(), inputPin)) {
				changePageTo(joinContestPage, joinedContestPage);
				getInfoFromContest(inputPin);
				startContestPolling(inputPin);
			}
		}
	});

	// CREATE NEW CONTEST BUTTON
	createNewContestButton.addEventListener("click", async () => {
		if (!checkIfLogged()) {
			displayWarning("You need to log in.");
		} else {
			await betterWait(100);
			createNewContest();
		}
	});

	// START THE CONTEST
	startContestButton.addEventListener("click", async () => {
		// Hi Diogo-San, this is the button you asked for.
		// The function, "displayWarning", well... display a text in the display to show some errors if you want.
		// It has a 5 seconds cooldown.
		// Arigato gozaimasu.
		const id = pin
		//displayWarning("This start the contest");
		startTournament( id );
	});

	genericBackButton.forEach((button) => {
		button.addEventListener("click", () => {
			genericBackFunctionContest();
		});
	});
});

if (pinBox) {
	pinBox.addEventListener("click", () => {
		const pinNumber = pinBox.querySelector(".contestPinBoxNumber");
		if (pinNumber) {
			const range = document.createRange();
			range.selectNodeContents(pinNumber);
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}
	});
}

let contestPollingInterval: number | null = null;

function startContestPolling(pin: string, intervalMs = 2000) {
	getInfoFromContest(pin);
	if (contestPollingInterval) clearInterval(contestPollingInterval);
	contestPollingInterval = window.setInterval(() => {
		getInfoFromContest(pin);
	}, intervalMs);
}

function stopContestPolling() {
	if (contestPollingInterval) {
		clearInterval(contestPollingInterval);
		contestPollingInterval = null;
	}
}

async function createNewContest() {
	//Create Contest here
	const tournamentName = (document.getElementById("inputContestNameId") as HTMLInputElement).value.trim();
	const nick = getNickOnLocalStorage();

	console.log("tournamentName:", tournamentName);
	console.log("nick:", nick);
	try {
		const response = await fetch(`${backendUrl}/create-tournament`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nick, tournamentName }),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("Erro:", data.error);
			displayWarning(data.error);
			return null;
		} else {
			changePageTo(createContestPage, joinedContestPage);
			// getInfoFromContest(data.code);
			startContestPolling(data.code);
			pin = data.tournamentId
		}

		return data;
	} catch (err) {
		console.error("Erro na requisição:", err);
		return null;
	}
}

async function getInfoFromContest(pin: string) {
	try {
		const response = await fetch(`${backendUrl}/tournament/${pin}`);
		const data = await response.json();
		const playerPlaces = document.querySelectorAll(".playerContestPlace");
		let pinNumber = document.getElementById("contestPinBoxNumberId") as HTMLElement;
		let name = document.getElementById("contestNameId") as HTMLElement;

		console.log("info from matches:", data.players);
		let players = data.players;

		for (let i = 0; i < players.length; i++) {
			const playerName = playerPlaces[i].querySelector(".playerContestPlaceName");
			const playerBG = playerPlaces[i].querySelector(".playerContestPlaceBG");
			playerName.textContent = players[i].nickname;
			// playerPlaces[i].classList.remove("noplayer");
			playerBG.classList.remove("noGame");
		}
		pinNumber.textContent = data.code;
		name.textContent = data.name;
		return true;
	} catch (err) {
		console.error("Failed to check pin:", err);
		return false;
	}
}

async function joinTournament(nick: string, code: string) {
	try {
		const response = await fetch(`${backendUrl}/join-tournament`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ nick, code }),
		});
		const data = await response.json();
		if (response.ok) {
			console.log("Joined tournament:", data);
			pin = data.tournamentId;
			return true;
			// handle success (e.g., update UI)
		} else {
			console.error("Failed to join:", data.error);
			displayWarning(data.error);
			return false;
			// handle error (e.g., show warning)
		}
	} catch (err) {
		console.error("Request error:", err);
	}
}

async function checkIsValidPin(pin: string): Promise<boolean> {
	try {
		const response = await fetch(`${backendUrl}/tournament/${pin}`);
		const data = await response.json();

		if (response.ok) {
			return true;
		} else {
			displayWarning("No contest with this pin");
			return false;
		}
	} catch (err) {
		console.error("Failed to check pin:", err);
		return false;
	}
}

async function startTournament(tournamentId: string)
{
	console.log("aqui vai a response");
	const response = await fetch(`${backendUrl}/constructTournament`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: tournamentId }),

	});

	if (!response.ok) {
		const errorData = await response.json();
		console.error("Error starting tournament:", errorData.error);
		displayWarning(errorData.error);
		return;
	}

	const data = await response.json();
	if (!data || !data.tournament) {
		console.error("Invalid tournament data received");
		displayWarning("Invalid tournament data received");
		return;
	}

	console.log(data);
	const nick = getNickOnLocalStorage();

	console.log(nick);
	console.log(data.tournament.players[0]);

	if (nick === data.tournament.players[0] || nick === data.tournament.players[1]) {
		navigate('game1');
		history.replaceState(undefined, "", `#pong/${data.tournament.matches[0]}`);
		changePageTo(gameSelectorPongPage, pongGamePage);
		startPongWebSocket(data.tournament.matches[0]);
	}
	else if (nick === data.tournament.players[2] || nick === data.tournament.players[3]) {
		history.replaceState(undefined, "", `#pong/${data.tournament.matches[1]}`);
		changePageTo(gameSelectorPongPage, pongGamePage);
		startPongWebSocket(data.tournament.matches[1]);
	}

}