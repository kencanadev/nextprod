import { useState, useEffect } from 'react';
import { createDetailPPPembeliPayload } from '../model/Pembeli/PP/quExportDetailPPCabang';
import { createPPPembeliPayload } from '../model/Pembeli/PP/quExportPPCabang';
import { createSOPenjualPayload } from '../model/Penjual/SO/quExportSOCabangJual';
import { createSPMPenjualPayload } from '../model/Penjual/SPM/quExportSPMCabangJual';
import { createDetaiSPMPenjualPayload } from '../model/Penjual/SPM/quExportDetailSPMCabangJual';
import { createDetailSOPenjualPayload } from '../model/Penjual/SO/quExportDetailSOCabangJual';
import { createSJPenjualPayload } from '../model/Penjual/SJ/quExportSJCabangJual';
import { createDetailSJPenjualPayload } from '../model/Penjual/SJ/quExportDetailSJCabangJual';
import { createJurnalSJPembeliPayload } from '../model/Penjual/SJ/quExportJurnalSJCabangJual';
import { createMBPenjualPayload } from '../model/Penjual/MB/quExportMBCabangJual';
import { createDetailMBPenjualPayload } from '../model/Penjual/MB/quExportDetailMBCabangJual';
import { createJurnalMBPenjualPayload } from '../model/Penjual/MB/quExportJurnalMBCabangJual';
import { createDetailFJPenjualPayload } from '../model/Penjual/FJ/quExportDetailFJCabangJual';
import { createFJPenjualPayload } from '../model/Penjual/FJ/quExportFJCabangJual';
import { createPOPembeliPayload } from '../model/Pembeli/PO/quExportPOCabang';
import { createDetailPOPembeliPayload } from '../model/Pembeli/PO/quExportDetailPOCabang';
import { createFBPembeliPayload } from '../model/Pembeli/FB/quExportFBCabang';
import { createDetailFBPembeliPayload } from '../model/Pembeli/FB/quExportDetailFBCabang';
import { createPBPembeliPayload } from '../model/Pembeli/PB/quExportPBCabang';
import { createDetailPBPembeliPayload } from '../model/Pembeli/PB/quExportDetailPBCabang';
import { createJurnalPBPembeliPayload } from '../model/Pembeli/PB/quExportJurnalPBCabang';
import { createJurnalFJPenjualPayload } from '../model/Penjual/FJ/quExportJurnalFJCabangJual';
import { createFBPusatPayload } from '../model/Pusat/FB/quExportFB';
import { createDetailFBPusatPayload } from '../model/Pusat/FB/quExportDetailFB';
import { createFJPusatPayload } from '../model/Pusat/FJ/quExportFJ';
import { createDetailFJPusatPayload } from '../model/Pusat/FJ/quExportDetailFJ';
import { createJurnalFJPusatPayload } from '../model/Pusat/FJ/quExportJurnalFJ';
import { createSPMPusatPayload } from '../model/Pusat/SPM/quExportSPM';
import { createDetaiSPMPusatPayload } from '../model/Pusat/SPM/quExportDetailSPM';
import { createSOPusatPayload } from '../model/Pusat/SO/quExportSO';
import { createDetailSOPusatPayload } from '../model/Pusat/SO/quExportDetailSO';
import { createSJPusatPayload } from '../model/Pusat/SJ/quExportSJ';
import { createDetailSJPusatPayload } from '../model/Pusat/SJ/quExportDetailSJ';
import { createJurnalSJPusatPayload } from '../model/Pusat/SJ/quExportJurnalSJ';
import { createPOPusatPayload } from '../model/Pusat/PO/quExportPO';
import { createDetailPOPusatPayload } from '../model/Pusat/PO/quExportDetailPO';
import { createPBPusatPayload } from '../model/Pusat/PB/quExportPB';
import { createDetailPBPusatPayload } from '../model/Pusat/PB/quExportDetailPB';
import { createJurnalPBPusatPayload } from '../model/Pusat/PB/quExportJurnalPB';
import { ResetTime } from '@/utils/routines';
import { fetchCustomerMap, fetchTerminByNama } from '../api';

export const useDataFetching = (editData: any, kode_entitas: string, token: string, updateState: any, hargaBeliMu: number, hargaJualMu: number, hargaMu: number, tipe: string) => {
    // Pembeli
    const [fbCabangData, setFbCabangData] = useState<any>(null);
    const [detailFBCabangData, setDetailFBCabangData] = useState<any>(null);
    const [pbCabangData, setPbCabangData] = useState<any>(null);
    const [detailPBCabangData, setDetailPBCabangData] = useState<any>(null);
    const [jurnalPBPembeliData, setJurnalPBPembeliData] = useState<any>(null);
    const [poPembeliData, setPoPembeliData] = useState<any>(null);
    const [dPoPembeliData, setDPoPembeliData] = useState<any>(null);
    const [ppPembeliData, setPpPembeliData] = useState<any>(null);
    const [dPpPembeliData, setDPpPembeliData] = useState<any>(null);
    // Penjual
    const [soPenjualData, setSOPenjualData] = useState<any>(null);
    const [dSoPenjualData, setDSOPenjualData] = useState<any>(null);
    const [spmPenjualData, setSPMPenjualData] = useState<any>(null);
    const [dSpmPenjualData, setDSPMPenjualData] = useState<any>(null);
    const [sjPenjualData, setSJPenjualData] = useState<any>(null);
    const [dSjPenjualData, setDSJPenjualData] = useState<any>(null);
    const [jSjPenjualData, setJSJPenjualData] = useState<any>(null);
    const [mbPenjualData, setMBPenjualData] = useState<any>(null);
    const [dMbPenjualData, setDMbPenjualData] = useState<any>(null);
    const [jMbPenjualData, setJMbPenjualData] = useState<any>(null);
    const [fjPenjualData, setFjPenjualData] = useState<any>(null);
    const [dFjPenjualData, setDFjPenjualData] = useState<any>(null);
    const [jFjPenjualData, setJFjPenjualData] = useState<any>(null);
    // Pusat
    const [fbPusatData, setFbPusatData] = useState<any>(null);
    const [detailFBPusatData, setDetailFBPusatData] = useState<any>(null);
    const [fjPusatData, setFjPusatData] = useState<any>(null);
    const [detailFJPusatData, setDetailFJPusatData] = useState<any>(null);
    const [jurnalFJPusatData, setJurnalFJPusatData] = useState<any>(null);
    const [spmPusatData, setSPMPusatData] = useState<any>(null);
    const [detailSPMPusatData, setDetailSPMPusatData] = useState<any>(null);
    const [soPusatData, setSOPusatData] = useState<any>(null);
    const [detailSOPusatData, setDetailSOPusatData] = useState<any>(null);
    const [sjPusatData, setSJPusatData] = useState<any>(null);
    const [detailSJPusatData, setDetailSJPusatData] = useState<any>(null);
    const [jurnalSJPusatData, setJurnalSJPusatData] = useState<any>(null);
    const [poPusatData, setPOPusatData] = useState<any>(null);
    const [detailPOPusatData, setDetailPOPusatData] = useState<any>(null);
    const [pbPusatData, setPBPusatData] = useState<any>(null);
    const [detailPBPusatData, setDetailPBPusatData] = useState<any>(null);
    const [jurnalPBPusatData, setJurnalPBPusatData] = useState<any>(null);

    const [tgl, setTgl] = useState<string>('');
    const [cust, setCust] = useState<string>('');
    const [termin, setTermin] = useState<string>('');
    const [terminBeli, setTerminBeli] = useState<string>('');
    const [terminPusat, setTerminPusat] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!editData?.kode_entitas || !editData?.tgl_trxfpac) return;

            try {
                const [tglResponse, terminResponse, terminResBeli, terminResPusat] = await Promise.all([
                    ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
                    fetchTerminByNama(editData.entitas_cabang_jual, editData.nama_termin, token),
                    fetchTerminByNama(editData.kode_entitas, editData.nama_termin, token),
                    fetchTerminByNama(kode_entitas, editData.nama_termin, token),
                ]);

                setTgl(tglResponse);
                setTermin(terminResponse);
                setTerminBeli(terminResBeli);
                setTerminPusat(terminResPusat);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setError(error instanceof Error ? error : new Error('Failed to fetch initial data'));
            }
        };

        fetchInitialData();
    }, [editData?.kode_entitas, editData?.tgl_trxfpac, kode_entitas, editData?.entitas_cabang_jual, token]);

    useEffect(() => {
        if (!isInitialized || !editData || !kode_entitas || !token || !tgl) return;

        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [
                    // Pembeli
                    fbDataB,
                    detailFBDataB,
                    pbDataB,
                    detailPBDataB,
                    jPBDataB,
                    poDataB,
                    dPODataB,
                    ppDataB,
                    dPPDataB,

                    // Penjual
                    soDataJ,
                    dSODataJ,
                    spmDataJ,
                    dSPMDataJ,
                    sjDataJ,
                    dSJDataJ,
                    jSJDataJ,
                    mbDataJ,
                    dMBDataJ,
                    jMBDataJ,
                    fjDataJ,
                    dFJDataj,
                    jFJDataJ,

                    // Pusat
                    fbDataP,
                    dFBDataP,
                    fjDataP,
                    dFJDataP,
                    jFJDataP,
                    spmDataP,
                    dSPMDataP,
                    soDataP,
                    dSODataP,
                    sjDataP,
                    dSJDataP,
                    jSJDataP,
                    poDataP,
                    dPoDataP,
                    pbDataP,
                    dPbDataP,
                    jPbDataP,
                ] = await Promise.all([
                    // Pembeli
                    createFBPembeliPayload(editData, kode_entitas, tgl, terminBeli, token, updateState, tipe, hargaMu),
                    createDetailFBPembeliPayload(editData, kode_entitas, hargaMu, token),
                    createPBPembeliPayload(editData, tgl, terminBeli, kode_entitas, token, updateState, tipe, hargaMu),
                    createDetailPBPembeliPayload(editData, kode_entitas, token, hargaMu),
                    createJurnalPBPembeliPayload(editData, kode_entitas, token),
                    createPOPembeliPayload(editData, kode_entitas, token, tgl, terminBeli, updateState, tipe, hargaMu),
                    createDetailPOPembeliPayload(editData, kode_entitas, token, hargaMu),
                    createPPPembeliPayload(editData, tgl, kode_entitas, token, updateState, tipe),
                    createDetailPPPembeliPayload(editData),

                    // Penjual
                    createSOPenjualPayload(editData, tgl, termin, kode_entitas, token, updateState, hargaJualMu),
                    createDetailSOPenjualPayload(editData, hargaJualMu, kode_entitas, token),
                    createSPMPenjualPayload(editData, tgl, kode_entitas, token, updateState),
                    createDetaiSPMPenjualPayload(editData, hargaJualMu, kode_entitas, token),
                    createSJPenjualPayload(editData, tgl, kode_entitas, token, updateState, hargaJualMu),
                    createDetailSJPenjualPayload(editData, kode_entitas, token, hargaJualMu),
                    createJurnalSJPembeliPayload(editData, kode_entitas, token),
                    createMBPenjualPayload(editData, tgl, kode_entitas, token, updateState, hargaJualMu),
                    createDetailMBPenjualPayload(editData, kode_entitas, token),
                    createJurnalMBPenjualPayload(editData, kode_entitas, token),
                    createFJPenjualPayload(editData, tgl, termin, kode_entitas, token, updateState, hargaJualMu),
                    createDetailFJPenjualPayload(editData, hargaJualMu, token, kode_entitas),
                    createJurnalFJPenjualPayload(editData, kode_entitas, token, hargaJualMu),

                    // Pusat
                    createFBPusatPayload(editData, kode_entitas, tgl, terminPusat, updateState, hargaBeliMu, tipe),
                    createDetailFBPusatPayload(editData, hargaBeliMu, kode_entitas, token),
                    createFJPusatPayload(editData, tgl, terminPusat, kode_entitas, token, updateState, tipe, hargaMu),
                    createDetailFJPusatPayload(editData, hargaBeliMu, hargaMu, token, kode_entitas),
                    createJurnalFJPusatPayload(editData, kode_entitas, token, tipe, hargaMu),
                    createSPMPusatPayload(editData, kode_entitas, token, updateState, tipe),
                    createDetaiSPMPusatPayload(editData, kode_entitas, token),
                    createSOPusatPayload(editData, kode_entitas, token, terminPusat, updateState, tipe, hargaMu),
                    createDetailSOPusatPayload(editData, kode_entitas, token, hargaMu),
                    createSJPusatPayload(editData, kode_entitas, token, updateState, tipe, hargaMu),
                    createDetailSJPusatPayload(editData, hargaBeliMu, token, kode_entitas),
                    createJurnalSJPusatPayload(editData, kode_entitas, token, hargaBeliMu),
                    createPOPusatPayload(editData, terminPusat, kode_entitas, updateState, hargaBeliMu, tipe),
                    createDetailPOPusatPayload(editData, hargaBeliMu, kode_entitas, token),
                    createPBPusatPayload(editData, tgl, terminPusat, kode_entitas, updateState, hargaBeliMu, tipe),
                    createDetailPBPusatPayload(editData, hargaBeliMu, kode_entitas, token),
                    createJurnalPBPusatPayload(editData, kode_entitas, token, hargaBeliMu),
                ]);

                // Pembeli
                setFbCabangData(fbDataB);
                setDetailFBCabangData(detailFBDataB);
                setPbCabangData(pbDataB);
                setDetailPBCabangData(detailPBDataB);
                setJurnalPBPembeliData(jPBDataB);
                setPoPembeliData(poDataB);
                setDPoPembeliData(dPODataB);
                setPpPembeliData(ppDataB);
                setDPpPembeliData(dPPDataB);

                // Penjual
                setSOPenjualData(soDataJ);
                setDSOPenjualData(dSODataJ);
                setSPMPenjualData(spmDataJ);
                setDSPMPenjualData(dSPMDataJ);
                setSJPenjualData(sjDataJ);
                setDSJPenjualData(dSJDataJ);
                setJSJPenjualData(jSJDataJ);
                setMBPenjualData(mbDataJ);
                setDMbPenjualData(dMBDataJ);
                setJMbPenjualData(jMBDataJ);
                setFjPenjualData(fjDataJ);
                setDFjPenjualData(dFJDataj);
                setJFjPenjualData(jFJDataJ);

                // Pusat
                setFbPusatData(fbDataP);
                setDetailFBPusatData(dFBDataP);
                setFjPusatData(fjDataP);
                setDetailFJPusatData(dFJDataP);
                setJurnalFJPusatData(jFJDataP);
                setSPMPusatData(spmDataP);
                setDetailSPMPusatData(dSPMDataP);
                setSOPusatData(soDataP);
                setDetailSOPusatData(dSODataP);
                setSJPusatData(sjDataP);
                setDetailSJPusatData(dSJDataP);
                setJurnalSJPusatData(jSJDataP);
                setPOPusatData(poDataP);
                setDetailPOPusatData(dPoDataP);
                setPBPusatData(pbDataP);
                setDetailPBPusatData(dPbDataP);
                setJurnalPBPusatData(jPbDataP);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
            } finally {
                setIsLoading(false);
            }
        };

        if (editData && kode_entitas && token) {
            fetchAllData();
        }
    }, [isInitialized, editData, kode_entitas, token, tgl, cust, hargaJualMu, hargaBeliMu]);

    return {
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
    };
};
