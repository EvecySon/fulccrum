@echo off
REM Quick Test Script for Windows - Run this before production
REM Tests all critical features in 5 minutes

echo Starting Quick Pre-Production Tests...
echo.

set BASE_URL=http://localhost:3001
set PASSED=0
set FAILED=0

echo === 1. Health Checks ===
call :test_endpoint "Basic Health" "%BASE_URL%/health"
call :test_endpoint "Database Health" "%BASE_URL%/health/database"
call :test_endpoint "Cache Health" "%BASE_URL%/health/cache"
call :test_endpoint "Queue Health" "%BASE_URL%/health/queue"
call :test_endpoint "All Health Checks" "%BASE_URL%/health/all"
echo.

echo === 2. Performance Tests ===
echo Testing health endpoint speed...
curl -s -o nul -w "Response time: %%{time_total}s\n" %BASE_URL%/health
echo.

echo === 3. Queue Status ===
curl -s %BASE_URL%/health/queue
echo.
echo.

echo === 4. Cache Status ===
curl -s %BASE_URL%/health/cache
echo.
echo.

echo === Test Summary ===
echo Passed: %PASSED%
echo Failed: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo All tests passed! Ready for production.
    exit /b 0
) else (
    echo Some tests failed. Review before deploying.
    exit /b 1
)

:test_endpoint
set name=%~1
set url=%~2
echo Testing %name%...
curl -s -o nul -w "Status: %%{http_code}\n" %url%
goto :eof
