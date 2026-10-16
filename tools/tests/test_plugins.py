from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

TOOLS = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("plugins", TOOLS / "plugins.py")
plugins = importlib.util.module_from_spec(spec)
spec.loader.exec_module(plugins)


class PluginCommandsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="draco-plugin-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        (self.root / "template").mkdir()
        self.config = {"schemaVersion": 1, "plugins": [
            {"id": plugin_id, "enabled": True} for plugin_id in sorted(plugins.BUILTINS)
        ]}
        self.write_manifest()

    def write_manifest(self):
        (self.root / plugins.MANIFEST).write_text(json.dumps(self.config), encoding="utf-8")

    def test_new_plugin_is_disabled_and_does_not_replace_existing_code(self):
        plugins.create("crash-reporting", self.root)
        config = plugins.load(self.root)
        entry = next(p for p in config["plugins"] if p["id"] == "crash-reporting")
        self.assertFalse(entry["enabled"])
        source = self.root / plugins.SOURCE / "services/plugins/CrashReportingPlugin.kt"
        source.write_text("product implementation", encoding="utf-8")
        with self.assertRaises(ValueError):
            plugins.create("crash-reporting", self.root)
        self.assertEqual("product implementation", source.read_text(encoding="utf-8"))

    def test_enable_disable_changes_registration_and_stale_check_fails(self):
        plugins.create("search", self.root)
        config = plugins.load(self.root)
        entry = next(p for p in config["plugins"] if p["id"] == "search")
        entry["enabled"] = True
        plugins.save(config, self.root)
        source = (self.root / plugins.GENERATED).read_text(encoding="utf-8")
        self.assertIn("SearchPlugin(managers)", source)
        plugins.synchronize(self.root, check=True)
        entry["enabled"] = False
        (self.root / plugins.MANIFEST).write_text(json.dumps(config), encoding="utf-8")
        with self.assertRaises(ValueError):
            plugins.synchronize(self.root, check=True)
        plugins.synchronize(self.root)
        self.assertNotIn("SearchPlugin(managers)", (self.root / plugins.GENERATED).read_text(encoding="utf-8"))

    def test_rejects_unknown_fields_ids_versions_and_factory_injection(self):
        invalid = [
            {"id": "local-data", "enabled": True},
            {"id": "../outside", "enabled": False, "factory": "com.example.Plugin"},
            {"id": "search", "enabled": "false", "factory": "com.example.Plugin"},
            {"id": "search", "enabled": True, "factory": 'com.example.Plugin(); error("x")'},
            {"id": "auth", "enabled": True},
            {"id": "search", "enabled": True, "factory": "com.example.Plugin", "secret": "x"},
        ]
        for entry in invalid:
            with self.subTest(entry=entry):
                self.config["plugins"].append(entry)
                self.write_manifest()
                with self.assertRaises(ValueError):
                    plugins.load(self.root)
                self.config["plugins"].pop()
        self.config["schemaVersion"] = True
        self.write_manifest()
        with self.assertRaises(ValueError):
            plugins.load(self.root)

    def test_missing_builtin_and_duplicate_json_keys_fail(self):
        self.config["plugins"].pop()
        self.write_manifest()
        with self.assertRaises(ValueError):
            plugins.load(self.root)
        (self.root / plugins.MANIFEST).write_text('{"schemaVersion":1,"schemaVersion":1,"plugins":[]}', encoding="utf-8")
        with self.assertRaises(ValueError):
            plugins.load(self.root)

    def test_reserved_and_existing_paths_are_not_overwritten(self):
        with self.assertRaises(ValueError):
            plugins.create("local-data", self.root)
        outside = self.root.parent / "outside"
        with self.assertRaises(ValueError):
            plugins.create("../outside", self.root)
        self.assertFalse(outside.exists())
        guide = self.root / "docs/plugins/search.md"
        guide.parent.mkdir(parents=True)
        guide.write_text("keep", encoding="utf-8")
        with self.assertRaises(ValueError):
            plugins.create("search", self.root)
        self.assertEqual("keep", guide.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
