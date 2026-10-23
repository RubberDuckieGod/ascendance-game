"""New reproducible stability gate, not the unavailable historical runner."""
import os
import shutil
import subprocess
import sys

environ = dict(os.environ)
if not environ.get('CHROMIUM_PATH') and shutil.which('chromium'):
    environ['CHROMIUM_PATH'] = shutil.which('chromium')
result = subprocess.run(['npm', 'run', 'audit:mechanics'], env=environ, check=False)
sys.exit(result.returncode)
