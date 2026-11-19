"""Build the one missing app hanja from Adobe's unmodified Pan-CJK Korean font.

python scripts/build-serif-supplement.py review/SourceHanSerifK-VF.otf.woff2
Requires fonttools[woff]. Original revision and license: FONT_LICENSES.md.
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

font = TTFont(sys.argv[1])
assert 0x8C89 in font.getBestCmap()
options = subset.Options()
options.name_IDs = ["*"]
options.name_languages = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=[0x8C89])
subsetter.subset(font)
# Adobe reserves 'Source': rename the modified font's family/unique/PS names.
# Original copyright and OFL records are preserved.
for record in font["name"].names:
    if record.nameID in (1, 3, 4, 16):
        record.string = "Byeolungwan Serif Supplement".encode(record.getEncoding())
    elif record.nameID in (6, 25):
        record.string = "ByeolungwanSerifSupplement".encode(record.getEncoding())
font.flavor = "woff2"
destination = Path(__file__).resolve().parents[1] / "src/assets/fonts/source-han-serif/ByeolungwanSerifSupplement.woff2"
font.save(destination)
print(f"Created {destination.name}: {destination.stat().st_size} bytes")
