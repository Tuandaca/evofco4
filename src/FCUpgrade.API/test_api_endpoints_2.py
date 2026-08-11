import urllib.request

urls = [
    'https://en.fifaaddict.com/api/fo4/players',
    'https://en.fifaaddict.com/api/fo4db'
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req)
    content = res.read().decode('utf-8')
    print("URL:", url)
    print("Content-Type:", res.headers.get('Content-Type'))
    print("Length:", len(content))
    print("Snippet:", content[:200])
    print("-" * 50)
