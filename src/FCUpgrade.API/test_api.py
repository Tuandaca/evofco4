import urllib.request
import re

req = urllib.request.Request('https://en.fifaaddict.com/fo4db', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Find ALL JS URLs
js_urls = re.findall(r'src=\"([^\"]+\.js)\"', html)
for js in js_urls:
    if 'fifaaddict' in js:
        print("JS URL:", js)
        try:
            req_js = urllib.request.Request(js if js.startswith('http') else 'https://en.fifaaddict.com' + js, headers={'User-Agent': 'Mozilla/5.0'})
            js_code = urllib.request.urlopen(req_js).read().decode('utf-8')
            apis = re.findall(r'[\'\"\/]([a-zA-Z0-9_\-\/\.]*api[a-zA-Z0-9_\-\/\.]*)', js_code)
            if apis:
                print("Found API in", js, ":", list(set(apis)))
            paths = re.findall(r'[\'\"](\/[a-zA-Z0-9_\-\/]+)[\'\"]', js_code)
            for p in paths:
                if 'api' in p or 'fo4db' in p or 'search' in p or 'player' in p:
                    print("Interesting path:", p)
        except Exception as e:
            print("Error loading", js, e)

