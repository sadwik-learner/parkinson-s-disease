"""DenseNet121 binary handwriting classifier."""
from __future__ import annotations
from torch import nn
from torchvision.models import DenseNet121_Weights,densenet121
def build_model(pretrained:bool=True)->nn.Module:
 model=densenet121(weights=DenseNet121_Weights.DEFAULT if pretrained else None);model.classifier=nn.Linear(model.classifier.in_features,1);return model
def set_feature_extractor_trainable(model:nn.Module,trainable:bool)->None:
 for parameter in model.features.parameters():parameter.requires_grad=trainable
