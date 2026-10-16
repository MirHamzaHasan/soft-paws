#!/usr/bin/env python3
"""Check BarkLog identities, free/local integration policy and repository documentation."""

from pathlib import Path
import json
import plistlib
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def check() -> None:
    errors = []
    for name in ("package.json", "pnpm-lock.yaml", "app.json", "metro.config.js",
                 "node_modules", "app", "src", "ios", "android"):
        if (ROOT / name).exists():
            errors.append(f"Retired runtime path remains: {name}")

    android = (ROOT / "androidApp/build.gradle.kts").read_text()
    ios = (ROOT / "iosApp/iosApp.xcodeproj/project.pbxproj").read_text()
    if 'applicationId = "com.draco.arts.apps.bark.log.dogs.journal"' not in android:
        errors.append("Android identity does not match BarkLog.")
    if ios.count("PRODUCT_BUNDLE_IDENTIFIER = com.dracoarts.barklog;") != 2:
        errors.append("iOS Debug/Release identities do not match BarkLog.")
    if ios.count('INFOPLIST_KEY_CFBundleDisplayName = "BarkLog";') != 2:
        errors.append("iOS display name does not match BarkLog.")
    info = plistlib.loads((ROOT / "iosApp/iosApp/Info.plist").read_bytes())
    if info.get("CADisableMinimumFrameDurationOnPhone") is not True:
        errors.append("Compose's required iPhone frame-duration plist setting is absent.")
    if ios.count("INFOPLIST_FILE = iosApp/Info.plist;") != 2:
        errors.append("Both iOS configurations must use BarkLog's Info.plist.")

    plugins = json.loads((ROOT / "template/plugins.json").read_text())["plugins"]
    prohibited = {"auth", "analytics", "ads", "purchases"}
    if any(p["enabled"] and p["id"] in prohibited for p in plugins):
        errors.append("Removed account/telemetry/paid providers cannot be enabled in this foundation.")

    catalog = (ROOT / "gradle/libs.versions.toml").read_text()
    for marker in ("com.applovin", "com.android.billingclient", "AppLovinSDK", "PostHog", "RevenueCat"):
        if marker in catalog + android + ios:
            errors.append(f"Unwanted dependency remains: {marker}")
    manifest = ET.parse(ROOT / "androidApp/src/main/AndroidManifest.xml")
    permissions = {
        el.attrib.get("{http://schemas.android.com/apk/res/android}name")
        for el in manifest.findall("uses-permission")
    }
    expected_permissions = {"android.permission.VIBRATE", "android.permission.POST_NOTIFICATIONS", "android.permission.RECEIVE_BOOT_COMPLETED"}
    if permissions != expected_permissions:
        errors.append(f"Unexpected BarkLog permission set: {permissions}")

    for name in ("inter_regular.ttf", "inter_medium.ttf", "bricolage_bold.ttf", "bricolage_extra_bold.ttf", "bricolage_numbers.ttf", "bricolage_section.ttf"):
        if not (ROOT / "shared/src/commonMain/composeResources/font" / name).is_file():
            errors.append(f"Bundled board font missing: {name}")
    if "compose.ios.resources.sync=false" in (ROOT / "gradle.properties").read_text():
        errors.append("iOS Compose resources must be synchronized for the bundled fonts.")

    # Resolve local Markdown destinations; generated/private/build directories are excluded.
    documents = [ROOT / "README.md", ROOT / "AGENTS.md"]
    documents += list((ROOT / "docs").rglob("*.md"))
    documents += list((ROOT / "tasks").rglob("*.md"))
    documents += list((ROOT / ".agents").rglob("*.md"))
    for document in documents:
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", document.read_text()):
            target = target.strip().split(" ")[0].strip("<>")
            parsed = urllib.parse.urlsplit(target)
            if parsed.scheme or not parsed.path:
                continue
            resolved = (document.parent / urllib.parse.unquote(parsed.path)).resolve()
            if not resolved.exists():
                errors.append(f"Broken link in {document.relative_to(ROOT)}: {target}")

    if errors:
        raise ValueError("\n".join(errors))
    print("BarkLog identities, local/free policy, resources and documentation links passed.")


if __name__ == "__main__":
    try:
        check()
    except (OSError, ValueError, ET.ParseError) as error:
        print(f"Foundation check failed: {error}", file=sys.stderr)
        sys.exit(1)
