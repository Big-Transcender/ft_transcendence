type PlaylistItem = {
	name: string;
	audio: HTMLAudioElement;
};

const dayMusic: PlaylistItem[] = [
	{ name: "1 AM", audio: new Audio("audios/DayMusic/1AM.wav") },
	{ name: "Able Sisters", audio: new Audio("audios/DayMusic/Able_Sister.mp3") },
	{ name: "1 PM", audio: new Audio("audios/DayMusic/1PM.wav") },
	{ name: "Working at the Roost", audio: new Audio("audios/DayMusic/Working_at_the_Roost.mp3") },
	{ name: "T.I.Y", audio: new Audio("audios/DayMusic/T.I.Y.mp3") },
	// Add more items as needed
];

let musicToday = new Date();

const musicButtonPlay = document.querySelector(".buttonPlay") as HTMLButtonElement;
const musicButtonStop = document.querySelector(".buttonStop") as HTMLButtonElement;
const musicButtonNext = document.querySelector(".buttonNext") as HTMLButtonElement;
const musicButtonPrev = document.querySelector(".buttonPrev") as HTMLButtonElement;

const musicTitle = document.getElementById("musicTitle") as HTMLElement;
const musicDate = document.getElementById("musicDate") as HTMLElement;

// Start with first item
let currentIndex = 0;
let bgMusic = dayMusic[currentIndex].audio;
bgMusic.loop = true;
bgMusic.title = dayMusic[currentIndex].name;

musicTitle.textContent = dayMusic[currentIndex].name;
musicDate.textContent = musicToday.getHours().toString().padStart(2, "0") + ":" + musicToday.getMinutes().toString().padStart(2, "0");
setInterval(() => {
	musicToday = new Date();
	musicDate.textContent = musicToday.getHours().toString().padStart(2, "0") + ":" + musicToday.getMinutes().toString().padStart(2, "0");
}, 2000);

// Helper to update bgMusic and UI
function setMusic(index: number) {
	bgMusic.pause();
	bgMusic.currentTime = 0;
	currentIndex = index;
	bgMusic = dayMusic[currentIndex].audio;
	bgMusic.loop = true;
	bgMusic.title = dayMusic[currentIndex].name;
	musicTitle.textContent = dayMusic[currentIndex].name;
}

// Button event listeners
musicButtonStop.addEventListener("click", () => {
	musicPause();
});

musicButtonPlay.addEventListener("click", () => {
	if (bgMusic.paused || bgMusic.currentTime === 0) {
		bgMusic.play();
	}
});

musicButtonNext.addEventListener("click", () => {
	playNextMusic();
});

musicButtonPrev.addEventListener("click", () => {
	playPrevMusic();
});

// Functions
function musicPause() {
	if (bgMusic) {
		bgMusic.pause();
	}
}

function musicResume() {
	if (bgMusic) {
		bgMusic.play();
	}
}

function playNextMusic() {
	const nextIndex = (currentIndex + 1) % dayMusic.length;
	setMusic(nextIndex);
	bgMusic.play();
}

function playPrevMusic() {
	const prevIndex = (currentIndex - 1 + dayMusic.length) % dayMusic.length;
	setMusic(prevIndex);
	bgMusic.play();
}

// Initialize UI with current music
setMusic(currentIndex);
