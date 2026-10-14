# Nix Backend v2

The backend server for DTU Times' internal portal **Nix**, built with **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**.

## Prerequisites

| Tool       | Version  | Notes                                                                 |
| ---------- | -------- | --------------------------------------------------------------------- |
| **Node.js** | ≥ 18.x   | Recommended: use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| **npm**    | ≥ 9.x    | Ships with Node.js                                                    |
| **MongoDB** | ≥ 6.x   | [Install MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/) |
| **Git**    | ≥ 2.x    | Required for cloning and submodule support                             |

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/dtutimes/nix-backend-v2.git
cd nix-backend-v2
```

### 2. Initialize the Git submodule

> [!IMPORTANT]
> This repo uses a **Git submodule** ([`central-information`](https://github.com/dtutimes/central-information)) at `src/commonlib/` for shared types and constants used across both the frontend and backend. **The project will not compile without it.**

```bash
git submodule update --init --recursive
```

> [!TIP]
> If the above command fails with an SSH authentication error, you can temporarily switch the submodule URL to HTTPS:
>
> ```bash
> git config submodule.src/commonlib.url https://github.com/dtutimes/central-information.git
> git submodule update --init --recursive
> ```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Copy the provided template and fill in the required values:

```bash
cp .env.local .env
```

Open `.env` and configure the variables. For **local development**, use these recommended values:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/nix_backend
FRONTEND_URL="http://localhost:5173"
HOST="http://localhost:8080"
ENABLE_EMAIL="false"

# Generate your own random strings for these secrets:
ACCESS_SECRET_KEY=<any-random-string>
REFRESH_SECRET_KEY=<any-random-string>
TOTP_SECRET=<any-random-string>
NOTIF_SECRET=<any-random-string>
NOTIF_PRIVATE_KEY=<any-random-string>

# These can be left as placeholder ObjectIDs for local dev:
EMAIL_USER_OBJID=64a1b2c3d4e5f6a7b8c9d0e1
DEFAULT_ROLE_ID=64a1b2c3d4e5f6a7b8c9d0e2
SUPERUSER_ROLE_ID=64a1b2c3d4e5f6a7b8c9d0e3

# Email (not needed if ENABLE_EMAIL is false):
EMAIL_SERVICE_USER=dev.dtutimes@dtu.ac.in
EMAIL_SERVICE_PASS=<google-app-password>
```

### 5. Start MongoDB

Make sure MongoDB is running locally before starting the server.

**macOS (Homebrew):**

```bash
brew services start mongodb-community
```

**Or run manually:**

```bash
mkdir -p ./data
mongod --dbpath ./data --port 27017
```

### 6. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:8080` with hot-reload via nodemon.

You should see:

```
App listening on port 8080 development
MongoDB Connected: 127.0.0.1
```

## Available Scripts

| Script       | Command          | Description                                |
| ------------ | ---------------- | ------------------------------------------ |
| `dev`        | `npm run dev`    | Start dev server with nodemon (hot-reload) |
| `start`      | `npm start`      | Start the server with ts-node              |
| `prod`       | `npm run prod`   | Start with PM2 for production              |
| `lint`       | `npm run lint`   | Lint and auto-fix with ESLint              |

## Project Structure

```
nix-backend-v2/
├── src/
│   ├── api/            # Route handlers, controllers, helpers
│   ├── commonlib/      # ⚡ Git submodule — shared types & constants
│   ├── config/         # Database, CORS, and app configuration
│   ├── scripts/        # Utility scripts
│   ├── express.d.ts    # Express type augmentations
│   ├── mongoose.d.ts   # Mongoose type augmentations
│   └── index.ts        # App entry point
├── uploads/            # User-uploaded files
├── thumbnails/         # Generated thumbnails
├── .env.local          # Environment variable template
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md
```

### Path Aliases (tsconfig)

| Alias       | Path                |
| ----------- | ------------------- |
| `@/*`       | `./src/*`           |
| `@static/*` | `./src/commonlib/*` |

## Connecting with the Frontend

To run the full Nix portal locally, you also need to set up the [nix-frontend-v2](https://github.com/dtutimes/nix-frontend-v2) repo. Make sure the frontend's `VITE_NIX_BACKEND` env variable points to `http://localhost:8080/api/v1`.

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `Cannot find module '@static/types/...'` | You forgot to initialize the submodule — run `git submodule update --init --recursive` |
| `MongooseServerSelectionError` | MongoDB isn't running — start it with `brew services start mongodb-community` or `mongod` |
| SSH auth error on submodule clone | Switch to HTTPS URL (see Step 2 tip above) |
| `bcrypt` build errors | Make sure you have Xcode Command Line Tools: `xcode-select --install` |

---

# Backup Overview

1. **Backup Existence**: The project has a robust backup system in place to ensure data integrity and availability.
2. **MongoDB Backup**:
   - **Scope**: All user accounts, passwords, blogs, and other data (excluding images) are backed up.
   - **Frequency**: Backups are performed daily.
   - **Storage**: The backups are stored on the server and uploaded to the Telegram channel.
3. **Image Backup**:
   - **Scope**: All image data is backed up.
   - **Frequency**: Backups are performed twice a month (every 15 days).
   - **Storage**: Image backups are stored on the server.
   - **Notifications**: Notifications are delivered on the same Telegram channel whenever an image backup is completed.

## Accessing Server Backups

To access server backups, log in using the following credentials:

- **Username**: dvishal485
- Managed via cron jobs

```bash
crontab -e
```

Ensure you follow appropriate security protocols when accessing and handling backup data.

## Notifications

Backup notifications are delivered to the Telegram channel to notify about the status of the image backups.

---

# Accessing Terminal

- Through teams portal, navigate to the terminal page, use credentials provided to login in the Nginx UI (different than user's credential).
- Through digital ocean, guides available online to get access to droplet's terminal.
- (If you already have terminal access) Through `sshx` you can access terminal using a web interface via a temporary link. (This should only be required if the TUI is not rendered properly)
- After this you can login as `root` or `dvishal485`. Note: `root` doesn't have any password (and can be accessed via verified ssh keys and sudo commands in user's profile), `dvishal485` can be accessed like any other account with a password.
