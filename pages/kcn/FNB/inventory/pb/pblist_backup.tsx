import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';
import styles from './pblist.module.css';
import Dropdown from '../../../../../components/Dropdown';
import { useRouter } from 'next/router';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, SwitchComponent } from '@syncfusion/ej2-react-buttons';
import swal from 'sweetalert2';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { Tooltip, TooltipComponent } from '@syncfusion/ej2-react-popups';
import PilihBaruModal from './modal/pilihbaru';
import { showLoading, usersMenu } from '@/utils/routines';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
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
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { useSession } from '@/pages/api/sessionContext';
import withReactContent from 'sweetalert2-react-content';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
let gridListData: any;
let gridListDataPra: Grid | any;
let tooltipListData: Tooltip | any;
// enableRipple(true);
// let tabTtbList: TabComponent | any;

// interface PBListProps {
//     userid: any;
//     kode_entitas: any;
// }

const PenerimaanBarangList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';

    if (isLoading) {
        return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '40100'; // kode menu PB

    //==========  Popup menu untuk header grid List Data ===========
    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3500,
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
    const templatePO = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>PO</span>
            </div>
        );
    };

    const templateColumnPO: any = [
        {
            field: 'sat_sp',
            headerText: 'Satuan',
            width: 40,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty_po',
            headerText: 'Kuantitas',
            width: 40,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const templateSJ = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>SJ Supplier</span>
            </div>
        );
    };

    const templateColumnSJ: any = [
        {
            field: 'sat_sj',
            headerText: 'Satuan',
            width: 40,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty_sj',
            headerText: 'Kuantitas',
            width: 40,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const templatePB = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>PB</span>
            </div>
        );
    };

    const templateColumnPB: any = [
        {
            field: 'satuan',
            headerText: 'Satuan',
            width: 40,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty',
            headerText: 'Kuantitas',
            width: 40,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const myAlert = (text: any) => {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: `<p style="font-size:12px">${text}</p>`,
            width: '100%',
            target: '#dialogMBList',
        });
    };
    let menuHeaderItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-print',
            text: 'Cetak ke printer',
        },
        {
            iconCss: 'e-icons',
            text: 'Export ke file',
            items: [
                { iconCss: 'e-icons e-export-pdf', text: 'PDF' },
                { iconCss: 'e-icons e-export-excel', text: 'XLSX' },
                { iconCss: 'e-icons e-export-csv', text: 'CSV' },
            ],
        },
    ];

    function menuHeaderSelect(args: MenuEventArgs) {
        if (args.item.text === 'Cetak ke printer') {
            gridListData.print();
        } else if (args.item.text === 'PDF') {
            gridListData.showSpinner();
            gridListData.pdfExport();
        } else if (args.item.text === 'XLSX') {
            gridListData.showSpinner();
            gridListData.excelExport();
        } else if (args.item.text === 'CSV') {
            gridListData.showSpinner();
            gridListData.csvExport();
        }
    }
    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };
    //=============================================================
    const router = useRouter();

    type PBListItem = {
        kode_lpb: string;
        no_lpb: any;
        tgl_lpb: any;
        tgl_sj: any;
        no_reff: any;
        dokumen: any;
        kode_gudang: any;
        kode_supp: any;
        fob: any;
        via: any;
        pengemudi: any;
        nopol: any;
        persediaan: any;
        total_rp: any;
        total_diskon_rp: any;
        total_pajak_rp: any;
        netto_rp: any;
        keterangan: any;
        total_berat: any;
        status: any;
        userid: any;
        tgl_update: any;
        kirim: any;
        kirim_mu: any;
        diskon_dok: any;
        diskon_dok_rp: any;
        kena_pajak: any;
        kode_termin: any;
        kontrak: any;
        status_export: any;
        fdo: any;
        tgl_trxlpb: any;
        status_dok: any;
        no_pralpb: any;
        tgl_pralpb: any;
        nama_relasi: any;
        nama_gudang: any;
    };

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalRecords2, setTotalRecords2] = useState(0);
    const [allRecords, setAllRecords] = useState<PBListItem[]>([]);
    const [allRecordsPra, setAllRecordsPra] = useState<PBListItem[]>([]);

    //checkbox filter
    const [noPBValue, setNoPBValue] = useState<string>('');
    const [noSJValue, setNoSJValue] = useState<string>('');
    const [SupplierValue, setSupplierValue] = useState<string>('');
    const [NamaBarangValue, setNamaBarangValue] = useState('');
    const [isNoPBChecked, setIsNoPBChecked] = useState<boolean>(false);
    const [isNoSJChecked, setIsNoSJChecked] = useState<boolean>(false);
    const [isSupplierChecked, setIsSupplierChecked] = useState<boolean>(false);

    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);
    const [date3, setDate3] = useState<moment.Moment>(moment());
    const [date4, setDate4] = useState<moment.Moment>(moment().endOf('month'));
    const [isTanggalSJChecked, setIsTanggalSJChecked] = useState<boolean>(false);
    const [selectedOptionRadio, setSelectedOptionRadio] = useState('all');

    const [listGudang, setListGudang] = useState([]);
    const [selectedGudang, setSelectedGudang] = useState('');
    const [isGudangChecked, setIsGudangChecked] = useState(false);
    const [isNamaBarangChecked, setIsNamaBarangChecked] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isStatusChecked, setIsStatusChecked] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<any>('');

    //pencarian
    const [searchnopp, setsearchnopp] = useState('');
    const [searchketerangan, setsearchketerangan] = useState('');

    const handleRadioChange = (e: any) => {
        setSelectedOptionRadio(e.target.value);
        // alert(e.target.value);
    };

    //pindah approval
    const handleNavigateLink = (jenis: any) => {
        if (jenis === 'approve') {
            // button approve
            if (!selectedRow) {
                myAlert(`Pilih PB baru yang akan diapprove.`);
            } else {
                if (jenisList === 'approved') {
                    // alert('Pilih data PB Baru yang belum diapproval');
                    if (statusList === 'Terbuka') {
                        // console.log('MASUK SINI');
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terbuka`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Approval') {
                        myAlert(`Pilih data PB Baru yang belum diapproval.`);
                    } else if (statusList === 'Faktur') {
                        myAlert(`Pilih data PB Baru yang belum diapproval.`);
                    } else if (statusList === 'Proses') {
                        myAlert(`Pilih data PB Baru yang belum proses.`);
                    }
                } else if (jenisList === 'baru') {
                    const encode = Buffer.from(`kode_lpb=${selectedRow}&view=false&status=app_pra_pb`).toString('base64');
                    router.push({ pathname: './approval_pb', query: { str: encode } });
                }
            }
        } else if (jenis === 'edit') {
            // button ubah
            if (!selectedRow) {
                myAlert(`Pilih PB baru yang akan diedit.`);
            } else {
                if (jenisList === 'approved') {
                    if (statusList === 'Faktur') {
                        // edit approved yang masih Faktur
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terfaktur`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Terbuka') {
                        // MASIH BISA EDIT SIMPAN
                        // edit approved yang masih terbuka
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terbuka`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else {
                        // alert('Data Approved');
                        // router.push({ pathname: './approval_pb', query: { name: selectedRow, view: true } });
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    }
                } else if (jenisList === 'baru') {
                    // router.push({ pathname: './new_pb', query: { name: selectedRow, edit: true, kontrak: selectedKontrak } });
                    const encode = Buffer.from(`kode_lpb=${selectedRow}&edit=true&kontrak=${selectedKontrak}`).toString('base64');
                    router.push({ pathname: './new_pb', query: { str: encode } });
                }
            }
        } else if (jenis === 'updatefilependukung') {
            // button ubah
            if (!selectedRow) {
                myAlert(`Pilih PB yang akan diupdate file pendukung.`);
            } else {
                if (jenisList === 'approved') {
                    if (statusList === 'Faktur') {
                        // edit approved yang masih Faktur
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terfaktur&updatefilependukung=true`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Terbuka') {
                        // MASIH BISA EDIT SIMPAN
                        // edit approved yang masih terbuka
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terbuka&updatefilependukung=true`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else {
                        // alert('Data Approved');
                        // router.push({ pathname: './approval_pb', query: { name: selectedRow, view: true } });
                        const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&updatefilependukung=true`).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    }
                } else if (jenisList === 'baru') {
                    // router.push({ pathname: './new_pb', query: { name: selectedRow, edit: true, kontrak: selectedKontrak } });
                    const encode = Buffer.from(`kode_lpb=${selectedRow}&edit=true&kontrak=${selectedKontrak}&updatefilependukung=true`).toString('base64');
                    router.push({ pathname: './new_pb', query: { str: encode } });
                }
            }
        }
    };

    //handle input filter
    const handleNoPBInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoPBValue(newValue);
        setIsNoPBChecked(newValue.length > 0);
    };
    //handle input filter
    const handleNoSJInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue2 = event.target.value;
        setNoSJValue(newValue2);
        setIsNoSJChecked(newValue2.length > 0);
    };

    const handleSupplierInputChange = (event: any) => {
        const newValue = event.target.value;
        setSupplierValue(newValue);
        setIsSupplierChecked(newValue.length > 0);
    };

    const handleSelectedGudang = (event: any) => {
        // alert(event.target.value);
        setSelectedGudang(event.target.value);
        setIsGudangChecked(event.target.value.length > 0);
    };

    const handleNamaBarangInputChange = (event: any) => {
        // alert(event.target.value);
        setNamaBarangValue(event.target.value);
        setIsNamaBarangChecked(event.target.value.length > 0);
    };

    const handleSelectedStatus = (event: any) => {
        // alert(event.target.value);
        setSelectedStatus(event.target.value);
        setIsStatusChecked(event.target.value.length > 0);
    };

    //select baris
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedKontrak, setSelectedKontrak] = useState('');
    const [jenisList, setJenisList] = useState('');
    const [statusList, setStatus] = useState('');

    const handleRowClick = (kode_lpb: any, kontrak: any, jenisList: any, status: any) => {
        console.log(kode_lpb, kontrak, jenisList, status);
        setSelectedRow(kode_lpb);
        setSelectedKontrak(kontrak);
        setJenisList(jenisList);
        setStatus(status);
        // alert(status);
    };

    //modal
    const [baru, setBaru] = useState(false);
    const [modalApproval, setModalApproval] = useState(false);

    const [baruSelected, setbaruSelected] = useState();

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            showLoading();

            if (userid !== 'administrator') {
                await usersMenu(kode_entitas, userid, kode_menu)
                    .then((result) => {
                        const { baru, edit, hapus, cetak } = result;
                        setUserMenu((prevState) => ({
                            ...prevState,
                            baru: baru,
                            edit: edit,
                            hapus: hapus,
                            cetak: cetak,
                        }));
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } else {
                setUserMenu((prevState) => ({
                    ...prevState,
                    baru: 'Y',
                    edit: 'Y',
                    hapus: 'Y',
                    cetak: 'Y',
                }));
            }

            try {
                let vno_pb = 'all';
                let vno_sj = 'all';
                let vtgl_awal = 'all';
                let vtgl_akhir = 'all';
                let vstatus_dok = 'all';
                let vdokumen = 'all';
                let vproduksi = 'all';
                let vpembatalan = 'all';
                let vlimit = '10000';

                if (isNoPBChecked) {
                    vno_pb = `${noPBValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vtgl_awal = `${formattedDate1}`;
                    vtgl_akhir = `${formattedDate2}`;
                }

                if (isNoSJChecked) {
                    vno_sj = `${noSJValue}`;
                }

                // if (isStatusAppChecked) {
                //     vdokumen = `${StatusAppValue}`;
                // }

                // if (isProduksiChecked) {
                //     vproduksi = `Y`;
                // }

                // if (isPembatalanChecked) {
                //     vpembatalan = `Y`;
                // }

                const response = await axios.get(`${apiUrl}/erp/list_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: 'all',
                        param2: 'all',
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: 'all',
                        param6: 'all',
                        param7: 'all',
                        param8: 'all',
                        param9: 'all',
                        param10: 'all',
                        param11: 'all',
                        param12: 1000,
                    },
                });

                const response2 = await axios.get(`${apiUrl}/erp/list_pra_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: 'all',
                        param2: 'all',
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: 'all',
                        param6: 'all',
                        param7: 'all',
                        param8: 'all',
                        param9: 'all',
                        param10: 'all',
                        param11: 'all',
                        param12: 1000,
                    },
                });

                const responseData = response.data.data;
                const responseData2 = response2.data.data;

                const transformedData: PBListItem[] = responseData.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                }));

                const transformedData2: PBListItem[] = responseData2.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                }));

                setAllRecords(transformedData);
                setAllRecordsPra(transformedData2);
                setTotalRecords(transformedData.length);
                setTotalRecords2(transformedData2.length);

                const responseListGudang = await axios.get(`${apiUrl}/erp/list_gudang_forfilter?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: 'ADMIN', // sementara
                    },
                });

                const responseGudang = responseListGudang.data.data;
                setListGudang(responseGudang);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            swal.close();
        };
        fetchDataUseEffect();
    }, []);

    // Visible panel sidebar
    const [panelVisible, setPanelVisible] = useState(true);

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    // const refreshData = () => {
    //     alert(noPBValue);
    // };

    const refreshData = async () => {
        // alert(SupplierValue);
        showLoading();
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vno_pb = 'all';
                let vno_sj = 'all';
                let vtgl_awal = 'all';
                let vtgl_akhir = 'all';
                let vtglsj_awal = 'all';
                let vtglsj_akhir = 'all';
                let vsupplier = 'all';
                let vgudang = 'all';
                let vnama_barang = 'all';
                let vstatus = 'all';

                if (isNoPBChecked) {
                    vno_pb = `${noPBValue}`;
                }

                if (isNoSJChecked) {
                    vno_sj = `${noSJValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vtgl_awal = `${formattedDate1}`;
                    vtgl_akhir = `${formattedDate2}`;
                }

                if (isTanggalSJChecked) {
                    const formattedDate1 = date3.format('YYYY-MM-DD');
                    const formattedDate2 = date4.format('YYYY-MM-DD');
                    vtglsj_awal = `${formattedDate1}`;
                    vtglsj_akhir = `${formattedDate2}`;
                }

                if (isSupplierChecked) {
                    vsupplier = `${SupplierValue}`;
                }

                if (isGudangChecked) {
                    vgudang = `${selectedGudang}`;
                }

                if (isNamaBarangChecked) {
                    vnama_barang = NamaBarangValue;
                }

                if (isStatusChecked) {
                    vstatus = selectedStatus;
                }

                const response = await axios.get(`${apiUrl}/erp/list_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pb,
                        param2: vno_sj,
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: vtglsj_awal,
                        param6: vtglsj_akhir,
                        param7: vsupplier,
                        param8: vgudang,
                        param9: vnama_barang,
                        param10: vstatus,
                        param11: selectedOptionRadio,
                        param12: 1000,
                    },
                });

                const response2 = await axios.get(`${apiUrl}/erp/list_pra_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pb,
                        param2: vno_sj,
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: vtglsj_awal,
                        param6: vtglsj_akhir,
                        param7: vsupplier,
                        param8: vgudang,
                        param9: vnama_barang,
                        param10: vstatus,
                        param11: selectedOptionRadio,
                        param12: 1000,
                    },
                });

                const responseData = response.data.data;
                const responseData2 = response2.data.data;
                const transformedData: PBListItem[] = responseData.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                }));

                const transformedData2: PBListItem[] = responseData2.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                }));

                setAllRecords(transformedData);
                setTotalRecords(transformedData.length);
                setAllRecordsPra(transformedData2);
                setTotalRecords2(transformedData2.length);
            } catch (error) {
                console.error(error);
            }
        }
        if (kode_entitas == null || kode_entitas == '') {
            alert('Silahkan Login Kembali, Session Habis');
            setTimeout(() => {
                router.push({ pathname: '/' });
            }, 1000);
        }
        swal.close();
    };

    // modal
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalPosition, setModalPosition] = useState({ top: '15%', left: '10%' });

    const openModal = (item: any) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    // fetchdetail
    const [headerFetch, setHeaderFetch] = useState<any>([]);
    const [detailFetch, setDetailFetch] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (jenisList === 'approved') {
                    var responseDetail = await axios.get(`${apiUrl}/erp/detail_approved_pb?entitas=${kode_entitas}&param1=${selectedRow}`);
                } else {
                    var responseDetail = await axios.get(`${apiUrl}/erp/app_detail_prapb?entitas=${kode_entitas}&param1=${selectedRow}`);
                }
                // const responseHeader = await axios.get(`${apiUrl}/erp/app_header_prapb?entitas=${kode_entitas}&param1=${selectedRow}`);
                // setHeaderFetch(responseHeader.data.data);
                setDetailFetch(responseDetail.data.data);
                // console.log(responseHeader.data.data);
                console.log(selectedRow);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [kode_entitas, selectedRow]);

    const OnClick_CetakFormPB = (nominal: any) => {
        console.log(nominal);
        if (selectedRow === '') {
            myAlert(`Silahkan pilih data terlebih dahulu.`);
        } else {
            const param = {
                entitas: kode_entitas,
                param1: `${selectedRow}`,
            };
            // Encode Base64
            const strCommand = btoa(JSON.stringify(param));

            let height = window.screen.availHeight - 150;
            let width = window.screen.availWidth - 200;
            let leftPosition = window.screen.width / 2 - (width / 2 + 10);
            let topPosition = window.screen.height / 2 - (height / 2 + 50);

            if (jenisList === 'approved') {
                if (nominal === 'false') {
                    let iframe = `
                    <html><head>
                    <title>Form Penerimaan Barang | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_pb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                } else if (nominal === 'true') {
                    let iframe = `
                    <html><head>
                    <title>Form Penerimaan Barang (Dengan Harga) | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_pb_nominal?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                }
            } else if (jenisList === 'baru') {
                // prapb
                if (nominal === 'false') {
                    let iframe = `
                   <html><head>
                   <title>Form Pra Penerimaan Barang | Next KCN Sytem</title>
                   <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                   </head><body>
                   <iframe src="./report/form_prapb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                } else if (nominal === 'true') {
                    let iframe = `
                    <html><head>
                    <title>Form Pra Penerimaan Barang (Dengan Harga) | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_prapb_nominal?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                }
            } else {
                console.error('Window failed to open.');
            }
        }
    };

    const BatalApproval = async () => {
        if (selectedRow) {
            if (jenisList === 'approved') {
                if (statusList === 'Faktur') {
                    myAlert(`Dokumen ini telah difaktur.`);
                } else if (statusList === 'Approval') {
                    Swal.fire({
                        title: 'Pembatalan !!!',
                        text: `Apakah anda yakin akan melakukan pembatalan approval PB`,
                        // icon: 'warning',
                        showCancelButton: true, // Menampilkan tombol Batal
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ya, Batalkan!',
                        cancelButtonText: 'Batal',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const response: any = await ApiBatal('Approval');
                                if (response.data.status === true) {
                                    console.log(response.data.status);
                                    Swal.fire({
                                        title: 'Berhasil Pembatalan Approval PB',
                                        icon: 'success',
                                    }).then(() => {
                                        // Reload halaman
                                        window.location.reload();
                                    });
                                } else {
                                    console.error('Respons tidak valid');
                                }
                            } catch (error) {
                                console.error('Terjadi kesalahan:', error);
                                Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                            }
                        }
                    });
                } else if (statusList === 'Terbuka') {
                    Swal.fire({
                        title: '<h>Pembatalan !!!</h>',
                        text: `Apakah anda yakin akan melakukan pembatalan dengan mengembalikan ke Pra PB `,
                        icon: 'warning',
                        showCancelButton: true, // Menampilkan tombol Batal
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ya, Batalkan!',
                        cancelButtonText: 'Batal',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const response: any = await ApiBatal('Terbuka');
                                if (response.data.status === true) {
                                    console.log(response.data.status);
                                    Swal.fire({
                                        title: 'Berhasil Pembatalan Approval PB',
                                        icon: 'success',
                                    }).then(() => {
                                        // Reload halaman
                                        window.location.reload();
                                    });
                                } else {
                                    console.error('Respons tidak valid');
                                }
                            } catch (error) {
                                console.error('Terjadi kesalahan:', error);
                                Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                            }
                        }
                    });
                }
            } else {
                myAlert(`Pilih data yang telah diapproved.`);
            }
        } else {
            myAlert(`Pilih data terlebih dulu.`);
        }
    };

    const ApiBatal = async (batal: any) => {
        // if (batal === 'Terbuka') {
        const modifiedData = {
            entitas: kode_entitas,
            kode_lpb: selectedRow,
        };

        return await axios.post(`${apiUrl}/erp/batal_approval`, modifiedData);
        // } else if (batal === 'Approval') {
        //     const modifiedData = {
        //         entitas: kode_entitas,
        //         kode_lpb: selectedRow,
        //     };

        //     return await axios.post(`${apiUrl}/erp/batal_approvalpbflag`, modifiedData);
        // }
    };

    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate1(date);
            setIsTanggalChecked(true);
        } else {
            setDate2(date);
            setIsTanggalChecked(true);
        }
    };

    const handleTglSJ = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate3(date);
            setIsTanggalSJChecked(true);
        } else {
            setDate4(date);
            setIsTanggalSJChecked(true);
        }
    };

    const handleKontrak = () => {
        const encode = Buffer.from(`kontrak=Y`).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
    };

    const handleNonKontrak = () => {
        const encode = Buffer.from(`kontrak=N`).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
    };

    const styleButton = {
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        backgroundColor: 'rgb(59 63 92)',
        color: 'white',
        padding: '1.5px 12px',
        borderRadius: '4px',
        fontFamily: 'Roboto',
        marginLeft: 5,
        fontWeight: 500,
        transition: 'box-shadow 0.3s ease-in-out',
    };
    const styleButtonDisable = {
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        backgroundColor: '#dedede',
        color: 'white',
        padding: '1.5px 12px',
        borderRadius: '4px',
        fontFamily: 'Roboto',
        marginLeft: 5,
        fontWeight: 500,
        transition: 'box-shadow 0.3s ease-in-out',
    };

    return (
        <div className="main" id="main-target">
            <div style={{ marginTop: -5 }} className="mb-5 flex flex-col md:flex-row md:flex-row md:justify-between">
                <div className="flex flex-wrap items-center">
                    <ButtonComponent
                        id="btnBaru"
                        cssClass="e-primary e-small"
                        onClick={() => setBaru(true)}
                        disabled={userMenu.baru === 'Y' ? false : true}
                        content="Baru"
                        style={{ backgroundColor: 'rgb(59 63 92)' }}
                    ></ButtonComponent>

                    <ButtonComponent
                        id="btnUbah"
                        cssClass="e-primary e-small"
                        onClick={() => handleNavigateLink('edit')}
                        disabled={userMenu.edit === 'Y' ? false : true}
                        content="Ubah"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                    ></ButtonComponent>
                    <ButtonComponent
                        id="btnFilter"
                        cssClass="e-primary e-small"
                        onClick={handleFilterClick}
                        disabled={panelVisible}
                        content="Filter"
                        style={panelVisible ? { color: 'white', marginLeft: 5, backgroundColor: '#dedede' } : { backgroundColor: 'rgb(59 63 92)', marginLeft: 5, color: 'white' }}
                    ></ButtonComponent>
                    <div style={{ marginLeft: 5, marginRight: 5 }} className="relative">
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={`bottom-start`}
                                // btnClassName="btn btn-dark md:mr-1"
                                button={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: 11,
                                            backgroundColor: 'rgb(59 63 92)',
                                            color: 'white',
                                            padding: '2.5px 10px',
                                            borderRadius: '4px',
                                            fontFamily: 'Roboto',
                                        }}
                                    >
                                        Cetak
                                        <FontAwesomeIcon icon={faSquareCaretDown} className="ml-2" width="15" height="15" />
                                    </div>
                                }
                            >
                                <ul style={{ width: '300px', fontSize: 12, textAlign: 'left' }}>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormPB('false')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                userMenu.cetak !== 'Y'
                                                    ? {
                                                          color: '#888',
                                                          cursor: 'not-allowed',
                                                          pointerEvents: 'none',
                                                      }
                                                    : {}
                                            }
                                        >
                                            Form Penerimaan Barang
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormPB('true')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                userMenu.cetak !== 'Y'
                                                    ? {
                                                          color: '#888',
                                                          cursor: 'not-allowed',
                                                          pointerEvents: 'none',
                                                      }
                                                    : {}
                                            }
                                        >
                                            Form Penerimaan Barang (Dengan Harga)
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    <ButtonComponent
                        id="Approval"
                        cssClass="e-primary e-small"
                        onClick={() => handleNavigateLink('approve')}
                        content="Approval"
                        style={{ backgroundColor: 'rgb(59 63 92)' }}
                    ></ButtonComponent>
                    <ButtonComponent
                        id="btlApproval"
                        cssClass="e-primary e-small"
                        onClick={() => BatalApproval()}
                        content="Batal Approval"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                    ></ButtonComponent>
                    <ButtonComponent
                        id="updatefilependukung"
                        cssClass="e-primary e-small"
                        onClick={() => handleNavigateLink('updatefilependukung')}
                        content="Update File Pendukung"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                    ></ButtonComponent>
                    <ButtonComponent
                        id="dokDetail"
                        cssClass="e-primary e-small"
                        onClick={() => openModal(selectedRow)}
                        content="Detail Dok"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                    ></ButtonComponent>
                    {/* <button id="btnBaru" className="e-primary e-small" onClick={() => setBaru(true)} disabled={userMenu.baru !== 'Y'} style={{ ...styleButton, marginLeft: 0 }}>
                        Baru
                    </button>
                    <button id="btnUbah" className="e-primary e-small" onClick={() => handleNavigateLink('edit')} disabled={userMenu.edit !== 'Y'} style={styleButton}>
                        Ubah
                    </button>
                    <button id="btnFilter" className="e-primary e-small" onClick={handleFilterClick} disabled={panelVisible} style={panelVisible ? styleButtonDisable : styleButton}>
                        Filter
                    </button>

                    <button id="Approval" className="e-primary e-small" onClick={() => handleNavigateLink('approve')} style={{ ...styleButton, marginLeft: 0 }}>
                        Approval
                    </button>

                    <button id="btlApproval" className="e-primary e-small" onClick={() => BatalApproval()} style={styleButton}>
                        Batal Approval
                    </button>

                    <button id="btlApproval" className="e-primary e-small" onClick={() => handleNavigateLink('updatefilependukung')} style={styleButton}>
                        Update File Pendukung
                    </button>

                    <button id="dokDetail" className="e-primary e-small" onClick={() => openModal(selectedRow)} style={styleButton}>
                        Detail Dok
                    </button> */}
                </div>

                <div className="mt-2 flex items-center md:mt-0">
                    <span style={{ fontSize: 16 }} className="font-serif text-xl">
                        Penerimaan Barang (PB)
                    </span>
                </div>
            </div>
            <div className={styles['flex-container']} style={{ fontSize: '11px', marginTop: -5 }}>
                {panelVisible && (
                    <div className="panel" style={{ background: '#dedede', width: '300px' }}>
                        <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                        {/* <form className="space-y-2.5"> */}
                        <div className="flex items-center">
                            <input type="checkbox" className="form-checkbox mr-2" checked={isNoPBChecked} onChange={() => setIsNoPBChecked(!isNoPBChecked)} />
                            <label style={{ fontWeight: 'bold' }}>No. PB</label>
                        </div>
                        <input style={{ fontSize: 11 }} type="text" placeholder="" className="form-input" value={noPBValue} onChange={handleNoPBInputChange} />

                        <label style={{ marginTop: 3 }} className=" flex cursor-pointer items-center">
                            <input style={{ fontSize: 11 }} type="checkbox" className="form-checkbox" checked={isNoSJChecked} onChange={() => setIsNoSJChecked(!isNoSJChecked)} />
                            <span style={{ fontWeight: 'bold' }}>No. SJ Supplier</span>
                        </label>
                        <input style={{ fontSize: 11, marginTop: -3 }} type="text" placeholder="" className="form-input" value={noSJValue} onChange={handleNoSJInputChange} />

                        <label style={{ marginTop: 3 }} className="mt-3 flex cursor-pointer items-center">
                            <input style={{ fontSize: 11 }} type="checkbox" className="form-checkbox" checked={isTanggalChecked} onChange={() => setIsTanggalChecked(!isTanggalChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Tanggal PB</span>
                        </label>
                        <div style={{ marginTop: -3, height: 30 }} className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                            <Flatpickr
                                value={date1.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: '11px', width: '100%' }}
                                onChange={(date) => handleTgl(moment(date[0]), 'tanggalAwal')}
                            />{' '}
                            <p style={{ display: 'inline', marginTop: 0 }}>S/D</p>
                            <Flatpickr
                                value={date2.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: '11px', width: '100%' }}
                                onChange={(date) => handleTgl(moment(date[0]), 'tanggalAkhir')}
                            />
                        </div>

                        <label style={{ marginTop: 3 }} className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isTanggalSJChecked} onChange={() => setIsTanggalSJChecked(!isTanggalSJChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Tanggal SJ Supplier</span>
                        </label>
                        <div style={{ marginTop: -3, height: 30 }} className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                            <Flatpickr
                                value={date3.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: '11px', width: '100%' }}
                                onChange={(date) => handleTglSJ(moment(date[0]), 'tanggalAwal')}
                            />{' '}
                            <p style={{ display: 'inline', marginTop: 0 }}>S/D</p>
                            <Flatpickr
                                value={date4.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: '11px', width: '100%' }}
                                onChange={(date) => handleTglSJ(moment(date[0]), 'tanggalAkhir')}
                            />
                        </div>
                        <label style={{ marginTop: '3px' }} className=" flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isSupplierChecked} onChange={() => setIsSupplierChecked(!isSupplierChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Supplier</span>
                        </label>
                        <input style={{ fontSize: 11, marginTop: -3 }} type="text" placeholder="" className="form-input" value={SupplierValue} onChange={handleSupplierInputChange} />
                        <label style={{ marginTop: 3 }} className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isGudangChecked} onChange={() => setIsGudangChecked(!isGudangChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Gudang</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11, marginTop: -3 }} id="ctnSelect1" className="form-select" value={selectedGudang} onChange={handleSelectedGudang}>
                                <option> </option>
                                {listGudang.map((option: any, index) => (
                                    <option key={index} value={option.kode_gudang}>
                                        {option.nama_gudang}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label style={{ marginTop: '3px' }} className=" flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isNamaBarangChecked} onChange={() => setIsNamaBarangChecked(!isNamaBarangChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Nama Barang</span>
                        </label>
                        <input style={{ fontSize: 11, marginTop: -3 }} type="text" placeholder="" className="form-input" value={NamaBarangValue} onChange={handleNamaBarangInputChange} />
                        <label style={{ marginTop: 3 }} className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isStatusChecked} onChange={() => setIsStatusChecked(!isStatusChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Status Dokumen</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11, marginTop: -3 }} id="ctnSelect1" className="form-select" value={selectedStatus} onChange={handleSelectedStatus}>
                                <option></option>
                                <option value="Terbuka">Terbuka</option>
                                <option value="Approval">Approval</option>
                                <option value="Faktur">Faktur</option>
                            </select>
                        </div>
                        <div style={{ marginTop: 3 }} className="mt-3 flex items-center">
                            <div className="font-bold">PB Kontrak Pabrik</div>
                        </div>
                        <div className="flex">
                            <div className="mt-1 flex" style={{ marginRight: '10px' }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="default_text_color"
                                            className="peer form-radio text-success"
                                            value="Y"
                                            checked={selectedOptionRadio === 'Y'}
                                            onChange={handleRadioChange}
                                        />
                                        <span className="peer-checked:text-success">Ya</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-1 flex" style={{ marginRight: '10px' }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="default_text_color"
                                            className="text-failed peer form-radio"
                                            value="N"
                                            checked={selectedOptionRadio === 'N'}
                                            onChange={handleRadioChange}
                                        />
                                        <span className="peer-checked:text-success">Tidak</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-1 flex">
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="default_text_color"
                                            className="peer form-radio text-secondary"
                                            value="all"
                                            checked={selectedOptionRadio === 'all'}
                                            onChange={handleRadioChange}
                                        />
                                        <span className="peer-checked:text-secondary">Semua</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <ButtonComponent
                                style={{ backgroundColor: 'rgb(59 63 92)', marginTop: 200 }}
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-medium e-refresh"
                                content="Refresh Data"
                                onClick={() => refreshData()}
                            />
                            {/* <button
                                id="refreshdata"
                                className="e-primary e-small"
                                onClick={() => refreshData()}
                                style={{ ...styleButton, width: 120, height: 30, textAlign: 'center', justifyContent: 'center', marginTop: 20 }}
                            >
                                Refresh Data
                            </button> */}
                        </div>
                        {/* </form> */}
                    </div>
                )}

                {/* Form Grid Layouts */}
                <div className="panel" style={{ background: '#dedede', width: panelVisible ? '85%' : '100%' }}>
                    <div className="panel-data" style={{ width: '100%' }}>
                        <TooltipComponent ref={(t) => (tooltipListData = t)} target=".e-headertext">
                            <TabComponent selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                <div className="e-tab-header" style={{ display: 'flex' }}>
                                    <div tabIndex={0} style={{ fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                                        Baru
                                    </div>
                                    <div tabIndex={1} style={{ fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                                        Approved
                                    </div>
                                </div>
                                <div className="e-content">
                                    {/* INDEX 0 */}
                                    <div tabIndex={0} style={{ marginTop: -5, fontSize: '12px', fontWeight: 'bold', padding: '10px 12px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                                        <div>
                                            <GridComponent
                                                id="gridListDataBaru"
                                                locale="id"
                                                ref={(g) => (gridListDataPra = g)}
                                                dataSource={allRecordsPra}
                                                allowExcelExport={true}
                                                excelExportComplete={ExportComplete}
                                                allowPdfExport={true}
                                                pdfExportComplete={ExportComplete}
                                                height={585}
                                                width={'100%'}
                                                gridLines={'Both'}
                                                allowPaging={true}
                                                // pageSettings={pageSettings}
                                                allowSorting={true}
                                                selectionSettings={{ type: 'Single' }}
                                                rowSelected={(args) => handleRowClick(args.data.kode_lpb, args.data.kontrak, 'baru', args.data.status)}
                                                recordDoubleClick={(args: any) => {
                                                    const selectedItems = args.rowData;
                                                    console.log(selectedItems);
                                                    setSelectedRow(selectedItems.kode_lpb);
                                                    handleNavigateLink('edit');
                                                }}
                                                rowHeight={23}
                                                pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                                // queryCellInfo={queryCellInfoListData}
                                                allowResizing={true}
                                                autoFit={true}
                                                rowSelecting={(args: any) => {
                                                    console.log(args.data);
                                                    setSelectedDetail(args.data);
                                                }}
                                                // rowDataBound={rowDataBoundListData}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective field="no_lpb" headerText="No. PB" width="120" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="tgl_lpb" headerText="Tgl. PB" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective
                                                        field="no_reff"
                                                        headerText="No. SJ Supplier"
                                                        width="190"
                                                        textAlign="Left"
                                                        headerTextAlign="Center"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective field="tgl_sj" headerText="Tgl. SJ" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nama_relasi" headerText="Supplier" width="250" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nama_gudang" headerText="Gudang" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="dokumen" headerText="Cara Kirim" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="via" headerText="Pengiriman Via" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="pengemudi" headerText="Pengemudi" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="status" headerText="Status Dok" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="status_dok" headerText="Status PB" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                </ColumnsDirective>
                                                <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                            </GridComponent>
                                            <ContextMenuComponent
                                                id="contextmenu"
                                                target=".e-gridheader"
                                                items={menuHeaderItems}
                                                select={menuHeaderSelect}
                                                animationSettings={{ duration: 500, effect: 'FadeIn' }}
                                            />
                                            <style>
                                                {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;
                    }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                `}
                                            </style>
                                        </div>
                                    </div>
                                    {/* INDEX 1 */}
                                    <div tabIndex={1} style={{ marginTop: -5, fontSize: '12px', fontWeight: 'bold', padding: '10px 12px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                                        <div>
                                            <GridComponent
                                                id="gridListDataApproved"
                                                locale="id"
                                                ref={(g) => (gridListData = g)}
                                                dataSource={allRecords}
                                                allowExcelExport={true}
                                                excelExportComplete={ExportComplete}
                                                allowPdfExport={true}
                                                pdfExportComplete={ExportComplete}
                                                height={585}
                                                width={'100%'}
                                                gridLines={'Both'}
                                                allowPaging={true}
                                                // pageSettings={pageSettings}
                                                allowSorting={true}
                                                selectionSettings={{ type: 'Single' }}
                                                rowSelected={(args) => {
                                                    handleRowClick(args.data.kode_lpb, args.data.kontrak, 'approved', args.data.status);
                                                }}
                                                recordDoubleClick={(args: any) => {
                                                    const selectedItems = args.rowData;
                                                    console.log(selectedItems);
                                                    setSelectedRow(selectedItems.kode_lpb);
                                                    handleNavigateLink('edit');
                                                }}
                                                rowHeight={23}
                                                pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                                // queryCellInfo={queryCellInfoListData}
                                                allowResizing={true}
                                                autoFit={true}
                                                rowSelecting={(args: any) => {
                                                    console.log(args.data);
                                                    setSelectedDetail(args.data);
                                                }}
                                                // rowDataBound={rowDataBoundListData}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective field="no_lpb" headerText="No. PB" width="120" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="tgl_lpb" headerText="Tgl. PB" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective
                                                        field="no_reff"
                                                        headerText="No. SJ Supplier"
                                                        width="190"
                                                        textAlign="Left"
                                                        headerTextAlign="Center"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective field="tgl_sj" headerText="Tgl. SJ" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nama_relasi" headerText="Supplier" width="250" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nama_gudang" headerText="Gudang" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="dokumen" headerText="Cara Kirim" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="via" headerText="Pengiriman Via" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="pengemudi" headerText="Pengemudi" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="status" headerText="Status Dok" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                    <ColumnDirective field="status_dok" headerText="Status PB" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                                </ColumnsDirective>
                                                <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                            </GridComponent>
                                            <ContextMenuComponent
                                                id="contextmenu"
                                                target=".e-gridheader"
                                                items={menuHeaderItems}
                                                select={menuHeaderSelect}
                                                animationSettings={{ duration: 500, effect: 'FadeIn' }}
                                            />
                                            <style>
                                                {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;
                    }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                `}
                                            </style>
                                        </div>
                                    </div>
                                </div>
                            </TabComponent>
                        </TooltipComponent>
                        {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
                        <ContextMenuComponent id="contextmenu" target=".e-gridheader" items={menuHeaderItems} select={menuHeaderSelect} animationSettings={{ duration: 800, effect: 'FadeIn' }} />
                    </div>
                </div>
                {selectedItem && (
                    <DialogComponent
                        id="dialogJenisTransaksiMB"
                        name="dialogJenisTransaksiMB"
                        className="dialogJenisTransaksiMB"
                        // target="#main-target"
                        header={`Detail Penerimaan Barang : ${selectedDetail.no_lpb} - ${selectedDetail.tgl_lpb}`}
                        visible={selectedItem}
                        // isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        enableResize={true}
                        resizeHandles={['All']}
                        allowDragging={true}
                        showCloseIcon={true}
                        width="1000"
                        height="220"
                        position={{ X: 'center', Y: '180' }}
                        style={{ position: 'fixed' }}
                        close={() => {
                            closeModal();
                        }}
                    >
                        <div>
                            <GridComponent
                                gridLines={'Both'}
                                allowResizing={true}
                                locale="id"
                                style={{ width: '100%', height: '68%' }}
                                dataSource={detailFetch}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                rowHeight={22}
                                width={'100%'}
                                height={'110'}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="no_sp" headerText="No. PO" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="no_item" headerText="No. Barang" width="60" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="diskripsi" headerText="Nama Barang" width="160" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective headerTemplate={templatePO} width="160" columns={templateColumnPO} />
                                    <ColumnDirective headerTemplate={templateSJ} width="160" columns={templateColumnSJ} />
                                    <ColumnDirective headerTemplate={templatePB} width="160" columns={templateColumnPB} />
                                </ColumnsDirective>
                                <Inject services={[Page, Sort, Filter, Group, Resize]} />
                            </GridComponent>
                            {/* <ContextMenuComponent id="contextmenu" target=".e-gridheader" items={menuHeaderItems} select={menuHeaderSelect} animationSettings={{ duration: 500, effect: 'FadeIn' }} /> */}
                            <style>
                                {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                `}
                            </style>
                        </div>
                    </DialogComponent>
                )}
            </div>
            {baru && (
                <DialogComponent
                    id="dialogJenisTransaksiMB"
                    name="dialogJenisTransaksiMB"
                    className="dialogJenisTransaksiMB"
                    target="#main-target"
                    header="Jenis Transaksi"
                    visible={baru}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    // enableResize={true}
                    resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="50"
                    height="130"
                    position={{ X: 'center', Y: 'center' }}
                    style={{ position: 'fixed' }}
                    close={() => {
                        setBaru(false);
                    }}
                    // buttons={buttonInputData}
                >
                    <div style={{ marginLeft: 30, marginBottom: 10 }}>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '85%' }} onClick={() => handleKontrak()}>
                            Kontrak
                        </ButtonComponent>
                    </div>
                    <div style={{ marginLeft: 30, marginBottom: 10 }}>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '85%' }} onClick={() => handleNonKontrak()}>
                            Non Kontrak
                        </ButtonComponent>
                    </div>
                </DialogComponent>
            )}
        </div>
    );
};

export default PenerimaanBarangList;
