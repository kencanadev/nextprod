import { useState } from 'react';
import { IFilterFormState } from '../../../../pages/kcn/ERP/master/daftarPersediaan/components/types';

export const useFormState = () => {
  const [formState, setFormState] = useState<IFilterFormState>({
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarang: '',
    isNamaBarangChecked: false,
    grupBarang: '',
    isGrupBarangChecked: false,
    noBarangSupplier: '',
    isNoBarangSupplierChecked: false,
    namaBarangSupplier: '',
    isNamaBarangSupplierChecked: false,
    kategori: '',
    isKategoriChecked: false,
    kelompokProduk: '',
    isKelompokProdukChecked: false,
    merekProduk: '',
    isMerekProdukChecked: false,
    tipe: '',
    isTipeChecked: false,
    searchNoPersediaan: '',
    searchNamaPersediaan: '',
    aktivasiState: 'all',
    statusState: 'all',
    paketProdukState: 'all',
    barangKonsinyasiState: 'all',
    dataEksportState: 'all',
    barangKontrakState: 'all',
  });

  const updateFormState = (key: string, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return { formState, updateFormState };
};
