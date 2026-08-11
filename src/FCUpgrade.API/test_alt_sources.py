import urllib.request
import json

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.getcode(), response.read().decode('utf-8')[:500]
    except Exception as e:
        return str(e), None

print("FO4Player.com:", fetch_url('https://fo4player.com'))
print("Garena VN:", fetch_url('https://fconline.garena.vn/'))
print("Nexon KR:", fetch_url('https://fconline.nexon.com/datacenter/PlayerList'))
