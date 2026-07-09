# Mosaic

Mosaic is a database app that allows users to store various types of source materials/ content(notes, videos/audio files, pdfs, images, etc.) that are associated with different keywords known as “tags” or “topics”. The database allows users to search through their self-cultivated database in order to find source materials that are linked with the same “tags”. This resource will help researchers and/or creatives who want to create their own “digital garden” in order to fuel inspiration for their hobbies and projects.

## Software Used

* Database System: MySQL
* User Interface: React + TypeScript
* Backend Framework: Node.js + Express (Express makes it easier to create routes and handle requests)

## Project Structure

* `client/`: React frontend.
* `server/`: Express backend and SQLite setup.
* `.gitignore`: Excludes generated files such as `node_modules` and local database files.

The database is stored locally and is not tracked by Git. We can later add sample data if we want everyone to start with the same data.

## Running the Project

### Frontend

From the `client` folder:

* `npm install`
* `npm run dev`

The React app will run on `localhost:5173`.

### Backend

From the `server` folder:

* `npm install`
* `npm run dev`

The Express server will run on `localhost:3000`.

React and Express are started in separate terminals. The React app runs on `localhost:5173`, while Express runs on `localhost:3000`. The site is viewed through the React app, while Express handles API routes and the SQLite connection.
