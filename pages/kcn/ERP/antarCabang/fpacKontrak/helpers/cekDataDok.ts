import { cekDataDiDatabase } from '@/utils/global/fungsi';
import { generateNofakturFB, generateNU, generateNUDivisi } from '@/utils/routines';
import moment from 'moment';

export const cekDataDok = async (data: any) => {
    const {
        // Pusat
        kode_entitas,
        token,
        cust,
        noFbPusat,
        noFjPusat,
        noPbPusat,
        noPoPusat,
        noSjPusat,
        noSoPusat,
        noSpmPusat,
        // Pembeli
        entitas_beli,
        noFbPembeli,
        noPbPembeli,
        noPoPembeli,
        noPpPembeli,
        // Penjual
        custJual,
        entitas_jual,
        noFjPenjual,
        noMbPenjual,
        noSjPenjual,
        noSoPenjual,
        noSpmPenjual,
    } = data;
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const dataPusat = {
        noFb: '',
        noFj: '',
        noPb: '',
        noPo: '',
        noSj: '',
        noSo: '',
        noSpm: '',
    };

    const dataPembeli = {
        noFb: '',
        noPb: '',
        noPo: '',
        noPp: '',
    };

    const dataPenjual = {
        noFj: '',
        noMb: '',
        noSj: '',
        noSo: '',
        noSpm: '',
    };

    // Pusat
    // === FB ===
    if (noFbPusat) {
        const cekDataFb = await cekDataDiDatabase(kode_entitas, 'tb_m_fb', 'no_fb', noFbPusat, token);
        if (cekDataFb) {
            const noLpb = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
            const newNoFb = await generateNofakturFB(apiUrl, kode_entitas, noLpb);
            dataPusat.noFb = newNoFb;
        } else {
            dataPusat.noFb = noFbPusat;
        }
    }

    // === FJ ===
    if (noFjPusat) {
        const cekDataFj = await cekDataDiDatabase(kode_entitas, 'tb_m_fj', 'no_fj', noFjPusat, token);
        if (cekDataFj) {
            const newNoFj = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
            dataPusat.noFj = newNoFj;
        } else {
            dataPusat.noFj = noFjPusat;
        }
    }

    // === PB ===
    if (noPbPusat) {
        const cekDataPb = await cekDataDiDatabase(kode_entitas, 'tb_m_lpb', 'no_lpb', noPbPusat, token);
        if (cekDataPb) {
            const newNoLpb = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
            dataPusat.noPb = newNoLpb;
        } else {
            dataPusat.noPb = noPbPusat;
        }
    }

    // === PO ===
    if (noPoPusat) {
        const cekDataPo = await cekDataDiDatabase(kode_entitas, 'tb_m_sp', 'no_sp', noPoPusat, token);
        if (cekDataPo) {
            const newNoPo = await generateNU(kode_entitas, '', '02', moment().format('YYYYMM'));
            dataPusat.noPo = newNoPo;
        } else {
            dataPusat.noPo = noPoPusat;
        }
    }

    // === SJ ===
    if (noSjPusat) {
        const cekDataSj = await cekDataDiDatabase(kode_entitas, 'tb_m_sj', 'no_sj', noSjPusat, token);
        if (cekDataSj) {
            const newNoSj = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
            dataPusat.noSj = newNoSj;
        } else {
            dataPusat.noSj = noSjPusat;
        }
    }

    // === SO ===
    if (noSoPusat) {
        const cekDataSo = await cekDataDiDatabase(kode_entitas, 'tb_m_so', 'no_so', noSoPusat, token);
        if (cekDataSo) {
            const newNoSo = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
            dataPusat.noSo = newNoSo;
        } else {
            dataPusat.noSo = noSoPusat;
        }
    }

    // === SPM / DO ===
    if (noSpmPusat) {
        const cekDataSpm = await cekDataDiDatabase(kode_entitas, 'tb_m_do', 'no_do', noSpmPusat, token);
        if (cekDataSpm) {
            const newNoSpm = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '11', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
            dataPusat.noSpm = newNoSpm;
        } else {
            dataPusat.noSpm = noSpmPusat;
        }
    }

    // Pembeli
    // === FB ===
    if (noFbPembeli) {
        const cekDataFb = await cekDataDiDatabase(entitas_beli, 'tb_m_fb', 'no_fb', noFbPembeli, token);
        if (cekDataFb) {
            const noLpb = await generateNU(entitas_beli, '', '04', moment().format('YYYYMM'));
            const newNoFb = await generateNofakturFB(apiUrl, entitas_beli, noLpb);
            dataPembeli.noFb = newNoFb;
        } else {
            dataPembeli.noFb = noFbPembeli;
        }
    }
    // === PB ===
    if (noPbPembeli) {
        const cekDataPb = await cekDataDiDatabase(entitas_beli, 'tb_m_lpb', 'no_lpb', noPbPembeli, token);
        if (cekDataPb) {
            const newNoLpb = await generateNU(entitas_beli, '', '04', moment().format('YYYYMM'));
            dataPembeli.noPb = newNoLpb;
        } else {
            dataPembeli.noPb = noPbPembeli;
        }
    }
    // === PO ===
    if (noPoPembeli) {
        const cekDataPo = await cekDataDiDatabase(entitas_beli, 'tb_m_sp', 'no_sp', noPoPembeli, token);
        if (cekDataPo) {
            const newNoPo = await generateNU(entitas_beli, '', '02', moment().format('YYYYMM'));
            dataPembeli.noPo = newNoPo;
        } else {
            dataPembeli.noPo = noPoPembeli;
        }
    }
    // === PP ===
    if (noPpPembeli) {
        const cekDataPp = await cekDataDiDatabase(entitas_beli, 'tb_m_pp', 'no_pp', noPpPembeli, token);
        if (cekDataPp) {
            const newNoPp = await generateNU(entitas_beli, '', '01', moment().format('YYYYMM'));
            dataPembeli.noPp = newNoPp;
        } else {
            dataPembeli.noPp = noPpPembeli;
        }
    }

    // Penjual
    // === FJ ===
    if (noFjPenjual) {
        const cekDataFj = await cekDataDiDatabase(entitas_jual, 'tb_m_fj', 'no_fj', noFjPenjual, token);
        if (cekDataFj) {
            const newNoFj = await generateNUDivisi(entitas_jual, '', custJual[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + custJual[0].kode_jual_antar_cabang);
            dataPenjual.noFj = newNoFj;
        } else {
            dataPenjual.noFj = noFjPenjual;
        }
    }
    // === MB ===
    if (noMbPenjual) {
        const cekDataMb = await cekDataDiDatabase(entitas_jual, 'tb_m_mb', 'no_mb', noMbPenjual, token);
        if (cekDataMb) {
            const newNoMb = await generateNU(entitas_jual, '', '23', moment().format('YYYYMM'));
            dataPenjual.noMb = newNoMb;
        } else {
            dataPenjual.noMb = noMbPenjual;
        }
    }
    // === SJ ===
    if (noSjPenjual) {
        const cekDataSj = await cekDataDiDatabase(entitas_jual, 'tb_m_sj', 'no_sj', noSjPenjual, token);
        if (cekDataSj) {
            const newNoSj = await generateNUDivisi(entitas_jual, '', custJual[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + custJual[0].kode_jual_antar_cabang);
            dataPenjual.noSj = newNoSj;
        } else {
            dataPenjual.noSj = noSjPenjual;
        }
    }
    // === SO ===
    if (noSoPenjual) {
        const cekDataSo = await cekDataDiDatabase(entitas_jual, 'tb_m_so', 'no_so', noSoPenjual, token);
        if (cekDataSo) {
            const newNoSo = await generateNUDivisi(entitas_jual, '', custJual[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + custJual[0].kode_jual_antar_cabang);
            dataPenjual.noSo = newNoSo;
        } else {
            dataPenjual.noSo = noSoPenjual;
        }
    }
    // === SPM / DO ===
    if (noSpmPenjual) {
        const cekDataSpm = await cekDataDiDatabase(entitas_jual, 'tb_m_do', 'no_do', noSpmPenjual, token);
        if (cekDataSpm) {
            const newNoSpm = await generateNUDivisi(
                entitas_jual,
                '',
                custJual[0].kode_jual_antar_cabang,
                '11',
                moment().format('YYYYMM'),
                moment().format('YYMM') + custJual[0].kode_jual_antar_cabang
            );
            dataPenjual.noSpm = newNoSpm;
        } else {
            dataPenjual.noSpm = noSpmPenjual;
        }
    }

    return {
        dataPusat,
        dataPembeli,
        dataPenjual,
    };
};
