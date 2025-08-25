import React, { useEffect, useState } from 'react';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { fetchKategori, fetchKelompok, fetchMerk, fetchPajak, fetchSatuan } from '../../api/api';
import DialogGrupBarang from '../dialog/DialogGrupBarang';
import { validateAlert } from '../../utils/sweetalert';
import DialogMultiSatuan from '../dialog/DialogMultiSatuan';

const InformasiPersediaan = ({ formState, updateState, entitas }: { formState: any; updateState: any; entitas: any }) => {
  const [kategori, setKategori] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [satuan, setSatuan] = useState([]);
  const [merk, setMerk] = useState([]);
  const [pajak, setPajak] = useState([]);
  const [showGrupBarang, setShowGrupBarang] = useState(false);
  const [showMultiSatuan, setShowMultiSatuan] = useState(false);

  const copyNamaBarang = () => {
    updateState('nama_cetak', formState?.nama_item);
  };

  const handleListSatuan = () => {
    if (!formState?.satuan) {
      validateAlert('error', 'Satuan harus diisi!', '#DialogBaruEditPersediaan');
      return;
    }

    setShowMultiSatuan(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kategoriData, kelompokData, merkData, satuanData, pajakData] = await Promise.all([fetchKategori(), fetchKelompok(), fetchMerk(), fetchSatuan(entitas), fetchPajak(entitas)]);
        setKategori(kategoriData);
        setKelompok(kelompokData);
        setMerk(merkData);
        setSatuan(satuanData);

        const modifiedPajak = pajakData.map((item: any) => ({ ...item, text: `${item.kode_pajak} - ${item.catatan}` }));
        setPajak(modifiedPajak);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-2">
      <div className="grid grid-cols-5 gap-x-4 gap-y-2">
        <div className="flex items-center gap-x-2">
          <label htmlFor="kategori" className="block text-xs font-medium text-gray-900 dark:text-white">
            Kategori
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="kategori"
              dataSource={kategori}
              fields={{ text: 'grp', value: 'grp' }}
              placeholder="Pilih Kategori"
              value={formState?.grp}
              onChange={(e: any) => updateState('grp', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-0">
          <label htmlFor="satuan" className="block text-xs font-medium text-gray-900 dark:text-white">
            Satuan Standar
          </label>
          <div className="flex items-center gap-1">
            <div className="w-full rounded border border-gray-300 px-2">
              <ComboBoxComponent
                cssClass="e-custom-style"
                name="satuan"
                dataSource={satuan}
                fields={{ text: 'satuan', value: 'satuan' }}
                placeholder="Pilih Satuan"
                value={formState?.satuan}
                onChange={(e: any) => updateState('satuan', e.target.value)}
              />
            </div>
            <button id="list-satuan" className="flex items-center justify-center rounded border border-gray-300 p-2" onClick={handleListSatuan}>
              <FontAwesomeIcon icon={faFileLines} width="15" height="15" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-x-0">
          <label htmlFor="kelompok-produk" className="block text-xs font-medium text-gray-900 dark:text-white">
            Kelompok Produk
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="kelompok-produk"
              dataSource={kelompok}
              fields={{ text: 'kel', value: 'kel' }}
              placeholder="Pilih Kelompok Produk"
              value={formState?.kustom10}
              onChange={(e: any) => updateState('kustom10', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-0">
          <label htmlFor="merek-produk" className="block text-xs font-medium text-gray-900 dark:text-white">
            Merek Produk
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="merek-produk"
              dataSource={merk}
              fields={{ text: 'merk', value: 'merk' }}
              placeholder="Pilih Merek Produk"
              value={formState?.kustom4}
              onChange={(e: any) => updateState('kustom4', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-x-0">
          <label htmlFor="grup-barang" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Grup Barang
          </label>
          <div className="flex w-full items-center rounded border border-gray-300 bg-[#DCDCDC] px-2" onClick={() => setShowGrupBarang(true)}>
            <TextBoxComponent
              name="grup-barang"
              placeholder="Grup Barang"
              floatLabelType="Never"
              value={formState?.nama_grp}
              onChange={(e: any) => updateState('nama_grp', e.target.value)}
              style={{
                cursor: 'pointer',
              }}
              readOnly
            />
            <button id="grupBarang" className="flex items-center justify-center bg-[#DCDCDC] font-semibold" onClick={() => setShowGrupBarang(true)}>
              <FontAwesomeIcon icon={faSearch} width="18" height="18" />
            </button>
          </div>
        </div>
      </div>
      {/* Separator */}
      <div className="mb-3 mt-1 flex items-center gap-5">
        <span className="w-fit">Penjualan</span>
        <hr className="h-[1.5px] w-full border-t-0 bg-neutral-400" />
      </div>
      {/* End Separator */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-2">
        <div className="flex items-center gap-x-2">
          <label htmlFor="harga-penjualan" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Harga Penjualan (PL)
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <TextBoxComponent
              name="harga-penjualan"
              placeholder="Harga Penjualan"
              floatLabelType="Never"
              value={parseFloat(formState?.harga1).toLocaleString('en-US')}
              onChange={(e: any) => updateState('harga1', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-0">
          <label htmlFor="diskon" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Diskon (%)
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <TextBoxComponent name="diskon" placeholder="Diskon (%)" floatLabelType="Never" value={formState?.diskon} type="number" onChange={(e: any) => updateState('diskon', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-x-0">
          <label htmlFor="potongan" className="block  text-xs font-medium text-gray-900 dark:text-white">
            Potongan (Rp)
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <TextBoxComponent
              name="potongan"
              placeholder="Potongan (Rp)"
              floatLabelType="Never"
              value={parseFloat(formState?.potongan).toLocaleString('en-US')}
              onChange={(e: any) => updateState('potongan', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <label htmlFor="pajak" className="block text-xs font-medium text-gray-900 dark:text-white">
            Pajak
          </label>
          <div className="w-full rounded border border-gray-300 px-2">
            <ComboBoxComponent
              cssClass="e-custom-style"
              name="pajak"
              dataSource={pajak}
              fields={{ text: 'text', value: 'text' }}
              value={formState?.text_pajak}
              placeholder="Pilih Pajak"
              onChange={(e: any) => {
                updateState('text_pajak', e.target.itemData.text);
                updateState('kode_pajak', e.target.itemData.kode_pajak);
              }}
              showClearButton={false}
            />
          </div>
        </div>

        <div className="col-span-4 flex items-center gap-x-0">
          <label htmlFor="faktur" className="block text-xs font-medium text-gray-900 dark:text-white">
            Deskripsi untuk Cetak SJ dan Faktur Penjualan
          </label>
          <div className="flex w-full rounded border border-gray-300 px-2">
            <TextBoxComponent className="uppercase" name="faktur" floatLabelType="Never" value={formState?.nama_cetak} onChange={(e: any) => updateState('nama_cetak', e.target.value)} />
            <div>
              <TooltipComponent position="BottomCenter" content="Salin dari Nama Barang" target="#generateNoCust">
                <button
                  id="generateNoCust"
                  className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                  style={{
                    height: 28,
                    background: 'white',
                    borderColor: 'white',
                  }}
                  onClick={copyNamaBarang}
                >
                  <FontAwesomeIcon icon={faCopy} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                </button>
              </TooltipComponent>
            </div>
          </div>
        </div>
      </div>
      {/* Separator */}
      <div className="mb-3 mt-1 flex items-center gap-5">
        <span className="w-fit">Pembelian</span>
        <hr className="h-[1.5px] w-full border-t-0 bg-neutral-400" />
      </div>
      {/* End Separator */}
      <span className="mb-3 mt-1">Jml. Stok Aktual</span>
      <div className="mt-1 grid grid-cols-2 gap-4">
        {/* Left Side */}
        <div className="grid grid-cols-2 place-content-start gap-x-4">
          <div className="flex items-center gap-x-0">
            <label htmlFor="stok-minimal" className="block w-fit text-xs font-medium text-gray-900 dark:text-white">
              Stok Minimal
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="stok-minimal"
                placeholder="Stok Minimal"
                floatLabelType="Never"
                value={parseFloat(formState?.minimal).toLocaleString('en-US')}
                onChange={(e: any) => updateState('minimal', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="stok-maksimal" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Stok Maksimal
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="stok-maksimal"
                placeholder="Stok Maksimal"
                floatLabelType="Never"
                value={parseFloat(formState?.maksimal).toLocaleString('en-US')}
                onChange={(e: any) => updateState('maksimal', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="min-order" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Min. Jml Reorder
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="min-order"
                placeholder="Min. Jml Order"
                floatLabelType="Never"
                value={parseFloat(formState?.reorder).toLocaleString('en-US')}
                onChange={(e: any) => updateState('reorder', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="estimasi" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Est. Barang Datang (Hari)
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="estimasi"
                placeholder="Est. Barang Datang (Hari)"
                type="number"
                floatLabelType="Never"
                value={formState?.estimasipo}
                onChange={(e: any) => updateState('estimasipo', e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="grid grid-cols-2 place-content-start gap-x-4">
          <div className="flex items-center gap-x-2">
            <label htmlFor="stok-minimal" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Harga Pembelian (PL)
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="stok-minimal"
                placeholder="Harga Pembelian (PL)"
                floatLabelType="Never"
                value={parseFloat(formState?.harga4).toLocaleString('en-US')}
                onChange={(e: any) => updateState('harga4', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <label htmlFor="stok-maksimal" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Diskon
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent name="stok-maksimal" placeholder="Diskon" floatLabelType="Never" value={formState?.kustom1} onChange={(e: any) => updateState('kustom1', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <label htmlFor="min-order" className="block  text-xs font-medium text-gray-900 dark:text-white">
              HPP Standar
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <TextBoxComponent
                name="min-order"
                placeholder="HPP Standar"
                floatLabelType="Never"
                value={parseFloat(formState?.hpp).toLocaleString('en-US')}
                onChange={(e: any) => updateState('hpp', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <label htmlFor="merek-produk" className="block text-xs font-medium text-gray-900 dark:text-white">
              Prioritas Stok
            </label>
            <div className="w-full rounded border border-gray-300 px-2">
              <ComboBoxComponent
                cssClass="e-custom-style"
                name="merek-produk"
                dataSource={[
                  {
                    id: 1,
                    text: 1,
                  },
                  {
                    id: 2,
                    text: 2,
                  },
                  {
                    id: 3,
                    text: 3,
                  },
                  {
                    id: 4,
                    text: 4,
                  },
                  {
                    id: 5,
                    text: 5,
                  },
                ]}
                fields={{ text: 'text', value: 'text' }}
                placeholder="Pilih Prioritas Stok"
                value={formState?.rating}
                onChange={(e: any) => updateState('rating', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <DialogGrupBarang isOpen={showGrupBarang} onClose={() => setShowGrupBarang(false)} updateState={updateState} />
      <DialogMultiSatuan isOpen={showMultiSatuan} onClose={() => setShowMultiSatuan(false)} updateState={updateState} formState={formState} />
    </div>
  );
};

export default InformasiPersediaan;
