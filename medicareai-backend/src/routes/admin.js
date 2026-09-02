import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase using your environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needs service role key to create users via admin API

const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post('/register-doctor', async (req, res) => {
  try {
    const { email, password, displayName, specialization, licenseNumber } = req.body;

    // Basic validation
    if (!email || !password || !displayName || !specialization || !licenseNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // 1. Create the user in Supabase Auth using the Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Automatically confirm email so they can log in immediately
      user_metadata: { role: 'doctor', display_name: displayName }
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Insert the doctor profile info into your new 'doctors' table
    const { error: dbError } = await supabase
      .from('doctors')
      .insert({
        id: userId, // Matches the Supabase Auth user ID
        email: email,
        display_name: displayName,
        specialization: specialization,
        license_number: licenseNumber
      });

    if (dbError) {
      return res.status(400).json({ success: false, error: dbError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Doctor account registered successfully in Supabase!',
      userId: userId,
    });

  } catch (error) {
    console.error('Error registering doctor:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;