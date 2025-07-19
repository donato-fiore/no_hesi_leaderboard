function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getPlayerName(player) {
    const members = player.team?.members || [];
    return members.length === 1 ? members[0].name : player.personaname || 'Unknown';
}

function getPlayerAvatar(player) {
    return player.avatarfull;
}

function getRankColor(rank) {
    switch (rank) {
        case 1:
            return '#dd0355';
        case 2:
            return '#d1cfd1';
        case 3:
            return '#ff8126';
        default:
            return '#363437';
    }
}

function getTextColor(rank) {
    if (rank > 3) return '#ffffff';
    return '#000000';
}

function createLeaderboardRow(player, rank) {
    const name = getPlayerName(player);
    const row = document.createElement('tr');
    getPlayerAvatar(player);

    row.innerHTML = `
        <td>
            <h6 style="background-color: ${getRankColor(rank)}; color: ${getTextColor(rank)};"># ${rank}</h6>
        </td>
        <td>
            <div class="player-cell">
                <img src="${getPlayerAvatar(player)}" alt="${name}'s avatar" class="avatar">
                <span>${name}</span>
            </div>
        </td>
        <td>${formatNumber(player.score)}</td>
        <td>${player.combo}x</td>
        <td style="text-transform: capitalize;">${player.car_model}</td>
        <td>${player.avg_speed} kmh</td>
        <td>${player.run_distance} km</td>
        <td>${player.run_time}</td>
    `;

    return row;
}

function renderLeaderboard(data) {
    const tableBody = document.querySelector('.leaderboard tbody');
    tableBody.innerHTML = ''; // Clear existing rows if any

    data.forEach((player, index) => {
        const row = createLeaderboardRow(player, index + 1);
        tableBody.appendChild(row);
    });
}

fetch('./data/top_500_solo.json')
    .then(response => response.json())
    .then(renderLeaderboard)
    .catch(error => console.error('Error fetching leaderboard data:', error));
