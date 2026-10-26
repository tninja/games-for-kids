import os
from typing import List, Optional
from game_engine import GameEngine
from game_state import TrainSpeed, WeatherType

class TrainUI:
    def __init__(self):
        self.engine = GameEngine()
    
    def clear_screen(self):
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def display_header(self):
        print("🚂" * 20)
        print("    🌟 TRAIN ADVENTURE 🌟")
        print("    From San Francisco to Denver!")
        print("🚂" * 20)
        print()
    
    def display_train_status(self):
        state = self.engine.state
        train = state.train
        
        # Fuel bar
        fuel_bars = "█" * (train.fuel // 10) + "░" * (10 - train.fuel // 10)
        
        # Weather emoji
        weather_emoji = {
            WeatherType.SUNNY: "☀️",
            WeatherType.RAINY: "🌧️", 
            WeatherType.SNOWY: "❄️",
            WeatherType.FOGGY: "🌫️"
        }
        
        print("=== TRAIN STATUS ===")
        print(f"🚂 Train: {train.name}")
        print(f"📍 Location: {state.current_station.name}")
        print(f"⛽ Fuel: {fuel_bars} {train.fuel}%")
        print(f"💰 Money: ${state.money}")
        print(f"👥 Passengers: {len(train.current_passengers)}/{train.passenger_capacity}")
        print(f"🌤️  Weather: {weather_emoji[state.weather]} {state.weather.value.title()}")
        print(f"🕐 Time: {state.time_string}")
        print(f"🏃 Speed: {state.current_speed.value} mph")
        print()
        
        if state.next_station:
            print(f"➡️  Next stop: {state.next_station.name} ({state.distance_to_next_station} miles)")
            print()
    
    def display_passengers(self):
        passengers = self.engine.state.train.current_passengers
        if not passengers:
            print("🎫 No passengers aboard")
            return
        
        print("🎫 PASSENGERS ON BOARD:")
        for i, passenger in enumerate(passengers, 1):
            print(f"  {i}. {passenger.name} ({passenger.description})")
            print(f"     → Going to: {passenger.destination}")
        print()
    
    def get_user_choice(self, prompt: str, options: List[str]) -> int:
        """Get a numbered choice from the user with clear instructions"""
        print(prompt)
        print()
        for i, option in enumerate(options, 1):
            print(f"  {i}. {option}")
        print()
        
        while True:
            try:
                print("👉 What would you like to do?")
                print("💡 Tip: Just type the number and press Enter!")
                choice = input("Your choice: ").strip()
                
                if not choice:
                    print("❓ Please type a number!")
                    continue
                    
                num = int(choice)
                if 1 <= num <= len(options):
                    return num - 1
                else:
                    print(f"❓ Please choose a number between 1 and {len(options)}!")
            except ValueError:
                print("❓ Please type only numbers!")
            print()
    
    def show_station_menu(self) -> str:
        """Show what the player can do at the current station"""
        options = []
        
        # Always show travel option unless at final station
        if self.engine.state.next_station:
            options.append(f"🚂 Travel to {self.engine.state.next_station.name}")
        
        options.extend([
            "👥 Pick up passengers",
            "⛽ Buy fuel",
            "📊 Check train details",
            "❓ How to play"
        ])
        
        if self.engine.is_game_complete():
            options = ["🎉 Finish the journey!", "📊 Check train details", "❓ How to play"]
        
        choice = self.get_user_choice(
            f"🚉 Welcome to {self.engine.state.current_station.name}! 🚉\n{self.engine.state.current_station.description}",
            options
        )
        
        if self.engine.is_game_complete():
            return ["finish", "details", "help"][choice]
        else:
            return ["travel", "passengers", "fuel", "details", "help"][choice]
    
    def handle_travel(self):
        if not self.engine.state.next_station:
            print("🏁 You're already at the final destination!")
            return
        
        # Show current weather and its effects
        weather_effects = self.engine._get_weather_effects()
        print(f"\n🌤️  Current weather: {self.engine.state.weather.value.title()}")
        print(f"   {weather_effects['description']}")
        
        # Show speed options with weather-adjusted effects
        speed_options = [
            "🐌 Slow (30 mph) - Uses 20% less fuel, takes more time",
            "🚶 Normal (50 mph) - Balanced speed and fuel use", 
            "🏃 Fast (70 mph) - Uses 40% more fuel, faster travel"
        ]
        
        # Add weather warnings for fast speed
        if self.engine.state.weather == WeatherType.SNOWY:
            speed_options[2] += " ⚠️  DANGEROUS IN SNOW!"
        
        speed_choice = self.get_user_choice("How fast do you want to travel?", speed_options)
        speeds = [TrainSpeed.SLOW, TrainSpeed.MEDIUM, TrainSpeed.FAST]
        self.engine.set_speed(speeds[speed_choice])
        
        print(f"🚂 Choo choo! Traveling at {speeds[speed_choice].value} mph...")
        print("🌟 Press Enter when ready to see what happens!")
        input()
        
        result = self.engine.travel_to_next_station()
        
        if result["success"]:
            print(f"✅ {result['message']}")
            print(f"⏱️  Travel time: {result['travel_time']} minutes")
            print(f"⛽ Fuel used: {result['fuel_used']} units")
            
            # Show weather and speed effects
            if "weather_effect" in result:
                print(f"🌤️  Weather: {result['weather_effect']}")
            if "speed_effect" in result:
                print(f"🚂 Speed: {result['speed_effect']}")
            
            # Check for passengers getting off
            departing = self.engine.remove_passengers_at_station()
            if departing:
                print(f"👋 {len(departing)} passengers got off here!")
                total_tips = sum(max(5, p.satisfaction // 10) for p in departing)
                print(f"💰 You earned ${total_tips} in tips!")
                
                # Show passenger satisfaction
                avg_satisfaction = sum(p.satisfaction for p in departing) // len(departing)
                if avg_satisfaction >= 80:
                    print("😊 Passengers were very happy with the journey!")
                elif avg_satisfaction >= 60:
                    print("🙂 Passengers had an okay journey.")
                else:
                    print("😐 Passengers were not very satisfied...")
        else:
            print(f"❌ {result['message']}")
        
        print("\n🌟 Press Enter to continue...")
        input()
    
    def handle_passengers(self):
        print("🎫 PASSENGER PICKUP")
        print("New passengers are waiting at the station!")
        print()
        
        # Show available destinations
        destinations = self.engine.get_available_destinations()
        if not destinations:
            print("😔 No passengers need to travel from here right now.")
            print("🌟 Press Enter to go back...")
            input()
            return
        
        # Simple passenger names for the demo
        passenger_names = ["Emma", "Oliver", "Sophie", "Jack", "Lily", "Noah", "Grace", "Henry"]
        
        for i in range(min(3, self.engine.state.train.passenger_capacity - len(self.engine.state.train.current_passengers))):
            import random
            name = random.choice(passenger_names)
            destination = random.choice(destinations)
            
            if self.engine.add_passenger(name, destination):
                print(f"✅ {name} got on the train! Going to {destination}")
            else:
                print("🎫 Train is full! No more passengers can board.")
                break
        
        print("\n🌟 Press Enter to continue...")
        input()
    
    def handle_fuel(self):
        print("⛽ FUEL STATION")
        print(f"Current fuel: {self.engine.state.train.fuel}%")
        print(f"Your money: ${self.engine.state.money}")
        print("Fuel costs $2 per unit")
        print()
        
        fuel_options = [
            "Fill up completely (costs vary)",
            "Buy 20 fuel units ($40)",
            "Buy 10 fuel units ($20)",
            "Don't buy fuel"
        ]
        
        choice = self.get_user_choice("How much fuel do you want to buy?", fuel_options)
        
        if choice == 0:  # Fill up
            needed = self.engine.state.train.max_fuel - self.engine.state.train.fuel
            if self.engine.refuel(needed):
                print(f"✅ Filled up! Used ${needed * 2}")
            else:
                print("❌ Not enough money to fill up!")
        elif choice == 1:  # Buy 20
            if self.engine.refuel(20):
                print("✅ Bought 20 fuel units!")
            else:
                print("❌ Not enough money!")
        elif choice == 2:  # Buy 10
            if self.engine.refuel(10):
                print("✅ Bought 10 fuel units!")
            else:
                print("❌ Not enough money!")
        else:
            print("🚂 No fuel purchased.")
        
        print("\n🌟 Press Enter to continue...")
        input()
    
    def show_help(self):
        print("❓ HOW TO PLAY TRAIN ADVENTURE")
        print("=" * 40)
        print()
        print("🎯 YOUR GOAL:")
        print("   Help your train travel from San Francisco to Denver!")
        print("   Pick up passengers and get them safely to their destinations.")
        print()
        print("🎮 HOW TO PLAY:")
        print("   1. Read the options on your screen")
        print("   2. Type the NUMBER of what you want to do")
        print("   3. Press ENTER")
        print("   4. Follow the instructions!")
        print()
        print("💡 IMPORTANT STRATEGY:")
        print("   ⛽ Your train needs FUEL to travel")
        print("   💰 Happy passengers give better TIPS")
        print("   🌤️  WEATHER affects speed and fuel consumption:")
        print("      ☀️  Sunny: Normal conditions")
        print("      🌧️  Rain: Slower, uses more fuel")
        print("      ❄️  Snow: Much slower, much more fuel")
        print("      🌫️  Fog: Slightly slower, minor delays")
        print("   🚂 SPEED affects fuel and passenger satisfaction:")
        print("      🐌 Slow: 20% less fuel, some passengers prefer it")
        print("      🚶 Normal: Balanced fuel and time")
        print("      🏃 Fast: 40% more fuel, risky in bad weather!")
        print()
        print("🌟 PRO TIPS:")
        print("   • Check weather before choosing speed")
        print("   • Don't travel fast in snow storms!")
        print("   • Monitor passenger satisfaction")
        print("   • Plan fuel stops carefully")
        print()
        print("🌟 Press Enter to go back to the game...")
        input()
    
    def show_game_complete(self):
        self.clear_screen()
        print("🎉" * 30)
        print("    🏆 CONGRATULATIONS! 🏆")
        print("   You made it to Denver!")
        print("🎉" * 30)
        print()
        print(f"🚂 Train: {self.engine.state.train.name}")
        print(f"💰 Final money: ${self.engine.state.money}")
        print(f"⛽ Fuel remaining: {self.engine.state.train.fuel}%")
        print(f"👥 Passengers delivered safely!")
        print()
        print("🌟 You're an amazing train conductor! 🌟")
        print("🌟 Great job completing the journey! 🌟")
        print()
        print("Press Enter to finish...")
        input()