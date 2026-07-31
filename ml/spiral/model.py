"""EfficientNet-B0 binary spiral classifier."""

from __future__ import annotations

import torch.nn as nn
from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0


def build_model(pretrained: bool = True) -> nn.Module:
    """Build EfficientNet-B0 with a single-logit Parkinson's risk head."""
    weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
    model = efficientnet_b0(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(nn.Dropout(p=0.30), nn.Linear(in_features, 1))
    return model


def set_feature_extractor_trainable(model: nn.Module, trainable: bool) -> None:
    """Freeze or unfreeze EfficientNet feature layers while retaining its head."""
    for parameter in model.features.parameters():
        parameter.requires_grad = trainable
