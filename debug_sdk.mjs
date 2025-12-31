
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "test" });
console.log("Methods on ai.models:", Object.keys(Object.getPrototypeOf(ai.models)));
console.log("generateImages exists?", typeof ai.models.generateImages);
