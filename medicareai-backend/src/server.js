// ... (Your imports remain exactly the same)

const app = express();
app.set('trust proxy', 1); 

// 1. DATABASE INIT (Kept your exact logic)
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'patient',
                kmpdc_number VARCHAR(255)
            );
            -- THIS IS THE CURE: Forces the column into existence every time the server starts
            ALTER TABLE users ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
        `);
        console.log("✅ Database Synced");
    } catch (err) {
        console.error("❌ Sync Error:", err.message);
    }
}
initDatabase();

// 2. MIDDLEWARE (Same as yours)
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
// ... (Your session config goes here)

// 3. THE RESET TOOL (CRITICAL: MUST BE ABOVE STATIC FILES)
app.get('/api/admin/reset', async (req, res) => {
    try {
        // This command actually builds the missing pieces manually
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255);');
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        
        const hashedPw = await bcrypt.hash('password123', 10);
        await pool.query(`
            INSERT INTO users (name, email, password, role, is_verified, kmpdc_number)
            VALUES ('Dr. Willy', 'willyweyru3@gmail.com', $1, 'doctor', true, 'TEST-999-MD')
        `, [hashedPw]);

        res.status(200).json({ success: true, message: "Cancer cured. TEST-999-MD created." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. YOUR OTHER API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
// ... etc

// 5. STATIC FILES (MUST BE LAST)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.startsWith('api')) return next();
    res.sendFile(path.join(__dirname, 'public', page.includes('.') ? page : `${page}.html`));
});