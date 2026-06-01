import "server-only";

export type CustomerBookingRecord = {
  id: string;
  providerId: string;
  providerName: string;
  serviceKey: string;
  serviceLabel: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  status: "pending" | "confirmed";
  hourlyRate: number;
  dailyRate: number;
  createdAt: string;
};

declare global {
  var __dellaCustomerBookings: CustomerBookingRecord[] | undefined;
}

function isWorkerdRuntime() {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent === "Cloudflare-Workers"
  );
}

async function ensureNodeDataFile() {
  const path = await import("node:path");
  const { mkdir, readFile, writeFile } = await import("node:fs/promises");
  const bookingsFile = path.join(process.cwd(), "data", "customer-bookings.json");
  const dataDir = path.dirname(bookingsFile);

  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(bookingsFile, "utf8");
  } catch {
    await writeFile(bookingsFile, "[]", "utf8");
  }
}

async function readNodeBookings() {
  const path = await import("node:path");
  const { readFile } = await import("node:fs/promises");
  const bookingsFile = path.join(process.cwd(), "data", "customer-bookings.json");
  await ensureNodeDataFile();
  const raw = await readFile(bookingsFile, "utf8");
  return JSON.parse(raw) as CustomerBookingRecord[];
}

async function writeNodeBookings(records: CustomerBookingRecord[]) {
  const path = await import("node:path");
  const { writeFile } = await import("node:fs/promises");
  const bookingsFile = path.join(process.cwd(), "data", "customer-bookings.json");
  await ensureNodeDataFile();
  await writeFile(bookingsFile, JSON.stringify(records, null, 2), "utf8");
}

function readWorkerBookings() {
  return globalThis.__dellaCustomerBookings ?? [];
}

function writeWorkerBookings(records: CustomerBookingRecord[]) {
  globalThis.__dellaCustomerBookings = records;
}

async function readBookings() {
  if (isWorkerdRuntime()) {
    return readWorkerBookings();
  }

  return readNodeBookings();
}

async function writeBookings(records: CustomerBookingRecord[]) {
  if (isWorkerdRuntime()) {
    writeWorkerBookings(records);
    return;
  }

  await writeNodeBookings(records);
}

export async function createCustomerBooking(
  payload: Omit<CustomerBookingRecord, "id" | "createdAt">
) {
  const records = await readBookings();

  const record: CustomerBookingRecord = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);
  await writeBookings(records);
  return record;
}

export async function listCustomerBookings() {
  return readBookings();
}

export async function getLatestCustomerBooking() {
  const records = await readBookings();
  return records[0] ?? null;
}
