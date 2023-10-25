#!/bin/bash

virtualenv venv 
source venv/bin/activate 
pip install -r requirements.txt
deactivate
cd django_project/react_app/
npm install
npm run build