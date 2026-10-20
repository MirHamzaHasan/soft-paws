#!/usr/bin/env python3
"""Contrast of the actual board tokens, including inputs and selected grounds."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
css = (root / 'css/tokens.css').read_text()
blocks = re.findall(r'(?s)([^{}]+)\{([^{}]+)\}', css)
light = next(body for selector, body in blocks if selector.strip() == ':root')
dark = next(body for selector, body in blocks if selector.strip() == ':root[data-theme="dark"]')

def luminance(value):
    values = [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
    return sum(w * (v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4)
               for v, w in zip(values, [.2126, .7152, .0722]))

results = []
for theme, body in [('light', light), ('dark', dark)]:
    tokens = dict(re.findall(r'--([\w-]+):\s*(#[\da-fA-F]{6})', body))
    for foreground, background, minimum in [
        ('ink', 'ground', 4.5), ('ink', 'panel', 4.5),
        ('ink-muted', 'ground', 4.5), ('ink-muted', 'panel', 4.5),
        ('ink-muted', 'accent-soft', 4.5), ('ink-muted', 'warn-soft', 4.5),
        ('accent-text', 'ground', 4.5), ('btn-ink', 'btn', 4.5),
        ('bad', 'bad-soft', 4.5), ('hair-2', 'panel', 3),
    ]:
        a, b = sorted([luminance(tokens[foreground]), luminance(tokens[background])])
        ratio = (b + .05) / (a + .05)
        results.append(dict(theme=theme, foreground=foreground, background=background,
                            ratio=round(ratio, 2), minimum=minimum, passed=ratio >= minimum))
print(json.dumps(results, indent=2))
raise SystemExit(any(not row['passed'] for row in results))
