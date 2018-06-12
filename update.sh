#!/bin/bash

set -e

cd ..
git reset --hard
git pull origin master
git reset --hard
npm i
bash build.sh
cd backend
git reset --hard
git pull origin backend
git reset --hard
npm i
