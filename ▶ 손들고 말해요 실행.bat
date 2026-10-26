@echo off
rem ============================================================
rem  Hand-raise board launcher (USB / desktop)
rem  Opens index.html in a clean app window (Edge or Chrome).
rem  If neither is found, opens it in the default browser.
rem ============================================================
setlocal
cd /d "%~dp0"
set "PAGE=%~dp0index.html"
if not exist "%PAGE%" goto nofile
set "URL=file:///%PAGE:\=/%"

reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" >nul 2>&1
if not errorlevel 1 goto edge
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" >nul 2>&1
if not errorlevel 1 goto edge
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if not errorlevel 1 goto chrome
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if not errorlevel 1 goto chrome
start "" "%PAGE%"
goto end

:edge
start "" msedge --app="%URL%" --start-maximized
goto end

:chrome
start "" chrome --app="%URL%" --start-maximized
goto end

:nofile
echo.
echo  [!] index.html not found. Please keep all files in the same folder.
echo.
pause

:end
endlocal
