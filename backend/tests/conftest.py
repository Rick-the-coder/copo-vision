import os
import pytest

# Ensure a valid test SECRET_KEY is present in environment for test execution
os.environ.setdefault("SECRET_KEY", "copovision-test-suite-secret-key-32-chars")
