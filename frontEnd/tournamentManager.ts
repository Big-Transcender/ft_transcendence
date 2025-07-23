

async function startTournament(tournamentId: string, fromPage: HTMLElement)
{
	console.log("aqui vai a response");
	const response = await fetch(`http://localhost:3000/tournament/${tournamentId}`);
	const data = await response.json()
	console.log(data);

}




// Listen for tournament match end events
window.addEventListener('tournamentMatchEnd', (event: CustomEvent) => {
	const { matchId, winner } = event.detail;
	handleMatchEnd(matchId, winner);
});

function handleMatchEnd(currentMatchId: string, winner: string) {
	// check in the tournaments to see the match
	//if (activeTournaments.size === 0)
	//	return;
	
	console.log('Handling match end...');
	/* TODO check in the tournaments to see the match
	
	for (const [tournamentId, tournament] of activeTournaments.entries()) {
		const matchIndex = tournament.matchesID.indexOf(currentMatchId);
		if (matchIndex !== -1) {
			tournament.recordMatchWinner(matchIndex, winner);
			break;
		}
	}
	*/
}