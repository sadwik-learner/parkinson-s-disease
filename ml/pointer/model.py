"""Transformer with an LSTM fallback for pointer-sequence classification."""
from __future__ import annotations
import torch
from torch import nn
class PointerModel(nn.Module):
    def __init__(self,input_size:int,use_transformer:bool)->None:
        super().__init__(); self.use_transformer=use_transformer; self.project=nn.Linear(input_size,64)
        if use_transformer: self.encoder=nn.TransformerEncoder(nn.TransformerEncoderLayer(64,4,128,batch_first=True,dropout=.2),num_layers=2)
        else: self.encoder=nn.LSTM(64,64,num_layers=2,batch_first=True,dropout=.2)
        self.head=nn.Sequential(nn.LayerNorm(64),nn.Dropout(.3),nn.Linear(64,1))
    def forward(self,x:torch.Tensor)->torch.Tensor:
        x=self.project(x); x=self.encoder(x)[0] if self.use_transformer else self.encoder(x)[0]; return self.head(x.mean(1))
