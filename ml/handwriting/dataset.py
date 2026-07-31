"""Handwriting image discovery uses the same robust manifest/class-directory contract as spiral images."""
from ml.spiral.dataset import SpiralImageDataset as HandwritingDataset, discover_spiral_records, split_records
__all__=["HandwritingDataset","discover_spiral_records","split_records"]
