# -*- coding: utf-8 -*-
import re, itertools, shutil, subprocess
from pathlib import Path

HTML = Path("index.html")
BACKUP = Path("index.html.bak")

# Romanian diacritics (lower + upper)
DIACS = ['a?','a?','i?','s?','t?','A?','A?','I?','S?','T?']

def is_ro_word(word):
    if len(word) <= 1:
        return False
    p = subprocess.run(
        ["hunspell", "-d", "ro_RO", "-l"],
        input=(word + "\n").encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )
    return p.stdout.strip() == b""

text = HTML.read_text(encoding="utf-8", errors="strict")
word_re = re.compile(r"(?<![<\w])([A-Za-z\?\u00C0-\u024F]+)(?![\w>])")
candidates = {m.span(): m.group(1) for m in word_re.finditer(text) if "?" in m.group(1)}

def generate_variants(word):
    idxs = [i for i, c in enumerate(word) if c == "?"]
    for repls in itertools.product(DIACS, repeat=len(idxs)):
        w_list = list(word)
        for i, ch in zip(idxs, repls):
            w_list[i] = ch
        yield "".join(w_list)

replacements = []
for (start, end), w in candidates.items():
    good = [v for v in generate_variants(w) if is_ro_word(v)]
    if len(good) == 1:
        replacements.append(((start, end), w, good[0]))

if replacements:
    shutil.copy2(HTML, BACKUP)
    new_text = text
    for (start, end), old, new in sorted(replacements, key=lambda x: x[0][0], reverse=True):
        new_text = new_text[:start] + new + new_text[end:]
    HTML.write_text(new_text, encoding="utf-8")
    print(f"Done: {len(replacements)} replacements. Backup saved to {BACKUP}")
else:
    print("No confident replacements found.")
