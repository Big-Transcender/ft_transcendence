import { startPongWebSocket } from './gamePong';



interface TournamentPlayer {
    id: number;
    nickname: string;
}

interface TournamentMatch {
    id: string;
    player1: TournamentPlayer;
    player2: TournamentPlayer;
    winner?: TournamentPlayer;
    matchId?: string; // Pong game matchId
}

class Tournament {
    players: TournamentPlayer[] = [];
    rounds: TournamentMatch[][] = [];
    currentRound = 0;
    
    generateBracket() {
        // Create first round matches
        const firstRound: TournamentMatch[] = [];
        for (let i = 0; i < this.players.length; i += 2) {
            if (i + 1 < this.players.length) {
                firstRound.push({
                    id: `match-${i/2}`,
                    player1: this.players[i],
                    player2: this.players[i + 1]
                });
            }
        }
        this.rounds.push(firstRound);
    }
    
    startNextMatch(): TournamentMatch | null {
        const currentRoundMatches = this.rounds[this.currentRound];
        if (!currentRoundMatches) return null;
        
        // Find next unfinished match
        return currentRoundMatches.find(match => !match.winner) || null;
    }
    
    finishMatch(matchId: string, winner: TournamentPlayer) {
        const match = this.rounds[this.currentRound].find(m => m.id === matchId);
        if (match) {
            match.winner = winner;
            
            // Check if round is complete
            const roundComplete = this.rounds[this.currentRound].every(m => m.winner);
            if (roundComplete) {
                this.advanceToNextRound();
            }
        }
    }
    
    advanceToNextRound() {
        const winners = this.rounds[this.currentRound].map(m => m.winner!);
        
        if (winners.length === 1) {
            // Tournament complete!
            alert(`Tournament Complete! Winner: ${winners[0].nickname}`);
            return;
        }
        
        // Create next round
        const nextRound: TournamentMatch[] = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                nextRound.push({
                    id: `round${this.currentRound + 1}-match${i/2}`,
                    player1: winners[i],
                    player2: winners[i + 1]
                });
            }
        }
        
        this.rounds.push(nextRound);
        this.currentRound++;
        
        // Auto-start next match
        this.startNextTournamentMatch();
    }
    
    startNextTournamentMatch() {
        const nextMatch = this.startNextMatch();
        if (nextMatch) {
            // Generate Pong matchId
            const pongMatchId = `tournament-${Date.now()}-${Math.random()}`;
            nextMatch.matchId = pongMatchId;
            
            // Start Pong game
            alert(`Next Match: ${nextMatch.player1.nickname} vs ${nextMatch.player2.nickname}`);
            //changePageTo(joinedContestPage, pongGamePage);
            startPongWebSocket(pongMatchId, false, false, false); // multiplayer, no AI, no teams
            
            // Store tournament context
            (window as any).currentTournament = {
                tournament: this,
                currentMatch: nextMatch
            };
        }
    }
}

let currentTournament: Tournament | null = null;