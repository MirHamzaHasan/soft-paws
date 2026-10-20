#!/usr/bin/env python3
"""Verify the generated iOS bundle, including the resources required at runtime."""

from pathlib import Path
import argparse
import plistlib
import sys

ROOT = Path(__file__).resolve().parents[1]
FONT_RESOURCES = ("font/inter_regular.ttf", "font/inter_medium.ttf", "files/Inter-OFL.txt",
                  "font/bricolage_bold.ttf", "font/bricolage_extra_bold.ttf",
                  "font/bricolage_numbers.ttf", "font/bricolage_section.ttf", "files/BricolageGrotesque-OFL.txt")


def check(configuration: str, bundle: Path | None = None) -> None:
    bundle = bundle or ROOT / f".verify-build/soft-paws-xcode/Build/Products/{configuration}-iphonesimulator/iosApp.app"
    info = plistlib.loads((bundle / "Info.plist").read_bytes())
    expected = {
        "CFBundleIdentifier": "com.draco.apps.soft.paws",
        "CFBundleDisplayName": "Soft Paws",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "CADisableMinimumFrameDurationOnPhone": True,
        "NSLocationWhenInUseUsageDescription": "Find animal emergency services and nearby veterinary clinics in your area when you ask. You can enter a city instead.",
        "NSCameraUsageDescription": "Take a photo for your cat profile or care record when you choose Take photo.",
    }
    for key, value in expected.items():
        if info.get(key) != value:
            raise ValueError(f"{configuration}: generated {key} does not match {value!r}.")
    if (bundle / "GoogleService-Info.plist").exists():
        raise ValueError(f"{configuration}: inherited Firebase registration must not be bundled in Soft Paws.")
    if info.get("CFBundleURLTypes"):
        raise ValueError(f"{configuration}: service callbacks are deferred until Soft Paws has its own registration.")
    resources = bundle / "compose-resources/composeResources/com.dracoarts.shared.generated.resources"
    for relative in FONT_RESOURCES:
        resource = resources / relative
        if not resource.is_file() or resource.stat().st_size == 0:
            raise ValueError(f"{configuration}: Compose runtime resource missing: {relative}.")
    if any(key.startswith("NS") and key.endswith("UsageDescription") and key not in {"NSCameraUsageDescription", "NSLocationWhenInUseUsageDescription"} for key in info):
        raise ValueError(f"{configuration}: unexpected privacy permission outside the optional camera/area actions.")
    print(f"{configuration} iOS bundle identity, runtime plist and Bricolage/Inter resources passed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("configuration", choices=("Debug", "Release"))
    parser.add_argument("--bundle", type=Path, help="Inspect the exact app built for an alternate DerivedData/test host")
    args = parser.parse_args()
    try:
        check(args.configuration, args.bundle)
    except (OSError, ValueError) as error:
        print(f"iOS bundle check failed: {error}", file=sys.stderr)
        sys.exit(1)
