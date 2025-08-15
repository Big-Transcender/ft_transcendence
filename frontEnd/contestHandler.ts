const joinContestButton = document.getElementById("joinContestId");
const createContesButton = document.getElementById("createContestId");
const enterContestButton = document.getElementById("enterContestButtonId");
const genericBackButton = document.querySelectorAll(".genericBackButton");
const createNewContestButton = document.getElementById("createNewContestButtonId");
const createNewContestLocalButton = document.getElementById("createNewContestLocalButtonId");
const startContestButton = document.getElementById("startContestButtonId");

const contestMainPage = document.getElementById("contestSelectorId");
const joinContestPage = document.getElementById("contestJoinSelectorId");
const joinedContestPage = document.getElementById("contestJoinedSelectorId");
const createContestPage = document.getElementById("contestCreateId");
const pongContestPage = document.getElementById("pongContestId");

const pinBox = document.querySelector(".contestPinBox");
var pin;
var numberOfPlayers = 0;

var LocalTournaments = new Map();

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

	// CREATE NEW CONTEST LOCAL BUTTON
	createNewContestLocalButton.addEventListener("click", async () => {
		if (!checkIfLogged()) {
			displayWarning("You need to log in.");
		} else {
			await betterWait(100);
			// createNewContest();
			openPopupContestLocal();
			// changePopupTo()
		}
	});

	// START THE CONTEST
	startContestButton.addEventListener("click", async () => {
		const id = pin;
		const players = ["diogosan", "Bde", "cacarval", "bousa"];
		//startLocalTournament(id, players);
		if (numberOfPlayers === 4)
		{
			stopContestPolling();
			startTournament(id);
		}

		else
			displayWarning("Wait for all players!");


	});

	genericBackButton.forEach((button) => {
		button.addEventListener("click", () => {
			genericBackFunctionContest();
		});
	});
});

function openPopupContestLocal() {
	document.getElementById("popupContainer").style.display = "flex";
	document.querySelectorAll(".popupPage").forEach((el) => {
		el.classList.remove("displayPagePopup");
	});

	document.querySelector(".localContestPopup").classList.add("displayPagePopup");
}

function prepareContestLocal() {
	const nicks = [
		(document.getElementById("popupContestNick1") as HTMLInputElement).value.trim(),
		(document.getElementById("popupContestNick2") as HTMLInputElement).value.trim(),
		(document.getElementById("popupContestNick3") as HTMLInputElement).value.trim(),
		(document.getElementById("popupContestNick4") as HTMLInputElement).value.trim(),
	];

	startLocalTournament(pin, nicks);
	closePopup();
}

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
	if (contestPollingInterval)
		clearInterval(contestPollingInterval);

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
	const token = getCookie("token");

	console.log("tournamentName:", tournamentName);
	console.log("nick:", nick);
	try {
		const response = await fetch(`${backendUrl}/create-tournament`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify({ tournamentName }),
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
			pin = data.tournamentId;
		}

		return data;
	} catch (err) {
		console.error("Erro na requisição:", err);
		return null;
	}
}

async function getInfoFromContest(pin: string) {
	try {
		const token = getCookie("token");
		const response = await fetch(`${backendUrl}/tournament/${pin}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include"
		});

		const data = await response.json();
		const playerPlaces = document.querySelectorAll(".playerContestPlace");
		let pinNumber = document.getElementById("contestPinBoxNumberId") as HTMLElement;
		let name = document.getElementById("contestNameId") as HTMLElement;

		console.log("info from matches:", data.players);
		let players = data.players;
		numberOfPlayers = players.length;
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
		const token = getCookie("token");
		const response = await fetch(`${backendUrl}/join-tournament`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify({ code }),
			credentials: "include",
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
		const token = getCookie("token");
		const response = await fetch(`${backendUrl}/tournament/${pin}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include"
		});
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

function resetContestPage() {
	let contestPageAll = document.querySelectorAll(".gameSelector");
	let contestSelectorPage = document.getElementById("contestSelectorId");

	contestPageAll.forEach((el) => el.classList.remove("active"));
	contestSelectorPage.classList.add("active");
}

async function startTournament(tournamentId: string) {
	var data = await getTournamentData(tournamentId);

	if (!data)
		return;

	const nick = getNickOnLocalStorage();

	console.log(nick);
	console.log(data.players[0]);

	if (nick === data.players[0] || nick === data.players[1]) {
		history.replaceState(undefined, "", `#pong/${data.matches[0]}`);
		changePageTo(joinedContestPage, pongContestPage);
		startPongWebSocket(data.matches[0]);
	} else if (nick === data.players[2] || nick === data.players[3]) {
		history.replaceState(undefined, "", `#pong/${data.matches[1]}`);
		changePageTo(joinedContestPage, pongContestPage);
		startPongWebSocket(data.matches[1]);
	}
}

function startLocalTournament(tournamentId: string, players: string[]) {
	var tournament = {
		tournamentId,
		players,
		matches: [generateMatchId(), generateMatchId(), generateMatchId()],
		currentMatchIndex: 0,
		semifinal1: null,
		semifinal2: null,
	};

	LocalTournaments.set(tournament.tournamentId, tournament);
	navigate("game1");
	history.replaceState(undefined, "", `#pong/${tournament.matches[0]}`);
	changePageTo(gameSelectorPongPage, pongGamePage);
	setGameScore(tournament.players[0], tournament.players[1]);
	startPongWebSocket(tournament.matches[0], true, false, false, [tournament.players[0], tournament.players[1]]);
}

async function getTournamentData(tournamentId: string) {
	const token = getCookie("token");
	const response = await fetch(`${backendUrl}/constructTournament`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
		},
		credentials: "include",
		body: JSON.stringify({ id: tournamentId }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		displayWarning(errorData.error);
		return null;
	}

	const data = await response.json();
	if (!data || !data.tournament) {
		displayWarning("Invalid tournament data received");
		return null;
	}

	return data.tournament;
}
