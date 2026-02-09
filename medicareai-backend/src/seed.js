import { pool } from "./db.js";

const seed = async () => {
  await pool.query(`
    INSERT INTO patients (name, phone, email)
    VALUES
    ('John Doe','0700000001','john@mail.com'),
    ('Mary Jane','0700000002','mary@mail.com');

    INSERT INTO doctors (name, specialty)
    VALUES
    ('Dr Smith','Cardiology'),
    ('Dr Alice','Neurology');

    INSERT INTO appointments (patient_id, doctor_id, appointment_date)
    VALUES
    (1,1,NOW() + INTERVAL '1 day'),
    (2,2,NOW() + INTERVAL '2 days');
  `);

  console.log("✅ Fake hospital data inserted");
  process.exit();
};

seed();
