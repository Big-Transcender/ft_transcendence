// TODO need to talk to bruno to see if this makes sense 

const tournaments = new Map(); // tournamentId -> tournament data


class Tournament {

	players;
	tournamentID;
	matchesID;

	currentMatchIndex
	semifinal1Winner;
	semifinal2Winner;

	constructor(tournamentId) {
		this.players = new Array(4).fill(null);
		this.tournamentID = tournamentId;
		this.currentMatchIndex = 0;
		this.semifinal1Winner = null;
		this.semifinal2Winner = null;
		this.matchesID = [ generateMatchId(), generateMatchId(), generateMatchId()];

		//TODO add the tournaments here
	}

	setPlayer(nick) {
	
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i] === null) {
				this.players[i] = nick;
				console.log(`✅ Player ${nick} added to position ${i}`);
				return;
			}
		}
	}

	startMatches(fromPage) {
		if (this.players.length < 4) {
			throw new Error("Not enough players to start the tournament. At least 4 players are required.");
		}
		
		const currentNickname = getNickOnLocalStorage();
		
		// Check if I'm in semifinal 1 (players 0 and 1)
		if (this.players[0] === currentNickname || this.players[1] === currentNickname) {
			console.log("I'm in Semifinal 1!");

		}
		// Check if I'm in semifinal 2 (players 2 and 3)
		else if (this.players[2] === currentNickname || this.players[3] === currentNickname) {
			console.log("I'm in Semifinal 2!");

		}
	}

	recordMatchWinner(matchIndex, winnerNickname) {
		const winner = this.players.find(p => p === winnerNickname);
		if (!winner) {
			console.error("⚠️ Winner not found in player list.");
			return;
		}

		if (matchIndex === 0) {
			this.semifinal1Winner = winner;
			console.log("✅ Semifinal 1 winner recorded:", winner);
		} else if (matchIndex === 1) {
			this.semifinal2Winner = winner;
			console.log("✅ Semifinal 2 winner recorded:", winner);
		}
		if (currentNickname != this.semifinal1Winner 
			&& currentNickname != this.semifinal2Winner)
			return;

		this.startFinalMatch();
	}

	startFinalMatch() {
		console.log("🏁 Starting Final Match!");

		const finalPlayers = [this.semifinal1Winner, this.semifinal2Winner];


		if (currentNickname === finalPlayers[0] || currentNickname === finalPlayers[1])
		{
			console.log("🎮 I'm in the Final!");
			startPongWebSocket(this.matchesID[2]);
			changePageTo(pongGamePage, pongGamePage);
		}
	}

}


function saveTournament(tournamentId, tournamentData) {
	tournaments.set(tournamentId, {
		...tournamentData,
	});
	console.log(`📝 Tournament ${tournamentId} saved`);
}

function getTournament(tournamentId) {
	return tournaments.get(tournamentId);
}

function generateMatchId(){
	return "match-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}


function updateTournamentWinner(tournamentId, matchIndex, winner) {
	const tournament = tournaments.get(tournamentId);
	if (!tournament)
		return false;

	if (matchIndex === 0) {
		tournament.semifinal1Winner = winner;
	} else if (matchIndex === 1) {
		tournament.semifinal2Winner = winner;
	} else if (matchIndex === 2) {
		tournament.finalWinner = winner;
		tournament.isCompleted = true;
	}

	tournament.currentMatchIndex = Math.max(tournament.currentMatchIndex, matchIndex + 1);
	
	console.log(`🏆 Tournament ${tournamentId} updated: Match ${matchIndex} winner = ${winner}`);
	return true;
}

module.exports = {
	Tournament,
	saveTournament,
	getTournament,
	updateTournamentWinner,
	generateMatchId
};