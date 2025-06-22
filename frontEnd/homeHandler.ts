var today = new Date();
const phoneTime = document.getElementById("phoneTimeId");
const genericIcon = document.querySelectorAll(".genericIcon");
const phonetitle = document.querySelector(".phoneTitle");
const headerSucker = document.querySelector(".header") as HTMLElement;
const contestBgIcon = document.querySelector(".contestImage2") as HTMLElement;

const openIconSound = new Audio("audios/openIcon.wav");
const selectIconSound = new Audio("audios/selectIcon.wav");

getTimeForPhone();

genericIcon.forEach((button) => {
	button.addEventListener("mouseenter", () => {
		if (button.classList.contains("pongIcon")) {
			phonetitle.textContent = "Pong Game";
			selectIconSound.play();
		} else if (button.classList.contains("contestIcon")) {
			phonetitle.textContent = "Contest Page";
			selectIconSound.play();
		} else if (button.classList.contains("profileIcon")) {
			phonetitle.textContent = "Profile Page";
			selectIconSound.play();
		}
	});

	button.addEventListener("click", async () => {
		if (button.classList.contains("pongIcon")) {
			await playExpandingAnimation(button);
			navigate("game1");
		} else if (button.classList.contains("contestIcon")) {
			contestBgIcon.style.backgroundImage = "none";
			await playExpandingAnimation(button);
			contestBgIcon.style.backgroundImage = 'url("/images/icons/contestIcon2.png")';
			navigate("contest");
		} else if (button.classList.contains("profileIcon")) {
			await playExpandingAnimation(button);
			navigate("profile");
		}
	});
});

async function playExpandingAnimation(button: any) {
	headerSucker.style.zIndex = "0";
	await betterWait(50);
	openIconSound.play();
	button.classList.add("expand-animating");
	await betterWait(1000);
	button.classList.remove("expand-animating");
	headerSucker.style.zIndex = "1";
	phonetitle.textContent = "Welcome to the Animal Ponging";
}

fetch("http://localhost:3000/leaderBoard")
	.then((response) => response.json())
	.then((data) => {
		const table = document.getElementById("playerRankListId") as HTMLTableElement;

		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		console.log(data);
		const topPlayers = data.sort((a, b) => b.wins - a.wins).slice(0, 5);

		// Insert new rows
		topPlayers.forEach((player, index) => {
			const row = table.insertRow();
			row.insertCell().textContent = index + 1; // Position
			row.insertCell().textContent = player.nickname; // Nick
			row.insertCell().textContent = player.wins; // Wins
		});
	})
	.catch((error) => {
		console.error("Failed to load leaderboard:", error);
	});

function getTimeForPhone() {
	setInterval(() => {
		const now = new Date();
		if (phoneTime) {
			phoneTime.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
		}
	}, 5);
}
