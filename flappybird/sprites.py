'''
Flappy Bird Game Sprites Module

This module implements the core game mechanics through three main sprite classes:

1. Bird (Player Character):
   - Handles player input and physics
   - Manages animations and sound effects
   - Implements collision detection
   - Features both manual and AI control modes

2. Pipe (Obstacles):
   - Generates pairs of pipes with random gaps
   - Moves left at constant speed
   - Handles collision detection with bird
   - Manages scoring when bird passes through

3. GrandBase (Ground):
   - Creates scrolling ground effect
   - Provides lower boundary for gameplay
   - Synchronizes with game speed

Technical Implementation:
- Uses Pygame's sprite system for rendering
- Implements pixel-perfect collision detection
- Features smooth physics-based movement
- Includes sound effect integration

Author:
    Charles
WeChat Official Account:
    Charles的皮卡丘
'''
import pygame
import itertools
import math
import random


'''
Bird Class
The main player character that the user controls.

Key Features:
1. Physics System:
   - Gravity (constant downward acceleration)
   - Flapping (instant upward velocity)
   - Terminal velocity limits
   - Ground collision detection

2. Animation System:
   - Multiple wing positions
   - Smooth animation transitions
   - Visual feedback for actions

3. Control Systems:
   - Manual control via player input
   - AI control for automatic play
   - Start screen animation mode

4. Sound System:
   - Wing flap effects
   - Collision sounds
   - Score sounds
'''
class Bird(pygame.sprite.Sprite):

    def __init__(self, images, sounds, screen_width, screen_height, base_height,
                 dropping_speed, flapping_speed, x=0.2, **kwargs):
        pygame.sprite.Sprite.__init__(self)
        self.images_list = list(images.values())
        self.sounds = sounds
        self.bird_idx = random.randint(0, len(self.images_list) - 1)
        self.image = self.images_list[self.bird_idx]
        self.rect = self.image.get_rect()
        self.mask = pygame.mask.from_surface(self.image)
        self.rect.left = screen_width * x
        self.rect.top = (screen_height-list(self.images_list)[0].get_height())/2
        self.base_height = base_height
        self.dropping_speed = dropping_speed
        self.flapping_speed = flapping_speed
        # game start interface variables
        self.bird_y_shift_count = 0
        self.shift = 1
        # 竖直方向运动所需变量
        self.speed = 0
        # 切换bird形态
        self.bird_idx_cycle = itertools.cycle([0, 1, 2, 1])
        self.bird_idx_change_count = 0
        # auto flap?
        self.autoFlap = False

    def flyInStartInterface(self):
        """
        Handles bird animation on the start screen.
        
        This method:
        1. Animates wing flapping
        2. Plays wing sound effect
        3. Makes bird bob up and down smoothly:
           - Moves up/down for 16 frames
           - Then reverses direction
           - Creates a smooth oscillating motion
        
        Called continuously while on start screen.
        """
        self.flipWingImage()
        self.sounds['wing'].play()
        self.bird_y_shift_count += 1
        if self.bird_y_shift_count == 16:
            self.shift = -1 * self.shift
            self.bird_y_shift_count = 0
        self.rect.top = self.rect.top + self.shift

    def update(self, time_passed):
        """
        Updates bird's position and state each frame.
        
        Physics Simulation:
        1. Updates wing animation
        2. Applies gravity (dropping_speed * time_passed)
        3. Updates vertical position based on speed
        4. Handles ground collision:
           - Stops at ground if would go below
           - Adjusts position to exactly touch ground
        
        Args:
            time_passed: Time since last update (for physics calculations)
        """
        self.flipWingImage()
        # 竖直方向的位置更新
        self.speed -= self.dropping_speed * time_passed
        if self.rect.bottom - self.speed < self.base_height: # above the ground?
            self.rect.top -= self.speed
            self.rect.bottom -= self.speed
        else:
            delta = self.base_height - self.rect.bottom
            self.rect.top -= delta
            self.rect.bottom = self.base_height

    def isHittingBoundary(self, ceiling, floor):
        """
        Checks if bird has hit the screen boundaries.
        
        Boundary Collision Logic:
        1. Floor collision:
           - Checks if bird's bottom edge hits or goes below floor
           - Stops vertical movement
           - Positions bird exactly at floor level
        
        2. Ceiling collision:
           - Checks if bird's top edge hits or goes above ceiling
           - Stops vertical movement
           - Positions bird exactly at ceiling level
        
        Args:
            ceiling: Upper boundary y-coordinate (usually 0)
            floor: Lower boundary y-coordinate (ground level)
        
        Returns:
            bool: True if hitting either boundary, False otherwise
        """
        if self.rect.bottom >= math.floor(floor):  # Check floor collision
            self.speed = 0  # Stop vertical movement
            self.rect.bottom = floor  # Place at exact floor height
            return True
        elif self.rect.top <= math.ceil(ceiling):  # Check ceiling collision
            self.speed = 0  # Stop vertical movement
            self.rect.top = ceiling  # Place at exact ceiling height
            return True
        return False

    def isHittingBoundaryOrPipe(self, pipe_sprites):
        """
        Comprehensive collision detection system.
        
        Checks for collisions with:
        1. Screen boundaries (ceiling and floor)
        2. All pipe obstacles
        
        Collision Detection:
        - Uses pixel-perfect collision masks for pipes
        - Boundary checking for screen edges
        - Plays hit sound effect on any collision
        
        Args:
            pipe_sprites: List of pipe obstacles to check against
        
        Returns:
            bool: True if collision detected, False if safe
        """
        is_dead = False
        # Check screen boundary collisions
        if self.isHittingBoundary(0, self.base_height):
            is_dead = True
        
        # Check pipe collisions using pixel-perfect detection
        for pipe in pipe_sprites:
            if pygame.sprite.collide_mask(self, pipe):
                is_dead = True
        
        # Play sound effect if collision occurred
        if is_dead:
            self.sounds['hit'].play()
        
        return is_dead

    def flipWingImage(self):
        # 切换bird形态模拟以模拟扇翅膀效果
        self.bird_idx_change_count += 1
        if self.bird_idx_change_count == 5:
            self.bird_idx = next(self.bird_idx_cycle)
            self.image = self.images_list[self.bird_idx]
            self.bird_idx_change_count = 0
        
    '''设置为飞行模式'''
    def setFlapped(self):
        self.speed = self.flapping_speed
        self.sounds['wing'].play()

    def toggleAutoFlap(self):
        self.autoFlap = not self.autoFlap
        self.sounds['wing'].play()

    def autoFlapWhenNeeded(self, pipe_sprites):
        """
        AI control system for automatic obstacle avoidance.
        
        Decision Making Process:
        1. Ground Avoidance:
           - Flaps when within 10 pixels of ground
        
        2. Pipe Avoidance:
           - Identifies nearest pipe ahead
           - Calculates safe passage height
           - Triggers flap when too low for safe passage
        
        Algorithm:
        1. Find closest pipe ahead of bird
        2. Calculate optimal flight path
        3. Flap if needed to maintain safe height
        
        Args:
            pipe_sprites: List of all pipe obstacles
        """
        if not self.autoFlap:  # Skip if AI control is disabled
            return
        
        # Emergency ground avoidance
        if self.rect.bottom > self.base_height - 10:
            self.setFlapped()
        
        # Find nearest pipe ahead of bird
        min_left = 1000  # Initialize with large value
        max_bottom = 0
        leftbottom_pipe = None
        
        # Scan all pipes to find the nearest one
        for pipe in pipe_sprites:
            if pipe.rect.right < min_left and pipe.rect.right > self.rect.left:
                min_left = pipe.rect.right
                max_bottom = pipe.rect.bottom                 
                leftbottom_pipe = pipe
            elif pipe.rect.right == min_left and pipe.rect.bottom > max_bottom:
                max_bottom = pipe.rect.bottom
                leftbottom_pipe = pipe
        
        # Adjust height for safe passage
        if leftbottom_pipe:
            print(self.rect.bottom, leftbottom_pipe.rect.top)  # Debug info
            if self.rect.bottom > leftbottom_pipe.rect.top - 8:  # Safe margin of 8 pixels
                self.setFlapped()

    '''绑定到屏幕'''
    def draw(self, screen):
        screen.blit(self.image, self.rect)


'''
Pipe Class
The obstacle system that the bird must navigate through.

Key Features:
1. Obstacle Generation:
   - Creates pairs of pipes (top and bottom)
   - Randomizes gap positions
   - Maintains minimum passable space

2. Movement System:
   - Constant leftward movement
   - Synchronized with ground scroll speed
   - Removes pipes when off-screen

3. Scoring System:
   - Tracks when bird passes through
   - Prevents double-counting scores
   - Triggers score sound effects

4. Collision System:
   - Pixel-perfect collision detection
   - Separate hit boxes for top and bottom pipes
   - Triggers game over on contact
'''
class Pipe(pygame.sprite.Sprite):

    def __init__(self, image, position, flying_speed, **kwargs):
        """
        Initialize a pipe obstacle.
        
        Args:
            image: Surface for pipe appearance
            position: (x, y) starting coordinates
            flying_speed: Horizontal movement speed
            **kwargs: Additional configuration options
        
        Components:
        1. Visual Setup:
           - Loads pipe image
           - Creates rectangle for positioning
           - Generates collision mask
        
        2. Position System:
           - Sets initial position
           - Configures movement speed
        
        3. Scoring Setup:
           - Initializes score tracking flag
        """
        pygame.sprite.Sprite.__init__(self)  # Initialize sprite functionality
        self.image = image  # Store pipe appearance
        self.rect = self.image.get_rect()  # Get image boundaries
        self.mask = pygame.mask.from_surface(self.image)  # Create precise collision mask
        self.rect.left, self.rect.top = position  # Set initial position
        self.flying_speed = flying_speed  # Set movement speed
        self.used_for_score = False  # Track if bird has scored on this pipe

    def moveLeft(self):
        """
        Updates pipe position for leftward movement.
        
        Movement System:
        - Decrements x-coordinate by flying_speed
        - Creates illusion of bird moving right
        - Synchronized with ground scroll speed
        """
        self.rect.left -= self.flying_speed  # Move pipe left by speed amount

    @staticmethod
    def randomPipe(cfg, image):
        """
        Generates random positions for a pair of pipes.
        
        Positioning Algorithm:
        1. Calculate base height (79% of screen height)
        2. Generate random gap position:
           - Minimum: 20% of base height
           - Maximum: 80% of base height minus gap size
        3. Calculate exact positions for both pipes
        
        Args:
            cfg: Game configuration object
            image: Pipe image for height calculations
        
        Returns:
            dict: Coordinates for top and bottom pipes
            
        Note: Ensures gap is always passable by the bird
        """
        base_y = 0.79 * cfg.SCREENSIZE[1]  # Set base height at 79% of screen
        up_y = int(base_y * 0.2) + random.randrange(0, int(base_y * 0.6 - cfg.PIPE_GAP_SIZE))  # Random gap position
        return {
            'top': (cfg.SCREENSIZE[0]+10, up_y-image.get_height()),  # Position top pipe
            'bottom': (cfg.SCREENSIZE[0]+10, up_y+cfg.PIPE_GAP_SIZE)  # Position bottom pipe
        }


class GrandBase(pygame.sprite.Sprite):
    def __init__(self, image, position, background_image_width, flying_speed, **kwargs):
        pygame.sprite.Sprite.__init__(self)
        self.image = image
        self.rect = self.image.get_rect()
        self.rect.left, self.rect.top = position
        self.base_diff_bg = image.get_width() - background_image_width
        self.flying_speed = flying_speed

    def updateAndDraw(self, screen):
        # --移动base实现小鸟往前飞的效果
        self.rect.left = -((-self.rect.left + self.flying_speed) % self.base_diff_bg)
        self.draw(screen)

    def draw(self, screen):
        screen.blit(self.image, self.rect)
