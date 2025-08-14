const page = document.getElementById("home");
let currentPage = 'home';
function navigate(page) {
    var _a;
    if ((_a = document.getElementById(page)) === null || _a === void 0 ? void 0 : _a.classList.contains("active")) {
        return;
    }
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
function navigateWithoutHistory(page) {
    var _a;
    if ((_a = document.getElementById(page)) === null || _a === void 0 ? void 0 : _a.classList.contains("active")) {
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
function handlePageChange(page) {
    // Add any page-specific initialization here
    switch (page) {
        case 'profile':
            if (!checkIfLogged()) {
                typeText(bubbleTextLogin, "Welcome back!", 60);
            }
            else {
                getUserStats(getNickOnLocalStorage());
                updateMatchHistory();
            }
            break;
        case 'game1':
            break;
        case 'home':
            break;
    }
}
window.addEventListener("popstate", (event) => {
    var _a;
    const page = ((_a = event.state) === null || _a === void 0 ? void 0 : _a.page) || location.hash.replace("#", "") || "home";
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
window.addEventListener("load", () => {
    const page = location.hash.replace("#", "") || "home";
    console.log(`📍 Initial page load: ${page}`);
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
