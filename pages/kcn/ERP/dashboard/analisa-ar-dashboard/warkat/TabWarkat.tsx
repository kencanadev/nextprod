import React, { useEffect, useRef, useState } from 'react';
import GridWarkat from './GridWarkat';
import { useRouter } from 'next/router';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import moment from 'moment';
import { SpreadNumber } from '../../../fa/fpp/utils';
import DialogPencairanWarkat from '../../../fa/ppi/component/dialogPencairanWarkat';
import DialogPenolakanWarkat from '../../../fa/ppi/component/dialogPenolakanWarkat';
import AkunDebetDialog from '../modal/AkunDebetDialog';

const TabWarkat = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const gridWarkat = useRef<any>(null);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [pencairanHandle, setPencairanHandle] = useState(false);
    const [pembatalanHandle, setPembatalanHandle] = useState(false);
    const [listAKun, setListAKun] = useState([]);
    const [modalAkun, setModalAkun] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [listStateData, setListStateData] = useState({
        dialogInputDataVisible: false,
        masterKodeDokumen: 'BARU',
    });
    const [footerData, setFooterData] = useState({
        total_piutang: 0,
        count_piutang: 0,
    });
    const vRefreshData = useRef(0);

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    const refreshHandle = async () => {
        vRefreshData.current += 1;
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
                param1: 2,
                param2: responseSetting.data.data[0].hari_warkat,
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Tanggal sekarang

        const mod = response.data.data.map((item: any) => ({
            ...item,
            sisa: SpreadNumber(item.sisa),
        }));
        const total = mod.reduce(function (a: any, b: any) {
            return a + b.sisa;
        }, 0);
        setFooterData({
            count_piutang: mod.length,
            total_piutang: total,
        });

        gridWarkat.current.setProperties({ dataSource: mod });

        // console.log('responseSetting', response.data);
    };
    const getAKun = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/daftar_akun_phu?`, {
                params: {
                    entitas: kode_entitas,
                    param1: 'kas',
                },
            });
            console.log('response akun', response);
            setListAKun(response.data.data);
            return;
        } catch (error) {}
    };
    useEffect(() => {
        if (kode_entitas) {
            refreshHandle();
            getAKun();
        }
    }, [kode_entitas]);

    const getSelectedRow = (args: any) => {
        // console.log('args', args);

        vRefreshData.current += 1;
        setSelectedIndex(args.rowIndex);
        setSelectedRow(args.data);
    };
    function formatNumber(num: any) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return (
        <div className="h-full w-full flex-col bg-[#dedede] p-1">
            <div className="flex h-full w-full flex-grow flex-col-reverse overflow-x-auto rounded-md bg-white">
                <div className="bawah flex h-[150px] w-full flex-col ">
                    <div className="flex h-[30px] gap-2 px-3">
                        <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshHandle}>
                            🔄️ Refresh
                        </button>
                        <button
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => setPencairanHandle(true)}
                        >
                            ➡️ Pencairan
                        </button>
                        <button
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => setPembatalanHandle(true)}
                        >
                            ➡️ Ditolak
                        </button>
                    </div>
                    <div className="h-[120px] px-3 py-2">
                        <p className=" font-bold">Sumary :</p>
                        <p className=" ">
                            Setoran Dalam Perjalanan : &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{' '}
                            <b>
                                {' '}
                                {formatNumber(footerData.total_piutang)} = {footerData.count_piutang} Faktur
                            </b>
                        </p>
                    </div>
                </div>

                <div className={`flex h-[400px] w-full flex-grow overflow-x-auto overflow-y-auto rounded-md bg-white px-2 py-1 `}>
                    <GridWarkat gridPPI={gridWarkat} getSelectedRow={getSelectedRow} setModalAkun={setModalAkun} token={token} kode_entitas={kode_entitas} />
                </div>
            </div>
            {pencairanHandle && (
                <DialogPencairanWarkat
                    userid={userid}
                    kode_entitas={kode_entitas}
                    masterKodeDokumen={selectedRow.kode_dokumen}
                    masterDataState={'Pencairan'}
                    masterBarangProduksi={'Y'}
                    isOpen={pencairanHandle}
                    onClose={() => {
                        setPencairanHandle(false);
                    }}
                    onRefresh={refreshHandle}
                    kode_user={kode_user}
                    modalJenisPenerimaan={'Edit Pencairan'}
                    token={token}
                    onRefreshTipe={vRefreshData.current}
                    isFilePendukungPPI={'N'}
                    setisFilePendukungPPI={() => {}}
                />
            )}
            {pembatalanHandle && (
                <DialogPenolakanWarkat
                    userid={userid}
                    kode_entitas={kode_entitas}
                    masterKodeDokumen={selectedRow.kode_dokumen}
                    masterDataState={'Penolakan'}
                    masterBarangProduksi={'Y'}
                    isOpen={pembatalanHandle}
                    onClose={() => {
                        setPembatalanHandle(false);
                    }}
                    onRefresh={refreshHandle}
                    kode_user={kode_user}
                    modalJenisPenerimaan={'Penolakan'}
                    token={token}
                    onRefreshTipe={vRefreshData.current}
                    isFilePendukungPPI={'N'}
                    setisFilePendukungPPI={() => {}}
                />
            )}
            {modalAkun && (
                <AkunDebetDialog
                    apiUrl={apiUrl}
                    kode_entitas={kode_entitas}
                    visible={modalAkun}
                    onClose={() => setModalAkun(false)}
                    token={token}
                    listAKun={listAKun}
                    setHeaderDialogState={gridWarkat}
                    selectedRowIndexRekeningbarang={selectedIndex}
                />
            )}
        </div>
    );
};

export default TabWarkat;
