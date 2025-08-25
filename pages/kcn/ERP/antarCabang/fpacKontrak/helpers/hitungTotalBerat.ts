// sTotalMU:=0;
// sTotalBerat:=0;
// quDFpac.DisableControls;
// for j:=1 to quDFpac.RecordCount do
// begin
//       sTotalMU:= sTotalMU+(quDFpacqty_std.AsFloat * quDFpacharga_jual_mu.AsFloat );
//       sTotalBerat:=sTotalBerat+(quDFpacqty_std.AsFloat * quDFpacbrt.AsFloat );
//       quDFpac.Next;
// end;

export const totalBerat = (data: Array<any>) => {
  let sTotalBerat = 0;
  for (let i = 0; i < data.length; i++) {
    sTotalBerat = sTotalBerat = data[i].qty_std * data[i].brt;
  }
  return sTotalBerat;
};
