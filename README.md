Intro About Project (and the fact it's for a dissertation)

Requirements:

Python 3.12

Node 20.14.0

Frontend:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

nvm install 20.14.0

npm upgrade -g npm

cd frontend

npm install

npm start => localhost:5173

Advantages of Vite:

Quick, easy to use

Vite shortcuts:

Shortcuts
  press r + enter to restart the server
  press u + enter to show server url
  press o + enter to open in browser
  press c + enter to clear console
  press q + enter to quit

If you have vulnerabilities:

npm audit fix (it will alert if it is adding breaking changes)

Backend:

brew install python@3.12

python -m venv venv

pip install --upgrade pip

pip install -r requirements.txt

python backend/main.py


CI

pre-commit install

now commit as usual and the checks will be run in the background
