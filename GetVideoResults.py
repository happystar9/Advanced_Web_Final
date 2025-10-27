import argparse
import sys
import urllib.parse
import urllib.request
import webbrowser
import re


def build_search_url(query: str):
    """Return the YouTube search results page URL for the query (shows all matching videos)."""
    return 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(query)


def main(argv):
    parser = argparse.ArgumentParser(description='Get YouTube search result links (GetVideoResults)')
    parser.add_argument('query', nargs='*', help='Search query (defaults to "Work Together GTFO")')
    parser.add_argument('-n', '--max', type=int, default=10, help='Maximum number of results to return (default: 10)')
    parser.add_argument('--open', action='store_true', dest='open', help='Open the first result in default browser')
    ns = parser.parse_args(argv)

    query = ' '.join(ns.query) if ns.query else 'Light Up Your Life Little Nightmares'

    # Return the search results page URL (this page shows all videos matching the query)
    search_url = build_search_url(query)
    print(search_url)
    if ns.open:
        webbrowser.open(search_url)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
