import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';
import styles from './mblist.module.css';
import './mblist.module.css';
import { useRouter } from 'next/router';
import 'react-tabs/style/react-tabs.css';
import { showLoading, usersMenu, FirstDayInPeriod } from '@/utils/routines';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import axios from 'axios';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-react-navigations';
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
import { FillFromSQL, frmNumber } from '@/utils/routines';
import swal from 'sweetalert2';
import ModalMutasiBarangAntarGudang from './modal/mutasiBarangAntarGudang';
import ModalDOMobilSendiriCustomer from './modal/doMobilSendiriCustomer';
import ModalDOPabrikEkspedisi from './modal/doPabrikEkspedisi';
import ModalDOPabrikPembatalan from './modal/doPabrikPembatalan';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { useSession } from '@/pages/api/sessionContext';
import withReactContent from 'sweetalert2-react-content';
import Dropdown from '../../../../../components/Dropdown';
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

// interface Props {
//     userid: any;
//     kode_entitas: any;
//     token: any;
//     kode_user: any;
// }

// { userid, kode_entitas, token, kode_user }: Props
const MutasiBarangList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';

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
    const kode_menu = '50200'; // kode menu MB
    const router = useRouter();
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const [isNoMBChecked, setisNoMBChecked] = useState(false);
    const [noMBValue, setnoMBValue] = useState('');
    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);
    const [isNopolChecked, setisNopolChecked] = useState<boolean>(false);
    const [nopolValue, setnopolValue] = useState<string>('');
    const [isViaChecked, setisViaChecked] = useState<boolean>(false);
    const [viaValue, setviaValue] = useState<string>('');
    const [isBatalDOChecked, setisBatalDOChecked] = useState<boolean>(false);
    const [selectedOptionGudang, setSelectedOptionGudang] = useState<string>('');
    const [isGudangChecked, setIsGudangChecked] = useState<boolean>(false);
    const [selectedOptionGudangTujuan, setSelectedOptionGudangTujuan] = useState<string>('');
    const [isGudangCheckedTujuan, setIsGudangCheckedTujuan] = useState<boolean>(false);
    const [selectedRadioDOPabrik, setselectedRadioDOPabrik] = useState('semua');
    const [selectedRadioJenisMB, setselectedRadioJenisMB] = useState('all');
    const [selectedRow, setSelectedRow] = useState<any>('');
    const [paramListPrint, setParamListPrint] = useState<any>('');
    const [jenisTransaksi, setJenisTransaksi] = useState<any>('1');
    const [jenisDOmobil, setJenisDOmobil] = useState<any>('');
    const [jenisDOPabrikEkspedisi, setJenisDOPabrikEkspedisi] = useState<any>('');
    const [modalMutasiBarang, setModalMutasiBarang] = useState<any>(false);
    const [statusEdit, setStatusEdit] = useState<any>(false);
    const [modalDOMobilSendiriCustomer, setModalDOMobilSendiriCustomer] = useState<any>(false);
    const [modalDOPabrikEkspedisi, setModalDOPabrikEkspedisi] = useState<any>(false);
    const [modalDOPabrikPembatalan, setModalDOPabrikPembatalan] = useState<any>(false);
    const [recordsData, setRecordsData] = useState<any>([]);
    const [apiResponseNopol, setApiResponseNopol] = useState<any[]>([]);
    const [apiResponseVia, setApiResponseVia] = useState<any[]>([]);
    const [apiResponseGudang, setApiResponseGudang] = useState<any[]>([]);
    const [modalJenisTransaksi, setModalJenisTransaksi] = useState(false);
    const [modalJenisDOMobil, setModalJenisDOMobil] = useState(false);
    //visible panel sidebar
    const [panelVisible, setPanelVisible] = useState(true);
    // END

    //==========  Popup menu untuk header grid List Data ===========
    let gridListData: Grid | any;
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

    const myAlert = (text: any) => {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: `<p style="font-size:12px">${text}</p>`,
            width: '100%',
            target: '#dialogJenisTransaksiMB',
        });
    };

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const tanggalSekarang = moment();
            const tanggalAwalBulan = tanggalSekarang.startOf('month');
            const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
            const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');
            showLoading1(true);
            let vNoMb = 'all';
            let vTglAwal = tanggalHariIni; //tanggalHariIni
            let vTglAkhir = tanggalAkhirBulan; //tanggalAkhirBulan
            let vNamaGudangB = 'all';
            let vNamaGudangC = 'all';
            let vNamaGudangCabang = 'all';
            let vKontrak = 'all';
            let vNopol = 'all';
            let vVia = 'all';
            let vJenis = 'all';
            let vLimit = '1000';

            const response = await axios.get(`${apiUrl}/erp/list_mb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: vNamaGudangB, // b.nama_gudang
                    param2: vNamaGudangC, // c.nama_gudang
                    param3: vNopol, // a.nopol
                    param4: vVia, // a.via
                    param5: vNamaGudangCabang, // a.nama_gudang_cabang
                    param6: vKontrak, // a.kontrak
                    param7: vNoMb, //a.no_mb
                    param8: vTglAwal, // a.tgl_mb Awal (all = 2000-01-01)
                    param9: vTglAkhir, // a.tgl_mb Akhir (all = currentDate)
                    param10: vJenis, // a.jenis
                    paramLimit: vLimit,
                },
            });

            const responseData = response.data.data;
            showLoading1(false);

            const modifiedResponseData = responseData.map((item: any) => {
                return {
                    ...item,
                    tgl_do: moment(item.tgl_do).format('YYYY-MM-DD'),
                };
            });

            setRecordsData(modifiedResponseData);
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
                //ADMIN
                setUserMenu((prevState) => ({
                    ...prevState,
                    baru: 'Y',
                    edit: 'Y',
                    hapus: 'Y',
                    cetak: 'Y',
                }));
            }

            const gudangApi = await FillFromSQL(kode_entitas, 'gudang', kode_user)
                .then((result) => {
                    setApiResponseGudang(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            const noKendaraan = await axios.get(`${apiUrl}/erp/list_kendaraan-mb`, {
                params: {
                    entitas: kode_entitas,
                },
            });
            const apiKendaraan = noKendaraan.data.data;
            const transformedData_getnopol = apiKendaraan.map((item: any) => ({
                nopol: item.nopol,
            }));
            setApiResponseNopol(transformedData_getnopol);

            const viaPengiriman = await FillFromSQL(kode_entitas, 'pengiriman via', kode_user)
                .then((result) => {
                    setApiResponseVia(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            console.log('kode user=' + kode_user);
        };
        fetchDataUseEffect();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            const halfScreenWidth = window.screen.availWidth / 2;
            if (screenWidth < halfScreenWidth) {
                setPanelVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const rowDataBoundListData = (args: any) => {
        if (args.row) {
            if (args.data.nama_gudang_cabang == 'BATAL DO PABRIK') {
                args.row.classList.add('bg-[yellow]');
            }
        }
    };

    const queryCellInfoListData = (args: any) => {
        if (args.column?.field === 'status') {
            if (getValue('status', args.data) == 'Tertutup') {
                args.cell.style.color = 'red';
            } else if (getValue('status', args.data) == 'Proses') {
                args.cell.style.color = 'white';
            }
        }
    };

    const menuHeaderSelect = (args: MenuEventArgs) => {
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
    };

    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
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

    const handleInputNoMB = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setnoMBValue(newValue);
        setisNoMBChecked(newValue.length > 0);
    };

    const showLoading1 = (closeWhenDataIsFulfilled: boolean) => {
        if (closeWhenDataIsFulfilled) {
            swal.fire({
                padding: '3em',
                imageUrl: '/assets/images/loader-1.gif',
                imageWidth: 170,
                imageHeight: 170,
                imageAlt: 'Custom image',
                background: 'rgba(0,0,0,.0)',
                backdrop: 'rgba(0,0,0,0.0)',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
            });
        } else {
            swal.close(); // Menutup tampilan loading
        }
    };

    const handleRefreshData = async () => {
        showLoading1(true);
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vNoMB = 'all';
                let vTglAwal = 'all';
                let vTglAkhir = 'all';
                let vGudangAsal = 'all';
                let vGudangTujuan = 'all';
                let vNopol = 'all';
                let vVia = 'all';
                let vRadioDOPabrik = 'all';
                let vPembatalanDOPabrik = 'all';
                let vJenisMB = 'all';
                let vLimit = '1000';

                if (isNoMBChecked) {
                    vNoMB = `${noMBValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vTglAwal = `${formattedDate1}`;
                    vTglAkhir = `${formattedDate2}`;
                }

                if (isGudangChecked) {
                    vGudangAsal = `${selectedOptionGudang}`;
                }

                if (isGudangCheckedTujuan) {
                    vGudangTujuan = `${selectedOptionGudangTujuan}`;
                }

                if (isNopolChecked) {
                    vNopol = `${nopolValue}`;
                }

                if (isViaChecked) {
                    vVia = `${viaValue}`;
                }

                if (selectedRadioDOPabrik === 'semua') {
                    vRadioDOPabrik = 'all';
                } else if (selectedRadioDOPabrik === 'ya') {
                    vRadioDOPabrik = 'Y';
                } else if (selectedRadioDOPabrik === 'tidak') {
                    vRadioDOPabrik = 'N';
                }

                if (selectedRadioJenisMB === 'Expedisi Kirim Langsung') {
                    vJenisMB = 'Expedisi Kirim Langsung';
                } else if (selectedRadioJenisMB === 'Expedisi Kirim Gudang') {
                    vJenisMB = 'Expedisi Kirim Gudang';
                } else if (selectedRadioJenisMB === 'Mobil Sendiri Kirim Langsung') {
                    vJenisMB = 'Mobil Sendiri Langsung';
                } else if (selectedRadioJenisMB === 'Mobil Sendiri Kirim Gudang') {
                    vJenisMB = 'Mobil Sendiri Gudang';
                } else if (selectedRadioJenisMB === 'Mutasi Barang Antar Gudang') {
                    vJenisMB = 'Mutasi Barang Antar Gudang';
                } else if (selectedRadioJenisMB === 'all') {
                    vJenisMB = 'all';
                }

                if (isBatalDOChecked) {
                    vPembatalanDOPabrik = 'BATAL DO PABRIK';
                }

                const response = await axios.get(`${apiUrl}/erp/list_mb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vGudangAsal, // b.nama_gudang
                        param2: vGudangTujuan, // c.nama_gudang
                        param3: vNopol, // a.nopol
                        param4: vVia, // a.via
                        param5: vPembatalanDOPabrik, // a.nama_gudang_cabang
                        param6: vRadioDOPabrik, // a.kontrak // DO Pabrik
                        param7: vNoMB, //a.no_mb
                        param8: vTglAwal, // a.tgl_mb Awal (all = 2000-01-01)
                        param9: vTglAkhir, // a.tgl_mb Akhir (all = currentDate)
                        param10: vJenisMB, // a.jenis // Expedisi Kirim Langsung
                        paramLimit: vLimit,
                    },
                });

                const responseData = response.data.data;
                const modifiedResponseData = responseData.map((item: any) => {
                    return {
                        ...item,
                        tgl_do: moment(item.tgl_do).format('YYYY-MM-DD'),
                    };
                });

                setRecordsData(modifiedResponseData);
                showLoading1(false);
                setParamListPrint({
                    entitas: kode_entitas,
                    param1: vGudangAsal, // b.nama_gudang
                    param2: vGudangTujuan, // c.nama_gudang
                    param3: vNopol, // a.nopol // api routines belum sesuai
                    param4: vVia, // a.via
                    param5: vPembatalanDOPabrik, // a.nama_gudang_cabang
                    param6: vRadioDOPabrik, // a.kontrak // DO Pabrik
                    param7: vNoMB, //a.no_mb
                    param8: vTglAwal, // a.tgl_mb Awal (all = 2000-01-01)
                    param9: vTglAkhir, // a.tgl_mb Akhir (all = currentDate)
                    param10: vJenisMB, // a.jenis // Expedisi Kirim Langsung
                    paramLimit: vLimit,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleGudangChangeAsal = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedOptionGudang(newValue);
        setIsGudangChecked(newValue.length > 0);
    };

    const handleGudangChangeTujuan = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setSelectedOptionGudangTujuan(newValue);
        setIsGudangCheckedTujuan(newValue.length > 0);
    };

    const handleNoKendaraanInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setnopolValue(newValue);
        setisNopolChecked(newValue.length > 0);
    };

    const handleViaSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setviaValue(newValue);
        setisViaChecked(newValue.length > 0);
    };

    const handleDOPabrik = (event: any) => {
        setselectedRadioDOPabrik(event.target.id);
    };

    const handleRadioJenisMB = (event: any) => {
        setselectedRadioJenisMB(event.target.value);
    };

    const handleNavigateLink = async (jenis: any) => {
        setModalJenisTransaksi(false);
        console.log(jenis);
        if (jenis === '1') {
            setStatusEdit(false);
            setModalMutasiBarang(true);
        } else if (jenis === '2') {
            console.log('Modal DO Mobil Sendiri');
            setStatusEdit(false);
            setModalJenisDOMobil(true);
        } else if (jenis === '3') {
            setStatusEdit(false);
            console.log('DO Ekspedisi - Kirim Gudang');
            setModalDOPabrikEkspedisi(true);
        } else if (jenis === '4') {
            setStatusEdit(false);
            console.log('DO Ekspedisi - Kirim Langsung');
            setModalDOPabrikEkspedisi(true);
        }

        // ====================EDIT=========================
        if (jenis === 'edit') {
            const periode = await FirstDayInPeriod(kode_entitas);
            const formatPeriode = moment(periode).format('YYYY-MM-DD');

            console.log(selectedRow.jenis_mb);
            if (selectedRow) {
                if (selectedRow.tgl_mb < formatPeriode) {
                    myAlert('Tanggal transaksi lebih kecil dari periode yang sekarang, tidak bisa dikoreksi.');
                } else {
                    if (selectedRow.jenis_mb === 'MB' || selectedRow.jenis_mb === null) {
                        setStatusEdit(true);
                        setModalMutasiBarang(true);
                    } else if (selectedRow.jenis_mb === 'MKG') {
                        setStatusEdit(true);
                        handleNavigateLinkDOmobil('KG');
                    } else if (selectedRow.jenis_mb === 'MKL') {
                        setStatusEdit(true);
                        handleNavigateLinkDOmobil('KL');
                    } else if (selectedRow.jenis_mb === 'KG') {
                        handleNavigateLinkEkspedisi('KG');
                    } else if (selectedRow.jenis_mb === 'KL') {
                        handleNavigateLinkEkspedisi('KL');
                    }
                }
            } else {
                myAlert('Silahkan pilih data yang akan diedit');
            }
        }
        // ====================END EDIT=========================
    };

    const handleNavigateLinkDOmobil = (jenisDO: any) => {
        setModalJenisDOMobil(false);
        if (jenisDO === 'KG') {
            setModalDOMobilSendiriCustomer(true);
        } else if (jenisDO === 'KL') {
            setModalDOMobilSendiriCustomer(true);
        }
    };

    const handleNavigateLinkEkspedisi = (jenisDO: any) => {
        setJenisDOPabrikEkspedisi(jenisDO);
        setModalDOPabrikEkspedisi(true);
    };

    const handleRowSelected = (args: any) => {
        setSelectedRow(args.data);
        console.log(args.data);
        setJenisDOmobil(args.data.jenis_kirim);
    };

    const changeModalJenisTransaksi = (value: any) => {
        setJenisTransaksi(value);
        console.log(value);
        // UNTUK JENIS DO PABRIK EKSPEDISI
        if (value === '3') {
            setJenisDOPabrikEkspedisi('KG');
        } else if (value === '4') {
            setJenisDOPabrikEkspedisi('KL');
        }
    };

    const changeModalJenisTransaksiDOmobil = (value: any) => {
        setJenisDOmobil(value);
        console.log(value);
    };

    const dateFormat = (field: any, data: any) => {
        return data[field] ? moment(data[field]).format('DD-MM-YYYY HH:mm:ss') : '';
    };

    const batalDoPabrik = (data: any) => {
        if (data.kontrak === 'Y') {
            if (data.status === 'Terbuka') {
                console.log(data.jenis_mb);
                if (data.jenis_mb === 'KG' || data.jenis_mb === 'MKG') {
                    console.log('Fungsi batal disini');
                    setStatusEdit(true);
                    setModalDOPabrikPembatalan(true);
                } else {
                    myAlert(`Untuk jenis MB : KL || MKL. pembatalan ditutup`);
                }
            } else {
                myAlert(`Status 'Tertutup' DO Pabrik, tidak bisa dibatalkan.`);
            }
        } else {
            myAlert(`Data bukan transaksi DO Pabrik, tidak bisa dibatalkan.`);
        }
    };

    const OnClick_CetakFormMB = (jenis: any) => {
        console.log(paramListPrint);
        console.log(selectedRow);
        const param = {
            entitas: kode_entitas,
            param1: `${selectedRow.no_mb}`,
        };
        // Encode Base64
        const strCommand = btoa(JSON.stringify(param));

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        if (selectedRow === '') {
            // alert('Silahkan pilih data terlebih dahulu');
            swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih data terlebih dahulu.',
                icon: 'warning',
            });
        } else {
            let iframe: any;
            if (jenis === '1') {
                iframe = `
                        <html><head>
                        <title>Form Mutasi Barang | Next KCN Sytem</title>
                        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                        </head><body>
                        <iframe src="./report/form1?entitas=${kode_entitas}&param1=${selectedRow.no_mb}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                        </body></html>`;
            } else if (jenis === '2') {
                iframe = `
                    <html><head>
                    <title>Surat Pengambilan Barang - Mutasi Barang NON PKP | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form2?entitas=${kode_entitas}&param1=${selectedRow.kode_mb}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                    </body></html>`;
            } else if (jenis === '3') {
                iframe = `
                        <html><head>
                        <title>Surat Pengambilan Barang - Mutasi Barang PKP | Next KCN Sytem</title>
                        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                        </head><body>
                        <iframe src="./report/form3?entitas=${kode_entitas}&param1=${selectedRow.kode_mb}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                        </body></html>`;
            } else if (jenis === '8') {
                iframe = `
                                <html><head>
                                <title>Surat Pengambilan Barang - Mutasi Barang Ekspedisi | Next KCN Sytem</title>
                                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                                </head><body>
                                <iframe src="./report/form8?entitas=${kode_entitas}&param1=${selectedRow.kode_mb}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                                </body></html>`;
            }

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
        // } else if (jenis === 'daftar') {
        //     let iframe = `
        //             <html><head>
        //             <title>Daftar Surat Perintah Muat | Next KCN Sytem</title>
        //             <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
        //             </head><body>
        //             <iframe src="./report/daftar_mb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
        //             </body></html>`;
        //     let win = window.open(
        //         '',
        //         '_blank',
        //         `status=no,width=${width},height=${height},resizable=yes
        //               ,left=${leftPosition},top=${topPosition}
        //               ,screenX=${leftPosition},screenY=${topPosition}
        //               ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
        //     );
        //     if (win) {
        //         let link = win.document.createElement('link');
        //         link.type = 'image/png';
        //         link.rel = 'shortcut icon';
        //         link.href = '/favicon.png';
        //         win.document.getElementsByTagName('head')[0].appendChild(link);
        //         win.document.write(iframe);
        //     }
        // }
    };

    return (
        <div className="main" id="main-target">
            <div className="mb-5 flex flex-col items-center justify-between md:flex-row">
                <div className="flex flex-wrap items-center">
                    <ButtonComponent
                        id="btnBaru"
                        cssClass="e-primary e-small"
                        onClick={() => {
                            console.log('diklik');
                            setModalJenisTransaksi(true);
                        }}
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
                    {/* <ButtonComponent
                        id="btnCetak"
                        cssClass="e-primary e-small"
                        content="Cetak"
                        iconCss="e-icons e-medium e-chevron-down"
                        iconPosition="Right"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5, height: 25 }}
                    ></ButtonComponent> */}
                    {/* CETAK */}
                    <div style={{ marginLeft: 5, marginRight: 0 }} className="relative">
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
                                <ul style={{ width: '450px', fontSize: 12, textAlign: 'left' }}>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormMB('1')}
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
                                            Form Mutasi Barang Antar Gudang{' '}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormMB('2')}
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
                                            Form Surat Pengambilan Barang - Untuk Supplier/Pabrik - (NON PKP)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormMB('3')}
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
                                            Form Surat Pengambilan Barang - Untuk Supplier/Pabrik - (PKP)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            // onClick={() => OnClick_CetakFormPB('true')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                // userMenu.cetak !== 'Y'
                                                //     ? {
                                                { color: '#888', cursor: 'not-allowed', pointerEvents: 'none' }
                                                //   }
                                                // : {}
                                            }
                                        >
                                            Form Surat Pengambilan Barang - Untuk Ekspedisi
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            // onClick={() => OnClick_CetakFormPB('true')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                // userMenu.cetak !== 'Y'
                                                //     ? {
                                                { color: '#888', cursor: 'not-allowed', pointerEvents: 'none' }
                                                //   }
                                                // : {}
                                            }
                                        >
                                            Daftar Mutasi Barang Antar
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            // onClick={() => OnClick_CetakFormPB('true')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                // userMenu.cetak !== 'Y'
                                                //     ? {
                                                { color: '#888', cursor: 'not-allowed', pointerEvents: 'none' }
                                                //   }
                                                // : {}
                                            }
                                        >
                                            Daftar Mutasi Barang Kontrak (Per No. Kontrak)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            // onClick={() => OnClick_CetakFormPB('true')}
                                            disabled={userMenu.cetak === 'Y' ? false : true}
                                            style={
                                                // userMenu.cetak !== 'Y'
                                                //     ? {
                                                { color: '#888', cursor: 'not-allowed', pointerEvents: 'none' }
                                                //   }
                                                // : {}
                                            }
                                        >
                                            Daftar Mutasi Barang Kontrak (Per Supplier)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => OnClick_CetakFormMB('8')}
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
                                            Form Surat Pengambilan Barang - MB Ekspedisi
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    {/* END CETAK */}
                    {/* <ButtonComponent
                        id="btnKPB"
                        cssClass="e-primary e-small"
                        onClick={() => myAlert(`Data bukan transaksi kontrak pembelian barang, tidak bisa diapproval.`)}
                        content="KPB Approval"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5, height: 25 }}
                    ></ButtonComponent> */}
                    <ButtonComponent
                        id="btnBatalDOPabrik"
                        cssClass="e-primary e-small"
                        onClick={() => {
                            if (selectedRow) {
                                batalDoPabrik(selectedRow);
                            } else {
                                myAlert(`Silahkan pilih data terlebih dulu.`);
                            }
                        }}
                        content="Batal DO Pabrik"
                        style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5, height: 25 }}
                    ></ButtonComponent>
                </div>

                <div className="mt-3 flex items-center md:mt-0">
                    <span className="font-serif text-lg" style={{ fontSize: 16 }}>
                        Mutasi Barang (MB)
                    </span>
                </div>
            </div>

            <div className={styles['flex-container']} style={{ fontSize: '11px' }}>
                {panelVisible && (
                    <div className="panel" style={{ background: '#dedede', width: '300px' }}>
                        <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                        {/* <form> */}
                        <label className=" flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isNoMBChecked} onChange={() => setisNoMBChecked(!isNoMBChecked)} />
                            <span style={{ fontWeight: 'bold' }}>No. MB</span>
                        </label>
                        <input style={{ marginTop: -10, fontSize: 11 }} type="text" placeholder="" className="form-input" value={noMBValue} onChange={handleInputNoMB} />

                        <label style={{ marginTop: 5 }} className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isTanggalChecked} onChange={() => setIsTanggalChecked(!isTanggalChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Tanggal</span>
                        </label>
                        <div style={{ marginTop: -2 }} className="grid grid-cols-1 justify-between gap-1 sm:flex">
                            <Flatpickr
                                value={date1.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: 11, width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}
                                onChange={(date) => handleTgl(moment(date[0]), 'tanggalAwal')}
                            />
                            <p className="mt-1 hidden sm:block">S/D</p>
                            <Flatpickr
                                value={date2.format('DD-MM-YYYY')}
                                options={{
                                    dateFormat: 'd-m-Y',
                                }}
                                className="form-input"
                                style={{ fontSize: 11, width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}
                                onChange={(date) => handleTgl(moment(date[0]), 'tanggalAkhir')}
                            />
                        </div>

                        <label style={{ marginTop: -1 }} className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isGudangChecked} onChange={() => setIsGudangChecked(!isGudangChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Gudang Asal</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11 }} id="gudang_asal" className="form-select" onChange={handleGudangChangeAsal} value={selectedOptionGudang}>
                                <option value="" disabled hidden>
                                    {'--Silahkan Pilih--'}
                                </option>
                                {apiResponseGudang.map((data: any) => (
                                    <option key={data.kode_gudang} value={data.nama_gudang}>
                                        {data.nama_gudang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isGudangCheckedTujuan} onChange={() => setIsGudangCheckedTujuan(!isGudangCheckedTujuan)} />
                            <span style={{ fontWeight: 'bold' }}>Gudang Tujuan</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11 }} id="gudang_tujuan" className="form-select" onChange={handleGudangChangeTujuan} value={selectedOptionGudangTujuan}>
                                <option value="" disabled hidden>
                                    {'--Silahkan Pilih--'}
                                </option>
                                {apiResponseGudang.map((data: any) => (
                                    <option key={data.kode_gudang} value={data.nama_gudang}>
                                        {data.nama_gudang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isNopolChecked} onChange={() => setisNopolChecked(!isNopolChecked)} />
                            <span style={{ fontWeight: 'bold' }}>No. Kendaraan</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11 }} id="nopol" className="form-select" onChange={handleNoKendaraanInputChange} value={nopolValue}>
                                <option value="" disabled hidden>
                                    {'--Silahkan Pilih--'}
                                </option>
                                {apiResponseNopol.map((data: any) => (
                                    <option key={data.nopol} value={data.nopol}>
                                        {data.nopol}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="mt-3 flex cursor-pointer items-center">
                            <input type="checkbox" className="form-checkbox" checked={isViaChecked} onChange={() => setisViaChecked(!isViaChecked)} />
                            <span style={{ fontWeight: 'bold' }}>Via (Ekspedisi)</span>
                        </label>
                        <div>
                            <select style={{ fontSize: 11 }} id="kelompok" className="form-select" onChange={handleViaSelectChange} value={viaValue}>
                                <option value="" disabled hidden>
                                    {'--Silahkan Pilih--'}
                                </option>
                                {apiResponseVia.map((data: any) => (
                                    <option key={data.via} value={data.via}>
                                        {data.via}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="font-bold">
                                <span style={{ fontWeight: 'bold' }}>DO Pabrik</span>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" name="default_text_color" id="ya" className="form-radio" checked={selectedRadioDOPabrik === 'ya'} onChange={handleDOPabrik} />
                                <label htmlFor="ya" className="ml-1" style={{ marginBottom: -2 }}>
                                    Ya
                                </label>

                                <input type="radio" name="default_text_color" id="tidak" className="form-radio ml-2" checked={selectedRadioDOPabrik === 'tidak'} onChange={handleDOPabrik} />
                                <label htmlFor="tidak" className="ml-1" style={{ marginBottom: -2 }}>
                                    Tidak
                                </label>

                                <input type="radio" name="default_text_color" id="semua" className="form-radio ml-2" checked={selectedRadioDOPabrik === 'semua'} onChange={handleDOPabrik} />
                                <label htmlFor="semua" className="ml-1" style={{ marginBottom: -2 }}>
                                    Semua
                                </label>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center">
                            <div className="font-bold">Jenis MB</div>
                        </div>
                        <div>
                            <div className="flex" style={{}}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="Expedisi Kirim Langsung"
                                            checked={selectedRadioJenisMB === 'Expedisi Kirim Langsung'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Ekspedisi Kirim Langsung</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex" style={{ marginTop: -2 }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="Expedisi Kirim Gudang"
                                            checked={selectedRadioJenisMB === 'Expedisi Kirim Gudang'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Ekspedisi Kirim Gudang</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex" style={{ marginTop: -2 }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="Mobil Sendiri Kirim Langsung"
                                            checked={selectedRadioJenisMB === 'Mobil Sendiri Kirim Langsung'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Mobil Sendiri Kirim Langsung</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex" style={{ marginTop: -2 }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="Mobil Sendiri Kirim Gudang"
                                            checked={selectedRadioJenisMB === 'Mobil Sendiri Kirim Gudang'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Mobil Sendiri Kirim Gudang</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex" style={{ marginTop: -2 }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="Mutasi Barang Antar Gudang"
                                            checked={selectedRadioJenisMB === 'Mutasi Barang Antar Gudang'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Mutasi Barang Antar Gudang</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex" style={{ marginTop: -2 }}>
                                <div>
                                    <label className="inline-flex">
                                        <input
                                            type="radio"
                                            name="customer_classification"
                                            className="form-radio"
                                            value="all"
                                            checked={selectedRadioJenisMB === 'all'}
                                            onChange={handleRadioJenisMB}
                                            style={{ marginTop: 2 }}
                                        />
                                        <span className="ml-2">Semua</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-1 space-y-1">
                            <label className="flex cursor-pointer items-center">
                                <input type="checkbox" className="form-checkbox" checked={isBatalDOChecked} onChange={() => setisBatalDOChecked(!isBatalDOChecked)} />
                                <span style={{ color: '#8b1111', fontWeight: 'bold' }}>Pembatalan DO Pabrik</span>
                            </label>
                        </div>

                        <div className="mt-5 flex justify-center">
                            <ButtonComponent
                                style={{ backgroundColor: 'rgb(59 63 92)' }}
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-medium e-refresh"
                                content="Refresh Data"
                                onClick={() => handleRefreshData()}
                            />
                        </div>
                        {/* </form> */}
                    </div>
                )}
                <div className="panel" style={{ background: '#dedede', width: panelVisible ? '85%' : '100%' }}>
                    <div>
                        <GridComponent
                            id="gridListData"
                            locale="id"
                            ref={(g) => (gridListData = g)}
                            dataSource={recordsData}
                            allowExcelExport={true}
                            excelExportComplete={ExportComplete}
                            allowPdfExport={true}
                            pdfExportComplete={ExportComplete}
                            height={600}
                            width={'100%'}
                            gridLines={'Both'}
                            allowPaging={true}
                            // pageSettings={pageSettings}
                            allowSorting={true}
                            selectionSettings={{ type: 'Single' }}
                            rowSelected={handleRowSelected}
                            recordDoubleClick={() => {
                                handleNavigateLink('edit');
                                setStatusEdit(true);
                            }}
                            rowHeight={23}
                            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                            queryCellInfo={queryCellInfoListData}
                            rowDataBound={rowDataBoundListData}
                            allowResizing={true}
                            autoFit={true}
                            // rowDeselected={(args) => setSelectedRow('')}
                            // toolbar={['Search']}
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="no_mb" headerText="No. MB" width="110" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective valueAccessor={dateFormat} field="tgl_mb" headerText="Tanggal" width="120" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="gudang_asal" headerText="Gudang Asal" width="180" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="gudang_tujuan" headerText="Gudang Tujuan" width="180" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="keterangan" headerText="Keterangan" width="240" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective format="N2" field="total_berat" headerText="Total Berat" width="110" textAlign="Right" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="nopol" headerText="No. Kendaraan" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="no_reff" headerText="No. Referensi" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="no_kontrak" headerText="No. Kontrak Pabrik/Supplier" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="group_mb" headerText="Group MB" width="120" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="status" headerText="Status" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                <ColumnDirective field="jenis" headerText="Jenis MB" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                            </ColumnsDirective>
                            <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                        </GridComponent>
                        <ContextMenuComponent id="contextmenu" target=".e-gridheader" items={menuHeaderItems} select={menuHeaderSelect} animationSettings={{ duration: 500, effect: 'FadeIn' }} />
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
            {modalJenisTransaksi && (
                <DialogComponent
                    id="dialogJenisTransaksiMB"
                    name="dialogJenisTransaksiMB"
                    className="dialogJenisTransaksiMB"
                    target="#main-target"
                    header="Mutasi Barang"
                    visible={modalJenisTransaksi}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    // enableResize={true}
                    resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="17%" //"70%"
                    height="27%"
                    position={{ X: 'center', Y: 350 }}
                    style={{ position: 'fixed' }}
                    close={() => {
                        setModalJenisTransaksi(false);
                    }}
                    // buttons={buttonInputData}
                >
                    <div>
                        <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ Jenis Transaksi ]</span>
                    </div>
                    <hr style={{ marginBottom: 5 }}></hr>
                    <div style={{ padding: 10 }} className="flex items-center">
                        <RadioButtonComponent
                            id="1"
                            label="Mutasi Barang Antar Gudang"
                            name="size"
                            checked={jenisTransaksi === '1'}
                            change={() => changeModalJenisTransaksi('1')}
                            // ref={(radio1) => (radioInstanceTunai = radio1 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent
                            id="2"
                            label="DO Mobil Sendiri / Customer"
                            name="size"
                            checked={jenisTransaksi === '2'}
                            change={() => changeModalJenisTransaksi('2')}
                            // ref={(radio3) => (radioInstanceTransfer = radio3 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent
                            id="3"
                            label="DO Ekspedisi - Kirim Gudang"
                            name="size"
                            checked={jenisTransaksi === '3'}
                            change={() => changeModalJenisTransaksi('3')}
                            // ref={(radio3) => (radioInstanceWarkat = radio3 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent
                            id="4"
                            label="DO Ekspedisi - Kirim Langsung"
                            name="size"
                            checked={jenisTransaksi === '4'}
                            change={() => changeModalJenisTransaksi('4')}
                            // ref={(radio3) => (radioInstanceWarkat = radio3 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => handleNavigateLink(jenisTransaksi)}>
                            OK
                        </ButtonComponent>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => setModalJenisTransaksi(false)}>
                            Batal
                        </ButtonComponent>
                    </div>
                </DialogComponent>
            )}
            {modalJenisDOMobil && (
                <DialogComponent
                    id="dialogJenisDoMobil"
                    name="dialogJenisDoMobil"
                    className="dialogJenisDoMobil"
                    target="#main-target"
                    header="Jenis Transaksi"
                    visible={modalJenisDOMobil}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    // enableResize={true}
                    resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="12%" //"70%"
                    height="21%"
                    position={{ X: 'center', Y: 350 }}
                    style={{ position: 'fixed' }}
                    close={() => {
                        setModalJenisDOMobil(false);
                    }}
                    // buttons={buttonInputData}
                >
                    <div>
                        <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ DO Mobil Sendiri / Customer ]</span>
                    </div>
                    <hr style={{ marginBottom: 5 }}></hr>
                    <div style={{ padding: 10 }} className="flex items-center">
                        <RadioButtonComponent
                            id="1"
                            label="Kirim Gudang"
                            name="size"
                            checked={jenisDOmobil === 'KG'}
                            change={() => changeModalJenisTransaksiDOmobil('KG')}
                            // ref={(radio1) => (radioInstanceTunai = radio1 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent
                            id="2"
                            label="Kirim Langsung"
                            name="size"
                            checked={jenisDOmobil === 'KL'}
                            change={() => changeModalJenisTransaksiDOmobil('KL')}
                            // ref={(radio3) => (radioInstanceTransfer = radio3 as RadioButtonComponent)}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => handleNavigateLinkDOmobil(jenisDOmobil)}>
                            OK
                        </ButtonComponent>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => setModalJenisDOMobil(false)}>
                            Batal
                        </ButtonComponent>
                    </div>
                </DialogComponent>
            )}
            {modalMutasiBarang && (
                <ModalMutasiBarangAntarGudang
                    userid={userid}
                    kode_entitas={kode_entitas}
                    isOpen={modalMutasiBarang}
                    onClose={() => {
                        setModalMutasiBarang(false);
                        setStatusEdit(false);
                    }}
                    kode_user={kode_user}
                    status_edit={statusEdit}
                    kode_mb_edit={selectedRow !== '' ? selectedRow.kode_mb : ''}
                    onRefresh={() => handleRefreshData()}
                />
            )}
            {modalDOMobilSendiriCustomer && (
                <ModalDOMobilSendiriCustomer
                    userid={userid}
                    kode_entitas={kode_entitas}
                    isOpen={modalDOMobilSendiriCustomer}
                    onClose={() => {
                        setModalDOMobilSendiriCustomer(false);
                    }}
                    kode_user={kode_user}
                    status_edit={statusEdit}
                    fbm_kode_group={selectedRow !== '' ? selectedRow.fbm_kode_group : ''} // tambah kondisi jika fbm_kode_group kosong, berarti pembatalan
                    kode_mb_edit={selectedRow !== '' ? selectedRow.kode_mb : ''}
                    jenisDO={jenisDOmobil}
                    onRefresh={() => handleRefreshData()}
                />
            )}
            {modalDOPabrikEkspedisi && (
                <ModalDOPabrikEkspedisi
                    userid={userid}
                    kode_entitas={kode_entitas}
                    isOpen={modalDOPabrikEkspedisi}
                    onClose={() => {
                        setModalDOPabrikEkspedisi(false);
                    }}
                    kode_user={kode_user}
                    status_edit={statusEdit}
                    fbm_kode_group={selectedRow !== '' ? selectedRow.fbm_kode_group : ''}
                    kode_mb_edit={selectedRow !== '' ? selectedRow.kode_mb : ''}
                    jenisDO={jenisDOPabrikEkspedisi}
                    onRefresh={() => handleRefreshData()}
                />
            )}
            {modalDOPabrikPembatalan && (
                <ModalDOPabrikPembatalan
                    userid={userid}
                    kode_entitas={kode_entitas}
                    isOpen={modalDOPabrikPembatalan}
                    onClose={() => {
                        setModalDOPabrikPembatalan(false);
                    }}
                    kode_user={kode_user}
                    status_edit={statusEdit}
                    kode_mb_edit={selectedRow !== '' ? selectedRow.kode_mb : ''}
                    jenisDO={selectedRow.jenis_mb}
                    onRefresh={() => handleRefreshData()}
                />
            )}
        </div>
    );
};
// export { getServerSideProps };

export default MutasiBarangList;
