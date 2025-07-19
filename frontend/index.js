function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

fetch('./data/top_500_solo.json')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('.leaderboard tbody');
        let rank = 1;
        data.forEach(player => {
            const row = document.createElement('tr');

            var name;
            if (player.team.members.length == 1) {
                name = player.team.members[0].name;
            } else {
                name = player.personaname;
            }

            row.innerHTML = `
                <td>${rank}</td>
                <td>${name}</td>
                <td>${formatNumber(player.score)}</td>
                <td>${player.combo}x</td>
                <td style='text-transform: capitalize;'>${player.car_model}</td>
                <td>${player.avg_speed} kmh</td>
                <td>${player.run_distance} km</td>
                <td>${player.run_time}</td>
            `;
            rank++;
            tableBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching leaderboard data:', error));
