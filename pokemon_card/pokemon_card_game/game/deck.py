import random
from typing import List
from .card import Card

class Deck:
    def __init__(self, cards: List[Card]):
        self.cards = cards
        self.shuffle()

    def shuffle(self):
        random.shuffle(self.cards)

    def draw(self, n: int = 1) -> List[Card]:
        if len(self.cards) < n:
            # In a real game, you lose if you can't draw.
            # For now, just draw what's left.
            drawn_cards = self.cards
            self.cards = []
            return drawn_cards
        
        drawn_cards = self.cards[:n]
        self.cards = self.cards[n:]
        return drawn_cards

    def add_to_bottom(self, card: Card):
        self.cards.append(card)

    def is_empty(self) -> bool:
        return len(self.cards) == 0

    def __len__(self) -> int:
        return len(self.cards)
