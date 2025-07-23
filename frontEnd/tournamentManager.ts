

async function startTournament(tournamentId: string, players: string[])
{
	console.log("aqui vai a response");
	const response = await fetch(`${backendUrl}/constructTournament`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: tournamentId, players }),

	});

	const data = await response.json()

	console.log(data);

}

window.addEventListener('TournamentMatch', (event: CustomEvent) => {
	const { TournamentId } = event.detail;

	const nick = getNickOnLocalStorage();
	handleNextFase(nick, TournamentId);

});

async function handleNextFase(nick: string, Tournament: any) {
	try {
		// Validate Tournament object
		if (Tournament.currentMatchIndex === 2)
		{
			alert(`The Winner of the Tournament is ${Tournament.winner}`)
			return;
		}
		
		if (!Tournament || !Tournament.semifinal1Winner || !Tournament.semifinal2Winner || !Tournament.matches) {
			throw new Error("Invalid Tournament object");
		}

		// Check if the user is in the semifinals
		const tournamentPlayers = [Tournament.semifinal1Winner, Tournament.semifinal2Winner];
		if (nick === tournamentPlayers[0] || nick === tournamentPlayers[1]) {
			// Change page and start WebSocket
			changePageTo(joinedContestPage, pongGamePage);
			startPongWebSocket(Tournament.matches[2]);
		} else {
			console.log(`${nick} is not in the semifinals.`);
		}
	} catch (error) {
		console.error("Error handling next phase:", error);
	}
}


// Listen for tournament match end events
window.addEventListener('MatchEnd', (event: CustomEvent) => {
	const { matchId, winner } = event.detail;
	handleMatchEnd(matchId, winner);
});

async function handleMatchEnd(currentMatchId: string, winner: string) {
	try {
		console.log('Handling match end...');
		const response = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`);
		if (!response.ok) {
			throw new Error(`Failed to check tournament match: ${response.statusText}`);
		}

		const tournament = await response.json();
		if (!tournament.exists)
			return;
		
		const updateResponse = await fetch(`${backendUrl}/updateTournamentWinner`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: tournament.tournamentObject.tournamentId, winner }),
		});

		if (!updateResponse.ok) {
			throw new Error(`Failed to update tournament winner: ${updateResponse.statusText}`);
		}

		console.log('Tournament winner updated successfully');
		window.dispatchEvent(new CustomEvent('TournamentMatch', {
			detail: { Tournament: tournament.tournamentObject }
		}));
	} catch (error) {
		console.error('Error handling match end:', error);
	}
}