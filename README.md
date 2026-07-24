# First Cut — Mohammad Farhan

A production-ready React portfolio for a video editor and graphic designer. The public website presents work and services, accepts project orders and meeting requests, and includes a protected owner dashboard for project and inquiry management.

## Included

- Modern responsive portfolio with cinematic “First Cut” identity
- Firebase Email/Password administrator login
- Firestore-backed projects, client orders, and meeting requests
- Cloudinary image and video uploads from the dashboard
- Add, edit, publish, feature, reorder, and delete portfolio projects
- Client order form, project-specific inquiry flow, and meeting request form
- Demo content when Firebase is not configured
- Netlify configuration and SPA redirects

## Local setup

1. Install Node.js 22.
2. Copy `.env.example` to `.env`.
3. Add your Firebase and Cloudinary values.
4. Run:

```bash
npm install
npm run dev
```

Public website: `http://localhost:5173`  
Admin dashboard: `http://localhost:5173/admin`

## Firebase setup

1. Create a Firebase project.
2. Add a Web app in Project Settings.
3. Enable **Authentication → Email/Password**.
4. Create the owner account in **Authentication → Users**. Do not add public registration.
5. Create a Firestore database.
6. Publish the included `firestore.rules` in **Firestore Database → Rules**.
7. Copy the Firebase web values to `.env`.

Only authenticated users can create, edit, or delete projects and read client requests. Visitors can read published projects and create validated inquiries.

## Cloudinary setup

1. Create a Cloudinary account.
2. Open **Settings → Upload → Upload presets**.
3. Create an **Unsigned** preset restricted to the formats and file sizes you want.
4. Copy the cloud name and preset name to `.env`.

Uploads are stored in `first-cut/projects`. For a high-traffic production site, replace the unsigned preset with a signed Netlify Function.

## Deploy on GitHub and Netlify

1. Push this folder to a GitHub repository.
2. In Netlify choose **Add new site → Import an existing project**.
3. Select the GitHub repository.
4. Netlify reads `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. In **Site configuration → Environment variables**, add every variable from `.env.example`.
6. Deploy the site.
7. In Firebase Authentication settings add your Netlify domain to **Authorized domains**.

Never commit `.env` or passwords. The Firebase API key is designed for client apps; Firestore rules and disabling public account creation provide the access control.

## Customize

- Replace the sample projects from the dashboard after connecting Firebase.
- Change `VITE_CONTACT_EMAIL`.
- Set `VITE_BOOKING_URL` if you later connect Cal.com or Calendly.
- Update the services and copy in `src/main.jsx`.
