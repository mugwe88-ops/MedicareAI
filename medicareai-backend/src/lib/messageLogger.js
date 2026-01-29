import pool from '../db.js';

export const logMessageToDb = async (phone, text, direction, intent = null, reply = null) => {
    try {
        const query = `
            INSERT INTO message_logs (phone_number, message_text, direction, intent, reply_text)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(query, [phone, text, direction, intent, reply]);
        console.log(`📝 [Log] Message from ${phone} saved.`);
    } catch (err) {
        console.error('❌ [Log] Error saving to DB:', err.message);
    }
};

// Keep the simple console log too just in case
export const logMessage = (phone, text, direction) => {
    console.log(`[${new Date().toISOString()}] ${direction}: ${phone} - ${text}`);
};
