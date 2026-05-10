/**
 * Neural Engine handles multiple API keys for redundancy and higher throughput.
 */
export const getGeminiKeys = (): string[] => {
  const keys: string[] = [];
  
  // Default key from environment
  if (process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }
  
  // Additional keys if provided by the user in .env
  // Users can manually add these to their Secrets panel
  const additionalKeys = [
    (import.meta as any).env?.VITE_GEMINI_API_KEY_2,
    (import.meta as any).env?.VITE_GEMINI_API_KEY_3,
    (import.meta as any).env?.VITE_GEMINI_API_KEY_4,
    (import.meta as any).env?.VITE_GEMINI_API_KEY_5,
  ].filter(Boolean);
  
  return [...keys, ...additionalKeys];
};
