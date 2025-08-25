import React, { useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';

import { TooltipComponent } from '@syncfusion/ej2-react-popups';
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
  AggregatesDirective,
  AggregateDirective,
  AggregateColumnsDirective,
  AggregateColumnDirective,
  Aggregate,
} from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ContextMenuComponent, MenuEventArgs, MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';

import styles from './historyJurnal.module.css';
import moment from 'moment';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { listDokumen } from './constants';
import { fetchHistoriJurnalTransaksi } from './api';
import ModalJurnalUmum from '../ju/modal/ju';
import DialogCreateBM from '../bm/component/DialogCreateBM';
import FrmPraBkk from '../bkk/component/frmPraBkk';
import DialogCreatePS from '../../inventory/ps/component/dialogCreatePS';
import { appBackdate } from '@/utils/routines';
import { result } from 'lodash';
import axios from 'axios';
import DialogPhuList from '../phu/component/dialogPhuList';
import DialogPhuListTransfer from '../phu/component/dialogPhuListTransfer';
import DialogPhuListWarkat from '../phu/component/dialogPhuListWarkat';
import DialogTtbList from '../../inventory/ttb/component/dialogTtbList';
import DialogPpiListTunai from '../ppi/component/dialogPpiListTunai';
import DialogPpiListTransfer from '../ppi/component/dialogPpiListTransfer';
import DialogPpiListWarkat from '../ppi/component/dialogPpiListWarkat';
import FrmMk from '../../sales/mk/component/frmMk';
L10n.load(idIDLocalization);
enableRipple(true);

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const HistoryJurnalTransaksi = () => {
  // Sessions
  const { sessionData, isLoading } = useSession();
  const entitas_user = sessionData?.entitas ?? '';
  const kode_entitas = sessionData?.kode_entitas ?? '';
  const entitas = sessionData?.entitas ?? '';
  const token = sessionData?.token ?? '';
  const userid = sessionData?.userid ?? '';
  const kode_user = sessionData?.kode_user ?? '';

  if (isLoading) {
    return;
  }

  // State management
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
  const [selectedRow, setSelectedRow] = useState('');
  const [searchNoBukti, setSearchNoBukti] = useState('');
  const [searchKeterangan, setSearchKeterangan] = useState('');
  const [selectedDokumen, setSelectedDokumen] = useState('');
  const [selectedJuKode, setSelectedJuKode] = useState('');

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalJurnalUmum, setModalJurnalUmum] = useState(false);
  const [showModalBM, setShowModalBM] = useState(false);
  const [showModalBK, setShowModalBK] = useState(false);
  const [showModalPS, setShowModalPS] = useState(false);
  const [showModalPHU, setShowModalPHU] = useState(false);
  const [showModalTtb, setShowModalTtb] = useState(false);
  const [showModalPU, setShowModalPU] = useState(false);
  const [showModalMK, setShowModalMK] = useState(false);

  // State Helper BK
  const stateDokumen = {
    kode_entitas: kode_entitas,
    kode_user: kode_user,
    userid: userid,
    jenisUpdateBKK: 0,
    CON_BKK: 'BKK',
    masterKodeDokumen: selectedJuKode,
    masterDataState: 'EDIT',
    jenisTab: 'Approved',
    token: token,
  };

  // State Helper PS
  const [dataTemp, setDataTemp] = useState<any>([]);
  const [valueAppBackdate, setValueAppBackdate] = useState(true);

  // State Helper PHU
  const [tipePHU, setTipePHU] = useState('');
  const [kodeSupp, setKodeSupp] = useState('');

  // State Helper PPI
  const [tipePPI, setTipePPI] = useState('');

  // Date handling
  const [date1, setDate1] = useState(moment());
  const [date2, setDate2] = useState(moment().endOf('month'));
  const [isDateRangeChecked, setIsDateRangeChecked] = useState(true);

  // Document handling
  const [checkedItems, setCheckedItems] = useState<any>({});
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [noDokumenValue, setNoDokumenValue] = useState('');
  const [isNoDokumen, setIsNoDokumen] = useState(false);
  const [isSelisihChecked, setIsSelisihChecked] = useState(false);
  const [namaAkunValue, setNamaAkunValue] = useState('');
  const [isNamaAkun, setIsNamaAkun] = useState(false);
  const [subledgerValue, setSubledgerValue] = useState('');
  const [isSubledger, setIsSubledger] = useState(false);

  // Refs

  const noBuktiRef = useRef<HTMLInputElement>(null);
  const keteranganRef = useRef<HTMLInputElement>(null);
  const gridListData = useRef<GridComponent>(null);
  let cMenuCetak: ContextMenuComponent;

  // Handle individual checkbox changes
  const handleCheckboxChange = (id: any, kode: any) => {
    const newCheckedItems: any = { ...checkedItems };
    if (newCheckedItems[id]) {
      delete newCheckedItems[id];
    } else {
      newCheckedItems[id] = kode;
    }
    setCheckedItems(newCheckedItems);
    setIsAllSelected(Object.keys(newCheckedItems).length === listDokumen.length);
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Clear all selections
      setCheckedItems({});
      setIsAllSelected(false);
    } else {
      // Select all items
      const allItems: any = {};
      listDokumen.forEach((item) => {
        allItems[item.id] = item.kode;
      });
      setCheckedItems(allItems);
      setIsAllSelected(true);
    }
  };

  const HandleTgl = async (date: any, tipe: string, setDate1: Function, setDate2: Function, setIsDateRangeChecked: Function) => {
    if (tipe === 'tanggalAwal') {
      setDate1(date);
      setIsDateRangeChecked(true);
    } else {
      setDate2(date);
      setIsDateRangeChecked(true);
    }
  };

  const handleInputChange = (event: string, setValue: Function, setIsValue: Function) => {
    const newValue = event;
    setValue(newValue);
    setIsValue(newValue.length > 0);
  };

  // Ref
  const handleRowSelected = async (args: any) => {
    setSelectedJuKode(args.rowData.kode_dokumen);
    setSelectedDokumen(args.rowData.dokumen);
    const dokumen = args.rowData.dokumen;
    if (dokumen === 'JU') {
      setModalJurnalUmum(true);
      setIsModalOpen(true);
    } else if (dokumen === 'BM') {
      setShowModalBM(true);
      setIsModalOpen(true);
    } else if (dokumen === 'BK') {
      setShowModalBK(true);
      setIsModalOpen(true);
    } else if (dokumen === 'PS') {
      setShowModalPS(true);
      setIsModalOpen(true);
    } else if (dokumen === 'BB') {
      let tipe_phu = '';
      await axios
        .get(`${apiUrl}/erp/list_edit_phu`, {
          params: {
            entitas: kode_entitas,
            param1: 'IDR',
            param2: args.rowData.kode_dokumen,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTipePHU(res.data.data.master[0].kosong);
          setKodeSupp(res.data.data.master[0].kode_supp);
          tipe_phu = res.data.data.master[0].kosong;
        })
        .catch((err) => console.error(err));

      setShowModalPHU(true);
      setIsModalOpen(true);
    } else if (dokumen === 'TB') {
      setShowModalTtb(true);
      setIsModalOpen(true);
    } else if (dokumen === 'PU') {
      await axios
        .get(`${apiUrl}/erp/master_detail_ppi`, {
          params: {
            entitas: kode_entitas,
            param1: args.rowData.kode_dokumen,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log('Warkat: ', res.data.data.master[0].kosong);
          if (res.data.data.master[0].kosong === 'B') {
            setTipePPI('Warkat');
          } else if (res.data.data.master[0].kosong === null && res.data.data.master[0].no_warkat === null) {
            setTipePPI('Tunai');
          } else if (res.data.data.master[0].kosong === null && res.data.data.master[0].no_warkat !== null) {
            setTipePPI('Transfer');
          }
        })
        .catch((err) => console.log(err));

      setShowModalPU(true);
      setIsModalOpen(true);
    } else if (dokumen === 'MK') {
      setShowModalMK(true);
      setIsModalOpen(true);
    }
  };

  function btnPrintClick(e: any): void {
    var clientRect = (e.target as Element).getBoundingClientRect();
    cMenuCetak.open(clientRect.bottom, clientRect.left);
  }

  let menuCetakItems: MenuItemModel[] = [
    {
      iconCss: 'e-icons e-thumbnail',
      text: 'Daftar Bukti Jurnal Umum',
    },
  ];

  function menuCetakSelect(args: MenuEventArgs) {
    OnClick_CetakForm(selectedRow, args.item.id, args.item.text);
  }

  const OnClick_CetakForm = (selectedRowKode: any, tag: any, namaMenuCetak: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);

    const noDok = noDokumenValue ? noDokumenValue : 'all';
    const namaAkun = namaAkunValue ? namaAkunValue : 'all';
    const subledger = subledgerValue ? subledgerValue : 'all';

    let iframeSrc = `./history-jurnal-transaksi/reports/kartu_detail_jurnal?entitas=${kode_entitas}&dokumen=${Object.values(checkedItems).join(',')}&selisih=${
      isSelisihChecked ? 'Y' : 'N'
    }&tgl_awal=${date1.format('YYYY-MM-DD')}&tgl_akhir=${date2.format('YYYY-MM-DD')}&no_dokumen=${noDok}&akun=${namaAkun}&subledger=${subledger}&token=${token}`;

    console.log(namaMenuCetak);

    if (namaMenuCetak === 'Daftar Bukti Jurnal Umum') {
      fetch(iframeSrc)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.text();
        })
        .then(() => {
          let iframe = `
            <html><head>
            <title>History Jurnal Transaksi | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

          let win = window.open(
            '',
            '_blank',
            `status=no,width=${width},height=${height},resizable=yes
                ,left=${leftPosition},top=${topPosition}
                ,screenX=${leftPosition},screenY=${topPosition}
                ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
          );

          if (win) {
            let link = win.document.createElement('link');
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = '/favicon.png';
            win.document.getElementsByTagName('head')[0].appendChild(link);
            win.document.write(iframe);
          } else {
            console.error('Window failed to open.');
          }
        })
        .catch((error) => {
          console.error('Failed to load resource:', error);
        });
    }
  };

  //============ Handle Filter ===========
  const handleTogglePanel = () => {
    setPanelVisible(!panelVisible);
  };

  const handleFilterClick = () => {
    setPanelVisible(true);
  };

  const fetchData = async () => {
    const params: any = {
      entitas: kode_entitas,
      token,
      param1: Object.values(checkedItems).join(','),
      param2: isSelisihChecked ? 'Y' : 'N',
      param3: moment(date1).format('YYYY-MM-DD'),
      param4: moment(date2).format('YYYY-MM-DD'),
      param5: noDokumenValue ? noDokumenValue : 'all',
      param6: namaAkunValue ? namaAkunValue : 'all',
      param7: subledgerValue ? subledgerValue : 'all',
    };

    try {
      const historiData = await fetchHistoriJurnalTransaksi(params);
      const modifiedData = historiData.map((item: any) => ({
        ...item,
        tgl_dokumen: moment(item.tgl_dokumen).format('DD-MM-YYYY'),
        tgl_update: item.tgl_update === null ? null : moment(item.tgl_update).format('DD-MM-YYYY HH:mm:ss'),
        // debet_rp: parseFloat(item.debet_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        // kredit_rp: parseFloat(item.kredit_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      }));

      setData(modifiedData);
      gridListData.current?.setProperties({ dataSource: modifiedData });
      gridListData.current?.refresh();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Search
  const handleChangeSearchNoBukti = (e: any) => {
    setSearchNoBukti(e.target.value);

    let temp: any = data.filter((item: any) => item.no_Dok.toLowerCase().includes(e.target.value.toLowerCase()));
    setTimeout(() => {
      setFilteredData(temp);
    }, 2000);

    return noBuktiRef?.current?.focus();
  };

  const handleChangeSearchKeterangan = (e: any) => {
    setSearchKeterangan(e.target.value);
    let temp: any = data.filter((item: any) => item.catatan.toLowerCase().includes(e.target.value.toLowerCase()));

    setTimeout(() => {
      setFilteredData(temp);
    }, 2000);

    return keteranganRef?.current?.focus();
  };

  const handleClearSearchNoBukti = () => {
    setSearchNoBukti('');
    fetchData();
  };

  const handleClearSearchKeterangan = () => {
    setSearchKeterangan('');
    fetchData();
  };

  const swalToast = swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
      popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3000,
    showClass: {
      popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
    },
    hideClass: {
      popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
    },
  });

  useEffect(() => {
    const isBackdate = async () => {
      await appBackdate(kode_entitas, userid)
        .then((res) => {
          setValueAppBackdate(res);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    isBackdate();
  }, []);

  // useEffect(() => {
  //   const dialogElementBM = document.getElementById('dialogBMList');
  //   if (dialogElementBM) {
  //     dialogElementBM.style.maxHeight = '97vh';
  //     dialogElementBM.style.maxWidth = '90vw';
  //   }
  // }, [showModalBM]);

  // useEffect(() => {
  //   const dialogElement = document.getElementById('FrmPraBkk');
  //   if (dialogElement) {
  //     dialogElement.style.maxHeight = '100vh';
  //     dialogElement.style.maxWidth = '90vw';
  //   }
  // }, [showModalBK]);

  const styleButton = {
    width: 57 + 'px',
    height: '28px',
    marginBottom: '0.5em',
    marginTop: 0.5 + 'em',
    marginRight: 0.8 + 'em',
    backgroundColor: '#3b3f5c',
  };

  // Grid configuration
  const gridOptions = {
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
    loadingIndicator: { indicatorType: 'Shimmer' },
  };

  return (
    <div className={`Main ${isModalOpen ? 'h-[100vh]' : 'h-[75vh]'} overflow-y-scroll`} id="main-target">
      {/* === Title & Button Group === */}
      <div className="flex items-center justify-between">
        {/* ==== Button Group ==== */}
        <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col md:flex-row">
          <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
            <div className="gap-2 sm:flex">
              <div className="flex flex-col sm:border-r md:flex-row">
                <ButtonComponent
                  id="btnFilter"
                  type="submit"
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
                >
                  Filter
                </ButtonComponent>

                <ContextMenuComponent
                  id="cMenuCetak"
                  ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
                  items={menuCetakItems}
                  select={menuCetakSelect}
                  animationSettings={{ duration: 800, effect: 'FadeIn' }}
                />

                <ButtonComponent
                  id="btnCetak"
                  cssClass="e-primary e-small"
                  style={{ ...styleButton, width: 75 + 'px' }}
                  onClick={btnPrintClick}
                  content="Cetak"
                  iconCss="e-icons e-medium e-chevron-down"
                  iconPosition="Right"
                ></ButtonComponent>
              </div>
            </div>
          </TooltipComponent>

          <div className="ml-2 flex max-w-xl items-center gap-3">
            <div className="relative w-full">
              <input
                type="text"
                id="searchNoBukti"
                name="searchNoBukti"
                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="< No Bukti >"
                style={{ height: '4vh' }}
                value={searchNoBukti}
                ref={noBuktiRef}
                onChange={handleChangeSearchNoBukti}
              />
              {searchNoBukti && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  onClick={handleClearSearchNoBukti}
                >
                  &times;
                </button>
              )}
            </div>

            <div className="relative w-full">
              <input
                type="text"
                id="searchKeterangan"
                name="searchKeterangan"
                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="< Keterangan >"
                style={{ height: '4vh' }}
                value={searchKeterangan}
                ref={keteranganRef}
                onChange={handleChangeSearchKeterangan}
              />
              {searchKeterangan && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  onClick={handleClearSearchKeterangan}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span className="pb-5" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
            History Jurnal Transaksi
          </span>
        </div>
      </div>
      {/* === Filter & Table ===*/}
      <div className="relative flex h-full gap-3 sm:h-[calc(80vh_-_100px)]">
        {panelVisible && (
          <div
            className={`panel absolute z-10 hidden h-full w-[320px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
              isShowTaskMenu && '!block'
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
                <div className="flex h-full flex-col gap-6 overflow-auto">
                  <div>
                    {/* Dokumen */}
                    <div className="p-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">Dokumen</span>
                        <button className="text-xs font-semibold text-black hover:text-gray-700" onClick={handleSelectAll}>
                          {isAllSelected ? 'Hapus Pilihan' : 'Pilih Semua'}
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded bg-gray-300 p-2">
                        {listDokumen.map((item) => (
                          <div key={item.id} className="mb-1 flex items-center">
                            <input type="checkbox" id={`checkbox-${item.id}`} checked={!!checkedItems[item.id]} onChange={() => handleCheckboxChange(item.id, item.kode)} className="cursor-pointer" />
                            <label htmlFor={`checkbox-${item.id}`} className="m-0 ml-1 cursor-pointer text-xs text-gray-900">
                              {item.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* No Dokumen */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="No. Dokumen"
                        checked={isNoDokumen}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          setIsNoDokumen(value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={noDokumenValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            handleInputChange(value, setNoDokumenValue, setIsNoDokumen);
                          }}
                        />
                      </div>
                    </div>

                    {/* Nama Akun */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Nama Akun"
                        checked={isNamaAkun}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          setIsNamaAkun(value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={namaAkunValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            handleInputChange(value, setNamaAkunValue, setIsNamaAkun);
                          }}
                        />
                      </div>
                    </div>

                    {/* Akun Pembantu */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Akun Pembantu (Subledger)"
                        checked={isSubledger}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          setIsSubledger(value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="container form-input">
                        <TextBoxComponent
                          placeholder=""
                          value={subledgerValue}
                          input={(args: FocusInEventArgs) => {
                            const value: any = args.value;
                            handleInputChange(value, setSubledgerValue, setIsSubledger);
                          }}
                        />
                      </div>
                    </div>

                    {/* // TANGGAL DOKUMEN // */}
                    <div className="mt-2 flex justify-between">
                      {/* <CheckBoxComponent
                        label="Tanggal Dokumen"
                        checked={isDateRangeChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          setIsDateRangeChecked(value);
                        }}
                      /> */}
                      <span className="text-xs">Tanggal Dokumen</span>
                    </div>

                    <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                      <div className="form-input mt-1 flex justify-between">
                        <DatePickerComponent
                          locale="id"
                          style={{ fontSize: '12px' }}
                          cssClass="e-custom-style"
                          //   renderDayCell={onRenderDayCell}
                          enableMask={true}
                          maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={date1.toDate()}
                          change={(args: ChangeEventArgsCalendar) => {
                            HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                          }}
                        >
                          <Inject services={[MaskedDateTime]} />
                        </DatePickerComponent>
                      </div>
                      <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                      <div className="form-input mt-1 flex justify-between">
                        <DatePickerComponent
                          locale="id"
                          style={{ fontSize: '12px' }}
                          cssClass="e-custom-style"
                          //   renderDayCell={onRenderDayCell}
                          enableMask={true}
                          maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={date2.toDate()}
                          change={(args: ChangeEventArgsCalendar) => {
                            HandleTgl(moment(args.value), 'tanggalAkhir', setDate1, setDate2, setIsDateRangeChecked);
                          }}
                        >
                          <Inject services={[MaskedDateTime]} />
                        </DatePickerComponent>
                      </div>
                    </div>

                    {/* Transaksi Selisih */}
                    <div className="mt-2 flex">
                      <CheckBoxComponent
                        label="Jurnal transaksi yang selisih"
                        checked={isSelisihChecked}
                        change={(args: ChangeEventArgsButton) => {
                          const value: any = args.checked;
                          console.log(value);

                          setIsSelisihChecked(value);
                        }}
                        style={{ borderRadius: 3, borderColor: 'gray' }}
                      />
                    </div>
                  </div>
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
        <div className="h-full flex-1 overflow-auto">
          <div className="cursor flex items-center ltr:mr-3 rtl:ml-3">
            <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <GridComponent {...gridOptions} ref={gridListData} dataSource={filteredData.length > 0 ? filteredData : data} locale="id" recordDoubleClick={handleRowSelected}>
            <ColumnsDirective>
              <ColumnDirective
                field="tgl_dokumen"
                headerText="Tanggal"
                headerTextAlign="Center"
                textAlign="Left"
                // width="230"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="dokumen"
                headerText="Dok."
                headerTextAlign="Center"
                textAlign="Left"
                // width="230"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="no_Dok"
                headerText="No. Dokumen"
                headerTextAlign="Center"
                textAlign="Left"
                // width="230"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="no_akun"
                headerText="No. Akun"
                headerTextAlign="Center"
                textAlign="Left"
                // width="230"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="nama_akun"
                headerText="Nama Akun"
                headerTextAlign="Center"
                textAlign="Left"
                // width="230"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="debet_rp"
                headerText="Debet"
                headerTextAlign="Center"
                textAlign="Right"
                width="100"
                clipMode="EllipsisWithTooltip"
                template={(props: any) => {
                  return <span>{props.debet_rp ? parseFloat(props.debet_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                }}
              />
              <ColumnDirective
                field="kredit_rp"
                headerText="Kredit"
                headerTextAlign="Center"
                textAlign="Right"
                width="100"
                clipMode="EllipsisWithTooltip"
                template={(props: any) => {
                  return <span>{props.kredit_rp ? parseFloat(props.kredit_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                }}
              />
              <ColumnDirective
                field="catatan"
                headerText="Keterangan"
                headerTextAlign="Center"
                textAlign="Left"
                width="300"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="subledger"
                headerText="Subledger"
                headerTextAlign="Center"
                textAlign="Left"
                // width="300"
                autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="nama_dept"
                headerText="Departemen"
                headerTextAlign="Center"
                textAlign="Left"
                width="180"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="nama_kry"
                headerText="Karyawan"
                headerTextAlign="Center"
                textAlign="Left"
                width="170"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="kode_jual"
                headerText="Divisi"
                headerTextAlign="Center"
                textAlign="Center"
                width="60"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="userid"
                headerText="UserID"
                headerTextAlign="Center"
                textAlign="Left"
                width="120"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
              <ColumnDirective
                field="tgl_update"
                headerText="Tgl. Update"
                headerTextAlign="Center"
                textAlign="Left"
                width="150"
                // autoFit
                clipMode="EllipsisWithTooltip"
              />
            </ColumnsDirective>
            <AggregatesDirective>
              <AggregateDirective>
                <AggregateColumnsDirective>
                  <AggregateColumnDirective
                    field="debet_rp"
                    type="Sum"
                    footerTemplate={(props: any) => {
                      console.log('props.Sum: ', props);

                      return <span>{parseFloat(props.Sum).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
                    }}
                  />
                  <AggregateColumnDirective
                    field="kredit_rp"
                    type="Sum"
                    footerTemplate={(props: any) => {
                      return <span>{parseFloat(props.Sum).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
                    }}
                  />
                </AggregateColumnsDirective>
              </AggregateDirective>
            </AggregatesDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, Aggregate]} />
          </GridComponent>
        </div>
      </div>

      {/* LIST DIALOG */}
      {/* DIALOG JU */}
      {selectedDokumen === 'JU' && modalJurnalUmum && (
        <ModalJurnalUmum
          userid={userid}
          kode_entitas={kode_entitas}
          isOpen={modalJurnalUmum}
          onClose={() => {
            setModalJurnalUmum(false);
            setIsModalOpen(false);
          }}
          kode_user={kode_user}
          status_edit={true}
          kode_ju_edit={selectedJuKode}
          onRefresh={fetchData}
          token={token}
          plag=""
        />
      )}
      {/* END DIALOG JU */}

      {/* DIALOG BM */}
      {selectedDokumen === 'BM' && showModalBM && (
        <DialogCreateBM
          userid={userid}
          kode_entitas={kode_entitas}
          kode_user={kode_user}
          isOpen={showModalBM}
          onClose={() => {
            setShowModalBM(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_bm={selectedJuKode}
          statusPage="EDIT"
          isFilePendukung="N"
          isApprovedData="N"
          token={token}
          dataListMutasibank="Y"
          onRefreshTipe={0}
          selectedRowStatus=""
          entitas_user={entitas_user}
        />
      )}
      {/* END DIALOG BM */}

      {/* DIALOG PS */}
      {selectedDokumen === 'PS' && showModalPS && (
        <DialogCreatePS
          userid={userid}
          kode_entitas={kode_entitas}
          isOpen={showModalPS}
          onClose={() => {
            setShowModalPS(false);
            setIsModalOpen(false);
          }}
          kode_user={kode_user}
          onRefresh={fetchData}
          statusPage={'EDIT'}
          token={token}
          kode_ps={selectedJuKode}
          valueAppBackdate={valueAppBackdate}
          dataTemp={dataTemp}
          setDataTemp={setDataTemp}
        />
      )}
      {/* END DIALOG PS */}

      {/* DIALOG PHU - TUNAI */}
      {selectedDokumen === 'BB' && tipePHU === 'P' && showModalPHU && (
        <DialogPhuList
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi={'Y'}
          isOpen={showModalPHU}
          onClose={() => {
            setShowModalPHU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          modalJenisPembayaran="Tunai"
          selectedKodeSupp={kodeSupp}
          onRefreshTipe={0}
          plag=""
          token={token}
        />
      )}
      {/* END DIALOG PHU - TUNAI */}

      {/* DIALOG PHU - TRANSFER */}
      {selectedDokumen === 'BB' && tipePHU === 'K' && showModalPHU && (
        <DialogPhuListTransfer
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalPHU}
          onClose={() => {
            setShowModalPHU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          modalJenisPembayaran="Transfer"
          selectedKodeSupp={kodeSupp}
          onRefreshTipe={0}
          plag=""
          token={token}
        />
      )}
      {/* END DIALOG PHU - TRANSFER */}

      {/* DIALOG PHU - WARKAT */}
      {selectedDokumen === 'BB' && tipePHU === 'W' && showModalPHU && (
        <DialogPhuListWarkat
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalPHU}
          onClose={() => {
            setShowModalPHU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          selectedKodeSupp={kodeSupp}
          onRefreshTipe={0}
          plag=""
          modalJenisPembayaran="Warkat"
          token={token}
        />
      )}
      {/* END DIALOG PHU - WARKAT */}

      {/* DIALOG PPI - TUNAI */}
      {selectedDokumen === 'PU' && tipePPI === 'Tunai' && showModalPU && (
        <DialogPpiListTunai
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalPU}
          onClose={() => {
            setShowModalPU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          modalJenisPenerimaan="Tunai"
          token={token}
          onRefreshTipe={0}
          isFilePendukungPPI={'N'}
          setisFilePendukungPPI={() => {}}
        />
      )}
      {/* END DIALOG PPI - TUNAI */}

      {/* DIALOG PPI - TRANSFER */}
      {selectedDokumen === 'PU' && tipePPI === 'Transfer' && showModalPU && (
        <DialogPpiListTransfer
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalPU}
          onClose={() => {
            setShowModalPU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          modalJenisPenerimaan="Transfer"
          token={token}
          onRefreshTipe={0}
          isFilePendukungPPI={'N'}
          setisFilePendukungPPI={() => {}}
        />
      )}
      {/* END DIALOG PPI - TRANSFER */}

      {/* DIALOG PPI - WARKET */}
      {selectedDokumen === 'PU' && tipePPI === 'Warkat' && showModalPU && (
        <DialogPpiListWarkat
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalPU}
          onClose={() => {
            setShowModalPU(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          modalJenisPenerimaan="Warkat"
          token={token}
          onRefreshTipe={0}
          isFilePendukungPPI={'N'}
          setisFilePendukungPPI={() => {}}
        />
      )}
      {/* END DIALOG PPI - WARKET */}

      {/* DIALOG TTB */}
      {selectedDokumen === 'TB' && showModalTtb && (
        <DialogTtbList
          userid={userid}
          kode_entitas={kode_entitas}
          entitas={entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          masterBarangProduksi="Y"
          isOpen={showModalTtb}
          onClose={() => {
            setShowModalTtb(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
          onOpen={() => setShowModalTtb(true)}
          refreshKey={0}
          token={token}
          valueAppBackdate={valueAppBackdate}
        />
      )}
      {/* END DIALOG TTB */}

      {/* DIALOG MK */}
      {selectedDokumen === 'MK' && showModalMK && (
        <FrmMk
          userid={userid}
          kode_entitas={kode_entitas}
          masterKodeDokumen={selectedJuKode}
          masterDataState="EDIT"
          isOpen={showModalMK}
          onClose={() => {
            setShowModalMK(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          kode_user={kode_user}
        />
      )}
      {/* END DIALOG MK */}

      {/* DIALOG BK */}
      {selectedDokumen === 'BK' && showModalBK && (
        <FrmPraBkk
          stateDokumen={stateDokumen}
          isOpen={showModalBK}
          onClose={() => {
            setShowModalBK(false);
            setIsModalOpen(false);
          }}
          onRefresh={fetchData}
          isFilePendukungBk="N"
          dataListMutasibank="Y"
          onRefreshTipe={0}
        />
      )}
      {/* END DIALOG BK */}
    </div>
  );
};

export default HistoryJurnalTransaksi;
