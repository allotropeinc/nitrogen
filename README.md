# Nitrogen

Hello! We're happy you're interested in viewing the source code of the Nitrogen project. Nitrogen uses a combination of Angular and Express.

## Development

I'm sure before you host it for production you're going to want to make a few changes. Those are easy if you use the development mode; using a terminal or IDE of your choice, run `ng serve` in the root directory and `ts-node index.ts` in the `backend` directory. The front-end will automatically know it's in development and use the backend on port 5015 (by default).

This is all assuming you run `npm install` in both the root and backend directories first, of course.

## Production

After you're done with development, you'll probably want a way to push it to production. I've provided an easy script to help with building the app and putting it where it should be in the backend so the backend can serve it correctly.

Basically, the backend serves the `app` directory, and the `/api` endpoint is hooked up to the API. `build.sh` automatically builds Nitrogen for production and puts it where the backend expects it to be. That way the backend and frontend can run at the same time without managing 2 processes in production.