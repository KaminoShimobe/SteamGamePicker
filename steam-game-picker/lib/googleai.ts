import { GoogleGenerativeAI } from "@google/generative-ai";

const googleai = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY!);

export default googleai;