#!/usr/bin/env python3
"""
Monopoly Game Demo
Quick demonstration of the Monopoly game with AI players
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.game import GameState
from ai.ai_player import AIPlayer

def demo_game():
    """Demonstrate the game setup and functionality"""
    print("🎲 MONOPOLY GAME DEMO")
    print("=" * 50)
    
    # Demo: AI vs Human game setup
    game = GameState([
        {'name': 'AI_Hard', 'difficulty': 'hard'}, 
        {'name': 'AI_Medium', 'difficulty': 'medium'},
        'Human_Player'
    ])
    
    print("\n📋 Game Setup Complete!")
    print(f"Players: {len(game.players)}")
    
    for i, player in enumerate(game.players):
        player_type = 'AI' if isinstance(player, AIPlayer) else 'Human'
        print(f"\n{i+1}. {player.name}")
        print(f"   Type: {player_type}")
        if player_type == 'AI':
            print(f"   Difficulty: {player.difficulty}")
            print(f"   Aggression: {player.aggression_level}")
            print(f"   Risk Tolerance: {player.risk_tolerance}")
        print(f"   Money: ${player.money}")
        print(f"   Token: {player.token}")
        print(f"   Position: {player.position}")
    
    print(f"\n🎮 Game Board:")
    print(f"   Properties: {len(game.board.properties)}")
    print(f"   Space Count: {len(game.board.spaces)}")
    
    print(f"\n🎯 Ready to Play!")
    print("To start the game:")
    print("1. Navigate to the monopoly directory")
    print("2. Run: python main.py")
    print("3. Follow the prompts to set up your game!")
    
    # Demo AI decision making
    print(f"\n🤖 AI Decision Demo:")
    ai_player = game.players[0]  # AI_Hard
    
    # Test property buying decision
    mediterranean = game.board.properties["Mediterranean Avenue"]
    buy_decision = ai_player.decide_buy_property(
        "Mediterranean Avenue", mediterranean.price, game
    )
    print(f"   Mediterranean Avenue (${mediterranean.price}): {'BUY' if buy_decision else 'PASS'}")
    
    # Test house building
    if ai_player.can_afford(mediterranean.price):
        game.buy_property(ai_player, "Mediterranean Avenue")
        game.buy_property(ai_player, "Baltic Avenue")
        house_decision = ai_player.decide_build_house(game)
        if house_decision:
            print(f"   House building: {house_decision}")
        else:
            print("   House building: Not optimal yet")
    
    print(f"\n✅ Game is fully functional!")

if __name__ == "__main__":
    demo_game()