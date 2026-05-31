from __future__ import annotations

from io import BytesIO

import httpx
from PIL import Image


def average_hash(image_bytes: bytes, hash_size: int = 8) -> str:
    image = Image.open(BytesIO(image_bytes)).convert("L").resize((hash_size, hash_size))
    pixels = list(image.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if pixel >= avg else "0" for pixel in pixels)
    return f"{int(bits, 2):0{hash_size * hash_size // 4}x}"


def hamming_distance(left: str, right: str) -> int:
    return bin(int(left, 16) ^ int(right, 16)).count("1")


def confidence_from_distance(distance: int, hash_bits: int = 64) -> float:
    return max(0, 1 - (distance / hash_bits))


async def hash_remote_image(url: str) -> str | None:
    try:
      async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
          response = await client.get(url)
          response.raise_for_status()
          return average_hash(response.content)
    except Exception:
        return None
