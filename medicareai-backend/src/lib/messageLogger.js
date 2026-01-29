export const logMessage = (phone, text, direction) => {
    console.log(`[${new Date().toISOString()}] ${direction}: ${phone} - ${text}`);
};

