
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "games.json"

# Requêtes pour chercher des jeux dans plusieurs genres.
SEARCHES = {
    "anime": [
        "anime", "blox fruits", "anime tower defense", "anime battlegrounds",
        "anime simulator", "anime fighting", "anime adventures",
    ],
    "horreur": [
        "horror", "doors", "survival horror", "scary games",
        "the mimic", "survive the killer", "horror story",
    ],
    "simulateur": [
        "simulator", "pet simulator", "farming", "clicker simulator",
        "fishing simulator", "vehicle simulator", "mining simulator",
    ],
    "tycoon": [
        "tycoon", "restaurant tycoon", "retail tycoon", "theme park tycoon",
        "pizza place", "mall tycoon", "factory tycoon",
    ],
    "rp": [
        "roleplay", "brookhaven", "adopt me", "bloxburg",
        "life simulation", "school roleplay", "city roleplay",
    ],
    "survie": [
        "survival", "99 nights in the forest", "natural disaster survival",
        "zombie survival", "camping survival", "island survival",
    ],
    "fps": [
        "fps", "shooter", "arsenal", "gunfight arena",
        "paintball", "military shooter",
    ],
    "combat": [
        "fighting", "battlegrounds", "the strongest battlegrounds",
        "boxing", "sword fighting", "martial arts",
    ],
    "obby": [
        "obby", "parkour", "tower of hell", "mega fun obby",
        "escape obby", "obby challenge",
    ],
    "course": [
        "racing", "car racing", "driving simulator",
        "motorcycle racing", "kart racing",
    ],
    "sport": [
        "football", "basketball", "volleyball", "soccer",
        "sports game", "tennis",
    ],
    "aventure": [
        "adventure", "open world", "dungeon adventure",
        "quest adventure", "exploration game", "story adventure",
    ],
    "strategie": [
        "tower defense", "strategy", "war tycoon",
        "base defense", "chess", "strategy battle",
    ],
    "amis": [
        "party games", "multiplayer", "minigames",
        "hide and seek", "social hangout", "playing with friends",
    ],
    "autres": [
        "popular games", "trending games", "arcade games",
        "music games", "fashion games", "building games",
    ],
}

SESSION_ID = str(uuid.uuid4())


def fetch_search(term, attempts=3):
    params = urllib.parse.urlencode({
        "searchQuery": term,
        "sessionId": SESSION_ID,
        "pageType": "all",
    })
    url = "https://apis.roblox.com/search-api/omni-search?" + params
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; RobloxTierListCatalog/1.0)",
            "Accept": "application/json",
        }
    )

    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            retryable = exc.code == 429 or exc.code in (500, 502, 503, 504)
            if not retryable or attempt == attempts - 1:
                raise

            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            try:
                delay = float(retry_after) if retry_after else 2 * (2 ** attempt)
            except (TypeError, ValueError):
                delay = 2 * (2 ** attempt)
            delay = max(1, min(delay, 20))
            print(
                f"  HTTP {exc.code} pour '{term}' ; "
                f"nouvel essai dans {delay:.0f} seconde(s) "
                f"({attempt + 2}/{attempts})."
            )
            time.sleep(delay)
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == attempts - 1:
                raise
            delay = 4 * (2 ** attempt)
            print(
                f"  Erreur réseau pour '{term}' : {exc} ; "
                f"nouvel essai dans {delay} seconde(s) "
                f"({attempt + 2}/{attempts})."
            )
            time.sleep(delay)

    raise RuntimeError(f"Échec de la recherche Roblox : {term}")


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



THUMBNAILS_OUTPUT = ROOT / "thumbnails.json"
APP_JS = ROOT / "app.js"


def load_existing_thumbnails():
    if not THUMBNAILS_OUTPUT.exists():
        return {}
    try:
        data = json.loads(THUMBNAILS_OUTPUT.read_text(encoding="utf-8"))
        thumbnails = data.get("thumbnails", {}) if isinstance(data, dict) else {}
        return thumbnails if isinstance(thumbnails, dict) else {}
    except (OSError, json.JSONDecodeError):
        print("ATTENTION : thumbnails.json est illisible ; les miniatures seront régénérées.")
        return {}


def all_place_ids(games):
    ids = set()
    for game in games:
        if not isinstance(game, dict):
            continue
        try:
            place_id = int(game.get("placeId") or 0)
        except (TypeError, ValueError):
            place_id = 0
        if place_id > 0:
            ids.add(place_id)

    # Les jeux codés directement dans app.js ne sont pas tous dans games.json.
    if APP_JS.exists():
        app_text = APP_JS.read_text(encoding="utf-8")
        pattern = re.compile(
            r'\bG\(\s*"[^"]+"\s*,\s*"[^"]*"\s*,\s*"[^"]*"'
            r'\s*,\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*(\d+)'
        )
        ids.update(int(match.group(1)) for match in pattern.finditer(app_text))
    return sorted(ids)


def fetch_icon_batch(place_ids, attempts=3):
    params = urllib.parse.urlencode({
        "placeIds": ",".join(str(value) for value in place_ids),
        "size": "512x512",
        "format": "Png",
        "isCircular": "false",
    })
    url = "https://thumbnails.roblox.com/v1/places/gameicons?" + params
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; RobloxTierListCatalog/1.0)",
            "Accept": "application/json",
        },
    )
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                payload = json.loads(response.read().decode("utf-8"))
            found = {}
            for item in payload.get("data", []):
                place_id = item.get("targetId")
                image_url = item.get("imageUrl")
                if place_id and image_url:
                    found[str(place_id)] = image_url
            return found
        except urllib.error.HTTPError as exc:
            retryable = exc.code == 429 or exc.code in (500, 502, 503, 504)
            if not retryable or attempt == attempts - 1:
                raise
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            try:
                delay = float(retry_after) if retry_after else 3 * (attempt + 1)
            except (TypeError, ValueError):
                delay = 3 * (attempt + 1)
            delay = max(1, min(delay, 20))
            print(f"  Miniatures HTTP {exc.code} ; nouvel essai dans {delay:.0f}s.")
            time.sleep(delay)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt == attempts - 1:
                raise
            delay = 2 * (attempt + 1)
            print(f"  Erreur miniatures : {exc} ; nouvel essai dans {delay}s.")
            time.sleep(delay)
    return {}


def update_thumbnails(games):
    thumbnails = load_existing_thumbnails()
    place_ids = all_place_ids(games)
    print(f"Préparation des miniatures pour {len(place_ids)} jeux...")
    errors = 0
    for offset in range(0, len(place_ids), 50):
        batch = place_ids[offset:offset + 50]
        try:
            thumbnails.update(fetch_icon_batch(batch))
            print(f"  Miniatures : {min(offset + len(batch), len(place_ids))}/{len(place_ids)}")
        except Exception as exc:
            errors += 1
            print(f"  Lot de miniatures ignoré : {exc}")
        time.sleep(1)

    result = {
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(thumbnails),
        "thumbnails": thumbnails,
    }
    temp = THUMBNAILS_OUTPUT.with_suffix(".json.tmp")
    temp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(THUMBNAILS_OUTPUT)
    print(f"Miniatures disponibles : {len(thumbnails)} ; lots en erreur : {errors}")

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

            # Réduit la fréquence des requêtes pour limiter les HTTP 429.
            time.sleep(3)

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
    update_thumbnails(list(merged.values()))


if __name__ == "__main__":
    main()

