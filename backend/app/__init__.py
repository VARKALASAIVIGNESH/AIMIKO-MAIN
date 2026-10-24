"""AIMIKO backend package."""

import os
import site
import sys

user_site = site.getusersitepackages()
if os.path.exists(user_site) and user_site not in sys.path:
    sys.path.insert(0, user_site)

__version__ = "0.1.0"

