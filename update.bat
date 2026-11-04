@echo off
cd /d "%~dp0"

git pull --ff-only

if errorlevel 1 (
	echo Update failed.
) else (
	echo Update completed.
)

echo Press any key to continue…
TIMEOUT /T 15 >nul