"""Train pointer Transformer/LSTM with early stopping and CPU fallback."""
from __future__ import annotations
import argparse
from pathlib import Path
import torch
from torch import nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from ml.configs.settings import ensure_runtime_directories,load_config
from ml.pointer.dataset import PointerDataset,load_sequences,split_data
from ml.pointer.model import PointerModel
from ml.pointer.evaluate import evaluate_model,plot_history
from ml.spiral.utils import choose_device,set_seed,write_json
def train(config_path:str|Path|None=None)->dict[str,object]:
 c=load_config(config_path); p=ensure_runtime_directories(c); s=c["pointer"]; set_seed(c["runtime"]["seed"]); path=Path(s["dataset_csv"])
 if not path.is_absolute(): path=Path.cwd()/path
 data=load_sequences(path,s["sequence_length"]); train_data,test_data=split_data(data,c["runtime"]["seed"]); device=choose_device(c["runtime"]["device"]); use_transformer=len(train_data.labels)>=s["minimum_transformer_sequences"]
 model=PointerModel(train_data.sequences.shape[-1],use_transformer).to(device); opt=AdamW(model.parameters(),lr=s["learning_rate"]); scheduler=ReduceLROnPlateau(opt,mode="min",patience=3); loss_fn=nn.BCEWithLogitsLoss(); scaler=torch.amp.GradScaler(device.type,enabled=device.type=="cuda"); loaders=[DataLoader(PointerDataset(x),batch_size=s["batch_size"],shuffle=i==0) for i,x in enumerate((train_data,test_data))]; hist={"train_loss":[],"validation_loss":[]}; best=float("inf"); stale=0; checkpoint=p.checkpoints_dir/s["checkpoint_name"]
 for epoch in range(s["epochs"]):
  losses=[]
  for training,loader in enumerate(loaders):
   model.train(not training); total=n=0
   for x,y in loader:
    x,y=x.to(device),y.float().to(device); opt.zero_grad(set_to_none=True)
    with torch.amp.autocast(device.type,enabled=device.type=="cuda"): loss=loss_fn(model(x).squeeze(1),y)
    if not training: scaler.scale(loss).backward(); scaler.step(opt); scaler.update()
    total+=loss.item()*len(y);n+=len(y)
   losses.append(total/max(n,1))
  hist["train_loss"].append(losses[0]);hist["validation_loss"].append(losses[1]);scheduler.step(losses[1])
  if losses[1]<best: best=losses[1];stale=0;torch.save({"model_state":model.state_dict(),"input_size":train_data.sequences.shape[-1],"use_transformer":use_transformer},checkpoint)
  else: stale+=1
  if stale>=7: break
 state=torch.load(checkpoint,map_location=device,weights_only=False);model.load_state_dict(state["model_state"]);out=p.outputs_dir/"pointer";plot_history(hist,out);metrics=evaluate_model(model,loaders[1],device,out); result={"checkpoint":str(checkpoint),"architecture":"transformer" if use_transformer else "lstm","test":metrics};write_json(out/"summary.json",result);return result
if __name__=="__main__":
 parser=argparse.ArgumentParser();parser.add_argument("--config",type=Path);args=parser.parse_args();print(train(args.config))
