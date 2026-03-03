# tap-app

Mobile client for Atlas Tap. Pairs with the Atlas Tap server over your local network and turns your phone into a media remote for your desktop.

## Overview

Atlas Tap is a phone-as-remote system built for desktop media control. This is the mobile side — a React Native and Expo app that connects to the server, displays preset controls, and sends keypress commands on button press.

## Stack

- **React Native** — mobile UI framework
- **Expo** — build tooling and runtime
- **TypeScript** — language

## How It Works

1. Run the Atlas Tap server on your desktop
2. Open the app and scan the QR code displayed by the server
3. The app locks on to the server IP and authenticates using the embedded session token
4. Select a preset for the media player you're using
5. Button presses are sent to the server in real time

## Presets

Each preset is tailored to a specific media player and exposes a set of buttons mapped to that app's keybinds — things like captions, skip intro, and playback control. The preset system is modular and straightforward to extend.

## Security

Pairing is done by scanning a QR code that contains the server IP and a session token. The app will only communicate with the server it paired with. Intended for personal, local network use only.

## Related

- [tap-server](https://github.com/theatlasprojects/tap-server) — the Tauri/Rust desktop server