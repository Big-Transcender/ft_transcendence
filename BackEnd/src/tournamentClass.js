const tournaments = new Map(); // tournamentId -> tournament data


class Tournament {

	players;
	tournamentID;
	matches;

	currentMatchIndex
	semifinal1Winner;
	semifinal2Winner;
	winner;

	constructor(tournamentId) {
		this.players = new Array(4).fill(null);
		this.tournamentID = tournamentId;
		this.currentMatchIndex = 0;
		this.semifinal1Winner = null;
		this.semifinal2Winner = null;
		this.Winner = null;
		this.matches = [ generateMatchId(), generateMatchId(), generateMatchId()];

		tournaments.set(tournamentId, this);
	}

	recordMatchWinner(winnerNickname, currentMatchId) {


		const winner = this.players.find(p => p === winnerNickname);
		if (!winner) {
			console.error("⚠️ Winner not found in player list.");
			return;
		}

		if (currentMatchId === this.matches[0]) {
			this.semifinal1Winner = winner;
			console.log("✅ Semifinal 1 winner recorded: ", winner);
		}
		else if (currentMatchId === this.matches[1]) {
			this.semifinal2Winner = winner;
			console.log("✅ Semifinal 2 winner recorded: ", winner);
		}
		else if (currentMatchId === this.matches[2]) {
			this.Winner = winnerNickname;
			this.currentMatchIndex = 3;
			console.log("✅ The winner is: ", winner);
		}
	}

}


function getTournament(tournamentId) {
	return tournaments.get(tournamentId);
}

function generateMatchId(){
	return Math.floor(1000 + Math.random() * 90000).toString();
}


module.exports = {
	Tournament,
	tournaments,
	getTournament,
	generateMatchId
};