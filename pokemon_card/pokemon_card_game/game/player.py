from typing import List, Optional
from .card import Card, PokemonCard
from .deck import Deck

class Player:
    def __init__(self, name: str, deck: Deck):
        self.name = name
        self.deck = deck
        self.hand: List[Card] = []
        self.active_pokemon: Optional[PokemonCard] = None
        self.bench: List[PokemonCard] = []
        self.prize_cards: List[Card] = []
        self.discard_pile: List[Card] = []
        self.energy_attached_this_turn: bool = False
        self.has_retreated_this_turn: bool = False

    def draw_initial_hand(self):
        self.hand.extend(self.deck.draw(7))

    def setup_prize_cards(self):
        self.prize_cards.extend(self.deck.draw(6))

    def __str__(self):
        return self.name
