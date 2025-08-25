import React, { useEffect, useRef, useState } from 'react';
import GridList from './GridList';
import { motion } from 'framer-motion';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import Swal from 'sweetalert2';
import DialogBaruEditBOK from './modal/DialogBaruEditBOK';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

import idIDLocalization from 'public/syncfusion/locale.json';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { usersMenu, viewPeriode } from '@/utils/routines';
import { handleInputChange, HandleSearchKeteranganDataBok, HandleSearchNoDataBok, HandleTgl } from './function/function';
import { RiRefreshFill } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { FaArrowDown, FaCalendar } from 'react-icons/fa';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import withReactContent from 'sweetalert2-react-content';
import { swalDialog } from '../../inventory/ttb/functional/fungsiFormTtb';

const tabKlasifikasiArray = [
    {
        Klasifikasi: 'Semua',
        kelas: 'semua',
    },
    {
        Klasifikasi: 'Terbuka',
        kelas: 'terbuka ',
    },
    {
        Klasifikasi: 'Proses',
        kelas: 'proses',
    },
    {
        Klasifikasi: 'Tertutup',
        kelas: 'tertutup',
    },
];

interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
}

export default function BokList() {
    const { sessionData } = useSession();
    const dispatch = useDispatch();
    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const entitasUser = sessionData?.entitas ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    let items: any = [
        {
            text: 'Form BOK',
        },
        {
            text: 'Daftar BOK',
        },
    ];
    const gridBok = useRef<Grid | any>(null);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const refRefresh = useRef<any>(null);
    const checkboxRef = useRef<any>(null);
    const [periode, setPeriode] = useState<any>('');

    const [tglSekarang, setTglSekarang] = useState(new Date());
    const [tanggalAkhir, setTanggalAkhir] = useState(moment().endOf('month').toDate());

    //components state
    const [rowIdx, setRowIdx] = useState(null);
    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [bokList, setBokList] = useState([]);
    const [isScreenWide, setScreenWide] = useState(false);
    const [originalDataSource, setOriginalDataSource] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [originalNonModified, setOriginalNonModified] = useState([]);
    //modal state
    const [visibleBaruEditBok, setVisibleBaruEditBok] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //crud state
    const [masterState, setMasterState] = useState('');
    const [masterData, setMasterData] = useState({});
    const [filterKlasifikasi, setFilterKlasifikasi] = useState('Semua');
    const [filterState, setFilterState] = useState({
        tanggal_awal: moment(),
        tanggal_akhir: moment().endOf('month'),
        no_bok: '',
        no_kendaraan: '',
        tujuan: '',
        pengemudi: '',
        keterangan: '',
        status_batal: 'N',
    });
    const [checkboxState, setCheckboxState] = useState({
        no_bok: false,
        no_kendaraan: false,
        tujuan: false,
        pengemudi: false,
        keterangan: false,
    });

    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    const refereshData = async () => {
        // console.log('ke hit bro');

        try {
            let param1 = moment(filterState.tanggal_awal).format('YYYY-MM-DD');
            let param2 = moment(filterState.tanggal_akhir).format('YYYY-MM-DD');
            let param3 = checkboxState.no_bok && filterState.no_bok !== '' ? filterState.no_bok : 'all';
            let param4 = checkboxState.no_kendaraan && filterState.no_kendaraan !== '' ? filterState.no_kendaraan : 'all';
            let param5 = checkboxState.tujuan && filterState.tujuan !== '' ? filterState.tujuan : 'all';
            let param6 = checkboxState.pengemudi && filterState.pengemudi !== '' ? filterState.pengemudi : 'all';
            let param7 = checkboxState.keterangan && filterState.keterangan !== '' ? filterState.keterangan : 'all';
            const response = await axios.get(`${apiUrl}/erp/list_bok_dashboard?`, {
                params: {
                    entitas: kode_entitas,
                    param1,
                    param2,
                    param3,
                    param4,
                    param5,
                    param6,
                    param7,
                    param8: filterState.status_batal,
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const transformedData = response.data.data.map((item: any) => {
                return {
                    ...item,
                    liter: isNaN(SpreadNumber(item.liter)) ? 0 : SpreadNumber(item.liter),
                    nominal: isNaN(SpreadNumber(item.nominal)) ? 0 : SpreadNumber(item.nominal),
                    servis: isNaN(SpreadNumber(item.servis)) ? 0 : SpreadNumber(item.servis),
                    kmawal: isNaN(SpreadNumber(item.kmawal)) ? 0 : SpreadNumber(item.kmawal),
                    kmakhir: isNaN(SpreadNumber(item.kmakhir)) ? 0 : SpreadNumber(item.kmakhir),
                    kmjarak: isNaN(SpreadNumber(item.kmjarak)) ? 0 : SpreadNumber(item.kmjarak),
                    jalan: isNaN(SpreadNumber(item.jalan)) ? 0 : SpreadNumber(item.jalan),
                    kenek: isNaN(SpreadNumber(item.kenek)) ? 0 : SpreadNumber(item.kenek),
                    parkir: isNaN(SpreadNumber(item.parkir)) ? 0 : SpreadNumber(item.parkir),
                    tol: isNaN(SpreadNumber(item.tol)) ? 0 : SpreadNumber(item.tol),
                    bongkar: isNaN(SpreadNumber(item.bongkar)) ? 0 : SpreadNumber(item.bongkar),
                    mel: isNaN(SpreadNumber(item.mel)) ? 0 : SpreadNumber(item.mel),
                    lain: isNaN(SpreadNumber(item.lain)) ? 0 : SpreadNumber(item.lain),
                    rasio: isNaN(SpreadNumber(item.rasio)) ? 0 : SpreadNumber(item.rasio),
                    jumlah_mu: isNaN(SpreadNumber(item.jumlah_mu)) ? 0 : SpreadNumber(item.jumlah_mu),
                    pilih: 'N',
                };
            });
            if (filterKlasifikasi === 'Semua') {
                setOriginalDataSource(transformedData);
                gridBok.current.setProperties({ dataSource: transformedData });
                gridBok.current!.refresh();
                setBokList(transformedData);
                setOriginalNonModified(response.data.data);
                setFilterKlasifikasi('Semua');
            } else {
                const temp = transformedData.filter((item: any) => item.st === filterKlasifikasi);

                setOriginalDataSource(transformedData);
                gridBok.current.setProperties({ dataSource: temp });
                gridBok.current!.refresh();
                setBokList(transformedData);
                setOriginalNonModified(response.data.data);
            }
        } catch (error: any) {
            if (error.response.status === 401) {
                console.log('tidak ter otirasi');
            }
        }
    };

    // const HandleSearchNamaDataBesiKom = (cek: any, cek2: any, cek3: any, cek4: any) => {};
    // console.log("bokList",bokList);

    useEffect(() => {
        const handleResize = () => {
            const isWide = window.innerWidth >= 1280;
            setScreenWide(isWide);
            if (!isWide) {
                setSidebarVisible(false); // Hide sidebar by default on small screens
            } else {
                setSidebarVisible(true); // Show sidebar on large screens
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // console.log("kode_entitas",kode_entitas);

    useEffect(() => {
        dispatch(setPageTitle(kode_entitas + ' | BOK'));
        const fetchUserMenu = async () => {
            const kode_menu = '';
            await usersMenu(kode_entitas, userid, '80700')
                .then((res) => {
                    console.log('res', res);
                    const { baru, edit, hapus, cetak } = res;
                    setUserMenu((prevState) => ({
                        ...prevState,
                        baru,
                        edit,
                        hapus,
                        cetak,
                    }));
                })
                .catch((err) => {
                    console.error('Error: ', err);
                });
        };

        if (refRefresh.current && kode_entitas) {
            const fetchData = async () => {
                try {
                    const periode = await viewPeriode(kode_entitas == '99999' ? '999' : kode_entitas);
                    setPeriode(periode);
                } catch (error) {
                    // console.error('Error:', error);
                }
            };

            fetchData();
            refereshData();
            fetchUserMenu();
        }
    }, [kode_entitas]); // Hanya jalankan ketika kode_entitas berubah

    useEffect(() => {
        // Step 2: Ambil elemen dengan ID tertentu
        const checkbox = document.getElementsByClassName('e-checkselectall');

        if (checkbox) {
            checkboxRef.current = checkbox;

            // Step 3: Tetapkan elemen ke Ref
            checkboxRef.current.checked = true; // Centang otomatis
        }
    }, []);

    useEffect(() => {}, []);

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const rowSelecting = (args: any) => {
        setRowIdx(args.rowIndex);
    };

    const handleSelect = (args: any) => {
        const temp = {
            ...args.data,
            liter: String(SpreadNumber(args?.data?.liter)),
            nominal: String(SpreadNumber(args?.data?.nominal)),
            servis: String(SpreadNumber(args?.data?.servis)),
            kmawal: String(SpreadNumber(args?.data?.kmawal)),
            kmakhir: String(SpreadNumber(args?.data?.kmakhir)),
            kmjarak: String(SpreadNumber(args?.data?.kmjarak)),
            jalan: String(SpreadNumber(args?.data?.jalan)),
            kenek: String(SpreadNumber(args?.data?.kenek)),
            parkir: String(SpreadNumber(args?.data?.parkir)),
            tol: String(SpreadNumber(args?.data?.tol)),
            bongkar: String(SpreadNumber(args?.data?.bongkar)),
            mel: String(SpreadNumber(args?.data?.mel)),
            lain: String(SpreadNumber(args?.data?.lain)),
            rasio: String(SpreadNumber(args?.data?.rasio)),
            jumlah_mu: String(SpreadNumber(args?.data?.jumlah_mu)),
        };
        setSelectedRow(temp);
    };

    const pilihTemplate = (args: any) => {
        return (
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id={`hitung_kpi`}
                    className="mx-auto"
                    checked={args.pilih === 'Y'}
                    disabled={args.st === 'Tertutup'}
                    onChange={() => {
                        const temp = args.pilih === 'Y' ? 'N' : 'Y';
                        const tempArray = {
                            ...gridBok.current!.dataSource[args.index],
                            pilih: args.pilih === 'Y' ? 'N' : 'Y',
                        };
                        gridBok.current!.dataSource[args.index] = tempArray;
                        gridBok.current!.refresh();
                    }}
                />
            </div>
        );
    };

    console.log('selectedRow', selectedRow);

    const Cetak_Form_BOK = (onSaveDoc: any = '') => {
        if (Object.keys(selectedRow).length === 0) {
            return Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Pilih Data Terlebihh Dahulu',
            });
        }
        console.log('selectedRow?.kode_fk', selectedRow?.kode_fk);

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let iframe = `
                <html><head>
                <title>Form BOK | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/form_bok?entitas=${kode_entitas}&param1=${
            onSaveDoc !== '' ? onSaveDoc : selectedRow?.kode_fk
        }&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
    const Cetak_Daftar_BOK = () => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        let param1 = moment(filterState.tanggal_awal).format('YYYY-MM-DD');
        let param2 = moment(filterState.tanggal_akhir).format('YYYY-MM-DD');
        let param3 = checkboxState.no_bok && filterState.no_bok !== '' ? filterState.no_bok : 'all';
        let param4 = checkboxState.no_kendaraan && filterState.no_kendaraan !== '' ? filterState.no_kendaraan : 'all';
        let param5 = checkboxState.tujuan && filterState.tujuan !== '' ? filterState.tujuan : 'all';
        let param6 = checkboxState.pengemudi && filterState.pengemudi !== '' ? filterState.pengemudi : 'all';
        let param7 = checkboxState.keterangan && filterState.keterangan !== '' ? filterState.keterangan : 'all';

        let iframe = `
                <html><head>
                <title>Daftar BOK | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/daftar_bok?entitas=${kode_entitas}&param1=${param1}&param2=${param2}&param3=${param3}&param4=${param4}&param5=${param5}&param7=${param7}&param6=${param6}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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

    const handleSelectCetak = (args: any) => {
        if (Object.keys(selectedRow).length === 0) {
            // swal.fire({
            //     title: 'Pilih Data terlebih dahulu.',
            //     icon: 'error',
            // });
            Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Pilih Data Terlebihh Dahulu',
            });
            return;
        }
        if (args.item.text === 'Form BOK') {
            Cetak_Form_BOK('');
        } else {
            Cetak_Daftar_BOK();
        }
    };
    const cekPeriode = (dateNow: any) => {
        console.log('PERIODE EDIT', dateNow);

        const periodeReal = periode.match(/(\d+)\s\w+\s(\d{4})/);
        const peride = periode.split('-')[1].split('s/d')[0];
        console.log('peride', peride);

        if (periodeReal) {
            // Output: "7/2024"

            const tanggal_sekarang = dateNow.split(' ')[0]; // Format: dd-mm-yyyy
            console.log('tanggal_sekarang', dateNow);

            const tanggalSekarangMoment = moment(tanggal_sekarang, 'YYYY-MM-DD').format('DD-MM-YYYY');

            // Parsing periode ke tanggal awal bulan untuk membandingkan
            const dataPeriodeMoment = moment(peride.trimStart(), 'D MMMM YYYY').format('DD-MM-YYYY');

            const momentA = moment(tanggalSekarangMoment, 'DD-MM-YYYY');
            const momentB = moment(dataPeriodeMoment, 'DD-MM-YYYY');

            // Membandingkan apakah b <= a
            const isBeforeOrEqual = momentB.isSameOrBefore(momentA);

            // Membandingkan tanggal
            if (isBeforeOrEqual === false) {
                Swal.fire({
                    icon: 'warning',
                    target: '#main-target',
                    title: 'Tanggal Transaksi Lebih kecil dari tanggal periode',
                });
                return false;
            } else {
                return true;
            }
        } else {
            Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Periode Tidak Valid',
            });
        }
    };
    const handleRecordDoubleClick = (args: any) => {
        if (selectedRow.st === 'Tertutup' || selectedRow.st === 'Proses') {
            return Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Dokumen Proses Atau Tertutup Tidak bisa di edit',
            });
        }

        const isCekPeriode = cekPeriode(selectedRow.tgl_fk);
        if (isCekPeriode === false) {
            return;
        }

        setMasterState('EDIT');
        setVisibleBaruEditBok(true);
    };
    console.log('userMenu', userMenu);

    const handleBatal = (args: any) => {
        if (selectedRow.st === 'Tertutup' || selectedRow.st === 'Proses') {
            return Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Dokumen Proses Atau Tertutup Tidak bisa di Batalkan',
                timer: 3000,
            });
        }

        if (entitasUser != '898') {
            return Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Dokumen hanya bisa di batalkan oleh user pusat',
                timer: 2500,
            });
        }

        if (userid.toUpperCase() === "ADMINISTRATOR" ) {
            
        } else if ( userMenu.hapus !== 'Y') {
            return Swal.fire({
                icon: 'warning',
                target: '#main-target',
                title: 'Dokumen hanya bisa di batalkan oleh user yang memiliki akses hapus',
                timer: 2500,
            });
        }


        withReactContent(swalDialog)
                .fire({
                    title:  `Yakin membatalkan BOK dengan nomor dokumen [ ${selectedRow.no_fk} ]?`,
                    width: '16.4%',
                    target: '#dialogPhuList',
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel', // Menambahkan teks tombol cancel
                    showCancelButton: true, // Menampilkan tombol cancel
                })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        const temp = {
                            ...selectedRow,
                            kode_fk: selectedRow.kode_fk,
                            entitas: kode_entitas,
                            no_fk: selectedRow.no_fk,
                            tgl_fk: moment(selectedRow.tgl_fk).format('YYYY-MM-DD HH:mm:ss'),
                            userid: userid.toUpperCase(),
                            batal: 'Y',
                        };
    
                        console.log('temp batal', temp);
                        const response: any = axios
                            .patch(`${apiUrl}/erp/update_bok_dashboard?`, temp, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            })
                            .then(() => {
                                refereshData().then(() => {
                                    Swal.fire('Batal Berhasil!', '', 'success');
                                });
                            })
                            .catch((res: any) => {
                                if (res) {
                                    console.log(res);
                                    Swal.fire({
                                        title: 'Gagal Simpan',
                                        text: res?.response?.data?.error,
                                        target: '#main-target',
                                        timer: 2000,
                                        icon: 'warning',
                                    });
                                    return;
                                }
                            });
                        // saveDoc()
                    }
                });
        // Swal.fire({
        //     title: `Yakin membatalkan BOK dengan nomor dokumen [ ${selectedRow.no_fk} ]?`,
        //     showDenyButton: true,
        //     confirmButtonText: 'Ya',
        //     denyButtonText: `Tidak`,
        //     target: '#kesini'
        // })
        //     .then((result) => {
        //         /* Read more about isConfirmed, isDenied below */
        //         if (result.isConfirmed) {
        //             const temp = {
        //                 ...selectedRow,
        //                 kode_fk: selectedRow.kode_fk,
        //                 entitas: kode_entitas,
        //                 no_fk: selectedRow.no_fk,
        //                 tgl_fk: moment(selectedRow.tgl_fk).format('YYYY-MM-DD HH:mm:ss'),
        //                 userid: userid.toUpperCase(),
        //                 batal: 'Y',
        //             };

        //             console.log('temp batal', temp);
        //             const response: any = axios
        //                 .patch(`${apiUrl}/erp/update_bok_dashboard?`, temp, {
        //                     headers: {
        //                         Authorization: `Bearer ${token}`,
        //                     },
        //                 })
        //                 .then(() => {
        //                     refereshData().then(() => {
        //                         Swal.fire('Batal Berhasil!', '', 'success');
        //                     });
        //                 })
        //                 .catch((res: any) => {
        //                     if (res) {
        //                         console.log(res);
        //                         Swal.fire({
        //                             title: 'Gagal Simpan',
        //                             text: res?.response?.data?.error,
        //                             target: '#main-target',
        //                             timer: 2000,
        //                             icon: 'warning',
        //                         });
        //                         return;
        //                     }
        //                 });
        //         } else if (result.isDenied) {
        //             return;
        //         }
        //     })
        //     .catch(() => {});

        // const isCekPeriode = cekPeriode(selectedRow.tgl_fk);
        // if (isCekPeriode === false) {
        //     return;
        // }

        // setMasterState('EDIT');
        // setVisibleBaruEditBok(true);
    };

    // const checkboxTemplate = (props: any) => {
    //     console.log("props",props);

    //     return (
    //         <input
    //             className='cursor-pointer'
    //             type="checkbox"
    //             id='pilih'
    //             onChange={() => {
    //                 setBokList((prevList: any) =>
    //                     prevList.map((item: any) =>
    //                         item.kode_fk === props.kode_fk ? { ...item, pilih: props.pilih === 'Y' ? 'N' : 'Y' } : item
    //                     )
    //                 );
    //             }}
    //             checked={props.pilih === 'Y'}
    //             disabled={props.st === 'Tertutup'} // Disable checkbox jika st === "Tertutup"
    //         />
    //     );
    // };

    const filterStatus = (kelas: any) => {
        if (kelas === 'Semua') {
            gridBok.current.setProperties({ dataSource: originalDataSource });
            gridBok.current!.refresh();
            return;
        }
        const temp = originalDataSource.filter((item: any) => item.st === kelas);

        gridBok.current.setProperties({ dataSource: temp });
        gridBok.current!.refresh();

        // setBokList(temp);
    };

    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggal_awal') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_awal: moment(date).format('YYYY-MM-DD'),
            }));
        } else if (tipe === 'tanggal_akhir') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_akhir: moment(date).format('YYYY-MM-DD'),
            }));
        } 
    };

    return (
        <div className="Main overflow-visible" id="main-target">
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
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
            </style>
            {visibleBaruEditBok ? (
                <DialogBaruEditBOK
                    visible={visibleBaruEditBok}
                    onClose={() => {
                        setVisibleBaruEditBok(false);
                        setMasterData({});
                        setMasterState('');
                    }}
                    kode_entitas={kode_entitas}
                    masterState={masterState}
                    masterData={selectedRow}
                    refereshData={refereshData}
                    token={token}
                    userid={userid}
                    Cetak_Form_BOK={Cetak_Form_BOK}
                />
            ) : null}

            <div className="flex items-center gap-3 space-x-2  p-1 ">
                <button
                    className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                    onClick={() => {
                        setVisibleBaruEditBok(true);
                        setMasterState('BARU');
                    }}
                >
                    Baru
                </button>
                <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={handleRecordDoubleClick}>
                    Ubah
                </button>
                <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={handleBatal}>
                    Batal
                </button>
                <button
                    className={`rounded-md px-4 py-1.5 text-xs font-semibold  transition-colors duration-200 ${
                        isSidebarVisible ? 'bg-gray-200 text-gray-500' : 'bg-[#3a3f5c] text-white hover:bg-[#2f3451]'
                    }`}
                    onClick={() => setSidebarVisible(!isSidebarVisible)}
                >
                    Filter
                </button>
                <button
                    onClick={() => {
                        console.log('muncul cetak');
                        setIsDropdownOpen(true);
                    }}
                    className="relative flex items-center gap-1 rounded-md bg-[#3a3f5c] px-4  py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                >
                    Cetak <FaArrowDown />
                    {isDropdownOpen && (
                        <div
                            className="absolute left-0 top-5 z-20 mt-2 w-40 rounded-md border border-gray-300 bg-white shadow-lg"
                            onMouseLeave={() => {
                                console.log('exit cetak');
                                setIsDropdownOpen(false);
                            }}
                        >
                            <ul className="py-1 text-sm text-gray-700">
                                <li className="cursor-pointer px-4 py-2 hover:bg-gray-100" onClick={() => Cetak_Form_BOK('')}>
                                    Form BOK
                                </li>
                                <li className="cursor-pointer px-4 py-2 hover:bg-gray-100" onClick={Cetak_Daftar_BOK}>
                                    Daftar BOK
                                </li>
                            </ul>
                        </div>
                    )}
                </button>

                <Link className="text-xs font-semibold text-gray-700 hover:text-blue-500 " href={`/kcn/ERP/dashboard/biaya-operasional-kendaraan/analisa-bok/AnalisaBOK?tabId=${tabId}`}>
                    Analisa BOK
                </Link>
                <div className="flex items-center space-x-2 border-l border-gray-400 pl-2">
                    <span className="mr-2">Cari</span>
                    <input
                        type="text"
                        id="<No Dokumen>"
                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="<No. Bukti>"
                        name="No_Dokumen_Search"
                        // value={filterState.diameter_real_timbangan}
                        // onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                        onChange={(e: any) => {
                            HandleSearchNoDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                        }}
                        onFocus={(e: any) => {
                            HandleSearchNoDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                        }}
                        // style={{ height: '4vh' }}
                        autoComplete="off"
                    />
                    <input
                        type="text"
                        id="No_Distributor_Search"
                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="<Keterangan>"
                        name="No_Distributor_Search"
                        onChange={(e: any) => {
                            HandleSearchKeteranganDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                        }}
                        onFocus={(e: any) => {
                            HandleSearchKeteranganDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                        }}
                        // style={{ height: '4vh' }}
                        autoComplete="off"
                    />
                </div>
                {' | '}
                <button
                    className="text-xs font-semibold text-gray-700 hover:text-blue-500"
                    onClick={() => {
                        const temp = gridBok.current!.dataSource.map((item: any) => {
                            if (item.st === 'Tertutup') {
                                return {
                                    ...item,
                                    pilih: 'N',
                                };
                            } else {
                                return {
                                    ...item,
                                    pilih: item.pilih === 'Y' ? 'N' : 'Y',
                                };
                            }
                        });
                        gridBok.current!.dataSource = temp;
                        gridBok.current!.refresh();
                    }}
                >
                    Pilih Semua
                </button>
            </div>
            <div className="relative flex  h-full w-full gap-1" id="kesini">
                {isSidebarVisible && (
                    <div className="relative flex min-w-[250px] max-w-[260px] flex-col items-center justify-between overflow-hidden rounded-lg border-blue-400 bg-gray-300">
                        <div className="h-[30px]  w-full bg-[#dedede] py-1 pl-2">
                            Filter
                            <button
                                className="absolute right-3 top-1 flex items-center justify-center rounded-full border border-black p-0.5 text-xs"
                                onClick={() => setSidebarVisible(!isSidebarVisible)}
                            >
                                <IoClose />
                            </button>
                        </div>
                        <div className={`flex h-full w-full flex-col items-center rounded border border-black-light `}>
                            <div className="flex h-full flex-col items-center overflow-x-auto bg-[#dedede] p-1 px-1.5">
                                <div className='flex flex-col'>
                                <label className="mb-0.5 flex items-center gap-2 text-xs font-bold">Tanggal</label>
                            <div className="flex w-full items-center">
                                        <span className="flex h-[5vh] w-[45%] items-center rounded-md border border-gray-300 bg-gray-50 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                            <DatePickerComponent
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                width="100%"
                                                value={moment(filterState.tanggal_awal).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleTgl(args.value, 'tanggal_awal');
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </span>

                                        <label className="mr-1 flex w-[10%] text-xs" style={{ marginBottom: -2 }}>
                                            S/D
                                        </label>
                                        <span className="flex h-[5vh] w-[45%] items-center rounded-md border border-gray-300 bg-gray-50 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                            <DatePickerComponent
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                width="100%"
                                                value={moment(filterState.tanggal_akhir).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleTgl(args.value, 'tanggal_akhir');
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </span>
                            </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_bok}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_bok: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_bok')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_bok"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_bok')}
                                        name="no_bok"
                                        // value={filterState.no_bok}
                                        onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_kendaraan}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_kendaraan: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_kendaraannn')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_kendaraan"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_kendaraan')}
                                        name="no_kendaraan"
                                        value={filterState.no_kendaraan}
                                        onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.tujuan}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    tujuan: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('tujuan')}
                                    </label>
                                    <input
                                        type="text"
                                        id="tujuan"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('tujuan')}
                                        name="tujuan"
                                        value={filterState.tujuan}
                                        onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.pengemudi}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    pengemudi: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('pengemudi')}
                                    </label>
                                    <input
                                        type="text"
                                        id="pengemudi"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('pengemudi')}
                                        name="pengemudi"
                                        value={filterState.pengemudi}
                                        onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.keterangan}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    keterangan: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('keterangan')}
                                    </label>
                                    <input
                                        type="text"
                                        id="keterangan"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('keterangan')}
                                        name="keterangan"
                                        value={filterState.keterangan}
                                        onChange={(e) => handleInputChange(setFilterState, setCheckboxState, e)}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-2 text-xs font-semibold text-gray-700">Status Batal</label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="status_batal"
                                                value="Y"
                                                checked={filterState.status_batal === 'Y'}
                                                onChange={(e) => {
                                                    setFilterState((oldDAta) => ({
                                                        ...oldDAta,
                                                        status_batal: e.target.value,
                                                    }));
                                                }}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Ya</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="status_batal"
                                                value="N"
                                                checked={filterState.status_batal === 'N'}
                                                onChange={(e) => {
                                                    setFilterState((oldDAta) => ({
                                                        ...oldDAta,
                                                        status_batal: e.target.value,
                                                    }));
                                                }}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Tidak</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="status_batal"
                                                value="all"
                                                checked={filterState.status_batal === 'all'}
                                                onChange={(e) => {
                                                    setFilterState((oldDAta) => ({
                                                        ...oldDAta,
                                                        status_batal: e.target.value,
                                                    }));
                                                }}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Semua</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-[10%] w-full items-center justify-center bg-white">
                                <button
                                    onClick={() => refereshData()}
                                    ref={refRefresh}
                                    className="ml-3 flex h-7 items-center rounded-md bg-[#3a3f5c] p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    <RiRefreshFill className="text-md" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={` flex-1 overflow-x-auto rounded  bg-[#dedede] p-2`}>
                    <div className="h-ful w-full rounded bg-white p-1 ">
                        <div className=" flex h-[30px] w-full overflow-x-auto overflow-y-hidden border-b border-gray-300">
                            {tabKlasifikasiArray.map((item: any) => (
                                <motion.button
                                    key={item.Klasifikasi}
                                    onClick={async () => {
                                        setFilterKlasifikasi(item.Klasifikasi);
                                        filterStatus(item.Klasifikasi);
                                    }}
                                    className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${
                                        filterKlasifikasi === item.Klasifikasi ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                    whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.Klasifikasi}
                                </motion.button>
                            ))}
                        </div>
                        <div className="overflow-y-auto">
                            <GridList
                                rowSelecting={rowSelecting}
                                bokList={bokList}
                                handleSelect={handleSelect}
                                handleRecordDoubleClick={handleRecordDoubleClick}
                                formatDate={formatDate}
                                gridBok={gridBok}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
