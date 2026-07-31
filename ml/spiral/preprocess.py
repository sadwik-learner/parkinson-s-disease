"""Image transformation factories for spiral drawing training and inference."""

from __future__ import annotations

from torchvision import transforms


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def training_transform(image_size: int, horizontal_flip: bool = False) -> transforms.Compose:
    """Create conservative geometric augmentation for drawing images."""
    operations: list[object] = [
        transforms.Resize((image_size, image_size)),
        transforms.RandomRotation(12),
        transforms.RandomAffine(degrees=0, translate=(0.04, 0.04), scale=(0.94, 1.06), shear=4),
    ]
    if horizontal_flip:
        operations.append(transforms.RandomHorizontalFlip())
    operations.extend([transforms.ToTensor(), transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD)])
    return transforms.Compose(operations)


def evaluation_transform(image_size: int) -> transforms.Compose:
    """Create deterministic resize, tensor conversion, and normalization."""
    return transforms.Compose([transforms.Resize((image_size, image_size)), transforms.ToTensor(), transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD)])
