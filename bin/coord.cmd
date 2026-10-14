@echo off
rem Windows has no shebang: PATHEXT finds this, and it hands the real script to node.
node "%~dp0coord" %*
