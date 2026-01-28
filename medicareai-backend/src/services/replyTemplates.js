export const intents = {
  GREETING: 'GREETING',
  PRICING: 'PRICING',
  APPOINTMENT: 'APPOINTMENT',
  EMERGENCY: 'EMERGENCY',
  UNKNOWN: 'UNKNOWN'
};

export const replies = {
  [intents.GREETING]: "Hello! I'm your MedicareAI assistant. How can I help you today? You can ask about pricing, book an appointment, or report an emergency.",
  
  [intents.PRICING]: "Our basic consultation starts at $50. Specialist visits range from $120-$200. Would you like a detailed price list?",
  
  [intents.APPOINTMENT]: "I can help with that! Please provide your preferred date and department (e.g., Cardiology, General Practice).",
  
  [intents.EMERGENCY]: "🚨 EMERGENCY DETECTED: Please call 911 immediately or proceed to the nearest emergency room. I am an AI and cannot provide immediate medical intervention.",
  
  [intents.UNKNOWN]: "I'm not quite sure I understood that. Could you try rephrasing? You can say 'Book an appointment' or 'Check prices'."
};