#!/usr/bin/env python3
"""편집기(.pages.yml)의 드롭다운 선택지를 데이터에서 자동으로 맞춥니다.

- 캐릭터의 '소속 작품' 선택지  <- data/works.json 의 작품 제목
- 작품의 '장르' 선택지         <- data/genres.json 의 장르 목록 (+ 작품에 이미 쓰인 장르)
.pages.yml 안의 `# sync:works` / `# sync:genres` 표시 사이만 다시 씁니다.
"""
import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent

def items(path):
    data = json.loads((root / path).read_text(encoding="utf-8"))
    return data["items"] if isinstance(data, dict) else data

def uniq(seq):
    seen, out = set(), []
    for s in seq:
        s = str(s).strip()
        if s and s not in seen:
            seen.add(s); out.append(s)
    return out

works = items("data/works.json")
titles = uniq(w.get("title", "") for w in works)
genres = uniq(g.get("name", "") for g in items("data/genres.json"))
used = []
for w in works:
    g = w.get("genre") or []
    used += g if isinstance(g, list) else re.split(r"\s*,\s*", str(g))
genres = uniq(genres + used)  # 이미 쓰인 장르가 선택지에서 빠지지 않게

def block(values, indent):
    pad = " " * indent
    lines = []
    for v in values:
        q = json.dumps(v, ensure_ascii=False)  # YAML 큰따옴표 문자열로도 유효
        lines.append(f"{pad}- value: {q}\n{pad}  label: {q}")
    return "\n".join(lines)

path = root / ".pages.yml"
text = path.read_text(encoding="utf-8")

def replace(text, key, values):
    pat = re.compile(r"(?P<head>^(?P<ind>[ ]*)# sync:%s[^\n]*\n)(?P<body>.*?)(?=^[ ]*# end sync:%s)" % (key, key), re.S | re.M)
    m = pat.search(text)
    if not m:
        sys.exit(f"'# sync:{key}' 표시를 .pages.yml에서 찾지 못했어요")
    body = block(values, len(m.group("ind"))) + "\n" if values else ""
    return text[:m.start("body")] + body + text[m.end("body"):]

new = replace(text, "works", titles)
new = replace(new, "genres", genres)
if new != text:
    path.write_text(new, encoding="utf-8")
    print("updated .pages.yml:", len(titles), "works,", len(genres), "genres")
else:
    print("no change")
