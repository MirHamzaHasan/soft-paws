#!/usr/bin/env python3
"""Keep the two native hosts on the reviewed, clean Rive export."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]

def check():
    study = ROOT / 'design/board/refinements/rive-dog'
    manifest = json.loads((study / 'manifest.json').read_text())
    data = (study / 'spaniel.riv').read_bytes()
    if hashlib.sha256(data).hexdigest() != manifest['runtimeSha256']:
        raise ValueError('Rive export differs from the reviewed manifest.')
    for path in ('shared/src/androidMain/res/raw/barklog_spaniel.riv', 'iosApp/iosApp/barklog_spaniel.riv'):
        if (ROOT / path).read_bytes() != data:
            raise ValueError(f'{path}: stale mascot export.')
    if not data.startswith(b'RIVE') or any(name in data for name in (b'Watermark', b'NuRiveBrandmark', b'NuRiveWordmark')):
        raise ValueError('Expected the official clean export from the paid workspace.')
    if hashlib.sha256((study / 'spaniel.rev').read_bytes()).hexdigest() != manifest['editableSha256']:
        raise ValueError('Editable Rive source differs from the manifest.')
    notebook = ROOT / 'design/board/refinements/rive-care-notebook'
    approved = json.loads((notebook / 'manifest.json').read_text())
    runtime = (notebook / 'care-notebook.riv').read_bytes()
    if hashlib.sha256(runtime).hexdigest() != approved['runtimeSha256']:
        raise ValueError('Notebook export differs from the approved manifest.')
    for target in ('shared/src/androidMain/res/raw/barklog_care_notebook.riv', 'iosApp/iosApp/barklog_care_notebook.riv'):
        if (ROOT / target).read_bytes() != runtime:
            raise ValueError(f'{target}: stale notebook export.')
    if not runtime.startswith(b'RIVE') or any(name in runtime for name in (b'Watermark', b'NuRiveBrandmark', b'NuRiveWordmark')):
        raise ValueError('Expected the official clean notebook export.')
    if hashlib.sha256((notebook / 'care-notebook.rev').read_bytes()).hexdigest() != approved['editableSha256']:
        raise ValueError('Editable notebook source differs from the manifest.')
    print(f'Native notebook copies and editable-source hashes passed ({len(runtime):,} runtime bytes).')
    print(f'Native mascot copies and editable-source hashes passed ({len(data):,} runtime bytes).')
    cat = ROOT / 'design/soft-paws/assets/cat'
    contract = json.loads((cat / 'manifest.json').read_text())
    runtime = (cat / 'soft-paws-cat.riv').read_bytes()
    for name, key in [('soft-paws-cat.riv', 'runtimeSha256'), ('soft-paws-cat.rev', 'editableSha256'), ('rest.png', 'stillSha256')]:
        if hashlib.sha256((cat / name).read_bytes()).hexdigest() != contract[key]:
            raise ValueError(f'Cat {name} differs from the approved manifest.')
    for path in ('shared/src/androidMain/res/raw/soft_paws_cat.riv', 'iosApp/iosApp/soft_paws_cat.riv'):
        if (ROOT / path).read_bytes() != runtime:
            raise ValueError(f'{path}: stale cat runtime.')
    still = ROOT / 'shared/src/commonMain/composeResources/drawable/soft_paws_cat_rest.png'
    if still.read_bytes() != (cat / 'rest.png').read_bytes():
        raise ValueError('Native cat fallback differs from the approved art.')
    android = (ROOT / 'shared/src/androidMain/kotlin/com/dracoarts/shared/presentation/components/RiveDogSurface.android.kt').read_text()
    apple = (ROOT / 'iosApp/iosApp/BarkMascot.swift').read_text()
    for source in (android, apple):
        if any(value not in source for value in ('soft_paws_cat', contract['artboard'], contract['stateMachine'])):
            raise ValueError('Native cat renderer does not match the approved Rive contract.')
    print(f'Soft Paws native cat runtime, bridge contracts and same-art fallback passed ({len(runtime):,} bytes).')

if __name__ == '__main__':
    check()
