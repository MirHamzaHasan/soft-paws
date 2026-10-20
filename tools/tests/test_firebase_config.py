import importlib.util
import io
import json
from pathlib import Path
import plistlib
import tempfile
import unittest
from contextlib import redirect_stdout

spec = importlib.util.spec_from_file_location("firebase_config", Path(__file__).resolve().parents[1] / "firebase_config.py")
firebase = importlib.util.module_from_spec(spec)
spec.loader.exec_module(firebase)


class FirebaseConfigTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.identity = "com.draco.apps.bark.log"
        self.sha1 = "AB" * 20
        self.client = {
            "client_info": {"android_client_info": {"package_name": self.identity}},
            "oauth_client": [
                {"client_type": 3, "client_id": "fixture-web.apps.googleusercontent.com"},
                {"client_type": 1, "android_info": {"package_name": self.identity, "certificate_hash": self.sha1}},
            ],
        }
        self.android = {"project_info": {"project_id": "fixture-project"}, "client": [self.client]}
        self.ios = {"BUNDLE_ID": self.identity, "PROJECT_ID": "fixture-project",
                    "CLIENT_ID": "fixture-ios.apps.googleusercontent.com",
                    "REVERSED_CLIENT_ID": "com.googleusercontent.apps.fixture-ios"}
        for directory in ("androidApp", "iosApp/iosApp", "iosApp/iosApp.xcodeproj"):
            (self.root / directory).mkdir(parents=True, exist_ok=True)
        (self.root / "androidApp/build.gradle.kts").write_text(f'applicationId = "{self.identity}"')
        (self.root / "iosApp/iosApp.xcodeproj/project.pbxproj").write_text(f"PRODUCT_BUNDLE_IDENTIFIER = {self.identity};\n" * 2)
        self.info = self.root / "iosApp/iosApp/Info.plist"
        self.info.write_bytes(plistlib.dumps({"CFBundleURLTypes": [
            {"CFBundleURLName": "OtherFeature", "CFBundleURLSchemes": ["keep-this"]},
            {"CFBundleURLName": "FirebaseGoogleSignIn", "CFBundleURLSchemes": [self.ios["REVERSED_CLIENT_ID"]]},
        ]}))
        self.write_configs()

    def write_configs(self):
        (self.root / "androidApp/google-services.json").write_text(json.dumps(self.android))
        (self.root / "iosApp/iosApp/GoogleService-Info.plist").write_bytes(plistlib.dumps(self.ios))

    def check(self, **kwargs):
        with redirect_stdout(io.StringIO()):
            firebase.check(root=self.root, **kwargs)

    def test_matching_oauth_and_colon_separated_certificate_pass(self):
        self.check(android_sha1=":".join(["ab"] * 20))

    def test_missing_web_client_fails_instead_of_claiming_readiness(self):
        for oauth in ([], [{"client_type": 3, "client_id": ""}]):
            with self.subTest(oauth=oauth):
                self.client["oauth_client"] = oauth
                self.write_configs()
                with self.assertRaisesRegex(ValueError, "Android Google OAuth client is missing"):
                    self.check()

    def test_certificate_must_match_the_installed_package(self):
        with self.assertRaisesRegex(ValueError, "signing certificate is missing"):
            self.check(android_sha1="CD" * 20)
        self.client["oauth_client"][1]["android_info"]["package_name"] = "another.app"
        self.write_configs()
        with self.assertRaisesRegex(ValueError, "signing certificate is missing"):
            self.check(android_sha1=self.sha1)
        with self.assertRaisesRegex(ValueError, "40 hexadecimal"):
            self.check(android_sha1="not-a-fingerprint")

    def test_missing_ios_client_and_mismatched_callback_are_rejected(self):
        self.ios.pop("CLIENT_ID")
        self.write_configs()
        with self.assertRaisesRegex(ValueError, "iOS Google OAuth client is missing"):
            self.check()
        self.ios["CLIENT_ID"] = "changed-client.apps.googleusercontent.com"
        self.write_configs()
        with self.assertRaisesRegex(ValueError, "reversed callback scheme do not match"):
            self.check()

    def test_sync_replaces_stale_google_callback_and_preserves_other_schemes(self):
        info = plistlib.loads(self.info.read_bytes())
        info["CFBundleURLTypes"][1]["CFBundleURLSchemes"] = ["stale-google-callback"]
        self.info.write_bytes(plistlib.dumps(info))
        with self.assertRaisesRegex(ValueError, "--sync"):
            self.check()
        self.check(sync=True)
        self.check()
        schemes = [s for t in plistlib.loads(self.info.read_bytes())["CFBundleURLTypes"] for s in t["CFBundleURLSchemes"]]
        self.assertEqual(["keep-this", self.ios["REVERSED_CLIENT_ID"]], schemes)

    def test_mixed_projects_are_rejected(self):
        self.ios["PROJECT_ID"] = "another-project"
        self.write_configs()
        with self.assertRaisesRegex(ValueError, "same Firebase project"):
            self.check()
