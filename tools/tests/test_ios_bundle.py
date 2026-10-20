import importlib.util
from pathlib import Path
import plistlib
import tempfile
import unittest
from contextlib import redirect_stdout
import io

spec = importlib.util.spec_from_file_location("check_ios_bundle", Path(__file__).resolve().parents[1] / "check_ios_bundle.py")
bundle_check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bundle_check)


class IosBundleTests(unittest.TestCase):
    def test_inherited_firebase_registration_is_rejected_before_runtime(self):
        with tempfile.TemporaryDirectory() as root:
            bundle = self.fixture(root)
            (bundle / "GoogleService-Info.plist").write_bytes(plistlib.dumps({
                "BUNDLE_ID": "com.draco.apps.bark.log", "PROJECT_ID": "bark-log",
            }))
            with self.assertRaisesRegex(ValueError, "inherited Firebase registration"):
                bundle_check.check("Debug", bundle)

    def fixture(self, root):
        bundle = Path(root) / "iosApp.app"
        bundle.mkdir()
        (bundle / "Info.plist").write_bytes(plistlib.dumps({
            "CFBundleIdentifier": "com.draco.apps.soft.paws",
            "CFBundleDisplayName": "Soft Paws",
            "CFBundleShortVersionString": "1.0.0",
            "CFBundleVersion": "1",
            "CADisableMinimumFrameDurationOnPhone": True,
            "NSLocationWhenInUseUsageDescription": "Find animal emergency services and nearby veterinary clinics in your area when you ask. You can enter a city instead.",
            "NSCameraUsageDescription": "Take a photo for your cat profile or care record when you choose Take photo.",
        }))
        return bundle

    def test_fonts_in_wrong_location_do_not_mask_missing_compose_resources(self):
        with tempfile.TemporaryDirectory() as root:
            bundle = self.fixture(root)
            for name in ("inter_regular.ttf", "inter_medium.ttf", "Inter-OFL.txt"):
                (bundle / name).write_bytes(b"fixture")
            with self.assertRaisesRegex(ValueError, "Compose runtime resource missing"):
                bundle_check.check("Debug", bundle)

    def test_camera_purpose_is_required_and_unrelated_permissions_are_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            bundle = self.fixture(root)
            resources = bundle / "compose-resources/composeResources/com.dracoarts.shared.generated.resources"
            for relative in bundle_check.FONT_RESOURCES:
                resource = resources / relative
                resource.parent.mkdir(parents=True, exist_ok=True)
                resource.write_bytes(b"fixture")
            path = bundle / "Info.plist"
            info = plistlib.loads(path.read_bytes())
            info.pop("NSCameraUsageDescription")
            path.write_bytes(plistlib.dumps(info))
            with self.assertRaisesRegex(ValueError, "NSCameraUsageDescription"):
                bundle_check.check("Debug", bundle)
            info["NSCameraUsageDescription"] = "Take a photo for your cat profile or care record when you choose Take photo."
            info["NSMicrophoneUsageDescription"] = "Not part of the photo action"
            path.write_bytes(plistlib.dumps(info))
            with self.assertRaisesRegex(ValueError, "unexpected privacy permission"):
                bundle_check.check("Debug", bundle)

    def test_exact_compose_resource_layout_is_required_for_alternate_test_host(self):
        with tempfile.TemporaryDirectory() as root:
            bundle = self.fixture(root)
            resources = bundle / "compose-resources/composeResources/com.dracoarts.shared.generated.resources"
            for relative in bundle_check.FONT_RESOURCES:
                resource = resources / relative
                resource.parent.mkdir(parents=True, exist_ok=True)
                resource.write_bytes(b"fixture")
            with redirect_stdout(io.StringIO()):
                bundle_check.check("Debug", bundle)
            (resources / "font/inter_regular.ttf").write_bytes(b"")
            with self.assertRaisesRegex(ValueError, "Compose runtime resource missing"):
                bundle_check.check("Debug", bundle)
