#!/bin/bash

cd c:/tangj15/code
pwd

find . -maxdepth 2 -iname "syncing.sh" -exec chmod +x {} \; -exec {} 'auto'  \;
