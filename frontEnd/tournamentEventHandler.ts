export const activeTournaments = new Map();

// Listen for tournament match end events
window.addEventListener('tournamentMatchEnd', (event: CustomEvent) => {
	const { matchId, winner } = event.detail;
	handleMatchEnd(matchId, winner);
});

export function handleMatchEnd(currentMatchId: string, winner: string) {
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
