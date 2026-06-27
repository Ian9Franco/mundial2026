import urllib.request

url = "https://en.wikipedia.org/w/index.php?title=Module:SportsRankings/data/FIFA_World_Rankings&action=raw"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
    print("Success! Raw module length:", len(content))
    # Write a chunk to see what it contains
    print(content[:1500])
    with open("scripts/raw_wikipedia_module.txt", "w", encoding="utf-8") as f:
        f.write(content)
except Exception as e:
    print("Error:", e)
