#!/bin/bash

git pull origin backend
cd ..
git pull origin master
bash build.sh
