from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional

class CardType(Enum):
    POKEMON = "Pokemon"
    ENERGY = "Energy"
    TRAINER = "Trainer"

# The base Card class should only contain fields that are common to all cards
# and that do not have default values, if subclasses will add their own
# non-default value fields.
@dataclass
class Card:
    name: str

@dataclass
class Attack:
    name: str
    cost: List[str]
    damage: int
    effect: str = ""

# Now, child classes can add their own non-default fields first,
# and then all the default fields.
@dataclass
class PokemonCard(Card):
    hp: int
    attacks: List[Attack]
    description: str = ""
    card_type: CardType = CardType.POKEMON
    stage: int = 0
    evolves_from: Optional[str] = None
    weakness: Optional[Dict[str, int]] = None
    resistance: Optional[Dict[str, int]] = None
    retreat_cost: int = 0
    energy_attached: List['EnergyCard'] = field(default_factory=list)
    damage_counters: int = 0

@dataclass
class EnergyCard(Card):
    energy_type: str
    description: str = ""
    card_type: CardType = CardType.ENERGY

class TrainerType(Enum):
    ITEM = "Item"
    SUPPORTER = "Supporter"
    STADIUM = "Stadium"

@dataclass
class TrainerCard(Card):
    trainer_type: TrainerType
    effect: str # Making effect mandatory for trainers
    description: str = ""
    card_type: CardType = CardType.TRAINER