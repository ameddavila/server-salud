import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export const generateApiKey = (): { apiKey: string; hashedApiKey: string } => {
  const apiKey = uuidv4();
  const hashedApiKey = crypto.createHash("sha256").update(apiKey).digest("hex");
  return { apiKey, hashedApiKey };
};
