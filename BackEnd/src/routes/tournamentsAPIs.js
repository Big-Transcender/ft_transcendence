
const { tournaments, getTournament, Tournament} = require('../tournamentClass.js');
const { getTournamentPlayers} = require('../dataQuerys');

module.exports = async function (fastify) {


	fastify.post('/constructTournament', async (req, res) => {
		const { id: tournamentId } = req.body;
	
		if (!tournamentId) {
			return res.status(400).send({ error: 'Match ID is required' });
		}

		var tournament = getTournament(tournamentId);
		if (tournament)
		{
			return res.send({     
				tournament: tournament
			});
		}


		tournament = new Tournament(tournamentId);
		const players = getTournamentPlayers(tournamentId);
		
		tournament.players = [
								players[0].nickname, 
								players[1].nickname, 
								players[2].nickname, 
								players[3].nickname
							 ];

		res.send({     
			tournament: {
				id: tournamentId,
				players: tournament.players,
				matches: tournament.matches,
			},
		});
	
	});

	fastify.get('/tournamentPlayers/:id', async (req, res) => {
		const { id: tournamentId } = req.params;
	
		if (!tournamentId) {
			return res.status(400).send({ error: 'Tournament ID is required' });
		}
	
		const tournamentObject = getTournament(tournamentId);
		if (!tournamentObject)
			return res.status(404).send({ error: 'No tournament found' });
	
		res.send(tournamentObject.players);
	});

	fastify.get('/isTournamentMatch/:id', async (req, res) => {
		const { id: matchId } = req.params;
	
		if (!matchId) {
			return res.status(400).send({ error: 'Match ID is required' });
		}
	
		const tournamentId = getTournamentIdByMatchId(matchId);
	
		if (tournamentId) {
			const tournamentObject = getTournament(tournamentId);
			res.send({ exists: true, tournamentObject});
		} else {
			res.send({ exists: false });
		}
	});

	fastify.patch('/updateTournamentWinner', async (req, res) => {
		const {  id: tournamentId, winner: nickName} = req.body;
	
		if (!nickName || !tournamentId ) {
			return res.status(400).send({ error: 'Nickname and TournamentID is required' });
		}
	
		const tournamentObject = getTournament(tournamentId);
	
		if (tournamentObject) {
			tournamentObject.recordMatchWinner(nickName);
		}
	});

	fastify.get('/tornamentSemiFinals', async (req, res) => {
		const { id: tournamentId} = req.params;
	
		if (!tournamentId ) {
			return res.status(400).send({ error: 'TournamentID is required' });
		}
	
		const tournamentObject = getTournament(tournamentId);

		if (!tournamentObject) {
			return res.status(404).send({ error: 'Tournament not found' });
		}
	
		return res.send({
			semifinal1Winner: tournamentObject?.semifinal1Winner,
			semifinal2Winner: tournamentObject?.semifinal2Winner,
		});
	});


}

function getTournamentIdByMatchId(matchId) {
	for (const [tournamentId, tournamentData] of tournaments.entries()) {
		if (tournamentData.matches.includes(matchId)) {
			return tournamentId;
		}
	}
	return null;
}