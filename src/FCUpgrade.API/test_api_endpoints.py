import urllib.request
import urllib.error

urls = [
    'https://en.fifaaddict.com/api/fo4/players',
    'https://en.fifaaddict.com/api2/fo4db',
    'https://en.fifaaddict.com/api/fo4db'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(url, res.getcode())
    except urllib.error.HTTPError as e:
        print(url, e.code)
    except Exception as e:
        print(url, e)

