import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';

import { enableRipple, getValue } from '@syncfusion/ej2-base';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import PerfectScrollbar from 'react-perfect-scrollbar';
import DialogBaruEditPersediaan from './components/dialog/DialogBaruEditPersediaan';
import CustomInput from './components/Input';
import RadioInputGroup from './components/RadioInputGroup';
import PersediaanTable from './components/PersediaanTable';
import TopActions from './components/TopActions';
import { fetchListPersediaan } from './api/api';
import DialogKartuStok from './components/dialog/DialogKartuStok';
import DialogLabelBarcode from './components/dialog/DialogLabelBarcode';
import usePersediaanState from '../../../../../utils/master/daftarPersediaan/hooks/usePersediaanState';
import { useFormState } from '../../../../../utils/master/daftarPersediaan/hooks/useFormState';
import { validateAlert } from './utils/sweetalert';
import { ACTIVATION_STATUS_FILTER, BARANG_KONTRAK_PPN_FILTER, DATA_EKSPORT_FILTER, ITEM_STATUS_FILTER, KONSIYANSI_FILTER, PAKET_FILTER } from './constants';
import { FillFromSQL } from '@/utils/routines';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

enableRipple(true);

const PersediaanList = () => {
  const { sessionData, isLoading } = useSession();
  if (isLoading) {
    return;
  }

  const kode_entitas = sessionData?.kode_entitas ?? '';
  const token = sessionData?.token ?? '';
  const userid = sessionData?.userid ?? '';

  const persediaanState = usePersediaanState();

  const { formState, updateFormState } = useFormState();

  // Ref
  const noPersediaanRef = useRef<HTMLInputElement>(null);
  const namaPersediaanRef = useRef<HTMLInputElement>(null);

  //============ Handle Filter ===========
  const handleTogglePanel = () => {
    persediaanState.setPanelVisible(!persediaanState.panelVisible);
  };

  const handleFilterClick = () => {
    persediaanState.setPanelVisible(true);
  };

  //=========== State Data Master ===============
  const rowIdxListData = useRef(0);
  const rowSelectingListData = (args: any) => {
    rowIdxListData.current = args.rowIndex;
    if (args.data != undefined) {
      if (persediaanState.dialogDetailDataVisible) {
        persediaanState.setDetailKodeRelasi(args.data.kode_relasi);
      }
    }
  };

  const queryCellInfoListData = (args: any) => {
    if (args.column?.field === 'kota') {
      if (getValue('kota', args.data) == '') {
        args.cell.style.background = 'red';
      }
    }
  };

  let gridListData: Grid | any;
  let selectedListData: any[] = [];

  // ======== Handle Modal Popup =========
  const handleBaruClick = () => {
    persediaanState.setDialogMode('BARU');
    persediaanState.setDialogBaruEditPersediaan(true);
  };

  const showEditRecord = () => {
    selectedListData = gridListData.getSelectedRecords();

    if (selectedListData.length > 0) {
      persediaanState.setDialogMode('EDIT');

      persediaanState.setSelectedId(selectedListData[0].kode_item);
      persediaanState.setDialogBaruEditPersediaan(true);
    } else {
      validateAlert('warning', 'Silahkan pilih data Persediaan terlebih dahulu', '#main-target');
    }
  };

  const fetchData = async () => {
    try {
      const persediaanData = await fetchListPersediaan(kode_entitas, formState, token);
      persediaanState.setData(persediaanData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const [kategori, setKategori] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [merk, setMerk] = useState([]);

  const fetchRequiredData = async () => {
    await FillFromSQL(kode_entitas, 'kategori').then((res) => {
      const modifiedData = res.map((item: any, idx: number) => ({ ...item, kode: item.grp, id: idx++ }));
      setKategori(modifiedData);
    });
    await FillFromSQL(kode_entitas, 'kelompok').then((res) => {
      setKelompok(res);
    });
    await FillFromSQL(kode_entitas, 'merk').then((res) => {
      setMerk(res);
    });
  };

  useEffect(() => {
    fetchData();
    fetchRequiredData();
  }, []);

  // Handle Search
  const handleChangeSearchNoPersediaan = (e: any) => {
    persediaanState.setSearchNoPersediaan(e.target.value);
    let temp: any = persediaanState.data.filter((item: any) => item.kode_item.toLowerCase().includes(e.target.value.toLowerCase()));
    setTimeout(() => {
      persediaanState.setData(temp);
    }, 2000);

    return noPersediaanRef?.current?.focus();
  };

  const handleChangeSearchNamaPersediaan = (e: any) => {
    persediaanState.setSearchNamaPersediaan(e.target.value);
    let temp: any = persediaanState.data.filter((item: any) => item.nama_item.toLowerCase().includes(e.target.value.toLowerCase()));

    setTimeout(() => {
      persediaanState.setData(temp);
    }, 2000);

    return namaPersediaanRef?.current?.focus();
  };

  const handleClearSearchNoPersediaan = () => {
    persediaanState.setSearchNoPersediaan('');
    fetchData();
  };

  const handleClearSearchNamaPersediaan = () => {
    persediaanState.setSearchNamaPersediaan('');
    fetchData();
  };

  return (
    <>
      <div className="Main" id="main-target">
        {/* === Title & Button Group === */}
        <div>
          {/* ==== Button Group ==== */}
          <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col justify-between md:flex-row">
            <TopActions
              panelVisible={persediaanState.panelVisible}
              handleBaruClick={handleBaruClick}
              showEditRecord={showEditRecord}
              handleFilterClick={handleFilterClick}
              searchNoPersediaan={persediaanState.searchNoPersediaan}
              searchNamaPersediaan={persediaanState.searchNamaPersediaan}
              handleChangeSearchNoPersediaan={handleChangeSearchNoPersediaan}
              handleChangeSearchNamaPersediaan={handleChangeSearchNamaPersediaan}
              handleClearSearchNoPersediaan={handleClearSearchNoPersediaan}
              handleClearSearchNamaPersediaan={handleClearSearchNamaPersediaan}
              noPersediaanRef={noPersediaanRef}
              namaPersediaanRef={namaPersediaanRef}
              setDialogStatusPersediaan={persediaanState.setDialogStatusPersediaan}
              setDialogKartuStok={persediaanState.setDialogKartuStok}
              setDialogLabelBarcode={persediaanState.setDialogLabelBarcode}
              selectedId={persediaanState.selectedId}
            />
          </div>
        </div>
        {/* === Filter & Table ===*/}
        <div className="relative flex h-full gap-3 sm:h-[calc(80vh_-_100px)]">
          {persediaanState.panelVisible && (
            <div
              className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4  p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                persediaanState.isShowTaskMenu && '!block'
              }`}
              style={{ background: '#dedede' }}
            >
              <div className="flex h-full flex-col pb-3">
                <div className="pb-5">
                  <div className="flex items-center text-center">
                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                      <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                    </button>
                    <div className="shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        {/* prettier-ignore */}
                        <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M22 5.814v.69c0 1.038 0 1.557-.26 1.987-.26.43-.733.697-1.682 1.231l-2.913 1.64c-.636.358-.955.538-1.182.735a2.68 2.68 0 00-.9 1.49c-.063.285-.063.619-.063 1.286v2.67c0 1.909 0 2.863-.668 3.281-.668.418-1.607.05-3.486-.684-.895-.35-1.342-.524-1.594-.879C9 18.907 9 18.451 9 17.542v-2.67c0-.666 0-1-.064-1.285a2.68 2.68 0 00-.898-1.49c-.228-.197-.547-.377-1.183-.735l-2.913-1.64c-.949-.534-1.423-.8-1.682-1.23C2 8.06 2 7.541 2 6.503v-.69"
                        />
                        <path stroke="currentColor" strokeWidth="1.5" d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815" opacity="0.5" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                  </div>
                </div>
                <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                  <form className="flex h-full flex-col gap-6 overflow-auto">
                    <div>
                      <CustomInput
                        title="No. Barang"
                        placeholder="--- No. Barang ---"
                        value={formState.noBarangValue}
                        name="no-barang"
                        setValue={(e: any) => updateFormState('noBarangValue', e.target.value)}
                        isChecked={formState.isNoBarangChecked}
                        setIsChecked={() => updateFormState('isNoBarangChecked', !formState.isNoBarangChecked)}
                      />
                      <CustomInput
                        title="Nama Barang"
                        placeholder="--- Nama Barang ---"
                        name="nama-barang"
                        value={formState.namaBarang}
                        setValue={(e: any) => updateFormState('namaBarang', e.target.value)}
                        isChecked={formState.isNamaBarangChecked}
                        setIsChecked={() => updateFormState('isNamaBarangChecked', !formState.isNamaBarangChecked)}
                      />
                      <CustomInput
                        title="Grup Barang"
                        placeholder="--- Grup Barang ---"
                        name="grup-barang"
                        value={formState.grupBarang}
                        setValue={(e: any) => updateFormState('grupBarang', e.target.value)}
                        isChecked={formState.isGrupBarangChecked}
                        setIsChecked={() => updateFormState('isGrupBarangChecked', !formState.isGrupBarangChecked)}
                      />
                      <CustomInput
                        title="No. Barang (Barcode) Supplier"
                        placeholder="--- No. Barang (Barcode) Supplier ---"
                        name="no-barang-supplier"
                        value={formState.noBarangSupplier}
                        setValue={(e: any) => updateFormState('noBarangSupplier', e.target.value)}
                        isChecked={formState.isNoBarangSupplierChecked}
                        setIsChecked={() => updateFormState('isNoBarangSupplierChecked', !formState.isNoBarangSupplierChecked)}
                      />
                      <CustomInput
                        title="Nama Barang Supplier"
                        placeholder="--- Nama Barang Supplier ---"
                        name="nama-barang-supplier"
                        value={formState.namaBarangSupplier}
                        setValue={(e: any) => updateFormState('namaBarangSupplier', e.target.value)}
                        isChecked={formState.isNamaBarangSupplierChecked}
                        setIsChecked={() => updateFormState('isNamaBarangSupplierChecked', !formState.isNamaBarangSupplierChecked)}
                      />
                      {/* <CustomInput
                        title="Kategori"
                        placeholder="--- Kategori ---"
                        name="kategori"
                        value={formState.kategori}
                        setValue={(e: any) => updateFormState('kategori', e.target.value)}
                        isChecked={formState.isKategoriChecked}
                        setIsChecked={() => updateFormState('isKategoriChecked', !formState.isKategoriChecked)}
                      /> */}

                      <label className="mt-3 flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name="kategori"
                          className="form-checkbox"
                          checked={formState.kategori ? !formState.isKategoriChecked : formState.isKategoriChecked}
                          onChange={() => updateFormState('isKategoriChecked', !formState.isKategoriChecked)}
                        />
                        <span>Kategori</span>
                      </label>
                      <select
                        name=""
                        onChange={(e: any) => updateFormState('kategori', e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-4 py-1 text-xs text-gray-900 focus:border-slate-600 focus:ring-slate-600"
                      >
                        <option selected value="" disabled>
                          --- Kategori ---
                        </option>
                        {kategori.map((item: any, idx: number) => (
                          <option key={idx} value={item.grp}>
                            {item.grp}
                          </option>
                        ))}
                      </select>
                      {/* <CustomInput
                        title="Kelompok Produk"
                        placeholder="--- Kelompok Produk ---"
                        name="kelompok-produk"
                        value={formState.kelompokProduk}
                        setValue={(e: any) => updateFormState('kelompokProduk', e.target.value)}
                        isChecked={formState.isKelompokProdukChecked}
                        setIsChecked={() => updateFormState('isKelompokProdukChecked', !formState.isKelompokProdukChecked)}
                      /> */}
                      <label className="mt-3 flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name="kelompok"
                          className="form-checkbox"
                          checked={formState.kelompokProduk ? !formState.isKelompokProdukChecked : formState.isKelompokProdukChecked}
                          onChange={() => updateFormState('isKelompokProdukChecked', !formState.isKelompokProdukChecked)}
                        />
                        <span>Kelompok</span>
                      </label>
                      <select
                        name=""
                        onChange={(e: any) => updateFormState('kelompokProduk', e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-4 py-1 text-xs text-gray-900 focus:border-slate-600 focus:ring-slate-600"
                      >
                        <option selected value="" disabled>
                          --- Kelompok ---
                        </option>
                        {kelompok.map((item: any, idx: number) => (
                          <option key={idx} value={item.kel}>
                            {item.kel}
                          </option>
                        ))}
                      </select>
                      {/* <CustomInput
                        title="Merek Produk"
                        placeholder="--- Merek Produk ---"
                        name="merek-produk"
                        value={formState.merekProduk}
                        setValue={(e: any) => updateFormState('merekProduk', e.target.value)}
                        isChecked={formState.isMerekProdukChecked}
                        setIsChecked={() => updateFormState('isMerekProdukChecked', !formState.isMerekProdukChecked)}
                      /> */}
                      <label className="mt-3 flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name="merk"
                          className="form-checkbox"
                          checked={formState.merekProduk ? !formState.isMerekProdukChecked : formState.isMerekProdukChecked}
                          onChange={() => updateFormState('isMerekProdukChecked', !formState.isMerekProdukChecked)}
                        />
                        <span>Merk</span>
                      </label>
                      <select
                        name=""
                        onChange={(e: any) => updateFormState('merekProduk', e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-4 py-1 text-xs text-gray-900 focus:border-slate-600 focus:ring-slate-600"
                      >
                        <option selected value="" disabled>
                          --- Merk ---
                        </option>
                        {merk.map((item: any, idx: number) => (
                          <option key={idx} value={item.merk}>
                            {item.merk}
                          </option>
                        ))}
                      </select>
                      <CustomInput
                        title="Tipe"
                        placeholder="--- Tipe ---"
                        name="tipe"
                        value={formState.tipe}
                        setValue={(e: any) => updateFormState('tipe', e.target.value)}
                        isChecked={formState.isTipeChecked}
                        setIsChecked={() => updateFormState('isTipeChecked', !formState.isTipeChecked)}
                      />
                      <RadioInputGroup
                        title="Aktivasi"
                        name="aktivasi"
                        checkedValue={formState.aktivasiState}
                        onChange={(value) => updateFormState('aktivasiState', value)}
                        options={ACTIVATION_STATUS_FILTER}
                      />
                      <RadioInputGroup title="Status" name="status" checkedValue={formState.statusState} onChange={(value) => updateFormState('statusState', value)} options={ITEM_STATUS_FILTER} />
                      <RadioInputGroup
                        title="Paket Produk"
                        name="paket-produk"
                        checkedValue={formState.paketProdukState}
                        onChange={(value) => updateFormState('paketProdukState', value)}
                        options={PAKET_FILTER}
                      />
                      <RadioInputGroup
                        title="Barang Konsinyasi"
                        name="barang-konsinyasi"
                        checkedValue={formState.barangKonsinyasiState}
                        onChange={(value) => updateFormState('barangKonsinyasiState', value)}
                        options={KONSIYANSI_FILTER}
                      />
                      <RadioInputGroup
                        title="Data Eksport"
                        name="data-eksport"
                        checkedValue={formState.dataEksportState}
                        onChange={(value) => updateFormState('dataEksportState', value)}
                        options={DATA_EKSPORT_FILTER}
                      />
                      <RadioInputGroup
                        title="Barang Kontrak PPN"
                        name="barang-kontrak-ppn"
                        checkedValue={formState.barangKontrakState}
                        onChange={(value) => updateFormState('barangKontrakState', value)}
                        options={BARANG_KONTRAK_PPN_FILTER}
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          fetchData();
                        }}
                        className="btn btn-primary mt-2"
                      >
                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Refresh Data
                      </button>
                    </div>
                  </form>
                </PerfectScrollbar>
              </div>
            </div>
          )}
          <div
            className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${persediaanState.isShowTaskMenu && '!block xl:!hidden'}`}
            onClick={() => persediaanState.setIsShowTaskMenu(!persediaanState.isShowTaskMenu)}
          ></div>
          <div className="h-full flex-1 overflow-auto">
            <div className="cursor flex items-center ltr:mr-3 rtl:ml-3">
              <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => persediaanState.setIsShowTaskMenu(!persediaanState.isShowTaskMenu)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <GridComponent
              id="gridListData"
              ref={(g) => (gridListData = g)}
              locale="id"
              dataSource={persediaanState.data}
              allowExcelExport={true}
              excelExportComplete={() => {}}
              allowPdfExport={true}
              pdfExportComplete={() => {}}
              editSettings={{ allowDeleting: true }}
              selectionSettings={{
                mode: 'Row',
                type: 'Single',
              }}
              allowPaging={true}
              allowSorting={true}
              // allowGrouping={true}
              allowFiltering={false}
              allowResizing={true}
              autoFit={true}
              allowReordering={true}
              pageSettings={{
                pageSize: 25,
                pageCount: 5,
                pageSizes: ['25', '50', '100', 'All'],
              }}
              rowHeight={22}
              height={'100%'}
              gridLines={'Both'}
              loadingIndicator={{ indicatorType: 'Shimmer' }}
              queryCellInfo={queryCellInfoListData}
              rowSelecting={rowSelectingListData}
              dataBound={() => {
                //Selecting row after the refresh Complete
                if (gridListData) {
                  gridListData.selectRow(rowIdxListData.current);
                }
              }}
              recordDoubleClick={(args: any) => {
                if (gridListData) {
                  const rowIndex: number = args.row.rowIndex;
                  gridListData.selectRow(rowIndex);
                  showEditRecord();
                }
              }}
              recordClick={(args: any) => {
                if (args.rowData) {
                  persediaanState.setSelectedId(args.rowData.kode_item);
                }
              }}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="no_item"
                  headerText="No. Barang"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="110"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="nama_item"
                  headerText="Nama Barang"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="180"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="nama_grp"
                  headerText="Grup Barang"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="80"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="tipe"
                  headerText="Tipe"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="80"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="grp"
                  headerText="Kategori"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="80"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="kustom10"
                  headerText="Kelompok Produk"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="100"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="kustom4"
                  headerText="Merek Produk"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="100"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="satuan"
                  headerText="Satuan"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="70"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="berat"
                  headerText="Berat"
                  headerTextAlign="Center"
                  textAlign="Right"
                  // autoFit
                  width="70"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="tebal"
                  headerText="Diameter"
                  headerTextAlign="Center"
                  textAlign="Right"
                  // autoFit
                  width="70"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="STATUS"
                  headerText="Aktivasi"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="70"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="status_item"
                  headerText="Status"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="70"
                  clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                  field="kode_item"
                  headerText="UID"
                  headerTextAlign="Center"
                  textAlign="Left"
                  // autoFit
                  width="auto"
                  clipMode="EllipsisWithTooltip"
                />
              </ColumnsDirective>
              <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
            </GridComponent>
          </div>
        </div>
        {/* Dialog */}
        {persediaanState.dialogBaruEditPersediaan && (
          <DialogBaruEditPersediaan
            masterState={persediaanState.dialogMode}
            entitas={kode_entitas}
            token={token}
            userid={userid}
            itemId={persediaanState.selectedId}
            isOpen={persediaanState.dialogBaruEditPersediaan}
            onClose={() => {
              persediaanState.setDialogBaruEditPersediaan(false);
            }}
          />
        )}
        {/* Dialog - Kartu Stok */}
        {persediaanState.dialogKartuStok && (
          <DialogKartuStok
            isOpen={persediaanState.dialogKartuStok}
            onClose={() => {
              persediaanState.setDialogKartuStok(false);
            }}
            entitas={kode_entitas}
            token={token}
            itemId={persediaanState.selectedId}
          />
        )}
        {/* Dialog - Label Barcode */}
        {persediaanState.dialogLabelBarcode && (
          <DialogLabelBarcode
            isOpen={persediaanState.dialogLabelBarcode}
            onClose={() => {
              persediaanState.setDialogLabelBarcode(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default PersediaanList;
