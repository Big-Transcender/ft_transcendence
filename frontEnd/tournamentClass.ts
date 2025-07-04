import { startPongWebSocket } from './gamePong';
import {  generateMatchId   } from './gameSelector';
import {  activeTournaments } from './tournamentEventHandler';


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


	startMatches() {
		if (this.players.length < 4) {
			throw new Error("Not enough players to start the tournament. At least 4 players are required.");
		}
		
		const currentNickname = getNickOnLocalStorage();
		
		// Check if I'm in semifinal 1 (players 0 and 1)
		if (this.players[0] === currentNickname || this.players[1] === currentNickname) {
			console.log("I'm in Semifinal 1!");
			startPongWebSocket(this.matchesID[0]);
		}
		// Check if I'm in semifinal 2 (players 2 and 3)
		else if (this.players[2] === currentNickname || this.players[3] === currentNickname) {
			console.log("I'm in Semifinal 2!");
			startPongWebSocket(this.matchesID[1]);
		}
	}

	recordMatchWinner(matchIndex: number, winnerNickname: string) {
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

		// Check if both semifinals are done to start the final
		if (this.semifinal1Winner && this.semifinal2Winner) {
			this.startFinalMatch();
		}
	}

	startFinalMatch() {
		console.log("🏁 Starting Final Match!");

		const finalMatchId = this.matchesID[2];

		const finalPlayers = [this.semifinal1Winner, this.semifinal2Winner];
		if (!finalPlayers[0] || !finalPlayers[1])
			return;

		const currentNickname = getNickOnLocalStorage();

		if (currentNickname === finalPlayers[0] || currentNickname === finalPlayers[1])
		{
			console.log("🎮 I'm in the Final!");
			startPongWebSocket(finalMatchId);
		}
	}

}


export function startTournament(players: string[], tournamentId: string)
{
	const tournament = new Tournament(players, tournamentId);
	tournament.startMatches();
}