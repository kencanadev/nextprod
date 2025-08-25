import { useState, useEffect } from 'react';
import axios from 'axios';

import React from 'react';

const useSupplierFix = () => {
    return <div>useSupplierFix</div>;
};

export default useSupplierFix;

export const useSupplier = (apiUrl: string, token: string, kode_entitas: string, updateState: Function, masterData: any) => {
    const [modalDaftarSupplier, setModalDaftarSupplier] = useState<boolean>(false);
    const [listDaftarSupplier, setDaftarSupplier] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>('');
    const [filteredDataSupplier, setFilteredDataSupplier] = useState<any[]>([]);
    const [searchNoSupp, setSearchNoSupp] = useState<string>('');
    const [searchNamaRelasi, setSearchNamaRelasi] = useState<string>('');

    const refreshDaftarSupplier = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/list_supplier_fpp`, {
                params: { entitas: kode_entitas, param1: 'FP' },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDaftarSupplier(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePilihVendor = () => {
        console.log(selectedSupplier);

        // nama_bank
        // nama_rekening
        // no_rekening
        updateState('kode_supp', selectedSupplier?.kode_supp);
        updateState('no_supp', selectedSupplier?.no_supp);
        updateState('nama_supp', selectedSupplier?.nama_relasi);
        updateState('nama_bank', selectedSupplier.nama_bank === null && masterData.nama_bank ? masterData.nama_bank.trim() : (selectedSupplier.nama_bank || '').toUpperCase().trim());
        updateState('nama_rekening', selectedSupplier.nama_rekening);
        updateState('no_rekening', selectedSupplier.no_rekening);
        setModalDaftarSupplier(false);
    };

    const PencarianSupplier = (event: string, field: string) => {
        if (field === 'no_supp') {
            setSearchNoSupp(event);
        } else if (field === 'nama_relasi') {
            setSearchNamaRelasi(event);
        }
        const filteredData = SearchDataSupplier(event, listDaftarSupplier, field);
        setFilteredDataSupplier(filteredData);
    };

    const SearchDataSupplier = (keyword: string, listData: any[], field: string) => {
        if (keyword === '') {
            return listData;
        }
        return listData.filter((item) => item[field]?.toLowerCase().includes(keyword.toLowerCase()));
    };

    useEffect(() => {
        refreshDaftarSupplier();
    }, [kode_entitas]);

    return {
        modalDaftarSupplier,
        setModalDaftarSupplier,
        listDaftarSupplier,
        filteredDataSupplier,
        setFilteredDataSupplier,
        searchNoSupp,
        setSearchNoSupp,
        searchNamaRelasi,
        setSearchNamaRelasi,
        selectedSupplier,
        setSelectedSupplier,
        PencarianSupplier,
        handlePilihVendor,
    };
};
