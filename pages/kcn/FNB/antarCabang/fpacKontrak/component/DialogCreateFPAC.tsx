import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import styles from './styling.module.css';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { frmNumber, generateNU, FillFromSQL, fetchPreferensi, formatNumber } from '@/utils/routines';
import { useState, useEffect } from 'react';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import axios from 'axios';
import { L10n } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useApprovalPusat } from '../hooks/useApprovalPusat';
import { fetchCekQty, fetchCekStok } from '../api';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';

interface DialogFPACList {
  userid: string;
  kode_entitas: any;
  isOpen: boolean;
  onClose: () => void;
  kode_user: any;
  kode_dokumen: any;
  statusPage: any;
  isApprovalCabang: any;
  isApprovalPusat: any;
  onRefresh: any;
  token: any;
  isDisabled: boolean;
  selectedItem: any;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

let tabFPACList: Tab | any;
let tooltipDetailBarang: Tooltip | any;
let gridFPACList: Grid | any;
let gridDaftarBarang: Grid | any;

const DialogFPACList: React.FC<DialogFPACList> = ({
  userid,
  kode_entitas,
  isOpen,
  onClose,
  kode_user,
  kode_dokumen,
  statusPage,
  isApprovalCabang,
  isApprovalPusat,
  token,
  onRefresh,
  isDisabled,
  selectedItem,
}) => {
  const [noFpac, setNoFpac] = useState('');
  const [tglFpac, setTglFpac] = useState<any>(moment());
  const [kodeSupp, setKodeSupp] = useState('');
  const [tglBerlaku, setTglBerlaku] = useState<any>(moment());
  const [tglKirim, setTglKirim] = useState<any>(moment());
  const [via, setVia] = useState('Fax');
  const [fob, setFob] = useState('Dikirim');
  const [kodeTermin, setKodeTermin] = useState('');
  const [kodeMu, setKodeMu] = useState('');
  const [kurs, setKurs] = useState('');
  const [kursPajak, setKursPajak] = useState('');
  const [kenaPajak, setKenaPajak] = useState('N');
  const [totalMu, setTotalMu] = useState<any>(null);
  const [totalBerat, setTotalBerat] = useState('');
  const [berat, setBerat] = useState('');
  const [noItem, setNoItem] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [alamatKirimCabang, setAlamatKirimCabang] = useState('');
  const [keteranganPusat, setKeteranganPusat] = useState('');
  const [kodeGudangBeli, setKodeGudangBeli] = useState('');
  const [namaGudangBeli, setNamaGudangBeli] = useState('');
  const [kodeGudangJual, setKodeGudangJual] = useState('');
  const [namaGudangJual, setNamaGudangJual] = useState('');
  const [kodeKirimCabangJual, setKodeKirimCabangJual] = useState('');
  const [namaKirimCabangJual, setNamaKirimCabangJual] = useState('');
  const [kodeCustPusat, setKodeCustPusat] = useState('');
  const [kodeGudangPusat, setKodeGudangPusat] = useState('');
  const [noReff, setNoReff] = useState('');
  const [entitasCabangBeli, setEntitasCabangBeli] = useState('');
  const [entitasCabangJual, setEntitasCabangJual] = useState('');
  const [tglTrxFpac, setTglTrxFpac] = useState<any>(moment());
  const [namaRelasi, setNamaRelasi] = useState('');
  const [namaTermin, setNamaTermin] = useState('');
  const [namaGudang, setNamaGudang] = useState<string>('');
  const [namaCustPusat, setNamaCustPusat] = useState('');
  const [status, setStatus] = useState('');

  // APPROVAL PUSAT //
  //======= Hooks Approval Pusat ... ========
  const { handleSave, setEditDataFromModal, editData, isLoading, setHargaBeliMu, setHargaJualMu } = useApprovalPusat();

  // ======= Hooks Progress Bar ... ========
  const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

  const taxOptions = [
    { text: 'Tanpa Pajak', value: 'N' },
    { text: 'Include (I)', value: 'I' },
    { text: 'Exclude (E)', value: 'E' },
  ];

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAlamatKirimCabang(e.target.value);
  };

  const handleTextAreaCatatanPOCabangChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeterangan(e.target.value);
  };

  const handleTextAreaCatatanPOPusatChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeteranganPusat(e.target.value);
  };

  const HandleCaraPengiriman = (event: string, setfob: Function) => {
    const newValue = event;
    setfob(newValue);
  };

  const HandlePemesananVia = (event: string, setvia: Function) => {
    const newValue = event;
    setvia(newValue);
  };

  const HandlePajak = (event: string, setkenaPajak: Function) => {
    const newValue = event;
    setkenaPajak(newValue);
  };

  const handleCreate = async () => {
    const result = await generateNU(kode_entitas, '', '82', moment().format('YYYYMM'));
    if (result) {
      setNoFpac(result);
    } else {
      console.error('undefined');
    }
  };

  // const cekStok = async () => {
  //   const res = fetchCekStok({ entitas: kode_entitas, token, param1: 'ITM000004845', param2: moment().format('YYYY-MM-DD HH:mm:ss'), param3: 'GD0000000038', param4: '', param5: 'fpac' });
  //   console.log(res);
  // };

  // useEffect(() => {
  //   cekStok();
  // }, []);

  const [daftarGudang, setDaftarGudang] = useState<any>([]);
  const [daftarGdEntitas, setDaftarGdEntitas] = useState<any>([]);

  const handleEdit = async () => {
    const response = await axios.get(`${apiUrl}/erp/master_detail_FPAC?entitas=${kode_entitas}&param1=${kode_dokumen}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const detailHeader = response.data.data;
    setEditDataFromModal(response.data.data!);

    setNoFpac(detailHeader.no_fpac);
    setTglFpac(moment(detailHeader.tgl_fpac, 'YYYY-MM-DD'));
    setKodeSupp(detailHeader.kode_supp);
    setTglBerlaku(moment(detailHeader.tgl_berlaku, 'YYYY-MM-DD'));
    setTglKirim(moment(detailHeader.tgl_kirim, 'YYYY-MM-DD'));
    setVia(detailHeader.via);
    setFob(detailHeader.fob);
    setKodeTermin(detailHeader.kode_termin);
    setKodeMu(detailHeader.kode_mu);
    setKurs(detailHeader.kurs);
    setKursPajak(detailHeader.kurs_pajak);
    setKenaPajak(detailHeader.kena_pajak);
    setTotalMu(detailHeader.total_mu);
    setTotalBerat(detailHeader.total_berat);
    setKeterangan(detailHeader.keterangan);
    setAlamatKirimCabang(detailHeader.alamat_kirim_cabang);
    setKeteranganPusat(detailHeader.keterangan_pusat);
    setKodeGudangBeli(detailHeader.kode_gudang_beli);
    setNamaGudangBeli(detailHeader.nama_gudang_beli);
    setKodeGudangJual(detailHeader.kode_gudang_jual);
    setNamaGudangJual(detailHeader.nama_gudang_jual);
    setKodeKirimCabangJual(detailHeader.kode_kirim_cabang_jual);
    setNamaKirimCabangJual(detailHeader.nama_kirim_cabang_jual);
    setKodeCustPusat(detailHeader.kode_cust_pusat);
    setKodeGudangPusat(detailHeader.kode_gudang_pusat);
    setNoReff(detailHeader.no_reff);
    setEntitasCabangBeli(detailHeader.kode_entitas);
    setEntitasCabangJual(detailHeader.entitas_cabang_jual);
    setTglTrxFpac(moment(detailHeader.tgl_trxfpac, 'YYYY-MM-DD'));
    setNamaRelasi(detailHeader.nama_relasi);
    setNamaTermin(detailHeader.nama_termin);
    setNamaGudang(detailHeader.nama_gudang);
    setNamaCustPusat(detailHeader.nama_cust_pusat);
    setStatus(detailHeader.status);

    const { detail } = response.data.data;
    setBerat(detail[0].berat);
    setNoItem(detail[0].no_item);

    if (detail.length > 0) {
      const mappedBarang = detail.map((item: any) => ({
        kode_fpac: item.kode_fpac,
        id_fpac: item.id_fpac,
        kode_pp: item.kode_pp,
        id_pp: item.id_pp,
        kode_so: item.kode_so,
        id_so: item.id_so,
        kode_item: item.kode_item,
        diskripsi: item.diskripsi,
        satuan: item.satuan,
        qty: item.qty,
        sat_std: item.sat_std,
        qty_std: item.qty_std,
        qty_sisa: item.qty_sisa,
        qty_batal: item.qty_batal,
        kode_mu: item.kode_mu,
        kurs: item.kurs,
        kurs_pajak: item.kurs_pajak,
        harga_mu: parseFloat(item.harga_mu),
        diskon: item.diskon,
        diskon_mu: item.diskon_mu,
        potongan_mu: item.potongan_mu,
        kode_pajak: item.kode_pajak,
        pajak: item.pajak,
        include: item.include,
        pajak_mu: item.pajak_mu,
        jumlah_mu: item.jumlah_mu,
        jumlah_rp: item.jumlah_rp,
        kode_dept: item.kode_dept,
        kode_kerja: item.kode_kerja,
        harga_jual_mu: item.harga_jual_mu,
        harga_beli_mu: item.harga_beli_mu,
        no_item: item.no_item,
        berat: parseFloat(item.berat),
      }));
      gridFPACList.dataSource = mappedBarang;
    }
  };

  const fetchData = async () => {
    try {
      if (statusPage === 'CREATE') {
        handleCreate();
      } else if (statusPage === 'EDIT') {
        handleEdit();
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusPage, kode_entitas, kode_dokumen, token]);

  const [modalDaftarBarang, setModalDaftarBarang] = useState(false);

  const dialogClose = () => {
    if (gridFPACList && gridFPACList.dataSource) {
      gridFPACList.dataSource.splice(0, gridFPACList.dataSource.length);
    }
    setNamaGudang('');
    onClose();
  };

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

  // **TERMIN** //
  const [modalDaftarTermin, setModalDaftarTermin] = useState(false);
  const [listDaftarTermin, setDaftarTermin] = useState([]);

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
    setKodeTermin(selectedTermin.kode_termin);
    setNamaTermin(selectedTermin.nama_termin);
    setModalDaftarTermin(false);
  };

  useEffect(() => {
    refreshDaftarTermin();
  }, [kode_entitas]);

  const [selectedTermin, setSelectedTermin] = useState<any>('');

  // FILTER
  const [filteredDataTermin, setFilteredDataTermin] = useState('');
  const [searchNoTermin, setSearchNoTermin] = useState('');

  const PencarianNoTermin = async (event: string, setSearchNoTermin: Function, setFilteredData: Function, listDaftarTermin: any[]) => {
    const searchValue = event;
    setSearchNoTermin(searchValue);
    const filteredData = SearchDataNoTermin(searchValue, listDaftarTermin);
    setFilteredData(filteredData);

    const cariNamaAkun = document.getElementById('cariNamaAkun') as HTMLInputElement;
    if (cariNamaAkun) {
      cariNamaAkun.value = '';
    }
  };

  const SearchDataNoTermin = (keyword: any, listDaftarTermin: any[]) => {
    if (keyword === '') {
      return listDaftarTermin;
    } else {
      const filteredData = listDaftarTermin.filter((item) => item.nama_termin.toLowerCase().startsWith(keyword.toLowerCase()));
      return filteredData;
    }
  };

  // **DAFTAR ENTITAS** //
  const [entitasType, setEntitasType] = useState<any>('');
  const [listDaftarEntitas, setDaftarEntitas] = useState([]);
  const [modalDaftarEntitas, setModalDaftarEntitas] = useState(false);
  const [selectedEntitas, setSelectedEntitas] = useState<any>(null);

  const refreshDaftarEntitas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/get_all_entitas?entitas=${kode_entitas}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarEntitas(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshDaftarEntitas();
  }, []);

  const handlePilihEntitas = async () => {
    if (selectedEntitas.kodecabang == '899') {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: '<p style="font-size:12px">Kode Entitas Pusat Tidak Bisa dijadikan Cabang Jual</p>',
        width: '100%',
        target: '#dialogEntitas',
      });
    } else if (entitasType == 'gudang pengeluaran') {
      setEntitasCabangJual(selectedEntitas.Kode);
      setModalDaftarEntitas(false);
    } else if (entitasType == 'gudang penerimaan') {
      setEntitasCabangBeli(selectedEntitas.Kode);
      setAlamatKirimCabang(selectedEntitas.alamat_kirim1);
      setNamaGudangBeli('');
      setKodeGudangBeli('');
      setModalDaftarEntitas(false);
    }
  };

  // FILTER
  const [filteredDataEntitas, setFilteredDataEntitas] = useState<any>([]);
  const [searchKodeCabang, setSearchKodeCabang] = useState<any>('');
  const [searchCabang, setSearchCabang] = useState<any>('');

  const filterEntitas = (searchKodeCabang: any, searchCabang: any, listDaftarEntitas: any) => {
    let filteredData = listDaftarEntitas;

    if (searchKodeCabang) {
      filteredData = filteredData.filter((item: any) => item.Kode.toLowerCase().includes(searchKodeCabang.toLowerCase()));
    }

    if (searchCabang) {
      filteredData = filteredData.filter((item: any) => item.Cabang.toLowerCase().includes(searchCabang.toLowerCase()));
    }

    setFilteredDataEntitas(filteredData);
  };

  // GUDANG
  const [gudangType, setGudangType] = useState<string>('');

  const [modalDaftarGudang, setModalDaftarGudang] = useState(false);
  const entitasGudang = gudangType == 'pembeli' ? entitasCabangBeli : gudangType == 'penjual' ? entitasCabangJual : kode_entitas;

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
      console.error('Error fetching data:', error);
    }
  };

  const refreshDaftarGudangEntitas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/get_gudang_surat_jalan`, {
        params: {
          entitas: entitasGudang,
          param1: 'all',
          param2: 'all',
          param3: 'Y',
        },
      });

      setDaftarGdEntitas(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGudangPenerimaandanPengeluaranChange = (e: any) => {
    const selectedGudangData = daftarGudang.find((gudang: any) => gudang.nama_gudang === e.value);
    if (selectedGudangData) {
      setKodeGudangPusat(selectedGudangData.kode_gudang);
      setNamaGudang(selectedGudangData.nama_gudang);
    }
  };

  const handlePilihGudang = async () => {
    if (gudangType == 'pembeli') {
      setNamaGudangBeli(selectedGudang.nama_gudang);
      setKodeGudangBeli(selectedGudang.kode_gudang);
      setModalDaftarGudang(false);
    } else if (gudangType == 'penjual') {
      setNamaGudangJual(selectedGudang.nama_gudang);
      setKodeGudangJual(selectedGudang.kode_gudang);
      setModalDaftarGudang(false);
    }
  };

  useEffect(() => {
    refreshDaftarGudang();
  }, []);

  useEffect(() => {
    refreshDaftarGudangEntitas();
  }, [entitasGudang]);

  const [selectedGudang, setSelectedGudang] = useState<any>('');

  // FILTER
  const [filteredDataGudang, setFilteredDataGudang] = useState('');
  const [searchNamaGudang, setSearchNamaGudang] = useState('');

  const PencarianNamaGudang = async (event: string, setSearchNamaGudang: Function, setFilteredData: Function, daftarGudang: any[]) => {
    const searchValue = event;
    setSearchNamaGudang(searchValue);
    const filteredData = SearchDataNamaGudang(searchValue, daftarGudang);
    setFilteredData(filteredData);

    const cariNamaAkun = document.getElementById('cariNamaAkun') as HTMLInputElement;
    if (cariNamaAkun) {
      cariNamaAkun.value = '';
    }
  };

  const SearchDataNamaGudang = (searchValue: string, daftarGudang: any[]) => {
    return daftarGudang.filter((gudang) => gudang.nama_gudang.toLowerCase().includes(searchValue.toLowerCase()));
  };

  // AREA PENGIRIMAN
  const [modalDaftarAreaPengiriman, setModalDaftarAreaPengiriman] = useState(false);
  const [listDaftarAreaPengiriman, setDaftarAreaPengiriman] = useState([]);

  const refreshDaftarAreaPengiriman = async () => {
    if (entitasCabangJual) {
      try {
        const response = await axios.get(`${apiUrl}/erp/area_kirim`, {
          params: {
            entitas: entitasCabangJual,
            param1: 'all',
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDaftarAreaPengiriman(response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const handlePilihAreaPengiriman = async () => {
    setKodeKirimCabangJual(selectedAreaPengiriman.kode_kirim);
    setNamaKirimCabangJual(selectedAreaPengiriman.nama_kirim);
    setModalDaftarAreaPengiriman(false);
  };

  useEffect(() => {
    refreshDaftarAreaPengiriman();
  }, [entitasCabangJual]);

  const [selectedAreaPengiriman, setSelectedAreaPengiriman] = useState<any>('');

  // FILTER
  const [filteredDataAreaPengiriman, setFilteredDataAreaPengiriman] = useState('');
  const [searchnamaKirimCabangJual, setSearchnamaKirimCabangJual] = useState('');

  const PencariannamaKirimCabangJual = async (event: string, setSearchnamaKirimCabangJual: Function, setFilteredData: Function, listDaftarAreaPengiriman: any[]) => {
    const searchValue = event;
    setSearchnamaKirimCabangJual(searchValue);
    const filteredData = SearchDatanamaKirimCabangJual(searchValue, listDaftarAreaPengiriman);
    setFilteredData(filteredData);

    const cariNamaAkun = document.getElementById('cariNamaAkun') as HTMLInputElement;
    if (cariNamaAkun) {
      cariNamaAkun.value = '';
    }
  };

  const SearchDatanamaKirimCabangJual = (searchValue: string, listDaftarAreaPengiriman: any[]) => {
    return listDaftarAreaPengiriman.filter((areaPengiriman) => areaPengiriman.nama_kirim.toLowerCase().includes(searchValue.toLowerCase()));
  };

  // **NO REFF** //
  const [modalDaftarNoReff, setModalDaftarNoReff] = useState(false);
  const [listDaftarNoReff, setDaftarNoReff] = useState([]);
  const [selectedNoReff, setSelectedNoReff] = useState<any>('');

  const refreshDaftarNoReff = async () => {
    const selectedDescription = gridFPACList.dataSource[0];

    if (entitasCabangJual && kodeGudangJual && namaGudangJual && selectedDescription) {
      try {
        const response = await axios.get(`${apiUrl}/erp/list_noreff_kontrak`, {
          params: {
            entitas: entitasCabangJual,
            param1: 'all',
            param2: kodeGudangJual,
            param3: namaGudangJual,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const modifiedData = response.data.data.map((item: any) => ({
          ...item,
          stok: parseFloat(item.stok),
        }));
        setDaftarNoReff(modifiedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const handlePilihNoReff = () => {
    setNoReff(selectedNoReff.no_kontrak);
    setModalDaftarNoReff(false);
  };

  // CABANG SUPPLIER
  const [modalDaftarSupplier, setModalDaftarSupplier] = useState<any>(false);
  const [listDaftarSupplier, setDaftarSupplier] = useState<any>([]);

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
    setKodeMu(selectedSupplier.kode_mu);
    setKurs(selectedSupplier.kurs);
    setKursPajak(selectedSupplier.kurs_pajak);
    setKodeSupp(selectedSupplier.kode_supp);
    setNamaRelasi(selectedSupplier.nama_relasi);
    setKodeTermin(selectedSupplier.kode_termin);
    setNamaTermin(selectedSupplier.nama_termin);
    setModalDaftarSupplier(false);
  };

  useEffect(() => {
    refreshDaftarSupplier();
  }, [kode_entitas]);

  const [selectedSupplier, setSelectedSupplier] = useState<any>('');

  // FILTER
  const [filteredDataSupplier, setFilteredDataSupplier] = useState<any>([]);
  const [searchNoSupp, setSearchNoSupp] = useState<any>('');
  const [searchNamaRelasi, setSearchNamaRelasi] = useState<any>('');

  const PencarianSupplier = (event: any, setSearchValue: Function, setFilteredData: Function, listData: any[], field: any) => {
    const searchValue = event;
    setSearchValue(searchValue);
    const filteredData = SearchDataSupplier(searchValue, listData, field);
    setFilteredData(filteredData);
  };

  const SearchDataSupplier = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  // CUSTOMER
  const [modalDaftarCustomer, setModalDaftarCustomer] = useState<any>(false);
  const [listDaftarCustomer, setDaftarCustomer] = useState<any>([]);
  const [paramCust, setParamCust] = useState({
    nama_relasi: '',
    no_cust: '',
    nama_sales: '',
  });
  const [debouncedParamCust, setDebouncedParamCust] = useState(paramCust);

  const refreshDaftarCustomer = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/list_cust_so`, {
        params: {
          entitas: kode_entitas,
          param1: paramCust.nama_relasi ? paramCust.nama_relasi : 'all',
          param2: paramCust.no_cust ? paramCust.no_cust : 'all',
          param3: paramCust.nama_sales ? paramCust.nama_sales : 'all',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDaftarCustomer(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePilihCustomer = async () => {
    setKodeCustPusat(selectedCustomer.kode_cust);
    setNamaCustPusat(selectedCustomer.nama_relasi);
    setModalDaftarCustomer(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParamCust(paramCust);
    }, 1000); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [paramCust]);

  useEffect(() => {
    refreshDaftarCustomer();
  }, [debouncedParamCust]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>('');

  // FILTER
  const [filteredDataCustomer, setFilteredDataCustomer] = useState<any>([]);
  const [searchNoCust, setSearchNoCust] = useState<any>('');
  const [searchnamaCustPusat, setSearchnamaCustPusat] = useState<any>('');
  const [searchNamaSalesman, setSearchNamaSalesman] = useState<any>('');

  const PencarianCustomer = (event: any, setSearchValue: Function, setFilteredData: Function, listData: any[], field: any) => {
    const searchValue = event;
    setSearchValue(searchValue);
    const filteredData = SearchDataCustomer(searchValue, listData, field);
    setFilteredData(filteredData);
  };

  const SearchDataCustomer = (keyword: any, listData: any[], field: any) => {
    if (keyword === '') {
      return listData;
    } else {
      const filteredData = listData.filter((item) => item[field].toLowerCase().includes(keyword.toLowerCase()));
      return filteredData;
    }
  };

  // HANDLE DATA BARANG
  const addDefaultRowIfEmpty = () => {
    if (gridFPACList.dataSource.length === 0) {
      const defaultRow = {
        id_fpac: 1,
        kode_pp: null,
        id_pp: '0',
        kode_so: null,
        id_so: '0',
        kode_item: '',
        diskripsi: '',
        satuan: '',
        qty: '',
        sat_std: '',
        qty_std: '',
        qty_sisa: '',
        qty_batal: '',
        kode_mu: 'IDR',
        kurs: '1.0000',
        kurs_pajak: '1.0000',
        harga_mu: 0,
        diskon: null,
        diskon_mu: '0.0000',
        potongan_mu: '0.0000',
        kode_pajak: '',
        pajak: '0.00',
        include: '',
        pajak_mu: '0.0000',
        jumlah_mu: 0,
        jumlah_rp: '',
        kode_dept: null,
        kode_kerja: null,
        harga_jual_mu: 0,
        harga_beli_mu: 0,
        no_item: '', // tidak digunakan di saveDoc
        brt: '0', // tidak digunakan di saveDoc
        berat: '0', // tidak digunakan di saveDoc
      };
      gridFPACList.addRecord(defaultRow, 0);
      gridFPACList.refresh();
    }
  };

  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  const rowSelectingDetailBarang = (args: any) => {
    setSelectedRowIndex(args.rowIndex);
  };

  const [selectedBarang, setSelectedBarang] = useState<any>('');

  useEffect(() => {
    refreshDaftarNoReff();
  }, [entitasCabangJual, kodeGudangJual, namaGudangJual]);

  const handleDataBarang = async (jenis: any) => {
    const totalLine = gridFPACList.dataSource.length;
    const isNoBarangNotEmpty = gridFPACList.dataSource.every((item: any) => item.no_item !== null);

    if (jenis === 'selected') {
      const detailBarangBaru = {
        id_fpac: selectedRowIndex + 1,
        kode_pp: null,
        id_pp: '0',
        kode_so: null,
        id_so: '0',
        kode_item: selectedBarang.kode_item,
        diskripsi: selectedBarang.nama_item,
        satuan: selectedBarang.satuan,
        qty: '',
        sat_std: selectedBarang.satuan,
        qty_std: '',
        qty_sisa: '',
        qty_batal: '0',
        kode_mu: 'IDR',
        kurs: '1.0000',
        kurs_pajak: '1.0000',
        harga_mu: null,
        diskon: null,
        diskon_mu: '0.0000',
        potongan_mu: '0.0000',
        kode_pajak: 'N',
        pajak: '0.00',
        include: kenaPajak,
        pajak_mu: '0.0000',
        jumlah_mu: null,
        jumlah_rp: '',
        kode_dept: null,
        kode_kerja: null,
        harga_jual_mu: null,
        harga_beli_mu: null,
        no_item: selectedBarang.no_item, // tidak digunakan di saveDoc
        brt: selectedBarang.berat, // tidak digunakan di saveDoc
        berat: selectedBarang.berat, // tidak digunakan di saveDoc
      };
      gridFPACList.dataSource[selectedRowIndex] = detailBarangBaru;
      gridFPACList.refresh();
      return;
    }
  };

  const [listDaftarBarang, setDaftarBarang] = useState([]);

  const [searchNoItem, setSearchNoItem] = useState('');
  const [searchNamaItem, setSearchNamaItem] = useState('');

  const getFromModalBarang = async () => {
    handleDataBarang('selected');
    setModalDaftarBarang(false);
  };

  const refreshDaftarBarang = async () => {
    try {
      const response = await axios.get(`${apiUrl}/erp/list_barang?`, {
        params: {
          entitas: entitasCabangBeli ? entitasCabangBeli : kode_entitas,
          kode: searchNoItem ? searchNoItem : 'all',
          nama: searchNamaItem ? searchNamaItem : 'all',
          limit: '25',
        },
      });
      const result = response.data;

      if (result.status) {
        setDaftarBarang(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshDaftarBarang();
  }, [searchNoItem, searchNamaItem, entitasCabangBeli]);

  const [tambah, setTambah] = useState(false);
  const [edit, setEdit] = useState(false);

  const kalkulasi = () => {
    Promise.all(
      gridFPACList.dataSource.map(async (item: any) => {
        if (item.qty !== 0 && item.qty !== '' && item.harga_mu !== 0 && item.harga_mu !== '') {
          item.jumlah_mu = item.qty * item.harga_mu;
          item.jumlah_rp = item.qty * item.harga_mu;
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
      setTotalMu(totalNilaiValue);
      setTotalBerat(totalBeratValue);
    });
  };

  const actionCompleteDetailBarang = async (args: any) => {
    switch (args.requestType) {
      case 'save':
        const hargaBeliMu = parseFloat(args.data.harga_beli_mu);
        const hargaJualMu = parseFloat(args.data.harga_jual_mu);
        setHargaBeliMu(hargaBeliMu);
        setHargaJualMu(hargaJualMu);
        if (tambah === false) {
          const editedData = args.data;
          gridFPACList.dataSource[args.rowIndex] = editedData;
          kalkulasi();
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

  const handleButtonClickNodanNamaBarang = () => {
    gridFPACList.refresh();
    if (entitasCabangBeli) {
      setModalDaftarBarang(true);
    } else {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: '<p style="font-size:12px">Entitas Cabang Pembeli belum diisi</p>',
        width: '100%',
        target: '#dialogFPACList',
      });
    }
  };

  const editTemplateMasterItem_No = (args: any) => {
    return (
      <div>
        <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
          <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <TextBoxComponent value={args.no_item} readOnly={true} showClearButton={false} />
            <span>
              <ButtonComponent
                id="buNoItem1"
                type="button"
                cssClass="e-primary e-small e-round"
                iconCss="e-icons e-small e-search"
                onClick={handleButtonClickNodanNamaBarang}
                style={{ backgroundColor: '#3b3f5c' }}
              />
            </span>
          </div>
        </TooltipComponent>
      </div>
    );
  };

  const editTemplateMasterItem_Nama = (args: any) => {
    return (
      <div>
        <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
          <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
            <TextBoxComponent value={args.diskripsi} readOnly={true} showClearButton={false} />
            <span>
              <ButtonComponent
                id="buNoItem1"
                type="button"
                cssClass="e-primary e-small e-round"
                iconCss="e-icons e-small e-search"
                onClick={handleButtonClickNodanNamaBarang}
                style={{ backgroundColor: '#3b3f5c' }}
              />
            </span>
          </div>
        </TooltipComponent>
      </div>
    );
  };

  // TERBILANG

  // handle jumlah mu
  const [outputWordsJumlah_mu, setOutputWordsJumlah_mu] = useState('');

  function terbilang(a: any) {
    var bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    var kalimat = '';

    // 1 - 11
    if (a < 12) {
      kalimat = bilangan[a];
    }
    // 12 - 19
    else if (a < 20) {
      kalimat = bilangan[a - 10] + ' Belas';
    }
    // 20 - 99
    else if (a < 100) {
      var utama = a / 10;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 10;
      kalimat = bilangan[depan] + ' Puluh ' + bilangan[belakang];
    }
    // 100 - 199
    else if (a < 200) {
      kalimat = 'Seratus ' + terbilang(a - 100);
    }
    // 200 - 999
    else if (a < 1000) {
      var utama = a / 100;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 100;
      kalimat = bilangan[depan] + ' Ratus ' + terbilang(belakang);
    }
    // 1,000 - 1,999
    else if (a < 2000) {
      kalimat = 'Seribu ' + terbilang(a - 1000);
    }
    // 2,000 - 9,999
    else if (a < 10000) {
      var utama = a / 1000;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 1000;
      kalimat = bilangan[depan] + ' Ribu ' + terbilang(belakang);
    }
    // 10,000 - 99,999
    else if (a < 100000) {
      var utama = a / 100;
      var depan = parseInt(String(utama).substr(0, 2));
      var belakang = a % 1000;
      kalimat = terbilang(depan) + ' Ribu ' + terbilang(belakang);
    }
    // 100,000 - 999,999
    else if (a < 1000000) {
      var utama = a / 1000;
      var depan = parseInt(String(utama).substr(0, 3));
      var belakang = a % 1000;
      kalimat = terbilang(depan) + ' Ribu ' + terbilang(belakang);
    }
    // 1,000,000 - 99,999,999
    else if (a < 100000000) {
      var utama = a / 1000000;
      var depan = parseInt(String(utama).substr(0, 4));
      var belakang = a % 1000000;
      kalimat = terbilang(depan) + ' Juta ' + terbilang(belakang);
    } else if (a < 1000000000) {
      var utama = a / 1000000;
      var depan = parseInt(String(utama).substr(0, 4));
      var belakang = a % 1000000;
      kalimat = terbilang(depan) + ' Juta ' + terbilang(belakang);
    } else if (a < 10000000000) {
      var utama = a / 1000000000;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 1000000000;
      kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
    } else if (a < 100000000000) {
      var utama = a / 1000000000;
      var depan = parseInt(String(utama).substr(0, 2));
      var belakang = a % 1000000000;
      kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
    } else if (a < 1000000000000) {
      var utama = a / 1000000000;
      var depan = parseInt(String(utama).substr(0, 3));
      var belakang = a % 1000000000;
      kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
    } else if (a < 10000000000000) {
      var utama = a / 10000000000;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 10000000000;
      kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
    } else if (a < 100000000000000) {
      var utama = a / 1000000000000;
      var depan = parseInt(String(utama).substr(0, 2));
      var belakang = a % 1000000000000;
      kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
    } else if (a < 1000000000000000) {
      var utama = a / 1000000000000;
      var depan = parseInt(String(utama).substr(0, 3));
      var belakang = a % 1000000000000;
      kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
    } else if (a < 10000000000000000) {
      var utama = a / 1000000000000000;
      var depan = parseInt(String(utama).substr(0, 1));
      var belakang = a % 1000000000000000;
      kalimat = terbilang(depan) + ' Kuadriliun ' + terbilang(belakang);
    }

    var pisah = kalimat.split(' ');
    var full = [];
    for (var i = 0; i < pisah.length; i++) {
      if (pisah[i] != '') {
        full.push(pisah[i]);
      }
    }
    return full.join(' ');
  }

  useEffect(() => {
    if (totalMu) {
      const words = terbilang(totalMu);
      setOutputWordsJumlah_mu(words);
    } else {
      setOutputWordsJumlah_mu('Masukkan angka yang valid');
    }
  }, [totalMu]);

  const validate = () => {
    // console.log(gridFPACList.dataSource, 'gridFPACList');
    const qtyNull = gridFPACList.dataSource.some((item: any) => item.qty === '');
    const jumlahrpNull = gridFPACList.dataSource.some((item: any) => item.harga_mu === '');
    const noItemNull = gridFPACList.dataSource.some((item: any) => item.no_item === '');
    const isHargaPusatNull = gridFPACList.dataSource.some((item: any) => item.harga_beli_mu === '');
    const isHargaCabangNull = gridFPACList.dataSource.some((item: any) => item.harga_jual_mu === '');

    const validations = [
      { condition: !namaGudangBeli, message: 'Gudang penerimaan cabang beli belum diisi' },
      { condition: !entitasCabangJual, message: 'Kode entitas cabang jual belum diisi' },
      { condition: !namaKirimCabangJual, message: 'Area pengiriman belum diisi' },
      { condition: !noReff, message: 'No. Kontrak / Reff belum diisi' },
      { condition: !namaRelasi, message: 'Nama cabang supplier belum diisi' },
      { condition: !namaCustPusat, message: 'Nama Customer belum diisi' },
      { condition: !namaGudang, message: 'Gudang penerimaan dan pengeluaran belum diisi' },
      { condition: noItemNull, message: 'Data barang belum diisi' },
      { condition: qtyNull, message: 'Kuantitas item tidak boleh kurang/sama dengan nol' },
      { condition: jumlahrpNull, message: 'Harga tidak boleh kurang dari nol' },
      { condition: isHargaPusatNull && isApprovalPusat, message: 'Harga Pusat tidak boleh kurang dari nol' },
      { condition: isHargaCabangNull && isApprovalPusat, message: 'Harga Cabang Jual tidak boleh kurang dari nol' },
    ];

    const showError = (message: any) => {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: `<p style="font-size:12px">${message}</p>`,
        width: '100%',
        target: '#dialogFPACList',
      });
    };

    for (let { condition, message } of validations) {
      if (condition) {
        showError(message);
        return false;
      }
    }

    return saveDoc();
  };

  const cekStok = async () => {
    const kode_item = gridFPACList.dataSource[0].kode_item;

    const params = {
      entitas: entitasCabangJual,
      token,
      param1: kode_item,
      param2: moment().format('YYYY-MM-DD HH:mm:ss'),
      param3: kodeGudangJual,
      param4: '',
      param5: 'fpac',
    };

    const stok = await fetchCekStok(params);

    return stok[0].stok;
  };

  const saveDoc = async () => {
    const stok = await cekStok();
    const qty = gridFPACList.dataSource[0].qty;

    if (Number(qty) > Number(stok)) {
      swal.fire({
        text: `Kuantitas (${Number(qty)}) melebihi stok (${Number(stok).toFixed(1)})`,
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        target: '#dialogFPACList',
      });
      return false;
    }

    const modifiedDetailBarangJson: any = gridFPACList.dataSource.map((item: any) => {
      const { no_item, brt, berat, ...remainingFields } = item; // kecualikan no_item, brt, berat
      let modifiedItem = { ...remainingFields, include: kenaPajak };
      if (statusPage === 'EDIT') {
        modifiedItem = { ...modifiedItem, kode_fpac: kode_dokumen };
      }
      return modifiedItem;
    });

    const mNoFpac = await generateNU(kode_entitas, '', '82', moment().format('YYYYMM'));

    const reqBody = {
      entitas: kode_entitas,
      kode_fpac: statusPage === 'EDIT' ? kode_dokumen : '',
      no_fpac: statusPage === 'EDIT' ? noFpac : mNoFpac,
      tgl_fpac: tglFpac.format('YYYY-MM-DD HH:mm:ss'),
      kode_supp: kodeSupp,
      tgl_berlaku: tglBerlaku.format('YYYY-MM-DD HH:mm:ss'),
      tgl_kirim: tglKirim.format('YYYY-MM-DD HH:mm:ss'),
      alamat_kirim: null,
      via: via,
      fob: fob,
      kode_termin: kodeTermin,
      kode_mu: kodeMu,
      kurs: kurs,
      kurs_pajak: kursPajak,
      kena_pajak: kenaPajak,
      total_mu: totalMu,
      diskon_dok: null,
      diskon_dok_mu: '0.0000',
      total_diskon_mu: '0.0000',
      total_pajak_mu: '0.0000',
      kirim_mu: '0.0000',
      netto_mu: totalMu,
      total_rp: totalMu,
      diskon_dok_rp: '0.0000',
      total_diskon_rp: '0.0000',
      total_pajak_rp: '0.0000',
      kirim_rp: '0.0000',
      netto_rp: totalMu,
      total_berat: totalBerat,
      keterangan: keterangan,
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
      kontrak: 'Y',
      approval2: null,
      tgl_approval2: null,
      kirim_langsung_cabang: 'N',
      alamat_kirim_cabang: alamatKirimCabang,
      keterangan_pusat: keteranganPusat,
      kode_gudang_beli: kodeGudangBeli,
      nama_gudang_beli: namaGudangBeli,
      kode_gudang_jual: kodeGudangJual,
      nama_gudang_jual: namaGudangJual,
      kode_kirim_cabang_jual: kodeKirimCabangJual,
      nama_kirim_cabang_jual: namaKirimCabangJual,
      kode_cust_pusat: kodeCustPusat,
      kode_gudang_pusat: kodeGudangPusat,
      no_reff: noReff,
      kode_entitas: entitasCabangBeli,
      entitas_cabang_jual: entitasCabangJual,
      export_cabang_beli: 'N',
      export_cabang_jual: 'N',
      export_pusat: 'N',
      status_export: 'Baru',
      tgl_trxfpac: tglTrxFpac.format('YYYY-MM-DD HH:mm:ss'),
      kode_so: '',
      kode_sj: '',
      detail: modifiedDetailBarangJson,
    };
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
        await generateNU(kode_entitas, statusPage === 'EDIT' ? noFpac : mNoFpac, '82', moment().format('YYYYMM'));
        if (statusPage === 'CREATE') {
          const auditReqBody = {
            entitas: kode_entitas,
            kode_audit: null,
            dokumen: 'AC',
            kode_dokumen: responseAPI.data.kode_dokumen,
            no_dokumen: noFpac,
            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            proses: 'NEW',
            diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} nilai transaksi ${totalMu}`,
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
            swal.fire({
              timer: 10,
              showConfirmButton: false,
            });
            dialogClose();
            onRefresh();
          }, 1000);
        } else if (statusPage === 'EDIT') {
          const auditReqBody = {
            entitas: kode_entitas,
            kode_audit: null,
            dokumen: 'AC',
            kode_dokumen: responseAPI.data.kode_dokumen,
            no_dokumen: noFpac,
            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            proses: 'UPDATE',
            diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} nilai transaksi ${totalMu}`,
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
            swal.fire({
              timer: 10,
              showConfirmButton: false,
            });
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

  // APPROVAL PUSAT //
  const handleApprovalPusat = async (approvalStatus: any) => {
    const detail = editData.detail[0];
    const res = await fetchCekQty({ ent: kode_entitas, param1: detail.grp, param2: detail.kustom10, param3: moment().format('YYYY-MM-DD') }, token);
    const stok = await cekStok();
    const qty = gridFPACList.dataSource[0].qty;

    if (Number(qty) > Number(stok)) {
      swal.fire({
        text: `Kuantitas (${Number(qty)}) melebihi stok (${Number(stok).toFixed(1)})`,
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        target: '#dialogFPACList',
      });
      return;
    }

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
    // console.log(gridFPACList.dataSource);

    const isHargaPusatNull = gridFPACList.dataSource.some((item: any) => item.harga_beli_mu === null);
    const isHargaCabangNull = gridFPACList.dataSource.some((item: any) => item.harga_jual_mu === null);

    if (isHargaPusatNull && approvalStatus === 'Y') {
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

    if (isHargaCabangNull && approvalStatus === 'Y') {
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
        let modifiedItem = { ...remainingFields, include: kenaPajak };
        if (statusPage === 'EDIT') {
          modifiedItem = { ...modifiedItem, kode_fpac: kode_dokumen };
        }
        return modifiedItem;
      });

      const reqBody = {
        entitas: kode_entitas,
        kode_fpac: statusPage === 'EDIT' ? kode_dokumen : '',
        no_fpac: noFpac,
        tgl_fpac: tglFpac.format('YYYY-MM-DD HH:mm:ss'),
        kode_supp: kodeSupp,
        tgl_berlaku: tglBerlaku.format('YYYY-MM-DD HH:mm:ss'),
        tgl_kirim: tglKirim.format('YYYY-MM-DD HH:mm:ss'),
        alamat_kirim: null,
        via: via,
        fob: fob,
        kode_termin: kodeTermin,
        kode_mu: kodeMu,
        kurs: kurs,
        kurs_pajak: kursPajak,
        kena_pajak: kenaPajak,
        total_mu: totalMu,
        diskon_dok: null,
        diskon_dok_mu: '0.0000',
        total_diskon_mu: '0.0000',
        total_pajak_mu: '0.0000',
        kirim_mu: '0.0000',
        netto_mu: totalMu,
        total_rp: totalMu,
        diskon_dok_rp: '0.0000',
        total_diskon_rp: '0.0000',
        total_pajak_rp: '0.0000',
        kirim_rp: '0.0000',
        netto_rp: totalMu,
        total_berat: berat,
        keterangan: keterangan,
        status: 'Tertutup',
        userid: userid,
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        approval: approvalStatus,
        tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
        kirim_langsung: 'Y',
        status_kirim: 'N',
        no_sjpabrik: null,
        tgl_sjpabrik: null,
        tgl_sjfax: null,
        nota: '',
        kontrak: 'Y',
        approval2: editData.approval2,
        tgl_approval2: null,
        kirim_langsung_cabang: 'N',
        alamat_kirim_cabang: alamatKirimCabang,
        keterangan_pusat: keteranganPusat,
        kode_gudang_beli: kodeGudangBeli,
        nama_gudang_beli: namaGudangBeli,
        kode_gudang_jual: kodeGudangJual,
        nama_gudang_jual: namaGudangJual,
        kode_kirim_cabang_jual: kodeKirimCabangJual,
        nama_kirim_cabang_jual: namaKirimCabangJual,
        kode_cust_pusat: kodeCustPusat,
        kode_gudang_pusat: kodeGudangPusat,
        no_reff: noReff,
        kode_entitas: entitasCabangBeli,
        entitas_cabang_jual: entitasCabangJual,
        export_cabang_beli: 'N',
        export_cabang_jual: 'N',
        export_pusat: 'N',
        status_export: 'Baru',
        tgl_trxfpac: tglTrxFpac.format('YYYY-MM-DD HH:mm:ss'),
        kode_so: '',
        kode_sj: '',
        detail: modifiedDetailBarangJson,
      };

      let response;
      if (approvalStatus === 'Y') {
        console.log('tung tung tung sahur!!');
        const res = await handleSave();

        if (res) {
          const modifiedBody = {
            ...reqBody,
            export_cabang_beli: 'Y',
            export_cabang_jual: 'Y',
            export_pusat: 'Y',
            status_export: 'Berhasil',
            approval: 'Y',
            status: 'Tertutup',
          };

          response = await axios.patch(`${apiUrl}/erp/update_fpac`, modifiedBody, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else if (approvalStatus === 'C') {
        const modifiedBody = {
          ...reqBody,
          export_cabang_beli: 'N',
          export_cabang_jual: 'N',
          export_pusat: 'N',
          status_export: 'Baru',
          approval: 'C',
          status: 'Terbuka',
        };

        response = await axios.patch(`${apiUrl}/erp/update_fpac`, modifiedBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const modifiedBody = {
          ...reqBody,
          export_cabang_beli: 'N',
          export_cabang_jual: 'N',
          export_pusat: 'N',
          status_export: 'Baru',
          approval: 'N',
          status: 'Terbuka',
        };

        response = await axios.patch(`${apiUrl}/erp/update_fpac`, modifiedBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response) {
        if (approvalStatus === 'Y') {
          const auditReqBody = {
            entitas: kode_entitas,
            kode_audit: null,
            dokumen: 'AC',
            kode_dokumen: response!.data.data.kode_fpac,
            no_dokumen: noFpac,
            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
            proses: 'NEW',
            diskripsi: `FPAC Item = ${modifiedDetailBarangJson.length} total_berat = ${parseFloat(editData.total_berat)} nilai transaksi ${totalMu}`,
            userid: userid,
            system_user: '', //username login
            system_ip: '', //ip address
            system_mac: '', //mac address
          };

          await axios.post(`${apiUrl}/erp/simpan_audit`, auditReqBody);
        }

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
      setTimeout(() => {
        dialogClose();
        onRefresh();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // APPROVAL CABANG //
  const handleApproval = async (approvalStatus: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}/erp/approval_cabang_fpac`,
        {
          entitas: kode_entitas,
          approval2: approvalStatus,
          kode_fpac: kode_dokumen,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === true) {
        withReactContent(swalToast).fire({
          icon: 'success',
          title: `<p style="font-size:12px">Status Approval Cabang Berhasil Diubah</p>`,
          width: '100%',
          target: '#dialogFPACList',
        });
        setTimeout(() => {
          dialogClose();
          onRefresh();
        }, 1500);
      } else {
        throw new Error('Error in approval process');
      }
    } catch (error) {
      withReactContent(swalToast).fire({
        icon: 'error',
        title: `<p style="font-size:12px">Error Status Approval Cabang</p>`,
        width: '100%',
        target: '#dialogFPACList',
      });
    }
  };

  return (
    <DialogComponent
      id="dialogFPACList"
      isModal={true}
      width="95%"
      height="90%"
      visible={isOpen}
      close={() => {
        dialogClose();
      }}
      header={
        statusPage === 'EDIT' && !isApprovalCabang && !isApprovalPusat
          ? 'FORM FPAC KONTRAK (EDIT)'
          : statusPage === 'EDIT' && isApprovalCabang === true
          ? 'FORM FPAC KONTRAK (APPROVAL CABANG)'
          : statusPage === 'EDIT' && isApprovalPusat === true
          ? 'FORM FPAC KONTRAK (APPROVAL PUSAT)'
          : 'FORM FPAC KONTRAK'
      }
      showCloseIcon={true}
      target="#main-target"
      closeOnEscape={false}
      allowDragging={true}
      position={{ X: 'center', Y: 40 }}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
    >
      <div style={{ minWidth: '70%', overflow: 'auto' }}>
        <div>
          <div>
            {/* ===============  Master Header Data ========================   */}
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
                        Tanggal Dokumen
                      </th>
                      <th style={{}} className="!border-r-4 !border-white">
                        Tanggal Efektif
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
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={entitasCabangBeli} readOnly></input>
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
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaGudangBeli} readOnly></input>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="ml-1"
                              onClick={() => {
                                if (entitasCabangBeli) {
                                  setGudangType('pembeli');
                                  setModalDaftarGudang(true);
                                } else {
                                  withReactContent(swalToast).fire({
                                    icon: 'error',
                                    title: '<p style="font-size:12px">Entitas cabang pembeli harus diisi</p>',
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
                      {/* COLOUMN KE 2 */}
                      <td>
                        {/* TANGGAL DOKUMEN */}
                        <DatePickerComponent
                          locale="id"
                          cssClass="e-custom-style"
                          placeholder="Tgl. PP"
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={tglFpac.toDate()}
                          change={(args: ChangeEventArgsCalendar) => {
                            if (args.value) {
                              const selectedDate = moment(args.value);
                              const hour = tglFpac.hour() || moment().hour();
                              const minute = tglFpac.minute() || moment().minute();
                              const second = tglFpac.second() || moment().second();

                              selectedDate.set({
                                hour: hour,
                                minute: minute,
                                second: second,
                              });
                              setTglFpac(selectedDate);
                            } else {
                              setTglFpac(moment());
                            }
                          }}
                        >
                          <Inject services={[MaskedDateTime]} />
                        </DatePickerComponent>
                      </td>
                      <td>
                        {/* TANGGAL EFEKTIF */}
                        <DatePickerComponent
                          locale="id"
                          cssClass="e-custom-style"
                          enableMask={true}
                          maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={tglTrxFpac.toDate()}
                          disabled={true}
                        >
                          <Inject services={[MaskedDateTime]} />
                        </DatePickerComponent>
                      </td>
                      {/* COLOUMN KE 3 */}
                      <td>
                        {/* MNOFPC */}
                        <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={noFpac} readOnly></input>
                      </td>
                      <td>
                        {/* TERMIN */}
                        <div className="flex" style={{ alignItems: 'center' }}>
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaTermin} readOnly></input>
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
                          value={alamatKirimCabang}
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
                        Gudang Pengeluaran
                      </th>

                      <th style={{}} className="!border-r-4 !border-white">
                        Tanggal Berlaku PO
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
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={entitasCabangJual} readOnly></input>
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
                        {/* GUDANG PENGELUARAN */}
                        <div className="flex" style={{ alignItems: 'center' }}>
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaGudangJual} readOnly></input>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="ml-1"
                              onClick={() => {
                                if (entitasCabangJual) {
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
                        {/* TANGGAL BERLAKU PO */}
                        <DatePickerComponent
                          locale="id"
                          cssClass="e-custom-style"
                          placeholder="Tgl. PP"
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={tglBerlaku.toDate()}
                          change={(args: ChangeEventArgsCalendar) => {
                            if (args.value) {
                              const selectedDate = moment(args.value);
                              const hour = tglBerlaku.hour() || moment().hour();
                              const minute = tglBerlaku.minute() || moment().minute();
                              const second = tglBerlaku.second() || moment().second();

                              selectedDate.set({
                                hour: hour,
                                minute: minute,
                                second: second,
                              });
                              setTglBerlaku(selectedDate);
                            } else {
                              setTglBerlaku(moment());
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
                            HandleCaraPengiriman(value, setFob);
                          }}
                          value={fob}
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
                            HandlePajak(value, setKenaPajak);
                          }}
                          value={kenaPajak}
                        />
                      </td>
                      <td>
                        <TextBoxComponent placeholder="" readonly={true} />
                      </td>
                    </tr>
                    {/* BARIS KE TIGA */}
                    <tr className={styles.table}>
                      <th colSpan={2} className="!border-r-4 !border-white">
                        Area Pengiriman
                      </th>
                      <th style={{}} className="!border-r-4 !border-white">
                        Tanggal Estimasi Kirim
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
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaKirimCabangJual} readOnly></input>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="ml-1"
                              onClick={() => {
                                if (entitasCabangJual) {
                                  setModalDaftarAreaPengiriman(true);
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
                        {/* TANGGAL ESTIMASI KIRIM */}
                        <DatePickerComponent
                          locale="id"
                          cssClass="e-custom-style"
                          placeholder="Tgl. PP"
                          showClearButton={false}
                          format="dd-MM-yyyy"
                          value={tglKirim.toDate()}
                          change={(args: ChangeEventArgsCalendar) => {
                            if (args.value) {
                              const selectedDate = moment(args.value);
                              const hour = tglKirim.hour() || moment().hour();
                              const minute = tglKirim.minute() || moment().minute();
                              const second = tglKirim.second() || moment().second();

                              selectedDate.set({
                                hour: hour,
                                minute: minute,
                                second: second,
                              });
                              setTglKirim(selectedDate);
                            } else {
                              setTglKirim(moment());
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
                            HandlePemesananVia(value, setVia);
                          }}
                          value={via}
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
                      <th colSpan={2} className="!border-r-4 !border-white">
                        No Kontrak / Reff
                      </th>
                      <th colSpan={2} className="!border-l-1 !border-white">
                        Nama Cabang Supplier
                      </th>
                      <th colSpan={2}>Nama Customer</th>
                    </tr>
                    <tr>
                      {/* NO KONTRAK / REFF */}
                      <td style={{ textAlign: 'center' }} colSpan={2}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={noReff} readOnly></input>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="ml-1"
                              onClick={() => {
                                if (kodeGudangJual && namaGudangJual) {
                                  setModalDaftarNoReff(true);
                                }
                                if (!kodeGudangJual || !namaGudangJual) {
                                  withReactContent(swalToast).fire({
                                    icon: 'error',
                                    title: '<p style="font-size:12px">Gudang pengeluaran cabang penjualan harus diisi</p>',
                                    width: '100%',
                                    target: '#dialogFPACList',
                                  });
                                }
                                // if (someItemNull) {
                                //   withReactContent(swalToast).fire({
                                //     icon: 'error',
                                //     title: '<p style="font-size:12px">Data Barang belum diisi</p>',
                                //     width: '100%',
                                //     target: '#dialogFPACList',
                                //   });
                                // }
                              }}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }} colSpan={2}>
                        {/* CABANG SUPPLIER */}
                        <div className="flex" style={{ alignItems: 'center' }}>
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaRelasi} readOnly></input>
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
                          <input className={`container form-input`} style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }} disabled={true} value={namaCustPusat} readOnly></input>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="ml-1"
                              onClick={() => {
                                setModalDaftarCustomer(true);
                              }}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* BARIS KE EMPAT */}
                    <tr className={styles.table}>
                      <th colSpan={2} className="!bg-white"></th>
                      <th colSpan={2} className="!border-l-1 border-white">
                        Gudang Penerimaan dan Pengeluaran
                      </th>
                    </tr>
                    <tr>
                      <td className="mr-2" style={{ textAlign: 'center' }} colSpan={2}>
                        {' '}
                      </td>
                      <td style={{ textAlign: 'center' }} colSpan={2}>
                        {/* GUDANG PENERIMAAN DAN PENGELUARAN */}
                        {statusPage !== 'EDIT' || namaGudang ? (
                          <DropDownListComponent
                            id="dropdown"
                            dataSource={daftarGudang.map((gudang: any) => gudang.nama_gudang)}
                            value={namaGudang}
                            placeholder="Pilih Gudang"
                            change={handleGudangPenerimaandanPengeluaranChange}
                            open={() => setGudangType('')}
                          />
                        ) : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* ===============  Detail Data ========================   */}
            <div className="panel-tab" style={{ background: '#f0f0f0', width: '100%', marginTop: 10, borderRadius: 10 }}>
              <TabComponent ref={(t) => (tabFPACList = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                <div className="e-tab-header" style={{ display: 'flex' }}>
                  <div tabIndex={0} style={{ marginTop: 1, fontSize: '12px', fontWeight: 'bold', padding: '0px 10px', cursor: 'pointer', borderBottom: '1px solid transparent' }}>
                    Data Barang
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
                        rowSelecting={rowSelectingDetailBarang}
                        actionComplete={actionCompleteDetailBarang}
                        created={statusPage === 'CREATE' ? addDefaultRowIfEmpty : undefined}
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
                            editTemplate={editTemplateMasterItem_No}
                          />
                          <ColumnDirective
                            field="diskripsi"
                            headerText="Nama Barang"
                            headerTextAlign="Center"
                            textAlign="Left"
                            width="230"
                            clipMode="EllipsisWithTooltip"
                            editTemplate={editTemplateMasterItem_Nama}
                          />
                          <ColumnDirective field="satuan" headerText="Satuan" allowEditing={false} headerTextAlign="Center" textAlign="Left" width="160" clipMode="EllipsisWithTooltip" />
                          <ColumnDirective
                            field="qty"
                            headerText="Kuantitas"
                            headerTextAlign="Center"
                            textAlign="Right"
                            width="160"
                            clipMode="EllipsisWithTooltip"
                            format="N"
                            editType="numericedit"
                            edit={{
                              params: {
                                format: 'N',
                                decimals: 0,
                                showSpinButton: false,
                              },
                            }}
                            template={(props: any) => {
                              return <span>{props.qty ? props.qty.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                            }}
                          />
                          <ColumnDirective
                            field="harga_mu"
                            headerText="Harga Cabang Pembeli"
                            headerTextAlign="Center"
                            textAlign="Right"
                            width="160"
                            clipMode="EllipsisWithTooltip"
                            format="N2"
                            editType="numericedit"
                            edit={{
                              params: {
                                format: 'N2',
                                decimals: 2,
                                showSpinButton: false,
                              },
                            }}
                            template={(props: any) => {
                              return <span>{props.harga_mu ? props.harga_mu.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                            }}
                          />
                          {isApprovalPusat && (
                            <ColumnDirective
                              field="harga_beli_mu"
                              headerText="Harga Pembelian Pusat"
                              headerTextAlign="Center"
                              textAlign="Left"
                              width="160"
                              clipMode="EllipsisWithTooltip"
                              format="N2"
                              editType="numericedit"
                              edit={{
                                params: {
                                  format: 'N2',
                                  decimals: 2,
                                  showSpinButton: false,
                                },
                              }}
                              template={(props: any) => {
                                return <span>{props.harga_beli_mu ? props.harga_beli_mu.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                              }}
                            />
                          )}
                          {isApprovalPusat && (
                            <ColumnDirective
                              field="harga_jual_mu"
                              headerText="Harga Cabang Penjual"
                              headerTextAlign="Center"
                              textAlign="Right"
                              width="160"
                              clipMode="EllipsisWithTooltip"
                              format="N2"
                              editType="numericedit"
                              edit={{
                                params: {
                                  format: 'N2',
                                  decimals: 2,
                                  showSpinButton: false,
                                },
                              }}
                              template={(props: any) => {
                                return <span>{props.harga_jual_mu ? props.harga_jual_mu.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                              }}
                            />
                          )}
                          <ColumnDirective
                            field="jumlah_mu"
                            allowEditing={false}
                            headerText="Jumlah"
                            headerTextAlign="Center"
                            textAlign="Right"
                            width="160"
                            clipMode="EllipsisWithTooltip"
                            format="N2"
                            editType="numericedit"
                            edit={{
                              params: {
                                format: 'N2',
                                decimals: 2,
                                showSpinButton: false,
                              },
                            }}
                            template={(props: any) => {
                              return <span>{props.jumlah_mu ? props.jumlah_mu.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                            }}
                          />
                          <ColumnDirective
                            field="berat"
                            allowEditing={false}
                            headerText="Berat(KG)"
                            headerTextAlign="Center"
                            textAlign="Right"
                            width="160"
                            clipMode="EllipsisWithTooltip"
                            template={(props: any) => {
                              return <span>{berat ? frmNumber(berat) : parseFloat(props.berat).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
                            }}
                          />
                        </ColumnsDirective>

                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                      </GridComponent>
                    </TooltipComponent>

                    <div className="flex" style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px' }}>
                        <b>Total Berat:</b> <b>{totalBerat ? frmNumber(totalBerat) : frmNumber(berat)} Kg</b>
                      </div>

                      <div style={{ fontSize: '11px', textAlign: 'right' }}>
                        <b>Sub total:</b> <b>{frmNumber(totalMu)}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </TabComponent>
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <div className="my-1">
                  <p className="set-font-11">
                    <b>Catatan PO Cabang :</b>
                  </p>
                  <div className="" style={{ width: '100%' }}>
                    <textarea
                      className="container"
                      style={{
                        fontSize: 11,
                        borderColor: '#bfc9d4',
                        borderRadius: 1,
                        resize: 'none',
                        height: '85px',
                        width: '450px',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        marginTop: '5px',
                      }}
                      value={keterangan}
                      onChange={handleTextAreaCatatanPOCabangChange}
                      spellCheck="false"
                    />
                  </div>
                  <b style={{ color: 'green' }}>{outputWordsJumlah_mu}</b>
                </div>
                <div className="my-1">
                  <p className="set-font-11">
                    <b>Catatan PO Pusat :</b>
                  </p>
                  <div className="" style={{ width: '100%' }}>
                    <textarea
                      className="container"
                      style={{
                        fontSize: 11,
                        borderColor: '#bfc9d4',
                        borderRadius: 1,
                        resize: 'none',
                        height: '85px',
                        width: '450px',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        marginTop: '5px',
                      }}
                      value={keteranganPusat}
                      onChange={handleTextAreaCatatanPOPusatChange}
                      spellCheck="false"
                    />
                  </div>
                </div>
                <div style={{ width: '20%', textAlign: 'right', marginTop: '50px', marginRight: '10px' }}>
                  <div className="mt-1 flex" style={{ justifyContent: 'space-between' }}>
                    <div style={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>
                      <b>DPP</b>
                    </div>
                    <div style={{ width: '50%', textAlign: 'right', fontWeight: 'bold' }}>
                      <b>
                        {' '}
                        <b>{kenaPajak == 'I' || kenaPajak == 'E' ? frmNumber(totalMu) : null}</b>
                      </b>
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
                      <b>{frmNumber(totalMu)}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* =================  Tombol action dokumen ==================== */}
        <div
          style={{
            backgroundColor: '#F2FDF8',
            // position: 'absolute',
            // bottom: 5,
            // right: 0,
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
          {!isApprovalCabang && !isApprovalPusat && (
            <div>
              <ButtonComponent
                id="buBatalDokumen1"
                content="Batal"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-close"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => dialogClose()}
              />
              {selectedItem?.status === 'Tertutup' ? null : (
                <ButtonComponent
                  id="buSimpanDokumen1"
                  content="Simpan"
                  cssClass="e-primary e-small"
                  iconCss="e-icons e-small e-save"
                  style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                  onClick={() => validate()}
                />
              )}
            </div>
          )}
          {isApprovalCabang && (
            <div>
              <ButtonComponent
                id="buBatalDokumen1"
                content="Batal"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-close"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => dialogClose()}
              />

              <ButtonComponent
                id="buDisetujui"
                content="Disetujui"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-check-box"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => {
                  handleApproval('Y');
                }}
              />
              <ButtonComponent
                id="buKoreksi"
                content="Koreksi"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-annotation-edit"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => {
                  handleApproval('C');
                }}
              />
              <ButtonComponent
                id="buDitolak"
                content="Ditolak"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-export-xls"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => {
                  handleApproval('N');
                }}
              />
            </div>
          )}
          {isApprovalPusat && (
            <div>
              <ButtonComponent
                id="buBatalDokumen1"
                content="Batal"
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-close"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                onClick={() => dialogClose()}
              />

              <ButtonComponent
                id="buDisetujui"
                content={isLoading ? 'Loading...' : 'Disetujui'}
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-check-box"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                disabled={isLoading}
                onClick={() => {
                  handleApprovalPusat('Y');
                }}
              />
              <ButtonComponent
                id="buKoreksi"
                content={isLoading ? 'Loading...' : 'Koreksi'}
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-annotation-edit"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                disabled={isLoading}
                onClick={() => handleApprovalPusat('C')}
              />
              <ButtonComponent
                id="buDitolak"
                content={isLoading ? 'Loading...' : 'Ditolak'}
                cssClass="e-primary e-small"
                iconCss="e-icons e-small e-export-xls"
                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: isLoading ? '#A2A5B6' : '#3b3f5c', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                disabled={isLoading}
                onClick={() => handleApprovalPusat('N')}
              />
            </div>
          )}
        </div>

        {/* MODAL DAFTAR BARANG */}
        <DialogComponent
          ref={(d) => (gridDaftarBarang = d)}
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Barang'}
          visible={modalDaftarBarang}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="420"
          position={{ X: 'center', Y: 'center' }}
          closeOnEscape={true}
          close={() => {
            setModalDaftarBarang(false);
            setSearchNoItem('');
            setSearchNamaItem('');
          }}
        >
          <div className="flex">
            <div className="form-input mb-1 mr-1" style={{ width: '45%' }}>
              <TextBoxComponent
                id="searchNoItem1"
                name="searchNoItem1"
                className="searchNoItem1"
                placeholder="<No. Barang>"
                showClearButton={true}
                value={searchNoItem}
                input={(args: FocusInEventArgs) => {
                  (document.getElementsByName('searchNamaItem1')[0] as HTMLFormElement).value = '';
                  setSearchNamaItem('');
                  const value: any = args.value;
                  setSearchNoItem(value);
                }}
              />
            </div>
            <div className="form-input mb-1 mr-1">
              <TextBoxComponent
                id="searchNamaItem1"
                name="searchNamaItem1"
                className="searchNamaItem1"
                placeholder="<Nama Barang>"
                showClearButton={true}
                value={searchNamaItem}
                input={(args: FocusInEventArgs) => {
                  (document.getElementsByName('searchNoItem1')[0] as HTMLFormElement).value = '';
                  setSearchNoItem('');
                  const value: any = args.value;
                  setSearchNamaItem(value);
                }}
              />
            </div>
          </div>
          <GridComponent
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={listDaftarBarang}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'325'}
            rowSelecting={(args: any) => {
              setSelectedBarang(args.data);
            }}
            recordDoubleClick={(args: any) => {
              getFromModalBarang();
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>
          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => setModalDaftarBarang(false)}
            />
            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => getFromModalBarang()}
            />
          </div>
        </DialogComponent>
        {/* END MODAL DAFTAR BARANG */}

        {/* MODAL LIST ENTITAS */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Entitas'}
          visible={modalDaftarEntitas}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="290"
          close={() => {
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
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TextBoxComponent
              id="cariKodeCabang"
              className="searchtext"
              placeholder="Cari Kode Cabang"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value = args.value;
                setSearchKodeCabang(value);
                filterEntitas(value, searchCabang, listDaftarEntitas);
              }}
              floatLabelType="Never"
            />
            <TextBoxComponent
              id="cariCabang"
              className="searchtext"
              placeholder="Cari Cabang"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value = args.value;
                setSearchCabang(value);
                filterEntitas(searchKodeCabang, value, listDaftarEntitas);
              }}
              floatLabelType="Never"
            />
          </div>
          <GridComponent
            id="dialogEntitas"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={filteredDataEntitas.length > 0 ? filteredDataEntitas : listDaftarEntitas}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'255'}
            rowSelecting={(args) => {
              setSelectedEntitas(args.data);
            }}
            recordDoubleClick={(args) => {
              handlePilihEntitas();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="Kode" headerText="Kode Cabang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="Cabang" headerText="Cabang" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>
          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarEntitas(false);
              }}
            />

            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihEntitas();
              }}
            />
          </div>
        </DialogComponent>
        {/* END MODAL LIST ENTITAS */}

        {/* MODAL LIST GUDANG */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Gudang'}
          visible={modalDaftarGudang}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="250"
          close={() => {
            setModalDaftarGudang(false);
            setSearchNamaGudang('');
            const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
            if (cariNoAkun) {
              cariNoAkun.value = '';
            }
          }}
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'inline-block' }}>
            <TextBoxComponent
              id="cariNoAkun"
              className="searchtext"
              placeholder="Cari Nama Gudang"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value: any = args.value;
                PencarianNamaGudang(value, setSearchNamaGudang, setFilteredDataGudang, daftarGdEntitas);
              }}
              floatLabelType="Never"
            />
          </div>

          <GridComponent
            id="dialogGudang"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={searchNamaGudang !== '' ? filteredDataGudang : daftarGdEntitas}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'285'}
            rowSelecting={(args: any) => {
              setSelectedGudang(args.data);
            }}
            recordDoubleClick={(args: any) => {
              handlePilihGudang();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_gudang" headerText="Nama Gudang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>

          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarGudang(false);
              }}
            />

            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihGudang();
              }}
            />
          </div>
        </DialogComponent>
        {/* END MODAL LIST GUDANG */}

        {/* MODAL LIST AREA PENGIRIMAN */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Area Pengiriman'}
          visible={modalDaftarAreaPengiriman}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="250"
          close={() => {
            setModalDaftarAreaPengiriman(false);
            setSearchnamaKirimCabangJual('');
            const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
            if (cariNoAkun) {
              cariNoAkun.value = '';
            }
          }}
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'inline-block' }}>
            <TextBoxComponent
              id="cariNoAkun"
              className="searchtext"
              placeholder="Cari Nama Area Pengiriman"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value: any = args.value;
                PencariannamaKirimCabangJual(value, setSearchnamaKirimCabangJual, setFilteredDataAreaPengiriman, listDaftarAreaPengiriman);
              }}
              floatLabelType="Never"
            />
          </div>

          <GridComponent
            id="dialogAreaPengiriman"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={searchnamaKirimCabangJual !== '' ? filteredDataAreaPengiriman : listDaftarAreaPengiriman}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'285'}
            rowSelecting={(args: any) => {
              setSelectedAreaPengiriman(args.data);
            }}
            recordDoubleClick={(args: any) => {
              handlePilihAreaPengiriman();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_kirim" headerText="Nama Area Pengiriman" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>

          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarAreaPengiriman(false);
              }}
            />

            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihAreaPengiriman();
              }}
            />
          </div>
        </DialogComponent>
        {/* // END MODAL LIST AREA PENGIRIMAN */}

        {/* MODAL LIST NO REFF */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Stok Gudang per Kontrak'}
          visible={modalDaftarNoReff}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="850"
          close={() => {
            setModalDaftarNoReff(false);
          }}
          closeOnEscape={true}
        >
          <GridComponent
            id="dialogNoReff"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={listDaftarNoReff}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'255'}
            rowSelecting={(args: any) => {
              setSelectedNoReff(args.data);
            }}
            recordDoubleClick={(args: any) => {
              handlePilihNoReff();
              // console.log(args, 'args double click');
            }}
            allowResizing
            gridLines="Both"
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_gudang" headerText="Gudang" headerTextAlign="Center" textAlign="Left" width="85" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="no_kontrak" headerText="No. Kontrak" headerTextAlign="Center" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" width="65" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="stok" format="N" headerText="Jumlah Stok" headerTextAlign="Center" textAlign="Right" width="65" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection, Resize]} />
          </GridComponent>

          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarNoReff(false);
              }}
            />
            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihNoReff();
              }}
            />
          </div>
        </DialogComponent>
        {/* END MODAL LIST NO REFF */}

        {/* MODAL LIST SUPPLIER */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Supplier'}
          visible={modalDaftarSupplier}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="350"
          close={() => {
            setModalDaftarSupplier(false);
            setSearchNoSupp('');
            setSearchNamaRelasi('');
            setFilteredDataSupplier(listDaftarSupplier);
          }}
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TextBoxComponent
              id="cariNoSupp"
              className="searchtext"
              placeholder="Cari No Supplier"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value = args.value;
                PencarianSupplier(value, setSearchNoSupp, setFilteredDataSupplier, listDaftarSupplier, 'no_supp');
              }}
              floatLabelType="Never"
            />
            <TextBoxComponent
              id="cariNamaRelasi"
              className="searchtext"
              placeholder="Cari Nama Relasi"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value = args.value;
                PencarianSupplier(value, setSearchNamaRelasi, setFilteredDataSupplier, listDaftarSupplier, 'nama_relasi');
              }}
              floatLabelType="Never"
            />
          </div>

          <GridComponent
            id="dialogSupplier"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={searchNoSupp !== '' || searchNamaRelasi !== '' ? filteredDataSupplier : listDaftarSupplier}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'325'}
            rowSelecting={(args) => {
              setSelectedSupplier(args.data);
            }}
            recordDoubleClick={(args) => {
              handlePilihSupplier();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="no_supp" headerText="No Supplier" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="kode_mu" headerText="Kode MU" headerTextAlign="Center" textAlign="Left" width="75" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_relasi" headerText="Nama Relasi" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>

          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarSupplier(false);
              }}
            />

            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihSupplier();
              }}
            />
          </div>
        </DialogComponent>
        {/* END MODAL LIST SUPPLIER */}

        {/* MODAL LIST CUSTOMER */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Customer Pusat'}
          visible={modalDaftarCustomer}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="1000"
          close={() => {
            setModalDaftarCustomer(false);
            setParamCust({ no_cust: '', nama_relasi: '', nama_sales: '' });
            setFilteredDataCustomer(listDaftarCustomer);
          }}
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TextBoxComponent
              id="cariNoCust"
              className="searchtext"
              placeholder="Cari No Customer"
              showClearButton={true}
              // input={(args: ChangeEventArgsInput) => {
              //   const value = args.value;
              //   PencarianCustomer(value, setSearchNoCust, setFilteredDataCustomer, listDaftarCustomer, 'no_cust');
              // }}
              value={paramCust.no_cust}
              onChange={(e: any) => setParamCust({ ...paramCust, no_cust: e.target.value })}
              floatLabelType="Never"
            />
            <TextBoxComponent
              id="carinamaCustPusat"
              className="searchtext"
              placeholder="Cari Nama Relasi"
              showClearButton={true}
              // input={(args: ChangeEventArgsInput) => {
              //   const value = args.value;
              //   PencarianCustomer(value, setSearchnamaCustPusat, setFilteredDataCustomer, listDaftarCustomer, 'nama_relasi');
              // }}
              value={paramCust.nama_relasi}
              onChange={(e: any) => setParamCust({ ...paramCust, nama_relasi: e.target.value })}
              floatLabelType="Never"
            />
            <TextBoxComponent
              id="cariNamaSalesman"
              className="searchtext"
              placeholder="Cari Nama Salesman"
              showClearButton={true}
              // input={(args: ChangeEventArgsInput) => {
              //   const value = args.value;
              //   PencarianCustomer(value, setSearchNamaSalesman, setFilteredDataCustomer, listDaftarCustomer, 'nama_salesman');
              // }}
              value={paramCust.nama_sales}
              onChange={(e: any) => setParamCust({ ...paramCust, nama_sales: e.target.value })}
              floatLabelType="Never"
            />
          </div>

          <GridComponent
            id="dialogCustomer"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={listDaftarCustomer}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'340'}
            rowSelecting={(args) => {
              if (args.data.status_warna === 'Aktif' || args.data.status_warna === 'NOO') {
                setSelectedCustomer(args.data);
              } else {
                args.cancel = true;
                withReactContent(swalToast).fire({
                  icon: 'warning',
                  title: `<p style="font-size:12px">Customer : [${args.data.no_cust}] ${args.data.nama_relasi}</p>
                                            Belum diaktifkan atau bermasalah dengan pembayaran,
                                            untuk sementara tidak dapat melakukan proses transaksi penjualan,
                                            Silahkan menghubungi Kredit Manajemen atau Administrator untuk konfirmasi.`,
                  width: '100%',
                  target: '#dialogFPACList',
                });
              }
            }}
            rowDataBound={(args) => {
              const statusWarna = args.data.status_warna;
              const row = args.row as HTMLElement;

              if (statusWarna === 'Aktif') {
                row.style.backgroundColor = 'white';
                row.style.color = 'black';
              } else if (statusWarna === 'Non Aktif') {
                row.style.backgroundColor = '#d3d3d3'; // Pale gray
                row.style.color = 'black';
              } else if (statusWarna === 'BlackList-G') {
                row.style.backgroundColor = 'red';
                row.style.color = 'yellow';
              } else if (statusWarna === 'New Open Outlet') {
                row.style.backgroundColor = '#98FB98'; // Pale green
                row.style.color = 'black';
              } else if (statusWarna === 'Batal NOO') {
                row.style.backgroundColor = '#FFC0CB'; // Pale pink
                row.style.color = 'black';
              } else if (statusWarna === 'Tidak Digarap') {
                row.style.backgroundColor = '#FFA07A'; // Pale orange
                row.style.color = 'black';
              }

              // Ensure that all text in the row has the correct color
              const cells = row.querySelectorAll('.e-rowcell');
              cells.forEach((cell) => {
                (cell as HTMLElement).style.color = row.style.color;
              });
            }}
            recordDoubleClick={(args) => {
              handlePilihCustomer();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="no_cust" headerText="No Customer" headerTextAlign="Center" textAlign="Center" width="45" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_relasi" headerText="Nama Relasi" headerTextAlign="Center" textAlign="Left" width="120" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="alamat_kirim1" headerText="Alamat Kirim" headerTextAlign="Center" textAlign="Left" width="200" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="nama_salesman" headerText="Nama Salesman" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
              <ColumnDirective field="status_warna" headerText="Status" headerTextAlign="Center" textAlign="Left" width="40" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: 'white', border: '1px solid black' }}></div>
                <span>Aktif</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: '#d3d3d3', border: '1px solid black' }}></div>
                <span>Non Aktif</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: 'red', border: '1px solid black' }}></div>
                <span>Blacklist-G</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: '#98FB98', border: '1px solid black' }}></div>
                <span>New Open Outlet</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC0CB', border: '1px solid black' }}></div>
                <span>Batal NOO</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: '#FFA07A', border: '1px solid black' }}></div>
                <span>Tidak Digarap</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '5px' }}>
              <ButtonComponent
                id="buSimpanDokumen1"
                content="Pilih"
                cssClass="e-primary e-small"
                style={{ float: 'right', width: '70px', backgroundColor: '#3b3f5c' }}
                onClick={() => {
                  handlePilihCustomer();
                }}
              />
              <ButtonComponent
                id="buBatalDokumen1"
                content="Batal"
                cssClass="e-primary e-small"
                style={{ float: 'right', width: '70px', backgroundColor: '#3b3f5c' }}
                onClick={() => {
                  setModalDaftarCustomer(false);
                }}
              />
            </div>
          </div>
        </DialogComponent>
        {/* END MODAL LIST CUSTOMER */}

        {/* MODAL LIST TERMIN */}
        <DialogComponent
          target="#dialogFPACList"
          style={{ position: 'fixed' }}
          header={'Daftar Termin'}
          visible={modalDaftarTermin}
          isModal={true}
          animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
          allowDragging={true}
          showCloseIcon={true}
          width="250"
          close={() => {
            setModalDaftarTermin(false);
            setSearchNoTermin('');
            const cariNoAkun = document.getElementById('cariNoAkun') as HTMLInputElement;
            if (cariNoAkun) {
              cariNoAkun.value = '';
            }
          }}
          closeOnEscape={true}
        >
          <div className="form-input mb-1 mr-1" style={{ display: 'inline-block' }}>
            <TextBoxComponent
              id="cariNoAkun"
              className="searchtext"
              placeholder="Cari Nomor akun Jurnal"
              showClearButton={true}
              input={(args: ChangeEventArgsInput) => {
                const value: any = args.value;
                PencarianNoTermin(value, setSearchNoTermin, setFilteredDataTermin, listDaftarTermin);
              }}
              floatLabelType="Never"
            />
          </div>

          <GridComponent
            id="dialogTermin"
            locale="id"
            style={{ width: '100%', height: '100%' }}
            dataSource={searchNoTermin !== '' ? filteredDataTermin : listDaftarTermin}
            selectionSettings={{ mode: 'Row', type: 'Single' }}
            rowHeight={22}
            height={'225'}
            rowSelecting={(args: any) => {
              setSelectedTermin(args.data);
            }}
            recordDoubleClick={(args: any) => {
              handlePilihTermin();
              // console.log(args, 'args double click');
            }}
          >
            <ColumnsDirective>
              <ColumnDirective field="nama_termin" headerText="Nama Termin" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Selection]} />
          </GridComponent>

          <div>
            <ButtonComponent
              id="buBatalDokumen1"
              content="Batal"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                setModalDaftarTermin(false);
              }}
            />

            <ButtonComponent
              id="buSimpanDokumen1"
              content="Pilih"
              cssClass="e-primary e-small"
              style={{ float: 'right', width: '70px', marginBottom: 8, marginTop: 8, marginRight: 10, backgroundColor: '#3b3f5c' }}
              onClick={() => {
                handlePilihTermin();
              }}
            />
          </div>
        </DialogComponent>
        {/* END MODAL LIST TERMIN */}

        {/* DIALOG PROGRESS BAR */}
        <GlobalProgressBar />
      </div>
    </DialogComponent>
  );
};

export default DialogFPACList;
