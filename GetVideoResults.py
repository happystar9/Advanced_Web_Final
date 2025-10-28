import argparse
import os
import sys
import webbrowser
from typing import List

import requests

# If a .env file exists, load it so users can put YT_API_KEY there.
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # python-dotenv is optional; if not installed the env var must be set externally
    pass


def build_video_url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"


def search_youtube(query: str, api_key: str, max_results: int = 10) -> List[dict]:
    """Call YouTube Data API v3 search.list and return list of items.

    Each returned dict contains at least: videoId, title, channelTitle
    """
    if max_results <= 0:
        return []
    # The API caps maxResults at 50 per request.
    max_results = min(max_results, 50)
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": api_key,
    }
    r = requests.get(url, params=params, timeout=15)
    r.raise_for_status()
    data = r.json()
    items = []
    for it in data.get("items", []):
        vid = it.get("id", {}).get("videoId")
        snip = it.get("snippet", {})
        if not vid:
            continue
        items.append({
            "videoId": vid,
            "title": snip.get("title"),
            "channelTitle": snip.get("channelTitle"),
        })
    return items


def main(argv):
    parser = argparse.ArgumentParser(description="Get YouTube search result links (GetVideoResults)")
    parser.add_argument("query", nargs="*", help="Search query (defaults to 'Light Up Your Life Little Nightmares')")
    parser.add_argument("-n", "--max", type=int, default=10, help="Maximum number of results to return (default: 10)")
    parser.add_argument("--open", action="store_true", dest="open", help="Open the first result in default browser")
    parser.add_argument("--api-key", help="YouTube Data API key. If omitted, reads YT_API_KEY env var.")
    ns = parser.parse_args(argv)

    query = " ".join(ns.query) if ns.query else "Light Up Your Life Little Nightmares"
    api_key = ns.api_key or os.environ.get("YT_API_KEY")
    if not api_key:
        print("ERROR: You must provide a YouTube API key via --api-key or the YT_API_KEY environment variable.")
        print("See https://console.cloud.google.com/apis/credentials to create/restrict an API key.")
        return 2

    try:
        items = search_youtube(query, api_key, ns.max)
    except requests.HTTPError as e:
        print(f"YouTube API request failed: {e}")
        try:
            print(e.response.json())
        except Exception:
            pass
        return 3
    except Exception as e:
        print(f"Error calling YouTube API: {e}")
        return 4

    if not items:
        print("No videos found.")
        return 0

    # Print results: title — url
    for it in items:
        url = build_video_url(it["videoId"])
        title = it.get("title") or "(no title)"
        ch = it.get("channelTitle") or ""
        print(f"{title} — {ch} — {url}")

    if ns.open:
        first = items[0]
        webbrowser.open(build_video_url(first["videoId"]))

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
