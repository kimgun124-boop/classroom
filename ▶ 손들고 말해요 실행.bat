@echo off
rem ============================================================
rem  Hand-raise board launcher (USB / desktop)
rem  Opens index.html in a clean app window (Edge or Chrome).
rem  If neither is found, opens it in the default browser.
rem ============================================================
setlocal
cd /d "%~dp0"
set "HERE=%~dp0"
set "PAGE=%~dp0index.html"

rem --- run straight from inside a zip? (Windows copies only this file to a Temp folder)
if exist "%PAGE%" goto found
echo "%HERE%" | find /i "\Temp\" >nul
if not errorlevel 1 goto inzip
goto nofile

:found
set "URL=file:///%PAGE:\=/%"

rem --- Microsoft Edge
set "B=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%B%" goto app
set "B=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%B%" goto app
set "B=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
if exist "%B%" goto app
rem --- Google Chrome
set "B=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%B%" goto app
set "B=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%B%" goto app
set "B=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if exist "%B%" goto app
rem --- Naver Whale
set "B=%ProgramFiles%\Naver\Naver Whale\Application\whale.exe"
if exist "%B%" goto app
set "B=%LocalAppData%\Naver\Naver Whale\Application\whale.exe"
if exist "%B%" goto app

rem --- nothing found: default browser
start "" "%PAGE%"
goto end

:app
start "" "%B%" --app="%URL%" --start-maximized
goto end

:inzip
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName PresentationFramework; [void][System.Windows.MessageBox]::Show([regex]::Unescape('\uC555\uCD95\uC744 \uBA3C\uC800 \uD480\uC5B4 \uC8FC\uC138\uC694!\n\nzip \uD30C\uC77C\uC744 \uC624\uB978\uCABD \uD074\uB9AD \u2192 [\uC555\uCD95 \uD480\uAE30] \uB610\uB294 [\uBAA8\uB450 \uC555\uCD95 \uD480\uAE30] \uB97C \uD55C \uB2E4\uC74C,\n\uD480\uB9B0 \uD3F4\uB354 \uC548\uC758 \u300C\u25B6 \uC190\uB4E4\uACE0 \uB9D0\uD574\uC694 \uC2E4\uD589\u300D\uC744 \uB20C\uB7EC \uC8FC\uC138\uC694.'), [regex]::Unescape('\uC190\uB4E4\uACE0 \uB9D0\uD574\uC694'), 'OK', 'Warning')"
goto end

:nofile
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName PresentationFramework; [void][System.Windows.MessageBox]::Show([regex]::Unescape('index.html \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.\n\n\uD3F4\uB354 \uC548\uC758 \uD30C\uC77C(index.html, fonts \uD3F4\uB354)\uC744 \uC9C0\uC6B0\uAC70\uB098 \uC62E\uAE30\uC9C0 \uB9D0\uACE0\n\uD3F4\uB354\uB97C \uD1B5\uC9F8\uB85C \uBCF5\uC0AC\uD574 \uC8FC\uC138\uC694.'), [regex]::Unescape('\uC190\uB4E4\uACE0 \uB9D0\uD574\uC694'), 'OK', 'Error')"
goto end

:end
endlocal
