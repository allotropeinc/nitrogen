#!/bin/bash
# Run this script after committing here.

cd ..
git add .
git commit -m 'Update backend'
git push -u origin master
cd backend
