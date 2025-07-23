
const { tournaments, saveTournament, getTournament, updateTournamentWinner } = require('../tournamentClass.js');

module.exports = async function (fastify) {

	fastify.post('/tournament', async (req, res) => {
		const { tournamentId, players, matches } = req.body;
	
		if (!tournamentId || !players || players.length < 4) {
			return res.status(400).send({ error: 'Invalid tournament data' });
		}
	
		saveTournament(tournamentId, {
			players,
			currentMatchIndex: 0,
			matches,
			semifinal1Winner: null,
			semifinal2Winner: null,
			finalWinner: null,
			isCompleted: false
		});
	
		res.send({ success: true, message: `Tournament ${tournamentId} created` });
	});


	fastify.post('/isTournamentMatch/:id', async (req, res) => {
		const { id: matchId } = req.params;
	
		if (!matchId) {
			return res.status(400).send({ error: 'Match ID is required' });
		}
	
		const tournamentId = getTournamentIdByMatchId(matchId);
	
		if (tournamentId) {
			res.send({ exists: true, tournamentId });
		} else {
			res.send({ exists: false });
		}
	});


}

function getTournamentIdByMatchId(matchId) {
	for (const [tournamentId, tournamentData] of tournaments.entries()) {
		if (tournamentData.matches.includes(matchId)) {
			return tournamentId; // Return the tournament ID if the match exists
		}
	}
	return null; // Return null if no tournament contains the match
}