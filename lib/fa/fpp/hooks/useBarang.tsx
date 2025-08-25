import { useState, useEffect } from 'react';
import axios from 'axios';
import { SpreadNumber } from '../../../../pages/kcn/ERP/fa/fpp/utils';

import React from 'react'

const useBarangFix = () => {
  return (
    <div>useBarangFix</div>
  )
}

export default useBarangFix

export const useBarang = (apiUrl: string, token: string, kode_entitas: string, selectedSupplier: any, selectedRowIndex: number, grid: any, statusPage: any, masterData: any) => {
  const [showModalBarang, setShowModalBarang] = useState(false);
  const [listDaftarBarang, setDaftarBarang] = useState<any>([]);
  const [filteredDataBarang, setFilteredDataBarang] = useState<any>([]);
  const [selectedBarang, setSelectedBarang] = useState<any>('');
  const [searchDiskripsi, setSearchDiskripsi] = useState<any>('');

  const refreshDaftarBarang = async () => {
    const supplierNo = statusPage === 'EDIT' ? masterData.no_supp! : selectedSupplier.no_supp;
    try {
      const response = await axios.get(`${apiUrl}/erp/list_item_fpp`, {
        params: {
          entitas: kode_entitas,
          param1: supplierNo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarBarang(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihBarang = async () => {
    setShowModalBarang(false);

    if (Array.isArray(grid.dataSource)) {
      const cek = grid.dataSource[selectedRowIndex];
      const editedData = {
        ...cek,
        nama_jenis_supp: selectedBarang.nama_jenis_supp,
        diskripsi: selectedBarang.nama_item,
        harga_mu: SpreadNumber(selectedBarang.harga),
        merk: selectedBarang.merk,
        ukuran: selectedBarang.ukuran,
        id_supp: selectedBarang.id_supp,
        kode_jenis: selectedBarang.kode_jenis,
        kode_supp: selectedBarang.kode_supp,
      };
      grid.dataSource[selectedRowIndex] = editedData;
    }
    grid.refresh();
  };

  const SearchDataBarang = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  useEffect(() => {
    // setTimeout(() => refreshDaftarBarang(), 500);
    refreshDaftarBarang();
  }, [selectedSupplier.no_supp, masterData.no_supp]);

  const PencarianBarang = (event: any, field: any) => {
    const searchValue = event;
    if (field === 'nama_item') {
      setSearchDiskripsi(searchValue);
    }
    const filteredData = SearchDataBarang(searchValue, listDaftarBarang, field);
    setFilteredDataBarang(filteredData);
  };

  return {
    setShowModalBarang,
    showModalBarang,
    setSearchDiskripsi,
    listDaftarBarang,
    filteredDataBarang,
    setFilteredDataBarang,
    searchDiskripsi,
    setSelectedBarang,
    handlePilihBarang,
    PencarianBarang,
  };
};
