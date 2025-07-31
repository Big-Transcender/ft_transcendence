



window.addEventListener('TournamentMatch', (event: CustomEvent) => {
	const { Tournament } = event.detail;

	const nick = getNickOnLocalStorage();
	console.log("lets see the last stage");
	console.log(Tournament);
	handleNextFase(nick, Tournament);

});

async function handleNextFase(nick: string, Tournament: any) {
	try {

		if (Tournament.currentMatchIndex === 2)
		{
			alert(`The Winner of the Tournament is ${Tournament.winner}`)
			return;
		}
		

		const tournamentPlayers = [Tournament.semifinal1Winner, Tournament.semifinal2Winner];
		if (nick === tournamentPlayers[0] || nick === tournamentPlayers[1]) {
			changePageTo(pongGamePage, joinedContestPage);
			setTimeout(() => { //TODO just to do some testing
				navigate('game1');
				history.replaceState(undefined, "", `#pong/${Tournament.matches[2]}`);
				changePageTo(joinedContestPage, pongGamePage);
				startPongWebSocket(Tournament.matches[2]);
			}, 3000);
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

		console.log(tournament.tournamentObject.tournamentID)
		console.log(winner)
		
		const updateResponse = await fetch(`${backendUrl}/updateTournamentWinner`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: tournament.tournamentObject.tournamentID, winner }),
		});

		if (!updateResponse.ok) {
			throw new Error(`Failed to update tournament winner: ${updateResponse.statusText}`);
		}

		const updatedResponse = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`);
		if (!updatedResponse.ok) {
			throw new Error(`Failed to get updated tournament: ${updatedResponse.statusText}`);
		}

		const updatedTournament = await updatedResponse.json();

		console.log('Tournament winner updated successfully');
		window.dispatchEvent(new CustomEvent('TournamentMatch', {
			detail: { Tournament: updatedTournament.tournamentObject }
		}));
	} catch (error) {
		console.error('Error handling match end:', error);
	}
}