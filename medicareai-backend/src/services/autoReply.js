import { intents, replies } from './replyTemplates.js';

/**
 * Logic to categorize user messages into specific intents
 */
export const detectIntent = (text) => {
  const input = text.toLowerCase();

  if (input.match(/(emergency|help|die|heart attack|bleeding|accident|urgent)/)) return intents.EMERGENCY;
  if (input.match(/(price|cost|how much|fee|payment|billing|rates)/)) return intents.PRICING;
  if (input.match(/(book|appointment|schedule|see a doctor|visit|checkup)/)) return intents.APPOINTMENT;
  if (input.match(/(hi|hello|hey|greetings|morning|sup)/)) return intents.GREETING;

  return intents.UNKNOWN;
};

/**
 * Main entry point for the auto-reply engine
 * Keeps your existing signature but adds intelligent routing
 */
export function autoReplyDryRun({ from, message }) {
  console.log('🤖 AUTO-REPLY ENGINE (DRY RUN)');
  console.log('From:', from);
  console.log('Message:', message);

  // 1. Determine what the user wants
  const intent = detectIntent(message || "");
  
  // 2. Map that intent to a pre-defined response
  const responseText = replies[intent];

  console.log(`Detected Intent: ${intent}`);

  return {
    intent,
    text: responseText
  };
}