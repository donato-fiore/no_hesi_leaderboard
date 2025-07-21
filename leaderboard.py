import requests
import json
from datetime import datetime


def fetch_leaderboard(page=1, page_size=20):
    url = f"https://api.nohesi.gg/leaderboard?page={page}&pageSize={page_size}"
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()


def get_top_500_solo():
    solo_data = []
    page = 1

    while True:
        leaderboard_data = fetch_leaderboard(page=page, page_size=500)
        players = leaderboard_data.get("players", [])
        print(f"Processing page {page} with {len(players)} players")

        if not players:
            break

        solo_players = [
            player
            for player in players
            if len(player.get("team", {}).get("members", [])) <= 1 and player.get('prox_combo', 0) == 1
        ]
        solo_data.extend(solo_players)

        print(f"Found {len(solo_players)} solo players on page {page}")
        if len(solo_data) >= 500:
            break

        page += 1

    return solo_data[:500]


if __name__ == "__main__":
    try:
        leaderboard_data = fetch_leaderboard()
        top_500_solo = get_top_500_solo()
        last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        output = {"last_updated": last_updated, "players": top_500_solo}

        with open("top_500_solo.json", "w+") as f:
            json.dump(output, f, indent=4)

    except requests.RequestException as e:
        print(f"An error occurred: {e}")
