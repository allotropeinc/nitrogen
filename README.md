# Nitrogen

Hello! We're happy you're interested in viewing the source code of the Nitrogen project. Nitrogen uses a combination of Angular and Express.

## Setup

Before you run Nitrogen, development or not, you'll need to give the backend a file to store its data in. An empty one is provided (`data.blank.json`), you need only copy it and name it `data.json` (and restart the backend if it's already running).

### Setting yourself as admin

Nitrogen features an admin panel, but to see it you'll have to set yourself as admin. There is currently no automatic way to do this if no admin already exists. Stop the backend if it's running, and edit the `data.json` file. Find your account in the `accounts` list and set `isAdmin` to `true`. Save and restart the backend and you should see the "Report Bug" button on the dashboard replaced by "Admin".

## Development

I'm sure before you host it for production you're going to want to make a few changes. Those are easy if you use the development mode; using a terminal or IDE of your choice, run `ng serve` in the root directory and `ts-node index.ts` in the `backend` directory. The front-end will automatically know it's in development and use the backend on port 5015 (by default).

This is all assuming you run `npm install` in both the root and backend directories first, of course.

And I'm so sorry I brutally murdered DRY (Don't Repeat Yourself).

## Production

After you're done with development, you'll probably want a way to push it to production. I've provided an easy script to help with building the app and putting it where it should be in the backend so the backend can serve it correctly.

Basically, the backend serves the `app` directory, and the `/api` endpoint is hooked up to the API. `build.sh` automatically builds Nitrogen for production and puts it where the backend expects it to be. That way the backend and frontend can run at the same time without managing 2 processes in production.