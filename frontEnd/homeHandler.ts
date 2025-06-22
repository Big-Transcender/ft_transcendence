var today = new Date();
const phoneTime = document.getElementById("phoneTimeId");
const pongIcon = document.querySelectorAll(".pongIcon");
const phonetitle = document.querySelector(".phoneTitle");

getTimeForPhone();

pongIcon.forEach((button) => {
	button.addEventListener("mouseenter", () => {
		if (button.classList.contains("pongIcon")) {
			phonetitle.textContent = "Pong Game";
		} else if (button.classList.contains("contestIcon")) {
			phonetitle.textContent = "Contest Page";
		} else if (button.classList.contains("profileIcon")) {
			phonetitle.textContent = "Profile Page";
		}
		console.log(button);
	});

	button.addEventListener("click", async () => {
		if (button.classList.contains("pongIcon")) {
			button.classList.add("expand-animating");
			await betterWait(1000);
			button.classList.remove("expand-animating");
			// navigate("game1");
		}
	});

	// button.addEventListener("mouseleave", () => {
	// 	if (mouseIn) {
	// 		buttonSoundOut.play();
	// 		// console.log("teste2");
	// 		mouseIn = false;
	// 	}
	// });
});

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
		// console.log("teste");
	}, 1);
}
