# Monopoly Text-Based Game

A complete implementation of the classic Monopoly board game in Python with a text-based interface. The game follows standard Monopoly rules with proper separation of game logic and UI.

## Features

- **2-4 player support** (mix of human and AI players)
- **AI opponents** with three difficulty levels (easy, medium, hard)
- **Intelligent AI decision-making** for property purchases, house building, and bankruptcy management
- **Complete Monopoly board** with all 28 properties, 4 railroads, and 2 utilities
- **Full game mechanics** including property buying, house building, mortgaging, rent collection
- **Jail system** with doubles, cards, and $50 payment options
- **Bankruptcy handling** with property liquidation
- **Text-based interface** with clear menus and game state display

## Project Structure

```
monopoly/
├── core/                 # Game logic and data structures
│   ├── __init__.py
│   ├── player.py        # Player class and methods
│   ├── property.py      # Property class and rent calculations
│   ├── board.py         # Board setup and property management
│   └── game.py          # Game state and rules engine
├── ui/                   # User interface layer
│   ├── __init__.py
│   └── text_ui.py       # Text-based interface implementation
├── tests/                # Unit tests
│   ├── __init__.py
│   ├── test_player.py   # Player class tests
│   ├── test_property.py # Property class tests
│   └── test_game.py     # Game state tests
├── main.py              # Main game entry point
└── README.md           # This file
```

## How to Play

### Starting the Game

1. Navigate to the monopoly directory:
   ```bash
   cd pygame/monopoly
   ```

2. Run the game:
   ```bash
   python main.py
   ```

3. Follow the prompts to:
   - Enter the number of players (2-4)
   - Enter player names

### Game Controls

During your turn, you can:

- **1. Roll Dice** - Roll dice and move your token
- **2. View Properties** - See your properties and their status
- **3. Buy Houses** - Build houses on your monopolies
- **4. Sell Houses** - Sell houses or mortgage properties
- **5. Mortgage Properties** - Mortgage properties for cash
- **6. Unmortgage Properties** - Pay to unmortgage properties
- **7. Trade** - (Not yet implemented)
- **8. View Board** - Display the game board
- **9. Quit Game** - Exit the game

### Game Rules

The game follows standard Monopoly rules:

- **Starting money**: Each player starts with $1500
- **Passing GO**: Collect $200 when passing GO
- **Property buying**: Buy unowned properties when landing on them
- **Rent**: Pay rent when landing on owned properties
- **Houses**: Build houses when you own all properties in a color group
- **Jail**: Go to jail on 3 doubles, Chance/Community Chest cards, or landing on "Go to Jail"
- **Bankruptcy**: Players are eliminated when they cannot pay their debts
- **Winning**: Last player remaining wins

## Development

### Running Tests

```bash
# Run all tests
python -m unittest discover tests

# Run specific test file
python -m unittest tests.test_player
python -m unittest tests.test_property
python -m unittest tests.test_game
```

### Architecture

The game is designed with clear separation of concerns:

- **Core Layer**: Contains all game logic, rules, and data structures
- **UI Layer**: Handles user interaction without game logic
- **Game State**: Manages the current state of the game
- **Board**: Contains all property definitions and board layout

### Adding AI Players

AI player support is planned for a future update. The architecture supports adding AI by:

1. Creating an AIPlayer class that inherits from Player
2. Implementing AI decision-making logic
3. Adding AI selection to the game setup

## Future Enhancements

- AI player support
- Save/load game state
- Trading between players
- Chance and Community Chest cards
- Auction system for unowned properties
- Enhanced UI with colors and better formatting
- Statistics tracking
- Time limits for turns

## License

This is an educational implementation of Monopoly. Monopoly is a trademark of Hasbro, Inc.