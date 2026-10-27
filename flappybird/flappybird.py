'''
Flappy Bird Game Implementation

A classic Flappy Bird clone featuring:
1. Single or Two Player Modes:
   - One or two birds can play simultaneously
   - Each bird can be manually controlled or AI-driven

2. Game Mechanics:
   - Birds must navigate through pipe obstacles
   - Gravity affects bird movement
   - Score increases when passing pipes
   - Collision detection with pipes and boundaries

3. Technical Features:
   - Pygame-based graphics and sound
   - Smooth scrolling background
   - Pixel-perfect collision detection
   - Configurable game parameters

4. Game States:
   - Start screen with animated birds
   - Main gameplay loop
   - Game over screen with score display

Author:
    Charles
WeChat Official Account:
    Charles的皮卡丘
'''
import pygame
from .base import PygameBaseGame, QuitGame
from .configs import Config, Resource
from .interfaces import GameEndIterface, GameStartInterface
from .sprites import Pipe


class FlappyBirdGame(PygameBaseGame):
    """
    Main game controller class for Flappy Bird.
    
    Inherits from PygameBaseGame for basic game functionality.
    Manages the complete game lifecycle including:
    - Game initialization
    - Main game loop
    - State transitions
    - Resource management
    - Player input handling
    - Score tracking
    """
    
    game_type = 'flappybird'  # Identifier for game type
    
    def __init__(self, **kwargs):
        """
        Initialize game components.
        
        Sets up:
        - Game configuration
        - Screen and resources
        - Sound system
        - Base game elements
        
        Args:
            **kwargs: Additional configuration options
        """
        self.cfg = Config  # Load game configuration
        super(FlappyBirdGame, self).__init__(config=self.cfg, **kwargs)  # Initialize base game

    def run(self):
        """
        Main game loop that controls the entire game flow.
        
        Game Loop Phases:
        1. Initialization:
           - Sets up screen, resources, and configuration
           - Creates initial bird(s) and ground
           - Initializes pipe system
        
        2. Game Start Screen:
           - Shows title and instructions
           - Animates bird(s) in waiting state
           - Waits for player input
        
        3. Main Gameplay Loop:
           - Handles player input
           - Updates bird physics
           - Manages pipe generation
           - Tracks scoring
           - Checks collisions
        
        4. Game Over:
           - Shows final score
           - Handles restart/quit options
        
        The loop continues until player quits or restarts
        """
        while True:
            # 初始化
            screen, resource_loader, cfg = self.screen, self.resource_loader, self.cfg
            # 定义游戏资源
            resource = Resource(resource_loader)
            # 游戏开始界面
            bird, bird2, grand_base = GameStartInterface(screen, resource, cfg)
            # 进入主游戏
            score = 0
            clock = pygame.time.Clock()
            # --管道类
            pipe_sprites = self.buildPipeSprites(cfg, resource)
            # --是否增加pipe
            is_add_pipe = True
            # --游戏是否进行中
            bird_dead = bird2_dead = False
            while not (bird_dead or bird2_dead):
                # --Does bird flap?
                self.handleEvent(bird, bird2)
                if bird.autoFlap:
                    bird.autoFlapWhenNeeded(pipe_sprites)
                if bird2 and bird2.autoFlap:
                    bird2.autoFlapWhenNeeded(pipe_sprites)
                # --更新小鸟y axis
                time_passed = float(clock.tick(cfg.FPS))/1000. 
                bird.update(time_passed)
                bird_dead = bird.isHittingBoundaryOrPipe(pipe_sprites)
                if bird2:
                    bird2.update(time_passed)
                    bird2_dead = bird2.isHittingBoundaryOrPipe(pipe_sprites)
                # --移动pipe to left side实现小鸟往前飞的效果
                for pipe in pipe_sprites:
                    pipe.moveLeft()
                    # --加分
                    if pipe.rect.centerx < bird.rect.centerx and not pipe.used_for_score:
                        pipe.used_for_score = True
                        score += 0.5
                        if '.5' in str(score):
                            resource.sounds['point'].play()
                    # --增加pipe
                    if pipe.rect.left < 5 and pipe.rect.left > 0 and is_add_pipe:
                        pipe_sprites = self.addOnePairPipeSprites(pipe_sprites, cfg, resource.pipe_images,
                                                                  cfg.SCREENSIZE[0]+10)
                        is_add_pipe = False
                    elif pipe.rect.right < 0:
                        pipe_sprites.remove(pipe)
                        is_add_pipe = True

                self.refreshScreen(screen, resource, pipe_sprites, grand_base, bird, score, bird2)      
                clock.tick(cfg.FPS)
            if bird_dead:
                GameEndIterface(screen, resource, self.showScore, score, bird, pipe_sprites, grand_base, cfg)
            else:
                assert bird2_dead
                GameEndIterface(screen, resource, self.showScore, score, bird2, pipe_sprites, grand_base, cfg)

    def refreshScreen(self, screen, resource, pipe_sprites, grand_base, bird, score, bird2):
        """
        Renders all game elements in the correct order.
        
        Drawing Order (back to front):
        1. Background image (sky)
        2. Pipe obstacles
        3. Scrolling ground
        4. Score display
        5. Bird sprite(s)
        
        Args:
            screen: Pygame display surface
            resource: Game resource manager
            pipe_sprites: Group of pipe obstacles
            grand_base: Ground sprite
            bird: Primary bird sprite
            score: Current game score
            bird2: Optional second bird sprite
        """
        screen.blit(resource.backgroud_image, (0, 0))  # Draw background
        pipe_sprites.draw(screen)  # Draw all pipes
        grand_base.updateAndDraw(screen)  # Update and draw scrolling ground
        self.showScore(self.cfg, screen, score, resource.number_images)  # Draw score
        bird.draw(screen)  # Draw first bird
        if bird2:
            bird2.draw(screen)  # Draw second bird if exists
        pygame.display.update()  # Refresh display

    def handleEvent(self, bird, bird2):
        """
        Processes all player input events.
        
        Controls:
        - ESC/Close Window: Quit game
        - SPACE: Flap first bird
        - RSHIFT: Flap second bird (if exists)
        - 1: Toggle AI for first bird
        - 2: Toggle AI for second bird
        
        Args:
            bird: Primary bird sprite
            bird2: Optional second bird sprite
        """
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                QuitGame()  # Exit on ESC or window close
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bird.setFlapped()  # Make first bird flap
                elif event.key == pygame.K_RSHIFT:
                    if bird2:
                        bird2.setFlapped()  # Make second bird flap
                elif event.key == pygame.K_1:
                    bird.toggleAutoFlap()  # Toggle AI for first bird
                elif event.key == pygame.K_2:
                    if bird2:
                        bird2.toggleAutoFlap()  # Toggle AI for second bird

    def buildPipeSprites(self, cfg, resource):
        # --管道类
        pipe_sprites = pygame.sprite.Group()
        for i in range(2):
            pipe_sprites = self.addOnePairPipeSprites(pipe_sprites, cfg, resource.pipe_images,
                                                      cfg.SCREENSIZE[0]+200+i*cfg.SCREENSIZE[0]/2)
        return pipe_sprites

    def addOnePairPipeSprites(self, pipe_sprites, cfg, pipe_images, x):
        pipe_pos = Pipe.randomPipe(cfg, pipe_images.get('top'))
        pipe_sprites.add(Pipe(image=pipe_images.get('top'),
                              position=(x, pipe_pos.get('top')[-1]),
                              flying_speed=cfg.FLYING_SPEED))
        pipe_sprites.add(Pipe(image=pipe_images.get('bottom'),
                              position=(x, pipe_pos.get('bottom')[-1]),
                              flying_speed=cfg.FLYING_SPEED))
        return pipe_sprites

    '''显示当前分数'''
    @staticmethod
    def showScore(cfg, screen, score, number_images):
        digits = list(str(int(score)))
        width = 0
        for d in digits:
            width += number_images.get(d).get_width()
        offset = (cfg.SCREENSIZE[0] - width) / 2
        for d in digits:
            screen.blit(number_images.get(d), (offset, cfg.SCREENSIZE[1] * 0.1))
            offset += number_images.get(d).get_width()
