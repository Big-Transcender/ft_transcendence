const page = document.getElementById("home");

let currentPage = 'home';

function navigate(page: string) {
	if (document.getElementById(page)?.classList.contains("active")) {
		return;
	}
	
	// Remove active class from all pages
	document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
	stopSpech();
	// Add active class to target page
	const targetPage = document.getElementById(page);
	if (targetPage) {
		targetPage.classList.add("active");
		currentPage = page;
		
		// Update URL without triggering popstate
		history.pushState({ page: page }, "", `#${page}`);
		
		// Handle page-specific logic
		handlePageChange(page);
	}
}

function navigateWithoutHistory(page: string) {
	if (document.getElementById(page)?.classList.contains("active")) {
		return;
	}
	
	document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
	const targetPage = document.getElementById(page);
	if (targetPage) {
		targetPage.classList.add("active");
		currentPage = page;
		handlePageChange(page);
	}
}

function handlePageChange(page: string) {
	// Add any page-specific initialization here
	switch(page) {
		case 'profile':
			if (!checkIfLogged()) {
				typeText(bubbleTextLogin, "Welcome back!", 60);
			} else {
				getUserStats(getNickOnLocalStorage());
			}

			break;
		case 'game1':

			break;
		case 'home':

			break;
	}
}



/*function navigate(page) {
	const pageElement = document.getElementById(page);
	if (!pageElement) {
		console.warn(`Page element with id "${page}" not found. Redirecionando para home.`);
		history.replaceState(null, "", "#home");
		document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
		document.getElementById("home").classList.add("active");
		return;
	}
	document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
	stopSpech();
	if (page === "profile") {
		if (!checkIfLogged()) {
			typeText(bubbleTextLogin, "Welcome back!", 60);
		} else {
			getUserStats(getNickOnLocalStorage());
		}
	}
	pageElement.classList.add("active");
	history.pushState(null, "", `#${page}`);
}*/

window.addEventListener("popstate", (event) => {
	const page = event.state?.page || location.hash.replace("#", "") || "home";
	console.log(`📍 Navigating to: ${page} (via browser navigation)`);
	
	// ✅ Check if last 4 characters are all numbers
	const last4Chars = page.slice(-3);
	const isAllNumbers = /^\d{4}$/.test(last4Chars);
	
	if (isAllNumbers) {
		console.log(`🚫 Blocked page "${page}" (ends with numbers: ${last4Chars}), redirecting to home`);
		history.replaceState({ page: "home" }, "", "#home");
		navigateWithoutHistory("home");
		return;
	}
	
	navigateWithoutHistory(page);
});

window.addEventListener("load", () => {
	const page = location.hash.replace("#", "") || "home";
	console.log(`📍 Initial page load: ${page}`);
	
	// Set initial state
	history.replaceState({ page: page }, "", `#${page}`);
	navigateWithoutHistory(page);
});

document.addEventListener("DOMContentLoaded", () => {
	const page = location.hash.replace("#", "") || "home";
	console.log(`📍 DOM loaded, navigating to: ${page}`);
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



function hasNumberPath(hash: string): boolean {
	const cleanHash = hash.replace("#", "");
	const parts = cleanHash.split('/');
	
	// Check if there's a second part and if it's a number
	if (parts.length > 1) {
		const secondPart = parts[1];
		return /^\d+$/.test(secondPart); // Check if it's only digits
	}
	
	return false;
}

function extractPageFromHash(hash: string): string {
	// Remove # and get the first part before any /
	const cleanHash = hash.replace("#", "");
	const pagePart = cleanHash.split('/')[0];
	
	return pagePart || "home";
}