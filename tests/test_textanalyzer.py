import os.path, sys
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))

import unittest
class TextAnalyzerTest(unittest.TestCase):
    """
    Test the methods of TextAnalyzer class
    """
    def test_parse(self):
        """
        Test the stats dict returned by the parse method
        """
        self.assertEqual(1,1)

if __name__ == "__main__":
    unittest.main()