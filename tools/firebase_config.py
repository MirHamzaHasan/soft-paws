#!/usr/bin/env python3
"""Check owner-supplied Firebase configs; optionally synchronize Google's iOS URL scheme.

Never prints API keys, tokens or full client config. SDK/provider setup is separate.
"""
import argparse
import json
from pathlib import Path
import plistlib
import re

ROOT = Path(__file__).resolve().parents[1]


def check(sync=False, root=ROOT, android_sha1=None):
    android = json.loads((root / "androidApp/google-services.json").read_text())
    ios = plistlib.loads((root / "iosApp/iosApp/GoogleService-Info.plist").read_bytes())
    build = (root / "androidApp/build.gradle.kts").read_text()
    identity = re.search(r'applicationId\s*=\s*"([^"]+)"', build).group(1)
    clients = [c for c in android.get("client", []) if c.get("client_info", {}).get("android_client_info", {}).get("package_name") == identity]
    if len(clients) != 1:
        raise ValueError("Android Firebase config must contain exactly one matching application ID.")
    pbx = (root / "iosApp/iosApp.xcodeproj/project.pbxproj").read_text()
    if pbx.count(f"PRODUCT_BUNDLE_IDENTIFIER = {ios.get('BUNDLE_ID')};") != 2:
        raise ValueError("iOS Firebase config must match both Debug and Release bundle IDs.")
    if not ios.get("PROJECT_ID") or android.get("project_info", {}).get("project_id") != ios.get("PROJECT_ID"):
        raise ValueError("Android and iOS must use the same Firebase project.")
    print("Firebase project and app identities match on both platforms.")
    oauth = clients[0].get("oauth_client", [])
    if not any(c.get("client_type") == 3 and c.get("client_id") for c in oauth):
        raise ValueError("Android Google OAuth client is missing. Enable Google, add signing fingerprints and download the updated JSON.")
    print("Android Google OAuth client: present")
    if android_sha1 is not None:
        fingerprint = android_sha1.replace(":", "").upper()
        if not re.fullmatch(r"[0-9A-F]{40}", fingerprint):
            raise ValueError("The expected Android SHA-1 must contain 40 hexadecimal digits (colons are optional).")
        registered = any(c.get("client_type") == 1
                         and c.get("android_info", {}).get("package_name") == identity
                         and c.get("android_info", {}).get("certificate_hash", "").replace(":", "").upper() == fingerprint
                         for c in oauth)
        if not registered:
            raise ValueError("The expected Android signing certificate is missing. Register its SHA-1 and download the updated JSON.")
        print("Expected Android signing certificate: present")
    reversed_client = ios.get("REVERSED_CLIENT_ID")
    client = ios.get("CLIENT_ID")
    if not client or not reversed_client:
        raise ValueError("iOS Google OAuth client is missing. Download the updated plist after enabling Google.")
    if reversed_client != ".".join(reversed(client.split("."))):
        raise ValueError("The iOS OAuth client and reversed callback scheme do not match.")
    print("iOS Google OAuth client: present")
    info_path = root / "iosApp/iosApp/Info.plist"
    info = plistlib.loads(info_path.read_bytes())
    if sync and reversed_client:
        types = [t for t in info.get("CFBundleURLTypes", []) if t.get("CFBundleURLName") != "FirebaseGoogleSignIn"]
        types.append({"CFBundleURLName": "FirebaseGoogleSignIn", "CFBundleURLSchemes": [reversed_client]})
        info["CFBundleURLTypes"] = types
        info_path.write_bytes(plistlib.dumps(info, sort_keys=False))
        print("Synchronized the iOS Google sign-in callback scheme.")
    elif reversed_client:
        schemes = [s for t in info.get("CFBundleURLTypes", []) for s in t.get("CFBundleURLSchemes", [])]
        if reversed_client not in schemes:
            raise ValueError("Run python3 tools/firebase_config.py --sync to install the iOS Google callback scheme.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sync", action="store_true")
    parser.add_argument("--android-sha1", help="Require the certificate from signingReport or your keystore in the Android OAuth config")
    try:
        args = parser.parse_args()
        check(sync=args.sync, android_sha1=args.android_sha1)
    except (OSError, ValueError, KeyError) as error:
        parser.exit(1, f"Firebase config check failed: {error}\n")
