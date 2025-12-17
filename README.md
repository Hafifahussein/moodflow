# Mood Flow App

Moodflow is a simple and elegant mobile app built with **React Native** and **Expo**. It allows users to record their daily mood, store mood history, and view mood statistics in a clean interface. Perfect for self-reflection and emotional awareness.

## Features

- 📊 **Track Your Mood:** Select from 5 emoji-based moods (Terrible to Excellent)
- 📝 **Add Notes:** Optional notes for each mood entry
- 📈 **View Statistics:** Real-time mood analytics and trends
- 📅 **History Log:** Chronological display of all mood entries
- 🎨 **Beautiful UI:** Clean, modern interface using React Native Paper
- 📱 **Cross-Platform:** Runs on both iOS and Android

## Technologies

- **React Native**: Framework for building cross-platform mobile apps
- **Expo**: Toolchain to simplify React Native development
- **TypeScript**: Static typing for better code reliability
- **React Native Paper**: UI component library for Material Design
- **date-fns**: Modern date utility library for date formatting
- **React Hooks**: useState, useEffect for state management

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Smartphone with Expo Go app (or iOS/Android simulator)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Hafifahussein/moodflow.git
cd moodflow
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npx expo start
```

4. **Run on your device:**
   - Install Expo Go from your app store
   - Scan the QR code shown in your terminal
   - The app will load live on your device

## Usage

1. **Select a mood:** Tap one of the 5 mood buttons
2. **Add a note:** Optional - type what's on your mind
3. **Log your mood:** Press "Log Mood" to save the entry
4. **View history:** Scroll through your past mood entries
5. **Check stats:** See your mood statistics at a glance


## Common Issues

**"expo command not found"**
```bash
npx expo start
```

**Clear cache if having issues:**
```bash
expo start --clear
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

This project is open-source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with React Native and Expo
- UI components from React Native Paper
- Icons from Material Design
- Date handling with date-fns