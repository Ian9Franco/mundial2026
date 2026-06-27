import os
import json
import urllib.request

# Raw URL of the international results dataset
RESULTS_URL = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv"
CSV_PATH = "scripts/results.csv"

def download_csv():
    print(f"Downloading results from {RESULTS_URL}...")
    try:
        urllib.request.urlretrieve(RESULTS_URL, CSV_PATH)
        print(f"Successfully downloaded results to {CSV_PATH}")
    except Exception as e:
        print(f"Error downloading CSV: {e}")
        raise e

def main():
    if not os.path.exists(CSV_PATH):
        download_csv()
    else:
        print("Using cached CSV file.")

    # Load 211 rankings
    with open("data/ranking_211.json", "r", encoding="utf-8") as f:
        ranking_211 = json.load(f)

    # Load 48 teams
    with open("data/equipos.json", "r", encoding="utf-8") as f:
        equipos_data = json.load(f)
        wc_team_ids = {eq["id"].upper() for eq in equipos_data["equipos"]}

    # Create name mappings
    name_to_id = {item["team"].lower(): item["id"].upper() for item in ranking_211}
    id_to_points = {item["id"].upper(): item["points"] for item in ranking_211}

    # Add custom mappings for name mismatches between CSV and Wikipedia/FIFA names
    name_mappings = {
        "united states": "USA",
        "usa": "USA",
        "us virgin islands": "VIR",
        "british virgin islands": "VGB",
        "dr congo": "COD",
        "congo dr": "COD",
        "congo": "CGO",
        "cape verde": "CPV",
        "cabo verde": "CPV",
        "ivory coast": "CIV",
        "côte d'ivoire": "CIV",
        "st. lucia": "LCA",
        "saint lucia": "LCA",
        "st. vincent and the grenadines": "VIN",
        "saint vincent and the grenadines": "VIN",
        "st. kitts and nevis": "KNA",
        "saint kitts and nevis": "KNA",
        "curacao": "CUW",
        "curaçao": "CUW",
        "czechia": "CZE",
        "czech republic": "CZE",
        "turkey": "TUR",
        "türkiye": "TUR",
        "eswatini": "SWZ",
        "swaziland": "SWZ",
        "kyrgyzstan": "KGZ",
        "kyrgyz republic": "KGZ",
        "timor-leste": "TLS",
        "east timor": "TLS",
        "brunei": "BRU",
        "brunei darussalam": "BRU",
        "chinesischer taipeh": "TPE",
        "taiwan": "TPE",
        "chinese taipei": "TPE",
        "macau": "MAC",
        "macao": "MAC",
    }

    def get_team_id(name):
        n_lower = name.lower()
        if n_lower in name_mappings:
            return name_mappings[n_lower]
        return name_to_id.get(n_lower)

    # Initialize stats for 48 teams
    stats = {}
    for tid in wc_team_ids:
        stats[tid] = {
            "played": 0,
            "won": 0,
            "drawn": 0,
            "lost": 0,
            "total_gd": 0,
            "opponent_points": [],
            "h2h": {}
        }

    print("Parsing matches...")
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    header = lines[0].strip().split(",")
    # date,home_team,away_team,home_score,away_score,tournament,city,country,neutral

    match_count = 0
    for line in lines[1:]:
        parts = line.strip().split(",")
        if len(parts) < 5:
            continue
        date = parts[0]
        home_team = parts[1]
        away_team = parts[2]
        home_score = parts[3]
        away_score = parts[4]

        # Filter dates: 2021-01-01 onwards
        if date < "2021-01-01":
            continue

        id_home = get_team_id(home_team)
        id_away = get_team_id(away_team)

        if not id_home or not id_away:
            continue

        try:
            hs = int(home_score)
            as_score = int(away_score)
        except ValueError:
            continue

        match_count += 1

        # Process Home Team
        if id_home in wc_team_ids:
            t_stats = stats[id_home]
            t_stats["played"] += 1
            t_stats["total_gd"] += (hs - as_score)
            
            # Opponent FIFA points
            opp_points = id_to_points.get(id_away, 1200.0)
            t_stats["opponent_points"].append(opp_points)

            # Match outcome
            if hs > as_score:
                t_stats["won"] += 1
            elif hs < as_score:
                t_stats["lost"] += 1
            else:
                t_stats["drawn"] += 1

            # Head-to-Head
            if id_away in wc_team_ids:
                h2h = t_stats["h2h"].setdefault(id_away, {"played": 0, "won": 0, "drawn": 0, "lost": 0})
                h2h["played"] += 1
                if hs > as_score:
                    h2h["won"] += 1
                elif hs < as_score:
                    h2h["lost"] += 1
                else:
                    h2h["drawn"] += 1

        # Process Away Team
        if id_away in wc_team_ids:
            t_stats = stats[id_away]
            t_stats["played"] += 1
            t_stats["total_gd"] += (as_score - hs)
            
            # Opponent FIFA points
            opp_points = id_to_points.get(id_home, 1200.0)
            t_stats["opponent_points"].append(opp_points)

            # Match outcome
            if as_score > hs:
                t_stats["won"] += 1
            elif as_score < hs:
                t_stats["lost"] += 1
            else:
                t_stats["drawn"] += 1

            # Head-to-Head
            if id_home in wc_team_ids:
                h2h = t_stats["h2h"].setdefault(id_home, {"played": 0, "won": 0, "drawn": 0, "lost": 0})
                h2h["played"] += 1
                if as_score > hs:
                    h2h["won"] += 1
                elif as_score < hs:
                    h2h["lost"] += 1
                else:
                    h2h["drawn"] += 1

    print(f"Processed {match_count} matches between 2021 and 2026.")

    # Calculate final output JSON
    output_data = {}
    for tid, t_stats in stats.items():
        played = t_stats["played"]
        if played > 0:
            win_rate = round(t_stats["won"] / played, 3)
            gd_average = round(t_stats["total_gd"] / played, 3)
            avg_opp_pts = sum(t_stats["opponent_points"]) / len(t_stats["opponent_points"])
            # Normalize SoS relative to 1400 points. Clamp to [0.5, 1.5]
            strength_of_schedule = round(max(0.5, min(1.5, avg_opp_pts / 1400.0)), 3)
        else:
            win_rate = 0.5
            gd_average = 0.0
            strength_of_schedule = 1.0

        output_data[tid] = {
            "win_rate": win_rate,
            "gd_average": gd_average,
            "strength_of_schedule": strength_of_schedule,
            "h2h": t_stats["h2h"]
        }

    # Write output to data/historial_equipos.json
    with open("data/historial_equipos.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print("Successfully generated data/historial_equipos.json")

if __name__ == "__main__":
    main()
