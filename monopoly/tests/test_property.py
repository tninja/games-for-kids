import unittest
from core.property import Property, PropertyGroup


class TestProperty(unittest.TestCase):
    
    def setUp(self):
        self.property = Property(
            "Park Place", 
            PropertyGroup.DARK_BLUE, 
            350, 
            [35, 175, 500, 1100, 1300, 1500], 
            200
        )
        
    def test_initial_state(self):
        self.assertEqual(self.property.name, "Park Place")
        self.assertEqual(self.property.group, PropertyGroup.DARK_BLUE)
        self.assertEqual(self.property.price, 350)
        self.assertEqual(self.property.rent, [35, 175, 500, 1100, 1300, 1500])
        self.assertEqual(self.property.house_cost, 200)
        self.assertEqual(self.property.mortgage_value, 175)
        self.assertIsNone(self.property.owner)
        self.assertEqual(self.property.houses, 0)
        self.assertFalse(self.property.is_mortgaged)
        
    def test_get_rent_no_owner(self):
        rent = self.property.get_rent()
        self.assertEqual(rent, 0)
        
    def test_get_rent_mortgaged(self):
        self.property.owner = "Alice"
        self.property.is_mortgaged = True
        rent = self.property.get_rent()
        self.assertEqual(rent, 0)
        
    def test_mortgage_property(self):
        self.property.owner = "Alice"
        value = self.property.mortgage()
        self.assertEqual(value, 175)
        self.assertTrue(self.property.is_mortgaged)
        
    def test_unmortgage_property(self):
        self.property.owner = "Alice"
        self.property.mortgage()
        cost = self.property.unmortgage()
        self.assertEqual(cost, 192)  # 175 * 1.1 = 192.5, truncated to 192
        self.assertFalse(self.property.is_mortgaged)
        
    def test_can_build_house_no_monopoly(self):
        self.property.owner = "Alice"
        all_properties = {"Park Place": self.property}
        self.assertFalse(self.property.can_build_house(all_properties))


class TestRailroadProperty(unittest.TestCase):
    
    def setUp(self):
        self.railroad = Property("Reading Railroad", PropertyGroup.RAILROAD, 200, [25, 50, 100, 200])
        
    def test_railroad_rent(self):
        self.railroad.owner = "Alice"
        all_properties = {"Reading Railroad": self.railroad}
        rent = self.railroad.get_rent(0, all_properties)
        self.assertEqual(rent, 25)
        
    def test_cannot_build_houses(self):
        self.railroad.owner = "Alice"
        all_properties = {"Reading Railroad": self.railroad}
        self.assertFalse(self.railroad.can_build_house(all_properties))


class TestUtilityProperty(unittest.TestCase):
    
    def setUp(self):
        self.utility = Property("Electric Company", PropertyGroup.UTILITY, 150, [4, 10])
        
    def test_utility_rent(self):
        self.utility.owner = "Alice"
        all_properties = {"Electric Company": self.utility}
        rent = self.utility.get_rent(6, all_properties)
        self.assertEqual(rent, 24)
        
    def test_cannot_build_houses(self):
        self.utility.owner = "Alice"
        all_properties = {"Electric Company": self.utility}
        self.assertFalse(self.utility.can_build_house(all_properties))


if __name__ == '__main__':
    unittest.main()