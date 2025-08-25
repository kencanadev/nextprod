import React, { useEffect, useState } from 'react';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { fetchSettings } from '../../api/api';
import { FillFromSQL } from '@/utils/routines';

const DataTambahanPersediaan = ({ formState, updateState, entitas, token }: { formState: any; updateState: any; entitas: string; token: string }) => {
  const [kustom9, setKustom9] = useState([]);
  const [kustom8, setKustom8] = useState([]);
  const [kustom7, setKustom7] = useState([]);
  const [kustom6, setKustom6] = useState([]);
  const [kustom5, setKustom5] = useState([]);
  const [settings, setSettings] = useState<any>([]);

  const fetchRequiredData = async () => {
    fetchSettings(entitas, token).then((res) => {
      setSettings(res);
    });
  };

  useEffect(() => {
    fetchRequiredData();
    FillFromSQL(entitas, 'kustom9', '', token).then((res) => setKustom9(res));
    FillFromSQL(entitas, 'kustom8', '', token).then((res) => setKustom8(res));
    FillFromSQL(entitas, 'kustom7', '', token).then((res) => setKustom7(res));
    FillFromSQL(entitas, 'kustom6', '', token).then((res) => setKustom6(res));
    FillFromSQL(entitas, 'kustom5', '', token).then((res) => setKustom5(res));
  }, []);

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <label htmlFor="jenis" className="block text-xs font-medium text-gray-900 dark:text-white">
            {settings[0]?.item_kustom9}
          </label>
          <div className="rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="jenis"
              dataSource={kustom9}
              fields={{ text: 'str', value: 'str' }}
              placeholder="Pilih Jenis Produk"
              value={formState?.kustom9}
              onChange={(e: any) => updateState('kustom9', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="gabungan" className="block text-xs font-medium text-gray-900 dark:text-white">
            {settings[0]?.item_kustom8}
          </label>
          <div className="rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="gabungan"
              dataSource={kustom8}
              fields={{ text: 'str', value: 'str' }}
              placeholder="Pilih Gabungan Produk"
              value={formState?.kustom8}
              onChange={(e: any) => updateState('kustom8', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="klasifikasi" className="block text-xs font-medium text-gray-900 dark:text-white">
            {settings[0]?.item_kustom7}
          </label>
          <div className="rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="klasifikasi"
              dataSource={kustom7}
              fields={{ text: 'str', value: 'str' }}
              placeholder="Pilih Klasifikasi Produk"
              value={formState?.kustom7}
              onChange={(e: any) => updateState('kustom7', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="warna" className="block text-xs font-medium text-gray-900 dark:text-white">
            {settings[0]?.item_kustom6}
          </label>
          <div className="rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="warna"
              dataSource={kustom6}
              fields={{ text: 'str', value: 'str' }}
              placeholder="Pilih Warna Produk"
              value={formState?.kustom6}
              onChange={(e: any) => updateState('kustom6', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="motif" className="block text-xs font-medium text-gray-900 dark:text-white">
            {settings[0]?.item_kustom5}
          </label>
          <div className="rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="motif"
              dataSource={kustom5}
              fields={{ text: 'str', value: 'str' }}
              placeholder="Pilih Motif Produk"
              value={formState?.kustom5}
              onChange={(e: any) => updateState('kustom5', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTambahanPersediaan;
