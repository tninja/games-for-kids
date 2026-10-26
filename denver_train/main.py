#!/usr/bin/env python3

import sys

def choose_interface():
    """Let user choose between CLI and GUI"""
    print("🚂 Welcome to Train Adventure! 🚂")
    print()
    print("👋 Hello! You're going to be a train conductor!")
    print("🎯 Your job is to drive a train from San Francisco to Denver.")
    print("🎫 Pick up passengers and help them reach their destinations!")
    print()
    
    print("How would you like to play?")
    print("1. 🖥️  Modern GUI - Beautiful graphics with smooth interactions!")
    print("2. 📝 Text Adventure (CLI) - Classic text-based game")
    print()
    
    while True:
        choice = input("Choose 1 or 2: ").strip()
        if choice == "1":
            return "gui"
        elif choice == "2":
            return "cli"
        else:
            print("Please choose 1 for GUI or 2 for CLI!")

def get_train_name():
    """Get train name from user"""
    while True:
        train_name = input("🚂 What would you like to name your train? ").strip()
        if train_name:
            return train_name
        print("Please give your train a name!")

def run_cli_game(train_name):
    """Run the CLI version"""
    from ui import TrainUI
    
    print(f"🌟 Great choice! Welcome aboard the {train_name}!")
    print("🌟 Press Enter to start your adventure...")
    input()
    
    # Initialize game
    ui = TrainUI()
    ui.engine.start_new_game(train_name)
    
    # Main game loop
    while True:
        ui.clear_screen()
        ui.display_header()
        ui.display_train_status()
        ui.display_passengers()
        
        # Check if game is complete
        if ui.engine.is_game_complete():
            ui.show_game_complete()
            break
        
        # Show station menu and handle choice
        action = ui.show_station_menu()
        
        if action == "travel":
            ui.handle_travel()
        elif action == "passengers":
            ui.handle_passengers()
        elif action == "fuel":
            ui.handle_fuel()
        elif action == "details":
            ui.clear_screen()
            ui.display_header()
            ui.display_train_status()
            ui.display_passengers()
            print("🌟 Press Enter to continue...")
            input()
        elif action == "help":
            ui.clear_screen()
            ui.show_help()
        elif action == "finish":
            ui.show_game_complete()
            break

def run_gui_game(train_name):
    """Run the pygame GUI version"""
    try:
        from pygame_gui import TrainPygameApp
        print(f"🌟 Great choice! Welcome aboard the {train_name}!")
        print("🌟 Starting the modern pygame GUI...")
        print("🎮 Click buttons to play, and enjoy the smooth interactions!")
        
        app = TrainPygameApp()
        app.run_game(train_name)
    except ImportError as e:
        print("❌ Sorry! The GUI version needs the pygame library to be installed.")
        print("💡 To install pygame, run: pip install pygame")
        print("🔄 Switching to text mode...")
        print(f"Error details: {e}")
        print()
        run_cli_game(train_name)

def main():
    # Choose interface
    interface = choose_interface()
    
    # Get train name
    train_name = get_train_name()
    
    # Run appropriate version
    if interface == "gui":
        run_gui_game(train_name)
    else:
        run_cli_game(train_name)

if __name__ == "__main__":
    main()