import pygame
import pygame.font
import math
from typing import Tuple, List, Optional
from game_engine import GameEngine
from game_state import TrainSpeed, WeatherType

class TrainGUI:
    def __init__(self):
        pygame.init()
        
        # Screen setup
        self.SCREEN_WIDTH = 1200
        self.SCREEN_HEIGHT = 800
        self.screen = pygame.display.set_mode((self.SCREEN_WIDTH, self.SCREEN_HEIGHT))
        pygame.display.set_caption("🚂 Train Adventure")
        
        # Colors
        self.WHITE = (255, 255, 255)
        self.BLACK = (0, 0, 0)
        self.BROWN = (139, 69, 19)
        self.GREEN = (34, 139, 34)
        self.BLUE = (70, 130, 180)
        self.RED = (220, 20, 60)
        self.YELLOW = (255, 215, 0)
        self.GRAY = (128, 128, 128)
        self.LIGHT_BLUE = (173, 216, 230)
        self.DARK_GREEN = (0, 100, 0)
        
        # Fonts
        self.title_font = pygame.font.Font(None, 48)
        self.large_font = pygame.font.Font(None, 36)
        self.medium_font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 18)
        
        # Game engine
        self.engine = GameEngine()
        
        # Railway board setup
        self.board_rect = pygame.Rect(50, 150, 1100, 400)
        self.station_positions = []
        self.setup_railway_board()
        
        # UI elements
        self.buttons = []
        self.setup_ui_elements()
        
        # Animation
        self.train_pos = 0.0
        self.train_animation_target = 0.0
        self.animation_speed = 2.0  # pixels per frame
        
        self.clock = pygame.time.Clock()
        self.running = True
        
    def setup_railway_board(self):
        """Set up the railway board with stations positioned along the route"""
        stations = self.engine.state.stations if self.engine.state else [
            ("San Francisco", 0), ("Sacramento", 90), ("Reno", 230), 
            ("Salt Lake City", 730), ("Denver", 1260)
        ]
        
        total_distance = 1260  # SF to Denver
        board_width = self.board_rect.width - 100  # Leave margins
        
        self.station_positions = []
        for i, (name, distance) in enumerate(stations):
            # Calculate position along the board
            x = self.board_rect.x + 50 + (distance / total_distance) * board_width
            y = self.board_rect.y + self.board_rect.height // 2
            self.station_positions.append((x, y, name, distance))
    
    def setup_ui_elements(self):
        """Set up buttons and UI elements"""
        button_y = self.SCREEN_HEIGHT - 120
        button_width = 150
        button_height = 40
        button_spacing = 20
        
        button_x = 50
        self.buttons = [
            {"rect": pygame.Rect(button_x, button_y, button_width, button_height), 
             "text": "🚂 Travel", "action": "travel"},
            {"rect": pygame.Rect(button_x + (button_width + button_spacing), button_y, button_width, button_height), 
             "text": "👥 Passengers", "action": "passengers"},
            {"rect": pygame.Rect(button_x + 2*(button_width + button_spacing), button_y, button_width, button_height), 
             "text": "⛽ Fuel", "action": "fuel"},
            {"rect": pygame.Rect(button_x + 3*(button_width + button_spacing), button_y, button_width, button_height), 
             "text": "❓ Help", "action": "help"},
        ]
    
    def draw_railway_board(self):
        """Draw the big railway board"""
        # Draw board background
        pygame.draw.rect(self.screen, self.LIGHT_BLUE, self.board_rect)
        pygame.draw.rect(self.screen, self.BLACK, self.board_rect, 3)
        
        # Draw landscape elements
        self.draw_landscape()
        
        # Draw railway tracks
        self.draw_tracks()
        
        # Draw stations
        self.draw_stations()
        
        # Draw train
        self.draw_train()
    
    def draw_landscape(self):
        """Draw mountains, rivers, and other landscape features"""
        # Simple mountain ranges
        mountain_points = [
            # Sierra Nevada (around Sacramento-Reno)
            [(300, 350), (350, 300), (400, 350)],
            [(420, 360), (480, 280), (540, 360)],
            # Rocky Mountains (around Salt Lake City-Denver)
            [(750, 350), (800, 290), (850, 350)],
            [(870, 360), (920, 270), (970, 360)],
            [(990, 350), (1040, 280), (1090, 350)]
        ]
        
        for mountain in mountain_points:
            pygame.draw.polygon(self.screen, self.GRAY, mountain)
        
        # Draw some trees
        for i in range(0, 1000, 80):
            tree_x = self.board_rect.x + 100 + i
            if i % 160 == 0:  # Skip some areas for variety
                continue
            tree_y = self.board_rect.y + self.board_rect.height - 80
            pygame.draw.polygon(self.screen, self.DARK_GREEN, 
                              [(tree_x, tree_y), (tree_x-10, tree_y+20), (tree_x+10, tree_y+20)])
    
    def draw_tracks(self):
        """Draw railway tracks connecting all stations"""
        if len(self.station_positions) < 2:
            return
        
        # Draw main track line
        track_points = [(pos[0], pos[1]) for pos in self.station_positions]
        if len(track_points) > 1:
            pygame.draw.lines(self.screen, self.BROWN, False, track_points, 4)
        
        # Draw railroad ties
        for i in range(len(self.station_positions) - 1):
            start_pos = self.station_positions[i]
            end_pos = self.station_positions[i + 1]
            
            # Calculate number of ties between stations
            distance = ((end_pos[0] - start_pos[0])**2 + (end_pos[1] - start_pos[1])**2)**0.5
            num_ties = int(distance // 20)
            
            for j in range(num_ties):
                t = j / num_ties
                tie_x = start_pos[0] + t * (end_pos[0] - start_pos[0])
                tie_y = start_pos[1] + t * (end_pos[1] - start_pos[1])
                
                # Draw tie (small perpendicular line)
                pygame.draw.line(self.screen, self.BROWN, 
                               (tie_x - 8, tie_y - 2), (tie_x + 8, tie_y + 2), 2)
    
    def draw_stations(self):
        """Draw stations along the railway"""
        for i, (x, y, name, distance) in enumerate(self.station_positions):
            # Draw station building
            station_rect = pygame.Rect(x - 30, y - 40, 60, 30)
            pygame.draw.rect(self.screen, self.RED, station_rect)
            pygame.draw.rect(self.screen, self.BLACK, station_rect, 2)
            
            # Draw station roof
            roof_points = [(x - 35, y - 40), (x, y - 55), (x + 35, y - 40)]
            pygame.draw.polygon(self.screen, self.BROWN, roof_points)
            
            # Draw station name
            name_text = self.medium_font.render(name, True, self.BLACK)
            name_rect = name_text.get_rect(center=(x, y + 25))
            self.screen.blit(name_text, name_rect)
            
            # Highlight current station
            if self.engine.state and i == self.engine.state.current_station_index:
                pygame.draw.circle(self.screen, self.YELLOW, (int(x), int(y)), 50, 3)
    
    def draw_train(self):
        """Draw the train at its current position with smooth animation"""
        if not self.engine.state:
            return
        
        # Calculate target position for train
        current_station_idx = self.engine.state.current_station_index
        if current_station_idx < len(self.station_positions):
            target_x, target_y = self.station_positions[current_station_idx][:2]
            
            # Smooth animation to target position
            if abs(self.train_pos - target_x) > 1:
                if self.train_pos < target_x:
                    self.train_pos = min(self.train_pos + self.animation_speed, target_x)
                else:
                    self.train_pos = max(self.train_pos - self.animation_speed, target_x)
            else:
                self.train_pos = target_x
            
            train_x = self.train_pos
            train_y = target_y
            
            # Train engine with more detail
            engine_rect = pygame.Rect(train_x - 25, train_y - 15, 50, 30)
            pygame.draw.rect(self.screen, self.BLUE, engine_rect)
            pygame.draw.rect(self.screen, self.BLACK, engine_rect, 2)
            
            # Smokestack with smoke effect
            pygame.draw.rect(self.screen, self.BLACK, (train_x - 5, train_y - 25, 10, 15))
            
            # Animated smoke puffs
            import time
            smoke_offset = int(time.time() * 3) % 20
            for i in range(3):
                smoke_x = train_x + i * 8 - smoke_offset
                smoke_y = train_y - 30 - i * 5
                if smoke_y > train_y - 45:
                    pygame.draw.circle(self.screen, self.GRAY, (int(smoke_x), int(smoke_y)), 3)
            
            # Cab window
            pygame.draw.rect(self.screen, self.WHITE, (train_x - 15, train_y - 8, 12, 8))
            pygame.draw.rect(self.screen, self.BLACK, (train_x - 15, train_y - 8, 12, 8), 1)
            
            # Wheels with rotation effect
            wheel_rotation = int(self.train_pos) % 16
            wheel_color = self.BLACK if wheel_rotation < 8 else self.GRAY
            
            pygame.draw.circle(self.screen, wheel_color, (int(train_x - 15), int(train_y + 15)), 8)
            pygame.draw.circle(self.screen, self.BLACK, (int(train_x - 15), int(train_y + 15)), 8, 2)
            pygame.draw.circle(self.screen, wheel_color, (int(train_x + 15), int(train_y + 15)), 8)
            pygame.draw.circle(self.screen, self.BLACK, (int(train_x + 15), int(train_y + 15)), 8, 2)
            
            # Train cars (passengers/cargo) with better visualization
            num_passengers = len(self.engine.state.train.current_passengers)
            if num_passengers > 0:
                # Passenger car
                car_rect = pygame.Rect(train_x + 30, train_y - 10, 35, 20)
                pygame.draw.rect(self.screen, self.GREEN, car_rect)
                pygame.draw.rect(self.screen, self.BLACK, car_rect, 1)
                
                # Car windows
                for window_x in range(2):
                    window_rect = pygame.Rect(train_x + 35 + window_x * 12, train_y - 6, 8, 6)
                    pygame.draw.rect(self.screen, self.LIGHT_BLUE, window_rect)
                    pygame.draw.rect(self.screen, self.BLACK, window_rect, 1)
                
                # Passenger count
                passenger_text = self.small_font.render(str(num_passengers), True, self.WHITE)
                self.screen.blit(passenger_text, (train_x + 45, train_y + 2))
                
                # Car wheels
                pygame.draw.circle(self.screen, self.BLACK, (int(train_x + 35), int(train_y + 15)), 6)
                pygame.draw.circle(self.screen, self.BLACK, (int(train_x + 55), int(train_y + 15)), 6)
    
    def draw_status_panel(self):
        """Draw game status information"""
        if not self.engine.state:
            return
        
        # Status panel background
        status_rect = pygame.Rect(50, 50, 1100, 80)
        pygame.draw.rect(self.screen, self.WHITE, status_rect)
        pygame.draw.rect(self.screen, self.BLACK, status_rect, 2)
        
        # Train name
        train_text = self.large_font.render(f"🚂 {self.engine.state.train.name}", True, self.BLACK)
        self.screen.blit(train_text, (70, 65))
        
        # Fuel bar
        fuel_rect = pygame.Rect(300, 70, 200, 20)
        pygame.draw.rect(self.screen, self.GRAY, fuel_rect)
        fuel_fill = pygame.Rect(300, 70, (self.engine.state.train.fuel / 100) * 200, 20)
        pygame.draw.rect(self.screen, self.GREEN if self.engine.state.train.fuel > 30 else self.RED, fuel_fill)
        pygame.draw.rect(self.screen, self.BLACK, fuel_rect, 2)
        
        fuel_text = self.medium_font.render(f"⛽ {self.engine.state.train.fuel}%", True, self.BLACK)
        self.screen.blit(fuel_text, (310, 95))
        
        # Money
        money_text = self.medium_font.render(f"💰 ${self.engine.state.money}", True, self.BLACK)
        self.screen.blit(money_text, (530, 70))
        
        # Passengers
        passengers_text = self.medium_font.render(
            f"👥 {len(self.engine.state.train.current_passengers)}/{self.engine.state.train.passenger_capacity}", 
            True, self.BLACK
        )
        self.screen.blit(passengers_text, (650, 70))
        
        # Weather
        weather_emoji = {"sunny": "☀️", "rainy": "🌧️", "snowy": "❄️", "foggy": "🌫️"}
        weather_text = self.medium_font.render(
            f"{weather_emoji.get(self.engine.state.weather.value, '☀️')} {self.engine.state.weather.value.title()}", 
            True, self.BLACK
        )
        self.screen.blit(weather_text, (780, 70))
        
        # Time
        time_text = self.medium_font.render(f"🕐 {self.engine.state.time_string}", True, self.BLACK)
        self.screen.blit(time_text, (920, 70))
        
        # Current location
        location_text = self.medium_font.render(f"📍 {self.engine.state.current_station.name}", True, self.BLACK)
        self.screen.blit(location_text, (70, 95))
    
    def draw_buttons(self):
        """Draw action buttons"""
        for button in self.buttons:
            # Button background
            pygame.draw.rect(self.screen, self.LIGHT_BLUE, button["rect"])
            pygame.draw.rect(self.screen, self.BLACK, button["rect"], 2)
            
            # Button text
            text = self.medium_font.render(button["text"], True, self.BLACK)
            text_rect = text.get_rect(center=button["rect"].center)
            self.screen.blit(text, text_rect)
    
    def handle_button_click(self, pos: Tuple[int, int]) -> Optional[str]:
        """Handle button clicks and return action"""
        for button in self.buttons:
            if button["rect"].collidepoint(pos):
                return button["action"]
        return None
    
    def show_dialog(self, title: str, message: str, options: List[str] = None) -> Optional[int]:
        """Show a dialog box with options"""
        if options is None:
            options = ["OK"]
        
        # Dialog dimensions
        dialog_width = 600
        dialog_height = 300
        dialog_x = (self.SCREEN_WIDTH - dialog_width) // 2
        dialog_y = (self.SCREEN_HEIGHT - dialog_height) // 2
        
        # Create dialog surface
        dialog_surface = pygame.Surface((dialog_width, dialog_height))
        dialog_surface.fill(self.WHITE)
        pygame.draw.rect(dialog_surface, self.BLACK, dialog_surface.get_rect(), 3)
        
        # Title
        title_text = self.large_font.render(title, True, self.BLACK)
        title_rect = title_text.get_rect(center=(dialog_width // 2, 40))
        dialog_surface.blit(title_text, title_rect)
        
        # Message (word wrap)
        words = message.split()
        lines = []
        current_line = []
        line_width = 0
        max_width = dialog_width - 40
        
        for word in words:
            word_width = self.medium_font.size(word + " ")[0]
            if line_width + word_width <= max_width:
                current_line.append(word)
                line_width += word_width
            else:
                if current_line:
                    lines.append(" ".join(current_line))
                current_line = [word]
                line_width = word_width
        
        if current_line:
            lines.append(" ".join(current_line))
        
        y_offset = 80
        for line in lines:
            line_text = self.medium_font.render(line, True, self.BLACK)
            line_rect = line_text.get_rect(center=(dialog_width // 2, y_offset))
            dialog_surface.blit(line_text, line_rect)
            y_offset += 30
        
        # Option buttons
        button_width = 120
        button_height = 40
        total_button_width = len(options) * button_width + (len(options) - 1) * 20
        start_x = (dialog_width - total_button_width) // 2
        button_y = dialog_height - 60
        
        option_rects = []
        for i, option in enumerate(options):
            button_x = start_x + i * (button_width + 20)
            button_rect = pygame.Rect(button_x, button_y, button_width, button_height)
            option_rects.append(button_rect)
            
            pygame.draw.rect(dialog_surface, self.LIGHT_BLUE, button_rect)
            pygame.draw.rect(dialog_surface, self.BLACK, button_rect, 2)
            
            option_text = self.medium_font.render(option, True, self.BLACK)
            text_rect = option_text.get_rect(center=button_rect.center)
            dialog_surface.blit(option_text, text_rect)
        
        # Show dialog and wait for response
        waiting = True
        selected_option = None
        
        while waiting:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return None
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_pos = pygame.mouse.get_pos()
                    # Adjust mouse position relative to dialog
                    relative_pos = (mouse_pos[0] - dialog_x, mouse_pos[1] - dialog_y)
                    
                    for i, rect in enumerate(option_rects):
                        if rect.collidepoint(relative_pos):
                            selected_option = i
                            waiting = False
                            break
                elif event.type == pygame.KEYDOWN:
                    # Allow number keys for quick selection
                    if pygame.K_1 <= event.key <= pygame.K_9:
                        option_num = event.key - pygame.K_1
                        if option_num < len(options):
                            selected_option = option_num
                            waiting = False
            
            # Draw everything
            self.screen.fill(self.WHITE)
            self.draw_railway_board()
            self.draw_status_panel()
            self.draw_buttons()
            
            # Draw dialog
            self.screen.blit(dialog_surface, (dialog_x, dialog_y))
            
            pygame.display.flip()
            self.clock.tick(60)
        
        return selected_option
    
    def run_game(self, train_name: str):
        """Main game loop"""
        self.engine.start_new_game(train_name)
        
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    action = self.handle_button_click(event.pos)
                    if action:
                        self.handle_action(action)
            
            # Draw everything
            self.screen.fill(self.WHITE)
            self.draw_railway_board()
            self.draw_status_panel()
            self.draw_buttons()
            
            # Check for game completion
            if self.engine.is_game_complete():
                self.show_dialog("🎉 Congratulations!", 
                               f"You made it to Denver! Final money: ${self.engine.state.money}")
                self.running = False
            
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()
    
    def handle_action(self, action: str):
        """Handle button actions"""
        if action == "travel":
            self.handle_travel()
        elif action == "passengers":
            self.handle_passengers()
        elif action == "fuel":
            self.handle_fuel()
        elif action == "help":
            self.show_help()
    
    def handle_travel(self):
        """Handle travel action"""
        if not self.engine.state.next_station:
            self.show_dialog("🏁 Journey Complete", "You're already at Denver!")
            return
        
        # Speed selection
        speed_choice = self.show_dialog(
            "🚂 Choose Speed",
            f"How fast do you want to travel to {self.engine.state.next_station.name}?",
            ["🐌 Slow (30 mph)", "🚶 Normal (50 mph)", "🏃 Fast (70 mph)"]
        )
        
        if speed_choice is None:
            return
        
        speeds = [TrainSpeed.SLOW, TrainSpeed.MEDIUM, TrainSpeed.FAST]
        self.engine.set_speed(speeds[speed_choice])
        
        result = self.engine.travel_to_next_station()
        
        if result["success"]:
            departing = self.engine.remove_passengers_at_station()
            message = f"{result['message']}\nTravel time: {result['travel_time']} minutes\nFuel used: {result['fuel_used']} units"
            
            if departing:
                total_tips = sum(max(5, p.satisfaction // 10) for p in departing)
                message += f"\n\n{len(departing)} passengers got off here!\nYou earned ${total_tips} in tips!"
            
            self.show_dialog("✅ Travel Success", message)
        else:
            self.show_dialog("❌ Travel Failed", result["message"])
    
    def handle_passengers(self):
        """Handle passenger pickup"""
        destinations = self.engine.get_available_destinations()
        if not destinations:
            self.show_dialog("😔 No Passengers", "No passengers need to travel from here right now.")
            return
        
        # Add some passengers
        import random
        passenger_names = ["Emma", "Oliver", "Sophie", "Jack", "Lily", "Noah", "Grace", "Henry"]
        added = 0
        
        for i in range(min(3, self.engine.state.train.passenger_capacity - len(self.engine.state.train.current_passengers))):
            name = random.choice(passenger_names)
            destination = random.choice(destinations)
            
            if self.engine.add_passenger(name, destination):
                added += 1
            else:
                break
        
        if added > 0:
            self.show_dialog("✅ Passengers Added", f"{added} passengers got on the train!")
        else:
            self.show_dialog("🎫 Train Full", "Train is full! No more passengers can board.")
    
    def handle_fuel(self):
        """Handle fuel purchase"""
        fuel_choice = self.show_dialog(
            "⛽ Fuel Station",
            f"Current fuel: {self.engine.state.train.fuel}%\nYour money: ${self.engine.state.money}\nFuel costs $2 per unit",
            ["Fill up completely", "Buy 20 units ($40)", "Buy 10 units ($20)", "Cancel"]
        )
        
        if fuel_choice is None or fuel_choice == 3:
            return
        
        if fuel_choice == 0:  # Fill up
            needed = self.engine.state.train.max_fuel - self.engine.state.train.fuel
            if self.engine.refuel(needed):
                self.show_dialog("✅ Refueled", f"Filled up! Cost: ${needed * 2}")
            else:
                self.show_dialog("❌ Not Enough Money", "You don't have enough money to fill up!")
        elif fuel_choice == 1:  # Buy 20
            if self.engine.refuel(20):
                self.show_dialog("✅ Refueled", "Bought 20 fuel units!")
            else:
                self.show_dialog("❌ Not Enough Money", "You need $40 for 20 fuel units!")
        elif fuel_choice == 2:  # Buy 10
            if self.engine.refuel(10):
                self.show_dialog("✅ Refueled", "Bought 10 fuel units!")
            else:
                self.show_dialog("❌ Not Enough Money", "You need $20 for 10 fuel units!")
    
    def show_help(self):
        """Show help dialog"""
        help_text = ("🎯 GOAL: Travel from San Francisco to Denver!\n\n"
                    "🎮 HOW TO PLAY:\n"
                    "• Click buttons to take actions\n"
                    "• Pick up passengers to earn money\n"
                    "• Buy fuel to keep traveling\n"
                    "• Choose your speed wisely\n\n"
                    "💡 TIPS:\n"
                    "• Slower travel uses less fuel\n"
                    "• Happy passengers give tips\n"
                    "• Watch your fuel level!")
        
        self.show_dialog("❓ How to Play", help_text)