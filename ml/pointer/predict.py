"""Pointer sequence inference from a labelled-format CSV (label ignored after load)."""
from __future__ import annotations
import argparse
from pathlib import Path
import torch
from torch.utils.data import DataLoader
from ml.configs.settings import ensure_runtime_directories,load_config
from ml.pointer.dataset import PointerDataset,load_sequences
from ml.pointer.model import PointerModel
from ml.spiral.utils import choose_device
def predict(csv:str|Path,config_path:str|Path|None=None)->list[float]:
 c=load_config(config_path);p=ensure_runtime_directories(c);d=choose_device(c["runtime"]["device"]);data=load_sequences(csv,c["pointer"]["sequence_length"]);state=torch.load(p.checkpoints_dir/c["pointer"]["checkpoint_name"],map_location=d,weights_only=False);m=PointerModel(state["input_size"],state["use_transformer"]).to(d);m.load_state_dict(state["model_state"]);m.eval();return [float(x) for batch,_ in DataLoader(PointerDataset(data)) for x in torch.sigmoid(m(batch.to(d)).squeeze(1)).detach().cpu().tolist()]
if __name__=="__main__":
 parser=argparse.ArgumentParser();parser.add_argument("--csv",required=True);parser.add_argument("--config");args=parser.parse_args();print(predict(args.csv,args.config))
