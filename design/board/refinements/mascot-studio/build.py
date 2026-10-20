#!/usr/bin/env python3
"""Generate editable mascot clips, then round-trip/render with installed Glaxnimate.

No mobile dependency or service is used. python-lottie is supplied by Glaxnimate's
official macOS distribution; GLAX_PYTHON_PACKAGES can point to another installation.
"""
from __future__ import annotations

import argparse
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
PACKAGES = Path(os.environ.get("GLAX_PYTHON_PACKAGES", "/Applications/glaxnimate.app/Contents/Frameworks/Python.framework/Versions/3.11/lib/python3.11/site-packages"))
sys.path.insert(0, str(PACKAGES))
from lottie.parsers.svg import parse_svg_etree
from lottie.nvector import NVector
from lottie.objects import easing

FPS = 60
CURVE = easing.Bezier(NVector(.76, 0), NVector(.24, 1))
PIVOTS = {"body": (90, 177), "head": (94, 99), "tail": (132, 146), "ear-left": (61, 33), "ear-right": (124, 30), "paw-left": (81, 129), "paw-right": (115, 129), "paw-pads": (116, 168), "eye-left": (77, 52), "eye-right": (110, 52), "brow-left": (76, 41), "brow-right": (110, 41), "tongue": (94, 83), "tag": (97, 97)}
DURATIONS = {"idle": 6, "curious": 2.1, "glance": 2.3, "ears": 1.9, "sniff": 2.1, "hello": 2.2, "stretch": 2.5, "celebrate": 1.8, "still": 1}


def named_groups(animation):
    result = {}
    def visit(obj):
        name = getattr(obj, "name", None)
        if name in PIVOTS and hasattr(obj, "transform"):
            result[name] = obj
        for key in ("layers", "shapes"):
            for child in getattr(obj, key, []) or []:
                visit(child)
    visit(animation)
    return result


def create(action):
    source = ET.parse(ROOT / "dog.svg")
    # The SVG importer bakes inherited opacity into child paint. Keep those
    # paints visible and let the named group own the expression's opacity.
    for element in source.iter():
        if element.get("id") in ("tongue", "paw-pads"):
            element.attrib.pop("opacity", None)
    anim = parse_svg_etree(source)
    anim.name = f"BarkLog · {action} · review"
    anim.frame_rate = FPS
    anim.in_point = 0
    anim.out_point = DURATIONS[action] * FPS
    for layer in anim.layers:
        layer.in_point = 0
        layer.out_point = anim.out_point
    parts = named_groups(anim)
    assert set(parts) == set(PIVOTS), set(PIVOTS) - set(parts)
    for name, point in PIVOTS.items():
        parts[name].transform.anchor_point.value = NVector(*point)
        parts[name].transform.position.value = NVector(*point)
    for name in ("tongue", "paw-pads"):
        parts[name].transform.opacity.value = 0

    def key(name, property_name, points):
        prop = getattr(parts[name].transform, property_name)
        for seconds, value in points:
            prop.add_keyframe(seconds * FPS, NVector(*value) if isinstance(value, tuple) else value, CURVE)

    def rotate(name, points):
        key(name, "rotation", points)

    def move(name, points):
        x, y = PIVOTS[name]
        key(name, "position", [(t, (x + dx, y + dy)) for t, dx, dy in points])

    def volume(points):
        key("body", "scale", [(t, (100 * width, 100 / width)) for t, width in points])

    def blink(start=.45, double=False):
        frames = [(0, (100, 100)), (start, (100, 100)), (start + .07, (100, 12)), (start + .17, (100, 100))]
        if double:
            frames += [(start + .28, (100, 100)), (start + .35, (100, 12)), (start + .45, (100, 100))]
        frames += [(DURATIONS[action], (100, 100))]
        for name in ("eye-left", "eye-right"):
            key(name, "scale", frames)

    def ears(amp=7):
        rotate("ear-left", [(0, 0), (.23, amp), (.52, -2), (.95, 0)])
        rotate("ear-right", [(0, 0), (.30, -amp), (.59, 2), (1.03, 0)])

    def wag(amp=18):
        rotate("tail", [(0, 0), (.22, -amp), (.43, amp * .78), (.64, -amp * .62), (.85, amp * .4), (1.10, -amp * .2), (1.38, 0)])

    if action == "idle":
        volume([(0, 1), (1.6, .989), (3.2, 1), (6, 1)])
        blink(3.85)
        rotate("tail", [(0, 0), (4.6, 0), (4.9, -6), (5.2, 4), (5.6, 0), (6, 0)])
    elif action == "hello":
        rotate("paw-right", [(0, 0), (.25, 7), (.54, -82), (.77, -103), (1.02, -79), (1.25, -100), (1.52, -80), (1.94, 0), (2.2, 0)])
        rotate("head", [(0, 0), (.45, -6), (1.35, -6), (1.75, 2), (2.2, 0)])
        key("paw-pads", "opacity", [(0, 0), (.3, 0), (.55, 100), (1.5, 100), (1.94, 0), (2.2, 0)])
        ears(7); wag(21); blink(.8)
    elif action == "curious":
        rotate("head", [(0, 0), (.55, -11), (1.25, -11), (1.65, 2), (2.1, 0)])
        move("head", [(0, 0, 0), (.55, -1, -1), (1.25, -1, -1), (2.1, 0, 0)])
        move("brow-left", [(0, 0, 0), (.45, 0, -2), (1.4, 0, -2), (2.1, 0, 0)])
        ears(8); blink(1.4)
    elif action == "glance":
        rotate("head", [(0, 0), (.58, 6), (1.45, 6), (2.3, 0)])
        move("head", [(0, 0, 0), (.58, 3, 0), (1.45, 3, 0), (2.3, 0, 0)])
        for eye in ("eye-left", "eye-right"):
            move(eye, [(0, 0, 0), (.44, 1.5, 0), (1.4, 1.5, 0), (2.3, 0, 0)])
        wag(9)
    elif action == "ears":
        ears(17); blink(.45, True)
        move("head", [(0, 0, 0), (.4, 0, -2), (1.0, 0, -2), (1.9, 0, 0)])
    elif action == "sniff":
        rotate("head", [(0, 0), (.45, -3), (.75, -5), (1, -3), (1.25, -5), (1.55, -2), (2.1, 0)])
        move("head", [(0, 0, 0), (.45, 0, 3), (.75, 1, 5), (1, -1, 3), (1.25, 1, 5), (2.1, 0, 0)])
        wag(10)
    elif action == "stretch":
        volume([(0, 1), (.65, .967), (1.3, .967), (2.1, 1), (2.5, 1)])
        rotate("head", [(0, 0), (.65, 3), (1.3, 3), (2.5, 0)])
        move("head", [(0, 0, 0), (.65, 0, -2), (1.3, 0, -2), (2.5, 0, 0)])
        ears(7); blink(.7, True)
    elif action == "celebrate":
        points = [(0, 1), (.09, 1.045), (.22, .985), (.34, 1.026)]
        # Sampled damping .70 / response .32 s; volume remains constant.
        for i in range(1, 43):
            t = i / 60
            omega = 2 * math.pi / .32
            d = .70
            p = omega * math.sqrt(1 - d * d)
            w = 1 + .026 * math.exp(-d * omega * t) * (math.cos(p * t) + d / math.sqrt(1 - d * d) * math.sin(p * t))
            points.append((.34 + t, w))
        points += [(1.8, 1)]
        volume(points)
        move("body", [(0, 0, 0), (.09, 0, 2), (.22, 0, -7), (.36, 0, 0), (1.8, 0, 0)])
        rotate("head", [(0, 0), (.3, -8), (.7, 2), (1.3, 0)])
        key("tongue", "opacity", [(0, 0), (.3, 0), (.5, 100), (.95, 100), (1.25, 0), (1.8, 0)])
        ears(10); wag(25); blink(.48)

    return anim


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--glax", default="/Applications/glaxnimate.app/Contents/MacOS/glaxnimate")
    parser.add_argument("--evidence", type=Path)
    parser.add_argument("--scratch", type=Path, default=ROOT.parents[3] / ".verify-build/task030/sources")
    args = parser.parse_args()
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    args.scratch.mkdir(parents=True, exist_ok=True)
    results = []
    for action in DURATIONS:
        anim = create(action)
        source = args.scratch / f"{action}.json"
        source.write_text(json.dumps(anim.to_dict(), separators=(",", ":")) + "\n")
        # Glaxnimate's native importer/exporter is the acceptance boundary.
        editable = assets / f"{action}.rawr"
        exported = assets / f"{action}.lottie.json"
        for input_file, output_file, fmt in ((source, editable, "glaxnimate"), (editable, exported, "lottie")):
            subprocess.run([args.glax, str(input_file), "--export", str(output_file), "--export-format", fmt], check=True, capture_output=True, text=True)
        data = json.loads(exported.read_text())
        assert data["w"] == 360 and data["h"] == 380 and data["layers"]
        results.append({"action": action, "frames": data["op"], "bytes": exported.stat().st_size, "editable": editable.name, "exported": exported.name})
        if args.evidence and action in ("hello", "celebrate", "curious", "still"):
            args.evidence.mkdir(parents=True, exist_ok=True)
            for fraction in (0, .25, .5, .75, .99):
                frame = min(int(anim.out_point * fraction), int(anim.out_point) - 1)
                subprocess.run([args.glax, str(editable), "--render", str(args.evidence / f"{action}-{int(fraction*100):02}.png"), "--frame", str(frame)], check=True, capture_output=True, text=True)
    (ROOT / "assets" / "manifest.json").write_text(json.dumps(results, indent=2) + "\n")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
