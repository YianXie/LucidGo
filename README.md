# LucidGo (WIP)

LucidGo allows you to use visually see the analysis for each move

## Introduction

Go (Weiqi) is often referred as abstract and difficult to understand. However, with the advancement of AI (Artificial Intelligence) technology, such as [KataGo](https://github.com/lightvector/KataGo), it has became a lot easier to study and play.

Most people enjoy the assistance from AI, but have no idea how it works, and what factors affect its performance. LucidGo allows you to visually see AI, such as Katago, make its decisions in real time, and is highly customizable to fit your need.

## Installation

### MacOS and Linux

By installing this repo on your machine, you will be able to run the website locally and analyze your move.

Before installing, make sure you already have [node.js](https://nodejs.org/en/download) and [Python](https://www.python.org/downloads/) installed on your machine.

To check if you have Python and node.js installed, run the following command in your terminal:

```bash
# print out your node.js and npm version, if you are missing any one of them, you need to install node.js
node -v && npm -v

# print out your Python and pip version, if you are missing any one of them, you need to install Python or pip
python --version && pip --version
```

After you ensured you installed Python and node.js, run:

```bash
# clone this repo
git clone https://github.com/YianXie/LucidGo

# change your directory to the repo
cd LucidGo

# create a Python virtual environment
python -m venv env

# activate the virtual environment
source env/bin/activate

# (optional) to deactivate after you are done developing
deactivate

# install the required Python libraries
cd backend && pip install -r requirements.txt

# install the required npm packages
cd ../frontend && npm install
```

To start the website:

```bash
# Start the backend server
cd backend
python manage.py runserver

# Start the frontend server
cd ../frontend
npm run dev
```

## AWS Setup

### EC2 Instance Setup

Since LucidGo uses KataGo as its Go engine, you can use an AWS server in order to run LucidGo's analysis more efficiently. To set it up, first create an EC2 Instance on AWS, and choose Linux-based system (such as Ubuntu) with Nvidia-Driver pre-installed.

**DO NOT GO FOR NEURAL NETWORK INSTANCES**

_Recommended instance: Deep Learning Base OSS Nvidia Driver GPU AMI (Ubuntu 24.04)_

Choose a reasonably good set up (e.g. g4dn.xlarge), and then start your server.

> If you encountered any quota issue, you may need to request for a quota increase

Then, copy your instance's **public IPv4 address** (e.g. 12.345.678.999), and paste it in the `.env` file in your `backend` directory.

### Instal KataGo on your EC2 instance

WIP

## License

This project is licensed under the MIT License. Check the LICENSE tab for more details.
