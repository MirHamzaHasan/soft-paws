"""Do not let a registered board screen or an unproved parity claim disappear."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('check_native_parity', ROOT / 'tools/check_native_parity.py')
parity = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parity)


class NativeParityTest(unittest.TestCase):
    def setUp(self):
        self.manifest = parity.read_json(ROOT / 'tasks/native-parity/manifest.json')
        self.baseline = parity.read_json(ROOT / 'tasks/native-parity/board-baseline.json')

    def errors(self, live=None):
        return parity.validate(self.manifest, self.baseline, live=live)

    def test_current_coverage_and_asset_hashes(self):
        self.assertEqual([], self.errors())
        self.assertEqual(123, self.manifest['counts']['product'])
        self.assertEqual(18, self.manifest['counts']['flow'])
        self.assertEqual(sum(e['status'] == 'matched' for e in self.manifest['entries']),
                         self.manifest['counts']['matched'])

    def test_dropped_screen_is_not_silently_accepted(self):
        self.manifest['entries'] = [e for e in self.manifest['entries'] if e['id'] != 'memory-caption']
        self.assertTrue(any('coverage mismatch' in e for e in self.errors()))

    def test_duplicate_id_and_shared_task_fail(self):
        self.manifest['entries'][1] = copy.deepcopy(self.manifest['entries'][0])
        result = self.errors()
        self.assertTrue(any('duplicate IDs' in e for e in result))
        self.assertTrue(any('individual' in e for e in result))

    def test_missing_child_task_or_native_source_fails(self):
        entry = self.manifest['entries'][0]
        entry['task'] = 'tasks/native-parity/does-not-exist.md'
        entry['native']['sources'] = ['shared/src/does-not-exist.kt']
        result = self.errors()
        self.assertTrue(any('task: missing' in e for e in result))
        self.assertTrue(any('native source: missing' in e for e in result))

    def test_board_asset_drift_fails(self):
        self.baseline['assets'][0]['sha256'] = '0' * 64
        self.assertTrue(any('Board baseline drift' in e for e in self.errors()))

    def test_unproved_completion_claim_fails(self):
        entry = next(e for e in self.manifest['entries'] if e['id'] == 'home')
        entry['status'] = 'matched'
        self.manifest['counts']['matched'] = 1
        result = self.errors()
        self.assertTrue(any('owner approval' in e for e in result))
        self.assertTrue(any('parity evidence' in e for e in result))
        self.assertTrue(any('shared gate' in e for e in result))

    def test_live_added_screen_and_changed_sequence_fail(self):
        live = copy.deepcopy(self.baseline)
        self.assertEqual([], self.errors(live))
        live['screens'].append({'id': 'new-untracked-screen', 'section': 'memory'})
        live['screens'][next(i for i, s in enumerate(live['screens']) if s['id'] == 'seq-memory')]['sequence'] = ['home']
        result = self.errors(live)
        self.assertTrue(any('Live registry' in e for e in result))
        self.assertTrue(any('live sequence drift' in e for e in result))

    def test_setup_is_product_and_historical_is_not(self):
        entries = {e['id']: e for e in self.manifest['entries']}
        self.assertEqual('product', entries['dog-setup']['kind'])
        self.assertEqual('reference', entries['home-before']['kind'])
        self.assertEqual('flow', entries['seq-setup']['kind'])
        self.assertEqual('native-platform-handoff', entries['share-handoff']['productionDisposition'])

    def test_file_presence_alone_cannot_prove_visual_parity(self):
        entry = next(e for e in self.manifest['entries'] if e['id'] == 'home')
        entry['status'] = 'matched'
        entry['ownerApproval'] = {'date': '2026-10-16', 'scope': 'whole-board', 'evidence': 'not individual approval'}
        entry['evidence'] = 'tasks/native-parity/manifest.json'
        self.manifest['counts']['matched'] = 1
        result = self.errors()
        self.assertTrue(any('individual board ID' in e for e in result))
        self.assertTrue(any('stale baseline fingerprint' in e for e in result))
        self.assertTrue(any('missing ios captures' in e for e in result))
        self.assertTrue(any('incomplete android' in e for e in result))


if __name__ == '__main__':
    unittest.main()
