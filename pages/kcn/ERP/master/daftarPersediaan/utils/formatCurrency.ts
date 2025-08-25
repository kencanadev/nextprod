export const parsePriceNum = (value: string): number => {
  if (!value) return 0;
  // Remove commas (if present) and convert to number
  return parseFloat(value.replace(/,/g, ''));
};

export const parsePrice = (value: string): string => {
  if (!value) return 'Rp 0';
  // Remove commas and convert to number
  const numberValue = parseFloat(value.replace(/,/g, ''));
  // Format number to IDR currency
  return numberValue.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
  });
};
