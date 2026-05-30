import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  ProviderRegistrationData,
  ProviderRegistrationRecord,
} from "./provider-registration-types";

const dataDir = path.join(process.cwd(), "data");
const registrationsFile = path.join(dataDir, "provider-registrations.json");
const expectedOtp = "123456";

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(registrationsFile, "utf8");
  } catch {
    await writeFile(registrationsFile, "[]", "utf8");
  }
}

async function readRegistrations() {
  await ensureDataFile();
  const raw = await readFile(registrationsFile, "utf8");
  return JSON.parse(raw) as ProviderRegistrationRecord[];
}

async function writeRegistrations(records: ProviderRegistrationRecord[]) {
  await ensureDataFile();
  await writeFile(registrationsFile, JSON.stringify(records, null, 2), "utf8");
}

export async function createProviderRegistration(
  data: ProviderRegistrationData
) {
  const records = await readRegistrations();
  const now = new Date().toISOString();
  const phoneOtp = data.verification.phoneOtp.join("");
  const emailOtp = data.verification.emailOtp.join("");

  const record: ProviderRegistrationRecord = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "pending_admin_approval",
    phoneVerified: phoneOtp === expectedOtp,
    emailVerified: emailOtp === expectedOtp,
    identityVerified: Boolean(
      data.verification.documentType &&
        data.verification.frontImageName &&
        data.verification.backImageName
    ),
    data,
  };

  records.unshift(record);
  await writeRegistrations(records);
  return record;
}

export async function getProviderRegistration(id: string) {
  const records = await readRegistrations();
  return records.find((record) => record.id === id) ?? null;
}

export async function listProviderRegistrations() {
  return readRegistrations();
}
