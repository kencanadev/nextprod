import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { mainTabList } from './constants';
import { useSession } from '@/pages/api/sessionContext';
import { AnalisaStok, DataStokOverdue, InfoGudangCustomer, InfoGudangTransit, InfoGudangTTB, OutstandingPekerjaan } from './components';
import { useRouter } from 'next/router';
import styles from '@/styles/index.module.css';

const PengadaanBarang = () => {
    // Sessions
    const { sessionData, isLoading } = useSession();

    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();
    const { tabIdx1 } = router.query;

    // State Management
    const [activeMainTab, setActiveMainTab] = useState<any>(mainTabList[0].key);

    useEffect(() => {
        if (tabIdx1) {
            setActiveMainTab(tabIdx1 ? tabIdx1 : mainTabList[0].key);
        }
    }, [tabIdx1]);

    return (
        <div className={`Main h-[75vh] ${styles.scale75Monitor}`} id="main-target">
            {/* Header Tab */}
            <div className="-mt-3 flex h-[40px] w-full items-end gap-0 overflow-x-auto overflow-y-hidden border-b-2 border-gray-300">
                {mainTabList.map((item) => (
                    <motion.button
                        key={item.key}
                        onClick={() => setActiveMainTab(item.key)}
                        layout // Memastikan perubahan ukuran smooth
                        animate={{
                            height: activeMainTab === item.key ? '28px' : '24px', // Tinggi berbeda
                            scale: activeMainTab === item.key ? 1 : 1, // Skala lebih kecil jika tidak aktif
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }} // Transisi lebih smooth
                        className={`whitespace-nowrap rounded-b-none rounded-t-md font-semibold transition-all ${
                            activeMainTab === item.key
                                ? 'bg-[#dedede] px-3 py-2 text-sm text-black' // Tab aktif lebih besar
                                : 'border px-2 py-1 text-xs text-gray-500 hover:scale-100 hover:text-black' // Tab tidak aktif lebih kecil & rapat
                        }`}
                        whileTap={{ scale: 1.05 }} // Efek saat ditekan
                    >
                        {item.title}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex h-full w-full">
                {activeMainTab === 'outstanding_pekerjaan' && <OutstandingPekerjaan kode_entitas={kode_entitas} token={token} userid={userid} tabIdx1={activeMainTab} />}
                {activeMainTab === 'analisa_stok' && <AnalisaStok kode_entitas={kode_entitas} token={token} tabIdx1={activeMainTab} />}
                {activeMainTab === 'gudang_transit' && <InfoGudangTransit kode_entitas={kode_entitas} token={token} />}
                {activeMainTab === 'gudang_cust' && <InfoGudangCustomer kode_entitas={kode_entitas} token={token} />}
                {activeMainTab === 'gudang_ttb' && <InfoGudangTTB kode_entitas={kode_entitas} token={token} />}
                {activeMainTab === 'stok_overdue' && <DataStokOverdue kode_entitas={kode_entitas} token={token} userid={userid} />}
            </div>
        </div>
    );
};

export default PengadaanBarang;
