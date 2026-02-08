#!/usr/bin/env python3
"""
Comic Image Processing Utility

This utility provides image optimization and processing functions for comic book pages:
- Resize images to optimal viewing dimensions
- Compress images to reduce file size
- Convert images to web-friendly formats
- Batch processing for multiple images
- Generate thumbnails for cover images

Requirements:
- Python 3.7+
- Pillow (PIL) library

Usage:
    python image_processor.py input_image.jpg output_image.jpg --width 1200 --quality 85
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: Pillow library not installed. Install with: pip install Pillow")


class ComicImageProcessor:
    """Handles comic image optimization and processing"""

    def __init__(self, max_width=1200, max_height=1800, quality=85):
        """
        Initialize the image processor.

        Args:
            max_width (int): Maximum width for images
            max_height (int): Maximum height for images
            quality (int): JPEG quality (1-100)
        """
        self.max_width = max_width
        self.max_height = max_height
        self.quality = quality

    def optimize_image(self, input_path, output_path=None):
        """
        Optimize a single comic page image.

        Args:
            input_path (str): Path to input image
            output_path (str): Path to save optimized image (optional)

        Returns:
            str: Path to optimized image
        """
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow library is required for image processing")

        if output_path is None:
            output_path = self._generate_output_path(input_path)

        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            original_width, original_height = img.size
            width_ratio = self.max_width / original_width
            height_ratio = self.max_height / original_height
            resize_ratio = min(width_ratio, height_ratio, 1.0)

            if resize_ratio < 1.0:
                new_width = int(original_width * resize_ratio)
                new_height = int(original_height * resize_ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            img.save(output_path, 'JPEG', quality=self.quality, optimize=True)

        return output_path

    def create_thumbnail(self, input_path, output_path=None, size=(400, 600)):
        """
        Create a thumbnail from a comic cover image.

        Args:
            input_path (str): Path to input image
            output_path (str): Path to save thumbnail
            size (tuple): Thumbnail size (width, height)

        Returns:
            str: Path to thumbnail image
        """
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow library is required for image processing")

        if output_path is None:
            output_path = self._generate_output_path(input_path, suffix='_thumb')

        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(output_path, 'JPEG', quality=90, optimize=True)

        return output_path

    def batch_optimize(self, input_dir, output_dir=None):
        """
        Optimize all images in a directory.

        Args:
            input_dir (str): Directory containing input images
            output_dir (str): Directory to save optimized images

        Returns:
            list: List of paths to optimized images
        """
        if output_dir is None:
            output_dir = os.path.join(input_dir, 'optimized')

        Path(output_dir).mkdir(parents=True, exist_ok=True)

        supported_formats = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
        optimized_images = []

        for file_path in Path(input_dir).iterdir():
            if file_path.suffix.lower() in supported_formats:
                output_path = os.path.join(output_dir, f"{file_path.stem}.jpg")
                try:
                    self.optimize_image(str(file_path), output_path)
                    optimized_images.append(output_path)
                    print(f"Optimized: {file_path.name} -> {output_path}")
                except Exception as e:
                    print(f"Error processing {file_path.name}: {str(e)}")

        return optimized_images

    def _generate_output_path(self, input_path, suffix='_optimized'):
        """Generate output path for processed image"""
        path = Path(input_path)
        return str(path.parent / f"{path.stem}{suffix}.jpg")

    def get_image_info(self, image_path):
        """
        Get information about an image.

        Args:
            image_path (str): Path to image

        Returns:
            dict: Image information (dimensions, format, size)
        """
        if not PIL_AVAILABLE:
            raise RuntimeError("Pillow library is required for image processing")

        with Image.open(image_path) as img:
            return {
                'width': img.width,
                'height': img.height,
                'format': img.format,
                'mode': img.mode,
                'file_size': os.path.getsize(image_path)
            }


def main():
    """Command-line interface for image processing"""
    if len(sys.argv) < 2:
        print("Usage: python image_processor.py <input_image> [output_image] [--width WIDTH] [--quality QUALITY]")
        print("\nExample:")
        print("  python image_processor.py input.jpg output.jpg --width 1200 --quality 85")
        print("  python image_processor.py input_directory --batch")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None

    width = 1200
    quality = 85
    batch_mode = '--batch' in sys.argv

    for i, arg in enumerate(sys.argv):
        if arg == '--width' and i + 1 < len(sys.argv):
            width = int(sys.argv[i + 1])
        elif arg == '--quality' and i + 1 < len(sys.argv):
            quality = int(sys.argv[i + 1])

    processor = ComicImageProcessor(max_width=width, quality=quality)

    try:
        if batch_mode:
            if os.path.isdir(input_path):
                optimized = processor.batch_optimize(input_path, output_path)
                print(f"\nSuccessfully optimized {len(optimized)} images")
            else:
                print("Error: Batch mode requires a directory path")
                sys.exit(1)
        else:
            if os.path.isfile(input_path):
                result = processor.optimize_image(input_path, output_path)
                print(f"Image optimized successfully: {result}")

                info = processor.get_image_info(result)
                print(f"\nImage Info:")
                print(f"  Dimensions: {info['width']}x{info['height']}")
                print(f"  Format: {info['format']}")
                print(f"  File Size: {info['file_size'] / 1024:.2f} KB")
            else:
                print(f"Error: Input file not found: {input_path}")
                sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
