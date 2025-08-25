import { generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportPPCabang = {
  kode_pp: 'oto',
  no_pp: '',
  tgl_pp: '', // Will be set by BackTime_Cabang_Beli
  dokumen: 'Persediaan',
  peminta: '', // Will be set to UserId
  kode_dept: '', // From kode_dept_pembelian_cabang
  keterangan: '', // 'No FPAC : '+ quMFpacno_fpac.AsString+'- Beli dari Ent '+quMFpacentitas_cabang_jual.AsString;
  status: 'Terbuka',
  userid: '',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  approval: 'Y',
  tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
};

export const createPPPembeliPayload = async (editData: any, tgl: any, kode_entitas: any, token: any, updateState: any, tipe: string) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  // const noPp = await generateNUDivisi(editData.kode_entitas, '', '01', '01', moment().format('YYYYMM'), moment().format('YYMM') + '01');
  const noPp = await generateNU(editData.kode_entitas, '', '01', moment().format('YYYYMM'));
  updateState('noPpPembeli', noPp);

  const keterangan =
    tipe === 'Y'
      ? `No FPAC : ${editData.no_fpac} - Beli dari Ent ${editData.entitas_cabang_jual}`
      : `No FPAC : ${editData.no_fpac}- Beli dari Ent ${editData.entitas_cabang_jual} - ${editData.keterangan}`;

  const payload: any = {
    ...quExportPPCabang,
    no_pp: noPp,
    tgl_pp: tgl,
    peminta: editData.userid,
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    userid: editData.userid,
    keterangan,
  };

  return payload;
};
