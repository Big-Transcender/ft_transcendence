let keyMap = new Map();
const question = new Audio("audios/speech/question.wav");
for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    keyMap.set(letter, new Audio(`audios/speech/${letter}.wav`));
}
function typeText(element, text, delay = 100) {
    element.innerHTML = "";
    let index = 0;
    let isRed = false;
    const type = () => {
        if (index < text.length) {
            const charTemp = text.toLocaleLowerCase()[index];
            const char = text[index];
            let charSound = keyMap.get(charTemp);
            if (charSound) {
                const clone = charSound.cloneNode(true);
                clone.play();
            }
            if (char === "?") {
                question.play();
            }
            if (char === "*") {
                isRed = !isRed;
            }
            else if (char === "|") {
                element.appendChild(document.createElement("br"));
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
            setTimeout(type, delay);
        }
    };
    type();
}
