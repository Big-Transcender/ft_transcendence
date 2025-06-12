let keyMap = new Map<string, HTMLAudioElement>();
let emotionMap = new Map<string, HTMLAudioElement>();
let isTyping = false;

keyMap.set(".", new Audio(`audios/speech/dot.wav`));
emotionMap.set("?", new Audio(`audios/speech/emotion/question.wav`));
emotionMap.set("ª", new Audio(`audios/speech/emotion/think.wav`));
for (let i = 97; i <= 122; i++) {
	const letter = String.fromCharCode(i);
	keyMap.set(letter, new Audio(`audios/speech/${letter}.wav`));
}

//ª thinking sound
//| jump line
//*word* turn in red
function typeText(element: HTMLElement, text: string, delay: number): void {
	console.log("isTyping: " + isTyping);
	console.log("stopSpeechFlag: " + stopSpeechFlag);
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
				const clone = charSound.cloneNode(true) as HTMLAudioElement;
				clone.play();
			}
			emotionSound(char);

			if (char === "*") {
				isRed = !isRed;
			} else if (char === "|") {
				element.appendChild(document.createElement("br"));
			} else if (ignoreChar(char)) {
			} else {
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
		} else {
			isTyping = false;
		}
	};
	type();
}

function ignoreChar(c: string) {
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

function emotionSound(c: string) {
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

function nextDelaySelector(c: string, delay: number) {
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
