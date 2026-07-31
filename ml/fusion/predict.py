"""Fusion model command-line entrypoint."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from ml.fusion.fusion import predict, train


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train or run multimodal Parkinson's risk fusion.")
    parser.add_argument("--train", action="store_true"); parser.add_argument("--paired-csv", type=Path); parser.add_argument("--config", type=Path)
    parser.add_argument("--spiral", type=float); parser.add_argument("--finger-tap", type=float); parser.add_argument("--pointer", type=float); parser.add_argument("--handwriting", type=float)
    args = parser.parse_args()
    if args.train: result = train(args.config, args.paired_csv)
    else: result = predict({"spiral": args.spiral, "finger_tap": args.finger_tap, "pointer": args.pointer, "handwriting": args.handwriting}, args.config)
    print(json.dumps(result, indent=2))
