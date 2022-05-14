# tutorial-workspace

[tutorial-workspace](https://github.com/PrivateSky/tutorial-workspace) is a basic workspace based on [template-workplace](https://github.com/PrivateSky/template-workspace) and contains the following applications:
* a simple **TODO** application - A simple todo application. Included from [ssapp-minimal-app](https://github.com/PrivateSky/ssapp-minimal-app)
* a simple **"Hello World! DSU"** - a small tutorial aiming to show how you can use DSU to save and load data.



**Notes**:
* A _workspace_ is a project with many other libraries and configuration loaded.
* We will use _${workSpaceRoot}_ for the workspace folder
* An _included_ application means that the original code is in a separate repo but got included here (either by hard copy or brought in by git's clone commands)

## Prerequisites

You need the following software installed on your machine in order to continue the this guide

1. Install or update [Node](https://nodejs.org/en/) (including NPM) to version **14.15** .
2. Install or update [Git](https://git-scm.com/)

## Installation

The only commands you need to run in the *tutorial-workspace* workspace are:

```sh
# Step 1: Clone tutorial-workspace from GitHub
git clone https://github.com/PrivateSky/tutorial-workspace.git

# Step 2: Go inside the [tutorial-workspace] folder
cd tutorial-workspace

# Step 3: Brings all dependencies needed by a developer to have an working setup
$ npm run dev-install

# Step 4: Launch the Node js  
$ npm run server

# Step 5: Note: Run this in a separate console! Scans all applications and wallet it finds in the configuration and tries to run the build script for each one
$ npm run build-all
```

After all this steps are done, you can access the tutorial application by going to [http://localhost:8080/tutorial/loader/](http://localhost:8080/tutorial/loader/)


## Hello World! DSU Tutorial


This tutorial sub project helps you understand how you can work directly with DSUs.

The code for this tutorial is in [helloworld-dsu] folder. It consist of only one file _main.js_

To **FIRST** run it simply **run the steps** found in the [Installation] section above then:


```sh
# Step 1: Go inside [helloworld-dsu]
cd helloworld-dsu

# Step 2: Run the app
node main.js
```

You should get something like:

```
....
Data written succesfully! :)
KeySSI identifier:  BBudGH6ySHG6GUHN8ogNrTWbZHtTCUHnMvP5Un8LrUFrdb2yDx3pbh85gMdLgEAoex6rX86B9dY5Fscjx77uMcfmh
Data load succesfully! :) Hello world!
....
```


## Hello World! Wallet & SSAPP Tutorial

This tutorial sub project helps you understand how you can create a simple SSAPP and a Wallet from scratch.

The code for this tutorial will end up in [helloworld-ssapp] folder.

To **FIRST** run it simply **run the steps** found in the [Installation] section above then follow these steps:

### Let's start to create our first SSApp based on a template
```sh
# 0. Verify to be in the root folder of our workspace

# 1. Clone the template repo
git clone https://github.com/PrivateSky/ssapp-template.git helloworld-ssapp

# 2. Go inside it, remove .git folder and bring dependencies and exit back the folder
cd helloworld-ssapp && rm -rf .git && npm install && cd ..

# 3. Bind newly helloworld-ssapp to new wallet 
npm run bind-wallet helloworld-wallet helloworld-ssapp 

# 4. Prepare a loader for our newly wallet
npm run add-loader apihub-root/helloworld-wallet/loader https://github.com/PrivateSky/trust-loader 

# 5. Configure the loader 
cp -r trust-loader-config/tutorial trust-loader-config/helloworld-wallet

# 6. Rebuild the rest of the workspace
npm run build-all

```

### Let's test our Wallet and SSApp
Open [http://localhost:8080/helloworld-wallet/loader/](http://localhost:8080/helloworld-wallet/loader/) in a
new Incognito Chrome browser (Ctr+Shift+N)

### Develop more our newly SSApp

To continue with the development of the newly created SSApp and Wallet please refer to the [PrivateSky](http://privatesky.xyz), [OpenDSU](http://opendsu.com) and [Webcardinal](https://opendsu.com/wallets/webcardinal/overview) documentation websites.
