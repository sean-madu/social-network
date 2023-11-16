#!/bin/bash

git add *
git add react_app/build/ -f
git commit -m "Make new deployment"
git push heroku master