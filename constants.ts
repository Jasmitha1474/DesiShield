
import { DemoCase } from './types';

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'en-phishing',
    title: 'English Phishing',
    text: 'URGENT: Your account will be suspended in 2 hours. Please update your KYC immediately at http://bit.ly/bank-secure-verify to avoid service disruption.',
    type: 'English'
  },
  {
    id: 'hi-phishing',
    title: 'Hindi/Tamil Phishing',
    text: 'प्रिय ग्राहक, आपका बिजली बिल बकाया है। आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत इस नंबर पर संपर्क करें: 9876543210।',
    type: 'Regional'
  },
  {
    id: 'code-mixed',
    title: 'Code-Mixed (Hinglish)',
    text: 'Congrats! Aapne jeeta hai 25 Lakh ka lottery prize. Claim karne ke liye apna Bank Details is link pe share karein: http://scammy-prize.com/claim',
    type: 'Code-Mixed'
  },
  {
    id: 'safe',
    title: 'Safe Message',
    text: 'Hi Mom, I will reach home by 7 PM today. Please keep the dinner ready. Love you!',
    type: 'Safe'
  }
];

export const RULES = {
  urgency: ["urgent", "immediately", "today", "now", "expired", "suspended", "turtant", "jaldi"],
  reward: ["congratulations", "won", "prize", "lottery", "cashback", "jeeta", "inaam"],
  banking: ["kyc", "bank", "account", "otp", "pin", "verify", "aadhaar", "pan card"],
  threat: ["police", "court", "suspended", "blocked", "electricity cut", "bijli"],
  url_shorteners: ["bit.ly", "t.co", "tinyurl", "is.gd", "buff.ly"]
};
