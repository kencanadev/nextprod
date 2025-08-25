// sTotalMU:=0;
// sTotalBerat:=0;
// quDFpac.DisableControls;
// for j:=1 to quDFpac.RecordCount do
// begin
//       sTotalMU:= sTotalMU+(quDFpacqty_std.AsFloat * quDFpacharga_jual_mu.AsFloat );
//       sTotalBerat:=sTotalBerat+(quDFpacqty_std.AsFloat * quDFpacbrt.AsFloat );
//       quDFpac.Next;
// end;

export const totalMU = (data: Array<any>) => {
  let totalMu = 0;
  for (let i = 0; i < data.length; i++) {
    totalMu = totalMu + data[i].qty_std * data[i].harga_jual_mu;
  }
  return totalMu;
};
