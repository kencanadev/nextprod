import React, { useEffect, useState } from 'react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { FaSearch } from 'react-icons/fa';
import DialogAkun from '../dialog/DialogAkun';
import { fetchListAkun } from '../../api/api';
import { useSession } from '@/pages/api/sessionContext';

const DataAkunPersediaan = ({ formState, updateState }: { formState: any; updateState: any }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [currentField, setCurrentField] = useState('');

  const { sessionData } = useSession();
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';

  const [data, setData] = useState([]);

  const fetchData = async () => {
    const akunData = await fetchListAkun(kode_entitas, 'all', token);
    setData(akunData);
  };

  const handleOpenDialog = (field: string) => {
    setCurrentField(field);
    setShowDialog(true);
    fetchData();
  };

  const handleSelectAkun = (selectedAkun: { no_akun: string; nama_akun: string; kode_akun: string }) => {
    switch (currentField) {
      case 'persediaan':
        updateState('no_akun_persediaan', selectedAkun.no_akun);
        updateState('nama_akun_persediaan', selectedAkun.nama_akun);
        updateState('kode_akun_persediaan', selectedAkun.nama_akun);
        break;
      case 'penjualan':
        updateState('no_akun_jual', selectedAkun.no_akun);
        updateState('nama_akun_jual', selectedAkun.nama_akun);
        updateState('kode_akun_jual', selectedAkun.nama_akun);
        break;
      case 'retur-penjualan':
        updateState('no_akun_returjual', selectedAkun.no_akun);
        updateState('nama_akun_returjual', selectedAkun.nama_akun);
        updateState('kode_akun_returjual', selectedAkun.nama_akun);
        break;
      case 'diskon':
        updateState('no_akun_diskonitem', selectedAkun.no_akun);
        updateState('nama_akun_diskonitem', selectedAkun.nama_akun);
        updateState('kode_akun_diskonitem', selectedAkun.nama_akun);
        break;
      case 'harga':
        updateState('no_akun_hpp', selectedAkun.no_akun);
        updateState('nama_akun_hpp', selectedAkun.nama_akun);
        updateState('kode_akun_hpp', selectedAkun.nama_akun);
        break;
      case 'pembelian':
        updateState('no_akun_returbeli', selectedAkun.no_akun);
        updateState('nama_akun_returbeli', selectedAkun.nama_akun);
        updateState('kode_akun_returbeli', selectedAkun.nama_akun);
        break;
      default:
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <label htmlFor="persediaan" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Persediaan
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="persediaan-id" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_persediaan} />
              <TextBoxComponent width={'79%'} name="persediaan" placeholder="Persediaan" floatLabelType="Never" value={formState?.nama_akun_persediaan} />
            </div>
            <button onClick={() => handleOpenDialog('persediaan')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="penjualan" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Penjualan
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="penjualan-id" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_jual} />
              <TextBoxComponent width={'79%'} name="penjualan" placeholder="Penjualan" floatLabelType="Never" value={formState?.nama_akun_jual} />
            </div>
            <button onClick={() => handleOpenDialog('penjualan')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="retur" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Retur Penjualan
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="retur-id" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_returjual} />
              <TextBoxComponent width={'79%'} name="retur" placeholder="Retur Penjualan" floatLabelType="Never" value={formState?.nama_akun_returjual} />
            </div>
            <button onClick={() => handleOpenDialog('retur-penjualan')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="diskon" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Diskon Penjualan
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="diskon-id" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_diskonitem} />
              <TextBoxComponent width={'79%'} name="diskon" placeholder="Diskon Penjualan" floatLabelType="Never" value={formState?.nama_akun_diskonitem} />
            </div>
            <button onClick={() => handleOpenDialog('diskon')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="harga" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Harga Pokok Penjualan
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="harga-id" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_hpp} />
              <TextBoxComponent width={'79%'} name="harga" placeholder="Harga Pokok Pembelian" floatLabelType="Never" value={formState?.nama_akun_hpp} />
            </div>
            <button onClick={() => handleOpenDialog('harga')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="retur" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Retur Pembelian
          </label>
          <div className="flex items-center gap-1">
            <div className="flex w-full items-center gap-1 rounded border border-gray-300 px-2">
              <TextBoxComponent width={'19%'} name="retur" placeholder="ID123" floatLabelType="Never" value={formState?.no_akun_returbeli} />
              <TextBoxComponent width={'79%'} name="retur" placeholder="Retur Pembelian" floatLabelType="Never" value={formState?.nama_akun_returbeli} />
            </div>
            <button onClick={() => handleOpenDialog('pembelian')} className="flex items-center justify-center rounded bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
      {showDialog && <DialogAkun isOpen={showDialog} onClose={() => setShowDialog(false)} data={data} onSelectAkun={handleSelectAkun} />}
    </div>
  );
};

export default DataAkunPersediaan;
