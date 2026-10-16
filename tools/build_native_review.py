#!/usr/bin/env python3
"""Package owned QA captures for review without changing parity/approval status.

The input lists explicit capture batches and their source fingerprints. Files are
copied verbatim, including their real OS chrome. Missing captures stay missing.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

from check_native_parity import ROOT, baseline_fingerprint, native_fingerprint


def build(config_path: Path, output: Path) -> None:
    config = json.loads(config_path.read_text())
    manifest = json.loads((ROOT / "tasks/native-parity/manifest.json").read_text())
    baseline = json.loads((ROOT / manifest["baseline"]).read_text())
    entries = [dict(e, captures=[]) for e in manifest["entries"] if e["kind"] == "product"]
    by_id = {e["id"]: e for e in entries}
    output.mkdir(parents=True, exist_ok=True)

    def copy(source: Path, relative: str) -> dict:
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        return {"path": relative, "sha256": hashlib.sha256(source.read_bytes()).hexdigest()}

    board = ROOT / config["boardDirectory"]
    for entry in entries:
        source = board / (entry["id"] + ".png")
        entry["boardCapture"] = copy(source, "assets/board/" + source.name) if source.is_file() else None
        entry["boardVariants"] = {}
        for variant, directory in config.get("boardVariants", {}).items():
            source = ROOT / directory / (entry["id"] + ".png")
            if source.is_file():
                metadata = json.loads(source.with_suffix(".json").read_text())
                entry["boardVariants"][variant] = dict(copy(source, f"assets/board-{variant}/" + source.name),
                    geometry=metadata["geometry"], viewport=[metadata["width"], metadata["height"]])
    for batch in config["batches"]:
        name = batch["name"]
        if not re.fullmatch(r"[a-z0-9-]+", name):
            raise ValueError("Unsafe batch name: " + name)
        folder = ROOT / batch["directory"]
        files = []
        if batch["format"] == "xcresult-attachments":
            for test in json.loads((folder / "manifest.json").read_text()):
                for attachment in test["attachments"]:
                    if attachment.get("isAssociatedWithFailure"):
                        continue
                    original_name = attachment.get("suggestedHumanReadableName", "").split("_0_")[0]
                    sid = batch.get("names", {}).get(original_name)
                    if sid is None and original_name.startswith(batch.get("prefix", "visual-")):
                        sid = original_name[len(batch.get("prefix", "visual-")):]
                    if sid in by_id:
                        files.append((sid, folder / attachment["exportedFileName"], attachment))
        elif batch["format"] in {"android-rest", "labeled-rest"}:
            for metadata_path in sorted(folder.glob("*.json")):
                if metadata_path.name == "failures.json":
                    continue
                metadata = json.loads(metadata_path.read_text())
                if not isinstance(metadata, dict):
                    continue
                sid = metadata.get("id")
                source = folder / (str(sid) + ".png")
                if sid in by_id and metadata.get("verifiedLabel") and source.is_file():
                    files.append((sid, source, metadata))
        else:
            raise ValueError("Unknown capture format")
        used_ids = set()
        for sid, source, metadata in files:
            suffix = "-" + hashlib.sha256(source.read_bytes()).hexdigest()[:12] if sid in used_ids else ""
            used_ids.add(sid)
            asset = copy(source, f"assets/{name}/{sid}{suffix}.png")
            by_id[sid]["captures"].append(dict(asset, platform=batch["platform"],
                variant=batch["variant"], batch=name, sourceFingerprint=batch["sourceFingerprint"],
                stage=metadata.get("stage", batch.get("stage", "rest")), fixture=metadata.get("fixture", batch.get("fixture", "See contextual QA fixture map")),
                device=metadata.get("deviceName", batch.get("device", "Owned QA device"))))
    data = {"title": "BarkLog native conversion review", "status": "Diagnostic review · no visual approvals",
            "baselineFingerprint": baseline_fingerprint(baseline), "sourceFingerprint": native_fingerprint(ROOT),
            "notes": config["notes"], "entries": entries}
    (output / "review-data.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    embedded = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    (output / "index.html").write_text(HTML.replace("__REVIEW_DATA__", embedded))
    paired = sum(all(any(c["platform"] == p for c in e["captures"]) for p in ("ios", "android")) for e in entries)
    print(f"Packaged {len(entries)} product entries; {paired} have captures from both native hosts. No approvals changed.")


HTML = r'''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>BarkLog native conversion review</title>
<style>
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#f4f2eb;color:#17221c}
header{padding:20px 24px;border-bottom:1px solid #c8c8bd;background:#fff}h1{margin:0;font-size:26px}p{margin:8px 0}
.notice{max-width:1050px}.layout{display:grid;grid-template-columns:260px 1fr}nav{position:sticky;top:0;max-height:100vh;overflow:auto;padding:16px;border-right:1px solid #c8c8bd}
input,select,button,a{font:inherit}input,select{padding:10px;width:100%;margin:4px 0 10px;border:1px solid #77796d;border-radius:8px;background:white}
button{cursor:pointer;border:1px solid #a5aa9c;background:white;border-radius:8px;padding:10px}nav button{display:block;text-align:left;width:100%;margin:5px 0;min-height:48px}
nav button[aria-current=true]{background:#d6ee47;border-color:#17221c}small{display:block;color:#5d665e}main{padding:24px;min-width:0}
h2{font-size:24px;margin:0}.gallery{display:grid;grid-template-columns:repeat(3,minmax(240px,1fr));gap:16px;overflow:auto;margin-top:20px}
figure{margin:0;min-width:240px}figcaption{min-height:86px;padding-bottom:10px}img{display:block;width:100%;max-width:390px;height:auto;border:1px solid #b7bbae;border-radius:8px}
.missing{min-height:300px;padding:30px;border:1px dashed #7d8175;background:#eae9df}.metadata{overflow-wrap:anywhere}summary{cursor:pointer;padding:12px 0}li{margin:6px 0}
@media(max-width:760px){.layout{grid-template-columns:1fr}nav{position:static;max-height:250px;border-bottom:1px solid}main{padding:16px}.gallery{grid-template-columns:repeat(3,280px)}}
</style><header><h1>BarkLog native conversion review</h1><p><strong>Diagnostic comparisons · 0 individually approved matches</strong></p>
<p class="notice">These are unaltered captures from owned QA journals. A label check proves reachability; it does not prove visual equality. Missing states, older source batches and unmatched sample data are shown explicitly. This page never changes task or approval status.</p>
<details><summary>Capture limits and source versions</summary><ul id="notes"></ul><p id="fingerprint" class="metadata"></p></details></header>
<div class="layout"><nav aria-label="Screen selection"><label for="search">Find a screen</label><input id="search" type="search" placeholder="Home, walk, memory…"><label for="variant">Capture variant</label><select id="variant"><option value="light">Light</option><option value="dark">Dark</option><option value="compact">Compact</option><option value="wide">Wide</option><option value="text130">Android 130% text</option><option value="text135">iOS ≈135% text</option><option value="reduced">Reduced motion</option></select><div id="screens"></div></nav>
<main><h2 id="heading"></h2><p id="identity"></p><a id="board-link" target="_blank" rel="noopener">Open the exact live board</a><p id="gap"></p><div class="gallery" id="gallery"></div><details><summary>Required behavior and capture metadata</summary><p id="scenario"></p><pre id="metadata" class="metadata" style="white-space:pre-wrap"></pre></details></main></div>
<script>const data=__REVIEW_DATA__;
const $=id=>document.getElementById(id);let selected=decodeURIComponent(location.hash.slice(1))||'home';
for(const note of data.notes){const li=document.createElement('li');li.textContent=note;$('notes').append(li)}
$('fingerprint').textContent='Pack source: '+data.sourceFingerprint+' · Board: '+data.baselineFingerprint;
function show(){const entry=data.entries.find(e=>e.id===selected)||data.entries[0];selected=entry.id;location.hash=entry.id;
$('heading').textContent=entry.name;$('identity').textContent=entry.id+' · '+entry.section+' · '+entry.status+' · approval pending';$('gap').textContent=entry.gap;
$('scenario').textContent=entry.native.scenario+' Required states: '+entry.requiredStates;$('board-link').href=entry.boardUrl;
const variant=$('variant').value;const boardCapture=variant==='light'?entry.boardCapture:entry.boardVariants[variant];
const captures=[['Board reference',boardCapture],...['ios','android'].map(platform=>[platform==='ios'?'iOS':'Android',entry.captures.find(c=>c.platform===platform&&c.variant===variant)])];
$('gallery').replaceChildren();for(const [name,capture] of captures){const figure=document.createElement('figure');const caption=document.createElement('figcaption');caption.textContent=name;
if(capture){const meta=document.createElement('small');meta.textContent=capture.batch?capture.batch+' · '+capture.stage+' · '+(capture.sourceFingerprint===data.sourceFingerprint?'pack source':'earlier source batch'):capture.geometry?'Pinned board · '+capture.geometry.width+' × '+capture.geometry.height+' in '+capture.viewport.join(' × ')+' viewport':'Pinned current board · canonical light';caption.append(meta);const a=document.createElement('a');a.href=capture.path;a.target='_blank';const img=document.createElement('img');img.src=capture.path;img.alt=name+' '+entry.id;a.append(img);figure.append(caption,a)}else{const missing=document.createElement('div');missing.className='missing';missing.textContent='No capture for this entry and variant. This check remains open.';figure.append(caption,missing)}$('gallery').append(figure)}
$('metadata').textContent=JSON.stringify(entry.captures,null,2);list()}
function list(){const query=$('search').value.toLowerCase();$('screens').replaceChildren();for(const entry of data.entries.filter(e=>(e.id+' '+e.name+' '+e.section).toLowerCase().includes(query))){const b=document.createElement('button');b.textContent=entry.id;b.setAttribute('aria-current',entry.id===selected);const s=document.createElement('small');s.textContent=entry.section+' · '+entry.captures.length+' capture(s)';b.append(s);b.onclick=()=>{selected=entry.id;show()};$('screens').append(b)}}
$('search').oninput=list;$('variant').onchange=show;window.onhashchange=()=>{selected=decodeURIComponent(location.hash.slice(1));show()};show();
</script></html>'''

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "docs/design/evidence/task022/review")
    args = parser.parse_args()
    build(args.config, args.output)
