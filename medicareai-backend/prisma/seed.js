import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ... Keep whatever code you already had here ...
  console.log('Adding medical test data...');

  // 1. Create a Test Doctor
const doctor = await prisma.doctor.upsert({
  where: { id: 'test-doctor-1' }, // We give it a fixed ID for easy testing
  update: {},
  create: {
    id: 'test-doctor-1',
    name: 'Dr. Kennedy Omolo',
    specialty: 'General Consultant',
  },
});

console.log(`👨‍⚕️ Test Doctor created: ${doctor.name}`);
  const medicalPatients = [
  {
    name: 'John Reliable',
    phone: '254700000001', // Changed from phoneNumber to phone
    reliabilityScore: 50,
  },
  {
    name: 'Sarah Caution',
    phone: '254700000002',
    reliabilityScore: 0,
  },
  {
    name: 'Mike HighRisk',
    phone: '254700000003',
    reliabilityScore: -30,
  },
];

for (const p of medicalPatients) {
  await prisma.patient.upsert({
    where: { phone: p.phone }, // Matches your schema
    update: { reliabilityScore: p.reliabilityScore },
    create: p,
  });
}

  for (const p of medicalPatients) {
    await prisma.patient.upsert({
      where: { phoneNumber: p.phoneNumber },
      update: { reliabilityScore: p.reliabilityScore }, // Updates the score if they exist
      create: p,
    });
  }

  console.log('✅ Medical test data merged successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // 2. Create a test appointment for the "High Risk" patient
const highRiskPatient = await prisma.patient.findUnique({
  where: { phone: '254700000003' }
});

if (highRiskPatient) {
  await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: highRiskPatient.id,
      startTime: new Date(new Date().setHours(10, 0, 0)), // 10:00 AM Today
      endTime: new Date(new Date().setHours(11, 0, 0)),   // 11:00 AM Today
      status: 'PENDING',
    },
  });
  console.log('📅 Test appointment created for Mike HighRisk');
}