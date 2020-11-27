@echo off
@title Setting your dev environment
	 
cd /d "%cd%"
set nodejspath=C:\TANGJ15\Software\node-v13.12.0-win-x64
set rubypath=C:\Ruby27-x64\bin
SET DOTNET_ROOT=C:/TANGJ15/dotnet-sdk-3.1.403-win-x64

SET DOTNET_MULTILEVEL_LOOKUP=0

set "path=%path%;C:\Users\tangj15\AppData\Local\atom\bin;C:\Users\tangj15\AppData\Local\atom\;%nodejspath%;%nodejspath%\node_modules\;%nodejspath%\node_global;%rubypath%;%DOTNET_ROOT%;"

if exist "%nodejspath%" ( 
    set "cmdstr=%nodejspath%/nodevars.bat & %cmdstr%"
) else (
	color FC
    echo Warnning! YOUR ENVIRONMENT HAS NOT BEEN SET UP FOR USING NODEJS.

)

if exist "%rubypath%" (    
    set "cmdstr=%rubypath%/setrbvars.cmd & %cmdstr%"
    echo Your environment has been set up for using ruby.
)else ( 
	color FC
    echo Warnning! YOUR ENVIRONMENT HAS NOT BEEN SET UP FOR USING RUBY.
	
)

if exist "%DOTNET_ROOT%" (    
    echo Your environment has been set up for using dotnet.
)else ( 
	color FC
    echo Warnning! YOUR ENVIRONMENT HAS NOT BEEN SET UP FOR USING DOTNET.
	
)


 cmd /k "%cmdstr%"
::pause