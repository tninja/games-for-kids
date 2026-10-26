#!/usr/bin/env python3

"""
Simple test script for the pygame GUI
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all imports work correctly"""
    print("Testing imports...")
    
    try:
        import pygame
        print("✅ pygame imported successfully")
    except ImportError as e:
        print(f"❌ pygame import failed: {e}")
        return False
        
    try:
        from game_engine import GameEngine
        print("✅ GameEngine imported successfully")
    except ImportError as e:
        print(f"❌ GameEngine import failed: {e}")
        return False
        
    try:
        from game_state import GameState, Train, TrainSpeed, WeatherType
        print("✅ game_state imported successfully")
    except ImportError as e:
        print(f"❌ game_state import failed: {e}")
        return False
        
    try:
        from pygame_gui import TrainPygameGUI, TrainPygameApp
        print("✅ pygame_gui imported successfully")
    except ImportError as e:
        print(f"❌ pygame_gui import failed: {e}")
        return False
        
    return True

def test_basic_functionality():
    """Test basic functionality without opening a window"""
    print("\nTesting basic functionality...")
    
    try:
        from game_engine import GameEngine
        from pygame_gui import TrainPygameApp
        
        # Test engine
        engine = GameEngine()
        state = engine.start_new_game("Test Train")
        print(f"✅ Game engine works - Train: {state.train.name}")
        
        # Test app creation (without running)
        app = TrainPygameApp()
        print("✅ Pygame app created successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def main():
    print("🚂 Train Adventure - Pygame GUI Test Script")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed!")
        return False
    
    # Test basic functionality
    if not test_basic_functionality():
        print("\n❌ Basic functionality tests failed!")
        return False
    
    print("\n✅ All tests passed!")
    print("\n🎮 The pygame GUI should work correctly.")
    print("Run 'python main.py' and choose option 1 to test the GUI.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)