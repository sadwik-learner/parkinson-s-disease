"""Train DenseNet121 handwriting model with transfer learning and early stopping."""
from __future__ import annotations
import argparse
from pathlib import Path
import torch
from torch import nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from ml.configs.settings import ensure_runtime_directories,load_config
from ml.handwriting.dataset import HandwritingDataset,discover_spiral_records,split_records
from ml.handwriting.model import build_model,set_feature_extractor_trainable
from ml.handwriting.preprocess import evaluation_transform,training_transform
from ml.spiral.evaluate import evaluate_model,plot_history
from ml.spiral.train import _epoch
from ml.spiral.utils import choose_device,set_seed,write_json
def train(config_path:str|Path|None=None)->dict[str,object]:
 c=load_config(config_path);p=ensure_runtime_directories(c);s=c["handwriting"];set_seed(c["runtime"]["seed"]);d=choose_device(c["runtime"]["device"]);root=Path(s["images_dir"])
 if not root.is_absolute():root=Path.cwd()/root
 records=discover_spiral_records(root,s.get("labels_csv"));a,b,e=split_records(records,.15,.15,c["runtime"]["seed"]);train_loader=DataLoader(HandwritingDataset(a,training_transform(s["image_size"])),batch_size=s["batch_size"],shuffle=True);tf=evaluation_transform(s["image_size"]);val=DataLoader(HandwritingDataset(b,tf),batch_size=s["batch_size"]);test=DataLoader(HandwritingDataset(e,tf),batch_size=s["batch_size"])
 m=build_model(True).to(d);set_feature_extractor_trainable(m,False);opt=AdamW(filter(lambda x:x.requires_grad,m.parameters()),lr=s["learning_rate"]);sched=ReduceLROnPlateau(opt,mode="min",patience=2);loss=nn.BCEWithLogitsLoss();scaler=torch.amp.GradScaler(d.type,enabled=d.type=="cuda");checkpoint=p.checkpoints_dir/s["checkpoint_name"];hist={"train_loss":[],"validation_loss":[]};best=float("inf");stale=0
 for epoch in range(s["epochs"]):
  if epoch==max(1,s["epochs"]//2):set_feature_extractor_trainable(m,True);opt=AdamW(m.parameters(),lr=s["learning_rate"]*.1)
  tr=_epoch(m,train_loader,loss,opt,d,scaler);va=_epoch(m,val,loss,None,d,scaler);hist["train_loss"].append(tr);hist["validation_loss"].append(va);sched.step(va)
  if va<best:best=va;stale=0;torch.save({"model_state":m.state_dict()},checkpoint)
  else:stale+=1
  if stale>=7:break
 m.load_state_dict(torch.load(checkpoint,map_location=d,weights_only=False)["model_state"]);out=p.outputs_dir/"handwriting";plot_history(hist,out);metrics=evaluate_model(m,test,d,out);result={"checkpoint":str(checkpoint),"test":metrics};write_json(out/"summary.json",result);return result
if __name__=="__main__":
 parser=argparse.ArgumentParser();parser.add_argument("--config",type=Path);args=parser.parse_args();print(train(args.config))
