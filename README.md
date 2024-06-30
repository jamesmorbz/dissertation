# Intro

The fact it's for a dissertation

# Requirements:

* Python 3.12.4
* Node 20.14.0

# **Frontend**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20.14.0
npm upgrade -g npm
cd frontend
npm install
npm start
```

## Advantages of Vite

Quick, easy to use

## Vite shortcuts

Shortcuts:
  press r + enter to restart the server
  press u + enter to show server url
  press o + enter to open in browser
  press c + enter to clear console
  press q + enter to quit

## Quality of Project

We want to avoid having vulnerabilities in the project. In order to fix this:

```
npm audit fix
```

(it will alert if it is adding breaking changes)

# Backend

```bash
brew install python@3.12
python -m venv venv
pip install --upgrade pip
pip install -r requirements.txt
cd backend
python main.py
```


# Developer Experience (CI)

```
pre-commit install
pre-commit run --all-files
```

[Pre Commit Hooks](https://pre-commit.com/#usage) will now be installed locally and will run before each commit. If there are errors with formatting you need to run your commit command twice before pushing.

You can now only commit if the tests succeed. This means that the first commit flags the error and fixes it whereas the second commit actually works and can be pushed to source control.

See more here: [Git Hooks (Git Documentation)](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

# Automated Scripts

```bash
chmod +x create_database.sh start.sh
./create_database.sh
./start.sh
```
