from pathlib import Path
import sys

from PIL import Image, ImageOps


directory_name = sys.argv[1] if len(sys.argv) > 1 else "venezia-granite"
image_directory = Path(__file__).resolve().parents[1] / "public" / directory_name

if not image_directory.is_dir():
    raise SystemExit(f"Папка не найдена: {image_directory}")

image_paths = sorted(image_directory.glob("*.webp"))

before = sum(path.stat().st_size for path in image_paths)

for index, image_path in enumerate(image_paths, start=1):
    temporary_path = image_path.with_suffix(".optimized.webp")

    with Image.open(image_path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        image.thumbnail((900, 600), Image.Resampling.LANCZOS)
        image.save(temporary_path, "WEBP", quality=76, method=6)

    temporary_path.replace(image_path)

    if index % 25 == 0 or index == len(image_paths):
        print(f"Оптимизировано: {index}/{len(image_paths)}")

after = sum(path.stat().st_size for path in image_paths)
print(f"Размер: {before / 1024 / 1024:.1f} МБ -> {after / 1024 / 1024:.1f} МБ")
