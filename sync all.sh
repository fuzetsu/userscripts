#!/bin/bash

pwd
cd c:/tangj15/code
pwd

find . -maxdepth 2 -iname "syncing.sh" -exec chmod +x {} \; -exec {} 'auto'  \;
read