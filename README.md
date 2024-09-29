# Intro

The fact it's for a dissertation

# Requirements:

* Python 3.12.4
* Node 20.14.0
* InfluxDB 2.7.6

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

* press r + enter to restart the server
* press u + enter to show server url
* press o + enter to open in browser
* press c + enter to clear console
* press q + enter to quit

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

# Storage

## InfluxDB

For storing timeseries data we've chosen InfluxDB. To get this running locally:

MacOS:
```bash
brew install influxdb
brew install influxdb-cli
```
Windows:
Download the Zip File from: Influx [Official Website](https://docs.influxdata.com/influxdb/v2/install/?t=Windows)
```powershell
Expand-Archive 'D:\Downloads\influxdb2-2.7.10-windows.zip' -DestinationPath 'C:\Program Files\InfluxData\'
```

Then you simply need to run:

MacOS/Linux:
```bash
influxd
```
Windows:
```powershell
cd -Path 'C:\Program Files\InfluxData'
./influxd
```

which will start a local instance of the database on localhost:8086

There is an interactive UI that you can visit at that address or you can use influxdb-cli to interact with the DB

## SQL

While we use InfluxDB for storing timeseries data there are datasets that are not good fits for this style of temporal data.

We will still have a relational database which we use for metadata and various other uses.

For now this is SQLite which can be setup using the Automated Scripts below however we may move this to PostrgresSQL in the future.

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
