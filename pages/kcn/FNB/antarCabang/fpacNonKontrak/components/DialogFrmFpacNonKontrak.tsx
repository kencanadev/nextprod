import React, { useEffect, useRef, useState } from 'react';

import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar } from '@syncfusion/ej2-react-calendars';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faMagnifyingGlass, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './styling.module.css';
import axios from 'axios';
import { frmNumber, generateNU } from '@/utils/routines';
import moment from 'moment';
import { terbilang } from '../helpers/terbilang';
import DialogBarangGudang from './dialog/DialogBarangGudang';
import DialogListSupplier from './dialog/DialogListSupplier';
import DialogListEntitas from './dialog/DialogListEntitas';
import { fetchCekQty, fetchCekStok, fetchMapPembeli } from '../api';
import DialogFakturJual from './dialog/DialogFakturJual';
import DialogListTermin from './dialog/DialogListTermin';
import { useApprovalPusat } from '../hooks/useApprovalPusat';
import Image from 'next/image';
import { resExcel, resPdf, resUnknow, resWord, resZip } from '../helpers/resource';
import JSZip from 'jszip';
import useUploadFiles from '../../../../../../lib/antarcabang/fpac/useUploadFiles';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';

interface DialogFrmFpacNonKontrakProps {
  open: boolean;
  onClose: () => void;
  token: string;
  kode_entitas: string;
  statusPage: string;
  kode_dokumen: string;
  userid: string;
  onRefresh: any;
  isApprovalPusat: any;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

let tabFPACList: Tab | any;
let tooltipDetailBarang: Tooltip | any;
let gridFPACList: Grid | any;
let gridDaftarBarang: Grid | any;

const taxOptions = [
  { text: 'Tanpa Pajak', value: 'N' },
  { text: 'Include (I)', value: 'I' },
  { text: 'Exclude (E)', value: 'E' },
];

const swalToast = swal.mixin({
  toast: true,
  position: 'center',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 5500,
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

const DialogFrmFpacNonKontrak: React.FC<DialogFrmFpacNonKontrakProps> = ({ open, onClose, token, kode_entitas, statusPage, kode_dokumen, userid, onRefresh, isApprovalPusat }) => {
  const [masterData, setMasterData] = useState({
    no_fpac: '',
    tglFpac: moment(),
    tglTrxFpac: moment(),
    tglTerima: moment(),
    tglSJ: moment(),
    kodeSupp: '',
    via: 'Fax',
    fob: 'Dikirim',
    kodeTermin: '',
    kodeMu: '',
    kurs: '',
    kursPajak: '',
    kenaPajak: 'N',
    totalMu: '',
    totalBerat: '',
    berat: '',
    keterangan: '',
    alamatKirimCabang: '',
    kodeGudangBeli: '',
    namaGudangBeli: '',
    kodeGudangJual: '',
    namaGudangJual: '',
    kodeKirimCabangJual: '',
    namaKirimCabangJual: '',
    kodeCustPusat: '',
    kodeGudangPusat: '',
    noReff: '',
    entitasCabangBeli: '',
    entitasCabangJual: '',
    namaRelasi: '',
    namaTermin: '',
    namaGudang: '',
    namaCustPusat: '',
    fakturJual: '',
    kodeSo: '',
    kodeSj: '',
  });

  // ======= Hooks Progress Bar ... ========
  const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
  const { handleSave, setEditDataFromModal, editData, isLoading, setHargaBeliMu, setHargaJualMu } = useApprovalPusat();

  const [tambah, setTambah] = useState(false);
  const [edit, setEdit] = useState(false);
  const [outputWordsJumlah_mu, setOutputWordsJumlah_mu] = useState('');

  const updateState = (field: any, value: any) => {
    setMasterData((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const dialogClose = () => {
    if (gridFPACList && gridFPACList.dataSource) {
      gridFPACList.dataSource.splice(0, gridFPACList.dataSource.length);
    }
    // setNamaGudang('');
    updateState('namaGudang', '');
    onClose();
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState('alamatKirimCabang', e.target.value);
  };

  const handleCreate = async () => {
    const result = await generateNU(kode_entitas, '', '82', moment().format('YYYYMM'));
    if (result) {
      updateState('no_fpac', result);
    } else {
      console.error('undefined');
    }
  };

  // FILE PENGAJUAN
  const { handleFileSelect, handleDelete, handleDeleteAllFiles, handleUpload, downloadFile, uploaderRefFiles, dataFiles, setDataFiles } = useUploadFiles({ kode_dokumen, kode_entitas });

  function getMimeTypeFromBase64(base64: string): string {
    const mimeMatch = base64.match(/^data:(.*?);base64,/);

    if (mimeMatch) {
      return mimeMatch[1];
    }

    return 'application/octet-stream';
  }

  function base64ToFile(base64: string, filename: string): File {
    const mimeType = getMimeTypeFromBase64(base64);
    const base64String = base64.replace(/^data:.+;base64,/, '');
    const byteCharacters = atob(base64String);
    const byteArrays = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    const file = new File([byteArrays], filename, { type: mimeType });
    return file;
  }

  useEffect(() => {
    const Async = async () => {
      const loadTbImages = await axios.get(`${apiUrl}/erp/load_images`, {
        params: {
          entitas: kode_entitas,
          param1: kode_dokumen,
        },
      });

      const result = loadTbImages.data.data;

      const data = await Promise.all(
        result.map(async (item: any) => {
          try {
            const response: any = await axios.get(`${apiUrl}/erp/load_fileGambar_byId`, {
              params: {
                entitas: kode_entitas,
                param1: kode_dokumen,
                param2: item.id_dokumen,
              },
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data.data;
            return {
              ...item,
              name: item.fileoriginal,
              preview: data[0].decodeBase64_string,
              modifiedName: item.filegambar,
              rawFile: base64ToFile(data[0].decodeBase64_string, item.filegambar),
              id: item.id_dokumen,
            };
          } catch (error) {
            console.error(`Error extracting zip for ${item.filegambar}: `, error);
            return {
              ...item,
              name: item.fileoriginal,
              preview: null,
              modifiedName: item.filegambar,
              error: true,
            };
          }
        })
      );

      setDataFiles(data);
    };

    if (statusPage !== 'CREATE') {
      Async();
    }
  }, []);

  // IMAGE DOWNLOAD & PREVIEW
  const [modalPreview, setModalPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const handleWheel = (event: any) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      setZoomLevel((prevScale) => Math.min(prevScale + 0.1, 6));
    } else {
      setZoomLevel((prevScale) => Math.max(prevScale - 0.1, 0.5));
    }
  };

  const handleMouseDown = (event: any) => {
    setIsDragging(true);
    setStartPosition({ x: event.clientX - translate.x, y: event.clientY - translate.y });
  };

  const handleMouseMove = (event: any) => {
    if (isDragging) {
      setTranslate({
        x: event.clientX - startPosition.x,
        y: event.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gudang
  const [daftarGudang, setDaftarGudang] = useState<any>([]);
  const [gudangType, setGudangType] = useState<string>('');
  const [selectedGudang, setSelectedGudang] = useState<any>('');

  const [modalDaftarGudang, setModalDaftarGudang] = useState(false);
  const [filteredDataGudang, setFilteredDataGudang] = useState<any>([]);
  const [searchNamaGudang, setSearchNamaGudang] = useState('');

  const PencarianNamaGudang = async (event: string) => {
    const searchValue = event;
    setSearchNamaGudang(searchValue);
    const filteredData = SearchDataNamaGudang(searchValue, daftarGudang);
    setFilteredDataGudang(filteredData);

    const cariNamaAkun = document.getElementById('cariNamaAkun') as HTMLInputElement;
    if (cariNamaAkun) {
      cariNamaAkun.value = '';
    }
  };

  const SearchDataNamaGudang = (searchValue: string, daftarGudang: any[]) => {
    return daftarGudang.filter((gudang) => gudang.nama_gudang.toLowerCase().includes(searchValue.toLowerCase()));
  };

  const entitasGudang = gudangType == 'pembeli' ? masterData.entitasCabangBeli : gudangType == 'penjual' ? masterData.entitasCabangJual : kode_entitas;
  const refreshDaftarGudang = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/list_gudang_forfilter`, {
        params: {
          entitas: entitasGudang,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarGudang(response.data.data);
    } catch (error) {
      console.error('Error fetching data gudang:', error);
    }
  };

  const handlePilihGudang = async () => {
    // console.log('selectedGudang', selectedGudang);
    if (gudangType == 'pembeli') {
      // const data = await axios.get(`${apiUrl}/erp/customer_mapping`, {
      //   params: {
      //     entitas: kode_entitas,
      //     param1: masterData.entitasCabangBeli,
      //   },
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // console.log('data mapping: ', data);

      updateState('namaGudangBeli', selectedGudang.nama_gudang);
      updateState('kodeGudangBeli', selectedGudang.kode_gudang);
      setModalDaftarGudang(false);
    } else if (gudangType == 'penjual') {
      updateState('namaGudangJual', selectedGudang.nama_gudang);
      updateState('kodeGudangJual', selectedGudang.kode_gudang);
      setModalDaftarGudang(false);
    }
  };

  useEffect(() => {
    refreshDaftarGudang();
  }, [entitasGudang]);

  // Supplier
  const [modalDaftarSupplier, setModalDaftarSupplier] = useState<any>(false);
  const [listDaftarSupplier, setDaftarSupplier] = useState<any>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>('');

  const [filteredDataSupplier, setFilteredDataSupplier] = useState<any>([]);
  const [searchNoSupp, setSearchNoSupp] = useState<any>('');
  const [searchNamaRelasi, setSearchNamaRelasi] = useState<any>('');

  const refreshDaftarSupplier = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/m_supplier`, {
        params: {
          entitas: kode_entitas,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarSupplier(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihSupplier = async () => {
    console.log('selectedSupplier', selectedSupplier);
    updateState('kodeMu', selectedSupplier.kode_mu);
    updateState('kurs', selectedSupplier.kurs);
    updateState('kursPajak', selectedSupplier.kurs_pajak);
    updateState('kodeSupp', selectedSupplier.kode_supp);
    updateState('namaRelasi', selectedSupplier.nama_relasi);
    updateState('kodeTermin', selectedSupplier.kode_termin);
    updateState('namaTermin', selectedSupplier.nama_termin);
    setModalDaftarSupplier(false);
  };

  useEffect(() => {
    refreshDaftarSupplier();
  }, [kode_entitas]);

  const PencarianSupplier = (event: any, field: any) => {
    const searchValue = event;
    if (field === 'no_supp') {
      setSearchNoSupp(searchValue);
    } else if (field === 'nama_relasi') {
      setSearchNamaRelasi(searchValue);
    }
    const filteredData = SearchDataSupplier(searchValue, listDaftarSupplier, field);
    setFilteredDataSupplier(filteredData);
  };

  const SearchDataSupplier = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  // Entitas
  const [entitasType, setEntitasType] = useState<any>('');
  const [listDaftarEntitas, setDaftarEntitas] = useState([]);
  const [modalDaftarEntitas, setModalDaftarEntitas] = useState(false);
  const [selectedEntitas, setSelectedEntitas] = useState<any>(null);

  const [filteredDataEntitas, setFilteredDataEntitas] = useState<any>([]);
  const [searchKodeCabang, setSearchKodeCabang] = useState<any>('');
  const [searchCabang, setSearchCabang] = useState<any>('');

  const refreshDaftarEntitas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/get_all_entitas?entitas=${kode_entitas}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarEntitas(response.data.data);
    } catch (error) {
      console.error('Error fetching data entitas:', error);
    }
  };

  useEffect(() => {
    refreshDaftarEntitas();
  }, []);

  const handlePilihEntitas = async () => {
    const params = {
      entitas: kode_entitas,
      entitasBeli: selectedEntitas.Kode,
      token,
    };
    const dataMappingPembeli = await fetchMapPembeli(params);
    console.log('data pembeli: ', dataMappingPembeli);

    if (selectedEntitas.kodecabang == kode_entitas) {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: '<p style="font-size:12px">Kode Entitas Pusat Tidak Bisa dijadikan Cabang Jual</p>',
        width: '100%',
        target: '#dialogEntitas',
      });
    } else if (entitasType == 'gudang pengeluaran') {
      updateState('entitasCabangJual', selectedEntitas.Kode);
      setModalDaftarEntitas(false);
      setGudangType('penjual');
      setModalDaftarFj(true);
    } else if (entitasType == 'gudang penerimaan') {
      if (dataMappingPembeli.length > 0) {
        console.log('aku tampil!');
        updateState('namaCustPusat', dataMappingPembeli[0].nama_relasi);
        updateState('kodeCustPusat', dataMappingPembeli[0].kode_cust);
        updateState('namaGudang', dataMappingPembeli[0].nama_gudang);
        updateState('kodeGudangPusat', dataMappingPembeli[0].kode_gudang);
      }

      updateState('entitasCabangBeli', selectedEntitas.Kode);
      updateState('alamatKirimCabang', selectedEntitas.alamat_kirim1);
      updateState('namaGudangBeli', '');
      updateState('kodeGudangBeli', '');
      setModalDaftarEntitas(false);
      setGudangType('pembeli');
      setModalDaftarGudang(true);
    }
  };

  const PencarianEntitas = (searchKodeCabang: any, searchCabang: any) => {
    let filteredData = listDaftarEntitas;

    if (searchKodeCabang) {
      filteredData = filteredData.filter((item: any) => item.Kode.toLowerCase().includes(searchKodeCabang.toLowerCase()));
    }

    if (searchCabang) {
      filteredData = filteredData.filter((item: any) => item.Cabang.toLowerCase().includes(searchCabang.toLowerCase()));
    }

    setFilteredDataEntitas(filteredData);
  };

  // Faktur Jual
  const [listDaftarNoFj, setListDaftarNoFj] = useState([]);
  const [listDaftarFj, setListDaftarFj] = useState([]);
  const [modalDaftarFj, setModalDaftarFj] = useState(false);
  const [selectedFj, setSelectedFj] = useState<any>(null);

  const [filteredDataFj, setFilteredDataFj] = useState<any>([]);

  const refreshDaftarNoFJ = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/list_fj_fpac?entitas=${masterData.entitasCabangJual}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListDaftarNoFj(response.data.data);
    } catch (error) {
      console.error('Error fetching data No FJ:', error);
    }
  };

  const refreshDaftarFJ = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/list_detail_fj_fpac`, {
        params: {
          entitas: masterData.entitasCabangJual,
          param1: selectedFj.no_fj,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setListDaftarFj(response.data.data);
    } catch (error) {
      console.error('Error fetching data FJ:', error);
    }
  };

  useEffect(() => {
    refreshDaftarNoFJ();
  }, [masterData.entitasCabangJual]);

  useEffect(() => {
    refreshDaftarFJ();
  }, [selectedFj]);

  const pencarianNoFj = (value: string) => {
    const filteredData = listDaftarNoFj.filter((item: any) => item.no_fj.toLowerCase().includes(value.toLowerCase()));

    setFilteredDataFj(filteredData);
  };

  const handlePilihFj = async (value: any) => {
    const params = {
      entitas: kode_entitas,
      param1: masterData.entitasCabangJual,
    };
    const dataMappingPenjual = await axios.get(`${apiUrl}/erp/customer_mapping`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = dataMappingPenjual.data.data[0];

    const kodeSupp = listDaftarSupplier.find((item: any) => item.nama_relasi === data.nama_relasi);
    console.log('data penjual: ', data);
    updateState('namaRelasi', data.nama_relasi);
    updateState('kodeMu', data.kode_mu);
    updateState('kurs', data.kurs);
    updateState('kursPajak', data.kurs_pajak);
    updateState('kodeSupp', kodeSupp.kode_supp);
    updateState('kodeTermin', data.kode_termin);
    updateState('namaTermin', data.nama_termin);
    updateState('kodeSo', value.kode_so);
    updateState('kodeSj', value.kode_sj);
    let detail: any[] = [];
    detail.push(value);
    updateState('fakturJual', value.no_fj);
    updateState('kodeGudangJual', value.kode_gudang);
    updateState('namaGudangJual', value.nama_gudang);
    // updateState('berat', value.berat);
    updateState('totalMu', value.jumlah_mu);

    if (detail.length > 0) {
      const mappedBarang = detail.map((item: any, index: number) => {
        const { berat, ...value } = item;
        return {
          ...value,
          id_fpac: index + 1,
          harga_mu: 0,
          harga_beli_mu: 0,
          harga_jual_mu: parseFloat(item.harga_mu),
          berat: 0,
        };
      });

      // const mappedBarang = detail.map((item: any, index: number) => ({
      //   ...item,
      //   id_fpac: index + 1,
      //   harga_mu: 0,
      //   harga_beli_mu: 0,
      //   harga_jual_mu: parseFloat(item.harga_mu),
      //   // berat: frmNumber(item.berat),
      // }));
      gridFPACList.dataSource = mappedBarang;
      setModalDaftarFj(false);
    }
  };

  // Termin
  const [modalDaftarTermin, setModalDaftarTermin] = useState(false);
  const [listDaftarTermin, setDaftarTermin] = useState([]);
  const [selectedTermin, setSelectedTermin] = useState<any>('');

  const [filteredDataTermin, setFilteredDataTermin] = useState([]);
  const [searchNoTermin, setSearchNoTermin] = useState('');

  const refreshDaftarTermin = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/termin_by_where`, {
        params: {
          entitas: kode_entitas,
          param1: `WHERE cod="N"`,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarTermin(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihTermin = async () => {
    updateState('kodeTermin', selectedTermin.kode_termin);
    updateState('namaTermin', selectedTermin.nama_termin);
    setModalDaftarTermin(false);
  };

  const createBlobUrl = (dataUrl: string): string => {
    // Extract the base64 data part if it's a data URL
    const base64Data = dataUrl.split(',')[1] || dataUrl;

    // Convert base64 to binary
    const binaryString = window.atob(base64Data);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    // Convert binary to Uint8Array
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create Blob and URL
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const handlePreviewImg = (img: string) => {
    const type = getMimeTypeFromBase64(img);
    console.log('type: ', type);
    if (type === 'application/pdf') {
      const blobUrl = createBlobUrl(img);
      window.open(blobUrl, '_blank');
      return;
    } else {
      window.open(img, '_blank');
    }
  };

  useEffect(() => {
    refreshDaftarTermin();
  }, [kode_entitas]);

  const PencarianNoTermin = async (event: string) => {
    const searchValue = event;
    setSearchNoTermin(searchValue);
    const filteredData = SearchDataNoTermin(searchValue);
    setFilteredDataTermin(filteredData);

    const cariNamaAkun = document.getElementById('cariNamaAkun') as HTMLInputElement;
    if (cariNamaAkun) {
      cariNamaAkun.value = '';
    }
  };

  const SearchDataNoTermin = (keyword: any) => {
    if (keyword === '') {
      return listDaftarTermin;
    } else {
      const filteredData = listDaftarTermin.filter((item: any) => item.nama_termin.toLowerCase().startsWith(keyword.toLowerCase()));
      return filteredData;
    }
  };

  const handleKeterangan = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState('keterangan', e.target.value);
  };

  // Handle Edit
  const handleEdit = async () => {
    const response = await axios.get(`${apiUrl}/erp/master_detail_FPAC`, {
      params: {
        entitas: kode_entitas,
        param1: kode_dokumen,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const detailHeader = response.data.data;
    setEditDataFromModal(response.data.data!);

    updateState('no_fpac', detailHeader.no_fpac);
    updateState('tglFpac', moment(detailHeader.tgl_fpac, 'YYYY-MM-DD'));
    updateState('tglTrxFpac', moment(detailHeader.tgl_trxfpac, 'YYYY-MM-DD'));
    updateState('tglTerima', moment(detailHeader.tgl_berlaku, 'YYYY-MM-DD'));
    updateState('tglSJ', moment(detailHeader.tgl_kirim, 'YYYY-MM-DD'));
    updateState('kodeSupp', detailHeader.kode_supp);
    updateState('via', detailHeader.via);
    updateState('fob', detailHeader.fob);
    updateState('entitasCabangBeli', detailHeader.kode_entitas);
    updateState('namaGudangBeli', detailHeader.nama_gudang_beli);
    updateState('kodeGudangBeli', detailHeader.kode_gudang_beli);
    updateState('namaGudangJual', detailHeader.nama_gudang_jual);
    updateState('kodeGudangJual', detailHeader.kode_gudang_jual);
    updateState('entitasCabangJual', detailHeader.entitas_cabang_jual);
    updateState('kodeGudangPusat', detailHeader.kode_gudang_pusat);
    updateState('fakturJual', detailHeader.no_reff);
    updateState('kodeTermin', detailHeader.kode_termin);
    updateState('namaTermin', detailHeader.nama_termin);
    updateState('kodeMu', detailHeader.kode_mu);
    updateState('kurs', detailHeader.kurs);
    updateState('kursPajak', detailHeader.kurs_pajak);
    updateState('kodeSo', detailHeader.kode_so);
    updateState('kodeSj', detailHeader.kode_sj);
    updateState('kenaPajak', detailHeader.kena_pajak);
    updateState('alamatKirimCabang', detailHeader.alamat_kirim_cabang);
    updateState('namaKirimCabangJual', detailHeader.nama_gudang_jual);
    updateState('namaRelasi', detailHeader.nama_relasi);
    updateState('namaCustPusat', detailHeader.nama_cust_pusat);
    updateState('kodeCustpusat', detailHeader.kode_cust_pusat);
    updateState('namaGudang', detailHeader.nama_gudang);
    updateState('keterangan', detailHeader.keterangan);
    updateState('totalBerat', detailHeader.total_berat);
    updateState('totalMu', detailHeader.total_mu);

    const { detail } = response.data.data;
    updateState('berat', detail[0].berat);
    setHargaBeliMu(detail[0].harga_beli_mu);
    setHargaJualMu(detail[0].harga_jual_mu);

    if (detail.length > 0) {
      const mappedBarang = detail.map((item: any) => ({
        ...item,
        berat: frmNumber(item.berat),
      }));
      gridFPACList.dataSource = mappedBarang;
    }
  };

  const fetchData = () => {
    try {
      if (statusPage === 'CREATE') {
        handleCreate();
      } else if (statusPage === 'EDIT' || statusPage === 'UPDATE-FILE') {
        handleEdit();
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat data:', error);
    }
  };

  const kalkulasi = () => {
    console.log(gridFPACList.dataSource);

    Promise.all(
      gridFPACList.dataSource.map(async (item: any) => {
        if (item.qty !== 0 && item.qty !== '' && item.harga_mu !== 0 && item.harga_mu !== '') {
          item.jumlah_mu = item.qty * item.harga_mu;
          item.jumlah_rp = item.qty * item.harga_mu;
        }
        if (item.berat === 0) {
          item.berat = item.qty * item.berat;
        }
        if (item.qty !== 0 && item.qty !== '' && item.berat !== 0 && item.berat !== '') {
          item.berat = item.qty * item.brt;
        }
        if (item.qty !== 0 && item.qty !== '') {
          item.qty_std = item.qty;
          item.qty_sisa = item.qty;
        }
      })
    ).then(() => {
      const totalNilaiValue = gridFPACList.dataSource.reduce((total: any, item: any) => {
        const jumlah_mu = typeof item.jumlah_mu === 'string' ? parseFloat(item.jumlah_mu) : item.jumlah_mu;
        return total + (jumlah_mu || 0);
      }, 0);

      const totalBeratValue = gridFPACList.dataSource.reduce((total: any, item: any) => {
        const berat = typeof item.berat === 'string' ? parseFloat(item.berat) : item.berat;
        return total + (berat || 0);
      }, 0);
      updateState('totalMu', totalNilaiValue);
      updateState('totalBerat', totalBeratValue);
    });
  };

  const actionCompleteDetailBarang = async (args: any) => {
    switch (args.requestType) {
      case 'save':
        if (tambah === false) {
          const editedData = args.data;
          gridFPACList.dataSource[args.rowIndex] = editedData;
          kalkulasi();
          // setHargaBeliMu(gridFPACList.dataSource[args.rowIndex].harga_beli_mu);
          // setHargaJualMu(gridFPACList.dataSource[args.rowIndex].harga_jual_mu);
          gridFPACList.refresh();
        } else if (edit) {
          kalkulasi();
          gridFPACList.refresh();
        }
        break;
      case 'beginEdit':
        setTambah(false);
        setEdit(true);
        kalkulasi();
        break;
      case 'delete':
        gridFPACList.dataSource.forEach((item: any, index: any) => {
          item.id = index + 1;
        });
        gridFPACList.refresh();
        break;
      case 'refresh':
        kalkulasi();
        setTambah(false);
        setEdit(false);
        break;
      default:
        break;
    }
  };

  const cekStok = async () => {
    const kode_item = gridFPACList.dataSource[0].kode_item;

    const params = {
      entitas: masterData.entitasCabangJual,
      token,
      param1: kode_item,
      param2: moment().format('YYYY-MM-DD HH:mm:ss'),
      param3: masterData.kodeGudangJual,
      param4: '',
      param5: 'fpac',
    };

    const stok = await fetchCekStok(params);

    return stok[0].stok;
  };

  const saveDoc = async () => {
    const isHargaPusatNull = gridFPACList.dataSource.some((item: any) => item.harga_beli_mu === 0);
    const isHargaMu = gridFPACList.dataSource.some((item: any) => item.harga_mu === 0);

    if (isHargaPusatNull) {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: `<p style="font-size:12px">Harga Pusat tidak boleh kurang dari nol</p>`,
        width: '100%',
        target: '#dialogFPACList',
      });
      return;
    }

    if (isHargaMu) {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: `<p style="font-size:12px">Harga Cabang Beli tidak boleh kurang dari nol</p>`,
        width: '100%',
        target: '#dialogFPACList',
      });
      return;
    }

    const modifiedDetailBarangJson: any = gridFPACList.dataSource.map((item: any) => {
      const { no_item, berat, brt, ...remainingFields } = item; // kecualikan no_item, brt, berat
      let modifiedItem = { ...remainingFields, id_pp: 0, qty_batal: 0, include: masterData.kenaPajak };
      if (statusPage === 'EDIT') {
        modifiedItem = { ...modifiedItem, kode_fpac: kode_dokumen };
      }
      return modifiedItem;
    });

    // console.log('grid data: ', gridFPACList.dataSource);

    const mNoFpac = await generateNU(kode_entitas, '', '82', moment().format('YYYYMM'));

    const reqBody = {
      entitas: kode_entitas,
      kode_fpac: statusPage === 'EDIT' ? kode_dokumen : '',
      no_fpac: statusPage === 'EDIT' ? masterData.no_fpac : mNoFpac,
      tgl_fpac: masterData.tglFpac.format('YYYY-MM-DD HH:mm:ss'),
      kode_supp: masterData.kodeSupp,
      tgl_berlaku: masterData.tglTerima.format('YYYY-MM-DD HH:mm:ss'),
      tgl_kirim: masterData.tglSJ.format('YYYY-MM-DD HH:mm:ss'),
      alamat_kirim: null,
      via: masterData.via,
      fob: masterData.fob,
      kode_termin: masterData.kodeTermin,
      kode_mu: masterData.kodeMu,
      kurs: masterData.kurs,
      kurs_pajak: masterData.kursPajak,
      kena_pajak: masterData.kenaPajak,
      total_mu: masterData.totalMu,
      diskon_dok: null,
      diskon_dok_mu: '0.0000',
      total_diskon_mu: '0.0000',
      total_pajak_mu: '0.0000',
      kirim_mu: '0.0000',
      netto_mu: masterData.totalMu,
      total_rp: masterData.totalMu,
      diskon_dok_rp: '0.0000',
      total_diskon_rp: '0.0000',
      total_pajak_rp: '0.0000',
      kirim_rp: '0.0000',
      netto_rp: masterData.totalMu,
      total_berat: masterData.totalBerat,
      keterangan: masterData.keterangan,
      status: 'Terbuka',
      userid: userid.toUpperCase(),
      tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
      approval: null,
      tgl_approval: null,
      kirim_langsung: 'Y',
      status_kirim: 'N',
      no_sjpabrik: null,
      tgl_sjpabrik: null,
      tgl_sjfax: null,
      nota: '',
      kontrak: 'N',
      approval2: null,
      tgl_approval2: null,
      kirim_langsung_cabang: 'N',
      alamat_kirim_cabang: masterData.alamatKirimCabang,
      keterangan_pusat: '',
      kode_gudang_beli: masterData.kodeGudangBeli,
      nama_gudang_beli: masterData.namaGudangBeli,
      kode_gudang_jual: masterData.kodeGudangJual,
      nama_gudang_jual: masterData.namaGudangJual,
      // kode_kirim_cabang_jual: masterData.kodeKirimCabangJual,
      kode_kirim_cabang_jual: null,
      // nama_kirim_cabang_jual: masterData.namaKirimCabangJual,
      nama_kirim_cabang_jual: null,
      kode_cust_pusat: masterData.kodeCustPusat,
      kode_gudang_pusat: masterData.kodeGudangPusat,
      no_reff: masterData.fakturJual,
      kode_entitas: masterData.entitasCabangBeli,
      entitas_cabang_jual: masterData.entitasCabangJual,
      export_cabang_beli: 'N',
      export_cabang_jual: 'N',
      export_pusat: 'N',
      status_export: 'Baru',
      tgl_trxfpac: masterData.tglTrxFpac.format('YYYY-MM-DD HH:mm:ss'),
      kode_so: masterData.kodeSo,
      kode_sj: masterData.kodeSj,
      detail: modifiedDetailBarangJson,
    };

    // console.log('reqBody: ', reqBody);

    try {
      startProgress();
      let responseAPI;
      if (statusPage === 'CREATE') {
        responseAPI = await axios.post(`${apiUrl}/erp/simpan_fpac`, reqBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        responseAPI = await axios.patch(`${apiUrl}/erp/update_fpac`, reqBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (responseAPI.data.status === true) {
        if (statusPage === 'CREATE') {
          await generateNU(kode_entitas, mNoFpac, '82', moment().format('YYYYMM'));

          handleUpload(responseAPI.data.kode_dokumen);

          const auditReqBody = {
            entitas: kode_entitas,
            kode_audit: null,
            dokumen: 'AC',
            kode_dokumen: responseAPI.data.kode_dokumen,
            no_dokumen: masterData.no_fpac,
            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            proses: 'NEW',
            diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} nilai transaksi ${masterData.totalMu}`,
            userid: userid,
            system_user: '', //username login
            system_ip: '', //ip address
            system_mac: '', //mac address
          };
          await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBody);
          endProgress();
          withReactContent(swalToast).fire({
            icon: 'success',
            title: `<p style="font-size:12px">Input Data berhasil</p>`,
            width: '100%',
            target: '#dialogFPACList',
          });
          setTimeout(() => {
            dialogClose();
            onRefresh();
          }, 1000);
        } else if (statusPage === 'EDIT') {
          handleUpload(kode_dokumen);
          const auditReqBody = {
            entitas: kode_entitas,
            kode_audit: null,
            dokumen: 'AC',
            kode_dokumen: responseAPI.data.kode_dokumen,
            no_dokumen: masterData.no_fpac,
            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            proses: 'UPDATE',
            diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} nilai transaksi ${masterData.totalMu}`,
            userid: userid,
            system_user: '', //username login
            system_ip: '', //ip address
            system_mac: '', //mac address
          };
          await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBody);
          endProgress();
          withReactContent(swalToast).fire({
            icon: 'success',
            title: `<p style="font-size:12px">Edit Data berhasil</p>`,
            width: '100%',
            target: '#dialogFPACList',
          });
          setTimeout(() => {
            dialogClose();
            onRefresh();
          }, 1000);
        }
      } else {
        withReactContent(swalToast).fire({
          icon: 'warning',
          title: `<p style="font-size:12px">Input Data Gagal</p>`,
          width: '100%',
          target: '#dialogFPACList',
        });
        endProgress();
      }
    } catch (error) {
      console.error('Error:', error);
      endProgress();
    } finally {
      swal.fire({
        timer: 10,
        showConfirmButton: false,
      });
      endProgress();
    }
  };

  // APPROVAL PUSAT
  const handleApprovalPusat = async (approvalStatus: any) => {
    const detail = editData.detail[0];
    const res = await fetchCekQty({ ent: kode_entitas, param1: detail.grp, param2: detail.kustom10, param3: moment().format('YYYY-MM-DD') }, token);

    if (detail.jumlah_rp > res[0].q) {
      swal.fire({
        icon: 'warning',
        title: `Item ${detail.diskripsi} melebihi maksimum jumlah pembelian.`,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 2000,
        target: '#dialogFPACList',
      });
    }

    const isHargaPusatNull = gridFPACList.dataSource.some((item: any) => item.harga_beli_mu === 0);
    const isHargaCabangNull = gridFPACList.dataSource.some((item: any) => item.harga_jual_mu === 0);

    if (isHargaPusatNull) {
      swal.fire({
        icon: 'warning',
        title: `Harga Pusat tidak boleh kurang dari nol.`,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 2000,
        target: '#dialogFPACList',
      });
      return;
    }

    if (isHargaCabangNull) {
      swal.fire({
        icon: 'warning',
        title: `Harga Cabang tidak boleh kurang dari nol.`,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 2000,
        target: '#dialogFPACList',
      });
      return;
    }

    try {
      const modifiedDetailBarangJson: any = gridFPACList.dataSource.map((item: any) => {
        const { no_item, brt, berat, ...remainingFields } = item; // kecualikan no_item, brt, berat
        let modifiedItem = { ...remainingFields, include: masterData.kenaPajak };
        if (statusPage === 'EDIT') {
          modifiedItem = { ...modifiedItem, kode_fpac: kode_dokumen };
        }
        return modifiedItem;
      });

      const reqBody = {
        entitas: kode_entitas,
        kode_fpac: statusPage === 'EDIT' ? kode_dokumen : '',
        no_fpac: masterData.no_fpac,
        tgl_fpac: masterData.tglFpac.format('YYYY-MM-DD HH:mm:ss'),
        kode_supp: masterData.kodeSupp,
        tgl_berlaku: masterData.tglTerima.format('YYYY-MM-DD HH:mm:ss'),
        tgl_kirim: masterData.tglSJ.format('YYYY-MM-DD HH:mm:ss'),
        alamat_kirim: null,
        via: masterData.via,
        fob: masterData.fob,
        kode_termin: masterData.kodeTermin,
        kode_mu: masterData.kodeMu,
        kurs: masterData.kurs,
        kurs_pajak: masterData.kursPajak,
        kena_pajak: masterData.kenaPajak,
        total_mu: masterData.totalMu,
        diskon_dok: null,
        diskon_dok_mu: '0.0000',
        total_diskon_mu: '0.0000',
        total_pajak_mu: '0.0000',
        kirim_mu: '0.0000',
        netto_mu: masterData.totalMu,
        total_rp: masterData.totalMu,
        diskon_dok_rp: '0.0000',
        total_diskon_rp: '0.0000',
        total_pajak_rp: '0.0000',
        kirim_rp: '0.0000',
        netto_rp: masterData.totalMu,
        total_berat: masterData.berat,
        keterangan: masterData.keterangan,
        status: 'Terbuka',
        userid: userid.toUpperCase(),
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        approval: null,
        tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
        kirim_langsung: 'Y',
        status_kirim: 'N',
        no_sjpabrik: null,
        tgl_sjpabrik: null,
        tgl_sjfax: null,
        nota: '',
        kontrak: 'N',
        approval2: null,
        tgl_approval2: null,
        kirim_langsung_cabang: 'N',
        alamat_kirim_cabang: masterData.alamatKirimCabang,
        keterangan_pusat: null,
        kode_gudang_beli: masterData.kodeGudangBeli,
        nama_gudang_beli: masterData.namaGudangBeli,
        kode_gudang_jual: masterData.kodeGudangJual,
        nama_gudang_jual: masterData.namaGudangJual,
        kode_kirim_cabang_jual: masterData.kodeKirimCabangJual,
        nama_kirim_cabang_jual: masterData.namaKirimCabangJual,
        kode_cust_pusat: masterData.kodeCustPusat,
        kode_gudang_pusat: masterData.kodeGudangPusat,
        no_reff: masterData.fakturJual,
        kode_entitas: masterData.entitasCabangBeli,
        entitas_cabang_jual: masterData.entitasCabangJual,
        export_cabang_beli: 'N',
        export_cabang_jual: 'N',
        export_pusat: 'N',
        status_export: 'Baru',
        tgl_trxfpac: masterData.tglTrxFpac.format('YYYY-MM-DD HH:mm:ss'),
        kode_so: '',
        kode_sj: '',
        detail: modifiedDetailBarangJson,
      };

      // console.log('modifiedBody: ', reqBody);

      let response;
      if (approvalStatus === 'Y') {
        const res = await handleSave();

        if (res) {
          const modifiedBody = {
            ...reqBody,
            export_cabang_beli: 'Y',
            export_pusat: 'Y',
            status_export: 'Berhasil',
            approval: 'Y',
            status: 'Tertutup',
          };

          response = await axios.patch(`${apiUrl}/erp/update_fpac`, modifiedBody, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      // console.log('body: ', { reqBody });

      if (response) {
        handleUpload(kode_dokumen);

        const auditReqBody = {
          entitas: kode_entitas,
          kode_audit: null,
          dokumen: 'AC',
          kode_dokumen: response.data.kode_dokumen,
          no_dokumen: masterData.no_fpac,
          tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
          proses: 'NEW',
          diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} total_berat = ${parseFloat(editData.total_berat)} nilai transaksi ${masterData.totalMu}`,
          userid: userid,
          system_user: '', //username login
          system_ip: '', //ip address
          system_mac: '', //mac address
        };

        await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBody);

        withReactContent(swalToast).fire({
          icon: 'success',
          title: `<p style="font-size:12px">Data Approval Berhasil Diperbarui</p>`,
          width: '100%',
          target: '#dialogFPACList',
        });
      } else {
        withReactContent(swalToast).fire({
          icon: 'error',
          title: `<p style="font-size:12px">Data Approval Gagal Diperbarui</p>`,
          width: '100%',
          target: '#dialogFPACList',
        });
      }

      // console.log(auditReqBody);

      setTimeout(() => {
        dialogClose();
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (masterData.totalMu) {
      const words = terbilang(masterData.totalMu);
      setOutputWordsJumlah_mu(words);
    } else {
      setOutputWordsJumlah_mu('Masukkan angka yang valid');
    }
  }, [masterData.totalMu]);

  useEffect(() => {
    fetchData();
  }, [statusPage, kode_entitas, kode_dokumen, token]);

  // LOAD IMAGE PENGAJUAN
  // useEffect(() => {
  //   const Async = async () => {
  //     if (statusPage === 'EDIT' || statusPage === 'UPDATE-FILE') {
  //       // LOAD DAN EXTRACT saat posisi EDIT
  //       const loadtbImages = await axios.get(`${apiUrl}/erp/load_images`, {
  //         params: {
  //           entitas: kode_entitas,
  //           param1: kode_dokumen,
  //         },
  //       });

  //       const result = loadtbImages.data.data;
  //       setJsonImageEdit(result);
  //       const imagesMap = [null];

  //       if (result.length > 0) {
  //         result.forEach((item: any) => {
  //           imagesMap[item.id_dokumen - 1] = item.filegambar;
  //         });
  //       }

  //       const zipData = result.find((item: any) => item.id_dokumen == '999');

  //       if (zipData) {
  //         const loadImage = await axios.get(`${apiUrl}/erp/extrak_zip`, {
  //           params: {
  //             entitas: kode_entitas,
  //             nama_zip: zipData.filegambar,
  //           },
  //         });

  //         const images = loadImage.data.images;

  //         const nameSetters = [(value: any) => updateStateFiles('nameImage1', value)];
  //         const previewSetters = [(value: any) => updateStateFiles('preview1', value)];

  //         imagesMap.forEach((filegambar, index) => {
  //           if (filegambar) {
  //             const fileUri = images.find((item: any) => item.fileName == filegambar);
  //             if (fileUri) {
  //               previewSetters[index](fileUri.imageUrl);
  //               nameSetters[index](fileUri.fileName);
  //             }
  //           }
  //         });
  //       } else {
  //         console.error('Zip data not found');
  //       }
  //       // END
  //     }
  //   };
  //   Async();
  // }, [kode_entitas, kode_dokumen]);

  return (
    <DialogComponent
      id="dialogFPACList"
      isModal={true}
      width="95%"
      height="90%"
      visible={open}
      close={onClose}
      header={
        statusPage === 'EDIT' && !isApprovalPusat ? 'FORM FPAC NON KONTRAK (EDIT)' : statusPage === 'EDIT' && isApprovalPusat ? 'FORM FPAC NON KONTRAK (APPROVAL PUSAT)' : 'FORM FPAC NON KONTRAK (NEW)'
      }
      showCloseIcon={true}
      target="#main-target"
      closeOnEscape={false}
      allowDragging={true}
      position={{ X: 'center', Y: 40 }}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
    >
      <div style={{ minWidth: '70%', overflow: 'auto' }}>
        {/* ======== Master & Detail ======== */}
        <div>
          {/* ======== Master ======== */}
          <div style={{ padding: 2 }}>
            <div className="panel-tabel" style={{ width: '100%' }}>
              <table className={styles.table} style={{ width: '100%' }}>
                <thead>
                  <tr className="!rounded-none !bg-yellow-400 !font-semibold !text-black">
                    <th colSpan={2} className="!rounded-none !border-r-4 !border-white !bg-yellow-400 !font-semibold !text-black">
                      <span className="text-base font-semibold tracking-widest !text-black">PEMBELI</span>
                    </th>
                  </tr>
                  <tr>
                    {/* COLOUMN KE 1 */}
                    <th style={{}}>Entitas</th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Gudang Penerimaan
                    </th>
                    {/* COLOUMN KE 2 */}
                    <th style={{}} className="!border-r-4 !border-white">
                      Tanggal Buat FPAC
                    </th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Tanggal Dokumen
                    </th>
                    {/* COLOUMN KE 3 */}
                    <th style={{}} className="!border-r-4 !border-white">
                      No FPAC
                    </th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Termin
                    </th>
                    {/* COLOUMN KE 4 */}
                    <th style={{ width: '25%' }}>Alamat Pengiriman Cabang Pembeli</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* COLOUMN KE 1 */}
                    <td>
                      {/* ENTITAS PEMBELI */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        {/* <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={entitasCabangBeli} readOnly></input> */}
                        <input
                          className={`container form-input`}
                          style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                          disabled={true}
                          value={masterData.entitasCabangBeli}
                          readOnly
                        ></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              setModalDaftarEntitas(true);
                              setEntitasType('gudang penerimaan');
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {/* GUDANG PENERIMAAN */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        {/* <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaGudangBeli} readOnly></input> */}
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaGudangBeli} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              if (masterData.entitasCabangBeli) {
                                setGudangType('pembeli');
                                setModalDaftarGudang(true);
                              } else {
                                withReactContent(swalToast).fire({
                                  icon: 'error',
                                  title: '<p style="font-size:12px">Entitas cabang pembeli harus diisi</p>',
                                  width: '100%',
                                  target: '#dialogFPACList',
                                  timer: 1500,
                                });

                                setTimeout(() => {
                                  setModalDaftarEntitas(true);
                                  setEntitasType('gudang penerimaan');
                                }, 1500);
                              }
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* COLOUMN KE 2 */}
                    <td>
                      {/* TANGGAL EFEKTIF */}
                      <DatePickerComponent
                        locale="id"
                        cssClass="e-custom-style"
                        enableMask={true}
                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                        showClearButton={false}
                        format="dd-MM-yyyy"
                        value={masterData.tglTrxFpac.toDate()}
                        // value={new Date()}
                        disabled={true}
                      >
                        <Inject services={[MaskedDateTime]} />
                      </DatePickerComponent>
                    </td>
                    <td>
                      {/* TANGGAL DOKUMEN */}
                      <DatePickerComponent
                        locale="id"
                        cssClass="e-custom-style"
                        placeholder="Tgl. PP"
                        enableMask={true}
                        showClearButton={false}
                        format="dd-MM-yyyy"
                        value={masterData.tglFpac.toDate()}
                        disabled={true}
                      >
                        <Inject services={[MaskedDateTime]} />
                      </DatePickerComponent>
                    </td>
                    {/* COLOUMN KE 3 */}
                    <td>
                      {/* MNOFPC */}
                      {/* <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={noFpac} readOnly></input> */}
                      <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.no_fpac} readOnly></input>
                    </td>
                    <td>
                      {/* TERMIN */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaTermin} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              setModalDaftarTermin(true);
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* COLOUMN KE 4 */}
                    {/* ALAMAT PENGIRIMAN */}
                    <td rowSpan={6}>
                      <textarea
                        className="container"
                        style={{
                          fontSize: 11,
                          borderColor: '#bfc9d4',
                          borderRadius: 2,
                          resize: 'none',
                          height: '145px',
                          borderStyle: 'solid',
                          borderWidth: '1px',
                          marginTop: '5px',
                        }}
                        value={masterData.alamatKirimCabang}
                        onChange={handleTextAreaChange}
                        spellCheck="false"
                      />
                    </td>
                  </tr>
                  {/* BARIS KE DUA */}
                  <tr className="!rounded-none !bg-yellow-400 !font-semibold !text-black">
                    <th colSpan={2} className="!rounded-none !border-r-4 !border-white !bg-yellow-400 !font-semibold !text-black">
                      <span className="text-base font-semibold tracking-widest !text-black">PENJUAL</span>
                    </th>
                  </tr>
                  <tr>
                    <th style={{ width: '7%' }}>Entitas</th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Faktur Jual
                    </th>

                    <th style={{}} className="!border-r-4 !border-white">
                      Tgl. Di Terima
                    </th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Cara Pengiriman
                    </th>

                    <th style={{}} className="!border-r-4 !border-white">
                      Pajak
                    </th>
                    <th style={{}} className="!bg-white"></th>
                  </tr>
                  <tr>
                    <td>
                      {/* ENTITAS PENJUAL */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        {/* <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={entitasCabangJual} readOnly></input> */}
                        <input
                          className={`container form-input`}
                          style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                          disabled={true}
                          value={masterData.entitasCabangJual}
                          readOnly
                        ></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              setModalDaftarEntitas(true);
                              setEntitasType('gudang pengeluaran');
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {/* FAKTUR JUAL */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        {/* <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaGudangJual} readOnly></input> */}
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.fakturJual} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              if (masterData.entitasCabangJual === '' || masterData.entitasCabangJual === null) {
                                withReactContent(swalToast).fire({
                                  icon: 'error',
                                  title: '<p style="font-size:12px">Entitas cabang penjual harus diisi</p>',
                                  width: '100%',
                                  target: '#dialogFPACList',
                                  timer: 1500,
                                });

                                setTimeout(() => {
                                  setModalDaftarEntitas(true);
                                  setEntitasType('gudang pengeluaran');
                                }, 1500);
                                return;
                              }
                              setModalDaftarFj(true);
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {/* TANGGAL Di Terima */}
                      <DatePickerComponent
                        locale="id"
                        cssClass="e-custom-style"
                        placeholder="Tgl. PP"
                        showClearButton={false}
                        format="dd-MM-yyyy"
                        value={masterData.tglTerima.toDate()}
                        change={(args: ChangeEventArgsCalendar) => {
                          if (args.value) {
                            const selectedDate = moment(args.value);
                            const hour = masterData.tglTerima.hour() || moment().hour();
                            const minute = masterData.tglTerima.minute() || moment().minute();
                            const second = masterData.tglTerima.second() || moment().second();

                            selectedDate.set({
                              hour: hour,
                              minute: minute,
                              second: second,
                            });
                            updateState('tglTerima', selectedDate);
                          } else {
                            updateState('tglTerima', moment());
                          }
                        }}
                      >
                        <Inject services={[MaskedDateTime]} />
                      </DatePickerComponent>
                    </td>
                    <td>
                      {/* CARA PENGIRIMAN */}
                      <DropDownListComponent
                        id="caraPengiriman"
                        className="form-select"
                        dataSource={['Dikirim', 'Ambil Sendiri']}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateState('fob', value);
                        }}
                        value={masterData.fob}
                      />
                    </td>
                    <td>
                      {/* PAJAK */}
                      <DropDownListComponent
                        id="pajak"
                        className="form-select"
                        dataSource={taxOptions}
                        fields={{ text: 'text', value: 'value' }}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateState('kenaPajak', value);
                        }}
                        value={masterData.kenaPajak}
                      />
                    </td>
                    <td>
                      <TextBoxComponent placeholder="" readonly={true} />
                    </td>
                  </tr>
                  {/* BARIS KE TIGA */}
                  <tr className={styles.table}>
                    <th colSpan={2} className="!border-r-4 !border-white">
                      Gudang Pengeluaran
                    </th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Tgl. Surat Jalan
                    </th>
                    <th style={{}} className="!border-r-4 !border-white">
                      Pemesanan Via
                    </th>

                    <th style={{}} className="!border-r-4 !border-white">
                      Form Tipe
                    </th>
                    <th style={{}} className="!bg-white"></th>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }} colSpan={2}>
                      {/* AREA PENGIRIMAN */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaGudangJual} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              if (masterData.entitasCabangJual) {
                                setGudangType('penjual');
                                setModalDaftarGudang(true);
                              } else {
                                withReactContent(swalToast).fire({
                                  icon: 'error',
                                  title: '<p style="font-size:12px">Entitas cabang penjual harus diisi</p>',
                                  width: '100%',
                                  target: '#dialogFPACList',
                                });
                              }
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {/* TANGGAL Surat Jalan */}
                      <DatePickerComponent
                        locale="id"
                        cssClass="e-custom-style"
                        placeholder="Tgl. PP"
                        showClearButton={false}
                        format="dd-MM-yyyy"
                        value={masterData.tglSJ.toDate()}
                        change={(args: ChangeEventArgsCalendar) => {
                          if (args.value) {
                            const selectedDate = moment(args.value);
                            const hour = masterData.tglSJ.hour() || moment().hour();
                            const minute = masterData.tglSJ.minute() || moment().minute();
                            const second = masterData.tglSJ.second() || moment().second();

                            selectedDate.set({
                              hour: hour,
                              minute: minute,
                              second: second,
                            });
                            updateState('tglSJ', selectedDate);
                          } else {
                            updateState('tglSJ', moment());
                          }
                        }}
                      >
                        <Inject services={[MaskedDateTime]} />
                      </DatePickerComponent>
                    </td>
                    <td>
                      {/* PEMESANAN VIA */}
                      <DropDownListComponent
                        id="pemesananVia"
                        className="form-select"
                        dataSource={['Fax', 'Telephone', 'Langsung']}
                        placeholder="--Silahkan Pilih--"
                        change={(args: ChangeEventArgsDropDown) => {
                          const value: any = args.value;
                          updateState('via', value);
                        }}
                        value={masterData.via}
                      />
                    </td>
                    <td>
                      {/* FORM TIPE */}
                      <label style={{ fontSize: '16px' }}>Antar Cabang</label>
                    </td>
                    <td>
                      <TextBoxComponent placeholder="" readonly={true} />
                    </td>
                  </tr>
                  {/* BARIS KE EMPAT */}
                  <tr className="!rounded-none !bg-yellow-400 !font-semibold !text-black">
                    <th colSpan={2} className="!rounded-none !bg-white !font-semibold !text-black"></th>
                    <th colSpan={4} className="!rounded-none !bg-yellow-400 !font-semibold !text-black">
                      <span className="text-base font-semibold tracking-widest !text-black">PUSAT</span>
                    </th>
                  </tr>
                  <tr className={styles.table}>
                    <th colSpan={2} className="!bg-white"></th>
                    <th colSpan={2}>Nama Supplier (Cab. Penjual)</th>
                    <th colSpan={2}>Nama Customer (Cab. Pembeli)</th>
                  </tr>
                  <tr>
                    <td colSpan={2}></td>
                    <td style={{ textAlign: 'center' }} colSpan={2}>
                      {/* CABANG SUPPLIER */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaRelasi} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            onClick={() => {
                              setModalDaftarSupplier(true);
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }} colSpan={2}>
                      {/* NAMA CUSTOMER */}
                      <div className="flex" style={{ alignItems: 'center' }}>
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaCustPusat} readOnly></input>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {/* <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-1"
                            // onClick={() => {
                            //   setModalDaftarCustomer(true);
                            // }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          /> */}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* BARIS KE EMPAT */}
                  <tr className={styles.table}>
                    <th colSpan={2} className="!bg-white"></th>
                    <th colSpan={2}>Gudang Penerimaan dan Pengeluaran</th>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }} colSpan={2}>
                      {' '}
                    </td>
                    <td style={{ textAlign: 'center' }} colSpan={2}>
                      {/* GUDANG PENERIMAAN DAN PENGELUARAN */}
                      {statusPage !== 'EDIT' || masterData.namaGudang ? (
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={masterData.namaGudang} readOnly></input>
                      ) : // <DropDownListComponent
                      //   id="dropdown"
                      //   dataSource={daftarGudang.map((gudang: any) => gudang.nama_gudang)}
                      //   value={masterData.namaGudang}
                      //   placeholder="Pilih Gudang"
                      //   // change={handleGudangPenerimaandanPengeluaranChange}
                      //   open={() => setGudangType('')}
                      //   enabled={false}
                      // />
                      null}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* ======== Detail ======== */}
          <div className="panel-tab" style={{ background: '#f0f0f0', width: '100%', height: '220px', marginTop: 10, borderRadius: 10 }}>
            <TabComponent ref={(t) => (tabFPACList = t)} selectedItem={statusPage === 'UPDATE-FILE' ? 1 : 0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
              <div className="e-tab-header" style={{ display: 'flex' }}>
                <div tabIndex={0} style={{ marginTop: 1, fontSize: '12px', fontWeight: 'bold', padding: '10px 10px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                  Data Barang
                </div>
                <div tabIndex={1} style={{ marginTop: 1, fontSize: '12px', fontWeight: 'bold', padding: '10px 10px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                  File Pendukung
                </div>
              </div>

              {/*===================== Content menampilkan data barang =======================*/}
              <div className="e-content">
                {/* //DATA BARANG */}
                <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                  <TooltipComponent ref={(t) => (tooltipDetailBarang = t)} openDelay={1000} target=".e-headertext">
                    <GridComponent
                      id="gridFPACList"
                      name="gridFPACList"
                      className="gridFPACList"
                      locale="id"
                      ref={(g) => (gridFPACList = g)}
                      editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }}
                      selectionSettings={{ mode: 'Row', type: 'Single' }}
                      allowResizing={true}
                      autoFit={true}
                      rowHeight={26}
                      height={100}
                      gridLines={'Both'}
                      // rowSelecting={rowSelectingDetailBarang}
                      actionComplete={actionCompleteDetailBarang}
                      // created={addDefaultRowIfEmpty}
                      allowKeyboard={false}
                    >
                      <ColumnsDirective>
                        <ColumnDirective
                          field="no_item"
                          headerText="No. Barang"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          allowEditing={false}
                          // editTemplate={editTemplateMasterItem_No}
                        />
                        <ColumnDirective
                          field="diskripsi"
                          headerText="Nama Barang"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="230"
                          clipMode="EllipsisWithTooltip"
                          allowEditing={false}
                          // editTemplate={editTemplateMasterItem_Nama}
                        />
                        <ColumnDirective field="satuan" headerText="Satuan" allowEditing={false} headerTextAlign="Center" textAlign="Left" width="160" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="qty" headerText="Kuantitas" headerTextAlign="Center" textAlign="Left" width="160" clipMode="EllipsisWithTooltip" allowEditing={false} />
                        <ColumnDirective
                          field="harga_mu"
                          headerText="Harga Cabang Pembeli"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          allowEditing={statusPage === 'EDIT' ? false : true}
                          template={(props: any) => {
                            return <span>{props.harga_mu ? parseFloat(props.harga_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                          }}
                        />
                        <ColumnDirective
                          field="harga_beli_mu"
                          headerText="Harga Pembelian Pusat"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          allowEditing={statusPage === 'EDIT' ? false : true}
                          template={(props: any) => {
                            return <span>{props.harga_beli_mu ? parseFloat(props.harga_beli_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                          }}
                        />
                        <ColumnDirective
                          field="harga_jual_mu"
                          headerText="Harga Cabang Penjual"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          allowEditing={statusPage === 'EDIT' ? false : true}
                          template={(props: any) => {
                            return <span>{props.harga_jual_mu ? parseFloat(props.harga_jual_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                          }}
                        />
                        <ColumnDirective
                          field="jumlah_mu"
                          allowEditing={false}
                          headerText="Jumlah"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          template={(props: any) => {
                            return <span>{props.jumlah_mu ? parseFloat(props.jumlah_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                          }}
                        />
                        <ColumnDirective
                          field="berat"
                          allowEditing={false}
                          headerText="Berat(KG)"
                          headerTextAlign="Center"
                          textAlign="Left"
                          width="160"
                          clipMode="EllipsisWithTooltip"
                          // template={(props: any) => {
                          //   return <span>{berat ? frmNumber(berat) : parseFloat(props.berat).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
                          // }}
                        />
                      </ColumnsDirective>

                      <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                    </GridComponent>
                  </TooltipComponent>

                  <div className="flex" style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px' }}>
                      <b>Total Berat:</b> <b>{masterData.totalBerat ? frmNumber(masterData.totalBerat) : frmNumber(masterData.berat)} Kg</b>
                      {/* <b>Total Berat:</b> <b>999 Kg</b> */}
                    </div>

                    <div style={{ fontSize: '11px', textAlign: 'right' }}>
                      <b>Sub total:</b> <b>{frmNumber(masterData.totalMu)}</b>
                      {/* <b>Sub total:</b> <b>999999999</b> */}
                    </div>
                  </div>
                </div>
                {/* FILE PENDUKUNG */}
                <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                  <div className="flex items-start gap-2">
                    {/* Table File */}
                    <table>
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Nama File</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataFiles?.map((item: any, index: any) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>
                              <div className="flex gap-2">
                                <button onClick={() => handlePreviewImg(item.preview)}>
                                  <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                </button>
                                <button onClick={() => handleDelete(item.id_dokumen)}>
                                  <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                </button>
                                <button onClick={() => downloadFile(item.preview, item.name)}>
                                  <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="hidden">
                      <UploaderComponent id="fileform" type="file" allowedExtensions=".pdf" ref={uploaderRefFiles} multiple={false} selected={(e) => handleFileSelect(e)} removing={() => {}} />
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1">
                      <label className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black`} htmlFor="fileform">
                        Ambil File
                      </label>
                      <label className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black `} onClick={() => handleDeleteAllFiles()}>
                        Hapus Semua File
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabComponent>
          </div>
        </div>
        {/* Catatan */}
        <div className="mb-10 ml-3 flex" style={{ justifyContent: 'space-between' }}>
          <div className="mb-3">
            <p className="set-font-11">
              <b>Catatan PO Cabang dan Pusat:</b>
            </p>
            <div className="" style={{ width: '100%' }}>
              <textarea
                className="container"
                style={{
                  fontSize: 11,
                  borderColor: '#bfc9d4',
                  borderRadius: 1,
                  // resize: 'none',
                  height: '65px',
                  width: '450px',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  marginTop: '5px',
                }}
                value={masterData.keterangan}
                onChange={handleKeterangan}
                spellCheck="false"
              />
            </div>
            <b style={{ color: 'green' }}>{outputWordsJumlah_mu}</b>
            {/* <b style={{ color: 'green' }}>Dua Ratus Ribu</b> */}
          </div>
          <div style={{ width: '20%', textAlign: 'right', marginTop: '65px', marginRight: '10px' }}>
            <div className="mt-1 flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>
                <b>DPP</b>
              </div>
              <div style={{ width: '50%', textAlign: 'right', fontWeight: 'bold' }}>
                <b> {/* <b>{kenaPajak == 'I' || kenaPajak == 'E' ? frmNumber(totalMu) : null}</b> */}</b>
              </div>
            </div>
            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>
                <b>Pajak</b>
              </div>
              <div style={{ width: '50%', textAlign: 'right', fontWeight: 'bold' }}>
                <b></b>
              </div>
            </div>
            <div className="mt-1 h-2 border-t-2 border-solid border-black"></div>
            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>
                <b>Total Setelah Pajak</b>
              </div>
              <div style={{ width: '50%', textAlign: 'right', fontWeight: 'bold' }}>
                <b>{frmNumber(masterData.totalMu)}</b>
                {/* <b>9999999999</b> */}
              </div>
            </div>
          </div>
        </div>
        {/* Button Actions */}
        <div
          style={{
            backgroundColor: '#F2FDF8',
            // backgroundColor: '#000',
            position: 'absolute',
            bottom: 0,
            right: 0,
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            width: '100%',
            // height: '55px',
            display: 'inline-block',
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
          }}
        >
          <div className="mb-5">
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              iconCss="e-icons e-small e-close"
              style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', marginBottom: '10px', backgroundColor: '#3b3f5c' }}
              onClick={() => onClose()}
            />
            {isApprovalPusat === false && (
              <ButtonComponent
                id="buSimpanDokumen1"
                content="Simpan"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-save"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => saveDoc()}
              />
            )}
            {isApprovalPusat === true && (
              <>
                <ButtonComponent
                  id="buDisetujui"
                  content="Disetujui"
                  cssClass="e-primary e-small"
                  iconCss="e-icons e-small e-check-box"
                  style={{
                    float: 'right',
                    width: '90px',
                    marginTop: 1 + 'em',
                    marginRight: 1 + 'em',
                    backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                  onClick={() => {
                    handleApprovalPusat('Y');
                  }}
                />
                <ButtonComponent
                  id="buKoreksi"
                  content="Koreksi"
                  cssClass="e-primary e-small"
                  iconCss="e-icons e-small e-annotation-edit"
                  style={{
                    float: 'right',
                    width: '90px',
                    marginTop: 1 + 'em',
                    marginRight: 1 + 'em',
                    backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                  onClick={() => handleApprovalPusat('C')}
                />
                <ButtonComponent
                  id="buDitolak"
                  content="Ditolak"
                  cssClass="e-primary e-small"
                  iconCss="e-icons e-small e-export-xls"
                  style={{
                    float: 'right',
                    width: '90px',
                    marginTop: 1 + 'em',
                    marginRight: 1 + 'em',
                    backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                  onClick={() => handleApprovalPusat('N')}
                />
              </>
            )}
          </div>
        </div>
        {/* Modal List Gudang */}
        {modalDaftarGudang && (
          <DialogBarangGudang
            onOpen={modalDaftarGudang}
            onClose={() => {
              setModalDaftarGudang(false);
              setSearchNamaGudang('');
              const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
              if (cariNoAkun) {
                cariNoAkun.value = '';
              }
            }}
            pencarianNamaGudang={(e) => PencarianNamaGudang(e)}
            dataSource={searchNamaGudang !== '' ? filteredDataGudang : daftarGudang}
            setSelectedGudang={(e) => setSelectedGudang(e)}
            handlePilihGudang={handlePilihGudang}
            setModalDaftarGudang={setModalDaftarGudang}
          />
        )}

        {modalDaftarSupplier && (
          <DialogListSupplier
            onOpen={modalDaftarSupplier}
            onClose={() => {
              setModalDaftarSupplier(false);
              setSearchNoSupp('');
              setSearchNamaRelasi('');
              setFilteredDataSupplier(listDaftarSupplier);
            }}
            handlePilihSupplier={handlePilihSupplier}
            setModalDaftarSupplier={setModalDaftarSupplier}
            dataSource={searchNoSupp !== '' || searchNamaRelasi !== '' ? filteredDataSupplier : listDaftarSupplier}
            setSelectedSupplier={(e) => setSelectedSupplier(e)}
            pencarianSupplier={(e, flag) => PencarianSupplier(e, flag)}
          />
        )}

        {modalDaftarEntitas && (
          <DialogListEntitas
            onOpen={modalDaftarEntitas}
            onClose={() => {
              setSearchKodeCabang('');
              setSearchCabang('');
              const cariKodeCabang = document.getElementById('cariKodeCabang') as HTMLInputElement;
              if (cariKodeCabang) {
                cariKodeCabang.value = '';
              }
              const cariCabang = document.getElementById('cariCabang') as HTMLInputElement;
              if (cariCabang) {
                cariCabang.value = '';
              }
              setFilteredDataEntitas(listDaftarEntitas);
              setModalDaftarEntitas(false);
            }}
            dataSource={filteredDataEntitas.length > 0 ? filteredDataEntitas : listDaftarEntitas}
            handlePilihEntitas={handlePilihEntitas}
            filterEntitas={(e, a) => PencarianEntitas(e, a)}
            searchCabang={searchCabang}
            setSearchCabang={setSearchCabang}
            searchKodeCabang={searchKodeCabang}
            setSearchKodeCabang={setSearchKodeCabang}
            setModalDaftarEntitas={setModalDaftarEntitas}
            setSelectedEntitas={(e) => setSelectedEntitas(e)}
          />
        )}

        {modalDaftarFj && (
          <DialogFakturJual
            onOpen={modalDaftarFj}
            onClose={() => {
              setModalDaftarFj(false);
            }}
            setSelectedFj={setSelectedFj}
            dataNoFj={filteredDataFj.length > 0 ? filteredDataFj : listDaftarNoFj}
            dataListFj={listDaftarFj}
            pencarianNoFj={(e) => pencarianNoFj(e)}
            handlePilihFj={(e) => handlePilihFj(e)}
          />
        )}

        {modalDaftarTermin && (
          <DialogListTermin
            onOpen={modalDaftarTermin}
            onClose={() => {
              setModalDaftarTermin(false);
              setSearchNoTermin('');
              const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
              if (cariNoAkun) {
                cariNoAkun.value = '';
              }
            }}
            dataSource={searchNoTermin !== '' ? filteredDataTermin : listDaftarTermin}
            setModalDaftarTermin={setModalDaftarTermin}
            setSelectedTermin={setSelectedTermin}
            pencarianNoTermin={(e) => PencarianNoTermin(e)}
            handlePilihTermin={handlePilihTermin}
          />
        )}
        {/* DIALOG PROGRESS BAR */}
        <GlobalProgressBar />
      </div>
    </DialogComponent>
  );
};

export default DialogFrmFpacNonKontrak;
