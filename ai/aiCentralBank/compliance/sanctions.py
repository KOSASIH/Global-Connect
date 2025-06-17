# aiCentralBank/compliance/sanctions.py

import datetime
from typing import Dict, Any, List

class SanctionsScreening:
    """
    Checks entities and transactions against sanctions and watchlists.
    """

    def __init__(self):
        self.sanctioned_entities = set(['badguy', 'evilcorp', 'roguebank'])
        self.watchlist = set(['riskybiz', 'suspiciousperson'])
        self.hits = []

    def screen(self, name: str) -> Dict[str, Any]:
        hit_type = None
        if name.lower() in self.sanctioned_entities:
            hit_type = 'sanctioned'
        elif name.lower() in self.watchlist:
            hit_type = 'watchlist'
        result = {
            'entity': name,
            'flagged': bool(hit_type),
            'hit_type': hit_type,
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        if result['flagged']:
            self.hits.append(result)
        return result

    def batch_screen(self, names: List[str]) -> List[Dict[str, Any]]:
        return [self.screen(name) for name in names]

    def get_hits(self) -> List[Dict[str, Any]]:
        return self.hits

# Example usage:
if __name__ == "__main__":
    s = SanctionsScreening()
    print(s.screen('BadGuy'))
    print(s.screen('riskybiz'))
    print("Hits:", s.get_hits())
