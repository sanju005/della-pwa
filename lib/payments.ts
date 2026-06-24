export const COMPANY_COMMISSION_RATE = 0.05;

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateCommission(amount: number) {
  const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const companyCommissionAmount = roundCurrency(safeAmount * COMPANY_COMMISSION_RATE);
  const providerNetAmount = roundCurrency(safeAmount - companyCommissionAmount);

  return {
    amount: roundCurrency(safeAmount),
    companyCommissionAmount,
    providerNetAmount,
    companyCommissionRate: COMPANY_COMMISSION_RATE,
  };
}
