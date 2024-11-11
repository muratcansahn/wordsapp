# Ship Mobile Fast Pro Boilerplate

A production-ready React Native boilerplate with Expo, focusing on best practices, performance, and developer experience.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/shipmobilefast/shipmobilefast-pro.git [project-name]

# Navigate to the project
cd [project-name]

# Install dependencies (using npm or yarn)
yarn install
# OR
npm install

# Start the development server
yarn start
# OR
npm run start
```

## 📋 Requirements

- Node.js >= 18.0.0
- Expo CLI
- iOS Simulator / Android Emulator for mobile development
- Git

## 📚 Documentation

For detailed documentation, visit [docs.shipmobilefast.com](https://docs.shipmobilefast.com)

## 🎨 Assets Generation

### App Icons & Splash Screen

Generate your app icons and splash screen easily using our online tool:
[shipmobilefast.com/asset-generator](https://shipmobilefast.com/asset-generator)

## 🛠 Features

- ⚡️ Expo Router (Type-Safe File-Based Routing)
- 💪 TypeScript
- 🔐 Authentication Ready (Supabase, Google, Apple)
- 🎯 Production-Ready
- 📱 Cross-Platform (iOS, Android, Web)
- 🔄 State Management (Redux Toolkit)
- 🌍 i18n Ready (4 languages included)
- 🎨 Theme Support (Light/Dark)
- 📊 Analytics Integration (PostHog)
- 🔍 Error Tracking (Sentry)
- 💾 Local Storage
- 🔒 Secure Storage
- 📱 Deep Linking Support
- 🎯 Push Notifications
- 💰 In-App Purchases (RevenueCat)
- 📢 Social Share
- 🎨 Animation Libraries
- 📝 Form Handling (React Hook Form)

## 📁 Project Structure

```
src/
├── app/             # Expo Router pages
├── components/      # Reusable components
├── constants/       # App constants
├── hooks/          # Custom hooks
├── services/       # API services
├── store/          # State management
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## 🛠 Available Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest --watchAll",
    "lint": "expo lint",
    "build:ios": "eas build -p ios --profile production",
    "build:android": "eas build -p android --profile production",
    "build:web": "eas build -p web --profile production"
  }
}
```

## 🔧 Environment Setup

1. Copy `app.json.example` to `app.json` and update the configuration
2. Copy `eas.json.example` to `eas.json` and update the configuration
3. Create `.env` file with required environment variables

## 🌐 Internationalization

Supported languages:

- English (en-US)
- Turkish (tr-TR)
- German (de-DE)
- Spanish (es-ES)

## 📝 License

This project is licensed under the [ShipMobileFast License](https://shipmobilefast.com/license), see the [LICENSE](https://shipmobilefast.com/license) file for details.

## 📫 Support

For support, email [info@shipmobilefast.com](mailto:info@shipmobilefast.com)

---

Built with ❤️ by [ShipMobileFast](https://shipmobilefast.com)
