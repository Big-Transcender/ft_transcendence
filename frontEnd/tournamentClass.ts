


const pongGamePage = document.getElementById("pongGameId");
const activeTournaments = new Map();

function generateMatchId(){
	return "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

class Tournament {

	players: string[];
	tournamentID: string;
	matchesID: string[];

	currentMatchIndex: number;
	semifinal1Winner: string;
	semifinal2Winner: string;

	constructor(players: string[], tournamentId: string) {
		this.players = players;
		this.tournamentID = tournamentId;
		this.currentMatchIndex = 0;
		this.semifinal1Winner = null;
		this.semifinal2Winner = null;
		this.matchesID = [ generateMatchId(), generateMatchId(), generateMatchId()];

		activeTournaments.set(tournamentId, this);
	}


	startMatches(fromPage: HTMLElement) {
		if (this.players.length < 4) {
			throw new Error("Not enough players to start the tournament. At least 4 players are required.");
		}
		
		const currentNickname = getNickOnLocalStorage();
		
		// Check if I'm in semifinal 1 (players 0 and 1)
		if (this.players[0] === currentNickname || this.players[1] === currentNickname) {
			console.log("I'm in Semifinal 1!");
			startPongWebSocket(this.matchesID[0]);
			changePageTo(fromPage, pongGamePage);
		}
		// Check if I'm in semifinal 2 (players 2 and 3)
		else if (this.players[2] === currentNickname || this.players[3] === currentNickname) {
			console.log("I'm in Semifinal 2!");
			startPongWebSocket(this.matchesID[1]);
			changePageTo(fromPage, pongGamePage);
		}
	}

	recordMatchWinner(matchIndex: number, winnerNickname: string) {
		const winner = this.players.find(p => p === winnerNickname);
		if (!winner) {
			console.error("⚠️ Winner not found in player list.");
			return;
		}
		const currentNickname = getNickOnLocalStorage();
		if (matchIndex === 0) {
			this.semifinal1Winner = winner;
			console.log("✅ Semifinal 1 winner recorded:", winner);
		} else if (matchIndex === 1) {
			this.semifinal2Winner = winner;
			console.log("✅ Semifinal 2 winner recorded:", winner);
		}
		if (currentNickname != this.semifinal1Winner 
			|| currentNickname != this.semifinal2Winner)
			return;

		this.startFinalMatch();
	}

	startFinalMatch() {
		console.log("🏁 Starting Final Match!");

		const finalPlayers = [this.semifinal1Winner, this.semifinal2Winner];
		const currentNickname = getNickOnLocalStorage();

		if (currentNickname === finalPlayers[0] || currentNickname === finalPlayers[1])
		{
			console.log("🎮 I'm in the Final!");
			startPongWebSocket(this.matchesID[2]);
			changePageTo(pongGamePage, pongGamePage);
		}
	}

}


export function startTournament(players: string[], tournamentId: string, fromPage: HTMLElement)
{
	const tournament = new Tournament(players, tournamentId);
	tournament.startMatches(fromPage);

}




// Listen for tournament match end events
window.addEventListener('tournamentMatchEnd', (event: CustomEvent) => {
	const { matchId, winner } = event.detail;
	handleMatchEnd(matchId, winner);
});

function handleMatchEnd(currentMatchId: string, winner: string) {
	if (activeTournaments.size === 0)
		return;
	
	console.log('Handling match end...');
	for (const [tournamentId, tournament] of activeTournaments.entries()) {
		const matchIndex = tournament.matchesID.indexOf(currentMatchId);
		if (matchIndex !== -1) {
			tournament.recordMatchWinner(matchIndex, winner);
			break;
		}
	}
}