#!/usr/bin/env python3
"""Install a separate native Files input fixture on an explicitly named simulator."""
from pathlib import Path
import argparse, plistlib, subprocess

root = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--device', required=True, help='Owned simulator UUID; never inferred from other booted devices.')
args = parser.parse_args()
app = root / '.verify-build/soft-paws-document-fixture/SoftPawsQAFiles.app'
app.mkdir(parents=True, exist_ok=True)
sdk = subprocess.check_output(['xcrun', '--sdk', 'iphonesimulator', '--show-sdk-path'], text=True).strip()
subprocess.run(['xcrun', 'swiftc', '-parse-as-library', '-sdk', sdk, '-target', 'arm64-apple-ios16.6-simulator',
                str(Path(__file__).with_name('IOSFilesFixture.swift')), '-o', str(app / 'SoftPawsQAFiles')], check=True)
with (app / 'Info.plist').open('wb') as stream:
    plistlib.dump({'CFBundleIdentifier': 'com.draco.qa.softpaws.files', 'CFBundleExecutable': 'SoftPawsQAFiles',
                  'CFBundleName': 'SoftPawsQAFiles', 'CFBundleDisplayName': 'SoftPaws QA Files',
                  'CFBundlePackageType': 'APPL', 'CFBundleVersion': '1', 'CFBundleShortVersionString': '1.0',
                  'MinimumOSVersion': '16.6', 'LSRequiresIPhoneOS': True, 'UIDeviceFamily': [1, 2],
                  'UIFileSharingEnabled': True, 'LSSupportsOpeningDocumentsInPlace': True, 'UILaunchScreen': {}}, stream)
subprocess.run(['codesign', '--force', '--sign', '-', str(app)], check=True)
subprocess.run(['xcrun', 'simctl', 'install', args.device, str(app)], check=True)
subprocess.run(['xcrun', 'simctl', 'launch', '--terminate-running-process', args.device, 'com.draco.qa.softpaws.files'], check=True)
