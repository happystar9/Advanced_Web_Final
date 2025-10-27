import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
import webbrowser


def search_youtube(api_key: str, query: str):
    base = "https://www.googleapis.com/youtube/v3/search"
    params = {
        'part': 'snippet',
        'type': 'video',
        'maxResults': '1',
        'q': query,
        'key': api_key,
    }
    url = base + '?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url) as resp:
        data = json.load(resp)
    items = data.get('items', [])
    if not items:
        return None
    item = items[0]
    vid = item.get('id', {}).get('videoId')
    return vid


def get_video_details(api_key: str, video_id: str):
    base = 'https://www.googleapis.com/youtube/v3/videos'
    params = {
        'part': 'snippet,contentDetails,statistics',
        'id': video_id,
        'key': api_key,
    }
    url = base + '?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url) as resp:
        data = json.load(resp)
    items = data.get('items', [])
    if not items:
        return None
    it = items[0]
    snippet = it.get('snippet', {})
    stats = it.get('statistics', {})
    content = it.get('contentDetails', {})
    return {
        'videoId': video_id,
        'title': snippet.get('title', '(unknown)'),
        'description': snippet.get('description', ''),
        'viewCount': stats.get('viewCount', '0'),
        'duration': content.get('duration', ''),
    }


def main(argv):
    parser = argparse.ArgumentParser(description='Find a YouTube video for a search query')
    parser.add_argument('query', nargs='*', help='Search query (defaults to "Work Together GTFO")')
    parser.add_argument('--open', action='store_true', dest='open', help='Open result in default browser')
    ns = parser.parse_args(argv)

    query = ' '.join(ns.query) if ns.query else 'Light Up Your Life Little Nightmares'
    open_in_browser = ns.open

    api_key = os.environ.get('YT_API_KEY')

    if api_key:
        try:
            vid = search_youtube(api_key, query)
            if vid:
                details = get_video_details(api_key, vid)
                if details:
                    print(f"Title       : {details['title']}")
                    print(f"Description : {details['description']}")
                    print(f"Views       : {details['viewCount']}")
                    print(f"Duration    : {details['duration']}")
                    url = f"https://youtu.be/{vid}"
                    print(f"Video       : {url}")
                    if open_in_browser:
                        webbrowser.open(url)
                    return 0
                else:
                    url = f"https://youtu.be/{vid}"
                    print(url)
                    if open_in_browser:
                        webbrowser.open(url)
                    return 0
            else:
                print('No video found via API. Falling back to search URL.')
        except Exception as e:
            print('YouTube API call failed:', e)
            print('Falling back to search URL.')

    search_url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(query)
    # Try to fetch the search results page and extract the first video id so we can return a specific video link
    try:
        with urllib.request.urlopen(search_url) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        # Look for the first occurrence of a watch?v=VIDEOID (video ids are 11 chars long)
        import re
        m = re.search(r"/watch\?v=([A-Za-z0-9_-]{11})", html)
        if m:
            vid = m.group(1)
            url = f"https://youtu.be/{vid}"
            print('Video (first search result):', url)
            if open_in_browser:
                webbrowser.open(url)
            return 0
        else:
            # fall back to printing the search URL
            print('Search URL:', search_url)
            if open_in_browser:
                webbrowser.open(search_url)
            return 0
    except Exception:
        # If fetching/parsing fails, fall back to printing the search URL
        print('Search URL:', search_url)
        if open_in_browser:
            webbrowser.open(search_url)
        return 0
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))