
import json
import os
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "games.json"

# Requêtes pour chercher des jeux dans plusieurs genres.
SEARCHES = {
    "anime": ["anime", "blox fruits", "anime tower defense"],
    "horreur": ["horror", "doors", "survival horror"],
    "simulateur": ["simulator", "pet simulator", "farming"],
    "tycoon": ["tycoon", "restaurant tycoon"],
    "rp": ["roleplay", "brookhaven", "adopt me"],
    "survie": ["survival", "99 nights in the forest"],
    "fps": ["fps", "shooter"],
    "combat": ["fighting", "battlegrounds"],
    "obby": ["obby", "parkour"],
    "course": ["racing", "car racing"],
    "sport": ["football", "basketball"],
    "aventure": ["adventure", "open world"],
    "strategie": ["tower defense", "strategy"],
    "amis": ["party games", "multiplayer"],
    "autres": ["popular games", "trending games"],
}

SESSION_ID = str(uuid.uuid4())


def fetch_search(term):
    params = urllib.parse.urlencode({
        "searchQuery": term,
        "sessionId": SESSION_ID,
        "pageType": "all",
    })
    url = "https://apis.roblox.com/search-api/omni-search?" + params
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def find_games(data, category):
    """Cherche prudemment les résultats de jeux dans la réponse JSON."""
    found = []

    def walk(value):
        if isinstance(value, dict):
            name = value.get("name") or value.get("title")
            place_id = value.get("rootPlaceId") or value.get("placeId")

            if (
                isinstance(name, str)
                and isinstance(place_id, (int, str))
                and str(place_id).isdigit()
                and int(place_id) > 0
            ):
                found.append({
                    "id": "imported-" + str(place_id),
                    "name": name.strip(),
                    "cat": category,
                    "genre": category,
                    "rank": "none",
                    "placeId": int(place_id),
                    "desc": "Jeu importé automatiquement depuis les résultats de recherche Roblox.",
                    "pros": [],
                    "cons": [],
                    "codes": [],
                    "source": "Roblox Search",
                })

            for child in value.values():
                walk(child)

        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    return found


def load_existing():
    if not OUTPUT.exists():
        return []

    try:
        data = json.loads(OUTPUT.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and isinstance(data.get("games"), list):
            return data["games"]
    except (OSError, json.JSONDecodeError):
        print("ATTENTION : games.json existant est illisible.")
        raise

    raise ValueError("Format inattendu dans games.json : aucune donnée remplacée.")


def main():
    existing = load_existing()
    merged = {}
    
    # Les jeux déjà présents sont conservés en priorité.
    for game in existing:
        if not isinstance(game, dict):
            continue
        key = str(game.get("placeId") or game.get("id") or game.get("name", "")).lower()
        if key:
            merged[key] = game

    imported_count = 0
    errors = 0

    for category, terms in SEARCHES.items():
        for term in terms:
            try:
                data = fetch_search(term)
                results = find_games(data, category)

                for game in results:
                    key = str(game["placeId"])
                    if key not in merged:
                        merged[key] = game
                        imported_count += 1

                print(f"{term}: {len(results)} résultat(s)")
            except Exception as exc:
                errors += 1
                print(f"Recherche échouée pour '{term}': {exc}")

            # Réduit la fréquence des requêtes.
            time.sleep(2)

    # Ne jamais remplacer le catalogue si toutes les recherches échouent.
    if imported_count == 0 and errors == sum(
        len(terms) for terms in SEARCHES.values()
    ):
        raise RuntimeError(
            "Toutes les recherches ont échoué. games.json est conservé."
        )

    result = {
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(merged),
        "games": list(merged.values()),
    }

    temp = OUTPUT.with_suffix(".json.tmp")
    temp.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temp.replace(OUTPUT)

    print(f"Import terminé : {imported_count} nouveau(x) jeu(x).")
    print(f"Total dans games.json : {len(merged)}")
    print(f"Recherches en erreur : {errors}")


if __name__ == "__main__":
    main()

