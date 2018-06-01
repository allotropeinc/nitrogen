#!/bin/bash

cd ..
git pull origin master
npm i
bash build.sh
cd backend
git pull origin backend
npm i
