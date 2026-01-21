import { prisma } from '../lib/prisma.js'; // Connection to your database

/**
 * Updates a patient's reliability score based on their appointment history.
 * @param {string} patientId - The ID of the patient.
 * @param {string} outcome - 'COMPLETED', 'LATE_CANCEL', or 'NO_SHOW'.
 */
export const updateReliabilityScore = async (patientId, outcome) => {
  // 1. Define the points for each outcome
  const pointsMap = {
    'COMPLETED': 5,
    'LATE_CANCEL': -10,
    'NO_SHOW': -25
  };

  const pointsToAdd = pointsMap[outcome] || 0;

  // 2. Update the database
  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        reliabilityScore: {
          increment: pointsToAdd // This adds/subtracts points automatically
        }
      }
    });

    console.log(`⭐ New Score for ${updatedPatient.name}: ${updatedPatient.reliabilityScore}`);
    return updatedPatient;
  } catch (error) {
    console.error("❌ Failed to update reliability score:", error);
  }
};