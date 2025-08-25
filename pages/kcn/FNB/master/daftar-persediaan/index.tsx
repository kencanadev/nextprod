import React, { useEffect, useRef, useState } from 'react';

// Syncfusion
import {
  Grid,
  GridComponent,
  ColumnDirective,
  ColumnsDirective,
  Inject,
  Page,
  Edit,
  Sort,
  Filter,
  Group,
  Resize,
  Reorder,
  Selection,
  ExcelExport,
  PdfExport,
  CommandColumn,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '@/pages/api/sessionContext';
import moment from 'moment';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import axios from 'axios';
import swal from 'sweetalert2';
import { FillFromSQL } from '@/utils/routines';
import DialogFrmPersediaan from './components/DialogFrmPersediaan';

// Styling
const styleButton = { width: 77 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const DaftarPersediaan = () => {
  // Sessions
  const { sessionData, isLoading } = useSession();

  const entitas_user = sessionData?.entitas ?? '';
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const userid = sessionData?.userid ?? '';
  const kode_user = sessionData?.kode_user ?? '';
  const token = sessionData?.token ?? '';

  if (isLoading) {
    return;
  }

  //   Global State Management
  const [data, setData] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [merek, setMerek] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [searchNoDok, setSearchNoDok] = useState('');
  const [searchNamaItem, setSearchNamaItem] = useState('');
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [statusPage, setStatusPage] = useState('');

  // Filter State Management
  const [filterData, setFilterData] = useState({
    noBarangValue: '',
    isNoBarangChecked: false,
    namaBarangValue: '',
    isNamaBarangChecked: false,
    grupBarangValue: '',
    isGrupBarangChecked: false,
    noBarangBarcodeValue: '',
    isNoBarangBarcodeChecked: false,
    namaBarangSuppValue: '',
    isNamaBarangSuppChecked: false,
    kategoriValue: '',
    isKategoriChecked: false,
    kelompokValue: '',
    isKelompokChecked: false,
    merekValue: '',
    isMerekChecked: false,
    tipeValue: '',
    isTipeChecked: false,
    aktivasiValue: 'Semua',
    statusValue: 'Semua',
    paketProdukValue: 'Semua',
    barangKonsiyansiValue: 'Semua',
    dataEksportValue: 'Semua',
    barangKontrakPpnValue: 'Semua',
  });

  const updateStateFilter = (field: any, value: any) => {
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Refs
  const noDokumenRef = useRef<HTMLInputElement>(null);
  const namaItemRef = useRef<HTMLInputElement>(null);
  const gridListData = useRef<GridComponent>(null);

  // Global Functions
  const handleFilterClick = () => {
    setPanelVisible(true);
  };

  const handleNavigateLink = (jenis: string) => {
    setShowModalCreate(false);
    if (jenis === 'ubah') {
      if (selectedItem) {
        setStatusPage('UBAH');
        setShowModalCreate(true);
      } else {
        swal.fire({
          title: 'Warning',
          text: 'Silahkan pilih data terlebih dahulu.',
          icon: 'warning',
        });
        return;
      }
    } else if (jenis === 'baru') {
      setStatusPage('BARU');
      setShowModalCreate(true);
    }
  };

  //   Fetch Data
  const fetchData = async () => {
    const params = {
      entitas: kode_entitas,
      param1: filterData.isNoBarangChecked ? filterData.noBarangValue : 'all',
      param2: filterData.isNamaBarangChecked ? filterData.namaBarangValue : 'all',
      param3: filterData.isGrupBarangChecked ? filterData.grupBarangValue : 'all',
      param4: filterData.isNoBarangBarcodeChecked ? filterData.noBarangBarcodeValue : 'all',
      param5: filterData.isNamaBarangSuppChecked ? filterData.namaBarangSuppValue : 'all',
      param6: filterData.isKategoriChecked ? filterData.kategoriValue : 'all',
      param7: filterData.isKelompokChecked ? filterData.kelompokValue : 'all',
      param8: filterData.isMerekChecked ? filterData.merekValue : 'all',
      param9: filterData.isTipeChecked ? filterData.tipeValue : 'all',
      param10: filterData.aktivasiValue === 'Semua' ? 'all' : filterData.aktivasiValue,
      param11: filterData.statusValue === 'Semua' ? 'all' : filterData.statusValue,
      param12: filterData.paketProdukValue === 'Semua' ? 'all' : filterData.paketProdukValue === 'Tidak' ? 'N' : 'Y',
      param13: filterData.barangKonsiyansiValue === 'Semua' ? 'all' : filterData.barangKonsiyansiValue === 'Tidak' ? 'N' : 'Y',
      param14: filterData.dataEksportValue === 'Semua' ? 'all' : filterData.dataEksportValue === 'Tidak' ? 'N' : 'Y',
      param15: filterData.barangKontrakPpnValue === 'Semua' ? 'all' : filterData.barangKontrakPpnValue === 'Tidak' ? 'N' : 'Y',
    };
    try {
      const res = await axios.get(`${apiUrl}/erp/list_persediaan`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data.data);
      gridListData.current?.setProperties({ dataSource: res.data.data });
      gridListData.current?.refresh();
    } catch (error) {
      console.error('Error Fetching List: ', error);
    }
  };

  const fetchRequiredData = () => {
    // Kategori
    FillFromSQL(kode_entitas, 'kategori')
      .then((res) => {
        setKategori(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Kelompok
    FillFromSQL(kode_entitas, 'kelompok')
      .then((res) => {
        setKelompok(res);
      })
      .catch((err) => {
        console.error(err);
      });

    // Merek
    FillFromSQL(kode_entitas, 'merk')
      .then((res) => {
        setMerek(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchData();
    fetchRequiredData();
  }, []);

  //   Search Functionallity
  const handleSearchNoDok = (e: any) => {
    setSearchNoDok(e.target.value);

    let temp = data.filter((item: any) => item.kode_item.toLowerCase().includes(e.target.value.toLowerCase()));

    setFilteredData(temp);

    return noDokumenRef.current?.focus();
  };

  const handleClearNoDok = () => {
    setSearchNoDok('');
    // fetchData()
  };

  const handleSearchNamaItem = (e: any) => {
    setSearchNamaItem(e.target.value);
    let temp = data.filter((item: any) => item.nama_item.toLowerCase().includes(e.target.value.toLowerCase()));

    setFilteredData(temp);

    return namaItemRef.current?.focus();
  };

  const handleClearNamaItem = () => {
    setSearchNamaItem('');
    // fetchData()
  };

  // Grid configuration
  const gridOptions = {
    /**
     * page settings menyebabkan refresh terjadi ketika row selected.
     * jadi boleh dikomen untuk mencegah refresh ketika row selected.
     */
    pageSettings: {
      pageSize: 25,
      pageCount: 5,
      pageSizes: ['25', '50', '100', 'All'],
    },
    selectionSettings: {
      mode: 'Row',
      type: 'Single',
    },
    allowPaging: true,
    allowSorting: true,
    allowFiltering: false,
    allowResizing: true,
    autoFit: true,
    allowReordering: true,
    rowHeight: 22,
    height: '100%',
    gridLines: 'Both',
    // loadingIndicator: { indicatorType: 'Shimmer' },
  };

  return (
    <div className={`Main ${showModalCreate ? 'h-[100vh]' : 'h-[75vh]'}`} id="main-target">
      {/* === Search Group & Button Group === */}
      <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col items-center justify-between md:flex-row">
        <div className="gap=2 sm:flex">
          {/* === Button Group === */}
          <div className="flex pr-1 sm:border-r">
            <ButtonComponent id="btnDataBaru" cssClass="e-primary e-small" content="Baru" style={styleButton} disabled={false} onClick={() => handleNavigateLink('baru')} />
            <ButtonComponent id="btnDataUbah" cssClass="e-primary e-small" content="Ubah" disabled={false} style={styleButton} onClick={() => handleNavigateLink('ubah')} />
            <ButtonComponent
              id="btnFilter"
              cssClass="e-primary e-small"
              style={
                panelVisible
                  ? {
                      width: '57px',
                      height: '28px',
                      marginBottom: '0.5em',
                      marginTop: '0.5em',
                      marginRight: '0.8em',
                    }
                  : { ...styleButton, color: 'white' }
              }
              onClick={handleFilterClick}
              disabled={panelVisible}
              content="Filter"
            />
          </div>

          {/* === Search Group === */}
          <div className="ml-3 mt-1.5 flex max-w-xl items-center gap-3">
            {/* Search No Dokumen */}
            <div className="relative w-[200px]">
              <input
                type="text"
                id="searchNoDokumen"
                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="< No. Item >"
                style={{ height: '4vh' }}
                value={searchNoDok}
                ref={noDokumenRef}
                onChange={handleSearchNoDok}
              />
              {searchNoDok && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  onClick={handleClearNoDok}
                >
                  &times;
                </button>
              )}
            </div>

            {/* Search Keterangan */}
            <div className="relative w-[200px]">
              <input
                type="text"
                id="searchNamaItem"
                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="< Nama Item >"
                style={{ height: '4vh' }}
                value={searchNamaItem}
                ref={namaItemRef}
                onChange={handleSearchNamaItem}
              />
              {searchNamaItem && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  onClick={handleClearNamaItem}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Actions Group */}
          <div className="ml-3 flex items-center">
            <ButtonComponent id="btnStatusPersediaan" cssClass="e-primary e-small" content="Status Persediaan" style={{ ...styleButton, width: 'auto' }} disabled={true} onClick={() => {}} />
            <ButtonComponent id="btnKartuStok" cssClass="e-primary e-small" content="Kartu Stok" style={{ ...styleButton, width: 'auto' }} disabled={true} onClick={() => {}} />
            <ButtonComponent id="btnLabelBarcode" cssClass="e-primary e-small" content="Label Barcode" style={{ ...styleButton, width: 'auto' }} disabled={true} onClick={() => {}} />
            <ButtonComponent id="btnUpdateHarga" cssClass="e-primary e-small" content="Update Harga" style={{ ...styleButton, width: 'auto' }} disabled={true} onClick={() => {}} />
            <ButtonComponent id="btnGrupBarang" cssClass="e-primary e-small" content="Grup Barang" style={{ ...styleButton, width: 'auto' }} disabled={true} onClick={() => {}} />
          </div>
        </div>

        <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
            Daftar Persediaan
          </span>
        </div>
      </div>

      {/* === Filter & Table === */}
      <div className="relative flex h-[calc(100vh-230px)] gap-3">
        {/* === Filter === */}
        {panelVisible && (
          <div
            className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
              isShowTaskMenu && '!block'
            }`}
            style={{ background: '#dedede' }}
          >
            <div className="flex h-full flex-col pb-3">
              <div className="pb-5">
                <div className="flex items-center text-center">
                  <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={() => setPanelVisible(!panelVisible)}>
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
                <div className="flex h-full flex-col gap-6 overflow-auto">
                  {/* Filter List */}
                  <div>
                    {/* No Dokumen */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="No. Barang"
                        checked={filterData.isNoBarangChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          updateStateFilter('isNoBarangChecked', value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={filterData.noBarangValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            updateStateFilter('noBarangValue', value);
                            updateStateFilter('isNoBarangChecked', value.length > 0);
                          }}
                        />
                      </div>
                    </div>

                    {/* Nama Barang */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Nama Barang"
                        checked={filterData.isNamaBarangChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          updateStateFilter('isNamaBarangChecked', value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={filterData.namaBarangValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            updateStateFilter('namaBarangValue', value);
                            updateStateFilter('isNamaBarangChecked', value.length > 0);
                          }}
                        />
                      </div>
                    </div>

                    {/* Grup Barang */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Grup Barang"
                        checked={filterData.isGrupBarangChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          updateStateFilter('isGrupBarangChecked', value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={filterData.grupBarangValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            updateStateFilter('grupBarangValue', value);
                            updateStateFilter('isGrupBarangChecked', value.length > 0);
                          }}
                        />
                      </div>
                    </div>

                    {/* No Barang Barcode Supp */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="No. Barang (Barcode) Supplier"
                        checked={filterData.isNoBarangBarcodeChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          updateStateFilter('isNoBarangBarcodeChecked', value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={filterData.noBarangBarcodeValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            updateStateFilter('noBarangBarcodeValue', value);
                            updateStateFilter('isNoBarangBarcodeChecked', value.length > 0);
                          }}
                        />
                      </div>
                    </div>

                    {/* Nama Barang Supp */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Nama Barang Supplier"
                        checked={filterData.isNamaBarangSuppChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          updateStateFilter('isNamaBarangSuppChecked', value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={filterData.namaBarangSuppValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            updateStateFilter('namaBarangSuppValue', value);
                            updateStateFilter('isNamaBarangSuppChecked', value.length > 0);
                          }}
                        />
                      </div>
                    </div>

                    {/* kategori Produk */}
                    <div>
                      <div className="mt-2 flex">
                        <CheckBoxComponent
                          label="Kategori"
                          checked={filterData.isKategoriChecked}
                          change={(args: ChangeEventArgsButton) => {
                            const value: any = args.checked;
                            updateStateFilter('isKategoriChecked', value);
                          }}
                          style={{ borderRadius: 3, borderColor: 'gray' }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between">
                        <div className="container form-input">
                          <ComboBoxComponent
                            autofill
                            showClearButton={false}
                            id="kategori"
                            className="form-select"
                            dataSource={kategori}
                            fields={{ value: 'grp', text: 'grp' }}
                            placeholder="--Silahkan Pilih--"
                            value={filterData.kategoriValue}
                            change={(args: any) => {
                              const value = args.value;
                              updateStateFilter('kategoriValue', value);
                              updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kelompok Produk */}
                    <div>
                      <div className="mt-2 flex">
                        <CheckBoxComponent
                          label="Kelompok Produk"
                          checked={filterData.isKelompokChecked}
                          change={(args: ChangeEventArgsButton) => {
                            const value: any = args.checked;
                            updateStateFilter('isKelompokChecked', value);
                          }}
                          style={{ borderRadius: 3, borderColor: 'gray' }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between">
                        <div className="container form-input">
                          <ComboBoxComponent
                            autofill
                            showClearButton={false}
                            id="kelompok"
                            className="form-select"
                            dataSource={kelompok}
                            fields={{ value: 'kel', text: 'kel' }}
                            placeholder="--Silahkan Pilih--"
                            value={filterData.kelompokValue}
                            change={(args: any) => {
                              const value = args.value;
                              updateStateFilter('kelompokValue', value);
                              updateStateFilter('isKelompokChecked', value?.length > 0 ? true : false);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Merek Produk */}
                    <div>
                      <div className="mt-2 flex">
                        <CheckBoxComponent
                          label="Merek Produk"
                          checked={filterData.isMerekChecked}
                          change={(args: ChangeEventArgsButton) => {
                            const value: any = args.checked;
                            updateStateFilter('isMerekChecked', value);
                          }}
                          style={{ borderRadius: 3, borderColor: 'gray' }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between">
                        <div className="container form-input">
                          <ComboBoxComponent
                            autofill
                            showClearButton={false}
                            id="merel"
                            className="form-select"
                            dataSource={merek}
                            fields={{ value: 'merk', text: 'merk' }}
                            placeholder="--Silahkan Pilih--"
                            value={filterData.merekValue}
                            change={(args: any) => {
                              const value = args.value;
                              updateStateFilter('merekValue', value);
                              updateStateFilter('isMerekChecked', value?.length > 0 ? true : false);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tipe */}
                    <div>
                      <div className="mt-2 flex">
                        <CheckBoxComponent
                          label="Tipe"
                          checked={filterData.isTipeChecked}
                          change={(args: ChangeEventArgsButton) => {
                            const value: any = args.checked;
                            updateStateFilter('isTipeChecked', value);
                          }}
                          style={{ borderRadius: 3, borderColor: 'gray' }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between">
                        <div className="container form-input">
                          <ComboBoxComponent
                            autofill
                            showClearButton={false}
                            id="kelompok"
                            className="form-select"
                            dataSource={[
                              {
                                str: 'Persediaan',
                              },
                              {
                                str: 'Non Persediaan',
                              },
                              {
                                str: 'Jasa/Service',
                              },
                            ]}
                            fields={{ value: 'str', text: 'str' }}
                            placeholder="--Silahkan Pilih--"
                            value={filterData.tipeValue}
                            change={(args: any) => {
                              const value = args.value;
                              updateStateFilter('tipeValue', value);
                              updateStateFilter('isTipeChecked', value?.length > 0 ? true : false);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Aktivasi */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Aktivasi</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Aktif', 'Slow Moving', 'Non Aktif', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex items-center">
                            <input
                              type="radio"
                              name="aktivasi"
                              value={option}
                              checked={filterData.aktivasiValue === option}
                              onChange={(e) => updateStateFilter('aktivasiValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Approval */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Status</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Continue', 'Insidentil', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex flex-wrap items-center">
                            <input
                              type="radio"
                              name="status"
                              value={option}
                              checked={filterData.statusValue === option}
                              onChange={(e) => updateStateFilter('statusValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Paket Produk */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Paket Produk</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Ya', 'Tidak', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex flex-wrap items-center">
                            <input
                              type="radio"
                              name="paket-produk"
                              value={option}
                              checked={filterData.paketProdukValue === option}
                              onChange={(e) => updateStateFilter('paketProdukValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Barang Konsinyansi */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Barang Konsinyansi</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Ya', 'Tidak', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex flex-wrap items-center">
                            <input
                              type="radio"
                              name="barang-konsinyansi"
                              value={option}
                              checked={filterData.barangKonsiyansiValue === option}
                              onChange={(e) => updateStateFilter('barangKonsiyansiValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Data Eksport */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Data Eksport</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Ya', 'Tidak', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex flex-wrap items-center">
                            <input
                              type="radio"
                              name="data-eksport"
                              value={option}
                              checked={filterData.dataEksportValue === option}
                              onChange={(e) => updateStateFilter('dataEksportValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Barang Kontrak PPN */}
                    <div>
                      <div className="mt-3 font-bold">
                        <span>Barang Kontrak PPN</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2">
                        {['Ya', 'Tidak', 'Semua'].map((option) => (
                          <label key={option} className="inline-flex flex-wrap items-center">
                            <input
                              type="radio"
                              name="barang-kontrak-ppn"
                              value={option}
                              checked={filterData.barangKontrakPpnValue === option}
                              onChange={(e) => updateStateFilter('barangKontrakPpnValue', e.currentTarget.value)}
                              className="form-radio"
                            />
                            <span className="ml-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="flex justify-center">
                    <button type="button" onClick={fetchData} className="btn btn-primary mt-2">
                      <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                      Refresh Data
                    </button>
                  </div>
                </div>
              </PerfectScrollbar>
            </div>
          </div>
        )}

        <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>
        {/* === Table === */}
        <div className="h-full flex-1 overflow-auto">
          <GridComponent
            {...gridOptions}
            dataSource={searchNoDok !== '' || searchNamaItem !== '' ? filteredData : data}
            ref={gridListData}
            rowSelected={(args) => setSelectedItem(args.data)}
            locale="id"
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
                template={(props: any) => {
                  return <span>{parseFloat(props.berat).toLocaleString('en-Us')}</span>;
                }}
              />
              <ColumnDirective
                field="tebal"
                headerText="Diameter"
                headerTextAlign="Center"
                textAlign="Right"
                format="N0"
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
                width="120"
                clipMode="EllipsisWithTooltip"
              />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
          </GridComponent>
        </div>
      </div>
      {/* === Dialog === */}
      {showModalCreate ? (
        <DialogFrmPersediaan
          isOpen={showModalCreate}
          onClose={() => setShowModalCreate(false)}
          statusPage={statusPage}
          token={token}
          kode_entitas={kode_entitas}
          kode_dokumen={selectedItem.no_item}
          onRefresh={fetchData}
        />
      ) : null}
    </div>
  );
};

export default DaftarPersediaan;
