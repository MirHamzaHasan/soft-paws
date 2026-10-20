#!/usr/bin/env python3
"""Create the synthetic scene for explicit native AI acceptance; no downloads."""
from pathlib import Path
import argparse
import struct
import zlib


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path, help="Directory containing the explicitly staged model files")
    directory = parser.parse_args().directory
    directory.mkdir(parents=True, exist_ok=True)
    size = 384
    pixels = b"".join(
        b"\0" + b"".join(
            bytes((255, 0, 0)) if 72 <= x < 312 and 72 <= y < 312 else bytes((255, 255, 255))
            for x in range(size)
        ) for y in range(size)
    )

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack("!I", len(data)) + tag + data + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack("!2I5B", size, size, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(pixels)) + chunk(b"IEND", b"")
    (directory / "synthetic-square.png").write_bytes(png)
    print("Prepared synthetic red-square scene; no personal photo used.")


if __name__ == "__main__":
    main()
