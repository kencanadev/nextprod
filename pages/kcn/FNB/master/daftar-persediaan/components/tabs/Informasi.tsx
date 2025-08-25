import React, { useEffect, useState } from 'react';

// Syncfusion
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';

// Others
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faFileInvoice, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FillFromSQL } from '@/utils/routines';
import { usePersediaanState } from '../../hooks/usePersediaanState';

const Informasi = ({ kode_entitas, token }: { kode_entitas: string; token: string }) => {
  // State Global

  // State Data
  const [kategori, setKategori] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [merek, setMerek] = useState([]);
  const [satuan, setSatuan] = useState([]);
  const [pajak, setPajak] = useState([]);

  // Custom Hooks
  const { handleShowDialogGrp, setShowDialogGrp } = usePersediaanState({ kode_entitas, token });

  const fetchRequiredData = async () => {
    // Kategori
    FillFromSQL(kode_entitas, 'kategori', '', token)
      .then((res) => setKategori(res))
      .catch((err) => console.error(err));
    // Kelompok
    FillFromSQL(kode_entitas, 'kelompok', '', token)
      .then((res) => setKelompok(res))
      .catch((err) => console.error(err));
    // Merk
    FillFromSQL(kode_entitas, 'merk', '', token)
      .then((res) => setMerek(res))
      .catch((err) => console.error(err));
    // Satuan
    FillFromSQL(kode_entitas, 'satuan', '', token)
      .then((res) => setSatuan(res))
      .catch((err) => console.error(err));
    // Pajak
    FillFromSQL(kode_entitas, 'pajak', '', token)
      .then((res) => {
        const modifiedData = res.map((item: any) => ({
          ...item,
          text: `${item.kode_pajak} - ${item.catatan}`,
        }));
        setPajak(modifiedData);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRequiredData();
  }, []);

  return (
    <div className="p-2 text-xs font-normal">
      {/* UPPER */}
      <div className="flex flex-col gap-1 text-[11px]">
        {/* Other Fields */}
        <div className="flex items-center justify-start gap-5">
          {/* Kategori */}
          <div className="flex items-center">
            <span className="w-24 pr-3 text-right">Kategori</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="kategori"
                  dataSource={kategori}
                  fields={{ value: 'grp', text: 'grp' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const value = args.value;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
          {/* Kelompok Produk */}
          <div className="flex items-center">
            <span className=" pr-3 text-right">Kelompok Produk</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="kelompok-produk"
                  dataSource={kelompok}
                  fields={{ value: 'kel', text: 'kel' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const value = args.value;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
          {/* Merk Produk */}
          <div className="flex items-center">
            <span className="w-20 pr-3 text-right">Merk Produk</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="merk-produk"
                  dataSource={merek}
                  fields={{ value: 'merk', text: 'merk' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const value = args.value;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
          {/* Satuan Produk */}
          <div className="flex items-center">
            <span className="pr-3 text-right">Satuan Standar</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="satuan-produk"
                  dataSource={satuan}
                  fields={{ value: 'satuan', text: 'satuan' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const value = args.value;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Grup Barang */}
        <div className="flex w-[40%] items-center">
          <span className="w-24 pr-3 text-right">Grup Barang</span>
          <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
            <input type="text" />
          </div>
          <button
            className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
            style={{ height: 28, marginLeft: 0, borderRadius: 2 }}
            onClick={() => {
              // setModalDaftarSupplier(true);
              handleShowDialogGrp();
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
          </button>
        </div>
      </div>

      {/* ===== Line Separator ===== */}
      <div className="my-3 flex items-center gap-3 ">
        <span>Penjualan</span>
        <hr className="flex-grow border border-gray-300" />
      </div>
      {/* ===== End Line Separator ===== */}

      {/* MIDDLE */}
      <div className="flex flex-col gap-1 text-[11px]">
        {/* Other Fields */}
        <div className="flex items-center">
          {/* Harga Penjualan (PL) */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Harga Penjualan (PL)</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Diskon */}
          <div className="flex items-center gap-1">
            <span className="w-20 pr-3 text-right">Diskon (%)</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Potongan */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Potongan (Rp)</span>
            <div className="fle flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Kategori */}
          <div className="flex items-center">
            <span className="w-16 pr-3 text-right">Pajak</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="pajak"
                  dataSource={pajak}
                  fields={{ value: 'text', text: 'text' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const kode_pajak = args.itemData.kode_pajak;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Diskripsi SJ dan FJ */}
        <div className="mt-1 flex flex-col">
          <span className="text-red-600 underline">Diskripsi untuk cetak SJ dan FJ</span>
          <div className="flex w-[40%] items-center">
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
            <button
              className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
              style={{ height: 28, marginLeft: 0, borderRadius: 2 }}
              onClick={() => {
                // setModalDaftarSupplier(true);
              }}
            >
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" width="15" height="15" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Line Separator ===== */}
      <div className="my-3 flex items-center gap-3">
        <span>Pembelian</span>
        <hr className="flex-grow border border-gray-300" />
      </div>
      {/* ===== End Line Separator ===== */}

      {/* LOWER */}
      <div className="flex flex-col gap-1 text-[11px]">
        {/* Stock Fields */}
        <div className="flex items-center">
          {/* Stok Minimal */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Stok Minimal</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Stok Maksimal */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Stok Maksimal</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Min. Jml Reorder */}
          <div className="flex items-center gap-1">
            <span className="w-28 pr-3 text-right">Min. Jml Reorder</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Est. Brg Datang Hari */}
          <div className="flex items-center gap-1">
            <span className="w-32 pr-3 text-right">Est. Brg Datang Hari</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
        </div>

        {/* Price Fields */}
        <div className="flex items-center">
          {/* Harga Pembelian (PL) */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Harga Pembelian (PL)</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Diskon (%) */}
          <div className="flex items-center gap-1">
            <span className="w-24 pr-3 text-right">Diskon (%)</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* HPP Standar */}
          <div className="flex items-center gap-1">
            <span className="w-28 pr-3 text-right">HPP Standar</span>
            <div className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5">
              <input type="text" />
            </div>
          </div>
          {/* Prioritas Stok */}
          <div className="flex items-center">
            <span className="w-[130px] pr-3 text-right">Prioritas Stok</span>
            <div className="mt-1 flex justify-between">
              <div className="flex-1 rounded border border-gray-300 bg-white px-2">
                <ComboBoxComponent
                  autofill
                  showClearButton={false}
                  id="kategori"
                  dataSource={[{ grp: '1' }, { grp: '2' }, { grp: '3' }, { grp: '4' }, { grp: '5' }]}
                  fields={{ value: 'grp', text: 'grp' }}
                  placeholder="--Silahkan Pilih--"
                  value={''}
                  change={(args: any) => {
                    const value = args.value;
                    //   updateStateFilter('kategoriValue', value);
                    //   updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informasi;
