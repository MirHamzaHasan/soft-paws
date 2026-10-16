"""Pin the approved board export and native review gates without a platform build."""
import importlib.util
import re
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('design_tokens', ROOT / 'tools/design_tokens.py')
export = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export)


def call_arguments(source, name):
    """Read call slots, keeping Kotlin interpolation/conditions out of metadata slots."""
    def quoted(i):
        if source.startswith('"""', i):
            end = source.find('"""', i + 3)
            return len(source) if end < 0 else end + 3
        i += 1
        while i < len(source):
            if source[i] == '\\':
                i += 2
            elif source.startswith('${', i):
                i = balanced(i + 1)
            elif source[i] == '"':
                return i + 1
            else:
                i += 1
        return i

    def balanced(i):
        close = {'(': ')', '[': ']', '{': '}'}[source[i]]
        i += 1
        while i < len(source):
            if source[i] == '"':
                i = quoted(i)
            elif source[i] in '([{':
                i = balanced(i)
            elif source[i] == close:
                return i + 1
            else:
                i += 1
        return i

    for match in re.finditer(r'\b' + re.escape(name) + r'\(', source):
        i = start = match.end()
        args = []
        while i < len(source):
            if source[i] == '"':
                i = quoted(i)
            elif source[i] in '([{':
                i = balanced(i)
            elif source[i] in ',)':
                args.append(source[start:i].strip())
                if source[i] == ')':
                    yield args
                    break
                i += 1; start = i
            else:
                i += 1


def returned_icons(expression):
    direct = re.fullmatch(r'"([a-z0-9-]+)"', expression)
    if direct:
        return {direct.group(1)}
    if expression.startswith('when'):
        return set(re.findall(r'->\s*"([a-z0-9-]+)"', expression))
    if expression.startswith('if'):
        return set(re.findall(r'(?:\)|else)\s*"([a-z0-9-]+)"', expression))
    return set()


class DesignTokensTest(unittest.TestCase):
    def test_native_icon_references_exist_in_board_export(self):
        available = set(re.findall(r'"([^"\n]+)" to listOf', export.icon_paths()))
        # PawMark is the existing filled five-oval brand Canvas, not a Lucide stroke glyph.
        available.add("paw-print")
        self.assertIn('PawMark(modifier)', (ROOT / "shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/components/BarkIcon.kt").read_text())
        used = set()
        for path in (ROOT / 'shared/src/commonMain/kotlin/com/dracoarts/shared/presentation').rglob('*.kt'):
            if path.name.startswith('Generated'):
                continue
            source = path.read_text()
            used.update(re.findall(r'BarkIcon\("([^"\n]+)"', source))
            used.update(re.findall(r'icon\s*=\s*"([^"\n]+)"', source))
            for name, slot in [('FeatureRow', 2), ('BoardFactRow', 2), ('BoardHandoff', 0), ('BoardIdentityHeading', 2), ('BoardFolio', 1)]:
                for args in call_arguments(source, name):
                    if len(args) > slot:
                        used.update(returned_icons(args[slot]))
            for line in source.splitlines():
                if path.name == 'BarkIcon.kt':
                    used.update(re.findall(r'"([a-z]+(?:-[a-z0-9]+)*)"', line))
        self.assertFalse(used - available, f'Native icons missing from generated assets: {used - available}')

    def test_icon_slots_ignore_family_names_and_nested_subtitle_values(self):
        source = 'FeatureRow(item.title, "${if (ready) "outside" else "inside"} · $count", when (item.id) { "name-response" -> "target"; else -> "footprints" }, tone = "training")'
        args = list(call_arguments(source, 'FeatureRow'))[0]
        self.assertEqual(returned_icons(args[2]), {'target', 'footprints'})
        self.assertEqual(args[3], 'tone = "training"')

    def test_export_is_reproducible(self):
        self.assertEqual(export.tokens(), export.TARGET.read_text())
        self.assertEqual(export.icon_paths(), export.ICONS.read_text())
        self.assertEqual(export.dog_vector(), export.DOG.read_text())

    def test_both_themes_and_firm_motion_are_pinned(self):
        text = export.tokens()
        for value in ('object Light', 'object Dark', 'pressScale = 0.97f',
                      'releaseDamping = 0.86f', 'riseMs = 420', 'pressDownMs = 90'):
            self.assertIn(value, text)

    def test_icon_subset_contains_only_vector_paths(self):
        text = export.icon_paths()
        self.assertGreaterEqual(text.count(' to listOf('), 24)
        for name in ('utensils', 'droplet', 'footprints', 'shield-check', 'pencil', 'trash'):
            self.assertIn('"' + name + '" to listOf(', text)

    def test_native_review_is_explicit_debug_only(self):
        android = (ROOT / 'androidApp/src/main/kotlin/com/draco/arts/apps/bark/log/dogs/journal/MainActivity.kt').read_text()
        ios = (ROOT / 'iosApp/iosApp/ContentView.swift').read_text()
        self.assertIn('BuildConfig.DEBUG && intent.getBooleanExtra("designReview", false)', android)
        self.assertIn('#if DEBUG', ios)
        self.assertIn('#else\n        let review = false', ios)
        self.assertIn('arguments.contains("-DesignReview")', ios)


if __name__ == '__main__':
    unittest.main()
