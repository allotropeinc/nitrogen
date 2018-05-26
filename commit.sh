#!/bin/bash
# Run this script after committing to backend, but BEFORE committing to master

git push origin backend
cd ..
git add .
echo 'Enter your commit message (for master):'
read -e -i "Update backend" commitmsg
git commit -m "$commitmsg"
git push -u origin master
cd backend
