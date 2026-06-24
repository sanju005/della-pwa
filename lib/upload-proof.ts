export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;

export function isPaymentProofMimeType(value: string) {
  return (
    value === "application/pdf" ||
    value === "image/jpeg" ||
    value === "image/png" ||
    value === "image/jpg" ||
    value === "image/gif" ||
    value === "image/webp"
  );
}

export async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}
