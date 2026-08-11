import urllib.request
import re
import json

req = urllib.request.Request('https://en.fifaaddict.com/fo4db?page=1', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
m = re.search(r'window\.__NUXT__=(.+?);[\s]*</script>', html, re.DOTALL)
if m:
    js_code = m.group(1)
    # the js_code might not be valid JSON (it has unquoted keys, functions, etc)
    # Let's just do a regex count of how many items there are, or write a node.js script instead which can execute it!
    print("Found NUXT")
