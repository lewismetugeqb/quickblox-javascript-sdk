# QuickBlox JavaScript SDK ReactJS Sample

This is a sample project and it is the React version of the [JS Chat Sample](https://github.com/QuickBlox/quickblox-javascript-sdk/tree/gh-pages/samples).
Below you will find some information on how to successfully run this sample on your local space.

## Table of Contents
- [Overview](##overview)
- [Lunch App](##lunch-app)
    1. [NodeJS and NPM](###nodejs-and-npm)
    2. [Using the CLI](###using-the-cli)
- [Development Process](#development-process.)


## Overview
This sample as said earlier is a **`ReactJS`** sample and it was designed to closely look like the [JS Chat Sample](https://github.com/QuickBlox/quickblox-javascript-sdk/tree/gh-pages/samples) as much as possible. The objective of this sample it to prove **QuickBlox JS SDK** can work perfectly with pure **`ReactJS`**, so usage of external libraries was intentionaly limited.


## Lunch App
Lunching the app is as simple as lunching any other **`npm`** app. Below are the instructions on how to do that.

1. ### NodeJS and NPM
    You should have **`NodeJS`** intalled and it comes with **`npm`**. Check out the [Recomended Versions](###recommended-versions) for this sample and also check out [NodeJS Official Page](https://nodejs.org/en/) For more information on how to install based on your OS (**Windows**, **macOS**, **Linux**).

2. ### Using the CLI
    After installing **`NodeJS/npm`** 
    1. You get to your terminal or cmd and navigate to this sample directory.
    ```sh
    $ cd quickblox-javascript-sdk/samples/reactjs_chat
    ```
    2. You need to use **`npm`** to install all the dependencies.
    ```sh
    $ npm install
    ```
    3. Now you have everything and you can start the application.
    ```sh
    $ npm start
    ```
    This will lunch the app on your browser and automatically navigate to **`http://localhost:3000`** if it does not you will have to lunch your browser and do it manually. 

These instructions were how to lunch the app and it does not explain anything about it's development. If you are very concerned on how this sample was developed you read more on [Development Process](#DevelopmentProcess.)

## Development Process.
If you are very concerned with how this sample was developed then this section is for you. Below are the tools used and respective assumptions made which were used to complete this sample.

1. ### NodeJS and NPM
    You should have **`NodeJS`** intalled and it comes with **`npm`**. Check out [NodeJS Official Page](https://nodejs.org/en/) For more information on how to install based on your OS (**Windows**, **macOS**, **Linux**). 
    #### Recommended Versions
    - NodeJs v8.11.3
    - npm 5.6.0

2. ### Create React App
    **`Creat React App`** creates react apps with no build configuration and works on (**Windows**, **macOS**, **Linux**). For more information about **`Creat React App`**, visit thier [Official Repo](https://github.com/facebook/create-react-app).

    #### Installing
    To install **`Creat React App`** using **`npm`** run the following command.
    ```sh
    npm install -g create-react-app
    ```
    Then you can now start a new react app/project with the 