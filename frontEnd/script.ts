const page = document.getElementById("home");

function navigate(page) {
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
		}
	}
	pageElement.classList.add("active");
	history.pushState(null, "", `#${page}`);
}

window.addEventListener("popstate", () => {
	const page = location.hash.replace("#", "") || "home";
	navigate(page);
});

window.addEventListener("load", () => {
	const page = location.hash.replace("#", "") || "home";
	navigate(page);
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

// console.log(bgMusic.title);

// botao.addEventListener('mouseenter', () => {
// 	jaPassou = true;
// });

// botao.addEventListener('mouseleave', () => {
// 	if (jaPassou) {
// 		div.classList.add('animar');
// 		console.log("entrou");

// 		// Se quiser remover depois de um tempo:
// 		// setTimeout(() => {
// 		//   div.classList.remove('animar');
// 		// }, 1000);
// 	}
// });
