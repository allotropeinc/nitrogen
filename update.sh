#!/bin/bash

set -e

git reset --hard
git pull origin backend
npm i
cd ..
git reset --hard
git pull origin master
npm i
bash build.sh
