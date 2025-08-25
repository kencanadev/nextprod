import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';
import styles from './spplist.module.css';
import Dropdown from '../../../../../components/Dropdown';
import { useRouter } from 'next/router';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import stylesIndex from '@styles/index.module.css';

import swal from 'sweetalert2';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import PilihBaruModal from './modal/pilihbaru';
import { showLoading } from '@/utils/routines';
import Swal from 'sweetalert2';
import { Approval } from '@mui/icons-material';
import { Dialog, Transition } from '@headlessui/react';
import { Box, Group, Stack } from '@mantine/core';
import Draggable from 'react-draggable';
import { viewPeriode, FirstDayInPeriod } from '@/utils/routines';
import { first } from 'lodash';
import { useSession } from '@/pages/api/sessionContext';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { usersMenu } from '@/utils/global/fungsi';
L10n.load(idIDLocalization);
enableRipple(true);

// interface PPListProps {
//     userid: any;
//     kode_entitas: any;
// }

const PPList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();
    const { name, tglAwal, tglAkhir, vTipeDokumen } = router.query;

    type PPListItem = {
        kode_pp: string;
        no_pp: any;
        tgl_pp: any;
        dokumen: any;
        peminta: any;
        kode_dept: any;
        keterangan: any;
        status: any;
        userid: any;
        tgl_update: any;
        approval: any;
        tgl_approval: any;
        fdo: any;
        produksi: any;
        nama_dept: any;
        status_app: any;
        status_batal: any;
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [25, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [totalRecords, setTotalRecords] = useState(0);
    const [allRecords, setAllRecords] = useState<PPListItem[]>([]);

    //checkbox filter
    const [noPPValue, setNoPPValue] = useState<string>('');
    const [isNoPPChecked, setIsNoPPChecked] = useState<boolean>(false);

    // const [date1, setDate1] = useState<moment.Moment | any>(moment());
    const [date1, setDate1] = useState<moment.Moment | any>(tglAwal === undefined ? moment() : moment(tglAwal));
    // const [date2, setDate2] = useState<moment.Moment | any>(moment().endOf('month'));
    const [date2, setDate2] = useState<moment.Moment | any>(tglAkhir === undefined ? moment().endOf('month') : moment(tglAkhir));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);

    const [StatusDokValue, setStatusDokValue] = useState<string>('');
    const [isStatusDokChecked, setIsStatusDokChecked] = useState<boolean>(false);

    const [StatusAppValue, setStatusAppValue] = useState<string>('');
    const [isStatusAppChecked, setIsStatusAppChecked] = useState<boolean>(false);

    const [isProduksiChecked, setIsProduksiChecked] = useState<boolean>(false);

    const [isPembatalanChecked, setIsPembatalanChecked] = useState<boolean>(false);
    const [tipeDokumen, setTipeDokumen] = useState(vTipeDokumen === undefined ? 'ya' : vTipeDokumen);

    //pencarian
    const [searchnopp, setsearchnopp] = useState('');
    const [searchketerangan, setsearchketerangan] = useState('');

    //handle input filter
    const handleNoPPInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoPPValue(newValue);
        setIsNoPPChecked(newValue.length > 0);
    };
    const handleStatusDokInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setStatusDokValue(newValue);
        setIsStatusDokChecked(newValue.length > 0);
    };

    const handleStatusAppInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setStatusAppValue(newValue);
        setIsStatusAppChecked(newValue.length > 0);
    };

    //select baris
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedProduksi, setSelectedProduksi] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedApproval, setSelectedApproval] = useState('');
    const [selectedDokumen, setSelectedDokumen] = useState('');

    const [selectedColumn, setSelectedColumn] = useState('');
    const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
    const [expandedRecordIdsTemp, setExpandedRecordIdsTemp] = useState<string[]>([]);
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });

    const handleRowClick = (kode_pp: any, produksi: any, statusx: any, approval: any, dokumen: any) => {
        setSelectedRow(kode_pp);
        setSelectedProduksi(produksi);
        setSelectedStatus(statusx);
        setSelectedApproval(approval);
        setSelectedDokumen(dokumen);

        // if (selectedRow !== '') {
        //     showLoading();
        //     if (produksi==='Y'){
        //       router.push({ pathname: `./spp`, query: {name:`produksi`, kode_pp: `${selectedRow}`,form_app:`N` } });
        //     } else {
        //       router.push({ pathname: `./spp`, query: {name:`barangjadi`, kode_pp: `${selectedRow}`,form_app:`N` } });
        //     }
        //     swal.close();
        // }
    };

    const handleRowDbClick = (kode_pp: any, produksi: any, statusx: any, approval: any, dokumen: any) => {
        setSelectedRow(kode_pp);
        setSelectedProduksi(produksi);
        setSelectedStatus(statusx);
        setSelectedApproval(approval);
        setSelectedDokumen(dokumen);
        if (selectedRow !== '') {
            showLoading();
            if (selectedStatus === 'Proses' || selectedStatus === 'Tertutup') {
                if (selectedProduksi === 'Y') {
                    router.push({
                        pathname: `./spp`,
                        query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `ViewOnly`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                    });
                } else {
                    if (dokumen === 'Persediaan') {
                        router.push({
                            pathname: `./spp`,
                            query: { name: `barangjadi`, kode_pp: `${selectedRow}`, form_app: `ViewOnly`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                        });
                    } else {
                        router.push({
                            pathname: `./spp`,
                            query: { name: `nonPersediaan`, kode_pp: `${selectedRow}`, form_app: `ViewOnly`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                        });
                    }
                }
            } else {
                if (produksi === 'Y') {
                    router.push({
                        pathname: `./spp`,
                        query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                    });
                } else {
                    if (dokumen === 'Persediaan') {
                        router.push({
                            pathname: `./spp`,
                            query: { name: `barangjadi`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                        });
                    } else {
                        router.push({
                            pathname: `./spp`,
                            query: { name: `nonPersediaan`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                        });
                    }
                }
            }
            swal.close();
        }
    };

    //modal
    const [baru, setBaru] = useState(false);

    const [baruSelected, setbaruSelected] = useState();

    const handleSelectedData = (selectedData: any) => {
        setbaruSelected(selectedData);
    };

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [recordsData, setRecordsData] = useState<PPListItem[]>([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/list_pp_filter?`, {
                params: {
                    entitas: kode_entitas,
                    param1: 'all',
                    param2: 'all',
                    param3: 'all',
                    param4: 'all',
                    param5: 'all',
                    param6: 'all',
                    param7: 'all',
                    param8: 10,
                    param9: 'Persediaan',
                },
            });

            const responseData = response.data.data;

            const transformedData: PPListItem[] = responseData.map((item: any) => ({
                id: item.kode_pp,
                kode_pp: item.kode_pp,
                no_pp: item.no_pp,
                tgl_pp: moment(item.tgl_pp).format('DD-MM-YYYY'),
                dokumen: item.dokumen,
                peminta: item.peminta,
                kode_dept: item.kode_dept,
                keterangan: item.keterangan,
                status: item.status,
                userid: item.userid,
                tgl_update: item.tgl_update,
                approval: item.approval,
                tgl_approval: item.tgl_approval,
                fdo: item.fdo,
                produksi: item.produksi,
                nama_dept: item.nama_dept,
                status_app: item.status_app,
                status_batal: item.status_batal,
            }));

            setAllRecords(transformedData);
            setTotalRecords(transformedData.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // let getsss = FirstDayInPeriod ('99999')
        //     .then((result) => {
        //        alert (result);
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error);
        //     });
        const kode_menu = '30100'; // kode menu PP
        const fetchDataUseEffect = async () => {
            showLoading();

            try {
                let vno_pp = 'all';
                let vtgl_awal = 'all';
                let vtgl_akhir = 'all';
                let vstatus_dok = 'all';
                let vstatus_app = 'all';
                let vproduksi = 'all';
                let vpembatalan = 'all';
                let vtipeDokumen = 'all';
                let vlimit = '10000';

                if (isNoPPChecked) {
                    vno_pp = `${noPPValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vtgl_awal = `${formattedDate1}`;
                    vtgl_akhir = `${formattedDate2}`;
                }

                if (isStatusDokChecked) {
                    vstatus_dok = `${StatusDokValue}`;
                }

                if (isStatusAppChecked) {
                    vstatus_app = `${StatusAppValue}`;
                }

                if (isProduksiChecked) {
                    vproduksi = `Y`;
                }

                if (isPembatalanChecked) {
                    vpembatalan = `Y`;
                }

                if (tipeDokumen === 'all') {
                    vtipeDokumen = `all`;
                } else if (tipeDokumen === 'ya') {
                    vtipeDokumen = 'Persediaan';
                } else {
                    vtipeDokumen = 'Non Persediaan';
                }

                const response = await axios.get(`${apiUrl}/erp/list_pp_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pp,
                        param2: vtgl_awal,
                        param3: vtgl_akhir,
                        param4: vstatus_dok,
                        param5: vstatus_app,
                        param6: vproduksi,
                        param7: vpembatalan,
                        param8: vlimit,
                        param9: vtipeDokumen,
                    },
                });

                const responseData = response.data.data;
                console.log('responseData = ', responseData);

                const transformedData: PPListItem[] = responseData.map((item: any) => ({
                    id: item.kode_pp,
                    kode_pp: item.kode_pp,
                    no_pp: item.no_pp,
                    tgl_pp: moment(item.tgl_pp).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    keterangan: item.keterangan,
                    status: item.status,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    nama_dept: item.nama_dept,
                    status_app: item.status_app,
                    status_batal: item.status_batal,
                }));

                setAllRecords(transformedData);
                setTotalRecords(transformedData.length);

                await usersMenu(kode_entitas, userid, kode_menu)
                    .then((result) => {
                        const { baru, edit, hapus, cetak } = result;
                        setUserMenu((prevState: any) => ({
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            swal.close();
        };
        fetchDataUseEffect();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize, searchnopp, searchketerangan]);

    useEffect(() => {
        //  const Pagination = (records: any, page: any, totalRecords: any, recordsDataSetter: any) => {
        const from = (page - 1) * pageSize;
        const to = Math.min(from + pageSize, totalRecords);

        const sortedData = [...allRecords].sort((a, b) => {
            const columnAccessor = sortStatus.columnAccessor as keyof PPListItem;
            const direction = sortStatus.direction === 'asc' ? 1 : -1;

            if (a[columnAccessor] < b[columnAccessor]) return -direction;
            if (a[columnAccessor] > b[columnAccessor]) return direction;
            return 0;
        });

        // filter berdasarkan kata kunci pencarian
        let filteredData = sortedData;

        if (searchnopp) {
            //const searchableColumnsno_pp = ['no_pp','keterangan'];
            const searchableColumnsno_pp = ['no_pp'];
            filteredData = sortedData.filter((record: any) => searchableColumnsno_pp.some((column) => record[column]?.toLowerCase().includes(searchnopp.toLowerCase())));
        }

        if (searchketerangan) {
            const searchableColumnsketerangan = ['keterangan'];
            filteredData = filteredData.filter((record: any) => searchableColumnsketerangan.some((column) => record[column]?.toLowerCase().includes(searchketerangan.toLowerCase())));
        }

        const dataToDisplay = filteredData.slice(from, to);
        setRecordsData(dataToDisplay);
    }, [page, pageSize, sortStatus, allRecords, totalRecords, searchnopp, searchketerangan]);

    // Visible panel sidebar
    const [panelVisible, setPanelVisible] = useState(true);

    // Visible Detail Panel
    const [panelDetailVisible, setPanelDetailVisible] = useState(true);

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const refreshData = async () => {
        showLoading();
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vno_pp = 'all';
                let vtgl_awal = 'all';
                let vtgl_akhir = 'all';
                let vstatus_dok = 'all';
                let vstatus_app = 'all';
                let vproduksi = 'all';
                let vpembatalan = 'all';
                let vtipeDokumen = 'all';
                let vlimit = '10000';

                if (isNoPPChecked) {
                    vno_pp = `${noPPValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = moment(date1).format('YYYY-MM-DD');
                    const formattedDate2 = moment(date2).format('YYYY-MM-DD');
                    vtgl_awal = `${formattedDate1}`;
                    vtgl_akhir = `${formattedDate2}`;
                }

                if (isStatusDokChecked) {
                    vstatus_dok = `${StatusDokValue}`;
                }

                if (isStatusAppChecked) {
                    vstatus_app = `${StatusAppValue}`;
                }

                if (isProduksiChecked) {
                    vproduksi = `Y`;
                }

                if (isPembatalanChecked) {
                    vpembatalan = `Y`;
                }

                if (tipeDokumen === 'all') {
                    vtipeDokumen = `all`;
                } else if (tipeDokumen === 'ya') {
                    vtipeDokumen = 'Persediaan';
                } else {
                    vtipeDokumen = 'Non Persediaan';
                }

                const response = await axios.get(`${apiUrl}/erp/list_pp_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pp,
                        param2: vtgl_awal,
                        param3: vtgl_akhir,
                        param4: vstatus_dok,
                        param5: vstatus_app,
                        param6: vproduksi,
                        param7: vpembatalan,
                        param8: vlimit,
                        param9: vtipeDokumen,
                    },
                });

                const responseData = response.data.data;
                const transformedData: PPListItem[] = responseData.map((item: any) => ({
                    id: item.kode_pp,
                    kode_pp: item.kode_pp,
                    no_pp: item.no_pp,
                    tgl_pp: moment(item.tgl_pp).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    keterangan: item.keterangan,
                    status: item.status,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    nama_dept: item.nama_dept,
                    status_app: item.status_app,
                    status_batal: item.status_batal,
                }));

                setAllRecords(transformedData);
                setTotalRecords(transformedData.length);
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

    const handleRowClickDetail = (selectedRow: any, kode_pp: any) => {
        setSelectedRow(kode_pp);
        router.push(`./spp?id=${selectedRow}`);
    };

    //modal
    const [modalTanggal, setModalTanggal] = useState(false);

    const [dateStart, setDateStart] = useState<any>(moment());
    const [dateEnd, setDateEnd] = useState<any>(moment());

    const [flatpickrClicked, setFlatpickrClicked] = useState(false);

    const handleCloseModals = () => {
        setModalTanggal(false);
        setFlatpickrClicked(false);
    };

    //Print Preview
    const OnClick_CetakFormPP = () => {
        if (selectedRow === '') {
            swal.fire({
                title: 'Pilih Data terlebih dahulu.',
                icon: 'error',
            });
        }
        if (selectedApproval !== 'Y') {
            swal.fire({
                title: 'Data yang belum di approval tidak dapat dicetak.',
                icon: 'error',
            });
        } else {
            // const param = {
            //     entitas: kode_entitas,
            //     where: `d.kode_pp="${selectedRow}"`,
            // };

            // Encode Base64
            //  const strCommand = btoa(JSON.stringify(param));

            let height = window.screen.availHeight - 150;
            let width = window.screen.availWidth - 200;
            let leftPosition = window.screen.width / 2 - (width / 2 + 10);
            let topPosition = window.screen.height / 2 - (height / 2 + 50);

            let iframe = `
                <html><head>
                <title>Form Permintaan Pembelian | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/form_pp?entitas=${kode_entitas}&param1=${selectedRow}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
        }
    };

    //Print Preview
    const OnClick_CetakDaftarPP = () => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Form Daftar Pembelian | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/daftar_pp?entitas=${kode_entitas}&param1=${dateStart?.format('YYYY-MM-DD')}&param2=${dateEnd?.format(
            'YYYY-MM-DD'
        )}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
    };

    // modal detail
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalPosition, setModalPosition] = useState({ top: '15%', left: '10%', background: '#dedede' });

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
                const responseHeader = await axios.get(`${apiUrl}/erp/list_pp_header?entitas=${kode_entitas}&param1=${selectedRow}`);
                const responseDetail = await axios.get(`${apiUrl}/erp/list_pp_detail?entitas=${kode_entitas}&param1=${selectedRow}`);
                setHeaderFetch(responseHeader.data.data);
                setDetailFetch(responseDetail.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [kode_entitas, selectedRow]);

    const styleButton = { width: 57 + 'px', height: '30px', marginBottom: '0.5em', backgroundColor: '#3b3f5c' };
    const styleButtonDisabled = { width: 57 + 'px', height: '30px', marginBottom: '0.5em', backgroundColor: '#ece7f5' };

    const colorStatusBatal = { color: '#7c0000', fontWeight: 'bold' };
    const colorApprovalY = { color: '#64ab64', fontWeight: 'bold' };
    const colorApprovalC = { color: '#000080FF', fontWeight: 'bold' };
    const colorApprovalN = { color: '#FF4500', fontWeight: 'bold' };
    const colorNonApproval = { color: '#66AAEE', fontWeight: 'bold' };
    const handleTipeDokumenChange = (value: any) => {
        setTipeDokumen(value);
    };

    return (
        <div className='w-full h-[calc(100vh-200px)] '>
            <div className={`Main h-full w-full ${stylesIndex.scale85Monitor}`}>
            
                <div className="mb-[3px] flex justify-between">
                    <div className="flex h-[30px] flex-grow gap-2">
                        <button
                            style={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            disabled={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => setBaru(true)}
                        >
                            Baru
                        </button>
                        <PilihBaruModal
                            isOpen={baru}
                            onClose={() => setBaru(false)}
                            date1={date1}
                            date2={date2}
                            tipeDokumen={tipeDokumen}
                            onSelectData={(selectedData: any) => handleSelectedData(selectedData)}
                        />
                        <button
                            style={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            disabled={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            className=" rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                if (selectedRow) {
                                    showLoading();
                                    if (selectedStatus === 'Proses' || selectedStatus === 'Tertutup') {
                                        if (selectedProduksi === 'Y') {
                                            router.push({
                                                pathname: `./spp`,
                                                query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `ViewOnly`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                            });
                                        } else {
                                            if (selectedDokumen === 'Persediaan') {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: {
                                                        name: `barangjadi`,
                                                        kode_pp: `${selectedRow}`,
                                                        form_app: `ViewOnly`,
                                                        tglAwal: `${date1}`,
                                                        tglAkhir: `${date2}`,
                                                        vTipeDokumen: `${tipeDokumen}`,
                                                    },
                                                });
                                            } else {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: {
                                                        name: `nonPersediaan`,
                                                        kode_pp: `${selectedRow}`,
                                                        form_app: `ViewOnly`,
                                                        tglAwal: `${date1}`,
                                                        tglAkhir: `${date2}`,
                                                        vTipeDokumen: `${tipeDokumen}`,
                                                    },
                                                });
                                            }
                                        }
                                    } else {
                                        if (selectedProduksi === 'Y') {
                                            router.push({
                                                pathname: `./spp`,
                                                query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                            });
                                        } else {
                                            if (selectedDokumen === 'Persediaan') {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `barangjadi`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            } else {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `nonPersediaan`, kode_pp: `${selectedRow}`, form_app: `N`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            }
                                        }
                                    }
                                    swal.close();
                                } else {
                                    swal.fire({
                                        title: 'Pilih Data terlebih dahulu.',
                                        icon: 'error',
                                    });
                                }
                            }}
                        >
                            Ubah
                        </button>

                        {/* <button type="submit" className="btn btn-danger mb-2 md:mb-0 md:mr-2">
                            Hapus
                        </button> */}
                        <button
                            className={`rounded-md px-4 py-1.5 text-xs font-semibold  transition-colors duration-200 ${
                                panelVisible ? 'bg-gray-200 text-gray-500' : 'bg-[#3a3f5c] text-white hover:bg-[#2f3451]'
                            }`}
                            onClick={handleFilterClick}
                        >
                            Filter
                        </button>

                        <div className="relative h-full w-[90px]">
                            <div className="dropdown flex h-full items-center justify-center rounded-md bg-[#3a3f5c] px-2">
                                <Dropdown
                                    offset={[0, 5]}
                                    placement={`bottom-end`}
                                    btnClassName="rounded-md   text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451] flex item-center"
                                    button={
                                        <>
                                            <span className="flex items-center">
                                                Cetak
                                                <FontAwesomeIcon icon={faSquareCaretDown} className="ml-2" width="18" height="18" />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul style={{ width: '270px' }}>
                                        <li>
                                            <button type="button" onClick={OnClick_CetakFormPP}>
                                                Form Surat Permintaan Pembelian
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setModalTanggal(true);
                                                }}
                                            >
                                                Daftar Surat Permintaan Pembelian
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>

                                <Transition appear show={modalTanggal}>
                                    <Dialog as="div" open={modalTanggal} onClose={handleCloseModals}>
                                        <Transition.Child
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="fixed inset-0" />
                                        </Transition.Child>
                                        <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                                            <div className="flex min-h-screen items-center justify-center px-4">
                                                <Transition.Child
                                                    enter="ease-out duration-300"
                                                    enterFrom="opacity-0 scale-95"
                                                    enterTo="opacity-100 scale-100"
                                                    leave="ease-in duration-200"
                                                    leaveFrom="opacity-100 scale-100"
                                                    leaveTo="opacity-0 scale-95"
                                                >
                                                    <Dialog.Panel
                                                        as="div"
                                                        className={`panel max-w-$4xl my-8 w-[80vh] w-full overflow-hidden rounded-lg border-0 bg-[#dedede] p-0 text-black dark:text-white-dark`}
                                                    >
                                                        <div className="p-5">
                                                            Periode Tanggal :
                                                            <Flatpickr
                                                                value={dateStart.format('DD-MM-YYYY HH:mm:ss')}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    clickOpens: flatpickrClicked,
                                                                }}
                                                                className={` ${styles.inputTableBasicDate}`}
                                                                style={{ width: '100px', marginLeft: '5px', marginRight: '5px' }}
                                                                onChange={(date) => {
                                                                    const selectedDate = moment(date[0]);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setDateStart(selectedDate);
                                                                }}
                                                                onFocus={() => setFlatpickrClicked(true)}
                                                            />
                                                            S/D
                                                            <Flatpickr
                                                                value={dateEnd.format('DD-MM-YYYY HH:mm:ss')}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                }}
                                                                className={` ${styles.inputTableBasicDate}`}
                                                                style={{ width: '100px', marginLeft: '5px' }}
                                                                onChange={(date) => {
                                                                    const selectedDate = moment(date[0]);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setDateEnd(selectedDate);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mr-3 flex items-center justify-between">
                                                            <div className="flex items-center space-x-4"></div>

                                                            <div className="mb-3 flex space-x-4">
                                                                <button type="button" className="btn btn-primary" onClick={OnClick_CetakDaftarPP} style={{ width: '8vh', height: '4vh' }}>
                                                                    OK
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => {
                                                                        handleCloseModals();
                                                                    }}
                                                                    style={{ width: '8vh', height: '4vh' }}
                                                                >
                                                                    Batal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                            </div>
                        </div>

                        <button
                            className="flex w-[120px] items-center justify-center rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                if (selectedRow) {
                                    if (selectedStatus === 'Terbuka') {
                                        showLoading();
                                        if (selectedProduksi === 'Y') {
                                            router.push({
                                                pathname: `./spp`,
                                                query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `Y`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                            });
                                        } else {
                                            if (selectedDokumen === 'Persediaan') {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `barangjadi`, kode_pp: `${selectedRow}`, form_app: `Y`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            } else {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `nonPersediaan`, kode_pp: `${selectedRow}`, form_app: `Y`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            }
                                        }
                                        swal.close();
                                    } else {
                                        swal.fire({
                                            title: 'Status approval ' + selectedStatus + ' tidak dapat dikoreksi.',
                                            icon: 'error',
                                        });
                                    }
                                } else {
                                    swal.fire({
                                        title: 'Pilih Data terlebih dahulu.',
                                        icon: 'error',
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Approval
                        </button>

                        <button
                            className="flex items-center justify-center rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => {
                                if (selectedRow) {
                                    if (selectedStatus === 'Terbuka' || selectedStatus === 'Proses') {
                                        showLoading();
                                        if (selectedProduksi === 'Y') {
                                            router.push({
                                                pathname: `./spp`,
                                                query: { name: `produksi`, kode_pp: `${selectedRow}`, form_app: `B`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                            });
                                        } else {
                                            if (selectedDokumen === 'Persediaan') {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `barangjadi`, kode_pp: `${selectedRow}`, form_app: `B`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            } else {
                                                router.push({
                                                    pathname: `./spp`,
                                                    query: { name: `nonPersediaan`, kode_pp: `${selectedRow}`, form_app: `B`, tglAwal: `${date1}`, tglAkhir: `${date2}`, vTipeDokumen: `${tipeDokumen}` },
                                                });
                                            }
                                        }
                                        swal.close();
                                    } else {
                                        swal.fire({
                                            title: 'Status approval ' + selectedStatus + ' tidak dapat dibatalkan.',
                                            icon: 'error',
                                        });
                                    }
                                } else {
                                    swal.fire({
                                        title: 'Pilih Data terlebih dahulu.',
                                        icon: 'error',
                                    });
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Pembatalan
                        </button>

                        <button
                            className="flex items-center justify-center rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={() => openModal(selectedRow)}
                        >
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Detail Dok
                        </button>

                        <form className="ml-2 flex flex-col items-center gap-1 font-semibold md:flex-row">
                            <label className="ml-3 mt-2">Cari</label>
                            <input type="text" placeholder="Nomor PP" className="form-input mb-2 md:mb-0 md:w-auto" value={searchnopp} onChange={(e) => setsearchnopp(e.target.value)} />
                            <input type="text" placeholder="Keterangan" className="form-input md:w-auto" value={searchketerangan} onChange={(e) => setsearchketerangan(e.target.value)} />
                        </form>
                    </div>

                    <div className="flex">
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            PP List Data
                        </span>
                    </div>
                </div>

                <div className={styles['flex-container'] + ' w-full h-[calc(100%-33px)] '}>
                    {panelVisible && (
                        <div className="panel h-full flex flex-col" style={{ background: '#dedede' }}>
                            <div className='w-full flex justify-between  h-[30px]'>
                                <span>Filter</span>
                                <button className=" p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                            </div>
                            <div className='w-full overflow-y-auto h-[100%-60px]'>

                            <form>
                                <label className=" flex cursor-pointer items-center">
                                    <input type="checkbox" className="form-checkbox" checked={isNoPPChecked} onChange={() => setIsNoPPChecked(!isNoPPChecked)} />
                                    <span>No. PP</span>
                                </label>
                                <input type="text" placeholder="" className="form-input" value={noPPValue} onChange={handleNoPPInputChange} />

                                <label className="mt-3 flex cursor-pointer items-center">
                                    <input type="checkbox" className="form-checkbox" checked={isTanggalChecked} onChange={() => setIsTanggalChecked(!isTanggalChecked)} />
                                    <span>Tanggal</span>
                                </label>
                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    {/* <Flatpickr
                                        value={date1.format('DD-MM-YYYY')}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        className="form-input"
                                        style={{ fontSize: '1.8vh', width: '15vh' }}
                                        onChange={(date) => setDate1(moment(date[0]))}
                                    />{' '} */}
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
                                            value={moment(date1).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDate1(moment(args.value).format('YYYY-MM-DD'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="mt-1">S/D</p>
                                    {/* <Flatpickr
                                        value={date2.format('DD-MM-YYYY')}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        className="form-input"
                                        style={{ fontSize: '1.8vh', width: '15vh' }}
                                        onChange={(date) => setDate2(moment(date[0]))}
                                    /> */}
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
                                            value={moment(date2).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDate2(moment(args.value).format('YYYY-MM-DD'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-between">
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox" checked={isStatusDokChecked} onChange={() => setIsStatusDokChecked(!isStatusDokChecked)} />
                                        <span>Status Dokumen</span>
                                    </label>
                                </div>
                                <div>
                                    <select id="ctnSelect1" className="form-select " value={StatusDokValue} onChange={handleStatusDokInputChange}>
                                        <option value="" disabled hidden>
                                            {'--Silahkan Pilih--'}
                                        </option>
                                        <option>Terbuka</option>
                                        <option>Proses</option>
                                        <option>Tertutup</option>
                                    </select>
                                </div>

                                <label className="mt-3 flex cursor-pointer items-center">
                                    <input type="checkbox" className="form-checkbox" checked={isStatusAppChecked} onChange={() => setIsStatusAppChecked(!isStatusAppChecked)} />
                                    <span>Status Approval</span>
                                </label>
                                <div>
                                    <select id="ctnSelect2" className="form-select " value={StatusAppValue} onChange={handleStatusAppInputChange}>
                                        <option value="" disabled hidden>
                                            {'--Silahkan Pilih--'}
                                        </option>
                                        <option>Disetujui</option>
                                        <option>Ditolak</option>
                                        <option>Koreksi</option>
                                        <option>Baru</option>
                                    </select>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <div>
                                        <label className="inline-flex">
                                            <input type="checkbox" className="peer form-checkbox" checked={isProduksiChecked} onChange={() => setIsProduksiChecked(!isProduksiChecked)} />
                                            <span className="peer-checked:text-primary">PP Barang Produksi</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="inline-flex">
                                            <input type="checkbox" className="peer form-checkbox" checked={isPembatalanChecked} onChange={() => setIsPembatalanChecked(!isPembatalanChecked)} />
                                            <span className="peer-checked:text-success">Pembatalan Permintaan</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="font-bold">
                                        <span style={{ fontWeight: 'bold' }}>Tipe Dokumen</span>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <div className="flex">
                                        <input type="radio" name="rebuild_stok" id="ya" className="form-radio" checked={tipeDokumen === 'ya'} onChange={() => handleTipeDokumenChange('ya')} />
                                        <label htmlFor="ya" className="ml-1" style={{ marginBottom: 2, fontSize: 14 }}>
                                            Persediaan
                                        </label>
                                    </div>

                                    <div className="flex">
                                        <input type="radio" name="rebuild_stok" id="no" className="form-radio" checked={tipeDokumen === 'no'} onChange={() => handleTipeDokumenChange('no')} />
                                        <label htmlFor="no" className="ml-1" style={{ marginBottom: 2, fontSize: 14 }}>
                                            Non Persediaan
                                        </label>
                                    </div>

                                    <div className="flex">
                                        <input type="radio" name="rebuild_stok" id="all" className="form-radio" checked={tipeDokumen === 'all'} onChange={() => handleTipeDokumenChange('all')} />
                                        <label htmlFor="all" className="ml-1" style={{ marginBottom: 2, fontSize: 14 }}>
                                            Semua
                                        </label>
                                    </div>
                                </div>

                                
                            </form>
                            </div>
                            <div className='w-full flex items-center justify-center h-[30px]'>
    <div className="flex justify-center">
                                    <button type="button" onClick={() => refreshData()} className="btn btn-primary mt-2">
                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Grid Layouts */}
                    <div className="panel w-full h-full " style={{ background: '#dedede', height: '100%' }}>
                        <Tabs className={'w-full h-full '}>
                            <TabList className={'h-[35px] '}>
                                <Tab>Data List</Tab>
                            </TabList>

                            <TabPanel className={'w-full h-[calc(100%-35px)]'} >
                                <div className="w-full justify-between gap-5 rounded-md bg-white p-1 sm:flex h-full">
                                    <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-1 h-full">
                                        <DataTable
                                            withBorder={true}
                                            withColumnBorders={true}
                                            highlightOnHover
                                            className={`ticky-table table-hover whitespace-nowrap`}
                                            striped
                                            // onCellClick={(selectedRow: any) => handleRowClickDetail(selectedRow)}
                                            style={{ background: '#e8e8e8' }}
                                            records={recordsData}
                                            columns={[
                                                {
                                                    accessor: 'no_pp',
                                                    title: 'No. PP',
                                                    sortable: true,
                                                    render: ({ no_pp, kode_pp, status_batal, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {no_pp}</div> : <div> {no_pp}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {no_pp}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {no_pp}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {no_pp}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {no_pp}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {no_pp}</div>
                                                            ) : (
                                                                <div> {no_pp}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'tgl_pp',
                                                    title: 'Tanggal',
                                                    sortable: true,
                                                    render: ({ tgl_pp, status_batal, kode_pp, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {tgl_pp}</div> : <div> {tgl_pp}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {tgl_pp}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {tgl_pp}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {tgl_pp}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {tgl_pp}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {tgl_pp}</div>
                                                            ) : (
                                                                <div> {tgl_pp}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'dokumen',
                                                    title: 'Dokumen',
                                                    sortable: true,
                                                    render: ({ dokumen, status_batal, kode_pp, produksi, status, approval }) => (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {dokumen}</div> : <div> {dokumen}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {dokumen}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {dokumen}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {dokumen}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {dokumen}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {dokumen}</div>
                                                            ) : (
                                                                <div> {dokumen}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'nama_dept',
                                                    title: 'Departemen',
                                                    sortable: true,
                                                    render: ({ nama_dept, status_batal, kode_pp, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {nama_dept}</div> : <div> {nama_dept}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {nama_dept}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {nama_dept}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {nama_dept}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {nama_dept}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {nama_dept}</div>
                                                            ) : (
                                                                <div> {nama_dept}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'keterangan',
                                                    title: 'Catatan',
                                                    sortable: true,
                                                    render: ({ keterangan, status_batal, kode_pp, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {keterangan}</div> : <div> {keterangan}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {keterangan}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {keterangan}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {keterangan}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {keterangan}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {keterangan}</div>
                                                            ) : (
                                                                <div> {keterangan}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'status',
                                                    title: 'Status Dok.',
                                                    sortable: true,
                                                    render: ({ kode_pp, status_batal, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {status}</div> : <div> {status}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {status}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {status}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {status}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {status}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {status}</div>
                                                            ) : (
                                                                <div> {status}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    accessor: 'status_app',
                                                    title: 'Status App.',
                                                    sortable: true,
                                                    render: ({ status_app, kode_pp, status_batal, produksi, status, approval, dokumen }) => (
                                                        <div
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRowClick(kode_pp, produksi, status, approval, dokumen)}
                                                            onDoubleClick={() => handleRowDbClick(kode_pp, produksi, status, approval, dokumen)}
                                                        >
                                                            {/* {selectedRow === kode_pp ? <div style={{ color: '#66AAEE', fontWeight: 'bold' }}> {status_app}</div> : <div> {status_app}</div>} */}
                                                            {selectedRow === kode_pp ? (
                                                                <div style={colorNonApproval}> {status_app}</div>
                                                            ) : approval === 'Y' ? (
                                                                <div style={colorApprovalY}> {status_app}</div>
                                                            ) : approval === 'C' ? (
                                                                <div style={colorApprovalC}> {status_app}</div>
                                                            ) : approval === 'N' ? (
                                                                <div style={colorApprovalN}> {status_app}</div>
                                                            ) : status_batal === 'Y' ? (
                                                                <div style={colorStatusBatal}> {status_app}</div>
                                                            ) : (
                                                                <div> {status_app}</div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                            ]}
                                            // onCellClick={({  record, recordIndex, column, columnIndex }) => {

                                            //     columnIndex == 0 ?

                                            //        setExpandedRecordIds([record.kode_pp])

                                            //     :  setExpandedRecordIds([''])

                                            // }}
                                            // rowExpansion={{

                                            //    allowMultiple: false,
                                            //    expanded: {
                                            //         recordIds: expandedRecordIds,
                                            //         onRecordIdsChange:   setExpandedRecordIdsTemp,

                                            //     },

                                            //     content: ({ record}) => (
                                            //       <Stack>
                                            //         <Group>
                                            //           <div>No. PP:</div>
                                            //           <div>
                                            //               {record.no_pp}
                                            //           </div>
                                            //         </Group>
                                            //       </Stack>
                                            //     )
                                            // }}

                                            totalRecords={totalRecords}
                                            recordsPerPage={pageSize}
                                            page={page}
                                            onPageChange={(p) => setPage(p)}
                                            recordsPerPageOptions={PAGE_SIZES}
                                            onRecordsPerPageChange={setPageSize}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            height={'100%'}
                                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                        />
                                    </div>

                                    {/*  detail dok   */}
                                    {selectedItem && (
                                        <Draggable>
                                            <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                                                <div className="overflow-auto">
                                                    <table className={styles.table}>
                                                        <thead>
                                                            <tr>
                                                                <th>No Barang</th>
                                                                <th>Nama Barang</th>
                                                                <th>Satuan</th>
                                                                <th>Kuantitas</th>
                                                                <th>Out Standing</th>
                                                                <th>Tanggal Butuh</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {detailFetch?.map((item: any) => (
                                                                <tr key={item.id_pp}>
                                                                    {/* <td>{headerFetch[0]?.no_lpb}</td>
                                                                    <td  >{headerFetch[0]?.no_sj}</td> */}
                                                                    <td style={{ background: 'white' }}>{item.no_item}</td>
                                                                    <td style={{ background: 'white' }}>{item.diskripsi}</td>
                                                                    <td style={{ background: 'white' }}>{item.satuan}</td>
                                                                    <td style={{ background: 'white' }}>
                                                                        {parseFloat(item.qty).toLocaleString('en-US', {
                                                                            minimumFractionDigits: 2,
                                                                        })}
                                                                    </td>
                                                                    <td style={{ background: 'white' }}>
                                                                        {item.qty_sisa === '0.0000'
                                                                            ? null
                                                                            : parseFloat(item.qty_sisa).toLocaleString('en-US', {
                                                                                minimumFractionDigits: 2,
                                                                            })}
                                                                    </td>
                                                                    <td style={{ background: 'white' }}>{item.tgl_butuh === '' ? null : moment(item.tgl_butuh).format('DD-MM-YYYY')}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <button
                                                    className={`${styles.closeButtonDetailDragable}`}
                                                    onClick={() => {
                                                        closeModal();
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                                </button>
                                            </div>
                                        </Draggable>
                                    )}
                                </div>
                            </TabPanel>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* <div className="my-5 flex justify-between">
                <div className="flex"></div> */}

                {/* <div className="flex">
                   
                    <button type="submit" className="btn btn-secondary mr-1">
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Approval Dokumen
                    </button>
                    <button type="submit" className="btn btn-secondary mr-1">
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Pembatalan
                    </button>
                    <button type="submit" className="btn btn-secondary mr-1">
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Detail Dok
                    </button>
                </div> */}
            {/* </div> */}
            
        </div>
    );
};

export default PPList;
