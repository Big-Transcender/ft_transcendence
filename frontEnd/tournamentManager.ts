var isOnTournamentPage = true;


window.addEventListener("TournamentMatch", async (event: CustomEvent) => {
	const { Tournament } = event.detail;


	handleNextFase(Tournament);
});

async function handleNextFase(Tournament: any) {
	try {
		isOnTournamentPage = true;

		if (Tournament.currentMatchIndex === 3) {
			openVictory(`You win the Tournament! <br>The Great ${Tournament.Winner}!`) 
			await waitForEvent("next");
			navigate("home");
			location.reload();
			return;
		}
		
		history.replaceState(undefined, "", `#contest`);
		changePageTo(pongContestPage, joinedContestPage);
		await waitForSemifinalsToComplete(Tournament);

		if (!isOnTournamentPage) {

            return;
        }

		setTimeout(() => {
			history.replaceState(undefined, "", `#pong/${Tournament.matches[2]}`);
			changePageTo(joinedContestPage, pongContestPage);
			startPongWebSocket(Tournament.matches[2]);
		}, 250);

	} catch (error) {
		console.error("Error handling next phase:", error);
	}
}

// Listen for tournament match end events
window.addEventListener("MatchEnd", (event: CustomEvent) => {
	const { matchId, winner, isLocal } = event.detail;
	if (isLocal) {

		handleLocalMatchEnd(matchId, winner);
		return;
	}
	handleMatchEnd(matchId, winner);
});

async function handleMatchEnd(currentMatchId: string, winner: string) {
	try {
		const token = getCookie("token");

		const nick = await getNickOnLocalStorage();

		if (nick != winner) {
			navigate("home");
			location.reload();
			return;
		}

		const response = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`Failed to check tournament match: ${response.statusText}`);
		}



		const tournament = await response.json();
		if (!tournament.exists) {
			navigate("home");
			location.reload();
			return;
		}
		


		const updateResponse = await fetch(`${backendUrl}/updateTournamentWinner`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify({ id: tournament.tournamentObject.tournamentID, winner, currentMatchId }),
		});

		if (!updateResponse.ok) {
			throw new Error(`Failed to update tournament winner: ${updateResponse.statusText}`);
		}

		const updatedResponse = await fetch(`${backendUrl}/isTournamentMatch/${currentMatchId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			credentials: "include",
		});
		if (!updatedResponse.ok) {
			throw new Error(`Failed to get updated tournament: ${updatedResponse.statusText}`);
		}

		const updatedTournament = await updatedResponse.json();
		window.dispatchEvent(
			new CustomEvent("TournamentMatch", {
				detail: { Tournament: updatedTournament.tournamentObject },
			})
		);


	} catch (error) {
		console.error("Error handling match end:", error);
	}
}

async function handleLocalMatchEnd(matchId: string, winner: string) {
	var tournament = findTournamentByMatch(matchId);
	if (!tournament) {
		navigate("home");
		location.reload();
		return;
	}

	if (tournament.currentMatchIndex === 0) {
		tournament.semifinal1 = winner;
		tournament.currentMatchIndex++;
		setTimeout(() => {
			history.replaceState(undefined, "", `#pong/${tournament.matches[1]}`);
			changePageTo(joinedContestPage, pongContestPage);
			startPongWebSocket(tournament.matches[1], true, false, false, [tournament.players[2], tournament.players[3]]);
			animateTimer();
			setGameScore(tournament.players[2], tournament.players[3]);
			resetEmotions();
		}, 125);
	} 
	else if (tournament.currentMatchIndex === 1) {
		tournament.semifinal2 = winner;
		tournament.currentMatchIndex++;
		setTimeout(() => {

			history.replaceState(undefined, "", `#pong/${tournament.matches[2]}`);
			changePageTo(joinedContestPage, pongContestPage);
			startPongWebSocket(tournament.matches[2], true, false, false, [tournament.semifinal1, tournament.semifinal2]);
			animateTimer();
			setGameScore(tournament.semifinal1, tournament.semifinal2);
			resetEmotions();
		}, 125);
	}
	else if (tournament.currentMatchIndex === 2) {
		tournament.Winner = winner;
		openVictory(`You win the Tournament! <br>The Great ${winner}!`) 
		await waitForEvent("next");
		navigate("home");
		location.reload();
	} else {
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

async function waitForSemifinalsToComplete(Tournament: any) {
	
	const playerPlaces = document.querySelectorAll(".playerContestPlace");
	updateBrackets(playerPlaces, [Tournament.semifinal1Winner, Tournament.semifinal2Winner]);
	
	while (true) {

		await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

		const data = await getTournamentData(Tournament.tournamentID);



		updateBrackets(playerPlaces, [data.semifinal1Winner, data.semifinal2Winner]);

		if (data.semifinal1Winner && data.semifinal2Winner) {
			updateBrackets(playerPlaces, [data.semifinal1Winner, data.semifinal2Winner]);
			return ;
		}
	}
}

function updateBrackets(playerPlaces: NodeListOf<Element>, tournamentPlayers: string[]) {

	if (tournamentPlayers[0]) {
		const playerName = playerPlaces[4].querySelector(".playerContestPlaceName");
		const playerBG = playerPlaces[4].querySelector(".playerContestPlaceBG");
		playerName.textContent = tournamentPlayers[0];
		playerBG.classList.remove("noGame");
	}

	if (tournamentPlayers[1]) {
		const playerName = playerPlaces[5].querySelector(".playerContestPlaceName");
		const playerBG = playerPlaces[5].querySelector(".playerContestPlaceBG");
		playerName.textContent = tournamentPlayers[1];
		playerBG.classList.remove("noGame");
	}
}


