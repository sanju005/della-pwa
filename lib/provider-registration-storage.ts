import "server-only";

import path from "node:path";

import type {
  ProviderRegistrationData,
  ProviderRegistrationRecord,
} from "./provider-registration-types";

const expectedOtp = "123456";
const registrationsFile = path.join(
  process.cwd(),
  "data",
  "provider-registrations.json",
);

declare global {
  // eslint-disable-next-line no-var
  var __dellaProviderRegistrations:
    | ProviderRegistrationRecord[]
    | undefined;
}

function isWorkerdRuntime() {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

async function ensureNodeDataFile() {
  const { mkdir, readFile, writeFile } = await import("node:fs/promises");
  const dataDir = path.dirname(registrationsFile);

  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(registrationsFile, "utf8");
  } catch {
    await writeFile(registrationsFile, "[]", "utf8");
  }
}

async function readNodeRegistrations() {
  const { readFile } = await import("node:fs/promises");
  await ensureNodeDataFile();
  const raw = await readFile(registrationsFile, "utf8");
  return JSON.parse(raw) as ProviderRegistrationRecord[];
}

async function writeNodeRegistrations(records: ProviderRegistrationRecord[]) {
  const { writeFile } = await import("node:fs/promises");
  await ensureNodeDataFile();
  await writeFile(registrationsFile, JSON.stringify(records, null, 2), "utf8");
}

function readWorkerRegistrations() {
  return globalThis.__dellaProviderRegistrations ?? [];
}

function writeWorkerRegistrations(records: ProviderRegistrationRecord[]) {
  globalThis.__dellaProviderRegistrations = records;
}

async function readRegistrations() {
  if (isWorkerdRuntime()) {
    return readWorkerRegistrations();
  }

  return readNodeRegistrations();
}

async function writeRegistrations(records: ProviderRegistrationRecord[]) {
  if (isWorkerdRuntime()) {
    writeWorkerRegistrations(records);
    return;
  }

  await writeNodeRegistrations(records);
}

export async function createProviderRegistration(
  data: ProviderRegistrationData,
) {
  const records = await readRegistrations();
  const now = new Date().toISOString();
  const phoneOtp = data.verification.phoneOtp.join("");
  const emailOtp = data.verification.emailOtp.join("");

  const record: ProviderRegistrationRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "pending_admin_approval",
    phoneVerified: phoneOtp === expectedOtp,
    emailVerified: emailOtp === expectedOtp,
    identityVerified: Boolean(
      data.verification.documentType &&
        data.verification.frontImageName &&
        data.verification.backImageName,
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
