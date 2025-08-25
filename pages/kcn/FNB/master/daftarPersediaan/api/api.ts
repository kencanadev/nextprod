import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const fetchListAkun = async (kode_entitas: string, param1: string, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/daftar_akun_phu?`, {
      params: {
        entitas: kode_entitas,
        param1,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data akun:', error);
  }
};

export const fetchKategori = async () => {
  try {
    const res = await axios.get(`${apiUrl}/erp/kategori?entitas=999`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data kategori:', error);
  }
};

export const fetchKelompok = async () => {
  try {
    const res = await axios.get(`${apiUrl}/erp/kelompok?entitas=999`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data kelompok:', error);
  }
};

export const fetchSatuan = async (entitas: any) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/all_satuan?`, {
      params: {
        entitas,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data satuan:', error);
  }
};

export const fetchPajak = async (entitas: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/get_pajak`, {
      params: {
        entitas: entitas,
      },
    });
    const responseData = response.data.data;
    const transformedData_getpajak = responseData.map((item: any) => ({
      kode_pajak: item.kode_pajak,
      catatan: item.catatan,
    }));

    return transformedData_getpajak;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchSettings = async (entitas: string, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/setting`, {
      params: {
        entitas,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

export const fetchMerk = async () => {
  try {
    const res = await axios.get(`${apiUrl}/erp/merk?entitas=999`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data merk:', error);
  }
};

const checkParamValue = (value: string, isChecked: boolean) => {
  if (isChecked) {
    return 'all';
  }
  return value;
};

export const fetchListPersediaan = async (kode_entitas: string, formState: any, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/list_persediaan`, {
      params: {
        entitas: kode_entitas,
        param1: checkParamValue(formState.noBarangValue || 'all', formState.isNoBarangChecked),
        param2: checkParamValue(formState.namaBarang || 'all', formState.isNamaBarangChecked),
        param3: checkParamValue(formState.grupBarang || 'all', formState.isGrupBarangChecked),
        param4: checkParamValue(formState.noBarangSupplier || 'all', formState.isNoBarangSupplierChecked),
        param5: checkParamValue(formState.namaBarangSupplier || 'all', formState.isNamaBarangSupplierChecked),
        param6: checkParamValue(formState.kategori || 'all', formState.isKategoriChecked),
        param7: checkParamValue(formState.kelompokProduk || 'all', formState.isKelompokProdukChecked),
        param8: checkParamValue(formState.merekProduk || 'all', formState.isMerekProdukChecked),
        param9: checkParamValue(formState.tipe || 'all', formState.isTipeChecked),
        param10: formState.aktivasiState,
        param11: formState.statusState,
        param12: formState.paketProdukState,
        param13: formState.barangKonsinyasiState,
        param14: formState.dataEksportState,
        param15: formState.barangKontrakState,
        // limit: 10000,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching list persediaan:', error);
  }
};

export const fetchDetailPersediaan = async (entitas: string, token: string, param1: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/master_detail_persediaan`, {
      params: {
        entitas,
        param1,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error fetching data persediaan:', error);
  }
};

export const createPersediaan = async (data: any, token: string) => {
  try {
    const res = await axios.post(`${apiUrl}/erp/simpan_persediaan`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error creating persediaan:', error);
  }
};

export const updatePersediaan = async (data: any, token: string) => {
  try {
    const res = await axios.patch(`${apiUrl}/erp/update_persediaan`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error updating persediaan:', error);
  }
};

export const kartuPersediaanBarang = async (kode_entitas: any, tgl_awal: any, tgl_akhir: any, checkbox: any, kode_gudang: any, kode_item: any, token: any): Promise<any[]> => {
  const response = await axios.get(`${apiUrl}/erp/report_kartu_stok?`, {
    params: {
      entitas: kode_entitas,
      param1: tgl_awal,
      param2: tgl_akhir,
      param3: checkbox,
      param4: kode_gudang,
      param5: kode_item,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const saveAudit = async (data: any, token: any) => {
  // payload
  /**
   * {
      "entitas": "111",
      "kode_audit": null,
      "dokumen": "IT",
      "kode_dokumen": "IT0000000080",
      "no_dokumen": "",
      "proses": "NEW", // Update
      "deskripsi": "Update Persediaan: ",
      "userid": "USER LOGIN",
      "system_user": "",
      "system_ip": "",
      "system_mac": ""
    }
   */

  try {
    const response = await axios.post(`${apiUrl}/erp/simpan_audit`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error saving audit:', error);
  }
};

export const generateNoItem = async (params: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/generate_no_barang`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error generate no item:', error);
  }
};

export const fetchHistoryPersediaan = async (entitas: any, tipe: any, kode_item: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/history_persediaan`, {
      params: {
        entitas: String(entitas),
        param1: String(tipe).toLowerCase(),
        param2: kode_item,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching history persediaan:', error);
  }
};

export const fetchGrupBarang = async (entitas: any, nama_grp: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/master_grup_barang?`, {
      params: {
        entitas: String(entitas),
        param1: nama_grp ? nama_grp : 'all',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching grup barang:', error);
  }
};

export const fetchListSupplier = async (entitas: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/m_supplier?`, {
      params: {
        entitas,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching list supplier:', error);
  }
};
