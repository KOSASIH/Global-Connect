# global_connect/ai/predictive_analytics.py

import numpy as np
from sklearn.linear_model import LinearRegression

class PredictiveAnalytics:
    """
    Simple regression-based analytics for predicting gas fees, token prices, or user growth.
    """

    def __init__(self):
        self.models = {}

    def train(self, series_name: str, X: np.ndarray, y: np.ndarray):
        model = LinearRegression()
        model.fit(X, y)
        self.models[series_name] = model

    def predict(self, series_name: str, X_future: np.ndarray):
        if series_name not in self.models:
            raise ValueError(f"No trained model for {series_name}")
        return self.models[series_name].predict(X_future)
