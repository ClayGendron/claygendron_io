"""
Generate a favicon with "cg" rendered in Newsreader serif font.

Usage (from repo root):
    cd backend && uv pip install Pillow requests
    uv run python scripts/generate_favicon.py

Outputs: ../frontend/public/favicon.png (32x32, transparent background)
"""

import io
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required: pip install Pillow")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("requests is required: pip install requests")
    sys.exit(1)

BACKEND_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_ROOT.parent
OUTPUT = REPO_ROOT / "frontend" / "public" / "favicon.png"
FONT_CACHE = BACKEND_ROOT / "scripts" / ".newsreader.ttf"

# Google Fonts CSS API — request TTF format to get a direct font file URL
FONT_CSS_URL = "https://fonts.googleapis.com/css2?family=Newsreader:wght@600&display=swap"


def get_font(size: int) -> ImageFont.FreeTypeFont:
    """Load Newsreader font, downloading if needed."""
    if FONT_CACHE.exists():
        return ImageFont.truetype(str(FONT_CACHE), size)

    import re

    print("Downloading Newsreader font from Google Fonts...")

    # Request with a TTF-compatible user-agent so Google returns .ttf URLs
    headers = {"User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0)"}
    css_resp = requests.get(FONT_CSS_URL, headers=headers, timeout=30)
    css_resp.raise_for_status()

    # Extract the font file URL from the CSS @font-face src
    urls = re.findall(r"url\((https://[^)]+\.ttf)\)", css_resp.text)
    if not urls:
        # Fallback: try woff2 URLs with a modern user-agent
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
        css_resp = requests.get(FONT_CSS_URL, headers=headers, timeout=30)
        urls = re.findall(r"url\((https://[^)]+)\)", css_resp.text)

    if not urls:
        print("ERROR: Could not find font URL in Google Fonts CSS response.")
        sys.exit(1)

    font_resp = requests.get(urls[0], timeout=30)
    font_resp.raise_for_status()
    FONT_CACHE.write_bytes(font_resp.content)
    print(f"  Cached: {FONT_CACHE}")
    return ImageFont.truetype(str(FONT_CACHE), size)


DEBUG_OUTPUT = REPO_ROOT / "frontend" / "public" / "favicon_debug.png"


def generate_favicon(debug=False):
    """Render 'cg' on a terracotta circle as a 32x32 PNG."""
    size = 128
    # Render at 4x for quality, then downsample
    render_size = size * 4
    font = get_font(int(render_size * 0.75))

    # Terracotta color matching the site accent
    terracotta = (194, 69, 45, 255)  # #C2452D
    text_color = (255, 255, 255, 255)

    # Step 1: Render text on a transparent canvas to find true pixel bounds
    tmp = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    tmp_draw = ImageDraw.Draw(tmp)
    tmp_draw.text((0, 0), "cg", fill=(255, 255, 255, 255), font=font)
    # getbbox() returns the actual non-transparent pixel bounding box
    pixel_bbox = tmp.getbbox()

    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw filled circle
    draw.ellipse([0, 0, render_size - 1, render_size - 1], fill=terracotta)

    # Draw crosshairs at center
    if debug:
        c = render_size // 2
        draw.line([(c, 0), (c, render_size)], fill=(255, 255, 0, 128), width=2)
        draw.line([(0, c), (render_size, c)], fill=(255, 255, 0, 128), width=2)

    # Center using actual pixel bounds (not font metrics)
    pw = pixel_bbox[2] - pixel_bbox[0]
    ph = pixel_bbox[3] - pixel_bbox[1]
    x = (render_size - pw) / 2 - pixel_bbox[0] - render_size * 0.01
    y = (render_size - ph) / 2 - pixel_bbox[1] + render_size * 0.03

    draw.text((x, y), "cg", fill=text_color, font=font)

    if debug:
        # Re-render on transparent to get actual placed pixel bounds
        check = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
        check_draw = ImageDraw.Draw(check)
        check_draw.text((x, y), "cg", fill=(255, 255, 255, 255), font=font)
        actual_bbox = check.getbbox()
        draw.rectangle(actual_bbox, outline=(0, 255, 0, 200), width=3)
        center_x = (actual_bbox[0] + actual_bbox[2]) / 2
        center_y = (actual_bbox[1] + actual_bbox[3]) / 2
        print(f"  Canvas: {render_size}x{render_size}")
        print(f"  Pixel bbox: {actual_bbox}")
        print(f"  Pixel center: ({center_x:.1f}, {center_y:.1f})")
        print(f"  Canvas center: {render_size/2}")

    if debug:
        # Save full-res debug version
        DEBUG_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        img.save(str(DEBUG_OUTPUT), "PNG")
        print(f"Debug saved: {DEBUG_OUTPUT} ({render_size}x{render_size})")
    else:
        # Downsample to final size with high-quality resampling
        img = img.resize((size, size), Image.LANCZOS)
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        img.save(str(OUTPUT), "PNG")
        print(f"Favicon saved: {OUTPUT} ({size}x{size})")


if __name__ == "__main__":
    generate_favicon(debug="--debug" in sys.argv)
