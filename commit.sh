#!/bin/bash
# Run this script after committing from the `backend` directory

git push origin backend
cd ..
git add .
git commit -m 'Update backend'
git push -u origin master
cd backend
