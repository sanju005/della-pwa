const PAYMENT_DETAILS_PREFIX = "PAYMENT_DETAILS::";
const PAYMENT_BREAKDOWN_PREFIX = "PAYMENT_BREAKDOWN::";

export type PaymentBreakdownRow = {
  description: string;
  amount: number;
};

export type PaymentAdjustmentDetails = {
  baseAmount: number;
  finalAmount: number;
  additionalCharge: number;
  chargeDescription: string;
  note: string;
  rows?: PaymentBreakdownRow[];
  discountAmount?: number;
};

export function buildPaymentAdjustmentNote(details: PaymentAdjustmentDetails) {
  return `${PAYMENT_DETAILS_PREFIX}${JSON.stringify(details)}`;
}

export function parsePaymentAdjustmentNote(note: string | null | undefined) {
  const trimmed = note?.trim() ?? "";

  if (trimmed.startsWith(PAYMENT_BREAKDOWN_PREFIX)) {
    try {
      const parsed = JSON.parse(
        trimmed.slice(PAYMENT_BREAKDOWN_PREFIX.length)
      ) as PaymentAdjustmentDetails;

      if (
        typeof parsed.baseAmount !== "number" ||
        typeof parsed.finalAmount !== "number" ||
        typeof parsed.note !== "string"
      ) {
        return null;
      }

      return {
        baseAmount: parsed.baseAmount,
        finalAmount: parsed.finalAmount,
        additionalCharge:
          typeof parsed.additionalCharge === "number"
            ? parsed.additionalCharge
            : (parsed.rows ?? [])
                .slice(1)
                .reduce((sum, row) => sum + (typeof row.amount === "number" ? row.amount : 0), 0),
        chargeDescription: parsed.chargeDescription ?? "",
        note: parsed.note,
        rows: Array.isArray(parsed.rows)
          ? parsed.rows
              .filter(
                (row) =>
                  typeof row?.description === "string" &&
                  typeof row?.amount === "number" &&
                  Number.isFinite(row.amount)
              )
              .map((row) => ({
                description: row.description.trim(),
                amount: row.amount,
              }))
          : [],
        discountAmount:
          typeof parsed.discountAmount === "number" ? parsed.discountAmount : 0,
      };
    } catch {
      return null;
    }
  }

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
  const trimmed = note?.trim() ?? "";
  return trimmed.startsWith(PAYMENT_DETAILS_PREFIX) || trimmed.startsWith(PAYMENT_BREAKDOWN_PREFIX);
}

export function buildPaymentBreakdownNote(details: PaymentAdjustmentDetails) {
  return `${PAYMENT_BREAKDOWN_PREFIX}${JSON.stringify(details)}`;
}
