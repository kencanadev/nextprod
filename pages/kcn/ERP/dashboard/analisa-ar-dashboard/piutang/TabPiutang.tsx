import React, { useEffect, useRef, useState } from 'react';
import GridPiutang from './GridPiutang';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import moment from 'moment';
import { SpreadNumber } from '../../../fa/fpp/utils';
// import DialogInfoDetail from '../../../master/daftarCustomer/components/DialogInfoDetail';

const TabPiutang = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const gridPiutang = useRef<any>(null);
    const [customerModal, setCustomerModal] = useState(false);
    const [dataState, setDataState] = useState({});
    const [footerData, setFooterData] = useState({
        total_piutang: 0,
        count_piutang: 0,
    });

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    function formatNumber(num: any) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const refreshHandle = async () => {
        const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                entitas: kode_entitas,
            },
        });

        const response = await axios.get(`${apiUrl}/erp/list_piutangar_dashboard?`, {
            params: {
                entitas: kode_entitas,
                param1: 1,
                param2: responseSetting.data.data[0].hari_piutang,
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Tanggal sekarang

        const mod: any = response.data.data.map((item: any) => ({
            ...item,
            sisa: SpreadNumber(item.sisa),
            jatuh_tempo: moment(item.tgl_fj).add(item.tempo, 'days'),
        }));

        gridPiutang.current.setProperties({ dataSource: mod });
        const total = mod.reduce(function (a: any, b: any) {
            return a + b.sisa;
        }, 0);
        setFooterData({
            count_piutang: mod.length,
            total_piutang: total,
        });

        console.log('responseSetting', mod);
    };

    useEffect(() => {
        if (kode_entitas) {
            refreshHandle();
        }
    }, [kode_entitas]);
    const openCustomerHandle = () => {
        const selectedListData = gridPiutang.current.getSelectedRecords();

        if (selectedListData.length > 0) {
            setDataState(selectedListData[0]);
            setCustomerModal(true);
        } else {
            // showPilihDokumen();
        }
    };

    return (
        <div className="h-full w-full flex-col bg-[#dedede] p-1">
            {/* {customerModal && (
                <DialogInfoDetail
                    isOpen={customerModal}
                    onClose={() => setCustomerModal(false)}
                    DataState={dataState}
                    masterState={'DETAIL'}
                    token={token}
                    entitas={kode_entitas}
                    target={'main-target'}
                />
            )} */}
            <div className="flex h-full w-full flex-grow flex-col-reverse overflow-x-auto rounded-md bg-white">
                <div className="bawah flex h-[150px] w-full flex-col ">
                    <div className="flex h-[30px] gap-2 px-3">
                        <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshHandle}>
                            🔄️ Refresh
                        </button>
                        <Link
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            href={`/kcn/ERP/fa/ppi/ppilist?tabId=${tabId}`}
                            target="_blank"
                        >
                            ➡️ PPI
                        </Link>
                        <Link
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            href={`/kcn/ERP/fa/analisa-piutang?tabId=${tabId}`}
                            target="_blank"
                        >
                            ➡️ Analisa AR
                        </Link>
                        <button
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                alert('Analisa OD Belum Tersedia!');
                            }}
                        >
                            ➡️ Analisa OD
                        </button>
                        <button
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                alert('Buku Bank Belum Tersedia!');
                            }}
                        >
                            ➡️ Buku Bank{' '}
                        </button>
                        <Link
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            href={`/kcn/ERP/fa/buku-besar?tabId=${tabId}`}
                            target="_blank"
                        >
                            ➡️ GL{' '}
                        </Link>
                        <Link
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            href={`/kcn/ERP/fa/buku-subledger?tabId=${tabId}`}
                            target="_blank"
                        >
                            ➡️ Subledger{' '}
                        </Link>
                        <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={openCustomerHandle}>
                            ➡️ Info Customer
                        </button>
                    </div>
                    <div className="h-[120px] px-3 py-2">
                        <p className=" font-bold">Sumary :</p>
                        <p className=" ">
                            Total Piutang Jatuh Tempo : &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{' '}
                            <b>
                                {' '}
                                {formatNumber(SpreadNumber(footerData.total_piutang))} = {footerData.count_piutang} Faktur
                            </b>
                        </p>
                    </div>
                </div>

                <div className={`flex h-[400px] w-full flex-grow overflow-x-auto overflow-y-auto rounded-md bg-white px-2 py-1 `}>
                    <GridPiutang gridPiutang={gridPiutang} token={token} />
                </div>
            </div>
        </div>
    );
};

export default TabPiutang;
