#!/bin/bash
# Run this script after committing to backend, but BEFORE committing to master

git push origin backend
cd ..
git add .
DEFAULTCOMMITMSG="Update backend"
read -e -p "Enter your commit message (leave blank for '$DEFAULTCOMMITMSG'): " COMMITMSG
git commit -m "${COMMITMSG:-$DEFAULTCOMMITMSG}"
git push -u origin master
cd backend
