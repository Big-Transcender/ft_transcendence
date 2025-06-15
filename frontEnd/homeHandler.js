fetch("http://localhost:3000/leaderBoard")
    .then((response) => response.json())
    .then((data) => {
    const table = document.getElementById("playerRankListId");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    console.log(data);
    const topPlayers = data.sort((a, b) => b.wins - a.wins).slice(0, 5);
    // Insert new rows
    topPlayers.forEach((player, index) => {
        const row = table.insertRow();
        row.insertCell().textContent = index + 1; // Position
        row.insertCell().textContent = player.nickname; // Nick
        row.insertCell().textContent = player.wins; // Wins
    });
})
    .catch((error) => {
    console.error("Failed to load leaderboard:", error);
});
