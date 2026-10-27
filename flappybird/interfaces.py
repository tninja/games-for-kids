'''
Game Interface Module

This module handles the game's interface states:
1. Start Screen Interface:
   - Displays title and instructions
   - Shows animated birds
   - Handles mode selection (1P/2P)
   - Transitions to main game

2. Game Over Interface:
   - Shows final score
   - Plays death animation
   - Handles restart/quit options
   - Manages state transition

Key Features:
- Smooth animations
- Interactive elements
- Sound effect integration
- State management

Author:
    Charles
WeChat Official Account:
    Charles的皮卡丘
'''
import pygame
from .base import QuitGame
from .sprites import Bird, GrandBase


def GameStartInterface(screen, resource, cfg):
    """
    Creates and manages the game's start screen.
    
    Features:
    1. Visual Elements:
       - Background sky
       - Scrolling ground
       - Title message
       - Animated birds
    
    2. Player Options:
       - SPACE: Start single player
       - RSHIFT: Start two player
       - ESC: Quit game
    
    3. Animation Systems:
       - Birds bob up and down
       - Ground scrolls continuously
       - Wing flapping animation
    
    Args:
        screen: Pygame display surface
        resource: Game resource manager
        cfg: Game configuration
    
    Returns:
        tuple: (bird1, bird2, ground) - Game sprites for selected mode
    """
    other_images, backgroud_image = resource.other_images, resource.backgroud_image
    base_pos = [0, cfg.SCREENSIZE[1]*0.79]
    grand_base = GrandBase(image=other_images['base'], position=base_pos,
                           background_image_width=backgroud_image.get_width(),
                           flying_speed=cfg.FLYING_SPEED)
    bird = Bird(images=resource.bird_images, sounds=resource.sounds,
                screen_width=cfg.SCREENSIZE[0], screen_height=cfg.SCREENSIZE[1], base_height=base_pos[1],
                dropping_speed=cfg.DROPPING_SPEED, flapping_speed=cfg.FLAPPING_SPEED, x=0.2)
    bird2 = Bird(images=resource.bird2_images, sounds=resource.sounds,
                 screen_width=cfg.SCREENSIZE[0], screen_height=cfg.SCREENSIZE[1], base_height=base_pos[1],
                 dropping_speed=cfg.DROPPING_SPEED, flapping_speed=cfg.FLAPPING_SPEED, x=0.05)
    clock = pygame.time.Clock()
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                QuitGame()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    return (bird, None, grand_base)
                elif event.key == pygame.K_RSHIFT:
                    return (bird, bird2, grand_base)

        screen.blit(backgroud_image, (0, 0))
        msg_pos = [(cfg.SCREENSIZE[0]-other_images['message'].get_width())/2, cfg.SCREENSIZE[1]*0.12]
        screen.blit(other_images['message'], msg_pos)
        grand_base.updateAndDraw(screen)
        bird.flyInStartInterface()
        bird.draw(screen)
        bird2.flyInStartInterface()
        bird2.draw(screen)
        pygame.display.update()
        clock.tick(cfg.FPS)


# '''
# Function:
#     游戏结束界面
# Author:
#     Charles
# 微信公众号:
#     Charles的皮卡丘
# '''


# '''游戏结束界面'''
def GameEndIterface(screen, resource, showScore, score, bird, pipe_sprites, grand_base, cfg):
    """
    Manages the game over screen and transitions.
    
    Features:
    1. Death Sequence:
       - Plays death sound
       - Shows bird falling animation
       - Maintains final scene frozen
    
    2. Display Elements:
       - Final score
       - Background scene
       - Last position of pipes
       - Ground position
    
    3. Player Options:
       - SPACE/RSHIFT: Restart game
       - ESC: Quit game
    
    Args:
        screen: Pygame display surface
        resource: Game resource manager
        showScore: Score display function
        score: Final score achieved
        bird: Bird sprite that died
        pipe_sprites: Final pipe positions
        grand_base: Ground sprite
        cfg: Game configuration
    """
    sounds, number_images, backgroud_image = resource.sounds, resource.number_images, resource.backgroud_image
    sounds['die'].play()  # Play death sound effect
    clock = pygame.time.Clock()  # Initialize frame timing
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                QuitGame()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE or event.key == pygame.K_RSHIFT:
                    return
        bird.update(float(clock.tick(cfg.FPS))/1000.)  # Update bird falling animation
        screen.blit(backgroud_image, (0, 0))  # Draw background
        pipe_sprites.draw(screen)  # Draw final pipe positions
        grand_base.draw(screen)  # Draw ground
        showScore(cfg, screen, score, number_images)  # Show final score
        bird.draw(screen)  # Draw bird in final position
        pygame.display.update()
        clock.tick(cfg.FPS)
