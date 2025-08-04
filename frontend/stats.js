const cars = {};
const inputs = {};
const maps = {};
const teamSizes = {};
const topMapRuns = {};

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getPlayerName(player) {
    const members = player.team?.members || [];
    if (members.length > 1) {
        return members.map(member => member.name).join(", ");
    }
    return members[0]?.name || player.personaname || 'Unknown';
}

function addCount(obj, key) {
    if (!key) return;
    if (!obj[key]) obj[key] = 0;
    obj[key]++;
}

function getTeamSize(player) {
    const members = player.team?.members;
    if (!members || (members.length <= 1 && player.prox_combo === 1)) {
        return 1;
    }
    return members.length;
}

function sizeString(size) {
    switch (size) {
        case 1: return "Solo";
        case 2: return "Duo";
        case 3: return "Trio";
        case 4: return "Quad";
        default: return `${size} players`;
    }
}

function sortAndFormat(obj) {
    const total = Object.values(obj).reduce((a, b) => a + b, 0);
    return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
            name,
            count,
            percentage: ((count / total) * 100).toFixed(1)
        }));
}

function createTableSection(title, data, formatter = name => name, headers = []) {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);

    const table = document.createElement("table");
    table.className = `${title.toLowerCase().replace(/\s+/g, '-')}-table`;

    // Create table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    data.forEach(rowData => {
        const row = document.createElement("tr");

        headers.forEach((header, index) => {
            const td = document.createElement("td");

            let key = Object.keys(rowData)[index];
            let value = rowData[key];

            // Apply formatter to the first column only
            td.textContent = (index === 0) ? formatter(value) : value;

            // If the header is literally '%' or ends with '%', add it
            if (typeof value === 'string' && (header === "%" || header.endsWith("%"))) {
                td.textContent += "%";
            }

            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    return section;
}


async function loadStats() {
    const leftPane = document.getElementById("left-pane");
    const rightPane = document.getElementById("right-pane");

    try {
        const res = await fetch("./data/leaderboard.json");
        const data = await res.json();
        const players = data.players || [];

        var i = 0;
        players.forEach(player => {
            addCount(cars, player.car_model);
            addCount(inputs, player.input);
            addCount(maps, player.map);
            const teamSize = getTeamSize(player);
            addCount(teamSizes, teamSize);

            if (topMapRuns[player.map]) {
                if (player.score > topMapRuns[player.map].score) {
                    topMapRuns[player.map] = {
                        place: 1,
                        score: player.score,
                        player: getPlayerName(player)
                    };
                } else if (player.score === topMapRuns[player.map].score) {
                    topMapRuns[player.map].place++;
                }
            } else {
                topMapRuns[player.map] = {
                    place: i + 1,
                    score: player.score,
                    player: getPlayerName(player)
                };
            }

            i++;
        });
        const defaultHeaders = ["Label", "Count", "%"];

        leftPane.appendChild(createTableSection("Cars", sortAndFormat(cars), name => name?.toUpperCase() || "Unknown", defaultHeaders));

        rightPane.appendChild(createTableSection("Inputs", sortAndFormat(inputs), name => name?.toUpperCase() || "Unknown", defaultHeaders));
        rightPane.appendChild(createTableSection("Maps", sortAndFormat(maps), name => name || "Unknown", defaultHeaders));
        rightPane.appendChild(createTableSection("Team Sizes", sortAndFormat(teamSizes), size => sizeString(parseInt(size)), defaultHeaders));

        const topRunsFormatted = Object.entries(topMapRuns)
            .sort((a, b) => b[1].score - a[1].score)
            .map(([map, data]) => ({
                name: map,
                place: data.place,
                count: formatNumber(data.score),
                percentage: data.player
            }));

        const topRunHeaders = ["Map", "Place", "Score", "Player(s)"];
        rightPane.appendChild(createTableSection("Top Run Per Map", topRunsFormatted, name => name || "Unknown", topRunHeaders));


        updateLastUpdated(data?.last_updated);
    } catch (err) {
        leftPane.innerHTML = `<p style="color:red;">Error loading data: ${err.message}</p>`;
    }
}

function updateLastUpdated(dateStr) {
    const el = document.getElementById("last-updated");
    if (!dateStr) {
        el.textContent = "Unknown";
        return;
    }
    const date = new Date(dateStr);
    el.textContent = date.toLocaleString();
}

document.addEventListener("DOMContentLoaded", loadStats);
