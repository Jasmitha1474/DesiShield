
# DesiShield - Multilingual Phishing Detection

DesiShield is a hackathon prototype designed to identify phishing and scam attempts in the Indian digital ecosystem. It supports English, regional languages (Hindi, Tamil), and code-mixed patterns (Hinglish).

## Features
- **Multilingual Support**: Detects scams in English, Hindi, Tamil, and Hinglish.
- **Rule-Based & AI Analysis**: Combines specific trigger heuristics (KYC, OTP, Prizes) with Gemini AI's deep reasoning.
- **Explainability**: Shows risk scores, triggered rules, and highlights suspicious terms.
- **Feedback Loop**: Allows users to "Mark as Scam/Safe" and exports data to CSV.
- **Voice Integration**: Supports voice-to-text input for accessibility.

## Tech Stack
- **Frontend**: React 18 (TypeScript) + Tailwind CSS
- **AI Engine**: Gemini 3 Flash Preview
- **Icons**: Lucide React
- **Voice**: Web Speech API

## Demo Video 
**Watch the full project demonstration:**  
[Watch Demo]: https://drive.google.com/file/d/1DGO0oiu6TN14SfJ2RdrLF-CLElB58JMU/view?usp=drivesdk


## Deployment Instructions

### 1. Push to GitHub
- Initialize a git repo: `git init`
- Commit files: `git add . && git commit -m "initial commit"`
- Push to a new GitHub repository.

### 2. Deployed Link
**Deployed Link: https://cheery-dieffenbachia-156cd9.netlify.app/#

### 3. Setup Environment Variables
Ensure `API_KEY` is provided in the environment for Gemini API access.

## Demo Script
1. **Click "Code-Mixed (Hinglish)"**: Watch how it identifies "lottery prize" and "claim" as risk factors in a mixed-language sentence.
2. **Click "Voice Input"**: Say "Your electricity bill is overdue, pay now or connection will be cut."
3. **Verify Badges**: See the clear "Safe/Suspicious/Phishing" labels.
4. **Export CSV**: Click "Export" in the Sidebar to download the feedback data.

---
*Created for the 2026 HackElite Hackathon.*
