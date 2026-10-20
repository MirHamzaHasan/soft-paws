#!/usr/bin/env python3
"""Inspect native-rendered PNG transparency and review-surface text contrast."""
from pathlib import Path
import json
import struct
import sys
import zlib


def rgba(path):
    data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', data[16:29])
    assert (depth, color, compression, filtering, interlace) == (8, 6, 0, 0, 0)
    offset = 8
    compressed = b''
    while offset < len(data):
        length = struct.unpack('>I', data[offset:offset+4])[0]
        if data[offset+4:offset+8] == b'IDAT':
            compressed += data[offset+8:offset+8+length]
        offset += length + 12
    raw = zlib.decompress(compressed)
    stride = width * 4
    previous = bytearray(stride)
    rows = []
    for y in range(height):
        method = raw[y*(stride+1)]
        row = bytearray(raw[y*(stride+1)+1:(y+1)*(stride+1)])
        for x in range(stride):
            a = row[x-4] if x >= 4 else 0
            b = previous[x]
            c = previous[x-4] if x >= 4 else 0
            if method == 1:
                prediction = a
            elif method == 2:
                prediction = b
            elif method == 3:
                prediction = (a+b)//2
            elif method == 4:
                p = a+b-c
                distances = (abs(p-a), abs(p-b), abs(p-c))
                prediction = (a,b,c)[distances.index(min(distances))]
            else:
                assert method == 0
                prediction = 0
            row[x] = (row[x] + prediction) % 256
        rows.append(row)
        previous = row
    occupied = [(x,y) for y,row in enumerate(rows) for x in range(width) if row[x*4+3] > 0]
    assert occupied
    bounds = [min(p[0] for p in occupied), min(p[1] for p in occupied), max(p[0] for p in occupied), max(p[1] for p in occupied)]
    assert bounds[0] > 0 and bounds[1] > 0 and bounds[2] < width-1 and bounds[3] < height-1, (path, bounds)
    return {'file':path.name,'width':width,'height':height,'opaqueBounds':bounds,'transparentEdges':True}


def contrast(a,b):
    def luminance(c):
        values=[int(c[i:i+2],16)/255 for i in (1,3,5)]
        linear=[v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values]
        return sum(x*y for x,y in zip(linear,(.2126,.7152,.0722)))
    aa,bb=sorted((luminance(a),luminance(b)))
    return (bb+.05)/(aa+.05)


if __name__ == '__main__':
    folder=Path(sys.argv[1] if len(sys.argv)>1 else '.verify-build/task030/glax-frames')
    frames=[rgba(path) for path in sorted(folder.glob('*.png'))]
    assert len(frames)==20
    colors=[]
    for theme,ink,muted,paper,panel in [('light','#17221b','#55615a','#F3F1E9','#fffefa'),('dark','#f4f3e9','#b9c4ba','#16211c','#202d25')]:
        for text in (ink,muted):
            for ground in (paper,panel):
                ratio=contrast(text,ground)
                assert ratio>=4.5
                colors.append({'theme':theme,'text':text,'ground':ground,'ratio':round(ratio,2)})
    for text in ('#17221b','#405026'):
        ratio=contrast(text,'#daf547');assert ratio>=4.5
        colors.append({'theme':'accent','text':text,'ground':'#daf547','ratio':round(ratio,2)})
    result={'nativeFrames':frames,'textContrast':colors}
    (folder.parent/'asset-validation.json').write_text(json.dumps(result,indent=2)+'\n')
    print(f'{len(frames)} native frames: transparent edges and no clipping; {len(colors)} text pairs meet 4.5:1')
