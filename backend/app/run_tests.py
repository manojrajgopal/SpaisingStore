import unittest
import os

loader = unittest.TestLoader()
tests_dir = os.path.join(os.path.dirname(__file__), 'tests')
suite = loader.discover(start_dir=tests_dir, pattern='test_*.py')

runner = unittest.TextTestRunner(verbosity=2)
runner.run(suite)
