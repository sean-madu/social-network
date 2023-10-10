#!/bin/bash

pip install -r requirements.txt
cd django_project/react_app/
npm install
npm run build