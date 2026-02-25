# Dependencies Installation Required

## Issue
npm/yarn not found in PATH. You need to install the notification dependencies manually.

## Solution

### Option 1: Using npm (if you have Node.js installed)
```bash
cd /Users/son/FulccrumProjects/frontend
npm install expo-notifications expo-device expo-constants socket.io-client
```

### Option 2: Using yarn
```bash
cd /Users/son/FulccrumProjects/frontend
yarn add expo-notifications expo-device expo-constants socket.io-client
```

### Option 3: Using npx expo
```bash
cd /Users/son/FulccrumProjects/frontend
npx expo install expo-notifications expo-device expo-constants
npm install socket.io-client
```

## After Installation
Once dependencies are installed, the notification system will be ready to use. The code is already configured and waiting for these packages.

## Verify Installation
Check that these appear in your package.json:
- expo-notifications
- expo-device
- expo-constants
- socket.io-client
