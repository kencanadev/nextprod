import { useEffect, useState } from 'react';
import { useDataFetching } from '../../fpacKontrak/hooks/useDataFetching';
import { auditReqBody } from '../../fpacKontrak/model/audit';
import { useSession } from '@/pages/api/sessionContext';
import { generateNU, generateNUDivisi } from '@/utils/routines';
import moment from 'moment';
import { createApprovalPusat, fetchCustomerMap } from '../api';

export const useApprovalPusat = () => {
  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const userid = sessionData?.userid ?? '';
  const token = sessionData?.token ?? '';

  let status_code;

  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [masterState, setMasterState] = useState({
    // pembeli
    noFbPembeli: '',
    noPbPembeli: '',
    noPoPembeli: '',
    noPpPembeli: '',
    // penjual
    noFjPenjual: '',
    noMbPenjual: '',
    noSjPenjual: '',
    noSoPenjual: '',
    noSpmPenjual: '',
    // pusat
    noFbPusat: '',
    noFjPusat: '',
    noPbPusat: '',
    noPoPusat: '',
    noSjPusat: '',
    noSoPusat: '',
    noSpmPusat: '',
  });
  const [hargaBeliMu, setHargaBeliMu] = useState(0);
  const [hargaJualMu, setHargaJualMu] = useState(0);

  // console.log('Harga Beli MU: ', hargaBeliMu);
  // console.log('Harga Jual MU: ', hargaJualMu);

  const updateState = (field: any, value: any) => {
    setMasterState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const {
    fbCabangData,
    detailFBCabangData,
    pbCabangData,
    detailPBCabangData,
    jurnalPBPembeliData,
    poPembeliData,
    dPoPembeliData,
    ppPembeliData,
    dPpPembeliData,
    fbPusatData,
    detailFBPusatData,
    fjPusatData,
    detailFJPusatData,
    jurnalFJPusatData,
    spmPusatData,
    detailSPMPusatData,
    soPusatData,
    detailSOPusatData,
    sjPusatData,
    detailSJPusatData,
    jurnalSJPusatData,
    poPusatData,
    detailPOPusatData,
    pbPusatData,
    detailPBPusatData,
    jurnalPBPusatData,
    isLoading,
    error,
    isInitialized,
  } = useDataFetching(editData, kode_entitas, token, updateState, hargaBeliMu, hargaJualMu, 'N');

  useEffect(() => {
    if (isInitialized && !isLoading) {
      setLoading(false);
    }
  }, [isInitialized, isLoading]);

  const setEditDataFromModal = (data: any) => {
    setEditData(data);
  };

  const createPayload = async () => {
    if (!editData || !kode_entitas || !userid) {
      throw new Error('Required data is missing');
    }

    const detail = editData.detail[0];
    const totalMu = parseFloat(detail.qty_std) * hargaJualMu;
    const jumlahFb = totalMu * parseFloat(editData.kurs) - 0 * parseFloat(editData.kurs);

    const no_dokumen = await generateNUDivisi(editData.kode_entitas, '', '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + '01');

    if (!fbCabangData || !detailFBCabangData) {
      throw new Error('Required data is not yet loaded');
    }

    return {
      entitas_pembeli: editData.kode_entitas,
      pembeli: {
        fb: {
          ...fbCabangData,
          detail: [{ ...detailFBCabangData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'FB',
            proses: 'NEW',
            diskripsi: `Auto FB Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        pb: {
          ...pbCabangData,
          detail: [
            {
              ...detailPBCabangData,
            },
          ],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'PB',
            proses: 'NEW',
            diskripsi: `Auto PB dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
          jurnal: jurnalPBPembeliData,
        },
        po: {
          ...poPembeliData,
          detail: [{ ...dPoPembeliData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'SP',
            proses: 'NEW',
            diskripsi: `Auto PO dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        pp: {
          ...ppPembeliData,
          detail: [{ ...dPpPembeliData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'PO',
            proses: 'NEW',
            diskripsi: `Auto PP dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)}`,
            userid,
            no_dokumen,
          }),
        },
      },
      entitas_pusat: kode_entitas,
      pusat: {
        fb: {
          ...fbPusatData,
          detail: [{ ...detailFBPusatData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'FB',
            proses: 'NEW',
            diskripsi: `Auto FB Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        fj: {
          ...fjPusatData,
          detail: [{ ...detailFJPusatData }],
          jurnal: jumlahFb > 0 ? jurnalFJPusatData : [],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'FJ',
            proses: 'NEW',
            diskripsi: `Auto FJ item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        spm: {
          ...spmPusatData,
          detail: [{ ...detailSPMPusatData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'DO',
            proses: 'NEW',
            diskripsi: `Auto SPM item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)}`,
            userid,
            no_dokumen,
          }),
        },
        so: {
          ...soPusatData,
          detail: [{ ...detailSOPusatData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'SO',
            proses: 'NEW',
            diskripsi: `Auto SO Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        sj: {
          ...sjPusatData,
          detail: [{ ...detailSJPusatData }],
          jurnal: jurnalSJPusatData,
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'SJ',
            proses: 'NEW',
            diskripsi: `Auto SJ item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        po: {
          ...poPusatData,
          detail: [{ ...detailPOPusatData }],
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'SP',
            proses: 'NEW',
            diskripsi: `Auto PO dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
        pb: {
          ...pbPusatData,
          detail: [{ ...detailPBPusatData }],
          jurnal: jurnalPBPusatData,
          audit: auditReqBody({
            entitas: kode_entitas,
            dokumen: 'PB',
            proses: 'NEW',
            diskripsi: `Auto PB dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
            userid,
            no_dokumen,
          }),
        },
      },
    };
  };

  const handleSave = async () => {
    try {
      if (loading || !isInitialized) {
        throw new Error('Data is still loading');
      }

      const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
      const payload = await createPayload();
      //   console.log(payload);
      const res = await createApprovalPusat(payload, token);

      if (res.status) {
        // pembeli
        await generateNU(editData.kode_entitas, masterState.noFbPembeli, '03', moment().format('YYYYMM'));
        await generateNU(editData.kode_entitas, masterState.noPbPembeli, '04', moment().format('YYYYMM')); // pb
        await generateNU(editData.kode_entitas, masterState.noPoPembeli, '02', moment().format('YYYYMM')); // po/sp
        await generateNU(editData.kode_entitas, masterState.noPpPembeli, '01', moment().format('YYYYMM')); // pp/fix
        // pusat
        await generateNU(kode_entitas, masterState.noFbPusat, '03', moment().format('YYYYMM'));
        await generateNUDivisi(kode_entitas, masterState.noFjPusat, cust[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // fj
        await generateNU(kode_entitas, masterState.noPbPusat, '04', moment().format('YYYYMM')); // pb
        await generateNU(kode_entitas, masterState.noPoPusat, '02', moment().format('YYYYMM')); // po/sp
        await generateNUDivisi(kode_entitas, masterState.noSjPusat, cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // sj
        await generateNUDivisi(kode_entitas, masterState.noSoPusat, cust[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // so
        await generateNUDivisi(kode_entitas, masterState.noSpmPusat, cust[0].kode_jual_antar_cabang, '11', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // spm/do
      }

      return res.status;
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return {
    handleSave,
    setEditDataFromModal,
    editData,
    isLoading,
    error,
    status_code,
    loading,
    setHargaBeliMu,
    hargaBeliMu,
    setHargaJualMu,
    hargaJualMu,
  };
};
