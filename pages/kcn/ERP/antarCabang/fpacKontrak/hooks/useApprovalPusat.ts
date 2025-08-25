import { useEffect, useState } from 'react';
import { useDataFetching } from './useDataFetching';
import { auditReqBody } from '../model/audit';
import { useSession } from '@/pages/api/sessionContext';
import { generateNU, generateNUDivisi } from '@/utils/routines';
import moment from 'moment';
import { createApprovalPusat, fetchCustomerMap } from '../api';
import { cekDataDok } from '../helpers/cekDataDok';

export const useApprovalPusat = () => {
    const { sessionData } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const token = sessionData?.token ?? '';

    let status_code;

    const [editData, setEditData] = useState<any>({});
    const [tokenRedis, setTokenRedis] = useState('');
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
    const [hargaMu, setHargaMu] = useState(0);
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
        soPenjualData,
        dSoPenjualData,
        spmPenjualData,
        dSpmPenjualData,
        sjPenjualData,
        dSjPenjualData,
        jSjPenjualData,
        mbPenjualData,
        dMbPenjualData,
        jMbPenjualData,
        fjPenjualData,
        dFjPenjualData,
        jFjPenjualData,
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
    } = useDataFetching(editData, kode_entitas, token, updateState, hargaBeliMu, hargaJualMu, hargaMu, 'Y');

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
            jumlahFb,
            pembeli: {
                fb: {
                    ...fbCabangData,
                    detail: [...detailFBCabangData],
                    audit: auditReqBody({
                        entitas: editData.kode_entitas,
                        dokumen: 'FB',
                        proses: 'NEW',
                        diskripsi: `Auto FB Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: fbCabangData.no_fb,
                    }),
                },
                pb: {
                    ...pbCabangData,
                    detail: [...detailPBCabangData],
                    audit: auditReqBody({
                        entitas: editData.kode_entitas,
                        dokumen: 'PB',
                        proses: 'NEW',
                        diskripsi: `Auto PB dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: pbCabangData.no_lpb,
                    }),
                    jurnal: jurnalPBPembeliData,
                },
                po: {
                    ...poPembeliData,
                    detail: [...dPoPembeliData],
                    audit: auditReqBody({
                        entitas: editData.kode_entitas,
                        dokumen: 'SP',
                        proses: 'NEW',
                        diskripsi: `Auto PO dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: poPembeliData.no_sp,
                    }),
                },
                pp: {
                    ...ppPembeliData,
                    detail: [...dPpPembeliData],
                    audit: auditReqBody({
                        entitas: editData.kode_entitas,
                        dokumen: 'PO',
                        proses: 'NEW',
                        diskripsi: `Auto PP dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)}`,
                        userid,
                        no_dokumen: ppPembeliData.no_pp,
                    }),
                },
            },
            entitas_penjual: editData.entitas_cabang_jual,
            penjual: {
                so: {
                    ...soPenjualData,
                    detail: [{ ...dSoPenjualData }],
                    audit: auditReqBody({
                        entitas: editData.entitas_cabang_jual,
                        dokumen: 'SO',
                        proses: 'NEW',
                        diskripsi: `Auto SO Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: soPenjualData.no_so,
                    }),
                },
                spm: {
                    ...spmPenjualData,
                    detail: [{ ...dSpmPenjualData }],
                    audit: auditReqBody({
                        entitas: editData.entitas_cabang_jual,
                        dokumen: 'DO',
                        proses: 'NEW',
                        diskripsi: `Auto SPM item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)}`,
                        userid,
                        no_dokumen: spmPenjualData.no_do,
                    }),
                },
                sj: {
                    ...sjPenjualData,
                    detail: [{ ...dSjPenjualData }],
                    jurnal: jSjPenjualData,
                    audit: auditReqBody({
                        entitas: editData.entitas_cabang_jual,
                        dokumen: 'SJ',
                        proses: 'NEW',
                        diskripsi: `Auto SJ item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: sjPenjualData.no_sj,
                    }),
                },
                // mb: {
                //   ...mbPenjualData,
                //   detail: [{ ...dMbPenjualData }],
                //   jurnal: jMbPenjualData,
                //   audit: auditReqBody({
                //     entitas: editData.entitas_cabang_jual,
                //     dokumen: 'MB',
                //     proses: 'NEW',
                //     diskripsi: `Auto MB dan Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                //     userid,
                //     no_dokumen: mbPenjualData.no_mb,
                //   }),
                // },
                fj: {
                    ...fjPenjualData,
                    detail: [{ ...dFjPenjualData }],
                    jurnal: jumlahFb > 0 ? jFjPenjualData : [],
                    audit: auditReqBody({
                        entitas: editData.entitas_cabang_jual,
                        dokumen: 'FJ',
                        proses: 'NEW',
                        diskripsi: `Auto FJ item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: fjPenjualData.no_fj,
                    }),
                },
            },
            entitas_pusat: kode_entitas,
            pusat: {
                fb: {
                    ...fbPusatData,
                    detail: [...detailFBPusatData],
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'FB',
                        proses: 'NEW',
                        diskripsi: `Auto FB Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: fbPusatData.no_fb,
                    }),
                },
                fj: {
                    ...fjPusatData,
                    detail: [...detailFJPusatData],
                    jurnal: jumlahFb > 0 ? jurnalFJPusatData : [],
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'FJ',
                        proses: 'NEW',
                        diskripsi: `Auto FJ item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: fjPusatData.no_fj,
                    }),
                },
                spm: {
                    ...spmPusatData,
                    detail: [...detailSPMPusatData],
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'DO',
                        proses: 'NEW',
                        diskripsi: `Auto SPM item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)}`,
                        userid,
                        no_dokumen: spmPusatData.no_do,
                    }),
                },
                so: {
                    ...soPusatData,
                    detail: [...detailSOPusatData],
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'SO',
                        proses: 'NEW',
                        diskripsi: `Auto SO Approval disetujui item = ${editData.detail.length} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: soPusatData.no_so,
                    }),
                },
                sj: {
                    ...sjPusatData,
                    detail: [...detailSJPusatData],
                    jurnal: jurnalSJPusatData,
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'SJ',
                        proses: 'NEW',
                        diskripsi: `Auto SJ item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: sjPusatData.no_sj,
                    }),
                },
                po: {
                    ...poPusatData,
                    detail: [...detailPOPusatData],
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'SP',
                        proses: 'NEW',
                        diskripsi: `Auto PO dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: poPusatData.no_sp,
                    }),
                },
                pb: {
                    ...pbPusatData,
                    detail: [...detailPBPusatData],
                    jurnal: jurnalPBPusatData,
                    audit: auditReqBody({
                        entitas: kode_entitas,
                        dokumen: 'PB',
                        proses: 'NEW',
                        diskripsi: `Auto PB dan Approval disetujui item = ${editData.detail.length} total berat = ${parseFloat(editData.total_berat)} nilai transaksi ${parseFloat(editData.total_mu)}`,
                        userid,
                        no_dokumen: pbPusatData.no_lpb,
                    }),
                },
            },
            token: tokenRedis,
        };
    };

    function replaceWithMaxSuffix(codes: string[]): string[] {
        // Ekstrak suffix (angka terakhir) dari setiap kode
        const suffixes = codes.map((code) => code.split('.').pop() || '00000');

        // Cari nilai terbesar, ubah jadi string dengan padding 0
        const maxSuffix = Math.max(...suffixes.map(Number))
            .toString()
            .padStart(5, '0');

        // Ganti semua suffix dengan nilai terbesar
        return codes.map((code) => {
            const parts = code.split('.');
            parts[parts.length - 1] = maxSuffix;
            return parts.join('.');
        });
    }

    const handleSave = async () => {
        try {
            if (loading || !isInitialized) {
                throw new Error('Data is still loading');
            }

            const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
            const custJual = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
            const payload = await createPayload();
            // console.log(payload);
            const dataDok = {
                kode_entitas: kode_entitas,
                token: token,
                cust: cust,
                custJual: custJual,
                // Pusat
                noFbPusat: masterState.noFbPusat,
                noFjPusat: masterState.noFjPusat,
                noPbPusat: masterState.noPbPusat,
                noPoPusat: masterState.noPoPusat,
                noSjPusat: masterState.noSjPusat,
                noSoPusat: masterState.noSoPusat,
                noSpmPusat: masterState.noSpmPusat,
                // Pembeli
                entitas_beli: editData.kode_entitas,
                noFbPembeli: masterState.noFbPembeli,
                noPbPembeli: masterState.noPbPembeli,
                noPoPembeli: masterState.noPoPembeli,
                noPpPembeli: masterState.noPpPembeli,
                // Penjual
                entitas_jual: editData.entitas_cabang_jual,
                noFjPenjual: masterState.noFjPenjual,
                noMbPenjual: masterState.noMbPenjual,
                noSjPenjual: masterState.noSjPenjual,
                noSoPenjual: masterState.noSoPenjual,
                noSpmPenjual: masterState.noSpmPenjual,
            };
            const result = await cekDataDok(dataDok);
            // PUSAT
            const arrayPusatbeli = [result.dataPusat.noPb, result.dataPusat.noFb];
            const resultOneToOnePusatBeli = replaceWithMaxSuffix(arrayPusatbeli);

            payload.pusat.po.no_sp = payload.pusat.po.no_sp;
            // payload.pusat.pb.no_lpb = payload.pusat.pb.no_lpb;
            // payload.pusat.fb.no_fb = payload.pusat.fb.no_fb;
            //  payload.pusat.po.no_sp = resultOneToOnePusatBeli[0];
            payload.pusat.pb.no_lpb = resultOneToOnePusatBeli[0];
            payload.pusat.fb.no_fb = resultOneToOnePusatBeli[1];

            const arrayPusatJual = [result.dataPusat.noSo, result.dataPusat.noSpm, result.dataPusat.noSj, result.dataPusat.noFj];
            const resultOneToOnePusatJual = replaceWithMaxSuffix(arrayPusatJual);
            // payload.pusat.so.no_so = payload.pusat.so.no_so;
            // payload.pusat.spm.no_do = payload.pusat.spm.no_do;
            // payload.pusat.sj.no_sj = payload.pusat.sj.no_sj;
            // payload.pusat.fj.no_fj = payload.pusat.fj.no_fj;
            payload.pusat.so.no_so = resultOneToOnePusatJual[0];
            payload.pusat.spm.no_do = resultOneToOnePusatJual[1];
            payload.pusat.sj.no_sj = resultOneToOnePusatJual[2];
            payload.pusat.fj.no_fj = resultOneToOnePusatJual[3];

            // PENJUAL
            const arrayPenjual = [result.dataPenjual.noSo, result.dataPenjual.noSpm, result.dataPenjual.noSj, result.dataPenjual.noFj];
            // Ganti semua kode dengan suffix terbesar
            const resultOneToOnePenjual = replaceWithMaxSuffix(arrayPenjual);

            // console.log('resultOneToOnePenjual', resultOneToOnePenjual);
            // payload.penjual.so.no_so = payload.penjual.so.no_so;
            // payload.penjual.spm.no_do = result.dataPenjual.noSpm;
            // payload.penjual.sj.no_sj = result.dataPenjual.noSj;
            // payload.penjual.fj.no_fj = result.dataPenjual.noFj;

            payload.penjual.so.no_so = resultOneToOnePenjual[0];
            payload.penjual.spm.no_do = resultOneToOnePenjual[1];
            payload.penjual.sj.no_sj = resultOneToOnePenjual[2];
            payload.penjual.fj.no_fj = resultOneToOnePenjual[3];

            const arrayPembeli = [result.dataPembeli.noPb, result.dataPembeli.noFb];
            const resultOneToOnePembeli = replaceWithMaxSuffix(arrayPembeli);
            // PEMBELI
            payload.pembeli.pp.no_pp = result.dataPembeli.noPp;
            payload.pembeli.po.no_sp = result.dataPembeli.noPo;
            // payload.pembeli.pb.no_lpb = result.dataPembeli.noPb;
            // payload.pembeli.fb.no_fb = result.dataPembeli.noFb;

            // payload.pembeli.pp.no_pp = resultOneToOnePembeli[0];
            // payload.pembeli.po.no_sp = resultOneToOnePembeli[1];
            payload.pembeli.pb.no_lpb = resultOneToOnePembeli[0];
            payload.pembeli.fb.no_fb = resultOneToOnePembeli[1];

            console.log('payload', payload);

            const res = await createApprovalPusat(payload, token);

            if (res.status) {
                // pembeli
                await generateNU(editData.kode_entitas, payload.pembeli.fb.no_fb, '03', moment().format('YYYYMM'));
                await generateNU(editData.kode_entitas, payload.pembeli.pb.no_lpb, '04', moment().format('YYYYMM')); // pb
                await generateNU(editData.kode_entitas, payload.pembeli.po.no_sp, '02', moment().format('YYYYMM')); // po/sp
                await generateNU(editData.kode_entitas, payload.pembeli.pp.no_pp, '01', moment().format('YYYYMM')); // pp/fix
                // penjual
                await generateNUDivisi(
                    editData.entitas_cabang_jual,
                    payload.penjual.fj.no_fj,
                    custJual[0].kode_jual_antar_cabang,
                    '13',
                    moment().format('YYYYMM'),
                    moment().format('YYMM') + custJual[0].kode_jual_antar_cabang
                ); // fj
                // await generateNU(editData.entitas_cabang_jual, masterState.noMbPenjual, '23', moment().format('YYYYMM')); // mb
                await generateNUDivisi(
                    editData.entitas_cabang_jual,
                    payload.penjual.sj.no_sj,
                    custJual[0].kode_jual_antar_cabang,
                    '12',
                    moment().format('YYYYMM'),
                    moment().format('YYMM') + custJual[0].kode_jual_antar_cabang
                ); // sj
                await generateNUDivisi(
                    editData.entitas_cabang_jual,
                    payload.penjual.so.no_so,
                    custJual[0].kode_jual_antar_cabang,
                    '10',
                    moment().format('YYYYMM'),
                    moment().format('YYMM') + custJual[0].kode_jual_antar_cabang
                ); // so
                await generateNUDivisi(
                    editData.entitas_cabang_jual,
                    payload.penjual.spm.no_do,
                    custJual[0].kode_jual_antar_cabang,
                    '11',
                    moment().format('YYYYMM'),
                    moment().format('YYMM') + custJual[0].kode_jual_antar_cabang
                ); // spm/do
                // pusat
                await generateNU(kode_entitas, payload.pusat.fb.no_fb, '03', moment().format('YYYYMM'));
                await generateNUDivisi(kode_entitas, payload.pusat.fj.no_fj, cust[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // fj
                await generateNU(kode_entitas, payload.pusat.pb.no_lpb, '04', moment().format('YYYYMM')); // pb
                await generateNU(kode_entitas, payload.pusat.po.no_sp, '02', moment().format('YYYYMM')); // po/sp
                await generateNUDivisi(kode_entitas, payload.pusat.sj.no_sj, cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // sj
                await generateNUDivisi(kode_entitas, payload.pusat.so.no_so, cust[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // so
                await generateNUDivisi(kode_entitas, payload.pusat.spm.no_do, cust[0].kode_jual_antar_cabang, '11', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang); // spm/do
            }

            return res.status;
        } catch (error) {
            console.error('Error: ', error);
            return false;
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
        setHargaMu,
        hargaMu,
        setTokenRedis,
    };
};
