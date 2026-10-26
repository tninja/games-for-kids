#!/usr/bin/env python3

import pygame
import sys
import math
import random
from typing import List, Optional, Tuple, Dict
from game_engine import GameEngine
from game_state import TrainSpeed, WeatherType

# Initialize pygame
pygame.init()

# Screen settings
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
DARK_GRAY = (64, 64, 64)
BLUE = (70, 130, 180)
GREEN = (34, 139, 34)
RED = (220, 20, 60)
YELLOW = (255, 215, 0)
ORANGE = (255, 165, 0)
BROWN = (139, 69, 19)
LIGHT_BLUE = (173, 216, 230)
DARK_GREEN = (0, 100, 0)
SKY_BLUE = (135, 206, 235)
GOLD = (255, 215, 0)

# Fonts
pygame.font.init()
FONT_LARGE = pygame.font.Font(None, 36)
FONT_MEDIUM = pygame.font.Font(None, 24)
FONT_SMALL = pygame.font.Font(None, 18)
FONT_TITLE = pygame.font.Font(None, 48)

class UIElement:
    """Base class for all UI elements"""
    def __init__(self, x: int, y: int, width: int, height: int):
        self.rect = pygame.Rect(x, y, width, height)
        self.visible = True
        self.enabled = True

    def draw(self, surface: pygame.Surface):
        pass

    def handle_event(self, event: pygame.event.Event) -> bool:
        return False

class Button(UIElement):
    """A clickable button with text"""
    def __init__(self, x: int, y: int, width: int, height: int, text: str, 
                 color: Tuple[int, int, int] = LIGHT_GRAY, text_color: Tuple[int, int, int] = BLACK):
        super().__init__(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.hover_color = tuple(min(255, c + 30) for c in color)
        self.pressed = False
        self.hovered = False
        self.font = FONT_MEDIUM
        self.callback = None

    def draw(self, surface: pygame.Surface):
        if not self.visible:
            return
            
        # Choose color based on state
        current_color = self.color
        if self.pressed:
            current_color = tuple(max(0, c - 40) for c in self.color)
        elif self.hovered and self.enabled:
            current_color = self.hover_color
        elif not self.enabled:
            current_color = GRAY
            
        # Draw button background
        pygame.draw.rect(surface, current_color, self.rect)
        pygame.draw.rect(surface, BLACK, self.rect, 2)
        
        # Draw text
        text_color = self.text_color if self.enabled else DARK_GRAY
        text_surface = self.font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

    def handle_event(self, event: pygame.event.Event) -> bool:
        if not self.visible or not self.enabled:
            return False
            
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.pressed = True
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            if self.pressed and self.rect.collidepoint(event.pos):
                self.pressed = False
                if self.callback:
                    self.callback()
                return True
            self.pressed = False
            
        return False

class ProgressBar(UIElement):
    """A progress bar for displaying fuel, money, etc."""
    def __init__(self, x: int, y: int, width: int, height: int, 
                 max_value: float, color: Tuple[int, int, int] = GREEN):
        super().__init__(x, y, width, height)
        self.max_value = max_value
        self.current_value = max_value
        self.color = color
        self.bg_color = LIGHT_GRAY
        self.border_color = BLACK

    def set_value(self, value: float):
        self.current_value = max(0, min(self.max_value, value))

    def draw(self, surface: pygame.Surface):
        if not self.visible:
            return
            
        # Draw background
        pygame.draw.rect(surface, self.bg_color, self.rect)
        
        # Draw filled portion
        if self.current_value > 0:
            fill_width = int((self.current_value / self.max_value) * self.rect.width)
            fill_rect = pygame.Rect(self.rect.x, self.rect.y, fill_width, self.rect.height)
            pygame.draw.rect(surface, self.color, fill_rect)
        
        # Draw border
        pygame.draw.rect(surface, self.border_color, self.rect, 2)

class TextDisplay(UIElement):
    """Display text with optional background"""
    def __init__(self, x: int, y: int, text: str, font: pygame.font.Font = FONT_MEDIUM,
                 color: Tuple[int, int, int] = BLACK, bg_color: Optional[Tuple[int, int, int]] = None):
        self.font = font
        self.text = text
        self.color = color
        self.bg_color = bg_color
        
        # Calculate size based on text
        text_surface = self.font.render(text, True, color)
        width, height = text_surface.get_size()
        super().__init__(x, y, width, height)

    def set_text(self, text: str):
        self.text = text
        text_surface = self.font.render(text, True, self.color)
        self.rect.width, self.rect.height = text_surface.get_size()

    def draw(self, surface: pygame.Surface):
        if not self.visible:
            return
            
        # Draw background if specified
        if self.bg_color:
            pygame.draw.rect(surface, self.bg_color, self.rect)
            
        # Draw text
        text_surface = self.font.render(self.text, True, self.color)
        surface.blit(text_surface, self.rect.topleft)

class Dialog:
    """Modal dialog box"""
    def __init__(self, title: str, message: str, buttons: List[str] = ["OK"]):
        self.title = title
        self.message = message
        self.buttons = []
        self.visible = False
        self.result = -1
        
        # Create dialog
        self.width = 400
        self.height = 200
        self.x = (SCREEN_WIDTH - self.width) // 2
        self.y = (SCREEN_HEIGHT - self.height) // 2
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
        # Create buttons
        button_width = 100
        button_height = 30
        button_spacing = 20
        total_button_width = len(buttons) * button_width + (len(buttons) - 1) * button_spacing
        start_x = self.x + (self.width - total_button_width) // 2
        button_y = self.y + self.height - 50
        
        for i, button_text in enumerate(buttons):
            button_x = start_x + i * (button_width + button_spacing)
            button = Button(button_x, button_y, button_width, button_height, button_text)
            button.callback = lambda idx=i: self.button_clicked(idx)
            self.buttons.append(button)

    def button_clicked(self, index: int):
        self.result = index
        self.visible = False

    def show(self):
        self.visible = True
        self.result = -1

    def draw(self, surface: pygame.Surface):
        if not self.visible:
            return
            
        # Draw semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        surface.blit(overlay, (0, 0))
        
        # Draw dialog background
        pygame.draw.rect(surface, WHITE, self.rect)
        pygame.draw.rect(surface, BLACK, self.rect, 3)
        
        # Draw title
        title_surface = FONT_LARGE.render(self.title, True, BLACK)
        title_rect = title_surface.get_rect(centerx=self.rect.centerx, y=self.y + 20)
        surface.blit(title_surface, title_rect)
        
        # Draw message (handle multiple lines)
        lines = self.message.split('\n')
        y_offset = self.y + 60
        for line in lines:
            line_surface = FONT_MEDIUM.render(line, True, BLACK)
            line_rect = line_surface.get_rect(centerx=self.rect.centerx, y=y_offset)
            surface.blit(line_surface, line_rect)
            y_offset += 25
        
        # Draw buttons
        for button in self.buttons:
            button.draw(surface)

    def handle_event(self, event: pygame.event.Event) -> bool:
        if not self.visible:
            return False
            
        for button in self.buttons:
            if button.handle_event(event):
                return True
        return False

class TrainPygameGUI:
    """Main game GUI using pygame"""
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("🚂 Train Adventure - SF to Denver")
        self.clock = pygame.time.Clock()
        self.running = False
        
        # Game engine
        self.engine = GameEngine()
        
        # UI elements
        self.buttons = []
        self.ui_elements = []
        self.dialogs = []
        
        # Train animation
        self.train_animation_offset = 0
        self.animation_speed = 2
        
        # Initialize UI
        self.setup_ui()
        
        # Station positions for the map
        self.station_positions = self.calculate_station_positions()

    def calculate_station_positions(self) -> List[Tuple[int, int, str]]:
        """Calculate positions for stations on the map"""
        # Railway runs across the middle of screen (adjusted for larger status panel)
        railway_y = SCREEN_HEIGHT // 2 + 30
        start_x = 100
        end_x = SCREEN_WIDTH - 100
        
        stations = [
            ("San Francisco", 0, "🌉"),
            ("Sacramento", 90, "🏛️"), 
            ("Reno", 230, "🎰"),
            ("Salt Lake City", 730, "🏔️"),
            ("Denver", 1260, "🏙️")
        ]
        
        total_distance = 1260
        positions = []
        
        for name, distance, emoji in stations:
            progress = distance / total_distance
            x = start_x + progress * (end_x - start_x)
            positions.append((int(x), railway_y, name, emoji))
            
        return positions

    def setup_ui(self):
        """Initialize UI elements"""
        # Action buttons at bottom
        button_width = 130
        button_height = 50
        button_y = SCREEN_HEIGHT - 80
        spacing = 15
        
        total_width = 5 * button_width + 4 * spacing
        start_x = (SCREEN_WIDTH - total_width) // 2
        
        # Travel button
        travel_btn = Button(start_x, button_y, button_width, button_height, "🚂 Travel", LIGHT_BLUE)
        travel_btn.callback = self.handle_travel
        self.buttons.append(travel_btn)
        
        # Passengers button
        passengers_btn = Button(start_x + button_width + spacing, button_y, button_width, button_height, "👥 Passengers", GREEN)
        passengers_btn.callback = self.handle_passengers
        self.buttons.append(passengers_btn)
        
        # Fuel button
        fuel_btn = Button(start_x + 3 * (button_width + spacing), button_y, button_width, button_height, "⛽ Fuel", ORANGE)
        fuel_btn.callback = self.handle_fuel
        self.buttons.append(fuel_btn)
        
        # Scenic Views button
        scenic_btn = Button(start_x + 2 * (button_width + spacing), button_y, button_width, button_height, "🏞️ Scenic Views", GREEN)
        scenic_btn.callback = self.handle_scenic_views
        self.buttons.append(scenic_btn)
        
        # Help button
        help_btn = Button(start_x + 4 * (button_width + spacing), button_y, button_width, button_height, "❓ Help", YELLOW)
        help_btn.callback = self.show_help
        self.buttons.append(help_btn)

    def start_game(self, train_name: str):
        """Start a new game"""
        self.engine.start_new_game(train_name)
        self.running = True
        self.run()

    def run(self):
        """Main game loop"""
        while self.running:
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                
                # Handle dialogs first
                dialog_handled = False
                for dialog in self.dialogs:
                    if dialog.handle_event(event):
                        dialog_handled = True
                        break
                
                # Handle buttons if no dialog is active
                if not dialog_handled and not any(d.visible for d in self.dialogs):
                    for button in self.buttons:
                        button.handle_event(event)
            
            # Update game state
            self.update()
            
            # Draw everything
            self.draw()
            
            # Control frame rate
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

    def update(self):
        """Update game state"""
        # Animate train movement
        self.train_animation_offset += self.animation_speed
        if self.train_animation_offset > 10:
            self.train_animation_offset = -10
        
        # Check dialog results
        self.update_dialog_results()
        
        # Check for game completion
        if self.engine.state and self.engine.is_game_complete():
            if not any(d.visible for d in self.dialogs):
                self.show_completion_dialog()

    def draw(self):
        """Draw everything"""
        # Clear screen
        self.screen.fill(SKY_BLUE)
        
        # Draw landscape
        self.draw_landscape()
        
        # Draw railway and stations
        self.draw_railway()
        self.draw_stations()
        
        # Draw train
        self.draw_train()
        
        # Draw UI elements
        self.draw_status_panel()
        self.draw_buttons()
        
        # Draw dialogs on top
        self.draw_dialogs()
        
        # Update display
        pygame.display.flip()

    def draw_landscape(self):
        """Draw background landscape"""
        # Mountains
        mountain_points = [
            [(200, 300), (250, 200), (300, 300)],
            [(400, 350), (500, 180), (600, 350)],
            [(750, 320), (850, 160), (950, 320)],
        ]
        
        for mountain in mountain_points:
            pygame.draw.polygon(self.screen, GRAY, mountain)
        
        # Simple trees
        tree_positions = [(150, 400), (350, 420), (650, 410), (950, 400), (1100, 415)]
        for x, y in tree_positions:
            # Trunk
            pygame.draw.rect(self.screen, BROWN, (x-2, y, 4, 20))
            # Leaves
            pygame.draw.circle(self.screen, DARK_GREEN, (x, y), 15)

    def draw_railway(self):
        """Draw railway tracks"""
        if len(self.station_positions) < 2:
            return
            
        railway_y = self.station_positions[0][1]
        start_x = self.station_positions[0][0]
        end_x = self.station_positions[-1][0]
        
        # Draw track bed
        pygame.draw.line(self.screen, DARK_GRAY, (start_x, railway_y), (end_x, railway_y), 8)
        
        # Draw rails
        pygame.draw.line(self.screen, BLACK, (start_x, railway_y-2), (end_x, railway_y-2), 2)
        pygame.draw.line(self.screen, BLACK, (start_x, railway_y+2), (end_x, railway_y+2), 2)
        
        # Draw railroad ties
        for i in range(start_x, end_x, 30):
            pygame.draw.rect(self.screen, BROWN, (i-8, railway_y-3, 16, 6))

    def draw_stations(self):
        """Draw station buildings and labels"""
        for i, (x, y, name, emoji) in enumerate(self.station_positions):
            # Station building
            building_rect = pygame.Rect(x-25, y-60, 50, 40)
            pygame.draw.rect(self.screen, RED, building_rect)
            pygame.draw.rect(self.screen, BLACK, building_rect, 2)
            
            # Roof
            roof_points = [(x-30, y-20), (x, y-40), (x+30, y-20)]
            pygame.draw.polygon(self.screen, BROWN, roof_points)
            
            # Platform
            platform_rect = pygame.Rect(x-30, y-10, 60, 8)
            pygame.draw.rect(self.screen, GRAY, platform_rect)
            
            # Special scenic route indicator between Salt Lake City and Denver
            if name == "Salt Lake City":
                # Draw scenic route sparkles to Denver
                denver_x = self.station_positions[i+1][0] if i < len(self.station_positions)-1 else x+100
                self.draw_scenic_route_effects(x, y, denver_x, y)
            
            # Station name
            name_surface = FONT_SMALL.render(f"{emoji} {name}", True, BLACK)
            name_rect = name_surface.get_rect(centerx=x, y=y+20)
            
            # Add scenic route indicator for Salt Lake City to Denver
            if name == "Salt Lake City":
                scenic_text = FONT_SMALL.render("✨ Scenic Route to Denver! ✨", True, GOLD)
                scenic_rect = scenic_text.get_rect(centerx=x, y=y+35)
                # Add background for better visibility
                bg_rect = scenic_rect.inflate(6, 4)
                pygame.draw.rect(self.screen, WHITE, bg_rect)
                pygame.draw.rect(self.screen, GOLD, bg_rect, 2)
                self.screen.blit(scenic_text, scenic_rect)
            
            self.screen.blit(name_surface, name_rect)
            
            # Highlight current station
            if self.engine.state and i == self.engine.state.current_station_index:
                pygame.draw.circle(self.screen, YELLOW, (x, y), 40, 3)

    def draw_scenic_route_effects(self, start_x: int, start_y: int, end_x: int, end_y: int):
        """Draw sparkling effects for the scenic Salt Lake City to Denver route"""
        import time
        
        # Animate sparkles along the route
        num_sparkles = 8
        route_length = end_x - start_x
        
        for i in range(num_sparkles):
            progress = i / num_sparkles
            sparkle_x = int(start_x + progress * route_length)
            sparkle_y = start_y - 15  # Above the track
            
            # Animated sparkle effect
            time_offset = time.time() * 3 + i * 0.5
            sparkle_size = int(3 + 2 * math.sin(time_offset))
            
            # Draw sparkle as a star shape
            if sparkle_size > 2:
                # Star points
                star_points = []
                for angle in range(0, 360, 45):  # 8-point star
                    radius = sparkle_size if angle % 90 == 0 else sparkle_size // 2
                    px = sparkle_x + radius * math.cos(math.radians(angle))
                    py = sparkle_y + radius * math.sin(math.radians(angle))
                    star_points.append((px, py))
                
                pygame.draw.polygon(self.screen, GOLD, star_points)
        
        # Draw "SCENIC ROUTE" text along the path
        if route_length > 100:  # Only if there's enough space
            mid_x = (start_x + end_x) // 2
            mid_y = start_y - 30
            scenic_label = FONT_SMALL.render("🏔️ MOST SCENIC ROUTE 🏔️", True, GOLD)
            scenic_rect = scenic_label.get_rect(centerx=mid_x, y=mid_y)
            
            # Background for readability
            bg_rect = scenic_rect.inflate(8, 4)
            pygame.draw.rect(self.screen, WHITE, bg_rect)
            pygame.draw.rect(self.screen, GOLD, bg_rect, 2)
            self.screen.blit(scenic_label, scenic_rect)

    def draw_train(self):
        if not self.engine.state:
            return
            
        # Get current station position
        current_idx = self.engine.state.current_station_index
        if current_idx >= len(self.station_positions):
            return
            
        station_x, station_y = self.station_positions[current_idx][:2]
        
        # Add animation offset
        train_x = station_x + self.train_animation_offset
        train_y = station_y
        
        # Draw train engine
        engine_rect = pygame.Rect(train_x-20, train_y-15, 40, 20)
        pygame.draw.rect(self.screen, BLUE, engine_rect)
        pygame.draw.rect(self.screen, BLACK, engine_rect, 2)
        
        # Smokestack
        pygame.draw.rect(self.screen, BLACK, (train_x-3, train_y-25, 6, 10))
        
        # Windows
        pygame.draw.rect(self.screen, LIGHT_BLUE, (train_x+5, train_y-8, 10, 6))
        
        # Wheels
        pygame.draw.circle(self.screen, BLACK, (train_x-10, train_y+8), 4)
        pygame.draw.circle(self.screen, BLACK, (train_x+10, train_y+8), 4)
        
        # Passenger car if there are passengers
        if self.engine.state.train.current_passengers:
            car_rect = pygame.Rect(train_x-50, train_y-12, 25, 16)
            pygame.draw.rect(self.screen, GREEN, car_rect)
            pygame.draw.rect(self.screen, BLACK, car_rect, 2)
            
            # Show passenger count
            count_text = str(len(self.engine.state.train.current_passengers))
            count_surface = FONT_SMALL.render(count_text, True, WHITE)
            count_rect = count_surface.get_rect(center=car_rect.center)
            self.screen.blit(count_surface, count_rect)

    def draw_status_panel(self):
        """Draw game status information"""
        if not self.engine.state:
            return
            
        panel_height = 120
        panel_rect = pygame.Rect(0, 0, SCREEN_WIDTH, panel_height)
        pygame.draw.rect(self.screen, WHITE, panel_rect)
        pygame.draw.rect(self.screen, BLACK, panel_rect, 2)
        
        # Train name
        name_surface = FONT_LARGE.render(f"🚂 {self.engine.state.train.name}", True, BLACK)
        self.screen.blit(name_surface, (20, 15))
        
        # Current station
        station_surface = FONT_MEDIUM.render(f"📍 {self.engine.state.current_station.name}", True, BLACK)
        self.screen.blit(station_surface, (20, 45))
        
        # Next station
        if self.engine.state.next_station:
            next_surface = FONT_SMALL.render(f"➡️ Next: {self.engine.state.next_station.name} ({self.engine.state.distance_to_next_station} miles)", True, BLACK)
            self.screen.blit(next_surface, (20, 70))
        
        # Weather with effects description
        weather_emoji = {"sunny": "☀️", "rainy": "🌧️", "snowy": "❄️", "foggy": "🌫️"}
        weather_text = f"{weather_emoji.get(self.engine.state.weather.value, '☀️')} {self.engine.state.weather.value.title()}"
        weather_surface = FONT_MEDIUM.render(weather_text, True, BLACK)
        self.screen.blit(weather_surface, (20, 90))
        
        # Weather effects hint
        try:
            weather_effects = self.engine._get_weather_effects()
            effect_hint = FONT_SMALL.render(weather_effects['description'][:40] + "...", True, DARK_GRAY)
            self.screen.blit(effect_hint, (150, 95))
        except:
            pass
        
        # Fuel bar
        fuel_x, fuel_y = 400, 25
        fuel_bar = ProgressBar(fuel_x, fuel_y, 200, 20, 100)
        fuel_percent = self.engine.state.train.fuel
        fuel_bar.set_value(fuel_percent)
        
        # Color fuel bar based on level
        if fuel_percent > 50:
            fuel_bar.color = GREEN
        elif fuel_percent > 25:
            fuel_bar.color = ORANGE
        else:
            fuel_bar.color = RED
            
        fuel_bar.draw(self.screen)
        
        fuel_label = FONT_SMALL.render(f"⛽ Fuel: {fuel_percent}%", True, BLACK)
        self.screen.blit(fuel_label, (fuel_x, fuel_y-20))
        
        # Money
        money_surface = FONT_MEDIUM.render(f"💰 ${self.engine.state.money}", True, BLACK)
        self.screen.blit(money_surface, (650, 25))
        
        # Passengers with satisfaction indicator
        passenger_count = len(self.engine.state.train.current_passengers)
        max_passengers = self.engine.state.train.passenger_capacity
        passenger_surface = FONT_MEDIUM.render(f"👥 {passenger_count}/{max_passengers}", True, BLACK)
        self.screen.blit(passenger_surface, (800, 25))
        
        # Average passenger satisfaction
        if passenger_count > 0:
            avg_satisfaction = sum(p.satisfaction for p in self.engine.state.train.current_passengers) // passenger_count
            if avg_satisfaction >= 80:
                satisfaction_text = "😊 Happy"
                satisfaction_color = GREEN
            elif avg_satisfaction >= 60:
                satisfaction_text = "🙂 Okay"
                satisfaction_color = ORANGE
            else:
                satisfaction_text = "😐 Unhappy"
                satisfaction_color = RED
                
            satisfaction_surface = FONT_SMALL.render(satisfaction_text, True, satisfaction_color)
            self.screen.blit(satisfaction_surface, (800, 50))
        
        # Time
        time_surface = FONT_SMALL.render(f"🕐 {self.engine.state.time_string}", True, BLACK)
        self.screen.blit(time_surface, (950, 25))
        
        # Current speed with color coding
        speed_text = f"🚂 {self.engine.state.current_speed.value}mph"
        speed_color = BLACK
        if self.engine.state.current_speed.value == 70:  # Fast
            speed_color = RED
        elif self.engine.state.current_speed.value == 30:  # Slow  
            speed_color = GREEN
            
        speed_surface = FONT_SMALL.render(speed_text, True, speed_color)
        self.screen.blit(speed_surface, (950, 50))

    def draw_buttons(self):
        """Draw action buttons"""
        for button in self.buttons:
            # Enable/disable buttons based on game state
            if button.text.startswith("🚂"):
                button.enabled = (self.engine.state and 
                                self.engine.state.next_station and 
                                not self.engine.is_game_complete())
            
            button.draw(self.screen)

    def draw_dialogs(self):
        """Draw all active dialogs"""
        for dialog in self.dialogs:
            dialog.draw(self.screen)

    def show_dialog(self, title: str, message: str, buttons: List[str] = ["OK"]) -> Dialog:
        """Show a modal dialog and return it"""
        dialog = Dialog(title, message, buttons)
        dialog.show()
        self.dialogs.append(dialog)
        return dialog

    def handle_travel(self):
        """Handle travel button click"""
        if not self.engine.state.next_station:
            self.show_dialog("🏁 Journey Complete", "You're already at Denver!")
            return
        
        # Get weather effects for display
        weather_effects = self.engine._get_weather_effects()
        weather_desc = weather_effects['description']
        current_weather = self.engine.state.weather.value.title()
        
        # Create speed options with weather context
        speed_options = ["🐌 Slow (30mph)", "🚶 Normal (50mph)", "🏃 Fast (70mph)", "Cancel"]
        
        # Add warning for snow and fast speed
        if self.engine.state.weather.value == "snowy":
            speed_options[2] = "🏃 Fast (70mph) ⚠️ RISKY IN SNOW!"
        
        # Show speed selection dialog with weather info
        speed_dialog = self.show_dialog(
            "🚂 Choose Speed", 
            f"Travel to {self.engine.state.next_station.name}?\n\n🌤️ Weather: {current_weather}\n{weather_desc}\n\nChoose your speed:",
            speed_options
        )
        
        # We'll check for the result in the update loop since dialogs are handled asynchronously
        def check_speed_result():
            if not speed_dialog.visible and speed_dialog.result >= 0:
                if speed_dialog.result < 3:  # Not cancelled
                    speeds = [TrainSpeed.SLOW, TrainSpeed.MEDIUM, TrainSpeed.FAST]
                    self.engine.set_speed(speeds[speed_dialog.result])
                    
                    result = self.engine.travel_to_next_station()
                    
                    if result["success"]:
                        departing = self.engine.remove_passengers_at_station()
                        message = f"{result['message']}\nTime: {result['travel_time']} min\nFuel used: {result['fuel_used']} units"
                        
                        # Add weather and speed effects to message
                        if "weather_effect" in result:
                            message += f"\n\n🌤️ {result['weather_effect']}"
                        if "speed_effect" in result:
                            message += f"\n🚂 {result['speed_effect']}"
                        
                        if departing:
                            total_tips = sum(max(5, p.satisfaction // 10) for p in departing)
                            message += f"\n\n{len(departing)} passengers got off!\nTips earned: ${total_tips}"
                            
                            # Show passenger satisfaction feedback
                            avg_satisfaction = sum(p.satisfaction for p in departing) // len(departing)
                            if avg_satisfaction >= 80:
                                message += "\n😊 Passengers were very happy!"
                            elif avg_satisfaction >= 60:
                                message += "\n🙂 Passengers had an okay journey."
                            else:
                                message += "\n😐 Passengers were not satisfied..."
                        
                        # Add scenic viewpoint information
                        if "scenic_event" in result and result["scenic_event"]["has_viewpoint"]:
                            scenic = result["scenic_event"]
                            message += f"\n\n✨ SCENIC VIEWPOINT ✨\n🏞️ {scenic['name']}\n{scenic['description']}"
                            message += f"\n\n😊 All passengers gained +{scenic['satisfaction_bonus']} happiness!"
                        
                        self.show_dialog("✅ Travel Success", message)
                    else:
                        self.show_dialog("❌ Travel Failed", result["message"])
                
                self.dialogs.remove(speed_dialog)
        
        # Add a simple check mechanism (you might want to improve this)
        speed_dialog.check_result = check_speed_result

    def handle_passengers(self):
        """Handle passengers button click"""
        destinations = self.engine.get_available_destinations()
        if not destinations:
            self.show_dialog("😔 No Passengers", "No one waiting at this station.")
            return
        
        # Add passengers
        passenger_names = ["Emma", "Oliver", "Sophie", "Jack", "Lily", "Noah"]
        added = 0
        capacity = self.engine.state.train.passenger_capacity
        current = len(self.engine.state.train.current_passengers)
        
        for i in range(min(3, capacity - current)):
            name = random.choice(passenger_names)
            destination = random.choice(destinations)
            
            if self.engine.add_passenger(name, destination):
                added += 1
        
        if added > 0:
            self.show_dialog("✅ Passengers Added", f"{added} passengers boarded!")
        else:
            self.show_dialog("🎫 Train Full", "No more room!")

    def handle_scenic_views(self):
        """Handle scenic views button click - Mini-game for viewing beautiful scenery"""
        current_station = self.engine.state.current_station.name
        
        # Special features for Salt Lake City to Denver route
        if current_station == "Salt Lake City":
            # Show the most beautiful viewpoints on this route
            scenic_options = [
                "🏔️ Wasatch Mountain Range",
                "💎 Great Salt Lake Overlook", 
                "🦅 Rocky Mountain National Park",
                "🌄 Colorado Plateau Vista",
                "⛰️ Continental Divide",
                "❌ Cancel"
            ]
            
            scenic_dialog = self.show_dialog(
                "✨ MOST SCENIC ROUTE TO DENVER ✨",
                f"You're at {current_station}! This is the most beautiful train route in America.\n\nChoose a viewpoint to explore:\n\n🎯 Pro Tip: Each viewpoint increases passenger happiness!",
                scenic_options
            )
            
            def check_scenic_salt_lake_result():
                if not scenic_dialog.visible and scenic_dialog.result >= 0:
                    if scenic_dialog.result < 5:  # Not cancelled
                        viewpoints = [
                            {
                                "name": "Wasatch Mountain Range View",
                                "description": "🏔️ BREATHTAKING! Snow-capped peaks of the Wasatch Mountains stretch endlessly toward the horizon. The morning light creates golden reflections on massive granite cliffs, while mountain goats can be spotted on distant ridges. This is truly one of America's most spectacular mountain vistas!",
                                "bonus": 15,
                                "emoji": "🏔️",
                                "ascii_art": """
                    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                  ░░    ░░░░░░░░  ░░░░░░░░░░  ░░░░░░░░    ░░
                ░░  ░░░░  ░░  ░░▓▓▓▓▓▓▓▓▓▓░░  ░░  ░░░░  ░░
              ░░  ░░▓▓▓░░░░░░▓▓▓▓████████▓▓▓░░░░░░▓▓▓░░  ░░
            ░░░░░░▓▓████▓▓▓▓▓▓██████████████▓▓▓▓▓▓████▓▓░░░░░░
          ░░░░▓▓▓▓██████████████████████████████████████▓▓▓▓░░░░
        ░░░░▓▓████████████████████████████████████████████████▓▓░░░░
      ░░░░▓▓██████████████████████████████████████████████████████▓▓░░░░
    ░░░░▓▓████████████████████████████████████████████████████████████▓▓░░░░
  ░░░░▓▓██████████████████████████████████████████████████████████████████▓▓░░░░
░░░░▓▓████████████████████████████████████████████████████████████████████████▓▓░░░░
      ¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨
                         WASATCH MOUNTAIN RANGE
                           Snow-Capped Majesty"""
                            },
                            {
                                "name": "Great Salt Lake Overlook", 
                                "description": "💎 AMAZING! The vast mirror-like surface of Great Salt Lake sparkles like diamonds under the desert sun. Pink flamingos wade gracefully along the shore while white salt formations create natural art. The lake stretches beyond the horizon like an inland sea!",
                                "bonus": 12,
                                "emoji": "💎",
                                "ascii_art": """
        ☀️    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ☀️
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░
  ░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░
░░░░▒▒▓▓████████████████████████████████████████████████████████▓▓▒▒░░░░
░░▒▒▓▓██████████████████████████████████████████████████████████████▓▓▒▒░░
▒▒▓▓████████████████████████████████████████████████████████████████████▓▓▒▒
▓▓██████████████████████████████████████████████████████████████████████████▓▓
████████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████████
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 🦩           GREAT SALT LAKE           🦩     Salt crystal formations
   Pink flamingo paradise - Mirror-like waters stretch to the horizon"""
                            },
                            {
                                "name": "Rocky Mountain National Park",
                                "description": "🦅 MAGNIFICENT! The majestic Rocky Mountains rise dramatically from the plains like ancient titans. Golden eagles soar overhead on thermal currents while alpine meadows bloom with vibrant wildflowers. Crystal clear streams cascade down rocky slopes, creating nature's symphony!",
                                "bonus": 18,
                                "emoji": "🦅",
                                "ascii_art": """
    🦅              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              🦅
                  ░░    ░░░░░░░░░░░░░░░░░░░░    ░░
                ░░  ▓▓▓▓  ░░░░░░░░░░░░░░  ▓▓▓▓  ░░
              ░░  ▓▓████▓▓░░░░░░░░░░░░░░▓▓████▓▓  ░░
            ░░  ▓▓████████▓▓░░░░░░░░░░▓▓████████▓▓  ░░
          ░░  ▓▓██████████████▓▓▓▓████████████████▓▓  ░░
        ░░  ▓▓████████████████████████████████████████▓▓  ░░
      ░░  ▓▓██████████████████████████████████████████████▓▓  ░░
    ░░  ▓▓████████████████████████████████████████████████████▓▓  ░░
  ░░░░▓▓██████████████████████████████████████████████████████████▓▓░░░░
░░░░▓▓████████████████████████████████████████████████████████████████▓▓░░░░
      🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸
    🌿🌸 Alpine Meadows in Full Bloom 🌸🌿  ╰(◡‿◡)╯  Crystal Streams 💧
                      ROCKY MOUNTAIN NATIONAL PARK"""
                            },
                            {
                                "name": "Colorado Plateau Vista",
                                "description": "🌄 SPECTACULAR! Red rock formations and deep canyons create a painter's paradise. The desert landscape glows with brilliant colors - orange, red, purple, and gold. As the sun sets, the entire sky becomes a canvas of fire and dreams!",
                                "bonus": 14,
                                "emoji": "🌄",
                                "ascii_art": """
  🌅                                                                    🌅
░░▒▒▓▓██████████████████████████████████████████████████████████████▓▓▒▒░░
    ▒▒▓▓████████████████████████████████████████████████████████▓▓▒▒
      ▒▒▓▓██████████████████████████████████████████████████▓▓▒▒
        ▒▒▓▓████████████████████████████████████████████▓▓▒▒
          ▒▒▓▓██████████████████▓▓▓▓██████████████████▓▓▒▒
            ▒▒▓▓████████████▓▓▒▒░░░░▒▒▓▓████████████▓▓▒▒
              ▒▒▓▓████████▓▓▒▒░░    ░░▒▒▓▓████████▓▓▒▒
                ▒▒▓▓████▓▓▒▒░░        ░░▒▒▓▓████▓▓▒▒
                  ▒▒▓▓██▓▓▒▒░░          ░░▒▒▓▓██▓▓▒▒
                    ▒▒▓▓▓▓▒▒░░            ░░▒▒▓▓▓▓▒▒
                      ▒▒▒▒▒▒░░              ░░▒▒▒▒▒▒
                        ░░░░                  ░░░░
                  🏜️ Red Rock Canyonlands 🏜️
               Desert landscape painted by ancient gods"""
                            },
                            {
                                "name": "Continental Divide Crossing",
                                "description": "⛰️ UNBELIEVABLE! At 11,000 feet elevation, you're literally on top of America! The Continental Divide offers 360-degree views of snow-capped peaks stretching infinitely in all directions. The crystal-clear mountain air makes you feel like you can touch the clouds!",
                                "bonus": 20,
                                "emoji": "⛰️",
                                "ascii_art": """
  ☁️        ☁️        ☁️        ☁️        ☁️        ☁️
    ░░░░░░░░    ░░░░░░░░    ░░░░░░░░    ░░░░░░░░
  ░░  ▓▓▓▓  ░░░░  ▓▓▓▓  ░░░░  ▓▓▓▓  ░░░░  ▓▓▓▓  ░░
░░  ▓▓████▓▓  ░░▓▓████▓▓  ░░▓▓████▓▓  ░░▓▓████▓▓  ░░
  ▓▓████████▓▓▓▓████████▓▓▓▓████████▓▓▓▓████████▓▓
▓▓████████████████████████████████████████████████████▓▓
██████████████████████████████████████████████████████████
██████████████████████████████████████████████████████████
██████████████████████████████████████████████████████████
██████████████████████████████████████████████████████████
██████████████████████████████████████████████████████████
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ❄️ 11,000 FEET ABOVE SEA LEVEL ❄️
              CONTINENTAL DIVIDE CROSSING
           🌬️ Touch the clouds! 360° mountain views 🌬️"""
                            }
                        ]
                        
                        selected_viewpoint = viewpoints[scenic_dialog.result]
                        
                        # Apply happiness bonus to all passengers
                        passenger_count = len(self.engine.state.train.current_passengers)
                        if passenger_count > 0:
                            for passenger in self.engine.state.train.current_passengers:
                                passenger.satisfaction = min(100, passenger.satisfaction + selected_viewpoint["bonus"])
                            
                            bonus_message = f"\n\n😊 All {passenger_count} passengers gained +{selected_viewpoint['bonus']} happiness!"
                        else:
                            bonus_message = "\n\n(No passengers aboard to enjoy the view)"
                        
                        # Show the scenic description with ASCII art
                        self.show_dialog(
                            f"{selected_viewpoint['emoji']} {selected_viewpoint['name']}",
                            selected_viewpoint["ascii_art"] + "\n\n" + selected_viewpoint["description"] + bonus_message
                        )
                    
                    self.dialogs.remove(scenic_dialog)
            
            scenic_dialog.check_result = check_scenic_salt_lake_result
            
        elif current_station == "Denver":
            # Special Denver city views
            denver_views = [
                "🏙️ Downtown Skyline",
                "🏔️ Rocky Mountain Backdrop",
                "🌆 Mile High Sunset",
                "❌ Cancel"
            ]
            
            denver_dialog = self.show_dialog(
                "🏙️ DENVER CITY VIEWS",
                "Welcome to the Mile High City! Explore Denver's beautiful urban and mountain vistas:",
                denver_views
            )
            
            def check_denver_views():
                if not denver_dialog.visible and denver_dialog.result >= 0:
                    if denver_dialog.result < 3:
                        denver_viewpoints = [
                            {
                                "name": "Downtown Denver Skyline",
                                "description": "🏙️ The impressive Denver skyline rises majestically with gleaming skyscrapers against the Rocky Mountain backdrop. The city buzzes with energy while maintaining its western charm!",
                                "bonus": 8,
                                "ascii_art": """
        🏔️        🏔️        🏔️        🏔️        🏔️
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
░░▓▓████████████████████████████████████████████████████████▓▓░░
  ▓▓██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██▓▓
  ▓▓██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██▓▓
  ▓▓██▓▓██▓▓██  ██▓▓██  ██▓▓██▓▓██  ██▓▓██▓▓██  ██▓▓██▓▓
  ▓▓████████████████████████████████████████████████████▓▓
  ▓▓██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██▓▓
  ▓▓██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██░░██▓▓
  ▓▓████████████████████████████████████████████████████▓▓
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         🏙️ DOWNTOWN DENVER SKYLINE 🏙️
           Mile High City - Where the West Meets Sky"""
                            },
                            {
                                "name": "Rocky Mountain Backdrop",
                                "description": "🏔️ Denver sits perfectly framed by the snow-capped Rocky Mountains. The contrast between urban life and wild nature creates a uniquely beautiful panorama!",
                                "bonus": 12,
                                "ascii_art": """
    ❄️      ❄️      ❄️      ❄️      ❄️      ❄️      ❄️
  ░░░░    ░░░░    ░░░░    ░░░░    ░░░░    ░░░░    ░░░░
░░  ▓▓  ░░  ▓▓  ░░  ▓▓  ░░  ▓▓  ░░  ▓▓  ░░  ▓▓  ░░  ▓▓
  ▓▓████▓▓████▓▓████▓▓████▓▓████▓▓████▓▓████▓▓████▓▓██
▓▓████████████████████████████████████████████████████████▓▓
████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████
          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
        ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
      ░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░
    ░░▒▒▓▓██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██▓▓▒▒░░
  ░░▒▒▓▓████████████████████████████████████████▓▓▒▒░░
░░▒▒▓▓██ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ██▓▓▒▒░░
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   🏔️ ROCKY MOUNTAINS FRAMING DENVER 🏔️
     Nature's Cathedral surrounds the Mile High City"""
                            },
                            {
                                "name": "Mile High Sunset",
                                "description": "🌆 At exactly one mile above sea level, Denver offers spectacular sunsets. The thin mountain air creates brilliant colors that paint both city and mountains in golden light!",
                                "bonus": 10,
                                "ascii_art": """
🌅                                                      🌅
  ░░▒▒▓▓██████████████████████████████████████▓▓▒▒░░
░░░░▒▒▓▓████████████████████████████████████████▓▓▒▒░░░░
    ░░▒▒▓▓████████████████████████████████████▓▓▒▒░░
      ░░▒▒▓▓████████████████████████████████▓▓▒▒░░
        ░░▒▒▓▓████████████████████████████▓▓▒▒░░
          ░░▒▒▓▓████████████████████████▓▓▒▒░░
            ░░▒▒▓▓████████████████████▓▓▒▒░░
              ░░▒▒▓▓██ ██ ██ ██ ██▓▓▒▒░░
                ░░▒▒▓▓████████████▓▓▒▒░░
                  ░░▒▒▓▓████████▓▓▒▒░░
                    ░░▒▒▓▓████▓▓▒▒░░
                      ░░▒▒▓▓▓▓▒▒░░
                        ░░▒▒▒▒░░
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       🌆 MILE HIGH SUNSET AT 5,280 FEET 🌆
         Golden hour paints the sky in fire and dreams"""
                            }
                        ]
                        
                        selected = denver_viewpoints[denver_dialog.result]
                        passenger_count = len(self.engine.state.train.current_passengers)
                        
                        if passenger_count > 0:
                            for passenger in self.engine.state.train.current_passengers:
                                passenger.satisfaction = min(100, passenger.satisfaction + selected["bonus"])
                            bonus_msg = f"\n\n😊 All {passenger_count} passengers gained +{selected['bonus']} happiness!"
                        else:
                            bonus_msg = ""
                            
                        self.show_dialog(f"🏙️ {selected['name']}", selected["ascii_art"] + "\n\n" + selected["description"] + bonus_msg)
                    
                    self.dialogs.remove(denver_dialog)
            
            denver_dialog.check_result = check_denver_views
            
        else:
            # General scenic viewing for other stations
            general_views = [
                "🌅 Prairie Landscape",
                "🌲 Forest Scenery", 
                "🏞️ River Valley",
                "❌ Cancel"
            ]
            
            general_dialog = self.show_dialog(
                f"🏞️ SCENIC VIEWS FROM {current_station}",
                "Take a moment to enjoy the natural beauty around this station:",
                general_views
            )
            
            def check_general_views():
                if not general_dialog.visible and general_dialog.result >= 0:
                    if general_dialog.result < 3:
                        general_viewpoints = [
                            {
                                "name": "Prairie Landscape",
                                "description": "🌅 Endless golden grasslands stretch to the horizon, dotted with grazing cattle and wildflowers. The wide open sky creates a sense of infinite freedom!",
                                "bonus": 6,
                                "ascii_art": """
        ☀️                                                    ☀️
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░
░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░
░░▒▒▓▓██████████████████████████████████████████████████▓▓▒▒░░
▒▒▓▓████████████████████████████████████████████████████████▓▓▒▒
▓▓██████ 🐄 ██████ 🌻 ████████ 🐄 ██████ 🌻 ████████████████▓▓
████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          🌾 ENDLESS PRAIRIE GRASSLANDS 🌾
             Where the buffalo once roamed free"""
                            },
                            {
                                "name": "Forest Scenery",
                                "description": "🌲 Dense pine and oak forests line the railway, home to deer, rabbits, and countless birds. Sunbeams filter through the canopy creating magical light patterns!",
                                "bonus": 5,
                                "ascii_art": """
        ✨    ✨    ✨    ✨    ✨    ✨    ✨
      🌲    🌲    🌲    🌲    🌲    🌲    🌲
    ░░███░░░░███░░░░███░░░░███░░░░███░░░░███░░░░██
  ░░███████████████████████████████████████████████░░
░░█████████████████████████████████████████████████████░░
███████████████████████████████████████████████████████████
██████ 🦌 ████████████ 🐿️ ██████████████ 🦌 █████████████
███████████████████████████████████████████████████████████
███████████████████████████████████████████████████████████
██████████ 🐰 █████████████████████████████████████████████
███████████████████████████████████████████████████████████
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           🌲 DEEP FOREST WILDERNESS 🌲
             Nature's sanctuary filled with life"""
                            },
                            {
                                "name": "River Valley",
                                "description": "🏞️ A winding river follows the train tracks through a lush green valley. Willow trees sway gently in the breeze while ducks paddle peacefully in the clear water!",
                                "bonus": 7,
                                "ascii_art": """
    🦅                                                    🦅
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░
▒▒▓▓██████████████████████████████████████████████████████▓▓▒▒
▓▓████████ 🌿 ████████████████████████████ 🌿 ███████████▓▓
██████████████████████████████████████████████████████████████
████████████████████~~~~~~~~~~~~~~~~████████████████████████
██████████████~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~████████
████████~~~~~~ 🦆    ~~~~~~~~~~~~~~~~~    🦆 ~~~~~~~~████████
██~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~ 🌊 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 🌊 ~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           🏞️ PEACEFUL RIVER VALLEY 🏞️
            Crystal waters wind through green meadows"""
                            }
                        ]
                        
                        selected = general_viewpoints[general_dialog.result]
                        passenger_count = len(self.engine.state.train.current_passengers)
                        
                        if passenger_count > 0:
                            for passenger in self.engine.state.train.current_passengers:
                                passenger.satisfaction = min(100, passenger.satisfaction + selected["bonus"])
                            bonus_msg = f"\n\n😊 All {passenger_count} passengers gained +{selected['bonus']} happiness!"
                        else:
                            bonus_msg = ""
                            
                        self.show_dialog(f"🏞️ {selected['name']}", selected["ascii_art"] + "\n\n" + selected["description"] + bonus_msg)
                    
                    self.dialogs.remove(general_dialog)
            
            general_dialog.check_result = check_general_views

    def handle_fuel(self):
        """Handle fuel button click"""
        fuel = self.engine.state.train.fuel
        money = self.engine.state.money
        
        fuel_dialog = self.show_dialog(
            "⛽ Fuel Station",
            f"Fuel: {fuel}%\nMoney: ${money}\nPrice: $2 per unit",
            ["Fill Tank", "Buy 20 ($40)", "Buy 10 ($20)", "Cancel"]
        )
        
        def check_fuel_result():
            if not fuel_dialog.visible and fuel_dialog.result >= 0:
                if fuel_dialog.result == 0:  # Fill up
                    needed = self.engine.state.train.max_fuel - self.engine.state.train.fuel
                    if self.engine.refuel(needed):
                        self.show_dialog("✅ Refueled", f"Tank full! Cost: ${needed * 2}")
                    else:
                        self.show_dialog("❌ No Money", "Not enough money!")
                elif fuel_dialog.result == 1:  # Buy 20
                    if self.engine.refuel(20):
                        self.show_dialog("✅ Refueled", "Added 20 fuel!")
                    else:
                        self.show_dialog("❌ No Money", "Need $40!")
                elif fuel_dialog.result == 2:  # Buy 10
                    if self.engine.refuel(10):
                        self.show_dialog("✅ Refueled", "Added 10 fuel!")
                    else:
                        self.show_dialog("❌ No Money", "Need $20!")
                
                self.dialogs.remove(fuel_dialog)
        
        fuel_dialog.check_result = check_fuel_result

    def show_help(self):
        """Show help dialog"""
        help_text = ("🎯 Get from San Francisco to Denver!\n\n" +
                    "🎮 Click buttons to play:\n" +
                    "• Travel between stations\n" +
                    "• Pick up passengers for money\n" +
                    "• Buy fuel to keep moving\n" +
                    "• 🏞️ Scenic Views: Enjoy beautiful landscapes!\n\n" +
                    "💡 Strategy Tips:\n" +
                    "• Watch the weather! Snow slows you down\n" +
                    "• Fast speeds use more fuel\n" +
                    "• Happy passengers give better tips\n" +
                    "• Avoid fast travel in snow storms!\n" +
                    "• ✨ Salt Lake City to Denver has the BEST views!\n" +
                    "• Scenic viewing increases passenger happiness!")
        
        self.show_dialog("❓ How to Play", help_text)

    def show_completion_dialog(self):
        """Show game completion dialog"""
        money = self.engine.state.money
        fuel = self.engine.state.train.fuel
        
        completion_message = (f"🎉 CONGRATULATIONS! 🎉\n\n" +
                            f"Made it to Denver!\n" +
                            f"Money: ${money}\n" +
                            f"Fuel: {fuel}%\n\n" +
                            f"Great job! 🌟")
        
        completion_dialog = self.show_dialog("🏆 Success!", completion_message, ["🔄 Play Again", "🚪 Quit"])
        
        def check_completion_result():
            if not completion_dialog.visible and completion_dialog.result >= 0:
                if completion_dialog.result == 0:  # Play Again
                    train_name = self.engine.state.train.name
                    self.engine.start_new_game(train_name)
                else:  # Quit
                    self.running = False
                
                self.dialogs.remove(completion_dialog)
        
        completion_dialog.check_result = check_completion_result

    def update_dialog_results(self):
        """Check for dialog results - should be called in update loop"""
        for dialog in self.dialogs[:]:  # Copy list to avoid modification during iteration
            if hasattr(dialog, 'check_result') and not dialog.visible:
                dialog.check_result()

class TrainPygameApp:
    """Application wrapper for pygame GUI"""
    def __init__(self):
        self.gui = None

    def run_game(self, train_name: str):
        """Run the pygame train game"""
        self.gui = TrainPygameGUI()
        self.gui.start_game(train_name)

if __name__ == "__main__":
    app = TrainPygameApp()
    app.run_game("Test Train")