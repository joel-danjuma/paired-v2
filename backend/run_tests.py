#!/usr/bin/env python3
"""
Test runner for Paired Backend API
"""
import subprocess
import sys

def run_tests():
    """Run the test suite."""
    print("Running Paired Backend Test Suite...")
    print("=" * 50)
    
    try:
        # Run pytest with coverage
        result = subprocess.run([
            "python", "-m", "pytest", 
            "tests/", 
            "-v", 
            "--tb=short"
        ], check=True)
        
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
        return True
        
    except subprocess.CalledProcessError as e:
        print("\n" + "=" * 50)
        print("❌ Some tests failed!")
        print(f"Exit code: {e.returncode}")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1) 