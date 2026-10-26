#!/usr/bin/env python3

# Test script for the arcade GUI
def test_arcade_gui():
    try:
        from arcade_gui import TrainArcadeApp
        print("✅ Arcade GUI imports successfully!")
        print("🎮 The enhanced railway board is ready to play!")
        print()
        print("🚀 To run the game:")
        print("   python main.py")
        print("   Then choose option 1 for the enhanced GUI")
        print()
        print("📦 Make sure you have arcade installed:")
        print("   pip install arcade")
        return True
    except ImportError as e:
        print("❌ Arcade GUI import failed:")
        print(f"   {e}")
        print()
        print("💡 Install arcade with: pip install arcade")
        return False

def test_cli_gui():
    try:
        from ui import TrainUI
        print("✅ CLI interface imports successfully!")
        return True
    except ImportError as e:
        print("❌ CLI interface import failed:")
        print(f"   {e}")
        return False

def test_game_engine():
    try:
        from game_engine import GameEngine
        from game_state import GameState, Train
        
        # Test basic game creation
        engine = GameEngine()
        state = engine.start_new_game("Test Express")
        
        print(f"✅ Game engine works! Train: {state.train.name}")
        print(f"   Starting at: {state.current_station.name}")
        print(f"   Fuel: {state.train.fuel}%")
        print(f"   Money: ${state.money}")
        return True
    except Exception as e:
        print("❌ Game engine test failed:")
        print(f"   {e}")
        return False

if __name__ == "__main__":
    print("🚂 Testing Train Adventure Components")
    print("=" * 40)
    
    # Test components
    engine_ok = test_game_engine()
    cli_ok = test_cli_gui()
    arcade_ok = test_arcade_gui()
    
    print("=" * 40)
    if engine_ok and cli_ok:
        print("🎉 All core components are working!")
        if arcade_ok:
            print("🌟 Enhanced Arcade GUI is ready!")
        else:
            print("⚠️  Arcade GUI needs 'pip install arcade', but CLI works fine!")
    else:
        print("❌ Some components failed - check the errors above")