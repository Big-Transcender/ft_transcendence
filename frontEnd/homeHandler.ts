var today = new Date();
const phoneTime = document.getElementById("phoneTimeId");
const genericIcon = document.querySelectorAll(".genericIcon");
const phonetitle = document.querySelector(".phoneTitle");
const headerSucker = document.querySelector(".header") as HTMLElement;
const contestBgIcon = document.querySelector(".contestImage2") as HTMLElement;
const creditsText = document.getElementById("creditsTextId") as HTMLElement;
const creditsBox = document.getElementById("creditsId") as HTMLElement;

const homePlayersRank = document.querySelector(".homePlayersRank") as HTMLElement;

const hoverIconSound = new Audio("audios/openIcon.wav");
const selectIconSound = new Audio("audios/selectIcon.wav");
const openSound = new Audio("audios/openMenu.wav");
const openSound2 = new Audio("audios/openMenu.wav");
const closeSound = new Audio("audios/closeMenu.wav");
const closeSound2 = new Audio("audios/closeMenu.wav");
const decide = new Audio("audios/decide.wav");

let rankOpen = false;
let creditsOpen = false;
let isPlayingSoundRank = false;
let isPlayingSoundCredits = false;

getTimeForPhone();

genericIcon.forEach((button) => {
	button.addEventListener("mouseenter", () => {
		if (button.classList.contains("pongIcon")) {
			phonetitle.textContent = "Pong Game";
			new Audio("audios/selectIcon.wav").play();
		} else if (button.classList.contains("contestIcon")) {
			phonetitle.textContent = "Contest Page";
			new Audio("audios/selectIcon.wav").play();
		} else if (button.classList.contains("profileIcon")) {
			phonetitle.textContent = "Profile Page";
			new Audio("audios/selectIcon.wav").play();
		} else if (button.classList.contains("rankIcon")) {
			phonetitle.textContent = "Players Rank";
			new Audio("audios/selectIcon.wav").play();
		} else if (button.classList.contains("creditsIcon")) {
			phonetitle.textContent = "Credits!";
			new Audio("audios/selectIcon.wav").play();
		}
	});

	button.addEventListener("click", async () => {
		if (button.classList.contains("pongIcon")) {
			await playExpandingAnimation(button);
			await navigate("game1");
			resetGamePage();
		} else if (button.classList.contains("contestIcon")) {
			contestBgIcon.style.backgroundImage = "none";
			await playExpandingAnimation(button);
			contestBgIcon.style.backgroundImage = 'url("/images/icons/contestIcon2.png")';
			await navigate("contest");
			resetContestPage();
		} else if (button.classList.contains("profileIcon")) {
			await playExpandingAnimation(button);
			await navigate("profile");
		} else if (button.classList.contains("rankIcon")) {
			rankAnimationHandler();
		} else if (button.classList.contains("creditsIcon")) {
			creditsPlay();
		}
	});
});

async function creditsPlay() {
	//&emsp; JUMP LINE
	//<span style="color: #ff6b6b;"> </span> CHANGE COLOR

	if (!creditsOpen && !isPlayingSoundCredits) {
		isPlayingSoundCredits = true;
		openSound2.play();
		creditsBox.classList.remove("closeCredits-animation");
		creditsText.classList.add("playCredits-animation");
		creditsBox.classList.add("openCredits-animation");
		creditsText.innerHTML = `FrontEnd Developer<br>
			&emsp;<span style="color: #FFFFFD;">Brendon Vianna</span>
			<br>
			<br>BackEnd Developer<br>
			&emsp;<span style="color: #FFFFFD;">Diogo Pinheiro</span>
			<br>
			<br>DataBase Developer<br>
			&emsp;<span style="color: #FFFFFD;">Bruno Sousa</span>
			<br>
			<br>DevOps Developer<br>
			&emsp;<span style="color: #FFFFFD;">Diogo Correia</span>
			`;
		await betterWait(1000);
		creditsBox.classList.remove("openCredits-animation");
		creditsBox.style.left = "99%";
		creditsOpen = true;
		isPlayingSoundCredits = false;
	} else if (creditsOpen && !isPlayingSoundCredits) {
		isPlayingSoundCredits = true;
		closeSound2.play();
		creditsBox.classList.add("closeCredits-animation");
		creditsBox.classList.remove("openCredits-animation");
		creditsOpen = false;
		await betterWait(1000);
		creditsText.classList.remove("playCredits-animation");
		creditsBox.classList.remove("closeCredits-animation");
		creditsBox.style.left = "25%";
		isPlayingSoundCredits = false;
	}
}

async function playExpandingAnimation(button: any) {
	headerSucker.style.zIndex = "0";
	decide.play();
	await betterWait(50);
	hoverIconSound.play();
	button.classList.add("expand-animating");
	await betterWait(1000);
	button.classList.remove("expand-animating");
	headerSucker.style.zIndex = "1";
	phonetitle.textContent = "Welcome to the Animal Ponging";
}

async function updateLeaderboard() {
	fetch(`${backendUrl}/leaderboard`)
		.then((response) => response.json())
		.then((data) => {
			const table = document.getElementById("playerRankListId") as HTMLTableElement;

			while (table.rows.length > 1) {
				table.deleteRow(1);
			}

			const topPlayers = data.sort((a, b) => b.wins - a.wins).slice(0, 5);
			// Insert new rows
			topPlayers.forEach((player, index) => {
				const row = table.insertRow();
				row.insertCell().textContent = index + 1; // Position
				row.insertCell().textContent = player.nickname; // Nick
				row.insertCell().textContent = player.wins; // Wins
			});

			for (let i = topPlayers.length; i < 5; i++) {
				const row = table.insertRow();
				row.insertCell().textContent = (i + 1).toString(); // Position
				row.insertCell().textContent = "-----"; // Nick default
				row.insertCell().textContent = "0"; // Wins default
			}
		})
		.catch((error) => {
			console.error("Failed to load leaderboard:", error);
		});
}

function getTimeForPhone() {
	setInterval(() => {
		const now = new Date();
		if (phoneTime) {
			phoneTime.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
		}
	}, 5);
}

async function rankAnimationHandler() {
	if (!rankOpen && !isPlayingSoundRank) {
		updateLeaderboard();
		isPlayingSoundRank = true;
		openSound.play();
		homePlayersRank.classList.remove("closeLeft-animation");
		homePlayersRank.classList.add("openLeft-animation");
		await betterWait(1500);
		homePlayersRank.style.left = "-35%";
		homePlayersRank.style.opacity = "1";
		homePlayersRank.classList.remove("openLeft-animation");
		await betterWait(100);
		rankOpen = true;
		isPlayingSoundRank = false;
	} else if (rankOpen && !isPlayingSoundRank) {
		closeSound.play();
		isPlayingSoundRank = true;
		homePlayersRank.classList.remove("openLeft-animation");
		homePlayersRank.classList.add("closeLeft-animation");
		await betterWait(1000);
		homePlayersRank.style.left = "50%";
		homePlayersRank.style.opacity = "none";
		homePlayersRank.classList.remove("closeLeft-animation");
		await betterWait(100);
		rankOpen = false;
		isPlayingSoundRank = false;
	}
}

function resetGamePage() {
	let gamePageAll = document.querySelectorAll(".gameId");
	let gameSelectorPage = document.querySelector(".gameSelector");
	let backButtom = document.querySelector(".backGamePong");

	gamePageAll.forEach((el) => el.classList.remove("active"));
	backButtom.classList.remove("active");
	gameSelectorPage.classList.add("active");
}
