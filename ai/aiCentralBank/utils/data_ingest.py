# aiCentralBank/utils/data_ingest.py

import requests
import pandas as pd
from typing import List, Dict, Any, Optional

class DataIngestor:
    """
    Fetches and parses external economic, market, and regulatory data feeds.
    """

    def fetch_csv(self, url: str) -> pd.DataFrame:
        resp = requests.get(url)
        resp.raise_for_status()
        df = pd.read_csv(pd.compat.StringIO(resp.text))
        return df

    def fetch_json(self, url: str) -> Any:
        resp = requests.get(url)
        resp.raise_for_status()
        return resp.json()

    def load_local_csv(self, path: str) -> pd.DataFrame:
        return pd.read_csv(path)

    def ingest_batch(self, sources: List[Dict[str, str]]) -> Dict[str, Any]:
        results = {}
        for src in sources:
            kind, url_or_path = src["type"], src["location"]
            if kind == "csv_url":
                results[url_or_path] = self.fetch_csv(url_or_path)
            elif kind == "json_url":
                results[url_or_path] = self.fetch_json(url_or_path)
            elif kind == "local_csv":
                results[url_or_path] = self.load_local_csv(url_or_path)
        return results

# Example usage:
if __name__ == "__main__":
    ingestor = DataIngestor()
    # Example: ingestor.fetch_csv("https://example.com/data.csv")
