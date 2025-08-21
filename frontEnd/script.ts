const page = document.getElementById("home");

let currentPage = "home";

const buttonSound = new Audio("audios/click.wav");
const headerSound = new Audio("audios/click2.wav");
const button2ButtonSound = new Audio("audios/click4.wav");
const defaultButtonSound = new Audio("audios/click3.wav");

document.querySelectorAll(".gameSelectorButton").forEach((btn) => {
	btn.addEventListener("click", async () => {
		buttonSound.currentTime = 0;
		buttonSound.play();
	});
	btn.addEventListener("mouseenter", () => {
		button2ButtonSound.currentTime = 0;
		button2ButtonSound.play();
	});
});

document.querySelectorAll(".headerSound").forEach((div) => {
	div.addEventListener("click", () => {
		headerSound.currentTime = 0;
		headerSound.play();
	});
});

document.querySelectorAll(".defaultButton").forEach((btn) => {
	btn.addEventListener("click", () => {
		defaultButtonSound.currentTime = 0;
		defaultButtonSound.play();
	});
});

function navigate(page: string) {


	document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
	stopSpech();

	const targetPage = document.getElementById(page);
	if (targetPage) {
		targetPage.classList.add("active");
		currentPage = page;

		history.pushState({ page: page }, "", `#${page}`);

		handlePageChange(page);
	}
}

function navigateWithoutHistory(page: string) {


	document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
	const targetPage = document.getElementById(page);
	if (targetPage) {
		targetPage.classList.add("active");
		currentPage = page;
		handlePageChange(page);
	}
}

async function handlePageChange(page: string) {
	// Add any page-specific initialization here
	startedContest = false;
	console.log(page);
	switch (page) {
		case "profile":
			if (await !checkIfLogged()) {
				typeText(bubbleTextLogin, "Welcome back!", 60);
			} else {
				getUserStats(await getNickOnLocalStorage());
				updateMatchHistory();
			}
			break;
		case "contest":
			changePageTo(contestMainPage, contestMainPage);
			let contestIntervalId = setInterval(async () => {
				const hash = window.location.hash;

				if (!hash.startsWith("#contest")) {
					await removePlayer();
					stopContestPolling();
					clearInterval(contestIntervalId!);
				}
			}, 100);

			break;
		case "pong":
			changePageTo(gameSelectorPongPage, gameSelectorPongPage);
			break;
		case "pong/multiplayerMenu":
			changePageTo(gameSelectorPongPage, gameSelectorPongPage);
			break;
	}
}

window.addEventListener("popstate", (event) => {
	const page = event.state?.page || location.hash.replace("#", "") || "home";
	console.log(`📍 Navigating to: ${page} (via browser navigation)`);

	// ✅ Check if last 4 characters are all numbers
	const last4Chars = page.slice(-4);
	const isAllNumbers = /^\d{4}$/.test(last4Chars);

	if (isAllNumbers) {
		console.log(`🚫 Blocked page "${page}" (ends with numbers: ${last4Chars}), redirecting to home`);
		history.replaceState({ page: "home" }, "", "#home");
		navigateWithoutHistory("home");
		return;
	}

	navigateWithoutHistory(page);
});

window.addEventListener("load", async () => {
	var page = location.hash.replace("#", "") || "home";
	console.log(`📍 Initial page load: ${page}`);
	if (isGamePage(page))
		return;
	if (page === "contest") {
		await removePlayer();
		stopContestPolling();
	}
	if( page === "pong/multiplayerMenu")
	{
		page =  "game1";
		console.log(page);
	}


	history.replaceState({ page: page }, "", `#${page}`);
	navigateWithoutHistory(page);
});

document.addEventListener("DOMContentLoaded", async () => {
	const page = location.hash.replace("#", "") || "home";
	console.log(`📍 DOM loaded, navigating to: ${page}`);

	if (page === "contest") {
		console.log("Page is refreshing or closing, removing player...");
		await removePlayer();
		stopContestPolling();
	}
	navigateWithoutHistory(page);
});

const buttons = document.querySelectorAll(".buttonHitBox");
const div = document.querySelector(".buttonBG");
let mouseIn = false;

const buttonSoundIn = new Audio("audios/in.wav");
const buttonSoundOut = new Audio("audios/out.wav");
const musicMenuIn = new Audio("audios/musicMenuIn.wav");
const musicMenuOut = new Audio("audios/musicMenuOut.wav");
const musicMenu = document.querySelector(".musicPlayerBg");

let musicIn = false;

// bgMusic.play()

buttons.forEach((button) => {
	button.addEventListener("mouseenter", () => {
		if (!mouseIn) {
			buttonSoundIn.play();
			mouseIn = true;
			// console.log("teste1");
		}
	});

	button.addEventListener("mouseleave", () => {
		if (mouseIn) {
			buttonSoundOut.play();
			// console.log("teste2");
			mouseIn = false;
		}
	});
});

musicMenu.addEventListener("mouseenter", () => {
	if (!musicIn) {
		musicMenuIn.play();
		musicIn = true;
	}
});

musicMenu.addEventListener("mouseleave", () => {
	if (musicIn) {
		musicMenuOut.play();
		musicIn = false;
	}
});

function isGamePage(page) {
	const last4Chars = page.slice(-4);
	const isAllNumbers = /^\d{4}$/.test(last4Chars);

	if (isAllNumbers) {
		console.log(`🚫 Blocked page "${page}" (ends with numbers: ${last4Chars}), redirecting to home`);
		history.replaceState({ page: "home" }, "", "#home");
		navigateWithoutHistory("home");
		return true;
	}
	return false;
}
