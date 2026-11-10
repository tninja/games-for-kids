"""Paged task selection for Continuous Play, using the existing painter."""

import pygame

from .drawing import Button, GREEN, GOLD, MUTED, Painter
from .play_content import FAMILIES


class PlayBrowser:
    def __init__(self) -> None:
        self.page = 0

    @property
    def visible(self) -> tuple[int, ...]:
        return tuple(range(9))[self.page*6:(self.page+1)*6]

    def change_page(self, delta: int) -> None:
        self.page = max(0,min(1,self.page+delta))

    def number_action(self, number: int) -> str | None:
        return f"play_family:{self.visible[number]}" if 0 <= number < len(self.visible) else None

    def buttons(self) -> list[Button]:
        titles = ("Mixed round / four different tasks",*FAMILIES)
        rows = [Button(pygame.Rect(814,314+i*62,410,54),titles[f],f"play_family:{f}",str(i+1))
                for i,f in enumerate(self.visible)]
        return rows + [Button(pygame.Rect(814,700,195,48),"Previous / Left","play_prev"),
                       Button(pygame.Rect(1024,700,200,48),"Next / Right","play_next"),
                       Button(pygame.Rect(814,758,410,48),"Main menu / Esc","menu")]

    def draw(self, painter: Painter) -> None:
        painter.text("Continuous Play",pygame.Rect(814,162,410,50),37,GREEN)
        painter.text(f"8 tasks / 24 openings / page {self.page+1} of 2\nEach play has 2-3 linked decisions.",
                     pygame.Rect(814,224,410,90),24,MUTED)
        painter.text("PLAY\nLOOK AGAIN\nADAPT",pygame.Rect(100,320,630,280),64,GREEN)
        painter.text("Pass, support, recover: your choice changes what comes next.\nRetry is practice; first-run scores stay saved.",
                     pygame.Rect(78,660,630,90),23,GOLD)
