@echo off
setlocal
rem Legal Dream Team one click launcher.
rem Double click this file to start the local dev server (if not already
rem running) and open the app in your default browser. Pin it to the
rem taskbar or send a shortcut to the desktop for one click access.

set "SCRIPT=%~dp0launch-webapp.ps1"

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT%"
endlocal
