

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

async function handleMatchEnd(currentMatchId: string, winner: string) {

	
	console.log('Handling match end...');
	const response = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`);
	const tournament = await response.json();
	if (!tournament.exist)
		return;




	
}