# https://api.nohesi.gg/leaderboard?page=1&pageSize=20

import requests

"""
{
      "score": 165377657794,
      "steamid": "76561199198428731",
      "input": "Steering Wheel",
      "combo": "36195.0",
      "avg_speed": "194",
      "run_time": "00:25:00",
      "run_distance": "81.0",
      "car_model": "toyota supra mk4",
      "server": "45.88.230.80:13355",
      "map": "No Hesi 110",
      "lives_left": 1,
      "team": {
        "members": [
          {
            "name": "e98k",
            "steamId": "76561198859122719",
            "website_name": "ejkxm",
            "avatar_url": "https://cdn.discordapp.com/avatars/219588129575665674/0d7449172235311ea2025bf446c0b975"
          },
          {
            "name": "onito4018",
            "steamId": "76561199198428731",
            "website_name": "onito",
            "avatar_url": "https://cdn.discordapp.com/avatars/796044780898615368/472b4a7970cb57e272a58d80578b6e27"
          },
          {
            "name": "ahoodie6004",
            "steamId": "76561199581445924",
            "website_name": "ahoodieszn",
            "avatar_url": "https://cdn.discordapp.com/avatars/920505735689961552/157e517cdbf371a47aaead44675714a3"
          },
          {
            "name": "anth0ny_7",
            "steamId": "76561199229713748",
            "website_name": "anthony7",
            "avatar_url": "https://cdn.discordapp.com/avatars/918513314013798411/c6334d53ae8b56210f2fa15c1ff5d87b"
          }
        ]
      },
      "prox_time": 1498,
      "prox_combo": 11,
      "cars_passed": 1140,
      "traffic_type": null,
      "label": "No Hesi",
      "server_title": null
    },
    
"""

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
        players = leaderboard_data.get('players', [])
        print(f"Processing page {page} with {len(players)} players")
        
        if not players:
            break
        
        solo_players = [player for player in players if len(player.get('team', {}).get('members', [])) == 1]
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

        with open('top_500_solo.json', 'w+') as f:
            import json
            json.dump(top_500_solo, f, indent=4)

        # print(len(top_500_solo), "solo players in top 500")
    except requests.RequestException as e:
        print(f"An error occurred: {e}")