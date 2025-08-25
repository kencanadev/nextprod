// AuditProc := paNew;
//                      AuditDesc:= 'Auto SO Approval disetujui';
//                      AuditDesc:= AuditDesc +
//                         ' item = ' + FormatFloat(',0.##;(,0.##);0',quDFpac.RecordCount) +
//                         ' nilai transaksi = ' + FormatFloat(',0.##;(,0.##);0',sTotalMU);

import moment from 'moment';
import { generateNUDivisi } from '@/utils/routines';

// const auditReqBody = {
//     entitas: kode_entitas,
//     kode_audit: null,
//     dokumen: 'AC',
//     kode_dokumen: responseAPI.data.kode_dokumen,
//     no_dokumen: noFpac,
//     tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
//     proses: 'UPDATE',
//     diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} nilai transaksi ${totalMu}`,
//     userid: userid,
//     system_user: '', //username login
//     system_ip: '', //ip address
//     system_mac: '', //mac address
//   };

export const auditReqBody = ({ entitas, dokumen, proses, diskripsi, userid, no_dokumen }: any) => {
  return {
    entitas,
    kode_audit: 'oto',
    dokumen,
    kode_dokumen: 'oto',
    no_dokumen,
    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
    proses,
    diskripsi,
    userid,
    system_user: '', //username login
    system_ip: '', //ip address
    system_mac: '', //mac address
  };
};
