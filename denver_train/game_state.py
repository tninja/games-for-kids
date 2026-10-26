from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class WeatherType(Enum):
    SUNNY = "sunny"
    RAINY = "rainy"
    SNOWY = "snowy"
    FOGGY = "foggy"

class TrainSpeed(Enum):
    SLOW = 30
    MEDIUM = 50
    FAST = 70

@dataclass
class Station:
    name: str
    distance_from_start: int
    description: str
    
@dataclass
class Passenger:
    name: str
    destination: str
    satisfaction: int = 100
    description: str = ""

@dataclass
class Cargo:
    name: str
    destination: str
    weight: int
    value: int
    description: str = ""

@dataclass
class Train:
    name: str
    fuel: int = 100
    max_fuel: int = 100
    passenger_capacity: int = 20
    cargo_capacity: int = 10
    current_passengers: List[Passenger] = None
    current_cargo: List[Cargo] = None
    
    def __post_init__(self):
        if self.current_passengers is None:
            self.current_passengers = []
        if self.current_cargo is None:
            self.current_cargo = []

@dataclass
class GameState:
    train: Train
    current_station_index: int = 0
    current_position: int = 0  # miles from start
    money: int = 100
    current_speed: TrainSpeed = TrainSpeed.MEDIUM
    weather: WeatherType = WeatherType.SUNNY
    game_time: int = 480  # minutes from midnight (8:00 AM start)
    stations: List[Station] = None
    
    def __post_init__(self):
        if self.stations is None:
            self.stations = [
                Station("San Francisco", 0, "The journey begins!"),
                Station("Sacramento", 90, "Capital city with government workers"),
                Station("Reno", 230, "Silver State casino town"),
                Station("Salt Lake City", 730, "Mountain desert hub"),
                Station("Denver", 1260, "Mile High City - Final destination!")
            ]
    
    @property
    def current_station(self) -> Station:
        return self.stations[self.current_station_index]
    
    @property
    def next_station(self) -> Optional[Station]:
        if self.current_station_index < len(self.stations) - 1:
            return self.stations[self.current_station_index + 1]
        return None
    
    @property
    def distance_to_next_station(self) -> int:
        if self.next_station:
            return self.next_station.distance_from_start - self.current_position
        return 0
    
    @property
    def time_string(self) -> str:
        hours = self.game_time // 60
        minutes = self.game_time % 60
        period = "AM" if hours < 12 else "PM"
        display_hour = hours if hours <= 12 else hours - 12
        if display_hour == 0:
            display_hour = 12
        return f"{display_hour}:{minutes:02d} {period}"