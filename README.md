# Mosaic

## Project Overview

Mosaic is a database app that allows users to store various types of
content or source material such as notes (Markdown files), videos/audio
files, pdfs, and images that are associated with different keywords or
tags. The application allows users to search through their self-cultivated
database in order to find content that is linked with the same tags. This
application will help researchers and/or creatives who want to create
their own “digital garden” in order to fuel inspiration for their hobbies
and projects

## Key Terms

- **Tesserae (plural) or Tessera (singular):** source material
- **Grout:** keywords or tags

## Features

- Runs locally on the user's machine without requiring an account.
- Create multiple **workspaces** (Personal, School, Work, etc.).
- Organize tesserae into **collections** for specific projects or topics.
- Search for content using tags, collections, content type, and other filters.
- Save frequently used searches with **Saved Searches**.
- Search within note files to find specific keywords.
- Create **snapshots** of workspaces to view how it has grown overtime
- Discover connections between tesserae through shared tags.

---

## Software Used

- **Database System:** MySQL
- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express

---

## Project Structure

- `client/` – React frontend
- `server/` – Express backend and MySQL connection
- `database/` – Database schema and sample data
- `.gitignore` – Excludes generated files such as `node_modules` and local configuration files like `.env`.

---

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js
- MySQL Server
- A local MySQL user account (for example, `root`) and its password

---

## MySQL Configuration

Create a `.env` file inside the `server` folder by copying `.env.example`.

Update the file with your local MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=Mosaic
```

The `.env` file is ignored by Git so each developer can use their own local MySQL credentials.

When the backend starts, it automatically creates the database schema, loads the sample data, and connects the API to the MySQL database.

---

## Running the Project

### Frontend

From the `client` folder:

```bash
npm install
npm run dev
```

### Backend

From the `server` folder:

```bash
npm install
npm run dev
```

Run the frontend and backend in separate terminals.

The frontend terminal will display the URL where the application is running, while the backend terminal will display the address of the Express server. Once the backend starts, the API will be connected to the MySQL database and will begin serving data to the frontend.
