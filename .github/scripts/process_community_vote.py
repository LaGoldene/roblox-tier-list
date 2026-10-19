import hashlib
import json
import os
import re
import unicodedata

def slug(value):
    value = unicodedata.normalize("NFD", value.lower())
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")

with open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8") as f:
    event = json.load(f)
issue = event.get("issue", {})
body = issue.get("body") or ""
login = ((issue.get("user") or {}).get("login") or "").strip()
game_match = re.search(r"### Nom du jeu\s*\n+(.+?)(?=\n### |\Z)", body, re.S)
rank_match = re.search(r"### Rang proposé\s*\n+(.+?)(?=\n### |\Z)", body, re.S)
game = (game_match.group(1).strip() if game_match else "").strip()
rank = (rank_match.group(1).strip().upper() if rank_match else "").strip()
game_key = slug(game)
outcome = "invalid"

if game_key and login and rank in {"S", "A", "B", "C", "D"}:
    path = "community-votes.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    votes = data.get("votes", [])
    voter_hash = hashlib.sha256((login.casefold() + "|" + game_key).encode("utf-8")).hexdigest()
    if any(v.get("voterHash") == voter_hash and v.get("gameKey") == game_key for v in votes):
        outcome = "duplicate"
    else:
        votes.append({"gameKey": game_key, "rank": rank, "voterHash": voter_hash})
        data["votes"] = votes
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        outcome = "accepted"

with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
    f.write("outcome=" + outcome + "\n")
