# global_connect/ai/anomaly_detection.py

import numpy as np
from sklearn.ensemble import IsolationForest

class TransactionAnomalyDetector:
    """
    Train and use an Isolation Forest ML model to detect anomalous blockchain transactions.
    """

    def __init__(self, n_estimators=200, contamination=0.01):
        self.model = IsolationForest(n_estimators=n_estimators, contamination=contamination)
        self.fitted = False

    def fit(self, feature_matrix: np.ndarray):
        """
        Train the model on known transaction features (e.g., value, gas, time).
        """
        self.model.fit(feature_matrix)
        self.fitted = True

    def predict(self, feature_matrix: np.ndarray):
        """
        Predict anomalies. Returns 1 (normal) or -1 (anomaly) for each sample.
        """
        if not self.fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        return self.model.predict(feature_matrix)

    def anomaly_score(self, feature_matrix: np.ndarray):
        """
        Return anomaly scores (the lower, the more anomalous).
        """
        if not self.fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")
        return self.model.decision_function(feature_matrix)

    def is_anomalous(self, tx_features: np.ndarray):
        """
        Convenience: Returns True if a single transaction is anomalous.
        """
        return self.predict(tx_features.reshape(1, -1))[0] == -1
