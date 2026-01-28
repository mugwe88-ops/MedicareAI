export function buildAutoReply(messageText) {
  if (!messageText) {
    return null;
  }

  const text = messageText.toLowerCase();

  if (text.includes('hi') || text.includes('hello')) {
    return 'Hello 👋 Welcome to MedicareAI. How can I assist you today?';
  }

  if (text.includes('appointment')) {
    return '📅 I can help you book or check an appointment. Please tell me the date.';
  }

  if (text.includes('reminder')) {
    return '⏰ I can help set up reminders for medication or visits.';
  }

  return 'Thanks for contacting MedicareAI. Please describe how I can help.';
}
    return null;