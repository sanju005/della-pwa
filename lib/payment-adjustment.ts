const PAYMENT_DETAILS_PREFIX = "PAYMENT_DETAILS::";

export type PaymentAdjustmentDetails = {
  baseAmount: number;
  finalAmount: number;
  additionalCharge: number;
  chargeDescription: string;
  note: string;
};

export function buildPaymentAdjustmentNote(details: PaymentAdjustmentDetails) {
  return `${PAYMENT_DETAILS_PREFIX}${JSON.stringify(details)}`;
}

export function parsePaymentAdjustmentNote(note: string | null | undefined) {
  const trimmed = note?.trim() ?? "";

  if (!trimmed.startsWith(PAYMENT_DETAILS_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      trimmed.slice(PAYMENT_DETAILS_PREFIX.length)
    ) as PaymentAdjustmentDetails;

    if (
      typeof parsed.baseAmount !== "number" ||
      typeof parsed.finalAmount !== "number" ||
      typeof parsed.additionalCharge !== "number" ||
      typeof parsed.chargeDescription !== "string" ||
      typeof parsed.note !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isPaymentAdjustmentNote(note: string | null | undefined) {
  return (note?.trim() ?? "").startsWith(PAYMENT_DETAILS_PREFIX);
}
