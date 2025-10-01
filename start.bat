@echo off
echo Starting Event Flyer Generator API...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy env.example .env
    echo Please edit .env file with your configuration before running the server.
    echo.
)

REM Build the project
echo Building TypeScript project...
npm run build
echo.

REM Start the server
echo Starting server...
npm start
