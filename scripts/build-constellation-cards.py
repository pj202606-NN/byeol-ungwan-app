"""Build display-sized WebP cards from preserved JPEG originals (requires Pillow)."""

from pathlib import Path

from PIL import Image, ImageOps


CARD_ROOT = Path(__file__).resolve().parents[1] / "src/assets/images/constellations/cards"


def main():
    sources = sorted(CARD_ROOT.glob("*/*.jpg"))
    if len(sources) != 28:
        raise ValueError(f"Expected 28 constellation cards, found {len(sources)}")
    total = 0
    for source in sources:
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            # At least 3x the mobile card width; keep the original aspect ratio.
            image.thumbnail((640, 1600), Image.Resampling.LANCZOS)
            target = source.with_suffix(".webp")
            image.save(target, "WEBP", quality=90, method=6)
            total += target.stat().st_size
    print(f"Built {len(sources)} WebP cards: {total:,} bytes (JPEG originals preserved)")


if __name__ == "__main__":
    main()
