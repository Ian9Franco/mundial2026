import re
import json
import random

# 1. Parse raw_wikipedia_module.txt to extract rankings and aliases
with open("scripts/raw_wikipedia_module.txt", "r", encoding="utf-8") as f:
    lua_content = f.read()

# Parse rankings
# Example: {  "Argentina", 1, 1, 1877.27 },
ranking_pattern = r'\{\s*"([^"]+)"\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([\d\.]+)\s*\}'
rankings_raw = re.findall(pattern=ranking_pattern, string=lua_content)

rankings = {}
for name, rank, change, points in rankings_raw:
    rankings[name] = {
        "rank": int(rank),
        "change": int(change),
        "points": float(points)
    }

print(f"Parsed {len(rankings)} team rankings.")

# Parse aliases to list of names for each code
# Example: { "ARG",  "Argentina" },
alias_pattern = r'\{\s*"([A-Z0-9_]{3})"\s*,\s*"([^"]+)"\s*\}'
aliases_raw = re.findall(pattern=alias_pattern, string=lua_content)

aliases = {}
for code, name in aliases_raw:
    if code not in aliases:
        aliases[code] = []
    if name not in aliases[code]:
        aliases[code].append(name)

print(f"Parsed {len(aliases)} aliases (with list of names).")

# Create 211 ranking JSON
ranking_211 = []
name_to_code = {}
for code, names in aliases.items():
    for name in names:
        if name not in name_to_code:
            name_to_code[name] = code

for name, info in rankings.items():
    code = name_to_code.get(name, name[:3].upper())
    ranking_211.append({
        "rank": info["rank"],
        "id": code,
        "team": name,
        "change": info["change"],
        "points": info["points"]
    })

# Save ranking_211.json
with open("data/ranking_211.json", "w", encoding="utf-8") as f:
    json.dump(ranking_211, f, indent=2, ensure_ascii=False)
print("Wrote data/ranking_211.json.")


# 2. Parse data/teams.ts to find the 48 WC teams and their group
with open("data/teams.ts", "r", encoding="utf-8") as f:
    teams_ts = f.read()

# Let's find TEAMS records
# Example: mex: { id: "mex", name: "México", flag: "mx", fifaRank: 20 },
team_def_pattern = r'(\w+):\s*\{\s*id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*flag:\s*"([^"]+)"\s*,\s*fifaRank:\s*(\d+)\s*\}'
teams_defs = re.findall(team_def_pattern, teams_ts)

wc_teams = {}
for key, tid, name, flag, fifaRank in teams_defs:
    wc_teams[tid] = {
        "id": tid.upper(),
        "nombre": name,
        "flag": flag,
        "fifaRank": int(fifaRank)
    }

print(f"Parsed {len(wc_teams)} teams from teams.ts.")

# Parse groups in teams.ts
group_def_pattern = r'id:\s*"([A-L])"\s*,\s*name:\s*"[^"]+"\s*,\s*teams:\s*\[([^\]]+)\]'
groups_defs = re.findall(group_def_pattern, teams_ts)

for gid, team_list_str in groups_defs:
    team_keys = re.findall(r'TEAMS\.(\w+)', team_list_str)
    for tk in team_keys:
        if tk in wc_teams:
            wc_teams[tk]["grupo"] = gid
        else:
            for tid, info in wc_teams.items():
                if tid.lower() == tk.lower():
                    info["grupo"] = gid
                    break

# Now associate with FIFA rankings
# We map code mismatches (e.g. ISO DZA to FIFA ALG)
code_mismatches = {
    "DZA": "ALG"
}

equipos_48 = []
for tid, info in wc_teams.items():
    code = info["id"]
    lookup_code = code_mismatches.get(code, code)
    
    # Look up in aliases list
    names_list = aliases.get(lookup_code, [])
    ranking_info = None
    matched_name = None
    
    for name in names_list:
        if name in rankings:
            ranking_info = rankings[name]
            matched_name = name
            break
            
    if not ranking_info:
        # Fallback search name_to_code matching lookup_code
        for name, r_info in rankings.items():
            if name_to_code.get(name) == lookup_code:
                ranking_info = r_info
                matched_name = name
                break
    
    if ranking_info:
        puntos_fifa = round(ranking_info["points"])
        change_val = ranking_info["change"]
        # recent form from -15 to +20: 5 + (change * 3) + random offset.
        forma = 5 + (change_val * 3) + random.randint(-5, 5)
        forma = max(-15, min(20, forma))
    else:
        print(f"Warning: ranking not found for {info['nombre']} ({code} / lookup {lookup_code})")
        puntos_fifa = 1400
        forma = random.randint(-5, 10)

    equipos_48.append({
        "id": code,
        "nombre": info["nombre"],
        "grupo": info.get("grupo", "A"),
        "puntos_fifa": puntos_fifa,
        "forma_reciente": forma
    })

# Sort by group then name
equipos_48.sort(key=lambda x: (x["grupo"], x["nombre"]))

# Write data/equipos.json
with open("data/equipos.json", "w", encoding="utf-8") as f:
    json.dump({"equipos": equipos_48}, f, indent=2, ensure_ascii=False)

print(f"Wrote data/equipos.json with {len(equipos_48)} teams.")
