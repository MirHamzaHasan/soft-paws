#!/usr/bin/env python3
"""Verify the BarkLog KMP foundation and Android; optionally build both iOS host configurations."""

from __future__ import annotations

import argparse
from pathlib import Path
import platform
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str]) -> None:
    print("Running: " + " ".join(command), flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata-only", action="store_true", help="Check scripts/configuration without platform builds")
    parser.add_argument("--isolated", action="store_true", help="Use .verify-build instead of normal Gradle build folders")
    parser.add_argument("--ios", action="store_true", help="Also build the Swift host in debug/release (requires macOS/Xcode)")
    args = parser.parse_args()
    if args.ios and args.metadata_only:
        parser.error("--ios and --metadata-only cannot be combined.")
    if args.ios and (platform.system() != "Darwin" or shutil.which("xcodebuild") is None):
        parser.error("iOS host verification requires macOS with Xcode.")
    run([sys.executable, "tools/check_foundation.py"])
    run([sys.executable, "tools/design_tokens.py", "--check"])
    run([sys.executable, "tools/check_native_parity.py"])
    run([sys.executable, "tools/plugins.py", "check"])
    run([sys.executable, "-m", "unittest", "discover", "-s", "tools/tests", "-v"])
    if args.metadata_only:
        print("BarkLog metadata checks passed. Platform builds were not requested.")
        return 0
    java = shutil.which("java")
    if java is None:
        raise RuntimeError("Install JDK 17+ and make java available on PATH.")
    command = [java, "-classpath", str(ROOT / "gradle/wrapper/gradle-wrapper.jar"),
               "org.gradle.wrapper.GradleWrapperMain", ":androidApp:assembleDebug",
               ":androidApp:assembleRelease", ":androidApp:lintDebug", ":androidApp:testDebugUnitTest",
               ":shared:verifySqlDelightMigration",
               "--console=plain", "--max-workers=2"]
    if args.isolated:
        command += ["--init-script", "tools/isolated-build.gradle.kts", "--no-build-cache"]
    run(command)
    if args.ios:
        for configuration in ("Debug", "Release"):
            run(["xcodebuild", "-quiet", "-project", "iosApp/iosApp.xcodeproj", "-scheme", "iosApp",
                 "-configuration", configuration, "-sdk", "iphonesimulator", "-destination",
                 "generic/platform=iOS Simulator", "-derivedDataPath", ".verify-build/xcode",
                 "ARCHS=arm64", "CODE_SIGNING_ALLOWED=NO", "build"])
            run([sys.executable, "tools/check_ios_bundle.py", configuration])
    print("Requested verification passed." + (" iOS was not built; use --ios on a Mac." if not args.ios else ""))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Verification failed: {error}", file=sys.stderr)
        sys.exit(1)
