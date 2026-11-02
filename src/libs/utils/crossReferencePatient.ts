/**
 * Cross-reference utilities between HMS patients and Pathlab patients.
 *
 * Both apps share the same MongoDB. When a new HMS patient is created we
 * auto-create (or link) a matching Pathlab patient so the lab frontend can
 * immediately find them. We also expose a helper to fetch all lab cases for
 * an HMS patient so the patient detail screen can show lab history.
 */

import { getNextSequence } from "@src/libs/counter";
import { getPathlabPatientModel, getPathlabCaseModel } from "@src/libs/pathlabModels";
import { logger } from "@src/config/logger";

/**
 * Called after creating a new HospitalPatient.
 * Finds or creates the matching Pathlab Patient and writes the cross-reference
 * ID back onto the HMS patient record.
 *
 * @param hmsPatient  The newly-created HMS patient document (plain object).
 * @returns           The Pathlab patient _id string, or null on failure.
 */
export async function crossReferencePatient(hmsPatient: any): Promise<string | null> {
  try {
    const PathlabPatient = getPathlabPatientModel();

    // Check if a pathlab patient already exists for this phone number
    let pathlabPatient = await PathlabPatient.findOne({
      phone: hmsPatient.phone,
      deleted: { $ne: true },
    }).lean() as any;

    if (!pathlabPatient) {
      // Auto-generate a patientId using the same counter pattern the pathlab uses
      const nextSeq = await getNextSequence("patientId");
      const generatedPatientId = `P${String(nextSeq).padStart(5, "0")}`;

      pathlabPatient = await PathlabPatient.create({
        patientId:    generatedPatientId,
        name:         hmsPatient.name,
        phone:        hmsPatient.phone,
        gender:       hmsPatient.gender,
        age:          hmsPatient.age,
        dob:          hmsPatient.dob,
        email:        hmsPatient.email,
        address:      hmsPatient.address,
        aadharNo:     hmsPatient.aadharNo,
        bloodGroup:   hmsPatient.bloodGroup,
        hmsPatientId: hmsPatient._id?.toString(),
        deleted:      false,
      });

      logger.info(
        { hmsPatientId: hmsPatient._id, pathlabPatientId: pathlabPatient._id },
        "Auto-created pathlab patient for new HMS patient"
      );
    } else {
      // Existing pathlab patient found by phone — write back hmsPatientId if not set
      if (!pathlabPatient.hmsPatientId) {
        await PathlabPatient.updateOne(
          { _id: pathlabPatient._id },
          { $set: { hmsPatientId: hmsPatient._id?.toString() } }
        );
      }

      logger.info(
        { hmsPatientId: hmsPatient._id, pathlabPatientId: pathlabPatient._id },
        "Linked existing pathlab patient to new HMS patient"
      );
    }

    return pathlabPatient._id.toString();
  } catch (err: any) {
    logger.warn({ err: err.message }, "crossReferencePatient failed — non-fatal");
    return null;
  }
}

/**
 * Returns all Pathlab cases for a given pathlab patient ID.
 * Used on the HMS patient detail screen to show lab history.
 */
export async function getPathlabCasesForHmsPatient(pathlabPatientId: string): Promise<any[]> {
  try {
    const CaseModel = getPathlabCaseModel();

    const cases = await CaseModel.find({
      patientId: pathlabPatientId,
      deleted:   { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return cases;
  } catch (err: any) {
    logger.warn({ pathlabPatientId, err: err.message }, "getPathlabCasesForHmsPatient failed");
    return [];
  }
}
