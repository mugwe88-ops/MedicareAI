export function autoReplyDryRun({ from, message }) {
  console.log('🤖 AUTO-REPLY DRY RUN');
  console.log('From:', from);
  console.log('Message:', message);

  return {
    text: "Thanks for your message! (auto-reply dry run)"
  };
}
