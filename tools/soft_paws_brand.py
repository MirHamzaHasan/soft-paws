#!/usr/bin/env python3
"""Derive launcher vectors from the owned Rive cat's SVG and current apricot token."""
from copy import deepcopy
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)
source = ET.parse(ROOT / 'design/soft-paws/assets/cat/companion.svg').getroot()
head = next(node for node in source.iter() if node.get('id') == 'Head')
colour = re.search(r'--peach:\s*(#[\da-fA-F]{6})', (ROOT / 'design/soft-paws/css/tokens.css').read_text()).group(1)

icon = ET.Element(f'{{{SVG}}}svg', {'width': '1024', 'height': '1024', 'viewBox': '0 0 1024 1024'})
ET.SubElement(icon, f'{{{SVG}}}rect', {'width': '1024', 'height': '1024', 'fill': colour})
group = ET.SubElement(icon, f'{{{SVG}}}g', {'transform': 'translate(512 512) scale(3) translate(-241 -222)'})
group.append(deepcopy(head))
brand = ROOT / 'design/soft-paws/assets/brand'
brand.mkdir(exist_ok=True)
(brand / 'app-icon.svg').write_text(ET.tostring(icon, encoding='unicode') + '\n')

def vector(scale, background=False):
    rows = ['<?xml version="1.0" encoding="utf-8"?>',
            '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">']
    if background:
        rows.append(f'  <path android:fillColor="{colour}" android:pathData="M0,0 H108 V108 H0 Z" />')
    rows.append(f'  <group android:scaleX="{scale}" android:scaleY="{scale}" android:translateX="{54 - 241 * scale:.2f}" android:translateY="{54 - 222 * scale:.2f}">')
    for node in head.iter():
        tag = node.tag.split('}')[-1]
        if tag not in {'path', 'ellipse'}:
            continue
        attrs = dict(node.attrib)
        if tag == 'ellipse':
            cx, cy, rx, ry = (float(attrs[key]) for key in ('cx', 'cy', 'rx', 'ry'))
            path = f'M{cx-rx},{cy} a{rx},{ry} 0,1 0,{rx*2},0 a{rx},{ry} 0,1 0,{-rx*2},0'
        else:
            path = attrs['d']
        values = {'pathData': path, 'fillColor': attrs.get('fill', '#000000')}
        if values['fillColor'] == 'none':
            values['fillColor'] = '#00000000'
        for original, native in [('stroke', 'strokeColor'), ('stroke-width', 'strokeWidth'), ('stroke-linecap', 'strokeLineCap'), ('stroke-linejoin', 'strokeLineJoin')]:
            if original in attrs:
                values[native] = attrs[original]
        rows.append('    <path ' + ' '.join(f'android:{key}="{value}"' for key, value in values.items()) + ' />')
    return '\n'.join(rows + ['  </group>', '</vector>', ''])

res = ROOT / 'androidApp/src/main/res'
(res / 'drawable/ic_launcher_foreground.xml').write_text(vector(.20))
for name in ('ic_launcher', 'ic_launcher_round'):
    (res / f'mipmap-anydpi/{name}.xml').write_text(vector(.32, background=True))
    (res / f'mipmap-anydpi-v26/{name}.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/soft_paws_apricot" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/ic_launcher_monochrome" />
</adaptive-icon>
''')
(res / 'values/launcher_colors.xml').write_text(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="soft_paws_apricot">{colour}</color>\n</resources>\n')
print('Soft Paws original cat launcher vectors and editable icon SVG generated.')
