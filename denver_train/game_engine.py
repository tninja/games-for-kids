import random
from typing import List, Optional
from game_state import GameState, Train, Passenger, Cargo, TrainSpeed, WeatherType, Station

class GameEngine:
    def __init__(self):
        self.state = None
    
    def start_new_game(self, train_name: str) -> GameState:
        train = Train(name=train_name)
        self.state = GameState(train=train)
        return self.state
    
    def travel_to_next_station(self) -> dict:
        if not self.state.next_station:
            return {"success": False, "message": "Already at final destination!"}
        
        distance = self.state.distance_to_next_station
        base_speed = self.state.current_speed.value
        
        # Weather affects speed and fuel consumption
        weather_effects = self._get_weather_effects()
        actual_speed = base_speed * weather_effects["speed_modifier"]
        fuel_modifier = weather_effects["fuel_modifier"]
        
        # Speed affects fuel consumption: faster = more fuel, slower = less fuel
        speed_fuel_modifier = {
            TrainSpeed.SLOW: 0.8,    # 20% less fuel
            TrainSpeed.MEDIUM: 1.0,  # normal fuel consumption
            TrainSpeed.FAST: 1.4     # 40% more fuel
        }[self.state.current_speed]
        
        # Calculate base fuel consumption
        base_fuel_needed = max(1, distance // 10)
        # Apply speed and weather modifiers
        fuel_needed = int(base_fuel_needed * speed_fuel_modifier * fuel_modifier)
        fuel_needed = max(1, fuel_needed)  # Always need at least 1 fuel
        
        if self.state.train.fuel < fuel_needed:
            return {"success": False, "message": "Not enough fuel!"}
        
        # Check for weather-related travel complications
        travel_events = self._check_weather_events()
        if travel_events["blocked"]:
            return {"success": False, "message": travel_events["message"]}
        
        # Travel
        self.state.train.fuel -= fuel_needed
        self.state.current_position = self.state.next_station.distance_from_start
        self.state.current_station_index += 1
        
        # Calculate travel time with weather effects
        travel_time = int((distance / actual_speed) * 60)
        travel_time += travel_events["extra_time"]
        self.state.game_time += travel_time
        
        # Affect passenger satisfaction based on weather and speed
        self._update_passenger_satisfaction(weather_effects, travel_events)
        
        # Check for scenic viewpoints on Salt Lake City to Denver route
        scenic_event = self._check_scenic_viewpoints()
        
        # Random weather change after travel
        if random.random() < 0.4:
            self.state.weather = random.choice(list(WeatherType))
        
        # Get the current station name (after moving)
        current_station_name = self.state.current_station.name
        message = f"Arrived at {current_station_name}!"
        if travel_events["message"]:
            message += f" {travel_events['message']}"
        
        return {
            "success": True, 
            "message": message,
            "travel_time": travel_time,
            "fuel_used": fuel_needed,
            "weather_effect": weather_effects["description"],
            "speed_effect": self._get_speed_description(),
            "scenic_event": scenic_event
        }
    
    def _get_weather_effects(self) -> dict:
        """Calculate weather effects on travel"""
        effects = {
            WeatherType.SUNNY: {
                "speed_modifier": 1.0,
                "fuel_modifier": 1.0,
                "description": "Perfect weather for traveling!",
                "passenger_effect": 10
            },
            WeatherType.RAINY: {
                "speed_modifier": 0.8,
                "fuel_modifier": 1.2,
                "description": "Rain slows travel and increases fuel use.",
                "passenger_effect": -5
            },
            WeatherType.SNOWY: {
                "speed_modifier": 0.6,
                "fuel_modifier": 1.5,
                "description": "Snow makes travel slow and fuel-intensive.",
                "passenger_effect": -10
            },
            WeatherType.FOGGY: {
                "speed_modifier": 0.7,
                "fuel_modifier": 1.1,
                "description": "Fog reduces visibility and slows travel.",
                "passenger_effect": -3
            }
        }
        return effects[self.state.weather]
    
    def _check_weather_events(self) -> dict:
        """Check for special weather-related events"""
        weather = self.state.weather
        speed = self.state.current_speed
        
        # Snow storms can block fast trains
        if weather == WeatherType.SNOWY and speed == TrainSpeed.FAST:
            if random.random() < 0.3:
                return {
                    "blocked": True,
                    "message": "Blizzard conditions! Too dangerous to travel at high speed. Try slower speed.",
                    "extra_time": 0
                }
        
        # Heavy rain can cause delays
        if weather == WeatherType.RAINY and random.random() < 0.2:
            return {
                "blocked": False,
                "message": "Heavy rain caused track delays.",
                "extra_time": random.randint(15, 45)
            }
        
        # Fog can cause minor delays
        if weather == WeatherType.FOGGY and random.random() < 0.15:
            return {
                "blocked": False,
                "message": "Dense fog caused careful navigation.",
                "extra_time": random.randint(10, 25)
            }
        
        return {"blocked": False, "message": "", "extra_time": 0}
    
    def _get_speed_description(self) -> str:
        """Get description of current speed effects"""
        descriptions = {
            TrainSpeed.SLOW: "Slow speed saves fuel but takes more time.",
            TrainSpeed.MEDIUM: "Medium speed balances fuel and time.",
            TrainSpeed.FAST: "Fast speed burns more fuel but saves time."
        }
        return descriptions[self.state.current_speed]
    
    def _update_passenger_satisfaction(self, weather_effects: dict, travel_events: dict):
        """Update passenger satisfaction based on travel conditions"""
        for passenger in self.state.train.current_passengers:
            # Weather affects satisfaction
            passenger.satisfaction += weather_effects["passenger_effect"]
            
            # Long delays make passengers unhappy
            if travel_events["extra_time"] > 30:
                passenger.satisfaction -= 15
            elif travel_events["extra_time"] > 0:
                passenger.satisfaction -= 5
            
            # Speed preferences (some passengers like different speeds)
            speed_preference = random.choice([TrainSpeed.SLOW, TrainSpeed.MEDIUM, TrainSpeed.FAST])
            if self.state.current_speed == speed_preference:
                passenger.satisfaction += 5
            
            # Keep satisfaction within bounds
            passenger.satisfaction = max(10, min(100, passenger.satisfaction))
    
    def add_passenger(self, name: str, destination: str) -> bool:
        if len(self.state.train.current_passengers) >= self.state.train.passenger_capacity:
            return False
        
        # Simple passenger descriptions for fun
        descriptions = [
            "a friendly farmer", "a cheerful teacher", "an excited tourist",
            "a sleepy student", "a jolly businessman", "a kind grandmother"
        ]
        
        passenger = Passenger(
            name=name,
            destination=destination,
            description=random.choice(descriptions)
        )
        self.state.train.current_passengers.append(passenger)
        return True
    
    def remove_passengers_at_station(self) -> List[Passenger]:
        current_station = self.state.current_station.name
        departing = [p for p in self.state.train.current_passengers if p.destination == current_station]
        self.state.train.current_passengers = [p for p in self.state.train.current_passengers if p.destination != current_station]
        
        # Earn money from happy passengers
        for passenger in departing:
            earnings = max(5, passenger.satisfaction // 10)
            self.state.money += earnings
        
        return departing
    
    def refuel(self, amount: int) -> bool:
        cost = amount * 2  # $2 per fuel unit
        if self.state.money < cost:
            return False
        
        self.state.money -= cost
        self.state.train.fuel = min(self.state.train.max_fuel, self.state.train.fuel + amount)
        return True
    
    def set_speed(self, speed: TrainSpeed):
        self.state.current_speed = speed
    
    def get_available_destinations(self) -> List[str]:
        # Return stations ahead of current position
        return [station.name for station in self.state.stations 
                if station.distance_from_start > self.state.current_position]
    
    def _check_scenic_viewpoints(self) -> dict:
        """Check for scenic viewpoints especially on Salt Lake City to Denver route"""
        current_station = self.state.stations[self.state.current_station_index - 1] if self.state.current_station_index > 0 else None
        next_station = self.state.current_station
        
        # Salt Lake City to Denver is the most scenic route
        if (current_station and current_station.name == "Salt Lake City" and 
            next_station.name == "Denver"):
            
            scenic_points = [
                {
                    "name": "Wasatch Mountain Range View",
                    "description": "🏔️ Breathtaking snow-capped peaks of the Wasatch Mountains stretch endlessly. The morning light creates golden reflections on granite cliffs.",
                    "satisfaction_bonus": 15
                },
                {
                    "name": "Great Salt Lake Overlook", 
                    "description": "💎 The vast mirror-like surface of Great Salt Lake sparkles like diamonds. Pink flamingos can be spotted along the shore.",
                    "satisfaction_bonus": 12
                },
                {
                    "name": "Rocky Mountain National Park",
                    "description": "🦅 Majestic Rocky Mountains rise dramatically from the plains. Golden eagles soar overhead as alpine meadows bloom with wildflowers.",
                    "satisfaction_bonus": 18
                },
                {
                    "name": "Colorado Plateau Vista",
                    "description": "🌄 Spectacular red rock formations and deep canyons create a painter's paradise. The desert sunset paints the sky in brilliant oranges and purples.",
                    "satisfaction_bonus": 14
                },
                {
                    "name": "Continental Divide Crossing",
                    "description": "⛰️ At 11,000 feet elevation, you cross the Continental Divide! Crystal clear mountain air and 360-degree views of snow-capped peaks.",
                    "satisfaction_bonus": 20
                }
            ]
            
            # Higher chance of scenic events on this route
            if random.random() < 0.8:  # 80% chance
                viewpoint = random.choice(scenic_points)
                
                # Boost all passenger satisfaction
                for passenger in self.state.train.current_passengers:
                    passenger.satisfaction = min(100, passenger.satisfaction + viewpoint["satisfaction_bonus"])
                
                return {
                    "has_viewpoint": True,
                    "name": viewpoint["name"],
                    "description": viewpoint["description"],
                    "satisfaction_bonus": viewpoint["satisfaction_bonus"]
                }
        
        # Other routes have lower chance of scenic events
        elif random.random() < 0.3:  # 30% chance for other routes
            general_views = [
                {
                    "name": "Prairie Sunset",
                    "description": "🌅 A golden sunset stretches across endless prairie grasslands, with herds of antelope in the distance.",
                    "satisfaction_bonus": 8
                },
                {
                    "name": "Forest Grove",
                    "description": "🌲 Dense pine forests line the tracks, with deer grazing peacefully in sunlit clearings.",
                    "satisfaction_bonus": 6
                },
                {
                    "name": "River Valley", 
                    "description": "🏞️ The train follows a winding river through a lush green valley dotted with wildflowers.",
                    "satisfaction_bonus": 7
                }
            ]
            
            viewpoint = random.choice(general_views)
            
            # Smaller boost for other routes
            for passenger in self.state.train.current_passengers:
                passenger.satisfaction = min(100, passenger.satisfaction + viewpoint["satisfaction_bonus"])
            
            return {
                "has_viewpoint": True,
                "name": viewpoint["name"],
                "description": viewpoint["description"],
                "satisfaction_bonus": viewpoint["satisfaction_bonus"]
            }
        
        return {"has_viewpoint": False}

    def is_game_complete(self) -> bool:
        return self.state.current_station_index >= len(self.state.stations) - 1