class Fleet:
    def __init__(self, x, y, size, direction, name):
        self.coordinates = []
        self.name = name
        self.size = size
        self.direction = direction
        self.hits = []

        if direction == 'vertical':
            for i in range(size):
                self.coordinates.append((x + i, y))
        elif direction == 'horizontal':
            for i in range(size):
                self.coordinates.append((x, y + i))

    def has_coord(self, x, y):
        return (x, y) in self.coordinates

    def has_hit(self, x, y):
        return (x, y) in self.hits

    def hit(self, x, y):
        if (x, y) in self.coordinates and (x, y) not in self.hits:
            self.hits.append((x, y))
            return True
        return False

    def is_sunk(self):
        return len(self.hits) == self.size

    def show(self):
        print(f"Name: {self.name}")
        print(f"Size: {self.size}")
        print("Coordinates:")
        for coord in self.coordinates:
            status = "Hit" if coord in self.hits else "Not Hit"
            print(f"  {coord}: {status}")


class FleetGroup:
    def __init__(self):
        self.fleets = []

    def add(self, fleet):
        self.fleets.append(fleet)

    def remove(self, name):
        self.fleets = [f for f in self.fleets if f.name != name]

    def find_by_name(self, name):
        for fleet in self.fleets:
            if fleet.name == name:
                return fleet
        return None

    def find_at(self, x, y):
        for fleet in self.fleets:
            if fleet.has_coord(x, y):
                return fleet
        return None

    def is_valid_placement(self, x, y, size, direction, board_size, ignore_name=None):
        rows, cols = board_size if isinstance(board_size, tuple) else (board_size, board_size)
        for i in range(size):
            r = x + i if direction == 'vertical' else x
            c = y + i if direction == 'horizontal' else y
            if r < 0 or r >= rows or c < 0 or c >= cols:
                return False
            for fleet in self.fleets:
                if ignore_name is not None and fleet.name == ignore_name:
                    continue
                if fleet.has_coord(r, c):
                    return False
        return True

    def replace_or_add(self, fleet):
        for idx, existing in enumerate(self.fleets):
            if existing.name == fleet.name:
                self.fleets[idx] = fleet
                return
        self.fleets.append(fleet)

    def hit(self, x, y):
        for fleet in self.fleets:
            if fleet.hit(x, y):
                return fleet.name
        return None

    def remaining_count(self):
        return sum(1 for fleet in self.fleets if not fleet.is_sunk())

    def min_unsunk_size(self):
        sizes = [fleet.size for fleet in self.fleets if not fleet.is_sunk()]
        return min(sizes) if sizes else 0

    def all_sunk(self):
        return len(self.fleets) > 0 and all(fleet.is_sunk() for fleet in self.fleets)

    def show(self):
        for fleet in self.fleets:
            fleet.show()
            print()
