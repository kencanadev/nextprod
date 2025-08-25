// Helper function to calculate totals
const calculateTotals = (qty_std: any, harga_mu: any) => {
  const jumlah = qty_std * harga_mu;
  return {
    jumlah_mu: jumlah,
    jumlah_rp: jumlah,
  };
};

export const hitungTotalDebet = (qty: any, hpp: any) => {
  let n = 0;
  return n + qty * hpp;
};
