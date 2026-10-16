#!/usr/bin/env python3
"""Check exhaustive board/native task coverage, reference drift and evidence gates.

This validates bookkeeping and required evidence; it cannot approve a design.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PARITY = Path('tasks/native-parity')
KINDS = {'product', 'kit', 'motion', 'flow', 'reference'}
STATUSES = {'open', 'in-progress', 'ready-for-review', 'matched', 'reference-retained'}
CHECKS = {'light', 'dark', 'compact', 'wide', 'text130', 'reducedMotion',
          'keyboardFocus', 'targets48', 'labelsOrder', 'contrast', 'interaction',
          'restComparison', 'motionFrames', 'slowPlayback', 'noSlop'}


def read_json(path: Path):
    return json.loads(path.read_text())


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def within(root: Path, value: str) -> Path:
    if not isinstance(value, str) or not value or Path(value).is_absolute():
        raise ValueError(f'Expected a repository-relative path: {value!r}')
    path = (root / value).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError(f'Path escapes repository: {value}')
    return path


def baseline_fingerprint(baseline: dict) -> str:
    value = {'assets': baseline['assets'], 'screens': baseline['screens']}
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def native_fingerprint(root: Path) -> str:
    # Include actual native source/resources, not derived build products or screenshots.
    roots = ['shared/src', 'androidApp/src', 'iosApp/iosApp', 'iosApp/iosApp.xcodeproj']
    excluded = {'.xcuserstate', '.xcuserdatad', '.DS_Store'}
    paths = [p for folder in roots for p in (root / folder).rglob('*')
             if p.is_file() and not any(part in excluded or part == 'xcuserdata' for part in p.parts)]
    paths += [root / p for p in ('build.gradle.kts', 'settings.gradle.kts', 'gradle.properties',
                                'shared/build.gradle.kts', 'androidApp/build.gradle.kts',
                                'gradle/libs.versions.toml', 'gradle/wrapper/gradle-wrapper.properties')
              if (root / p).is_file()]
    value = '\n'.join(f'{p.relative_to(root)}:{digest(p)}' for p in sorted(set(paths)))
    return hashlib.sha256(value.encode()).hexdigest()


def validate(manifest: dict, baseline: dict, root: Path = ROOT,
             live: dict | None = None, check_hashes: bool = True) -> list[str]:
    errors: list[str] = []
    entries = manifest.get('entries', [])
    screens = baseline.get('screens', [])
    ids = [e.get('id') for e in entries]
    known = {s['id']: s for s in screens}
    by_id = {e.get('id'): e for e in entries}
    counts = Counter(e.get('kind') for e in entries)

    def require(condition, message):
        if not condition:
            errors.append(message)

    def existing(value, label):
        try:
            path = within(root, value)
            require(path.is_file(), f'{label}: missing {value}')
            return path if path.is_file() else None
        except (ValueError, TypeError) as error:
            errors.append(f'{label}: {error}')
            return None

    require(len(known) == len(screens), 'Baseline has duplicate screen IDs')
    require(len(ids) == len(set(ids)), 'Manifest has duplicate IDs')
    require(set(ids) == set(known), f'Registry coverage mismatch: missing={sorted(set(known)-set(ids))}, extra={sorted(set(ids)-set(known))}')
    require(len({e.get('task') for e in entries}) == len(entries), 'Task files must be individual, not reused for several IDs')
    require(manifest.get('counts', {}).get('registered') == len(entries), 'Registered count is stale')
    for kind in KINDS:
        require(manifest.get('counts', {}).get(kind) == counts[kind], f'{kind} count is stale')
    require(manifest.get('counts', {}).get('matched') == sum(e.get('status') == 'matched' for e in entries), 'Matched count is stale')
    require(all(e.get('kind') in KINDS for e in entries), 'Unknown entry kind')
    existing(manifest.get('baseline'), 'Baseline')

    gates = manifest.get('gates', [])
    gate_ids = [g['id'] for g in gates]
    require(len(gate_ids) == len(set(gate_ids)), 'Duplicate shared gate IDs')
    for gate in gates:
        existing(gate.get('task'), gate['id'])
        require(gate.get('status') in STATUSES, f'{gate["id"]}: invalid status')

    navigation = (root / 'shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/navigation/AppState.kt').read_text()
    native_hash = None
    reference_ids = {'home-before', 'profile', 'insights'}
    for entry in entries:
        sid = entry.get('id')
        if sid not in known:
            continue
        board = known[sid]
        expected_kind = ('flow' if board.get('sequence') else 'reference' if sid in reference_ids
                         else board['section'] if board['section'] in {'kit', 'motion'} else 'product')
        require(entry.get('kind') == expected_kind, f'{sid}: classification drift')
        require(entry.get('section') == board['section'], f'{sid}: section differs from live baseline')
        require(entry.get('status') in STATUSES, f'{sid}: invalid status')
        require(entry.get('boardUrl') == f'http://localhost:4278/#only-{sid}', f'{sid}: broken direct board link')
        require(entry.get('sequence') == (board.get('sequence') or []), f'{sid}: sequence/order differs from board')
        for child in entry.get('sequence', []):
            require(child in known, f'{sid}: unknown sequence member {child}')
        for dep in entry.get('dependencies', []):
            require(dep in gate_ids or dep.startswith('NP-') and dep[3:] in by_id, f'{sid}: unknown dependency {dep}')
        for key in ('boardIntent', 'requiredStates', 'gap', 'productionDisposition', 'auditLevel'):
            require(bool(entry.get(key)), f'{sid}: missing {key}')
        existing(entry.get('boardSource'), f'{sid} board source')
        task = existing(entry.get('task'), f'{sid} task')
        if task:
            content = task.read_text()
            require(f'# NP-{sid}:' in content, f'{sid}: individual task heading missing')
            require(f'Status: {entry.get("status")}' in content, f'{sid}: task/manifest status disagree')
            require(entry['boardUrl'] in content, f'{sid}: task has no exact board link')
            for heading in ('## Native mapping and gap', '## Reproduction scenario', '## Required states and acceptance', '## Motion, accessibility and evidence'):
                require(heading in content, f'{sid}: missing task section {heading}')
        native = entry.get('native', {})
        require(bool(native.get('target') and native.get('scenario') and native.get('currentCoverage')), f'{sid}: incomplete native mapping/scenario')
        require(bool(native.get('sources')), f'{sid}: missing native sources')
        for value in native.get('sources', []):
            existing(value, f'{sid} native source')
        # Targets are current mappings, including contextual states; a missing board
        # composition can intentionally map to an existing combined native route.
        for target in re.findall(r'(?:Feature|Route)\.([A-Za-z]+)', native.get('target', '')):
            require(bool(re.search(r'\b' + re.escape(target) + r'\b', navigation)), f'{sid}: unknown native route {target}')
        if entry.get('status') == 'reference-retained':
            require(entry['kind'] == 'reference', f'{sid}: only historical entries may be reference-retained')
        if entry.get('status') != 'matched':
            continue
        require(entry['kind'] != 'reference', f'{sid}: historical comparison cannot be a matched product')
        for dep in entry.get('dependencies', []):
            if dep in gate_ids:
                gate = next(g for g in gates if g['id'] == dep)
                require(gate['status'] == 'matched', f'{sid}: shared gate {dep} is not matched')
            else:
                child = by_id.get(dep[3:], {})
                require(child.get('status') in {'matched', 'reference-retained'}, f'{sid}: dependency {dep} is not resolved')
        approval = entry.get('ownerApproval')
        require(isinstance(approval, dict) and all(approval.get(k) for k in ('date', 'evidence', 'scope')), f'{sid}: missing individual owner approval')
        if isinstance(approval, dict):
            require(approval.get('scope') == sid, f'{sid}: owner approval must identify this individual board ID')
        evidence_path = existing(entry.get('evidence'), f'{sid} parity evidence')
        if not evidence_path:
            continue
        try:
            evidence = read_json(evidence_path)
        except (ValueError, OSError) as error:
            errors.append(f'{sid}: invalid evidence JSON: {error}')
            continue
        require(evidence.get('fixtureId'), f'{sid}: missing matched fixture ID')
        require(evidence.get('baselineBoardId') == baseline['boardId'], f'{sid}: wrong board baseline')
        require(evidence.get('baselineFingerprint') == baseline_fingerprint(baseline), f'{sid}: stale baseline fingerprint')
        if native_hash is None:
            native_hash = native_fingerprint(root)
        require(evidence.get('sourceFingerprint') == native_hash, f'{sid}: stale native source fingerprint')
        existing(evidence.get('board'), f'{sid} board capture')
        for platform in ('ios', 'android'):
            value = evidence.get(platform, {})
            captures = value.get('captures', [])
            require(bool(captures), f'{sid}: missing {platform} captures')
            for capture in captures:
                existing(capture, f'{sid} {platform} capture')
            require(all(value.get('checks', {}).get(check) is True for check in CHECKS), f'{sid}: incomplete {platform} visual/motion/accessibility checks')
        review = evidence.get('visualReview', {})
        require(review.get('reviewer') and review.get('date'), f'{sid}: missing human visual review')
        require('differences' in review and isinstance(review['differences'], list), f'{sid}: unresolved differences must be explicit')
        for difference in review.get('differences', []):
            require(isinstance(difference, dict) and difference.get('ownerApprovedException'), f'{sid}: unapproved visual difference')

    if check_hashes:
        paths = [a['path'] for a in baseline.get('assets', [])]
        require(len(paths) == len(set(paths)) and bool(paths), 'Pinned assets are empty or duplicated')
        for asset in baseline.get('assets', []):
            path = existing(asset['path'], 'Pinned board asset')
            if path:
                require(digest(path) == asset['sha256'], f'Board baseline drift: {asset["path"]}; review before rebaselining')
    if live is not None:
        require(live.get('boardId') == baseline['boardId'], 'Live board identity changed')
        actual = live.get('screens', [])
        require([s['id'] for s in actual] == [s['id'] for s in screens], 'Live registry/order differs from baseline; added or missing screen')
        for screen in actual:
            original = known.get(screen['id'])
            if original:
                require(screen.get('sequence') == original.get('sequence'), f'{screen["id"]}: live sequence drift')
                require(screen.get('section') == original.get('section'), f'{screen["id"]}: live section drift')
        require(live.get('sections') == baseline.get('sections'), 'Live board section map drift')
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', type=Path, help='Fresh read-only tools/board_inventory.mjs JSON')
    parser.add_argument('--fingerprint', action='store_true', help='Print current source/reference fingerprints for evidence recording')
    args = parser.parse_args()
    manifest = read_json(ROOT / PARITY / 'manifest.json')
    baseline = read_json(ROOT / PARITY / 'board-baseline.json')
    errors = validate(manifest, baseline, live=read_json(args.live) if args.live else None)
    if errors:
        print('\n'.join('ERROR: ' + value for value in errors), file=sys.stderr)
        return 1
    print(f'Parity coverage passed: {len(manifest["entries"])} entries; {manifest["counts"]["product"]} product; {manifest["counts"]["matched"]} matched. This is not visual approval.')
    if args.fingerprint:
        print(json.dumps({'baselineFingerprint': baseline_fingerprint(baseline), 'sourceFingerprint': native_fingerprint(ROOT)}, indent=2))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError) as error:
        print(f'Parity check failed: {error}', file=sys.stderr)
        sys.exit(1)
