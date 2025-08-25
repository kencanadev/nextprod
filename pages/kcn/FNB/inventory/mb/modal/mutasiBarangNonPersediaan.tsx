import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import styles from './mbstyle.module.css';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Tab, TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import { formatNumber, frmNumber, generateNU, FillFromSQL, FirstDayInPeriod, tanpaKoma, fetchPreferensi } from '@/utils/routines';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import axios from 'axios';
import stylesTtb from '../mblist.module.css';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { overQTYAllCustom } from '../customFungsi/function';
import { useSession } from '@/pages/api/sessionContext';
L10n.load(idIDLocalization);

interface dialogMutasiBarangAntarGudang {
    userid: string;
    kode_entitas: any;
    isOpen: boolean;
    onClose: () => void;
    kode_user: any;
    status_edit: boolean;
    kode_mb_edit: any;
    onRefresh: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
let gridMBList: Grid | any;
let gridJURNALList: Grid | any;
let gridAkunJurnalList: Grid | any; //modal
let gridBarangList: Grid | any; //modal
let gridCustomerList: Grid | any; //modal
let gridSupplierList: Grid | any; //modal
let gridMBINList: Grid | any; //modal
let statusNolJurnal: string;

const MutasiBarangNonPersediaan: React.FC<dialogMutasiBarangAntarGudang> = ({ userid, kode_entitas, isOpen, onClose, kode_user, status_edit, kode_mb_edit, onRefresh }) => {
    const { sessionData, isLoading } = useSession();
        const nipUser = sessionData?.nip ?? '';

    const router = useRouter();
    const [listGudang, setListGudang] = useState([]);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [listVia, setApiResponseVia] = useState([]);
    const [searchNoItem, setSearchNoItem] = useState('');
    const [searchNoMBIN, setSearchNoMBIN] = useState('');
    const [searchNamaItem, setSearchNamaItem] = useState('');
    const [searchNoSupp, setSearchNoSupp] = useState('');
    const [searchNamaSupp, setSearchNamaSupp] = useState('');
    const [searchNoCust, setSearchNoCust] = useState('');
    const [searchNamaCust, setSearchNamaCust] = useState('');
    const [searchNamaSales, setSearchNamaSales] = useState('');
    const [searchNoAkun, setSearchNoAkun] = useState('');
    const [searchNamaAkun, setSearchNamaAkun] = useState('');
    const [modalDaftarBarang, setModalDaftarBarang] = useState(false);
    const [modalDaftarMBIN, setModalDaftarMBIN] = useState(false);
    const [selectedBarang, setSelectedBarang] = useState<any>('');
    const [selectedMBIN, setSelectedMBIN] = useState<any>('');
    const [selectedTab, setSelectedTab] = useState<any>('Barang');

    const [modalCustRow, setModalCustRow] = useState(false);
    const [modalSupplierRow, setModalSupplierRow] = useState(false);
    const [indexDataJurnal, setIndexDataJurnal] = useState('');
    const [modalAkunJurnal, setModalAkunJurnal] = useState(false);

    //HEADER
    const [NoMB, setNoMB] = useState('');
    const [selectedGudang, setSelectedGudang] = useState<any>('');
    const [selectedGudang2, setSelectedGudang2] = useState<any>(''); // gudang tujuan
    const [keterangan, setKeterangan] = useState<any>('');
    const [noReff, setNoReff] = useState<any>('');
    const [Via, setSelectedVia] = useState<any>('');
    const [noKendaraan, setNoKendaraan] = useState<any>('');
    const [alamatPengiriman, setAlamatPengiriman] = useState<any>('');
    const [selectedCust, setSelectedCust] = useState<any>('');
    const [selectedSupplier, setSelectedSupplier] = useState<any>('');
    const [selectedAkunJurnal, setSelectedAkunJurnal] = useState<any>('');
    const [UpdateDetail, setUpdateDetail] = useState<any>(false);

    //EDIT
    const [kodeMB, setKodeMB] = useState<any>('');
    const [tglMB, setTgl_MB] = useState<any>('');
    const [tglValuta, setTgl_Valuta] = useState<any>('');

    const [totalBerat, setTotalBerat] = useState<any>(0);
    const [totalNettoRP, setTotalNettoRP] = useState<any>(0);

    const [totalDebit, setTotalDebit] = useState<any>(0);
    const [totalKredit, setTotalKredit] = useState<any>(0);

    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [tambah, setTambah] = useState(false);
    const [edit, setEdit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
            target: '#dialogMBList',
        });
    };

    // DETAIL
    useEffect(() => {
        const Async = async () => {
            await FillFromSQL(kode_entitas, 'gudang', kode_user)
                .then((result: any) => {
                    setListGudang(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            await FillFromSQL(kode_entitas, 'departemen')
                .then((result: any) => {
                    const modifiedData = result.map((item: any) => ({
                        ...item,
                        dept_ku: item.no_dept_dept + ' - ' + item.nama_dept,
                        dept_ku2: item.kode_dept + '*' + item.no_dept_dept + ' - ' + item.nama_dept,
                    }));
                    setListDepartemen(modifiedData);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            const viaPengiriman = await axios.get(`${apiUrl}/erp/list_ekspedisi`, {
                params: {
                    entitas: kode_entitas,
                },
            });
            const apiVia = viaPengiriman.data.data;
            const transformedData_getvia = apiVia.map((item: any) => ({
                via: item.ekspedisi,
            }));
            setApiResponseVia(transformedData_getvia);

            console.log('edit', status_edit);

            //EDIT
            if (status_edit) {
                console.log('halo detail');

                const listHeaderDetail = await axios.get(`${apiUrl}/erp/master_detail_mb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kode_mb_edit,
                    },
                });
                if (listHeaderDetail.data.status === true) {
                    const dataEdit = listHeaderDetail.data.data[0];
                    console.log(dataEdit);
                    //HEADER
                    setNoMB(dataEdit.no_mb);
                    setSelectedGudang({ nama_gudang: dataEdit.gudang_asal, kode_gudang: dataEdit.kode_gudang });
                    setSelectedGudang2({ nama_gudang: dataEdit.gudang_tujuan, kode_gudang: dataEdit.kode_tujuan });
                    setKeterangan(dataEdit.keterangan);
                    setNoReff(dataEdit.no_reff);
                    setSelectedVia(dataEdit.via);
                    setNoKendaraan(dataEdit.nopol);
                    setAlamatPengiriman(dataEdit.alamat_kirim);
                    setSelectedCust({ kode_cust: dataEdit.kode_cust, nama_relasi: dataEdit.nama_relasi });
                    setSelectedSupplier({ kode_supp: dataEdit.kode_supp, nama_relasi: dataEdit.nama_supplier });

                    setTgl_MB(moment(dataEdit.tgl_mb).format('YYYY-MM-DD HH:mm:ss'));
                    setTgl_Valuta(moment(dataEdit.tgl_valuta).format('YYYY-MM-DD HH:mm:ss'));
                    setKodeMB(dataEdit.kode_mb);
                    // DETAIL
                    const modifiedDetail = dataEdit.detailMB.map((item: any) => ({
                        ...item,
                        no_barang: item.no_item,
                        nama_barang: item.nama_item,
                        berat: parseFloat(item.bobot) * parseFloat(item.qty_std),
                        berat_satuan: parseFloat(item.bobot),
                        // berat_satuan: 1, // ganti dengan berat_satuan // tidak perlu karena detail didisable
                    }));
                    gridMBList.dataSource = modifiedDetail;

                    const totalBerat = modifiedDetail.reduce((total: any, item: any) => {
                        return total + item.berat;
                    }, 0);

                    const totalNettoRP = modifiedDetail.reduce((total: any, item: any) => {
                        return total + parseFloat(item.jumlah_rp);
                    }, 0);
                    setTotalBerat(totalBerat);
                    setTotalNettoRP(totalNettoRP);
                    //DETAIL JURNAL
                    const detailJurnal = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: kode_mb_edit,
                        },
                    });
                    const modifiedDetailJurnal = detailJurnal.data.data.map((item: any) => ({
                        ...item,
                        debet_rp: parseFloat(item.debet_rp),
                        kredit_rp: parseFloat(item.kredit_rp),
                        jumlah_rp: parseFloat(item.jumlah_rp),
                        jumlah_mu: parseFloat(item.jumlah_mu),
                    }));
                    gridJURNALList.dataSource = modifiedDetailJurnal;
                } else {
                    console.log('gagal');
                }
            } else {
                generateNU(kode_entitas, '', '23', moment().format('YYYYMM'))
                    .then((result) => {
                        console.log(result);
                        setNoMB(result);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                const result = await fetchPreferensi(kode_entitas, apiUrl);
                setSelectedGudang({ nama_gudang: result[0].nama_gudang, kode_gudang: result[0].kode_gudang });
            }
        };
        Async();
    }, []);

    // ITEM
    useEffect(() => {
        const refreshDaftarBarang = async () => {
            try {
                // const response = await axios.get(`${apiUrl}/erp/list_barang_mb?`, {
                //     params: {
                //         entitas: kode_entitas,
                //         param1: searchNoItem,
                //         param2: searchNamaItem,
                //         param3: '25',
                //     },
                // });
                // const result = response.data;

                const response = await axios.get(`${apiUrl}/erp/list_barang_filter?`, {
                    params: {
                        entitas: kode_entitas,
                         param1: `%${searchNoItem}`,
                        param2: `%${searchNamaItem}`,
                        limit: '25',
                        tipe: 'Non Persediaan',
                    },
                });
                const result = response.data;
                console.log('Non Persediaan', result);

                if (result.status) {
                    gridBarangList.dataSource = result.data;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        refreshDaftarBarang();
    }, [searchNoItem, searchNamaItem]);

    //SUPPLIER
    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/m_supplier_filter`, {
                    params: { entitas: kode_entitas },
                });
                const responseListSupp = response.data.data.filter((item: any) => item.kelas === 'E');

                const lowerCaseSearchNoSupp = searchNoSupp.toLowerCase();
                const lowerCaseSearchNamaSupp = searchNamaSupp.toLowerCase();

                const filteredList = responseListSupp.filter(
                    (item: any) => item.no_supp.toLowerCase().includes(lowerCaseSearchNoSupp) && item.nama_relasi.toLowerCase().includes(lowerCaseSearchNamaSupp) && item.kelas === 'E'
                );

                const finalFilteredList = searchNoSupp === '' && searchNamaSupp === '' ? responseListSupp : filteredList;

                gridSupplierList.dataSource = finalFilteredList;
            } catch (error) {
                console.log(error);
            }
        };

        fetchSupplierData();
    }, [apiUrl, kode_entitas, searchNoSupp, searchNamaSupp]);

    //AKUN JURNAL
    useEffect(() => {
        const fetchSupplierDataJurnal = async () => {
            try {
                const responseAkunJurnal = await axios.get(`${apiUrl}/erp/akun_jurnal`, {
                    params: { entitas: kode_entitas },
                });

                const responseListAkun = responseAkunJurnal.data.data;

                const lowerCaseSearchNoAkun = searchNoAkun.toLowerCase();
                const lowerCaseSearchNamaAkun = searchNamaAkun.toLowerCase();

                const finalFilteredListAkun = responseListAkun.filter(
                    (item: any) => item.no_akun.toLowerCase().includes(lowerCaseSearchNoAkun) && item.nama_akun.toLowerCase().includes(lowerCaseSearchNamaAkun)
                );

                const listToSet = searchNoAkun === '' && searchNamaAkun === '' ? responseListAkun : finalFilteredListAkun;

                gridAkunJurnalList.dataSource = listToSet;
            } catch (error) {
                console.log(error);
            }
        };

        fetchSupplierDataJurnal();
    }, [searchNoAkun, searchNamaAkun]);

    // CUSTOMER
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const ListCustFilter = async (kode_entitas: string, param1: string, param2: string, param3: string) => {
                    const response = await axios.get(`${apiUrl}/erp/list_cust_so?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: param1,
                            param2: param2,
                            param3: param3,
                        },
                    });
                    const result = response.data;
                    return result;
                };
                const response = await ListCustFilter(kode_entitas, searchNamaCust, searchNoCust, searchNamaSales);

                if (response.status) {
                    gridCustomerList.dataSource = response.data;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchCustomerData();
    }, [searchNoCust, searchNamaCust, searchNamaSales]);

    //DAFTAR MB IN
    useEffect(() => {
        if (gridMBList.dataSource && gridMBList.dataSource.length > 0) {
            const fetchDaftarMBIN = async (kode_gudang: any, kode_item: any) => {
                try {
                    const response = await axios.get(`${apiUrl}/erp/list_ref_mb_in`, {
                        params: { entitas: kode_entitas, param1: kode_gudang, param2: kode_item },
                    });

                    const responseListMBIN = response.data.data;
                    const lowerCaseSearchNoMBIN = searchNoMBIN.toLowerCase();
                    const finalFilteredListMBIN = responseListMBIN.filter((item: any) => item.kustom2.toLowerCase().includes(lowerCaseSearchNoMBIN));
                    const listToSet = searchNoMBIN === '' ? responseListMBIN : finalFilteredListMBIN;
                    gridMBINList.dataSource = listToSet;
                    console.log(responseListMBIN);
                } catch (error) {
                    console.log(error);
                }
            };
            fetchDaftarMBIN(selectedGudang.kode_gudang, gridMBList.dataSource[selectedRowIndex].kode_item);
        } else {
            console.log('nothing');
        }
    }, [searchNoMBIN, selectedGudang, gridMBList, modalDaftarMBIN]);

    const dialogClose = () => {
        onClose();
    };

    const getFromModalBarang = async () => {
        await handleDetail_EndEdit();
        handleDetail_Add('selected');
        setModalDaftarBarang(false);
    };

    const handleDetail_Add = async (jenis: any) => {
        await handleDetail_EndEdit();
        const totalLine = gridMBList.dataSource.length;
        const isNoBarangNotEmpty = gridMBList.dataSource.every((item: any) => item.no_barang !== '');
        if (jenis === 'selected') {
            // buat blocking saat menambah barang dari modal
            const response = await axios.get(`${apiUrl}/erp/qty_stock_all?`, {
                params: {
                    entitas: kode_entitas,
                    param1: selectedBarang.kode_item,
                    param2: moment().format('YYYY-MM-DD HH:mm:ss'),
                    param3: selectedGudang.kode_gudang,
                    param4: '',
                    param5: 'mb', // mb
                },
            });
            const responseData = response.data.data[0];
            const Stok = responseData.stok;
            console.log(Stok);
            overQTYAllCustom(
                kode_entitas,
                selectedGudang.kode_gudang,
                selectedBarang.kode_item,
                moment().format('YYYY-MM-DD HH:mm:ss'),
                '',
                1,
                'mb',
                `Item : ${selectedBarang.no_item} - ${selectedBarang.nama_item} \n`,
                '#dialogMBList'
            ).then(async (result) => {
                if (result === true) {
                    console.log('tidak lolos');
                    document.getElementById('gridMBList')?.focus();
                    // myAlert(`Item : ${selectedBarang.no_item} - ${selectedBarang.nama_item} \nKuantitas barang (1) melebihi stok digudang asal (${Stok})`);
                } else {
                    console.log('lolos');
                    // hpp_
                    try {
                        const response = await axios.get(`${apiUrl}/erp/hpp_ps?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: selectedBarang.kode_item,
                                param2: 'all',
                                param3: selectedGudang.kode_gudang,
                            },
                        });
                        console.log({
                            entitas: kode_entitas,
                            param1: moment().format('YYYY-MM-DD HH:mm:ss'),
                            param2: selectedGudang ? selectedGudang.kode_gudang : 'all',
                            param3: selectedBarang.kode_item,
                        });
                        const result = response.data.data;
                        const harga_hpp = result[0].hpp !== undefined ? result[0].hpp : 0;
                        console.log('B');
                        const detailBarangBaru = {
                            kode_mb: '',
                            id_mb: totalLine,
                            kode_pmb: null,
                            id_pmb: null,
                            kode_item: selectedBarang.kode_item,
                            no_barang: selectedBarang.no_item,
                            nama_barang: selectedBarang.nama_item,
                            satuan: selectedBarang.satuan,
                            qty: 1,
                            sat_std: selectedBarang.satuan,
                            qty_std: 1,
                            harga_rp: harga_hpp,
                            jumlah_rp: 1 * harga_hpp,
                            berat: selectedBarang.berat,
                            berat_satuan: selectedBarang.berat,
                            hpp: harga_hpp,
                            no_kontrak: null,
                            kode_fpb: null,
                            id_fpb: null,
                            export: null,
                            no_refkontrak: null,
                            fbm_id_so: null,
                            fbm_kode_so: null,
                            nota: null,
                            berat_cetak: 0.0,
                            no_mbref: null,
                        };

                        gridMBList.dataSource[selectedRowIndex] = detailBarangBaru;
                        setTambah(true);
                        gridMBList.refresh();
                        return;
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            });
        } else if ((totalLine === 0 && jenis === 'new') || (isNoBarangNotEmpty && jenis === 'new')) {
            if (selectedGudang && selectedGudang2) {
                console.log('A');
                const detailBarangBaru = {
                    kode_mb: '',
                    id_mb: totalLine + 1,
                    kode_pmb: null,
                    id_pmb: null,
                    kode_item: '',
                    no_barang: '',
                    nama_barang: '',
                    satuan: '',
                    qty: 0.0,
                    sat_std: '',
                    qty_std: '',
                    harga_rp: '',
                    jumlah_rp: '',
                    berat: 0.0,
                    berat_satuan: 0.0,
                    hpp: '',
                    no_kontrak: null,
                    kode_fpb: null,
                    id_fpb: null,
                    export: null,
                    no_refkontrak: null,
                    fbm_id_so: null,
                    fbm_kode_so: null,
                    nota: null,
                    berat_cetak: 0.0,
                    no_mbref: null,
                };
                // nanti research saat add langsung posisi edit
                gridMBList.addRecord(detailBarangBaru, totalLine);
                setTimeout(() => {
                    gridMBList.startEdit(totalLine);
                }, 200);
                setTambah(true);
            } else {
                document.getElementById('gridMBList')?.focus();
                myAlert(`Silahkan pilih Gudang Asal & Gudang Tujuan terlebih dulu.`);
            }
        } else {
            document.getElementById('gridMBList')?.focus();
            myAlert(`Silahkan melengkapi data barang sebelum menambah data baru.`);
        }
    };

    // UNUSED
    const handleDetail_Edit = () => {
        console.log(gridMBList);
        const selectedRowIndex = gridMBList.selectedRowIndex;
        setSelectedRowIndex(selectedRowIndex);
        console.log(selectedRowIndex);

        if (selectedRowIndex > -1) {
            gridMBList.startEdit(selectedRowIndex);
            console.log(selectedRowIndex);
        } else {
            myAlert(`Silahkan pilih data barang terlebih dahulu.`);
        }
    };

    const handleDetail_Edit_Jurnal = () => {
        console.log(gridJURNALList);
        const selectedRowIndex = gridJURNALList.selectedRowIndex;
        // setSelectedRowIndex(selectedRowIndex);
        // console.log(selectedRowIndex);

        if (selectedRowIndex > -1) {
            gridJURNALList.startEdit(selectedRowIndex);
            console.log(selectedRowIndex);
        } else {
            myAlert(`Silahkan pilih data jurnal terlebih dahulu.`);
        }
    };
    // END UNUSED

    const handleDetail_EndEdit = async () => {
        gridMBList.endEdit();
    };

    const rowSelectingDetailBarang = (args: any) => {
        setSelectedRowIndex(args.rowIndex);
        console.log(args.rowIndex);
    };

    const actionBeginDetailBarang = async (args: any) => {
        console.log('BEGIN :' + args.requestType);
    };

    const actionCompleteDetailBarang = async (args: any) => {
        switch (args.requestType) {
            case 'save':
                if (tambah === false) {
                    const editedData = args.data;
                    gridMBList.dataSource[selectedRowIndex] = editedData;
                    gridMBList.refresh();
                    // KALKULASI
                    kalkulasi();
                    setUpdateDetail(true);
                    // }
                } else if (edit) {
                    console.log('SINI');
                    // KALKULASI 2
                    kalkulasi();
                    gridMBList.refresh();
                    setUpdateDetail(true);
                }
                break;
            case 'beginEdit':
                console.log('EDIT');
                setTambah(false);
                setEdit(true);
                break;
            case 'delete':
                gridMBList.dataSource.forEach((item: any, index: any) => {
                    item.id_mb = index + 1;
                });
                gridMBList.refresh();
                break;
            case 'refresh':
                console.log(gridMBList.dataSource.length);
                kalkulasi();
                console.log('REFRESH');
                setTambah(false);
                setEdit(false);
                break;
            default:
                break;
        }
        console.log('COMPLETED :' + args.requestType);
    };

    const actionBeginDetailJurnal = async (args: any) => {
        if (args.requestType === 'beginEdit') {
            if (args.rowData.debet_rp === 0) {
                statusNolJurnal = 'Debit';
            } else if (args.rowData.kredit_rp === 0) {
                statusNolJurnal = 'Kredit';
            }
        }
    };

    const actionCompleteDetailJurnal = async (args: any) => {
        switch (args.requestType) {
            case 'save':
                let editedData;
                console.log(statusNolJurnal);
                if (statusNolJurnal === 'Debit' && gridJURNALList.dataSource[args.rowIndex].debet_rp !== 0) {
                    editedData = { ...args.data, kredit_rp: 0 };
                    gridJURNALList.dataSource[args.rowIndex] = editedData;
                } else if (statusNolJurnal === 'Kredit' && gridJURNALList.dataSource[args.rowIndex].kredit_rp !== 0) {
                    editedData = { ...args.data, debet_rp: 0 };
                    gridJURNALList.dataSource[args.rowIndex] = editedData;
                }
                kalkulasiJurnal();
                gridJURNALList.refresh();
                break;
            case 'beginEdit':
                console.log('EDIT');
                break;
            case 'delete':
                break;
            case 'refresh':
                console.log('REFRESH');
                kalkulasiJurnal();
                break;
            default:
                break;
        }
        console.log('COMPLETED :' + args.requestType);
    };

    const kalkulasi = () => {
        if (status_edit == true) {
            console.log('tidak kalkulasi');
        } else {
            Promise.all(
                gridMBList.dataSource.map(async (item: any) => {
                    item.berat = item.qty * item.berat_satuan;
                    item.jumlah_rp = item.qty * item.harga_rp;
                })
            ).then(() => {
                const totalBerat = gridMBList.dataSource.reduce((total: any, item: any) => {
                    return total + item.berat;
                }, 0);

                const totalNettoRP = gridMBList.dataSource.reduce((total: any, item: any) => {
                    return total + item.jumlah_rp;
                }, 0);
                setTotalBerat(totalBerat);
                setTotalNettoRP(totalNettoRP);
            });
        }
    };

    const kalkulasiJurnal = () => {
        console.log('diekse');
        Promise.all(
            gridJURNALList.dataSource.map(async (item: any) => {
                item.jumlah_mu = item.debet_rp + item.kredit_rp;
                item.jumlah_rp = item.debet_rp + item.kredit_rp;
            })
        ).then(() => {
            const totalDebit = gridJURNALList.dataSource.reduce((total: any, item: any) => {
                return total + item.debet_rp;
            }, 0);
            const totalKredit = gridJURNALList.dataSource.reduce((total: any, item: any) => {
                return total + item.kredit_rp;
            }, 0);
            setTotalDebit(totalDebit);
            setTotalKredit(totalKredit);
        });
    };

    const DetailBarangDelete = () => {
        if (gridMBList.dataSource.length > 0) {
            withReactContent(Swal)
                .fire({
                    html: `Hapus data barang baris ${selectedRowIndex + 1}?`,
                    width: '15%',
                    target: '#dialogMBList',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        console.log(selectedRowIndex);
                        gridMBList.dataSource.splice(selectedRowIndex, 1);
                        gridMBList.dataSource.forEach((item: any, index: any) => {
                            item.id_mb = index + 1;
                        });
                        gridMBList.refresh();
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    const DetailBarangDeleteAll = () => {
        if (gridMBList.dataSource.length > 0) {
            withReactContent(Swal)
                .fire({
                    html: 'Hapus semua data barang?',
                    width: '15%',
                    target: '#dialogMBList',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                        gridMBList.refresh();
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    const DetailBarangDeleteAllJurnal = () => {
        if (gridJURNALList.dataSource.length > 0) {
            withReactContent(Swal)
                .fire({
                    html: 'Hapus semua data jurnal?',
                    width: '15%',
                    target: '#dialogMBList',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridJURNALList.dataSource = [];
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    //KEYBOARD
    useEffect(() => {
        if (status_edit !== true) {
            const handleKeyPress = (event: KeyboardEvent) => {
                console.log(selectedTab);
                if (selectedTab === 'Barang') {
                    if (event.key === 'Insert') {
                        handleDetail_Add('new');
                    } else if (event.key === 'Delete') {
                        DetailBarangDeleteAll();
                    } else if (event.key === 'Enter') {
                        gridMBList.endEdit();
                    }
                } else if (selectedTab === 'Jurnal') {
                    if (event.key === 'Insert') {
                        console.log('Insert key pressed');
                    } else if (event.key === 'Delete') {
                        DetailBarangDeleteAllJurnal();
                    } else if (event.key === 'Enter') {
                        gridJURNALList.endEdit();
                    }
                }
            };

            document.addEventListener('keydown', handleKeyPress);

            return () => {
                document.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, []);

    //================ Editing template untuk kolom grid detail barang ==================
    const editTemplateMasterItem_No = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="noitem" name="noitem" className="noitem" value={args.no_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    // gridMBList.refresh();
                                    setModalDaftarBarang(true);
                                }}
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
                        <TextBoxComponent id="namaitem" name="namaitem" className="namaitem" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    // console.log('ABC');
                                    // gridMBList.refresh();
                                    setModalDaftarBarang(true);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateMasterItem_Ref_MB_in = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_mbref" name="no_mbref" className="no_mbref" value={args.no_mbref} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="no_mbref1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (gridMBList.dataSource[selectedRowIndex].nama_barang === '') {
                                        myAlert(`Nama barang belum diisi.`);
                                    } else {
                                        // fetchDaftarMBIN(selectedGudang.kode_gudang, gridMBList.dataSource[selectedRowIndex].kode_item);
                                        setModalDaftarMBIN(true);
                                    }
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateSubLedger = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.nama_barang} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    console.log('ICO only');
                                    // setModalDaftarBarang(true);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateDepartemen = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                {/* <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.departemen} readOnly={true} showClearButton={false} /> */}
                <DropDownListComponent
                    id="dept"
                    name="dept"
                    dataSource={listDepartemen}
                    fields={{ value: 'dept_ku2', text: `dept_ku` }}
                    floatLabelType="Never"
                    placeholder={args.departemen}
                    onChange={(e: any) => {
                        // console.log(e);
                        gridJURNALList.dataSource[args.index] = { ...gridJURNALList.dataSource[args.index], kode_dept: e.value.split(/\*/)[0], departemen: e.value.split(/\*/)[1] };
                        gridJURNALList.refresh();
                        // console.log(gridJURNALList.dataSource[args.index]);
                    }}
                />
            </div>
        );
    };

    const editTemplateMasterItem_No_Akun = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.no_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    setModalAkunJurnal(true);
                                    console.log(args.index);
                                    setIndexDataJurnal(args.index);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const editTemplateMasterItem_Nama_Akun = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_sj_add" name="no_sj_add" className="no_sj_add" value={args.nama_akun} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem2"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    setModalAkunJurnal(true);
                                    console.log(args.index);
                                    setIndexDataJurnal(args.index);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const templateNoAkun = (args: any) => {
        return <div style={{ fontWeight: args.header === 'Y' ? 'bold' : 'normal' }}>{args.no_akun}</div>;
    };

    const templateNamaAkun = (args: any) => {
        return <div style={{ fontWeight: args.header === 'Y' ? 'bold' : 'normal' }}>{args.nama_akun}</div>;
    };

    const autoJurnal = async () => {
        try {
            const result = await fetchPreferensi(kode_entitas, apiUrl);
            console.log(result[0].kode_akun_non_persediaan);
            const AkunPersediaan = await axios.get(`${apiUrl}/erp/akun_jurnal_by_id?`, {
                params: {
                    entitas: kode_entitas,
                    param1: result[0].kode_akun_non_persediaan,
                    param2: 'all',
                    param3: 'all',
                },
            });
            const resAkunPersediaan = AkunPersediaan.data.data[0];
            console.log('goblin', resAkunPersediaan);

            //blocking jika gridMBList.dataSource. lenght = 0 atau belum ubah
            // if (gridMBList.dataSource.length === 0 || gridMBList.dataSource.every((item: any) => item.no_barang === '')) {
            if (gridMBList.dataSource.length === 0 || gridMBList.dataSource.some((item: any) => !item.no_barang.trim())) {
                document.getElementById('gridMBList')?.focus();
                myAlert(`Silahkan isi data barang terlebih dulu.`);
            } else {
                console.log(gridMBList.dataSource.length);
                console.log(gridMBList.dataSource);
                const json = {
                    kode_dokumen: '',
                    id_dokumen: 1,
                    dokumen: 'MB',
                    tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: resAkunPersediaan.kode_akun,
                    no_akun: resAkunPersediaan.no_akun,
                    nama_akun: resAkunPersediaan.nama_akun,
                    tipe: resAkunPersediaan.tipe,
                    kode_subledger: null,
                    kurs: 1.0,
                    debet_rp: parseFloat(totalNettoRP.toFixed(2)),
                    kredit_rp: 0,
                    jumlah_rp: parseFloat(totalNettoRP.toFixed(2)),
                    jumlah_mu: parseFloat(totalNettoRP.toFixed(2)),
                    catatan: `Mutasi barang dari gudang ${selectedGudang.nama_gudang}`,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0.0,
                    kode_dept: null,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                };
                const json2 = {
                    kode_dokumen: '',
                    id_dokumen: 2,
                    dokumen: 'MB',
                    tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: resAkunPersediaan.kode_akun,
                    no_akun: resAkunPersediaan.no_akun,
                    nama_akun: resAkunPersediaan.nama_akun,
                    tipe: resAkunPersediaan.tipe,
                    kode_subledger: null,
                    kurs: 1.0,
                    debet_rp: 0,
                    kredit_rp: parseFloat(totalNettoRP.toFixed(2)),
                    jumlah_rp: (parseFloat(totalNettoRP) * -1).toFixed(2),
                    jumlah_mu: (parseFloat(totalNettoRP) * -1).toFixed(2),
                    catatan: `Mutasi barang ke gudang ${selectedGudang2.nama_gudang}`,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0.0,
                    kode_dept: null,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                };

                const combinedArray = [];

                combinedArray.push(json);
                combinedArray.push(json2);

                gridJURNALList.dataSource = combinedArray;
                gridJURNALList.refresh();
                setUpdateDetail(false);
            }
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
        }
    };

    const saveDoc = async (alertAllowAppDate: any) => {
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            const formatPeriode = moment(periode).format('YYYY-MM-DD');
            // =====BLOCKING SAVE=====
            // GUDANG SAMA
            if (selectedGudang.kode_gudang === selectedGudang2.kode_gudang) {
                myAlert(`Gudang asal dan Gudang tujuan tidak boleh sama.`);
                // DATA DETAIL KOSONG
            } else if (gridMBList.dataSource.length === 0) {
                myAlert(`Data barang belum diisi.`);
                //PEDIODE AKUNTANSI
            } else if (moment().format('YYYY-MM-DD') < formatPeriode) {
                myAlert(`Tanggal transaksi tidak dalam periode akuntansi.`);
                // SELISIH JURNAL
            } else if (totalDebit - totalKredit !== 0) {
                myAlert(`Jurnal masih ada selisih.`);
            } else if (UpdateDetail) {
                myAlert(`Dokumen mutasi barang telah diperbaharui, periksa kembali jurnal.`);
            } else if (alertAllowAppDate) {
                const confirmMessage = `Tgl. Dokumen lebih kecil dari hari ini, transaksi mutasi barang dilanjutkan.`;
                if (!confirm(confirmMessage)) {
                    return;
                } else {
                    saveDoc(false); // dizinkan
                }
            } else {
                if (isSaving) return; // Menghindari double input
                setIsSaving(true);
                //tutup proses edit berjalan
                handleDetail_EndEdit();

                //?Detail Barang
                const modifiedDetailJson: any = gridMBList.dataSource.map((item: any) => ({
                    ...item,
                    qty_std: item.qty,
                }));

                //?Detail Jurnal
                const modifiedDetailJurnal = gridJURNALList.dataSource.map((item: any) => ({
                    ...item,
                    tgl_dokumen: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                }));

                let defaultNoMB: any;
                if (status_edit !== true) {
                    const fromAPI = await generateNU(kode_entitas, '', '23', moment().format('YYYYMM'));
                    defaultNoMB = fromAPI;
                    console.log(defaultNoMB);
                } else {
                    defaultNoMB = NoMB;
                    console.log(defaultNoMB);
                }

                //?Header Detail & Jurnal
                const JSON = {
                    entitas: kode_entitas,
                    pembatalan: 'N',
                    header: [
                        {
                            kode_mb: status_edit == true ? kodeMB : '',
                            no_mb: defaultNoMB,
                            tgl_mb: status_edit == true ? tglMB : moment().format('YYYY-MM-DD HH:mm:ss'), // diisi current datetime
                            tgl_valuta: status_edit == true ? tglValuta : moment().format('YYYY-MM-DD HH:mm:ss'), // diisi current datetime
                            kode_gudang: selectedGudang.kode_gudang,
                            kode_tujuan: selectedGudang2.kode_gudang,
                            netto_rp: totalNettoRP,
                            total_berat: totalBerat,
                            keterangan: keterangan,
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            persediaan: 'Non Persediaan',
                            no_reff: noReff,
                            kode_supp: selectedSupplier.kode_supp === undefined ? null : selectedSupplier.kode_supp,
                            kode_cust: selectedCust.kode_cust === undefined ? null : selectedCust.kode_cust,
                            nopol: noKendaraan,
                            via: Via,
                            alamat_kirim: alamatPengiriman,
                            kontrak: 'N',
                            status_export: null,
                            kode_gudang_cabang: null,
                            nama_gudang_cabang: null,
                            fdo: null,
                            ekspedisi: 'Y', // MKG default Y // MB N
                            toleransi: 0.0,
                            harga_eks: 0.0,
                            harga_tambahan: 0.0,
                            jenis_mobil: null, //MKG // MB default null
                            jenis_kirim: null, // MB default null
                            fbm: null,
                            fbm_no_so: null,
                            fbm_kode_group: null, // MB default //MKB diisi dibackend
                            fbm_no_group: 0, //MKG  //MB default
                            finalisasi: 'N',
                            pengajuan: 0,
                            approval: 'N',
                            tgl_finalisasi: null,
                            tgl_pengajuan: null,
                            tgl_update_app: null,
                            user_pengajuan: null,
                            user_approval: null,
                            jenis_mb: 'MBNP', // kirim gudang //MB untuk MB
                            pengemudi: '',
                            do_kode_sj: '',
                            detail: modifiedDetailJson,
                            jurnal: modifiedDetailJurnal,
                        },
                    ],
                };
                console.log('JSONSIMPAN', JSON);
                if (status_edit == true) {
                    //EDIT API
                    let kondisiStok = 'true';

                    for (const element of modifiedDetailJson) {
                        const result = await overQTYAllCustom(
                            kode_entitas,
                            selectedGudang.kode_gudang,
                            element.kode_item,
                            moment().format('YYYY-MM-DD HH:mm:ss'),
                            '',
                            1,
                            'mb',
                            `Item : ${element.no_item} - ${element.nama_item} \n`,
                            '#dialogMBList'
                        );

                        if (result === true) {
                            console.log('tidak lolos');
                            document.getElementById('gridMBList')?.focus();
                            kondisiStok = 'false';
                            break; // stop loop kalau tidak lolos
                        }
                    }

                    console.log('kondisiStok', kondisiStok);
                    if (kondisiStok == 'false') {
                        return;
                    } else {
                        console.log(JSON);
                        var responseAPI = await axios.patch(`${apiUrl}/erp/update_mb`, JSON);
                    }
                } else {
                    //SAVE API
                    let kondisiStok = 'true';

                    for (const element of modifiedDetailJson) {
                        const result = await overQTYAllCustom(
                            kode_entitas,
                            selectedGudang.kode_gudang,
                            element.kode_item,
                            moment().format('YYYY-MM-DD HH:mm:ss'),
                            '',
                            1,
                            'mb',
                            `Item : ${element.no_item} - ${element.nama_item} \n`,
                            '#dialogMBList'
                        );

                        if (result === true) {
                            console.log('tidak lolos');
                            document.getElementById('gridMBList')?.focus();
                            kondisiStok = 'false';
                            break; // stop loop kalau tidak lolos
                        }
                    }

                    console.log('kondisiStok', kondisiStok);
                    var responseAPI = await axios.post(`${apiUrl}/erp/simpan_mb`, JSON);
                }
                if (responseAPI.data.status === true) {
                    //SETELAH BERHASIL COUNTER NO MB
                    if (status_edit !== true) {
                        await generateNU(kode_entitas, NoMB, '23', moment().format('YYYYMM'));
                    }
                    //AUDIT
                    const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                        entitas: kode_entitas,
                        kode_audit: null,
                        dokumen: 'MB',
                        kode_dokumen: status_edit == true ? kodeMB : responseAPI.data.data[0],
                        no_dokumen: NoMB,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: status_edit == true ? 'EDIT' : 'NEW',
                        diskripsi: `MB Non Persediaan item = ${gridMBList.dataSource.length}  nilai transaksi ${totalNettoRP.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        userid: userid, // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    });
                    const simpanCetakTTD = await axios.post(`${apiUrl}/erp/simpan_cetakttd`, {
                                                                                            "entitas": kode_entitas,
                                                                                            kode_dokumen: status_edit == true ? kodeMB : responseAPI.data.data[0],
                                                                                            "nip1": nipUser,
                                                                                            "nip2": null,
                                                                                            "nip3": null,
                                                                                            "nip4": null,
                                                                                            "nip5": null,
                                                                                            "nip6": null
                                                                                        });
                    console.log(auditResponse, 'auditResponse');
                    withReactContent(swal)
                        .fire({
                            title: ``,
                            html:
                                status_edit == true
                                    ? '<p style="font-size:12px">Perubahan Data Mutasi Barang Non Persediaan berhasil disimpan</p>'
                                    : '<p style="font-size:12px">Data Mutasi Barang berhasil disimpan</p>',
                            target: '#dialogMBList',
                            icon: 'success',
                            width: '350px',
                            heightAuto: true,
                            showConfirmButton: false,
                            timer: 1500,
                        })
                        .then(() => {
                            onRefresh();
                            onClose();
                        });
                } else {
                    withReactContent(swal).fire({
                        title: ``,
                        html:
                            status_edit == true
                                ? '<p style="font-size:12px">Perubahan Data Mutasi  Barang Non Persediaan gagal disimpan</p>'
                                : '<p style="font-size:12px">Data Mutasi Barang gagal disimpan</p>',
                        target: '#dialogMBList',
                        icon: 'error',
                        width: '350px',
                        heightAuto: true,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            }
        } catch (error) {
            withReactContent(swal).fire({
                title: ``,
                html:
                    status_edit == true
                        ? '<p style="font-size:12px">Perubahan Data Mutasi  Barang Non Persediaan gagal disimpan</p>'
                        : '<p style="font-size:12px">Data Mutasi Barang gagal disimpan</p>',
                target: '#dialogMBList',
                icon: 'error',
                width: '350px',
                heightAuto: true,
                showConfirmButton: false,
                timer: 1500,
            });
        } finally {
            setIsSaving(false); // Setelah proses penyimpanan selesai
        }
    };

    useEffect(() => {
            const dialogElement = document.getElementById('dialogMBList');
            if (dialogElement) {
                dialogElement.style.maxHeight = 'none';
                dialogElement.style.maxWidth = 'none';
            }
        }, []);

    return (
        <DialogComponent
            id="dialogMBList"
            isModal={true}
            width="95%"
            height="70%"
            visible={isOpen}
            close={() => {
                console.log('closeDialog');
                //hapus
                dialogClose();
                gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                gridMBList.refresh();
            }}
            header={status_edit === false ? 'Mutasi Barang Non Persediaan' : 'Mutasi Barang Non Persediaan (EDIT)'}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            // target="#main-target"
            enableResize={true}
        >
            <div style={{ minWidth: '70%', overflow: 'auto' }}>
                <div>
                    <div>
                        {/* ===============  Master Header Data ========================   */}
                        <div className="mb-1" style={{ padding: 10, marginTop: -5 }}>
                            <div className="panel-tabel" style={{ width: '70%' }}>
                                <table className={styles.table} style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Tanggal</th>
                                            <th style={{ width: '15%' }}>No. MB</th>
                                            <th style={{ width: '25%' }}>Gudang Asal</th>
                                            <th style={{ width: '25%' }}>Gudang Tujuan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <DatePickerComponent
                                                    style={{ fontSize: '12px', height: '10px', textAlign: 'center' }}
                                                    locale="id"
                                                    cssClass="e-custom-style"
                                                    placeholder="Tgl. PP"
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={status_edit ? tglMB : new Date()} // Menggunakan objek Date untuk menetapkan nilai awal
                                                    readOnly
                                                >
                                                    {/* <Inject services={[MaskedDateTime]} /> */}
                                                </DatePickerComponent>
                                            </td>
                                            <td>
                                                <div className="container">
                                                    <TextBoxComponent style={{ fontSize: '12px', textAlign: 'center' }} placeholder="No. MB" value={NoMB} readonly />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex">
                                                    <DropDownListComponent
                                                        style={{ fontSize: '12px' }}
                                                        id="gudangAsal"
                                                        className="form-select"
                                                        dataSource={listGudang.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                        fields={{ value: 'value' }}
                                                        value={selectedGudang.nama_gudang}
                                                        placeholder={status_edit == true ? selectedGudang.nama_gudang : '-- Silahkan pilih gudang asal --'}
                                                        select={(e) => {
                                                            console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            setSelectedGudang({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            handleDetail_EndEdit();
                                                        }}
                                                        readonly={status_edit == true ? true : false}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex">
                                                    <DropDownListComponent
                                                        style={{ fontSize: '12px' }}
                                                        id="gudang"
                                                        className="form-select"
                                                        dataSource={listGudang.map((data: any) => ({ value: data.nama_gudang, kode_gudang: data.kode_gudang }))}
                                                        fields={{ value: 'value' }}
                                                        value={selectedGudang2.nama_gudang}
                                                        placeholder={status_edit == true ? selectedGudang2.nama_gudang : '-- Silahkan pilih gudang tujuan --'}
                                                        select={(e) => {
                                                            console.log({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            setSelectedGudang2({ nama_gudang: e.itemData.value, kode_gudang: e.itemData.kode_gudang });
                                                            handleDetail_EndEdit();
                                                        }}
                                                        readonly={status_edit == true ? true : false}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* ===============  Detail Data ========================   */}
                        <div className="panel-tab" style={{ background: '#f0f0f0', width: '100%', height: '390px', marginTop: -5, borderRadius: 10 }}>
                            <TabComponent
                                // ref={(t) => (tabTtbList = t)}
                                selectedItem={0}
                                animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                height="100%"
                            >
                                <div className="e-tab-header" style={{ display: 'flex' }}>
                                    <div
                                        onClick={() => setSelectedTab('Barang')}
                                        tabIndex={0}
                                        style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                    >
                                        Data Barang
                                    </div>
                                    <div
                                        onClick={() => setSelectedTab('Jurnal')}
                                        tabIndex={1}
                                        style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                    >
                                        Jurnal
                                    </div>
                                </div>

                                {/*===================== Content menampilkan data barang =======================*/}
                                <div className="e-content">
                                    {/* //DATA BARANG */}
                                    <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                        <TooltipComponent
                                            // ref={(t) => (tooltipDetailBarang = t)}
                                            // beforeRender={beforeRenderDetailBarang}
                                            openDelay={1000}
                                            target=".e-headertext"
                                        >
                                            <GridComponent
                                                id="gridMBList"
                                                name="gridMBList"
                                                className="gridMBList"
                                                locale="id"
                                                ref={(g: any) => (gridMBList = g)}
                                                // dataSource={dataBarang.nodes}
                                                editSettings={{
                                                    allowAdding: status_edit == true ? false : true,
                                                    allowEditing: status_edit == true ? false : true,
                                                    // allowDeleting: status_edit == true ? false : true,
                                                    newRowPosition: 'Bottom',
                                                }}
                                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                allowResizing={true}
                                                autoFit={true}
                                                rowHeight={22}
                                                height={170} //170 barang jadi 150 barang produksi
                                                gridLines={'Both'}
                                                actionBegin={actionBeginDetailBarang}
                                                actionComplete={actionCompleteDetailBarang}
                                                rowSelecting={rowSelectingDetailBarang}
                                                created={() => {}}
                                                allowKeyboard={false}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective field="id_mb" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                    <ColumnDirective
                                                        field="no_barang"
                                                        // isPrimaryKey={true}
                                                        headerText="No. Barang"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="170"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateMasterItem_No}
                                                    />
                                                    <ColumnDirective
                                                        field="nama_barang"
                                                        // isPrimaryKey={true}
                                                        headerText="Nama Barang"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="350"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateMasterItem_Nama}
                                                    />
                                                    <ColumnDirective
                                                        field="satuan"
                                                        // editTemplate={editTemplateSatuan}
                                                        headerText="Satuan"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="80"
                                                        clipMode="EllipsisWithTooltip"
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="qty"
                                                        format="N2"
                                                        // editType="numericedit"
                                                        // edit={qtyParams}
                                                        //editTemplate={editTemplateQty}
                                                        headerText="Kuantitas"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        width="80"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="berat"
                                                        format="N2"
                                                        headerText="Berat (Kg)"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        width="80"
                                                        clipMode="EllipsisWithTooltip"
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="no_mbref"
                                                        headerText="Referensi Mutasi Barang (IN)"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="316"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateMasterItem_Ref_MB_in}
                                                    />
                                                </ColumnsDirective>

                                                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                            </GridComponent>
                                        </TooltipComponent>
                                        <div style={{ padding: 5 }} className="panel-pager">
                                            <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                    <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                        <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll2">
                                                            <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                    {status_edit == true ? (
                                                                        <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                    ) : (
                                                                        <div className="mt-1 flex">
                                                                            <ButtonComponent
                                                                                id="buAdd1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-plus"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                onClick={() => handleDetail_Add('new')}
                                                                            />
                                                                            <ButtonComponent
                                                                                id="buDelete1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-warning e-small"
                                                                                iconCss="e-icons e-small e-trash"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                onClick={() => {
                                                                                    DetailBarangDelete();
                                                                                }}
                                                                            />
                                                                            <ButtonComponent
                                                                                id="buDeleteAll2"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-danger e-small"
                                                                                iconCss="e-icons e-small e-erase"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                onClick={() => {
                                                                                    DetailBarangDeleteAll();
                                                                                    console.log('diklkik');
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div style={{ float: 'right', marginTop: -25 }}>
                                                                        <b>Total Berat : {frmNumber(totalBerat.toFixed(2))}</b>
                                                                    </div>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                            <div>
                                                <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                    <b>Keterangan :</b>
                                                </p>
                                                <div className="panel-input" style={{ width: '100%', minHeight: 60, marginTop: 5 }}>
                                                    <textarea value={keterangan} className='w-full h-full text-xs' onChange={(e: any) => setKeterangan(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* //JURNAL */}
                                    <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                        <ButtonComponent
                                            id="autojurnal"
                                            content="AutoJurnal"
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-small e-refresh"
                                            disabled={status_edit == true ? true : false}
                                            style={{ float: 'right', width: '110px', marginTop: -40, marginRight: 2, backgroundColor: status_edit == true ? '#dedede' : '#3b3f5c' }}
                                            onClick={() => {
                                                autoJurnal();
                                            }}
                                        />
                                        <TooltipComponent
                                            // ref={(t) => (tooltipDetailBarang = t)}
                                            // beforeRender={beforeRenderDetailBarang}
                                            openDelay={1000}
                                            target=".e-headertext"
                                        >
                                            <GridComponent
                                                id="gridJURNALList"
                                                name="gridJURNALList"
                                                className="gridJURNALList"
                                                locale="id"
                                                ref={(j: any) => (gridJURNALList = j)} // UBAH SESUAI JURNAL
                                                editSettings={{
                                                    // allowEditing: status_edit == true ? false : true,
                                                    allowEditing: false,
                                                    newRowPosition: 'Bottom',
                                                }}
                                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                allowResizing={true}
                                                autoFit={true}
                                                rowHeight={22}
                                                height={170} //170 barang jadi 150 barang produksi
                                                gridLines={'Both'}
                                                actionBegin={actionBeginDetailJurnal}
                                                actionComplete={actionCompleteDetailJurnal}
                                                created={() => {}}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective field="id_dokumen" type="number" isPrimaryKey={true} headerText="ID" headerTextAlign="Center" textAlign="Center" width="30" />
                                                    <ColumnDirective
                                                        field="no_akun"
                                                        // isPrimaryKey={true}
                                                        headerText="No. Akun"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateMasterItem_No_Akun}
                                                    />
                                                    <ColumnDirective
                                                        field="nama_akun"
                                                        // isPrimaryKey={true}
                                                        headerText="Nama Akun"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="200"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateMasterItem_Nama_Akun}
                                                    />
                                                    <ColumnDirective
                                                        field="debet_rp"
                                                        // editTemplate={editTemplateDebit}
                                                        format="N2"
                                                        headerText="Debet"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        width="120"
                                                        clipMode="EllipsisWithTooltip"
                                                        // allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="kredit_rp"
                                                        format="N2"
                                                        // editType="numericedit"
                                                        // edit={qtyParams}
                                                        //editTemplate={editTemplateQty}
                                                        headerText="Kredit"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        width="120"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="catatan"
                                                        headerText="Keterangan"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="235"
                                                        clipMode="EllipsisWithTooltip"
                                                        // allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="referensi"
                                                        headerText="Subsidiary Ledger"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="150"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateSubLedger}
                                                    />
                                                    <ColumnDirective
                                                        field="departemen"
                                                        headerText="Departemen"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="150"
                                                        clipMode="EllipsisWithTooltip"
                                                        editTemplate={editTemplateDepartemen}
                                                    />
                                                </ColumnsDirective>

                                                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                            </GridComponent>
                                        </TooltipComponent>
                                        <div style={{ padding: 5 }} className="panel-pager">
                                            <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd2">
                                                <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit2">
                                                    <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete2">
                                                        <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                            <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                    {/* {status_edit == true ? (
                                                                        <div style={{ marginTop: 28 }} className="mt-1 flex"></div>
                                                                    ) : (
                                                                        <div className="mt-1 flex">
                                                                            <ButtonComponent
                                                                                id="buDeleteAll2"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-danger e-small"
                                                                                iconCss="e-icons e-small e-erase"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                onClick={() => {
                                                                                    DetailBarangDeleteAllJurnal();
                                                                                    console.log('diklkik jurnal');
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )} */}
                                                                    <div style={{ float: 'right' }}>
                                                                        <table>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                        <b>Total Db/Kr :</b>
                                                                                    </td>
                                                                                    <td style={{ fontSize: 11 }}>
                                                                                        <b>{frmNumber(totalDebit)}</b>
                                                                                    </td>
                                                                                    <td style={{ fontSize: 11 }}>
                                                                                        <b>{frmNumber(totalKredit)}</b>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td style={{ paddingRight: '10px', fontSize: 11 }}>
                                                                                        <b>Selisih :</b>
                                                                                    </td>
                                                                                    <td style={{ fontSize: 11 }}>
                                                                                        <b>{frmNumber(totalDebit - totalKredit)}</b>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                            <div style={{ marginTop: 40 }}>
                                                <p style={{ fontSize: '12px', marginTop: 10, marginLeft: 10 }}>
                                                    <b>Keterangan :</b>
                                                </p>
                                                <div className="panel-input" style={{ width: '100%', height: 60, marginTop: 5 }}>
                                                    <TextBoxComponent value={keterangan} onChange={(e: any) => setKeterangan(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabComponent>
                        </div>

                        {/* ===============  Master Footer Data ========================   */}

                        {/* Data refensi untuk pengambilan barang ke Supplier */}
                        <div style={{ marginTop: 0, padding: 10 }} className="mb-1">
                            <div className="panel-tabel" style={{ width: '100%' }}>
                                <table className={styles.table} style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '15%', fontWeight: `bold`, color: `black` }}>No. Referensi</th>
                                            <th style={{ width: '15%', fontWeight: `bold`, color: `black` }}>Via (Ekspedisi)</th>
                                            <th style={{ width: '15%', fontWeight: `bold`, color: `black` }}>No. Kendaraan</th>
                                            <th style={{ width: '55%', fontWeight: `bold`, color: `black` }}>Alamat Pengiriman Barang</th>
                                        </tr>
                                    </thead>
                                    <tr>
                                        {/* no reff */}
                                        <td style={{ border: '1px solid grey' }}>
                                            <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={noReff} onChange={(e) => setNoReff(e.target.value)} />
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                        </td>
                                        {/* via (Eksepedisi) */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey' }}>
                                            {/* <input style={{ height: 30, width: '100%' }} type="text" /> */}
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                            <div className="flex">
                                                <DropDownListComponent
                                                    style={{ fontSize: '12px' }}
                                                    id="listVia"
                                                    className="form-select"
                                                    // dataSource={listVia.map((data: any) => data.via)}
                                                    dataSource={listVia.map((data: any) => ({ value: data.via }))}
                                                    fields={{ value: 'value' }}
                                                    value={Via}
                                                    placeholder={status_edit == true ? Via : '-- Silahkan pilih --'}
                                                    select={(e) => {
                                                        console.log(e.itemData.value);
                                                        setSelectedVia(e.itemData.value);
                                                    }}
                                                    // change={(args: ChangeEventArgsDropDown) => {
                                                    //     const value: any = args.value;
                                                    //     const selectedGudang = apiResponseGudang.find((data: any) => data.nama_gudang === value);
                                                    //     const kode_gudang = selectedGudang ? selectedGudang.kode_gudang : null;
                                                    //     console.log('kode gudang = ' + kode_gudang);
                                                    //     HandleGudangChange(kode_gudang, value, setSelectedOptionGudang, setSelectedOptionKodeGudang);
                                                    // }}
                                                    // value={selectedOptionGudang}
                                                />
                                            </div>
                                        </td>
                                        {/* no kendaraan */}
                                        <td style={{ textAlign: 'center', border: '1px solid grey', color: 'black' }}>
                                            <input style={{ height: 30, width: '100%' }} type="text" value={noKendaraan} onChange={(e) => setNoKendaraan(e.target.value)} />
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                        </td>
                                        {/* alamat */}
                                        <td rowSpan={5} style={{ textAlign: 'center', padding: 0, position: 'relative', border: '1px solid grey', borderBottomRightRadius: 5 }}>
                                            <textarea
                                                rows={1}
                                                style={{ height: 100, width: '100%', boxSizing: 'border-box', resize: 'none', color: 'black', marginTop: 2 }}
                                                value={alamatPengiriman}
                                                onChange={(e) => setAlamatPengiriman(e.target.value)}
                                            ></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3} style={{ fontWeight: `bold`, color: `black` }}>
                                            Customer
                                        </th>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'left', border: '1px solid grey' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedCust.nama_relasi} readOnly={true} />
                                                <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                    <FontAwesomeIcon
                                                        icon={faMagnifyingGlass}
                                                        className="ml-2"
                                                        width="15"
                                                        height="15"
                                                        onClick={() => {
                                                            console.log('Customer ico');
                                                            setModalCustRow(true);
                                                            // setModalMutasiBarang(true);
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                            {/* <TextBoxComponent style={{ fontSize: '12px' }} /> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3} style={{ fontWeight: `bold`, color: `black` }}>
                                            Dikirim dari Supplier (Kiriman Langsung Pabrik)
                                        </th>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'left', border: '1px solid grey', borderBottomRightRadius: 0 }}>
                                            <div style={{ position: 'relative' }}>
                                                <input style={{ height: 30, width: '100%', color: 'black' }} type="text" value={selectedSupplier.nama_relasi} readOnly={true} />
                                                <button style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none' }}>
                                                    <FontAwesomeIcon
                                                        icon={faMagnifyingGlass}
                                                        className="ml-2"
                                                        width="15"
                                                        height="15"
                                                        onClick={() => {
                                                            setModalSupplierRow(true);
                                                        }}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {/* =================  Tombol action dokumen ==================== */}
                <div
                    style={{
                        // backgroundColor: '#F2FDF8',
                        position: 'absolute',
                        bottom: 0,
                        right: -20,
                        borderBottomLeftRadius: '6px',
                        borderBottomRightRadius: '6px',
                        width: '100%',
                        height: '55px',
                        display: 'inline-block',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                    }}
                >
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 3.2 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            dialogClose();
                            gridMBList.dataSource.splice(0, gridMBList.dataSource.length);
                            gridMBList.refresh();
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen1"
                        content="Simpan"
                        cssClass="e-primary e-small"
                        iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            const isPastDate = moment(tglMB).isBefore(moment(), 'day'); // cek lebih kecil dari hari ini
                            if (status_edit) {
                                saveDoc(isPastDate);
                            } else {
                                saveDoc(false); // baru
                            }
                        }}
                    />
                </div>

                {/* MODAL DAFTAR BARANG */}
                <DialogComponent
                    // ref={(d) => (gridDaftarBarang = d)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Barang'}
                    visible={modalDaftarBarang}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="425"
                    height="450"
                    // buttons={buttonDaftarBarangJadi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalDaftarBarang(false);
                        console.log('closeDialog');
                        setSearchNoItem('');
                        setSearchNamaItem('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '120px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoItem1"
                            name="searchNoItem1"
                            className="searchNoItem1"
                            placeholder="<No. Item>"
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
                    <div className="form-input mb-1 mr-1" style={{ width: '270px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaItem1"
                            name="searchNamaItem1"
                            className="searchNamaItem1"
                            placeholder="<Nama Item>"
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
                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        ref={(g) => (gridBarangList = g)}
                        // dataSource={listDaftarBarang}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedBarang(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            getFromModalBarang();
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_item" headerText="No. Item" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_item" headerText="Nama Item" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => setModalDaftarBarang(false)}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen1"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => getFromModalBarang()}
                    />
                </DialogComponent>
                {/* END MODAL DAFTAR BARANG */}

                {/* MODAL CUSTOMER */}
                <DialogComponent
                    // ref={(d) => (dialogDaftarCustomer = d)}
                    id="dialogDaftarCustomer"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Customer'}
                    visible={modalCustRow}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="84%"
                    height="84%"
                    enableResize={true}
                    // buttons={buttonDaftarCustomer}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalCustRow(false);
                        setSearchNoCust('');
                        setSearchNamaCust('');
                        setSearchNamaSales('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '105px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="noCust"
                            name="noCust"
                            className="noCust"
                            placeholder="<No. Cust>"
                            showClearButton={true}
                            value={searchNoCust}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('namaCust')[0] as HTMLFormElement).value = '';
                                setSearchNamaCust('');
                                (document.getElementsByName('namaSales')[0] as HTMLFormElement).value = '';
                                setSearchNamaSales('');
                                const value: any = args.value;
                                setSearchNoCust(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '310px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="namaCust"
                            name="namaCust"
                            className="namaCust"
                            placeholder="<Nama Customer>"
                            showClearButton={true}
                            value={searchNamaCust}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('noCust')[0] as HTMLFormElement).value = '';
                                setSearchNoCust('');
                                (document.getElementsByName('namaSales')[0] as HTMLFormElement).value = '';
                                setSearchNamaSales('');
                                const value: any = args.value;
                                setSearchNamaCust(value);
                            }}
                        />
                    </div>

                    <div className="form-input mb-1" style={{ width: '305px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="namaSales"
                            name="namaSales"
                            className="namaSales"
                            placeholder="<Nama Salesman>"
                            showClearButton={true}
                            value={searchNamaSales}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('namaCust')[0] as HTMLFormElement).value = '';
                                setSearchNamaCust('');
                                (document.getElementsByName('noCust')[0] as HTMLFormElement).value = '';
                                setSearchNoCust('');
                                const value: any = args.value;
                                setSearchNamaSales(value);
                            }}
                        />
                    </div>

                    <GridComponent
                        id="gridDaftarCustomer"
                        locale="id"
                        ref={(g) => (gridCustomerList = g)}
                        // dataSource={dsDaftarCustomer}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'342'}
                        gridLines={'Both'}
                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedCust(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            console.log(args.rowData);
                            const selectedItems = args.rowData;
                            setSelectedCust(selectedItems);
                            setModalCustRow(false);
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_cust" headerText="No. Customer" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="alamat_kirim1" headerText="Alamat" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_salesman" headerText="Salesman" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="status_warna" headerText="Info Detail" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <div className="mt-4 flex items-center justify-between">
                        <div className={stylesTtb['custom-box-wrapper']}>
                            <div className={stylesTtb['custom-box-aktif']}></div>
                            <div className={stylesTtb['box-text']}>Aktif</div>
                            <div className={stylesTtb['custom-box-non-aktif']}></div>
                            <div className={stylesTtb['box-text']}>Non Aktif</div>
                            <div className={stylesTtb['custom-box-bl']}></div>
                            <div className={stylesTtb['box-text']}>BlackList-G</div>
                            <div className={stylesTtb['custom-box-noo']}></div>
                            <div className={stylesTtb['box-text']}>New Open Outlet</div>
                            <div className={stylesTtb['custom-box-batal-noo']}></div>
                            <div className={stylesTtb['box-text']}>Batal NOO</div>
                            <div className={stylesTtb['custom-box-tidak-digarap']}></div>
                            <div className={stylesTtb['box-text']}>Tidak Digarap</div>
                        </div>
                    </div>
                    <div className="flex" style={{ justifyContent: 'flex-end', padding: 10, marginTop: 10 }}>
                        <ButtonComponent
                            id="buSimpanDokumen1"
                            content="Pilih"
                            cssClass="e-primary e-small"
                            // iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                if (selectedCust) {
                                    setModalCustRow(false);
                                } else {
                                    myAlert(`Silahkan pilih customer terlebih dulu.`);
                                }
                            }}
                        />
                        <ButtonComponent
                            id="buBatalDokumen1"
                            content="Batal"
                            cssClass="e-primary e-small"
                            // iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                setModalCustRow(false);
                                setSelectedCust({ nama_relasi: '' });
                            }}
                        />
                    </div>
                </DialogComponent>
                {/* END MODAL CUSTOMER */}

                {/* MODAL DAFTAR SUPPLIER */}
                <DialogComponent
                    // ref={(s) => (gridDaftarSupplier = s)}
                    // id="dialogDaftarBarangJadi"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Supplier'}
                    visible={modalSupplierRow}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    //resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="425"
                    height="450"
                    // buttons={buttonDaftarBarangJadi}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalSupplierRow(false);
                        setSearchNoSupp('');
                        setSearchNamaSupp('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '120px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoSupp"
                            name="searchNoSupp"
                            className="searchNoSupp"
                            placeholder="<No. Supplier>"
                            showClearButton={true}
                            value={searchNoSupp}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaSupp')[0] as HTMLFormElement).value = '';
                                setSearchNamaSupp('');
                                const value: any = args.value;
                                setSearchNoSupp(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1 mr-1" style={{ width: '250px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaSupp"
                            name="searchNamaSupp"
                            className="searchNamaSupp"
                            placeholder="<Nama>"
                            showClearButton={true}
                            value={searchNamaSupp}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoSupp')[0] as HTMLFormElement).value = '';
                                setSearchNoSupp('');
                                const value: any = args.value;
                                setSearchNamaSupp(value);
                            }}
                        />
                    </div>

                    <GridComponent
                        // id="gridDaftarBarangJadi"
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        ref={(g) => (gridSupplierList = g)}
                        // dataSource={listDaftarSupplier}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'286'}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedSupplier(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            setSelectedSupplier(selectedItems);
                            setModalSupplierRow(false);
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="no_supp" headerText="No. Supplier" headerTextAlign="Center" textAlign="Left" width="95" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="kode_mu" headerText="MU" headerTextAlign="Center" textAlign="Left" width="40" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_relasi" headerText="Nama" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            setModalSupplierRow(false);
                            setSelectedSupplier({ nama_relasi: '' });
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen1"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedSupplier) {
                                setModalSupplierRow(false);
                            } else {
                                myAlert(`Silahkan pilih supplier terlebih dulu.`);
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL SUUPLIER */}

                {/* MODAL AKUN JURNAL */}
                <DialogComponent
                    // id="dialogDaftarAkunJurnal"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={'Daftar Akun Jurnal'}
                    visible={modalAkunJurnal}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="425"
                    height="450"
                    // buttons={buttonDaftarAkunKredit}
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalAkunJurnal(false);
                        setSearchNoAkun('');
                        setSearchNamaAkun('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '150px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoAkun"
                            name="searchNoAkun"
                            className="searchNoAkun"
                            placeholder="<No. Akun>"
                            showClearButton={true}
                            value={searchNoAkun}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNamaAkun')[0] as HTMLFormElement).value = '';
                                setSearchNamaAkun('');
                                const value: any = args.value;
                                setSearchNoAkun(value);
                            }}
                        />
                    </div>
                    <div className="form-input mb-1" style={{ width: '250px', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNamaAkun"
                            name="searchNamaAkun"
                            className="searchNamaAkun"
                            placeholder="<Nama Akun>"
                            showClearButton={true}
                            value={searchNamaAkun}
                            input={(args: FocusInEventArgs) => {
                                (document.getElementsByName('searchNoAkun')[0] as HTMLFormElement).value = '';
                                setSearchNoAkun('');
                                const value: any = args.value;
                                setSearchNamaAkun(value);
                            }}
                        />
                    </div>
                    <GridComponent
                        // id="gridDaftarAkunKredit"
                        locale="id"
                        ref={(g: any) => (gridAkunJurnalList = g)}
                        // dataSource={listAkunJurnal}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'267'}
                        // gridLines={'Both'}
                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                        rowSelecting={(args: any) => {
                            console.log(args.data);
                            setSelectedAkunJurnal(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            if (args.rowData.header === 'Y') {
                                setModalAkunJurnal(false);
                                myAlert(`No. Akun ${args.rowData.no_akun} adalah akun induk tidak bisa digunakan untuk transaksi.`);
                            } else {
                                const selectedItems = args.rowData;
                                console.log(selectedItems);
                                setSelectedAkunJurnal(selectedItems);
                                setModalAkunJurnal(false);
                                const editedData = {
                                    ...gridJURNALList.dataSource[indexDataJurnal],
                                    kode_akun: selectedItems.kode_akun,
                                    no_akun: selectedItems.no_akun,
                                    nama_akun: selectedItems.nama_akun,
                                    tipe: selectedItems.tipe,
                                };
                                gridJURNALList.dataSource[indexDataJurnal] = editedData;
                                gridJURNALList.refresh();
                            }
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective
                                // template={(args: any) => TemplateNoAkun(args)}
                                field="no_akun"
                                headerText="No. Akun"
                                headerTextAlign="Center"
                                textAlign="Left"
                                width="30"
                                clipMode="EllipsisWithTooltip"
                                // template={templateNoAkun}
                            />
                            <ColumnDirective
                                // template={(args: any) => TemplateNamaAkun(args)}
                                field="nama_akun"
                                headerText="Keterangan"
                                headerTextAlign="Center"
                                textAlign="Left"
                                width="60"
                                clipMode="EllipsisWithTooltip"
                                template={templateNamaAkun}
                            />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            setModalAkunJurnal(false);
                            setSearchNoAkun('');
                            setSearchNamaAkun('');
                        }}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen1"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedAkunJurnal) {
                                console.log(selectedAkunJurnal);
                                setModalAkunJurnal(false);
                                if (selectedAkunJurnal.header === 'Y') {
                                    myAlert(`No. Akun ${selectedAkunJurnal.no_akun} adalah akun induk tidak bisa digunakan untuk transaksi.`);
                                } else {
                                    const editedData = {
                                        ...gridJURNALList.dataSource[indexDataJurnal],
                                        kode_akun: selectedAkunJurnal.kode_akun,
                                        no_akun: selectedAkunJurnal.no_akun,
                                        nama_akun: selectedAkunJurnal.nama_akun,
                                        tipe: selectedAkunJurnal.tipe,
                                    };
                                    gridJURNALList.dataSource[indexDataJurnal] = editedData;
                                    gridJURNALList.refresh();
                                }
                            } else {
                                myAlert(`Silahkan pilih akun terlebih dulu.`);
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL AKUN JURNAL */}

                {/* MODAL DAFTAR MB IN */}
                <DialogComponent
                    id="daftarMBin"
                    target="#dialogMBList"
                    style={{ position: 'fixed' }}
                    header={`Daftar MB (IN) : ${selectedGudang.nama_gudang}`}
                    visible={modalDaftarMBIN}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="625"
                    height="450"
                    position={{ X: 'center', Y: 'center' }}
                    close={() => {
                        setModalDaftarMBIN(false);
                        console.log('closeDialog');
                        setSearchNoMBIN('');
                    }}
                    closeOnEscape={true}
                >
                    <div className="form-input mb-1 mr-1" style={{ width: '300', display: 'inline-block' }}>
                        <TextBoxComponent
                            id="searchNoItem1"
                            name="searchNoItem1"
                            className="searchNoItem1"
                            placeholder="<No. Item>"
                            showClearButton={true}
                            value={searchNoItem}
                            input={(args: FocusInEventArgs) => {
                                const value: any = args.value;
                                setSearchNoMBIN(value);
                            }}
                        />
                    </div>
                    <GridComponent
                        locale="id"
                        style={{ width: '100%', height: '78%' }}
                        ref={(g: any) => (gridMBINList = g)}
                        // dataSource={listDaftarMBIN}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        rowHeight={22}
                        width={'100%'}
                        height={'186'}
                        gridLines={'Both'}
                        rowSelecting={(args: any) => {
                            // console.log(args.data);
                            setSelectedMBIN(args.data);
                        }}
                        recordDoubleClick={(args: any) => {
                            const selectedItems = args.rowData;
                            // console.log(selectedItems);
                            const editedData = { ...gridMBList.dataSource[selectedRowIndex], no_mbref: selectedItems.kustom2 };
                            gridMBList.dataSource[selectedRowIndex] = editedData;
                            gridMBList.refresh();
                            setModalDaftarMBIN(false);
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="kustom2" headerText="No. MB" headerTextAlign="Center" textAlign="Left" width="120" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="kustom3" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="diskon" headerText="No. Kendaraan" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                            <ColumnDirective field="min_qty" headerText="OTD" headerTextAlign="Center" textAlign="Right" width="60" clipMode="EllipsisWithTooltip" />
                        </ColumnsDirective>
                        <Inject services={[Selection]} />
                    </GridComponent>
                    <ButtonComponent
                        id="buBatalDokumen1"
                        content="Batal"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-close"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => setModalDaftarMBIN(false)}
                    />
                    <ButtonComponent
                        id="buSimpanDokumen1"
                        content="Pilih"
                        cssClass="e-primary e-small"
                        // iconCss="e-icons e-small e-save"
                        style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                        onClick={() => {
                            if (selectedMBIN === '') {
                                const myAlert2 = (text: any) => {
                                    withReactContent(swalToast).fire({
                                        icon: 'warning',
                                        title: `<p style="font-size:12px">${text}</p>`,
                                        width: '100%',
                                        target: '#daftarMBin',
                                    });
                                };
                                myAlert2(`Silahkan pilih data terlebih dulu.`);
                            } else {
                                const editedData = { ...gridMBList.dataSource[selectedRowIndex], no_mbref: selectedMBIN.kustom2 };
                                gridMBList.dataSource[selectedRowIndex] = editedData;
                                gridMBList.refresh();
                                setModalDaftarMBIN(false);
                            }
                        }}
                    />
                </DialogComponent>
                {/* END MODAL DAFTAR MB IN */}
            </div>
        </DialogComponent>
    );
};

export default MutasiBarangNonPersediaan;
