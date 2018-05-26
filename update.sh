#!/bin/bash

cd ..
git pull origin master
bash build.sh
cd backend
git pull origin backend
