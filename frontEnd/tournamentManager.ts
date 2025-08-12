



window.addEventListener('TournamentMatch', (event: CustomEvent) => {
	const { Tournament } = event.detail;

	const nick = getNickOnLocalStorage();
	console.log("lets see the last stage");
	console.log(Tournament);
	handleNextFase(nick, Tournament);

});

async function handleNextFase(nick: string, Tournament: any) {
	try {

		console.log(Tournament);

		if (Tournament.currentMatchIndex === 3) {
			alert(`You win the Tournament! The Great ${Tournament.Winner}!`);
			navigate("home");
			location.reload();
			return ;
		}

		const tournamentPlayers = [Tournament.semifinal1Winner, Tournament.semifinal2Winner];
		if (nick === tournamentPlayers[0] || nick === tournamentPlayers[1]) {

			changePageTo(pongGamePage, joinedContestPage);
			setTimeout(() => {
				navigate('game1');
				history.replaceState(undefined, "", `#pong/${Tournament.matches[2]}`);
				changePageTo(joinedContestPage, pongGamePage);
				startPongWebSocket(Tournament.matches[2]);
			}, 3000);
			navigate("home");
			location.reload()

		} else {
			console.log(`${nick} is not in the semifinals.`);
		}
	} catch (error) {
		console.error("Error handling next phase:", error);
	}
}

// Listen for tournament match end events
window.addEventListener('MatchEnd', (event: CustomEvent) => {
	const { matchId, winner, isLocal } = event.detail;
	if (isLocal)
	{
		console.log('Handling LOCAL match end...');
		console.log(`Match ID: ${matchId}, Winner: ${winner}`);
		handleLocalMatchEnd(matchId, winner);
		return ;
	}
	handleMatchEnd(matchId, winner);
});

async function handleMatchEnd(currentMatchId: string, winner: string) {
	try {
		console.log('Handling match end...');
		const nick = getNickOnLocalStorage();


		const response = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`);
		if (!response.ok) {
			throw new Error(`Failed to check tournament match: ${response.statusText}`);
		}

		if (nick != winner)
		{
			navigate("home");
			location.reload();
			return;
		}
			

		const tournament = await response.json();
		if (!tournament.exists)
		{
			navigate("home");
			location.reload();
			return;
		}

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
		window.dispatchEvent(new CustomEvent('TournamentMatch', {
			detail: { Tournament: updatedTournament.tournamentObject }
		}));
	} catch (error) {
		console.error('Error handling match end:', error);
	}
}



function handleLocalMatchEnd(matchId: string, winner: string)
{
	var tournament = findTournamentByMatch(matchId);
	if (!tournament)
	{
		navigate("home");
		location.reload()
		return;
	}

	if (tournament.currentMatchIndex === 0) {
		tournament.semifinal1 = winner;
		tournament.currentMatchIndex++;

		console.log(tournament.semifinal1);
		console.log(tournament.semifinal2);
		console.log(tournament.currentMatchIndex);

		changePageTo(pongGamePage, joinedContestPage);
		setTimeout(() => {
			navigate('game1');
			history.replaceState(undefined, "", `#pong/${tournament.matches[1]}`);
			changePageTo(joinedContestPage, pongGamePage);
			startPongWebSocket(tournament.matches[1], true, false, false, [tournament.players[2], tournament.players[3]]);
			setGameScore(tournament.players[2], tournament.players[3]);
			resetEmotions();
		}, 3000);


	} 
	
	else if (tournament.currentMatchIndex === 1) {
		tournament.semifinal2 = winner;
		tournament.currentMatchIndex++;


		console.log(tournament.semifinal1);
		console.log(tournament.semifinal2);
		console.log(tournament.currentMatchIndex);

		setTimeout(() => {
			navigate('game1');
			history.replaceState(undefined, "", `#pong/${tournament.matches[2]}`);
			changePageTo(joinedContestPage, pongGamePage);
			startPongWebSocket(tournament.matches[2],  true, false, false, [tournament.semifinal1, tournament.semifinal2]);
			setGameScore(tournament.semifinal1, tournament.semifinal2);
			resetEmotions();
		}, 3000);

		
	} 
	
	else if (tournament.currentMatchIndex === 2) {
		tournament.Winner = winner;
		alert(`You win the Tournament! The winner is: The Great ${tournament.Winner}!`);
		navigate("home");
		location.reload();
	} 
	
	else {
		console.error("Invalid match index in tournament.");
	}

	

}

function findTournamentByMatch(matchId: string): any | null {
	for (const [tournamentId, tournament] of LocalTournaments.entries()) {
		if (tournament.matches.includes(matchId)) {
			return tournament;
		}
	}
	return null;
}