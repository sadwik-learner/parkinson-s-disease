"""Single handwriting image prediction."""
from __future__ import annotations
import argparse
from pathlib import Path
import torch
from PIL import Image
from ml.configs.settings import ensure_runtime_directories,load_config
from ml.handwriting.model import build_model
from ml.handwriting.preprocess import evaluation_transform
from ml.spiral.utils import choose_device
def predict(image:str|Path,config_path:str|Path|None=None)->dict[str,float|str]:
 c=load_config(config_path);p=ensure_runtime_directories(c);d=choose_device(c["runtime"]["device"]);s=c["handwriting"];m=build_model(False).to(d);m.load_state_dict(torch.load(p.checkpoints_dir/s["checkpoint_name"],map_location=d,weights_only=False)["model_state"]);m.eval()
 with Image.open(image) as source,torch.no_grad():
  tensor=evaluation_transform(s["image_size"])(source.convert("RGB")).unsqueeze(0).to(d)
  prob=float(torch.sigmoid(m(tensor)).squeeze().item())
 return {"predicted_class":"parkinson_risk" if prob>=.5 else "lower_risk","probability":prob,"confidence":max(prob,1-prob)}
if __name__=="__main__":
 parser=argparse.ArgumentParser();parser.add_argument("--image",required=True);parser.add_argument("--config");args=parser.parse_args();print(predict(args.image,args.config))
