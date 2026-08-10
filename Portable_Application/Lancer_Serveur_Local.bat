@echo off
title Note de Frais - Serveur Local Portable
echo ===================================================
echo   Lancement du serveur local HTTP...
echo ===================================================
echo.

:: Tester si Python 3 est disponible
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python detecte. Démarrage du serveur sur http://localhost:8080 ...
    start "" http://localhost:8080
    python -m http.server 8080
    goto end
)

:: Tester si Python 2 est disponible
python2 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python detecte. Démarrage du serveur sur http://localhost:8080 ...
    start "" http://localhost:8080
    python2 -m http.server 8080
    goto end
)

:: Si aucun Python n'est présent, ouvrir index.html directement
echo Ouverture directe du fichier HTML dans le navigateur...
start "" "%~dp0index.html"

:end
