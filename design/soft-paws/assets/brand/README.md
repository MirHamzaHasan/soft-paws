# Soft Paws launcher icon

The face is derived from `../cat/companion.svg`, the original owned Rive cat.
The opaque apricot ground comes from the light `--peach` colour token.
No third-party artwork is included.

`python3 tools/soft_paws_brand.py` regenerates the editable 1024 × 1024 SVG,
Android foreground, adaptive grounds and legacy launcher vectors. The separate
monochrome vector provides a simplified cat silhouette for system-themed icons.

The iOS PNG is a browser render of `app-icon.svg`, exported as opaque RGB at
1024 × 1024. The source remains vector. Use the board's capture tool at that
size and remove the PNG alpha channel when regenerating the store icon.
