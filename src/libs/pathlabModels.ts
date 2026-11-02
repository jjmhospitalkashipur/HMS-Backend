/**
 * Minimal Mongoose model registrations for shared Pathlab collections.
 *
 * This HMS backend and the Pathlab backend share the same MongoDB database.
 * We register just enough schema here to:
 *   1. Read pathlab cases for IPD billing display
 *   2. Read/create pathlab patients for cross-referencing
 *   3. Auto-create a pathlab patient when a new HMS patient is registered
 *
 * These schemas use `strict: false` so they can read all existing fields
 * without having to mirror the full pathlab schema.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ---------------------------------------------------------------------------
// Pathlab Patient
// ---------------------------------------------------------------------------

export interface PathlabPatientDoc extends Document {
  patientId:  string;
  name:       string;
  phone:      string;
  gender?:    string;
  age?:       number;
  dob?:       Date;
  email?:     string;
  address?:   string;
  aadharNo?:  string;
  bloodGroup?: string;
  hmsPatientId?: string; // back-reference to HospitalPatient._id
  deleted?:   boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const pathlabPatientSchema = new Schema<PathlabPatientDoc>(
  {
    patientId:    { type: String },
    name:         { type: String },
    phone:        { type: String },
    gender:       { type: String },
    age:          { type: Number },
    dob:          { type: Date },
    email:        { type: String },
    address:      { type: String },
    aadharNo:     { type: String },
    bloodGroup:   { type: String },
    hmsPatientId: { type: String }, // HMS cross-reference
    deleted:      { type: Boolean, default: false },
  },
  { strict: false, timestamps: true, collection: "patients" }
);

export function getPathlabPatientModel(): Model<PathlabPatientDoc> {
  try {
    return mongoose.model<PathlabPatientDoc>("Patient");
  } catch {
    return mongoose.model<PathlabPatientDoc>("Patient", pathlabPatientSchema);
  }
}

// ---------------------------------------------------------------------------
// Pathlab Case
// ---------------------------------------------------------------------------

export interface PathlabCaseDoc extends Document {
  caseId:       string;   // human-readable ID e.g. "C00123"
  patientId:    string;   // ref to Patient._id
  totalAmount:  number;
  finalAmount:  number;
  discountType?: string;
  discount?:    number;
  status?:      string;
  deleted?:     boolean;
  createdAt?:   Date;
  updatedAt?:   Date;
}

const pathlabCaseSchema = new Schema<PathlabCaseDoc>(
  {
    caseId:      { type: String },
    patientId:   { type: String },
    totalAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    discountType:{ type: String, default: "Flat" },
    discount:    { type: Number, default: 0 },
    status:      { type: String },
    deleted:     { type: Boolean, default: false },
  },
  { strict: false, timestamps: true, collection: "cases" }
);

export function getPathlabCaseModel(): Model<PathlabCaseDoc> {
  try {
    return mongoose.model<PathlabCaseDoc>("Case");
  } catch {
    return mongoose.model<PathlabCaseDoc>("Case", pathlabCaseSchema);
  }
}
