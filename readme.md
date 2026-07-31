# Parkinson Early-Risk Screening ML

Multimodal, configuration-driven ML pipelines for research screening. This software is not a medical device and does not diagnose Parkinson's disease.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

All paths, hyperparameters, checkpoints, and device selection are in `ml/configs/config.yaml`.

## Pipelines

- `ml.spiral`: EfficientNet-B0 transfer learning for labelled spiral images.
- `ml.tappy` / `ml.finger_tap`: XGBoost with participant-level timing features and randomized hyperparameter search using the local Tappy archives.
- `ml.pointer`: Transformer encoder, with LSTM fallback for small trajectory datasets.
- `ml.handwriting`: DenseNet121 transfer learning for labelled handwriting images.
- `ml.fusion`: logistic regression when paired probabilities are supplied; otherwise persistent configurable weighted fusion.

## Train

```powershell
python -m ml.tappy.train
python -m ml.spiral.train
python -m ml.pointer.train
python -m ml.handwriting.train
python -m ml.fusion.predict --train
```

The local Tappy data is immediately usable. Spiral, handwriting, and pointer training each require their corresponding inputs at the YAML-configured locations. Spiral/handwriting image folders may either use `control/` and `parkinson/` class subfolders or a manifest containing image path and label columns. Pointer CSVs require `user_id,timestamp,x,y,label` columns.

## Inference

```powershell
python -m ml.spiral.predict --image drawing.png
python -m ml.tappy.predict --csv user_events.csv
python -m ml.handwriting.predict --image handwriting.png
python -m ml.fusion.predict --spiral 0.4 --finger-tap 0.6
```

Evaluation metrics and figures are saved beneath `ml/outputs/<modality>/`; model artifacts are saved under `ml/checkpoints/`.
