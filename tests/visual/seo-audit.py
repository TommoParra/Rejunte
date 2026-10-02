import json, os, re, ssl, urllib.request
ctx = ssl._create_unverified_context()
base = os.environ.get('REJUNTE_URL', 'https://rejunte.local:8890').rstrip('/')
def get(path):
    req = urllib.request.Request(base + path, headers={'User-Agent': 'Mozilla/5.0 audit'})
    try:
        r = urllib.request.urlopen(req, context=ctx)
        return r.status, r.read().decode('utf-8', 'replace'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), dict(e.headers)
pages = ['/', '/vitrina/', '/la-tanda/', '/encargos/', '/el-taller/', '/producto/alfajores-de-maicena/', '/producto/caja-de-alfajores/', '/categoria/tortas/', '/carrito/', '/finalizar-compra/', '/mi-cuenta/', '/?s=torta', '/no-existe/']
for p in pages:
    status, html, headers = get(p)
    if status in (301, 302):
        print(f'{p} → {status} {headers.get("Location","")[:60]}'); continue
    head = html[:html.find('</head>')]
    title = re.search(r'<title>(.*?)</title>', head, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', head)
    canon = re.findall(r"<link rel=['\"]canonical['\"] href=['\"]([^'\"]+)", head)
    robots = re.search(r"<meta name=['\"]robots['\"] content=['\"]([^'\"]+)", head)
    h1 = re.findall(r'<h1\b', html)
    imgs = re.findall(r'<img\b[^>]*>', html)
    noalt = [i for i in imgs if not re.search(r'\balt=', i)]
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', head, re.S)
    types = []
    if ld:
        g = json.loads(ld.group(1))['@graph']
        types = [n['@type'] for n in g]
    print(f'{p} [{status}] title="{title.group(1).strip() if title else None}" | desc={len(desc.group(1)) if desc else 0}ch | canonical={len(canon)} | robots={robots.group(1) if robots else "-"} | h1={len(h1)} | imgs={len(imgs)} no-alt={len(noalt)} | ld={types}')
status, xml, _ = get('/wp-sitemap.xml'); print('sitemap index:', re.findall(r'<loc>([^<]+)</loc>', xml))
for sm in re.findall(r'<loc>([^<]+)</loc>', xml):
    s2, x2, _ = get(sm.replace(base, ''))
    print('  ', sm.replace(base, ''), len(re.findall(r'<loc>', x2)), 'urls', [u.replace(base, '') for u in re.findall(r'<loc>([^<]+)</loc>', x2)][:12])
