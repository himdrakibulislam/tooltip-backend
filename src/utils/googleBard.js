import { GoogleGenerativeAI } from "@google/generative-ai";

const GoogleAI = new GoogleGenerativeAI(process.env.GOOGLE_BARD_API_KEY);

export default GoogleAI;
