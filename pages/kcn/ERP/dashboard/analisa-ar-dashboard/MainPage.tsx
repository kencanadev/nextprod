import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TabOutStanding from './outstandi/TabOutStanding';
import TabPiutang from './piutang/TabPiutang';
import TabWarkat from './warkat/TabWarkat';
import TabSelisihARAP from './selisihARAP/TabSelisihARAP';
import Head from 'next/head';
import { useSession } from '@/pages/api/sessionContext';
import { setPageTitle } from '@/store/themeConfigSlice';

const mainTabList = [
    {
        kelas: 'outstanding_pekerjaan',
        Klasifikasi: 'Outstanding Pekerjaan',
    },
    {
        kelas: 'piutang_jatuh_tempo',
        Klasifikasi: 'Piutang Jatuh Tempo',
    },
    {
        kelas: 'warkat_outstanding',
        Klasifikasi: 'Warkat Outstanding',
    },
    {
        kelas: 'selisih_arap',
        Klasifikasi: 'Selisih AR dan AP',
    },
];

const MainPage = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const [activeMainTab, setActiveMainTab] = useState('outstanding_pekerjaan');

    useEffect(() => {
        setPageTitle('test');
    }, []);
    return (
        <div className="flex h-[620px] w-full flex-col " id="main-target">
            <div className="-mt-3 flex h-[40px] w-full items-end gap-0 overflow-x-auto overflow-y-hidden border-gray-300">
                {mainTabList.map((item) => (
                    <motion.button
                        key={item.kelas}
                        onClick={() => setActiveMainTab(item.kelas)}
                        layout // Memastikan perubahan ukuran smooth
                        animate={{
                            height: activeMainTab === item.kelas ? '38px' : '30px', // Tinggi berbeda
                            scale: activeMainTab === item.kelas ? 1 : 1, // Skala lebih kecil jika tidak aktif
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }} // Transisi lebih smooth
                        className={`whitespace-nowrap rounded-b-none rounded-t-md font-semibold transition-all ${
                            activeMainTab === item.kelas
                                ? 'bg-[#dedede] px-4 py-3 text-sm text-black' // Tab aktif lebih besar
                                : 'border px-2 py-1 text-xs text-gray-500 hover:scale-100 hover:text-black' // Tab tidak aktif lebih kecil & rapat
                        }`}
                        whileTap={{ scale: 1.05 }} // Efek saat ditekan
                    >
                        {item.Klasifikasi}
                    </motion.button>
                ))}
            </div>

            <div className={`flex w-full flex-grow  ${activeMainTab === 'outstanding_pekerjaan' ? 'block' : 'hidden'}`}>
                <TabOutStanding />
            </div>
            <div className={`flex w-full flex-grow  ${activeMainTab === 'piutang_jatuh_tempo' ? 'block' : 'hidden'}`}>
                <TabPiutang />
            </div>
            <div className={`flex w-full flex-grow  ${activeMainTab === 'warkat_outstanding' ? 'block' : 'hidden'}`}>
                <TabWarkat />
            </div>
            <div className={`flex w-full flex-grow  ${activeMainTab === 'selisih_arap' ? 'block' : 'hidden'}`}>
                <TabSelisihARAP />
            </div>
        </div>
    );
};

export default MainPage;
