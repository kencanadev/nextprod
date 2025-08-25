import { useSession } from '@/pages/api/sessionContext';
import { useState } from 'react';
import moment from 'moment';
import { generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import { createPembatalanFpacPusat } from '../api';

export const usePembatalanPusat = (data: any) => {
  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const userid = sessionData?.userid ?? '';
  const token = sessionData?.token ?? '';

  const [masterData, setMasterData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(false);

  // const createPayload = async () => {
  //   const dataPusat = await fetchDataPembatalan({ entitas: kode_entitas, param1: 'pusat', param2: data.no_fpac, param3: userid, token });
  //   const dataPenjual = await fetchDataPembatalan({ entitas: '100', param1: 'penjual', param2: data.no_fpac, param3: userid, token });
  //   const dataPembeli = await fetchDataPembatalan({ entitas: '605', param1: 'pembeli', param2: data.no_fpac, param3: userid, token });
  //   const kode_cust_mk = dataPusat?.mk?.master.length > 0 ? dataPusat?.mk?.master?.[0].kode_cust : '';
  //   const kodeAkun = await fetchSettingAkun({ entitas: kode_entitas, token });
  //   const akunFBMPiutang = await fetchAkunFBM({ kode_entitas, token, kode_cust: kode_cust_mk });
  //   const akunFBMPajakJual = await getKodeAkunJual({ entitas: kode_entitas, token, kode_cust: kode_cust_mk });

  //   return {
  //     pusat: {
  //       ttb: {
  //         ...createTTBPusatPaylpad(dataPusat),
  //         detail: [createDTTBPusatPayload(dataPusat)],
  //         jurnal: createJTTBPusatPayload(dataPusat),
  //       },
  //       mpb: {
  //         ...createMPBPusatPayload(dataPusat),
  //         detail: createDMPBPusatPayload(dataPusat),
  //         jurnal: createJMPBPusatPayload(dataPusat),
  //       },
  //       mk: {
  //         ...createMKPusatPayload(dataPusat),
  //         detail: [createDMKPusatPayload(dataPusat)],
  //         jurnal: createJMKPusatPayload(dataPusat, kodeAkun, akunFBMPiutang, akunFBMPajakJual),
  //       },
  //     },
  //     pembeli: {
  //       mpb: {
  //         ...createMPBPembeliPayload(dataPembeli),
  //         detail: [createDMPBPembeliPayload(dataPembeli)],
  //         jurnal: createJMPBPembeliPayload(dataPembeli),
  //       },
  //     },
  //     penjual: {
  //       mb: {
  //         ...createMBPenjualPayload(dataPenjual),
  //         detail: [createDMBPenjualPayload(dataPenjual)],
  //         jurnal: createJMBPenjualPayload(dataPenjual),
  //       },
  //       mk: {
  //         ...createMKPenjualPayload(),
  //         detail: [createDMKPenjualPayload()],
  //         jurnal: createJMKPenjualPayload(dataPenjual),
  //       },
  //       ttb: {
  //         ...createTTBPenjualPayload(dataPenjual),
  //         detail: [createDTTBPenjualPayload(dataPenjual)],
  //         jurnal: createJTTBPenjualPayload(dataPenjual),
  //       },
  //     },
  //   };
  // };

  const handleBatalClick = async () => {
    try {
      setIsLoading(true);
      // Pusat
      const noTtbPusat = await generateNUDivisi(kode_entitas, '', 'AC', '08', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
      const noMkPusat = await generateNUDivisi(kode_entitas, '', 'AC', '15', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
      const noMpbPusat = await generateNU(kode_entitas, '', '07', moment().format('YYYYMM'));
      // Penjual
      const noMpbPenjual = await generateNU(masterData.entitas_cabang_jual, '', '07', moment().format('YYYYMM'));
      const noMkPenjual = await generateNUDivisi(masterData.entitas_cabang_jual, '', 'AC', '15', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
      const noTtbPenjual = await generateNUDivisi(masterData.entitas_cabang_jual, '', 'AC', '08', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
      // Pembeli
      const noMpbPembeli = await generateNU(masterData.kode_entitas, '', '07', moment().format('YYYYMM'));

      const dateBatal = moment().format('YYYY-MM-DD HH:mm:ss');
      const payload = {
        entitas_pusat: kode_entitas,
        entitas_penjual: masterData.entitas_cabang_jual,
        entitas_pembeli: masterData.kode_entitas,
        DBExport_kodeFPAC: masterData.kode_fpac,
        DBExport_nomorFPAC: masterData.no_fpac,
        DBExport_noreffFPAC: masterData.no_reff,
        DBExport_tanggalFPAC: moment().format('DD-MM-YYYY'),
        DBExport_tanggalMPBFPAC: moment().add(5, 's').format('DD-MM-YYYY HH:mm:ss'),
        DBExport_UpdateFPAC: moment().format('DD-MM-YYYY HH:mm:ss'),
        DBExport_UpdateUserId: userid,
        DBExport_KodeGudangBeli: masterData.kode_gudang_beli,
        DBExport_KodeGudangJual: masterData.kode_gudang_jual,
        resetTimePusat: await ResetTime(kode_entitas, dateBatal),
        resetTimeBeli: await ResetTime(masterData.kode_entitas, dateBatal),
        resetTimePenjual: await ResetTime(masterData.entitas_cabang_jual, dateBatal),
        fpac: 'Non-Kontrak',
        no_dokumen: [
          {
            no_ttb_pusat: noTtbPusat,
            no_mk_pusat: noMkPusat,
            no_mpb_pusat: noMpbPusat,
            no_mpb_beli: noMpbPembeli,
            no_ttb_penjual: noTtbPenjual,
            no_mk_penjual: noMkPenjual,
            no_mpb_penjual: noMpbPenjual,
            no_audit_ttb_pusat: noTtbPusat,
            no_audit_mk_pusat: noMkPusat,
            no_audit_mpb_pusat: noMpbPusat,
            no_audit_mpb_beli: noMpbPembeli,
            no_audit_ttb_penjual: noTtbPenjual,
            no_audit_mk_penjual: noMkPenjual,
            no_audit_mpb_penjual: noMpbPenjual,
          },
        ],
      };

      //   console.log(payload);

      const res = await createPembatalanFpacPusat(payload, token);
      if (res.status) {
        // Pusat
        await generateNUDivisi(kode_entitas, noTtbPusat, 'AC', '08', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
        await generateNUDivisi(kode_entitas, noMkPusat, 'AC', '15', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
        await generateNU(kode_entitas, noMpbPusat, '07', moment().format('YYYYMM'));
        // Penjual
        await generateNU(masterData.entitas_cabang_jual, noMpbPenjual, '07', moment().format('YYYYMM'));
        await generateNUDivisi(masterData.entitas_cabang_jual, noMkPenjual, 'AC', '15', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
        await generateNUDivisi(masterData.entitas_cabang_jual, noTtbPenjual, 'AC', '08', moment().format('YYYYMM'), moment().format('YYMM') + 'AC');
        // Pembeli
        await generateNU(masterData.kode_entitas, noMpbPembeli, '07', moment().format('YYYYMM'));
      }
      setStatus(true);
    } catch (error) {
      setIsLoading(false);
      setStatus(false);
      console.error('Error saat melakukan pembatalan FPAC Kontrak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleBatalClick,
    setMasterData,
    isLoading,
    status,
  };
};
