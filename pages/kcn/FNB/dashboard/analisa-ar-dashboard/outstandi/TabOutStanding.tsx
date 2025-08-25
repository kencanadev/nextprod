import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GridSJ from './GridSJ';
import GridTTB from './GridTTB';
import FrmMk from '../../../sales/mk/component/frmMk';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

const mainTabList = [
    {
        kelas: 'surat_jalan',
        Klasifikasi: 'Surat Jalan',
    },
    {
        kelas: 'tanda_terima_barang',
        Klasifikasi: 'Tanda Terima Barang',
    },
];

const TabOutStanding = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';

    const [activeSubTab, setActiveSubTab] = useState('surat_jalan');
    const [mkBaru, setMkBaru] = useState(false);
    const mkBaruHandle = () => {
        setMkBaru(true);
    };
    const fakturKreditHandle = () => {};
    const gridSJ = useRef<any>(null);
    const gridTTB = useRef<any>(null);
    const refreshHanlde = async () => {
        const response = await axios.get(`${apiUrl}/erp/list_piutangar_dashboard?`, {
            params: {
                entitas: kode_entitas,
                param1: 0,
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const dataSJ = response.data.data.filter((item: any) => item.id === 0);
        const dataTTB = response.data.data.filter((item: any) => item.id === 1);
        gridSJ.current.setProperties({ dataSource: dataSJ });
        gridTTB.current.setProperties({ dataSource: dataTTB });
        console.log('response', response);
    };

    useEffect(() => {
        if (kode_entitas) {
            refreshHanlde();
        }
    }, [kode_entitas]);
    return (
        <div className="h-full w-full flex-col bg-[#dedede] p-1">
            {mkBaru && (
                <FrmMk
                    userid={userid}
                    kode_entitas={kode_entitas}
                    masterKodeDokumen={'BARU'}
                    masterDataState={'BARU'}
                    isOpen={mkBaru}
                    onClose={() => setMkBaru(false)}
                    onRefresh={refreshHanlde}
                    kode_user={''}
                />
            )}
            <div className="h-full w-full flex-col overflow-hidden rounded-md bg-white">
                <style>
                    {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;
                        
                    }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
                </style>
                <div className=" flex h-[30px] w-full overflow-x-auto overflow-y-hidden  pl-3 pt-1">
                    {mainTabList.map((item) => (
                        <motion.button
                            key={item.kelas}
                            onClick={async () => {
                                setActiveSubTab(item.kelas);
                            }}
                            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold hover:rounded-t-md hover:bg-[#f0f3fe] ${
                                activeSubTab === item.kelas ? 'border-b-[2.5px] border-[#4361ee] text-black' : 'text-gray-500 hover:text-black'
                            }`}
                            whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                            transition={{ duration: 0.2 }}
                        >
                            {item.Klasifikasi}
                        </motion.button>
                    ))}
                </div>
                <div className="flex h-full w-full flex-grow flex-col-reverse  ">
                    <div className="bawah m-2 flex h-[150px] w-full flex-col  p-2">
                        <div className="flex h-[30px] gap-2  px-3">
                            <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshHanlde}>
                                🔄️ Refresh
                            </button>
                            <Link
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                target="_blank"
                                href={'/kcn/ERP/sales/fj/fj'}
                            >
                                📄 Faktur Baru
                            </Link>
                            <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={mkBaruHandle}>
                                📄 MK Baru
                            </button>
                            <button
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => {
                                    alert('MPP Belum Tersedia!');
                                }}
                            >
                                📄 MPP Baru
                            </button>
                            <Link
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                href={`/kcn/ERP/sales/fj/fjlist?tabId=${tabId}`}
                                target="_blank"
                            >
                                ➡️ Faktur Kredit{' '}
                            </Link>
                            <Link
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                href={`/kcn/ERP/sales/mk/mkList?tabId=${tabId}`}
                                target="_blank"
                            >
                                ➡️ Memo Kredit
                            </Link>
                            <button
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => {
                                    alert('MPP Belum Tersedia!');
                                }}
                            >
                                ➡️ MPP{' '}
                            </button>
                            <button
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => {
                                    alert('Analisa Jual Belum Tersedia!');
                                }}
                            >
                                ➡️ Analisa Jual
                            </button>
                        </div>
                        <div className="h-[120px] px-3 py-2">
                            <p className=" font-bold">Sumary :</p>
                            <p className=" ">Surat Jalan Belum Di Faktur : {gridSJ.current?.dataSource.length}</p>
                            <p className=" ">Tanda Terima Barang Retur belum dikredit : {gridTTB.current?.dataSource.length}</p>
                        </div>
                    </div>

                    <div className={`flex w-full flex-grow overflow-x-auto px-2 py-1 ${activeSubTab === 'surat_jalan' ? 'block' : 'hidden'}`}>
                        <GridSJ gridSJ={gridSJ} />
                    </div>
                    <div className={`flex w-full flex-grow overflow-x-auto  rounded-md bg-white px-2 py-1 ${activeSubTab === 'tanda_terima_barang' ? 'block' : 'hidden'}`}>
                        <GridTTB gridTTB={gridTTB} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabOutStanding;
