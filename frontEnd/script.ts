console.log("teste");
const page = document.getElementById('home');


function navigate(page) {
	if (document.getElementById(page).classList.contains('active'))
		return;
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.getElementById(page).classList.add('active');
	history.pushState(null, '', `#${page}`);
	getWins();
	updateLoses();
	updatePlays();
	updateWins();
}

window.addEventListener('popstate', () => {
	const page = location.hash.replace('#', '') || 'home';
	navigate(page);
});

window.addEventListener('load', () => {
	const page = location.hash.replace('#', '') || 'home';
	navigate(page);
});




const buttons = document.querySelectorAll('.buttonHitBox');
const div = document.querySelector('.buttonBG');
let mouseIn = false;


const buttonSoundIn = new Audio('audios/in.wav');
const buttonSoundOut = new Audio('audios/out.wav');
const musicMenuIn = new Audio('audios/musicMenuIn.wav');
const musicMenuOut = new Audio('audios/musicMenuOut.wav');
const musicMenu = document.querySelector('.musicPlayerBg');

let musicIn = false;

// bgMusic.play()

buttons.forEach(button => {
	button.addEventListener('mouseenter', () => {
		if (!mouseIn) {
			buttonSoundIn.play();
			mouseIn = true;
			// console.log("teste1");
		}
	});

	button.addEventListener('mouseleave', () => {
		if (mouseIn) {
			buttonSoundOut.play();
			// console.log("teste2");
			mouseIn = false;
		}
	});
});

musicMenu.addEventListener('mouseenter', () => {
	if (!musicIn) {
		musicMenuIn.play();
		musicIn = true;
	}
});

musicMenu.addEventListener('mouseleave', () => {
	if (musicIn) {
		musicMenuOut.play();
		musicIn = false;
	}
});




console.log(today.getHours());

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


// Socket


const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
	console.log('Connected to WebSocket server');
	socket.send('Hello Back, from TypeScript client!');
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
	  // Send the pressed key to the server
	  socket.send(`Arrow key pressed: ${event.key}`);
	  console.log(`${event.key} was pressed.`);
	}
  });

socket.addEventListener('message', (event: MessageEvent) => {
	console.log('Message from server->', event.data);
});

socket.addEventListener('close', () => {
	console.log('WebSocket connection closed');
});

socket.addEventListener('error', (event: Event) => {
	console.error('WebSocket error:', event);
});