"""Pointer CSV parsing, trajectory features, padding, and window generation."""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from torch.utils.data import Dataset

@dataclass(frozen=True)
class PointerData: sequences: np.ndarray; labels: np.ndarray; groups: np.ndarray
class PointerDataset(Dataset[tuple[object, int]]):
    def __init__(self, data: PointerData) -> None: self.data=data
    def __len__(self)->int: return len(self.data.labels)
    def __getitem__(self,index:int): return self.data.sequences[index].astype(np.float32), int(self.data.labels[index])
def load_sequences(csv_path: str|Path, length:int)->PointerData:
    frame=pd.read_csv(csv_path); required={"user_id","timestamp","x","y","label"}
    if not required.issubset(frame): raise ValueError(f"Pointer CSV requires {sorted(required)}")
    frame=frame.copy(); frame["timestamp"]=pd.to_datetime(frame.timestamp,errors="coerce"); frame[["x","y","label"]]=frame[["x","y","label"]].apply(pd.to_numeric,errors="coerce"); frame=frame.dropna(subset=list(required))
    sequences=[]; labels=[]; groups=[]
    for user, trajectory in frame.sort_values("timestamp").groupby("user_id"):
        if trajectory.label.nunique()!=1: raise ValueError(f"User {user} has inconsistent labels")
        coords=trajectory[["x","y"]].to_numpy(float); times=trajectory.timestamp.astype("int64").to_numpy()/1e9
        delta=np.diff(coords,axis=0,prepend=coords[:1]); dt=np.maximum(np.diff(times,prepend=times[:1]),1e-3); velocity=delta/dt[:,None]; acceleration=np.diff(velocity,axis=0,prepend=velocity[:1])/dt[:,None]; jerk=np.diff(acceleration,axis=0,prepend=acceleration[:1])/dt[:,None]
        values=np.c_[delta,velocity,acceleration,jerk]
        for start in range(0,max(1,len(values)-length+1),length):
            window=values[start:start+length]; window=np.pad(window,((0,max(0,length-len(window))),(0,0)))
            sequences.append(window); labels.append(int(trajectory.label.iloc[0])); groups.append(str(user))
    if len(set(labels))!=2: raise ValueError("Pointer data requires both 0 and 1 labels")
    array=np.asarray(sequences,dtype=np.float32); array=(array-array.mean(axis=(0,1),keepdims=True))/(array.std(axis=(0,1),keepdims=True)+1e-6)
    return PointerData(array,np.asarray(labels),np.asarray(groups))
def split_data(data:PointerData,seed:int)->tuple[PointerData,PointerData]:
    splitter=GroupShuffleSplit(n_splits=1,test_size=.2,random_state=seed); train,test=next(splitter.split(data.sequences,data.labels,data.groups))
    return PointerData(data.sequences[train],data.labels[train],data.groups[train]),PointerData(data.sequences[test],data.labels[test],data.groups[test])
