from __future__ import annotations

import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline


def build_preprocessor() -> Pipeline:
    """Build imputation only; tree models do not require scaling."""
    return Pipeline([("imputer", SimpleImputer(strategy="median", add_indicator=True, keep_empty_features=True))])


def validate_feature_frame(features: pd.DataFrame) -> None:
    if features.empty:
        raise ValueError("No Tappy feature rows were generated.")
    if not all(pd.api.types.is_numeric_dtype(dtype) for dtype in features.dtypes):
        raise TypeError("Tappy model features must be numeric.")
