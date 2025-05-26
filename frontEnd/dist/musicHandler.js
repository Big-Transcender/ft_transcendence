// const music1AM = new Audio('audios/DayMusic/1AM.wav');
// const music1PM = new Audio('audios/DayMusic/1PM.wav');
var today = new Date();
const dayMusic = {
    // "12AM": new Audio('audios/DayMusic/12AM.wav'),
    "1AM": new Audio("audios/DayMusic/1AM.wav"),
    // "2AM": new Audio('audios/DayMusic/2AM.wav'),
    // "3AM": new Audio('audios/DayMusic/3AM.wav'),
    // "4AM": new Audio('audios/DayMusic/4AM.wav'),
    // "5AM": new Audio('audios/DayMusic/5AM.wav'),
    // "6AM": new Audio('audios/DayMusic/6AM.wav'),
    // "7AM": new Audio('audios/DayMusic/7AM.wav'),
    // "8AM": new Audio('audios/DayMusic/8AM.wav'),
    // "9AM": new Audio('audios/DayMusic/9AM.wav'),
    // "10AM": new Audio('audios/DayMusic/10AM.wav'),
    // "11AM": new Audio('audios/DayMusic/11AM.wav'),
    // "12PM": new Audio('audios/DayMusic/12PM.wav'),
    "1PM": new Audio("audios/DayMusic/1PM.wav"),
    // "2PM": new Audio('audios/DayMusic/2PM.wav'),
    // "3PM": new Audio('audios/DayMusic/3PM.wav'),
    // "4PM": new Audio('audios/DayMusic/4PM.wav'),
    // "5PM": new Audio('audios/DayMusic/5PM.wav'),
    // "6PM": new Audio('audios/DayMusic/6PM.wav'),
    // "7PM": new Audio('audios/DayMusic/7PM.wav'),
    // "8PM": new Audio('audios/DayMusic/8PM.wav'),
    // "9PM": new Audio('audios/DayMusic/9PM.wav'),
    // "10PM": new Audio('audios/DayMusic/10PM.wav'),
    // "11PM": new Audio('audios/DayMusic/11PM.wav'),
};
const currentHour = 1;
const period = currentHour < 12 ? "AM" : "PM";
const musicButtonPlay = document.querySelector(".buttonPlay");
const musicButtonStop = document.querySelector(".buttonStop");
const formattedHour = (currentHour % 12 || 12) + period;
const bgMusic = dayMusic[formattedHour];
bgMusic.loop = true;
bgMusic.title = (currentHour % 12 || 12) + " " + period;
// bgMusic.play();
console.log(bgMusic.title);
console.log(today.getHours());
const musicTitle = document.getElementById("musicTitle");
const musicDate = document.getElementById("musicDate");
musicTitle.textContent = bgMusic.title;
musicDate.textContent = today.getHours().toString().padStart(2, "0") + ":" + today.getMinutes().toString().padStart(2, "0");
musicButtonStop.addEventListener("click", () => {
    musicPause();
    console.log("musica pausada");
});
musicButtonPlay.addEventListener("click", () => {
    musicResume();
    console.log("musica resume");
});
function musicPause() {
    bgMusic.pause();
}
function musicResume() {
    bgMusic.play();
}
