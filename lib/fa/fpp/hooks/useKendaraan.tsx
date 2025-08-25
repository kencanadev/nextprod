import { useState, useEffect } from 'react';
import axios from 'axios';

import React from 'react'

const useKendaraanFix = () => {
  return (
    <div>useKendaraan</div>
  )
}

export default useKendaraanFix

export const useKendaraan = (apiUrl: string, kode_entitas: string, token: string, selectedRowIndex: number, grid: any) => {
  const [showModalKendaraan, setShowModalKendaraan] = useState(false);
  const [listDaftarKendaraan, setDaftarKendaraan] = useState<any>([]);
  const [filteredDataKendaraan, setFilteredDataKendaraan] = useState<any>([]);
  const [searchNopol, setSearchNopol] = useState<any>('');
  const [selectedKendaraan, setSelectedKendaraan] = useState<any>('');

  const refreshDaftarKendaraan = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/dialog_kendaraan_bok`, {
        params: {
          entitas: kode_entitas,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarKendaraan(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihKendaraan = async () => {
    setShowModalKendaraan(false);

    if (Array.isArray(grid.dataSource)) {
      const cek = grid.dataSource[selectedRowIndex];
      const editedData = {
        ...cek,
        nopol: selectedKendaraan.nopol,
        noranka: selectedKendaraan.noranka,
      };
      grid.dataSource[selectedRowIndex] = editedData;
    }
    grid.refresh();
  };

  const SearchDataKendaraan = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  useEffect(() => {
    refreshDaftarKendaraan();
  }, [kode_entitas]);

  const PencarianKendaraan = (event: any, field: any) => {
    const searchValue = event;
    if (field === 'nopol') {
      setSearchNopol(searchValue);
    }
    const filteredData = SearchDataKendaraan(searchValue, listDaftarKendaraan, field);
    setFilteredDataKendaraan(filteredData);
  };

  return {
    showModalKendaraan,
    setShowModalKendaraan,
    searchNopol,
    setSearchNopol,
    setSelectedKendaraan,
    listDaftarKendaraan,
    filteredDataKendaraan,
    setFilteredDataKendaraan,
    PencarianKendaraan,
    handlePilihKendaraan,
  };
};
