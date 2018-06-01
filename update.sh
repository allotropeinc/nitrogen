#!/bin/bash

cd ..
git reset --hard
git pull origin master
npm i
bash build.sh
cd backend
git reset --hard
git pull origin backend
npm i
