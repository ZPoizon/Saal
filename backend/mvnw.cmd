@echo off
setlocal
set "MAVEN_BIN=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.11\bin\mvn.cmd"
if not exist "%MAVEN_BIN%" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0.mvn\wrapper\bootstrap.ps1"
  if errorlevel 1 exit /b 1
)
call "%MAVEN_BIN%" %*
exit /b %ERRORLEVEL%
