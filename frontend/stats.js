const cars = {};
const inputs = {};
const maps = {};
const teamSizes = {};

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

function createTableSection(title, data, formatter = name => name) {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Label</th><th>Count</th><th>%</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.forEach(({ name, count, percentage }) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatter(name)}</td>
            <td>${count}</td>
            <td>${percentage}%</td>
        `;
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

        players.forEach(player => {
            addCount(cars, player.car_model);
            addCount(inputs, player.input);
            addCount(maps, player.map);
            const teamSize = getTeamSize(player);
            addCount(teamSizes, teamSize);
        });

        leftPane.appendChild(createTableSection("Cars", sortAndFormat(cars), name => name?.toUpperCase() || "Unknown"));

        rightPane.appendChild(createTableSection("Inputs", sortAndFormat(inputs), name => name?.toUpperCase() || "Unknown"));
        rightPane.appendChild(createTableSection("Maps", sortAndFormat(maps), name => name || "Unknown"));
        rightPane.appendChild(createTableSection("Team Sizes", sortAndFormat(teamSizes), size => sizeString(parseInt(size))));


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
