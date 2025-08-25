import { useState, useEffect } from 'react';
import axios from 'axios';

import React from 'react'

const useEntitasFix = () => {
  return (
    <div>useEntitasFix</div>
  )
}

export default useEntitasFix

export const useEntitas = (apiUrl: string, token: string, kode_entitas: string, updateState: any) => {
  const [showModalEntitas, setShowModalEntitas] = useState(false);
  const [listDaftarEntitas, setListDaftarEntitas] = useState<any>([]);
  const [filteredDataEntitas, setFilteredDataEntitas] = useState<any>([]);
  const [selectedEntitas, setSelectedEntitas] = useState<any>('');
  const [searchNamaCabang, setSearchNamaCabang] = useState('');
  const [searchKodeCabang, setSearchKodeCabang] = useState('');

  const refreshDaftarEntitas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/get_all_entitas?entitas=${kode_entitas}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListDaftarEntitas(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihEntitas = () => {
    setShowModalEntitas(false);
    updateState('kode_entitas', selectedEntitas.Kode);
  };

  const searchDataEntitas = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  const pencarianEntitas = (event: any, field: any) => {
    const searchValue = event;
    if (field === 'Kode') {
      setSearchKodeCabang(searchValue);
    } else if (field === 'Cabang') {
      setSearchNamaCabang(searchValue);
    }

    const filteredData = searchDataEntitas(searchValue, listDaftarEntitas, field);
    setFilteredDataEntitas(filteredData);
  };

  useEffect(() => {
    refreshDaftarEntitas();
  }, []);

  return {
    showModalEntitas,
    setShowModalEntitas,
    filteredDataEntitas,
    setFilteredDataEntitas,
    setSelectedEntitas,
    searchNamaCabang,
    searchKodeCabang,
    handlePilihEntitas,
    pencarianEntitas,
    listDaftarEntitas,
    setSearchKodeCabang,
    setSearchNamaCabang,
  };
};
