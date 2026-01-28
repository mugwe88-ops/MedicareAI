// Simple in-memory cache for idempotency
const processedMessageIds = new Set();
const CACHE_LIMIT = 500;

export const handleWebhook = async (req, res) => {
  const { body } = req;

  // 1. Extract message details
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  // 2. Acknowledge receipt to Meta immediately (prevents retries)
  res.sendStatus(200);

  // 3. Filter: Ignore status updates (sent/delivered/read)
  if (value?.statuses) return;

  // 4. Filter: Handle only text messages for now
  if (!message || message.type !== 'text') {
    console.log(`[Webhook] Skipping non-text event type: ${message?.type || 'unknown'}`);
    return;
  }

  // 5. Idempotency: Check if we've already seen this wamid
  if (processedMessageIds.has(message.id)) {
    console.warn(`[Webhook] Duplicate detected for ID: ${message.id}. Skipping.`);
    return;
  }

  // Add to cache
  processedMessageIds.add(message.id);
  if (processedMessageIds.size > CACHE_LIMIT) {
    const firstValue = processedMessageIds.values().next().value;
    processedMessageIds.delete(firstValue);
  }

  // 6. Logic Placeholder (Agenda 2)
  console.log(`[Dry-Run] Valid text from ${message.from}: ${message.text.body}`);
};