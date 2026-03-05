# DSA Sheet - MAANG Preparation Platform

A structured LeetCode practice dashboard built with React and Firebase Firestore.

## 🚀 Features
- **20 MAANG Topics**: Carefully selected problems from basic to advanced.
- **Progress Tracking**: Visual progress bars for each topic and overall.
- **Cloud Sync**: Real-time synchronization with Firebase Firestore.
- **Bookmarks**: Save important problems for later revision.
- **Filters**: Filter by difficulty (Easy/Medium/Hard) and status (Solved/Unsolved).
- **Premium UI**: Dark mode, glassmorphism, and smooth animations.

## 🛠️ Setup Instructions

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Add a Web App to your project.
4. Enable **Firestore Database** in test mode or production mode (add rules).
5. Enable **Authentication** (Google Login optional).
6. Copy your Firebase keys and paste them into `src/firebase.js`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Firestore Seeding
The application automatically seeds the Firestore database with the initial 200+ problems if the `topics` collection is empty. Just open the app and it will initialize your DB!

## 📦 Deployment (Firebase Hosting)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your project.
   - Use `dist` as your public directory.
   - Configure as a single-page app: **Yes**.
   - Set up automatic builds: **No** (optional).
4. Build the app:
   ```bash
   npm run build
   ```
5. Deploy:
   ```bash
   firebase deploy
   ```

## 📝 Customization
You can add more questions or modify topics in `src/data/initialData.js`. The app will re-seed if the database is empty, or you can manually update Firestore.
