@echo off
cd /d "C:/TANGJ15/code/"
set nodejspath=C:\TANGJ15\Software\node-v13.12.0-win-x64

set "path=%path%;C:\Users\tangj15\AppData\Local\atom\bin;C:\Users\tangj15\AppData\Local\atom\;%nodejspath%\node_modules\;%nodejspath%\node_global;"

echo Your environment has been set up for using atom and apm.

cmd /k "%nodejspath%/nodevars.bat"