let keyMap = new Map();
let emotionMap = new Map();
let isTyping = false;
keyMap.set(".", new Audio(`audios/speech/dot.wav`));
emotionMap.set("?", new Audio(`audios/speech/emotion/question.wav`));
emotionMap.set("ª", new Audio(`audios/speech/emotion/think.wav`));
for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    keyMap.set(letter, new Audio(`audios/speech/${letter}.wav`));
}
function typeText(element, text, delay) {
    if (isTyping) {
        return;
    }
    isTyping = true;
    element.innerHTML = "";
    let index = 0;
    let isRed = false;
    const type = () => {
        if (index < text.length) {
            if (stopSpeechFlag) {
                stopSpeechFlag = false;
                isTyping = false;
                return;
            }
            const charTemp = text.toLocaleLowerCase()[index];
            const char = text[index];
            let charSound = keyMap.get(charTemp);
            if (charSound) {
                const clone = charSound.cloneNode(true);
                clone.play();
            }
            emotionSound(char);
            if (char === "*") {
                isRed = !isRed;
            }
            else if (char === "|") {
                element.appendChild(document.createElement("br"));
            }
            else if (ignoreChar(char)) {
            }
            else {
                const span = document.createElement("span");
                span.textContent = char;
                if (isRed) {
                    span.style.color = "red";
                }
                element.appendChild(span);
            }
            index++;
            const nextDelay = nextDelaySelector(char, delay);
            setTimeout(type, nextDelay);
        }
        else {
            isTyping = false;
            console.log("finish");
        }
    };
    type();
}
function ignoreChar(c) {
    switch (c) {
        case "ª": {
            return true;
        }
        default: {
            return false;
        }
    }
}
function stopSpech() {
    if (isTyping) {
        stopSpeechFlag = true;
    }
}
function emotionSound(c) {
    switch (c) {
        case "?": {
            emotionMap.get(c).volume = 0.5;
            emotionMap.get(c).play();
            break;
        }
        case "ª": {
            emotionMap.get(c).volume = 1;
            emotionMap.get(c).play();
            break;
        }
    }
}
function nextDelaySelector(c, delay) {
    switch (c) {
        case ".": {
            return 250;
        }
        case "?": {
            return 500;
        }
        case ",": {
            return 200;
        }
        default: {
            return delay;
        }
    }
}
