@echo off
setlocal enabledelayedexpansion

set counter=1

for %%f in (*_0000.png) do (
    ren "%%f" "bg!counter!.png"
    set /a counter+=1
)

echo File renamed successfully.
pause