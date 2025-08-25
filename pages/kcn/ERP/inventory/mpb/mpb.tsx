/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import 'react-tabs/style/react-tabs.css';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';

import styles from './mpblist.module.css';
import Flatpickr from 'react-flatpickr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faCamera, faMagnifyingGlass, faPlay, faList, faSave, faBackward, faPrint, faTrash, faCancel, faFileArchive, faTableList } from '@fortawesome/free-solid-svg-icons';
import SupplierModal from './modal/supplier';
import { FillFromSQL, tanpaKoma, fetchPreferensi, overQTYAll, frmNumber } from '@/utils/routines';
import { Tab } from '@headlessui/react';

import Image from 'next/image';
import { faSort, faSortUp, faSortDown, faCircle, faCirclePlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';

import TabelDetailMpb from './component/tabelDetailMpb';
import axios from 'axios';
import moment from 'moment';
import { generateNU } from '@/utils/routines';
import Swal from 'sweetalert2';
// import Qty2QtyStd32 from './component/routineLokal';
import TableJurnal from './component/tabelDetailJurnal';
import AkunDlg from './modal/akundlg';
import SupplierModalJurnal from './modal/supplierJurnal';
import SubledgerModal from './modal/subledger';
import { ConstructionOutlined } from '@mui/icons-material';
import { useSession } from '@/pages/api/sessionContext';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
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
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
import Link from 'next/link';
import { SpreadNumber } from '../../fa/fpp/utils';
import { cekDataDiDatabase } from '@/utils/global/fungsi';
L10n.load(idIDLocalization);

// interface mpbMainFormProps {
//     userid: any;
//     kode_entitas: any;
//     kode_user: any;
// }

const mpbMainForm = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';

    // Perubahan tgl 2025-05-23
    const nip = sessionData?.nip ?? '';
    const entitas = sessionData?.entitas ?? '';
    const token = sessionData?.token ?? '';
    const kode_jabatan = sessionData?.kode_jabatan ?? '';
    //=====

    if (isLoading) {
        return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const routerMPB = useRouter();
    const mounted = useRef(false);
    const [dlgSupplier, setdlgSupplier] = useState(false);
    const [mTglMpb, mSetTglMpb] = useState(moment()); // useState<any>(new Date());
    const [mKodeSupp, mSetKodeSupp] = useState('');
    const [suppSelected, setSuppSelected] = useState('');
    const [mNopol, mSetNopol] = useState('');
    const [mPengemudi, mSetPengemudi] = useState('');
    const [apiGudang, setApiGudang] = useState<any[]>([]);
    const [apiVia, setApiVia] = useState<any[]>([]);
    const [mKodeGudang, mSetkodeGudang] = useState('');
    const [mVia, mSetVia] = useState('');
    const [selectedVia, setSelectedVia] = useState<any[]>(['']);
    const [dKenaPajak, dSetKenaPajak] = useState('');
    const [dDiskonDok, dSetDiskonDok] = useState(0);
    const [nominalDiskon, setNominalDiskon] = useState(0);
    const [mTotalRp, mSetTotalRp] = useState(0);
    const [dTotalDiskonRp, dSetTotalDiskonRp] = useState(0);
    const [dTotalPajakRp, dSetTotalPajakRp] = useState(0);
    const [mNettoRp, mSetNettoRp] = useState(0);
    const [mStatus, mSetStatus] = useState('');
    const [mTglUpdate, mSetTglUpdate] = useState('');
    const [mNamaSupp, mSetNamaSupp] = useState('');
    const [mNamaGudang, mSetNamaGudang] = useState('');
    const [mKodeAkunHutang, mSetKodeAkunHutang] = useState('');
    const [mNoHutang, mSetNoHutang] = useState('');
    const [mNamaHutang, mSetNamaHutang] = useState('');
    const [mTipeHutang, mSetTipeHutang] = useState('');
    const [mTipeSupp, mSetTipeSupp] = useState('');
    const [mNoSupp, mSetNoSupp] = useState('');
    const [mPajak, mSetPajak] = useState('');
    const [mKodeAkunPajakbeli, mSetKodeAkunPajakBeli] = useState('');
    const [mNoPajakbeli, mSetNoPajakBeli] = useState('');
    const [mNamaPajakbeli, mSetNamaPajakBeli] = useState('');
    const [mTipePajakbeli, mSetTipePajakBeli] = useState('');
    const [activeTab, setActiveTab] = useState('data_barang');

    const [dKodePajak, dSetKodePajak] = useState('');
    const [dKodeMu, dSetKodeMu] = useState('');
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const [dKirimMU, dSetKirimMU] = useState('');
    const [mTotalBeratHeader, mSetTotalBeratHeader] = useState(null);
    const [mCatatan, mSetCatatan] = useState('');

    const gridDetailMPB = useRef<any>(null);

    const [dataDetail, setDataDetail] = useState({ nodes: [] });
    const { x_ } = routerMPB.query;

    interface QueryParams {
        [key: string]: string;
    }
    let decodedData: string = '';
    let pJenisValue: any, pKodeMpbValue: any, pNoMpbValue: any;

    if (typeof x_ === 'string') {
        decodedData = Buffer.from(x_, 'base64').toString('ascii');

        const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
            const [key, value] = keyValue.split('=');
            acc[key] = value;
            return acc;
        }, {} as QueryParams);

        const { entitas, kode_mpb, no_mpb, jenis } = queryParams;
        pKodeMpbValue = kode_mpb;
        pJenisValue = jenis;
        pNoMpbValue = no_mpb;
    }

    // const theme = useTheme({
    //     Header: `
    //         .th {
    //             border-bottom: 1px solid #a0a8ae;
    //             text-align: center; /* Center align header text */
    //         }
    //     `,
    //     Row: `
    //         &:nth-of-type(odd) {
    //             background-color: #f9fafb;
    //         }
    //         &:nth-of-type(even) {
    //             background-color: white;
    //         }
    //         &:not(:last-of-type) .td {
    //             border-bottom: 1px solid #a0a8ae;
    //         }
    //     `,
    //     BaseCell: `
    //         &:not(:last-of-type) {
    //             border-right: 1px solid #a0a8ae;
    //         }
    //         text-align: center; /* Center align cell content */
    //     `,
    //     Table: `
    //     --data-table-library_grid-template-columns: repeat(10, 1fr); /* Default layout */

    //     /* Media query for smaller screens */
    //     @media screen and (max-width: 768px) {
    //         --data-table-library_grid-template-columns: repeat(6, 1fr); /* Adjust column layout for smaller screens */
    //     }
    // `,
    // });

    // ===============JURNAL==========================================================================================
    const [dataJurnal, setDataJurnal] = useState({ nodes: [] });
    const [selectcellid_pbValue, setselectcellid_pbValue] = useState<any>('');
    const [nilaiValueNoAkun, setNilaiValueNoAKun] = useState('');
    const [nilaiValueNamaAkun, setNilaiValueNamaAkun] = useState('');
    const [totalNum, setTotalNum] = useState(0);
    const [tipeValue, setTipeValue] = useState('');
    const [modalAkunDlg, setModalAkunDlg] = useState(false);
    const [modalTipeCari, setModalTipeCari] = useState('');
    const [kodeAkunPengiriman, setkodeAkunPengiriman] = useState('');
    const [noAkunPengiriman, setnoAkunPengiriman] = useState('');
    const [namaAkunPengiriman, setnamaAkunPengiriman] = useState('');
    const [tipeAkunPengiriman, settipeAkunPengiriman] = useState('');
    const [kodeAkunKas, setkodeAkunKas] = useState('');
    const [noAkunKas, setnoAkunKas] = useState('');
    const [namaAkunKas, setnamaAkunKas] = useState('');
    const [tipeAkunKas, settipeAkunKas] = useState('');
    const [kodeAkunDiskonBeli, setkodeAkunDiskonBeli] = useState('');
    const [noAkunDiskonBeli, setnoAkunDiskonBeli] = useState('');
    const [namaAkunDiskonBeli, setnamaAkunDiskonBeli] = useState('');
    const [tipeAkunDiskonBeli, settipeAkunDiskonBeli] = useState('');
    const [tipeSupp, settipeSupp] = useState('');
    const [kodeAkunBeban, setkodeAkunBeban] = useState('');
    const [noBeban, setnoBeban] = useState('');
    const [namaBeban, setnamaBeban] = useState('');
    const [tipeBeban, settipeBeban] = useState('');
    const [kirimMU, setkirimMU] = useState(0);
    const [kodeAkunPajakBeli, setkodeAkunPajakBeli] = useState('');
    const [noPajakBeli, setnoPajakBeli] = useState('');
    const [namaPajakBeli, setnamaPajakBeli] = useState('');
    const [tipePajakBeli, settipePajakBeli] = useState('');
    const [namaRelasi, setnamaRelasi] = useState('');
    const [namaTermin, setnamaTermin] = useState('');
    const [kodeAkunHutang, setkodeAkunHutang] = useState('');
    const [noHutang, setnoHutang] = useState('');
    const [namaHutang, setnamaHutang] = useState('');
    const [tipeHutang, settipeHutang] = useState('');
    const [kurs, setkurs] = useState(0);
    const [kodeSupp, setkodeSupp] = useState('');
    const [noSupp, setnoSupp] = useState('');
    const [kodeDept, setKodeDept] = useState('');
    const [modalSuppJurnal, setModalSuppJurnal] = useState(false);
    const [modalSubledger, setModalSubledger] = useState(false);
    const [totalDebet, setTotalDebet] = useState(0);
    const [totalKredit, setTotalKredit] = useState(0);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [tombolSimpan, setTombolSimpan] = useState(false);
    const [disabledSimpan, setDisabledSimpan] = useState(false);

    // const handleUpdateJurnal = (value: any, id: any, property: any) => {
    //     let value2: any;

    //         value2 = value

    //     setDataJurnal((state: any) => {
    //         const updatedNodes = state.nodes.map((node: any) => {
    //             if (value2 == '0.00') {
    //             } else {
    //                 if (node.id_dokumen === id) {
    //                     if (property === 'debet_rp') {
    //                         const debet_rp = document.getElementById('debet_rp' + node.id_dokumen) as HTMLInputElement;
    //                         const kredit_rp = document.getElementById('kredit_rp' + node.id_dokumen) as HTMLInputElement;
    //                         const jumlah_mu = document.getElementById('jumlah_mu' + node.id_dokumen) as HTMLInputElement;
    //                         if (debet_rp) {
    //                             // if (value.includes(',')) {
    //                             //     debet_rp.value = value;
    //                             //     jumlah_mu.value = value;
    //                             // } else {
    //                             //     debet_rp.value = SpreadNumber(value);
    //                             //     jumlah_mu.value = SpreadNumber(value);
    //                             // }
    //                             debet_rp.value = String(SpreadNumber(tanpaKoma(String(value2))));
    //                             kredit_rp.value = String(SpreadNumber(0));
    //                             jumlah_mu.value = String(SpreadNumber(tanpaKoma(String(value2))));
    //                         }
    //                         return {
    //                             ...node,
    //                             [property]: SpreadNumber(tanpaKoma(String(value2))),
    //                             kredit_rp: '0.00',
    //                             jumlah_mu: SpreadNumber(tanpaKoma(String(value2))),
    //                             jumlah_rp: SpreadNumber(tanpaKoma(String(value2))),
    //                         };
    //                     }
    //                     if (property === 'kredit_rp') {
    //                         const debet_rp = document.getElementById('debet_rp' + node.id_dokumen) as HTMLInputElement;
    //                         const kredit_rp = document.getElementById('kredit_rp' + node.id_dokumen) as HTMLInputElement;
    //                         const jumlah_mu = document.getElementById('jumlah_mu' + node.id_dokumen) as HTMLInputElement;

    //                         if (kredit_rp) {
    //                             // if (value.includes(',')) {
    //                             //     kredit_rp.value = value;
    //                             //     jumlah_mu.value = value;
    //                             // } else {
    //                             //     kredit_rp.value = SpreadNumber(value);
    //                             //     jumlah_mu.value = SpreadNumber(value * -1);
    //                             // }
    //                             debet_rp.value = String(SpreadNumber(0));
    //                             kredit_rp.value = String(SpreadNumber(tanpaKoma(String(value2))));
    //                             jumlah_mu.value = String(SpreadNumber(SpreadNumber(tanpaKoma(String(value2))) * -1));
    //                         }
    //                         let jumlah_mu_modified;
    //                         if (jumlah_mu_modified === -0) {
    //                             jumlah_mu_modified = 0;
    //                         } else {
    //                             jumlah_mu_modified = String(SpreadNumber(tanpaKoma(String(value2))) * -1);
    //                         }

    //                         return {
    //                             ...node,
    //                             [property]: SpreadNumber(tanpaKoma(String(value2))),
    //                             debet_rp: '0.00',
    //                             jumlah_mu: SpreadNumber(tanpaKoma(String(jumlah_mu_modified))),
    //                             jumlah_rp: SpreadNumber(tanpaKoma(String(jumlah_mu_modified))),
    //                         };
    //                     }
    //                     // return {
    //                     //     ...node,
    //                     //     [property]: value,
    //                     //     jumlah_mu: value,
    //                     //     jumlah_rp: value,
    //                     // };
    //                 }
    //             }
    //             return node;
    //         });
    //         return {
    //             ...state,
    //             nodes: updatedNodes,
    //         };
    //     });
    // };

    const handleUpdateJurnal = () => {};
    const handleselectcell = async (vid_pb: any) => {
        setselectcellid_pbValue(vid_pb);
    };

    const handleModalAkunChange = (value: any, tipe: string, id: any) => {
        setTotalNum((prevTotal) => prevTotal + Number(id));
        setRowId(id);

        if (tipe === 'tipeNoAkun') {
            setNilaiValueNoAKun(value);
            setNilaiValueNamaAkun('');
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === 'tipeNamaAkun') {
            setNilaiValueNoAKun('');
            setNilaiValueNamaAkun(value);
            setTipeValue(tipe);
            setModalAkunDlg(true);
        } else if (tipe === 'dept') {
            setDataJurnal((state: any) => ({
                ...state,
                nodes: state.nodes.map((node: any) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            kode_dept: value,
                        };
                    }
                    return node;
                }),
            }));
        }
    };

    const handleModalAkun = async (tipe: string, id: any, jenis_jurnal: any, kode_akun: any) => {
        setRowId(id);
        if (tipe === 'tipeNoAkun') {
            setNilaiValueNoAKun('');
            setNilaiValueNamaAkun('');
            setModalAkunDlg(true);
            setModalTipeCari('searchno_akun');
        } else if (tipe === 'tipeNamaAkun') {
            setNilaiValueNoAKun('');
            setNilaiValueNamaAkun('');
            setModalAkunDlg(true);
            setModalTipeCari('searchnama_akun');
        } else if (tipe === 'supp_ledger') {
            const a: any = dataJurnal.nodes[0];
            if (dataJurnal.nodes.length > 0 && a.no_akun !== '') {
                if (jenis_jurnal === 'Hutang') {
                    setModalSuppJurnal(true);
                } else {
                    const cekSubledger = await axios.get(`${apiUrl}/erp/cek_subledger?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: kode_akun,
                        },
                    });
                    const responCekSubledger = cekSubledger.data.data;

                    if (responCekSubledger[0].subledger === 'Y') {
                        setModalSubledger(true);
                    } else {
                        // alert('Tidak memiliki akun subledger');
                        Swal.fire({
                            title: 'Subledger',
                            text: 'Akun yang dipilih tidak memiliki akun subledger',
                            icon: 'warning',
                        });
                    }
                    // if(cek_subledger) api {
                    //     if N maka blocking N
                    //     alert('Blocking');
                    //     if Y maka munculkan modal subledger
                    //             select kode_subledger,no_subledger,nama_subledger,
                    //             concat(no_subledger,'-',nama_subledger) as subledger, aktif
                    //   from tb_m_subledger
                    // }
                }
            } else {
                alert('silahkan pilih akun dulu');
                // console.log('silahkan pilig akun dilu' + id + jenis_jurnal);
            }
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSubmitJurnal = () => {
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataJurnal.nodes.length + 1;

        const newNode = {
            kode_dokumen: '',
            id_dokumen: id,
            id: id,
            dokumen: 'MPB',
            tgl_dokumen: '',
            kode_akun: '',
            no_akun: '',
            nama_akun: '',
            kode_subledger: '',
            no_subledger: '',
            nama_subledger: '',
            kurs: 1.0,
            kode_mu: 'IDR',
            debet_rp: '0.00',
            kredit_rp: '0.00',
            jumlah_rp: '0.00',
            jumlah_mu: '0.00',
            catatan: '',
            persen: 0,
            kode_dept: kodeDept,
            kode_kerja: '',
            approval: 'N',
            posting: 'N',
            rekonsiliasi: 'N',
            tgl_rekonsil: '',
            userid: '',
            tgl_update: '',
            nama_dept: '',
            nama_kerja: '',
            isledger: '',
            subledger: '',
            tipe: '',
            no_warkat: '',
            tgl_valuta: '',
            no_kerja: '',
        };

        const hasEmptyFields = dataJurnal.nodes.some((row: { no_akun: string }) => row.no_akun === '');
        const hasQtyNol = dataJurnal.nodes.some((row: { jumlah_mu: number }) => row.jumlah_mu <= 0);

        if (hasEmptyFields) {
            Swal.fire({
                title: 'Harap isi Data Akun sebelum tambah data.',
                icon: 'error',
            });
            throw 'exit';
        } else if (hasQtyNol) {
            Swal.fire({
                title: 'Jumlah  tidak boleh lebih kecil atau sama dengan Nol.',
                icon: 'error',
            });
            throw 'exit';
        } else if (selisih !== 0) {
            Swal.fire({
                title: 'Selisih',
                text: 'Terdapat nilai selisih antara Debit dan Kredit',
                icon: 'error',
            });
            throw 'exit';
        } else {
            setDataJurnal((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        }
    };

    const handleRemoveJurnal = () => {
        if (dataJurnal.nodes.length === 1) {
            Swal.fire({
                title: 'Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.',
                icon: 'error',
            });
        } else {
            Swal.fire({
                title: `Hapus Data Akun baris ${selectcellid_pbValue} ?`,
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'Batal',
            }).then((result) => {
                if (result.isConfirmed) {
                    setDataJurnal((state) => ({
                        ...state,
                        nodes: state.nodes.filter((node: any) => node.id !== selectcellid_pbValue),
                    }));
                }
            });
        }
    };

    const handleSelectedDataJurnal = async (dataObject: any, tipe: any) => {
        if (tipe === 'akun_jurnal') {
            const { selectedkode_akun, selectedno_akun, selectednama_akun, selectedtipe } = dataObject;

            // alert(selectedtipe);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            kode_akun: selectedkode_akun,
                            no_akun: selectedno_akun,
                            nama_akun: selectednama_akun,
                            tipe: selectedtipe,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (tipe === 'supp_jurnal') {
            // hutang only
            const { selectedData, selectedNoSupp, selectedKodeSupp } = dataObject;
            // console.log(dataObject);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            catatan: 'Hutang ' + selectedData + ', PB No: ' + mNoMPB,
                            nama_subledger: selectedData,
                            no_subledger: selectedKodeSupp,
                            subledger: selectedNoSupp + ' - ' + selectedData,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (tipe === 'subledger') {
            const { selectedAktif, selectedKode, selectedNamaSubledger, selectedNoSubledger, selectedSubledger } = dataObject;
            // console.log(dataObject);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            catatan: '-', // sementara
                            nama_subledger: selectedNamaSubledger,
                            no_subledger: selectedNoSubledger,
                            subledger: selectedSubledger,
                        };
                    } else {
                        return node;
                    }
                });

                return {
                    nodes: newNodes,
                };
            });
        }
    };

    const [selisih, setSelisih] = useState(0);
    useEffect(() => {
        const totalDebetRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            return total + SpreadNumber(node.debet_rp);
        }, 0);

        const totalKreditRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            return total + SpreadNumber(node.kredit_rp);
        }, 0);

        setTotalDebet(totalDebetRp);
        setTotalKredit(totalKreditRp);
        setSelisih(totalDebetRp - totalKreditRp);
    }, [dataJurnal]);

    console.log('fieldKosong', gridDetailMPB);
    const autojurnal = async () => {
        setTombolSimpan(true);
        const fieldKosong = gridDetailMPB.current.dataSource.every((row: { nama_item: string }) => row.nama_item === '');

        if (fieldKosong) {
            Swal.fire({
                title: 'Data detail barang masih kosong',
                icon: 'error',
            });
            throw 'exit';
        }

        if (mTotalRp < 0) {
            Swal.fire({
                title: 'Periksa kuantitas atau harga barang.',
                icon: 'error',
            });
            throw 'exit';
        } else {
            // console.log('dataDetail', dataDetail);
            const nodes = gridDetailMPB.current!.dataSource;
            let totalDiskonMu = 0,
                totalBerat = 0,
                totpsd = 0,
                kode_psd = '',
                psd = 0,
                pajak = 0,
                kirim_mu = 0;

            const newNodes = nodes.map((node: any) => {
                let pajak_mu = SpreadNumber(node.pajak_mu);
                let kurs_pajak = SpreadNumber(node.kurs_pajak);
                let jumlah_rp = SpreadNumber(node.jumlah_rp);

                pajak += pajak_mu * kurs_pajak;

                if (node.include === 'I') {
                    // console.log('masuk 1');
                    totpsd += jumlah_rp - pajak_mu * kurs_pajak;
                } else {
                    // console.log('masuk 2');
                    totpsd += jumlah_rp;
                }

                if (node.kode_akun_persedian !== '') {
                    kode_psd = node.kode_akun_persediaan;

                    if (node.include === 'I') {
                        psd += pajak_mu;
                        // console.log(psd);
                    } else {
                        psd += jumlah_rp;
                    }
                }

                return {
                    ...node,
                };
            });

            // gridDetailMPB.current!.dataSource = newNodes;
            // hapus semua
            setDataJurnal((state) => ({
                ...state,
                nodes: state.nodes.filter((node: any) => node.id_mpb === -1),
            }));

            let i = 1; // id_dokumen
            // hutang supplier
            if (tipeSupp !== 'cabang') {
                let LkodeAkunHutang, LNoHutang, LNamaHutang, LTipeHutang;
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result) => {
                        LkodeAkunHutang = result[0].kode_akun_hutang === '' || result[0].kode_akun_hutang === null ? '' : result[0].kode_akun_hutang;
                        LNoHutang = result[0].no_hutang === '' || result[0].no_hutang === null ? '' : result[0].no_hutang;
                        LNamaHutang = result[0].nama_hutang === '' || result[0].nama_hutang === null ? '' : result[0].nama_hutang;
                        LTipeHutang = result[0].tipe_hutang === '' || result[0].tipe_hutang === null ? '' : result[0].tipe_hutang;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                // const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'MPB',
                    tgl_dokumen: '',
                    kode_akun: LkodeAkunHutang,
                    no_akun: LNoHutang,
                    nama_akun: LNamaHutang,
                    tipe: LTipeHutang,
                    kode_subledger: mKodeSupp,
                    no_subledger: mNoSupp,
                    nama_subledger: mNamaSupp,
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: SpreadNumber(totpsd + pajak),
                    kredit_rp: '0.00',
                    jumlah_rp: SpreadNumber(totpsd + pajak),
                    jumlah_mu: SpreadNumber(totpsd + pajak),
                    catatan: 'Pengurangan Hutang Supplier ' + mNamaSupp + ', MPB No: ' + mNoMPB,
                    persen: 0,
                    kode_dept: kodeDept,
                    kode_kerja: '',
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: '',
                    userid: kode_user,
                    tgl_update: '',
                    nama_dept: '',
                    nama_kerja: '',
                    isledger: '',
                    subledger: mNoSupp + '-' + mNamaSupp,
                    no_warkat: '',
                    tgl_valuta: '',
                    no_kerja: '',
                };
                // console.log('totpsd ' + totpsd);
                // console.log('pajak ' + pajak);
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNodeJurnal),
                }));
                i++;
            } else {
                let LkodeAkunHutang, LNoHutang, LNamaHutang, LTipeHutang;
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result) => {
                        LkodeAkunHutang = result[0].kode_akun_hutang === '' || result[0].kode_akun_hutang === null ? '' : result[0].kode_akun_hutang;
                        LNoHutang = result[0].no_hutang === '' || result[0].no_hutang === null ? '' : result[0].no_hutang;
                        LNamaHutang = result[0].nama_hutang === '' || result[0].nama_hutang === null ? '' : result[0].nama_hutang;
                        LTipeHutang = result[0].tipe_hutang === '' || result[0].tipe_hutang === null ? '' : result[0].tipe_hutang;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                // const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'MPB',
                    tgl_dokumen: '',
                    kode_akun: LkodeAkunHutang,
                    no_akun: LNoHutang,
                    nama_akun: LNamaHutang,
                    tipe: LTipeHutang,
                    kode_subledger: mKodeSupp,
                    no_subledger: mNoSupp,
                    nama_subledger: mNamaSupp,
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: SpreadNumber(totpsd + pajak),
                    kredit_rp: '0.00',
                    jumlah_rp: SpreadNumber(totpsd + pajak),
                    jumlah_mu: SpreadNumber(totpsd + pajak),
                    catatan: 'Pengurangan Hutang Supplier ' + mNamaSupp + ', MPB No: ' + mNoMPB,
                    persen: 0,
                    kode_dept: kodeDept,
                    kode_kerja: '',
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: '',
                    userid: kode_user,
                    tgl_update: '',
                    nama_dept: '',
                    nama_kerja: '',
                    isledger: '',
                    subledger: '',
                    no_warkat: '',
                    tgl_valuta: '',
                    no_kerja: '',
                };
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNodeJurnal),
                }));
                i++;
            }

            // console.log('Nilai Pajak', pajak);
            //masukan akun pajak
            if (pajak > 0) {
                let LkodeAkunPajakBeli, LNoPajakBeli, LNamaPajakBeli, LTipePajakBeli;
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result) => {
                        LkodeAkunPajakBeli = result[0].kode_akun_pajakbeli === '' || result[0].kode_akun_pajakbeli === null ? '' : result[0].kode_akun_pajakbeli;
                        LNoPajakBeli = result[0].no_pajakbeli === '' || result[0].no_pajakbeli === null ? '' : result[0].no_pajakbeli;
                        LNamaPajakBeli = result[0].nama_pajakbeli === '' || result[0].nama_pajakbeli === null ? '' : result[0].nama_pajakbeli;
                        LTipePajakBeli = result[0].tipe_pajakbeli === '' || result[0].tipe_pajakbeli === null ? '' : result[0].tipe_pajakbeli;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                // const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'MPB',
                    tgl_dokumen: '',
                    kode_akun: mKodeAkunPajakbeli,
                    no_akun: mNoPajakbeli,
                    nama_akun: mNamaPajakbeli,
                    tipe: mTipePajakbeli,
                    kode_subledger: null,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00',
                    kredit_rp: SpreadNumber(pajak),
                    jumlah_rp: SpreadNumber(pajak * -1),
                    jumlah_mu: SpreadNumber(pajak * -1),
                    catatan: 'Pengurangan Pajak ' + mNamaSupp + ', MPB No: ' + mNoMPB,
                    persen: 0,
                    kode_dept: kodeDept,
                    kode_kerja: '',
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: '',
                    userid: kode_user,
                    tgl_update: '',
                    nama_dept: '',
                    nama_kerja: '',
                    isledger: '',
                    subledger: '',
                    no_warkat: '',
                    tgl_valuta: '',
                    no_kerja: '',
                };
                // console.log(mKodeAkunPajakbeli);
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNodeJurnal),
                }));
                i++;
            }

            if (kode_psd !== '') {
                var AkunPersediaan = await axios.get(`${apiUrl}/erp/akun_jurnal_by_id?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kode_psd,
                        param2: 'all',
                        param3: 'all',
                    },
                });
                const resAkunPersediaan = AkunPersediaan.data.data;

                // Tambahkan node baru dengan ID yang diinkremen
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'MPB',
                    tgl_dokumen: '',
                    kode_akun: kode_psd,
                    no_akun: resAkunPersediaan[0].no_akun,
                    nama_akun: resAkunPersediaan[0].nama_akun,
                    tipe: resAkunPersediaan[0].tipe,
                    kode_subledger: null,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00', //psd
                    kredit_rp: SpreadNumber(totpsd),
                    jumlah_rp: SpreadNumber(totpsd * -1), //psd
                    jumlah_mu: SpreadNumber(totpsd * -1), //psd
                    catatan: 'Memo Pengembalian Barang No: ' + mNoMPB,
                    persen: 0,
                    kode_dept: kodeDept,
                    kode_kerja: '',
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: '',
                    userid: kode_user,
                    tgl_update: '',
                    nama_dept: '',
                    nama_kerja: '',
                    isledger: '',
                    subledger: '',
                    no_warkat: '',
                    tgl_valuta: '',
                    no_kerja: '',
                };

                // Tambahkan node baru ke state dan inkremen nilai i
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNodeJurnal),
                }));

                i++;
            }
        }
        // ``;
    };
    //================================END JURNAL=============================================//

    const handleSelectedData = (
        selectedData: any,
        selectedNoSuppValue: any,
        selectedKodeSuppValue: any,
        selectedNamaSuppValue: any,
        selecttedKodeAkunPajakBeli: any,
        selectedNoPajakBeli: any,
        selectedNamaPajakBeli: any,
        selectedTipePajakBeli: any
    ) => {
        setSuppSelected(selectedData);
        mSetNoSupp(selectedNoSuppValue);
        mSetKodeSupp(selectedKodeSuppValue);
        mSetNamaSupp(selectedNamaSuppValue);
        mSetKodeAkunPajakBeli(selecttedKodeAkunPajakBeli);
        mSetNoPajakBeli(selectedNoPajakBeli);
        mSetNamaPajakBeli(selectedNamaPajakBeli);
        mSetTipePajakBeli(selectedTipePajakBeli);
    };

    const handleSelectOnChange = (e: any, tipe: any) => {
        const selectedValue = e.target.value;
        if (tipe === 'kode_gudang') {
            mSetkodeGudang(selectedValue);
        } else if (tipe === 'via') {
            mSetVia(selectedValue);
            // setKodeVia(selectedValue);
        } else if (tipe === 'supplier') {
            mSetNamaSupp(selectedValue);
            setdlgSupplier(true);
            // setKodeSuppValue(selectedValue);
        } else if (tipe === 'dokumen') {
            // setDokumen(selectedValue);
        } else if (tipe === 'pengemudi') {
            // setPengemudi(selectedValue);
        } else if (tipe === 'nopol') {
            // setNopol(selectedValue);
        } else if (tipe === 'catatan') {
            mSetCatatan(selectedValue);
        }
    };

    const [mNoMPB, mSetNoMPB] = useState('');
    const [mKodeMPB, mSetKodeMPB] = useState('');
    const [rowid, setRowId] = useState<any>(0);

    // async function test2() {
    //     const modifiedDataJurnal = {
    //         ...dataJurnal,
    //         nodes: dataJurnal.nodes.map((node: any) => ({
    //             ...node,
    //             debet_rp: nilaiBaru, //SpreadNumber(node.debet_rp),
    //             kredit_rp: SpreadNumber(node.kredit_rp),
    //             jumlah_mu: SpreadNumber(node.jumlah_mu),
    //             jumlah_rp: SpreadNumber(node.jumlah_rp),
    //         })),
    //     };
    //     return modifiedDataJurnal;
    // }

    const saveDoc = async (updateJurnalEdit: any) => {
        try {
            setDisabledSimpan(true);

            // console.log(updateJurnalEdit);
            const detailMpb: any = dataDetail.nodes[0];
            const CdataJurnal: any = dataJurnal.nodes[0];
            // console.log(kode);
            if (detailMpb) {
                var { kode_item }: { kode_item: any } = detailMpb;
            } else {
                var kode_item: any = '';
            }

            if (!mKodeSupp) {
                Swal.fire({
                    title: 'Silahkan pilih supplier',
                    icon: 'warning',
                });
            } else if (!mKodeGudang) {
                Swal.fire({
                    title: 'Gudang belum diisi.',
                    icon: 'warning',
                });
            } else if (!mVia) {
                Swal.fire({
                    title: 'Ekspedisi belum diisi',
                    icon: 'warning',
                });
            } else if (!mNopol) {
                Swal.fire({
                    title: 'Nopol belum diisi',
                    icon: 'warning',
                });
            } else if (!mPengemudi) {
                Swal.fire({
                    title: 'Pengemudi belum diisi',
                    icon: 'warning',
                });
            } else if (gridDetailMPB.current.dataSource.length === 1 && kode_item === '') {
                Swal.fire({
                    title: 'Silahkan Pilih Data Barang MPB',
                    icon: 'warning',
                });
            } else if (gridDetailMPB.current.dataSource.length < 1 && kode_item === '') {
                // const fieldKosong = dataDetailDlg.nodes.some((row: { diskripsi: string }) => row.diskripsi === '');
                Swal.fire({
                    title: 'Data detail kosong',
                    icon: 'warning',
                });
            } else if (dataJurnal.nodes.length === 1 && SpreadNumber(CdataJurnal.jumlah_mu) === 0) {
                Swal.fire({
                    title: 'Jurnal',
                    text: 'Silahkan Lakukan Auto Jurnal Terlebih dulu. 11',
                    icon: 'warning',
                });
            } else {
                //  ==========CEK STOK==========
                let successCount = 0;
                let totalDetail = gridDetailMPB.current.dataSource.length;
                let cekOverQtyAll = false;
                let promises = gridDetailMPB.current.dataSource.map(async (item: any) => {
                    // console.log(item.kode_item, mKodeGudang, mKodeMPB, SpreadNumber(item.qty), 'jenis');
                    // console.log(kode_entitas, kodeGudang, item.kode_item, moment().format('YYYY-MM-DD'), item.kode_do, item.qty, 'spm');
                    return overQTYAll(kode_entitas, mKodeGudang, item.kode_item, moment().format('YYYY-MM-DD HH:mm:ss'), mKodeMPB, SpreadNumber(item.qty), 'mpb', 'Kuantitas Standar MPB')
                        .then((result) => {
                            if (result === true) {
                                // noting
                            } else {
                                // console.log('lolos', item.kode_item);
                                successCount++;
                                if (successCount === totalDetail) {
                                    cekOverQtyAll = true;
                                    // console.log('Semua berhasil');
                                }
                            }
                        })
                        .catch((error) => {
                            if (error === 'exit') {
                                //exit
                            } else {
                                // console.log(error);
                            }
                        });
                });
                //? ==========END CEK STOK==========

                Promise.all(promises).then(async () => {
                    if (cekOverQtyAll) {
                        // console.log(dataDetail.nodes);

                        const dTotalRpFromDetail = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => total + SpreadNumber(detailItem.jumlah_mu), 0);

                        const dTotalDiskonRP = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.qty) * (SpreadNumber(detailItem.diskon_mu) * SpreadNumber(detailItem.kurs));
                        }, 0);
                        //SpreadNumber(detailItem.diskon_mu), 0);

                        const dTotalPotonganRP = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.potongan_mu);
                        }, 0);

                        const dTotalPajakRP = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.pajak_mu) * SpreadNumber(detailItem.kurs);
                        }, 0);
                        // const dTotalPajakRP = 0;
                        // const dDiskonDokRP = dTotalRpFromDetail * (detailMpb.diskon_dok / 100);
                        const totalBeratHeader = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.brt) * SpreadNumber(detailItem.qty);
                        }, 0);

                        let totalNettoRP;
                        let totalPajak;
                        let kirim;

                        // ================ JURNAL ==========================================

                        if (detailMpb.include === 'N') {
                            totalNettoRP = dTotalRpFromDetail + dTotalPajakRP;
                        } else if (detailMpb.include === 'I') {
                            let IncludeDPP = dTotalRpFromDetail;
                            totalNettoRP = IncludeDPP;
                            totalPajak = dTotalPajakRP;
                        } else if (detailMpb.include === 'E') {
                            if (detailMpb.diskon) {
                                totalPajak = dTotalPajakRP;
                                totalNettoRP = dTotalRpFromDetail - totalPajak;
                            } else {
                                totalPajak = 0;
                                totalNettoRP = dTotalRpFromDetail;
                            }
                        }

                        let modifiedDataJurnal;
                        if (pJenisValue === 'edit') {
                            modifiedDataJurnal = {
                                ...updateJurnalEdit,
                                nodes: updateJurnalEdit.nodes.map((node: any) => ({
                                    ...node,
                                    debet_rp: SpreadNumber(node.debet_rp),
                                    kredit_rp: SpreadNumber(node.kredit_rp),
                                    jumlah_mu: SpreadNumber(node.jumlah_mu),
                                    jumlah_rp: SpreadNumber(node.jumlah_rp),
                                })),
                            };
                        } else {
                            modifiedDataJurnal = {
                                ...dataJurnal,
                                nodes: dataJurnal.nodes.map((node: any) => ({
                                    ...node,
                                    debet_rp: SpreadNumber(node.debet_rp),
                                    kredit_rp: SpreadNumber(node.kredit_rp),
                                    jumlah_mu: SpreadNumber(node.jumlah_mu),
                                    jumlah_rp: SpreadNumber(node.jumlah_rp),
                                })),
                            };
                        }
                        // console.log('dataDetail', dataDetail);
                        //   let konversiQty: any;
                        let noDok = pJenisValue === 'edit' ? mNoMPB : await generateNU(kode_entitas, '', '07', moment().format('YYYYMM'));

                        const modifiedData = {
                            // mSetKodePajak(dataDetail.nodes[0].kode_pajak);
                            // kode_mpb: kode,
                            entitas: kode_entitas,
                            kode_mpb: mKodeMPB,
                            no_mpb: noDok,
                            tgl_mpb: moment(mTglMpb).format('YYYY-MM-DD HH:mm:ss'),
                            kode_gudang: mKodeGudang,
                            kode_supp: mKodeSupp,
                            via: mVia,
                            pengemudi: mPengemudi,
                            nopol: mNopol,
                            total_rp: dTotalRpFromDetail,
                            total_diskon_rp: dTotalDiskonRP + dTotalPotonganRP,
                            total_pajak_rp: dTotalPajakRP,
                            netto_rp: totalNettoRP,
                            keterangan: mCatatan,
                            status: statusValue, //'Terbuka',
                            userid: userid.toUpperCase(),
                            tgl_update: currentDateTime,
                            // total_berat: totalBeratHeader,

                            detail: gridDetailMPB.current.dataSource.map((data: any, index: any) => ({
                                ...data,

                                qty: SpreadNumber(data.qty),
                                qty_std: SpreadNumber(data.qty),
                                qty_sisa: SpreadNumber(data.qty),
                                kurs: SpreadNumber(data.kurs),
                                kurs_pajak: SpreadNumber(data.kurs_pajak),
                                harga_mu: SpreadNumber(data.harga_mu),
                                diskon: SpreadNumber(data.diskon),
                                diskon_mu: SpreadNumber(data.diskon_mu),
                                potongan_mu: SpreadNumber(data.potongan_mu),
                                pajak: SpreadNumber(data.pajak),
                                pajak_mu: SpreadNumber(data.pajak_mu),
                                brt: SpreadNumber(data.brt),
                                berat: 10 * SpreadNumber(data.brt),
                                jumlah_rp: SpreadNumber(data.jumlah_rp),
                                jumlah_mu: SpreadNumber(data.jumlah_mu),
                                // jumlah_rp: SpreadNumber(data.qty) * SpreadNumber(data.harga_mu),
                                // jumlah_mu: SpreadNumber(data.qty) * SpreadNumber(data.harga_mu),
                                kode_pajak: data.kode_pajak,
                                // id_lpb: index + 1,
                            })),
                            detail_jurnal: modifiedDataJurnal.nodes.map((data: any) => ({
                                ...data,
                                kode_dokumen: mKodeMPB,
                                userid: userid.toUpperCase(),
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                tgl_dokumen: moment(mTglMpb).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_valuta: null,
                                tgl_rekonsil: null,
                                no_warkat: null,
                                kode_kerja: null,
                                audit: null,
                                kode_kry: null,
                                kode_jual: null,
                                no_kontrak_um: null,
                            })),
                        };

                        // let a = modifiedData.nodes;
                        // const dTotalRpFromDetail2 = modifiedData.detail.reduce((total2, detailItem2: any) => total2 + SpreadNumber(detailItem2.jumlah_mu), 0);

                        // const dTotalDiskonRP2 = modifiedData.detail.reduce((total2, detailItem2: any) => total2 + SpreadNumber(detailItem2.diskon_mu), 0);

                        // const dTotalPotonganRP2 = modifiedData.detail.reduce((total2, detailItem2: any) => total2 + SpreadNumber(detailItem2.potongan_mu), 0);

                        // const dTotalPajakRP2 = modifiedData.detail.reduce((total2, detailItem2: any) => total2 + SpreadNumber(detailItem2.pajak_mu), 0);

                        // const dDiskonDokRP2 = dTotalRpFromDetail2 * (dDiskonDok / 100);

                        // const totalBeratHeader2 = modifiedData.detail.reduce((total2, detailItem2: any) => total2 + SpreadNumber(detailItem2.brt) * SpreadNumber(detailItem2.qty), 0);

                        const dTotalRpFromDetail2 = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.jumlah_mu);
                        }, 0);

                        const dTotalDiskonRP2 = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.qty) * (SpreadNumber(detailItem.diskon_mu) * SpreadNumber(detailItem.kurs));
                        }, 0);
                        const dTotalPotonganRP2 = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.potongan_mu);
                        }, 0);

                        const dTotalPajakRP2 = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => total + SpreadNumber(detailItem.pajak_mu) * SpreadNumber(detailItem.kurs), 0);

                        // const dDiskonDokRP = dTotalRpFromDetail * (detailMpb.diskon_dok / 100);

                        const totalBeratHeader2 = gridDetailMPB.current.dataSource.reduce((total: any, detailItem: any) => {
                            return total + SpreadNumber(detailItem.brt) * SpreadNumber(detailItem.qty);
                        }, 0);

                        let totalNettoRP2;
                        let totalPajak2;
                        let kirim2;

                        // console.log(detailMpb.kena_pajak);
                        if (detailMpb.include === 'N') {
                            // console.log('1')
                            totalNettoRP2 = dTotalRpFromDetail2 + dTotalPajakRP2;
                        } else if (detailMpb.include === 'I') {
                            // console.log('2');
                            let IncludeDPP = dTotalRpFromDetail2;
                            totalNettoRP2 = IncludeDPP;
                            totalPajak2 = dTotalPajakRP2;
                            // console.log('totalNettoRP2', totalNettoRP2);
                        } else if (detailMpb.include === 'E') {
                            if (detailMpb.diskon) {
                                //  console.log('4');
                                totalPajak2 = dTotalPajakRP;
                                totalNettoRP2 = dTotalRpFromDetail2 - totalPajak2;
                            } else {
                                //  console.log('5');
                                totalPajak2 = 0;
                                totalNettoRP2 = dTotalRpFromDetail;
                            }
                        }

                        // console.log(modifiedData);
                        const modifiedData2 = {
                            ...modifiedData,
                            total_rp: dTotalRpFromDetail2,
                            total_diskon_rp: dTotalDiskonRP2 + dTotalPotonganRP2,
                            total_pajak_rp: dTotalPajakRP2,
                            netto_rp: dTotalRpFromDetail2, // + dTotalPajakRP2,
                        };

                        // await autojurnal();
                        // console.log('modifiedData2', modifiedData2);

                        // Perubahan tgl 2025-05-23
                        const cekDataMpb = await cekDataDiDatabase(kode_entitas, 'tb_m_mpb', 'no_mpb', modifiedData2?.no_mpb, token);
                        if (cekDataMpb) {
                            // jsonData.no_ttb = defaultNoTtb;
                            const generateCounter = await generateNU(kode_entitas, noDok, '07', moment().format('YYYYMM'));
                            const generateNoDok = await generateNU(kode_entitas, '', '07', moment().format('YYYYMM'));
                            modifiedData2.no_mpb = generateNoDok;
                        }
                        //=======
                        /////////////////////////////////////////////////////////
                        try {
                            if (pJenisValue === 'edit') {
                                const responseUpdate = await axios.patch(`${apiUrl}/erp/update_mpb`, modifiedData2);
                                console.log('responseUpdate = ', responseUpdate);
                                if (responseUpdate.data.status === true) {
                                    // await generateNU(kode_entitas, noPB, '01', dateTglDokumen.format('YYYYMM'));
                                    Swal.fire({
                                        title: 'Berhasil simpan perubahan MPB',
                                        icon: 'success',
                                    }).then(() => {
                                        // window.location.href = './pblist';
                                        routerMPB.push('./mpblist');
                                    });
                                    // router.push('./pblist');
                                } else {
                                    Swal.fire({
                                        title: 'Gagal menyimpan perubahan MPB',
                                        text: 'Silahkan periksa koneksi internet',
                                        icon: 'error',
                                    });
                                }
                                // console.log(response.data);
                            } else {
                                const responseSimpan = await axios.post(`${apiUrl}/erp/simpan_mpb`, modifiedData2);

                                if (responseSimpan.data.status === true) {
                                    try {
                                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                            entitas: kode_entitas,
                                            kode_audit: null,
                                            dokumen: 'RB',
                                            kode_dokumen: responseSimpan.data.kode_dokumen,
                                            no_dokumen: responseSimpan.data.data.no_mpb,
                                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            proses: 'NEW',
                                            diskripsi: `MPB item = ${gridDetailMPB.current.dataSource.length} nilai transaksi ${modifiedData2.netto_rp}`,
                                            userid: userid, // userid login web
                                            system_user: '', //username login
                                            system_ip: '', //ip address
                                            system_mac: '', //mac address
                                        });
                                    } catch (Error) {
                                        console.error('Error posting data to simpan_audit API:', Error);
                                        alert('simpan_audit gagal');
                                    }

                                    // Perubahan tgl 2025-05-23
                                    // await generateNU(kode_entitas, noDok, '07', mTglMpb.format('YYYYMM'));
                                    await generateNU(kode_entitas, responseSimpan.data.data.no_mpb, '07', mTglMpb.format('YYYYMM'));
                                    Swal.fire({
                                        title: 'Berhasil simpan MPB',
                                        icon: 'success',
                                    }).then(() => {
                                        // window.location.href = './pblist';
                                        routerMPB.push('./mpblist');
                                    });
                                    // router.push('./pblist');
                                } else {
                                    Swal.fire({
                                        title: 'Gagal menyimpan MPB',
                                        text: 'Silahkan periksa koneksi internet',
                                        icon: 'error',
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('Error during API request:', error);

                            Swal.fire({
                                title: 'Terjadi kesalahan',
                                text: 'Gagal menyimpan MPB. Silakan coba lagi.',
                                icon: 'error',
                            });
                        }

                        /////////////////////////////
                        //    cekOverQTY
                    }
                    //    await
                });
            }
        } finally {
            setDisabledSimpan(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const EditMpb = async (pKodeMpb: any) => {
        try {
            const headerMPB = await axios.get(`${apiUrl}/erp/master_mpb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: pKodeMpb,
                },
            });

            const result = headerMPB.data.data;
            const resHeader = result[0] || {};
            console.log('resHeader.tgl_mpb = ', resHeader.tgl_mpb);
            mSetKodeMPB(resHeader.kode_mpb);
            mSetNoMPB(resHeader.no_mpb);
            mSetTglMpb(moment(resHeader.tgl_mpb));
            mSetkodeGudang(resHeader.kode_gudang);
            mSetKodeSupp(resHeader.kode_supp);
            mSetVia(resHeader.via);
            mSetPengemudi(resHeader.pengemudi);
            mSetNopol(resHeader.nopol);
            mSetTotalRp(resHeader.total_rp);
            // setNominalDiskon(resHeader.diskon_dok_rp);
            dSetTotalDiskonRp(resHeader.total_diskon_rp);
            dSetTotalPajakRp(resHeader.total_pajak_rp);
            mSetNettoRp(resHeader.netto_rp);
            mSetCatatan(resHeader.keterangan);
            mSetStatus(resHeader.status);
            setStatusValue(resHeader.status);
            resHeader.userid;
            resHeader.tgl_update;
            // mSetNamaSupp(resHeader.nama_supp);
            setSuppSelected(resHeader.nama_supp);
            // mSetNamaGudang(resHeader.nama_gudang);
            mSetKodeAkunHutang(resHeader.kode_akun_hutang);
            // mSetNoHutang(resHeader.no_hutang);
            // mSetNamaHutang(resHeader.nama_hutang);
            mSetTipeHutang(resHeader.tipe_hutang);
            mSetTipeSupp(resHeader.tipe_supp);
            mSetNoSupp(resHeader.no_supp);
            mSetPajak(resHeader.pajak);
            mSetKodeAkunPajakBeli(resHeader.kode_akun_pajakbeli);
            mSetNoPajakBeli(resHeader.no_pajakbeli);
            mSetNamaPajakBeli(resHeader.nama_pajakbeli);
            mSetTipePajakBeli(resHeader.tipe_pajakbeli);
            // mSetKodePajak(resHeader.kode_pajak);
            // mSetKodeMu(resHeader.kode_mu);
            // mSetDiskonDok(resHeader.diskon_dok); //
            // mSetKenaPajak(resHeader.kena_pajak); //
            // mSetKirimMU(resHeader.kirim_mu);
        } catch (error) {
            console.error('Error fetching data master MPB:', error);
        }

        try {
            Buffer.from('SGVsbG8gV29ybGQ=', 'base64').toString('ascii');
            const detailMPB = await axios.get(`${apiUrl}/erp/detail_mpb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: pKodeMpb,
                },
            });

            const hasilApiDetailMpb = detailMPB.data.data;
            // console.log('DetailMpb');
            // console.log(hasilApiDetailMpb);
            const modifiedResponse: any = hasilApiDetailMpb.map((item: any) => ({
                ...item,
                qty: SpreadNumber(item.qty),
                qty_std: SpreadNumber(item.qty),
                qty_sisa: SpreadNumber(item.qty),
                berat: SpreadNumber(item.berat),
            }));

            gridDetailMPB.current.setProperties({ dataSource: modifiedResponse });
            //  console.log('modifiedResponse');
            // console.log(modifiedResponse);
            setDataDetail({ nodes: modifiedResponse });
            const totalBeratHeader = hasilApiDetailMpb.reduce((total: any, detailItem: any) => {
                return total + SpreadNumber(detailItem.brt) * SpreadNumber(detailItem.qty);
            }, 0);
            mSetTotalBeratHeader(totalBeratHeader);
        } catch (error) {
            console.error('Error fetching data detail MPB:', error);
        }

        try {
            // Buffer.from('SGVsbG8gV29ybGQ=', 'base64').toString('ascii');
            const detailJurnal = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                params: {
                    entitas: kode_entitas,
                    param1: pKodeMpb,
                },
            });

            const hasilApiDetailJurnal = detailJurnal.data.data;

            const modifiedResponse: any = hasilApiDetailJurnal.map((item: any) => ({
                ...item,
                kurs: SpreadNumber(item.kurs),
                debet_rp: SpreadNumber(item.debet_rp),
                kredit_rp: SpreadNumber(item.kredit_rp),
                jumlah_rp: SpreadNumber(item.jumlah_rp),
                jumlah_mu: SpreadNumber(item.jumlah_mu),
                persen: SpreadNumber(item.persen),
            }));
            console.log('modifiedResponse', modifiedResponse);

            setDataJurnal({ nodes: modifiedResponse });
            // const totalBeratHeader = hasilApiDetailMpb.reduce((total: any, detailItem: any) => total + SpreadNumber(detailItem.brt) * SpreadNumber(detailItem.qty), 0);
            // mSetTotalBeratHeader(totalBeratHeader);
        } catch (error) {
            console.error('Error fetching data detail MPB:', error);
        }
    };

    const [kodeMpbValue, setKodeMpb] = useState<any>('');
    const [statusValue, setStatusValue] = useState<string>('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleDokumenBaru = () => {
        const id = gridDetailMPB.current.dataSource.length + 1;

        const newNode = {
            id: id,
            id_mpb: id,
            no_item: '',
            diskripsi: '',
            satuan: '',
            qty: 0,
            ket: '',
            berat: 0,
            no_dok: '',
            no_sj: '',
            tgl_sj: '', // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
            jumlah_rp: 0,
        };

        const fieldKosong = gridDetailMPB.current.dataSource.some((row: { diskripsi: string }) => row.diskripsi === '');

        if (!fieldKosong) {
            // console.log('not kosong')
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
                // nodes: dataDetail.nodes,
            }));
            // console.log(newNode.no_sj)
        } else {
            alert('Harap isi detail sebelum tambah data');
        }
        // throw new Error('Function not implemented.');
    };

    const handleButtonSupp = async () => {
        const cekDetail: any = dataDetail;
        console.log('cekDetail', cekDetail.nodes[0].no_item);
        console.log('cekDetail', cekDetail);
        // if ((pJenisValue === 'edit' && gridDetailMPB.current.dataSource.length > 0) || cekDetail.nodes[0].no_item !== '') {
        // if (gridDetailMPB.current.dataSource.length > 0 || cekDetail.nodes[0].no_item !== '' ) {
        if (cekDetail.nodes[0].no_item !== '') {
            Swal.fire({
                title: 'Dialog Supplier',
                text: 'Tidak diperbolehkan mengganti supplier. Tidak diperbolehkan mengganti supplier.',
                icon: 'warning',
            });
        } else {
            setdlgSupplier(true);
        }
    };
    const HandleRemoveAllRows = async (
        dataDetail: any,
        setDataDetail: Function,
        handleDokumenBaru: Function
        // setButtonDisabled: Function
    ) => {
        // console.log(gridDetailMPB.current.dataSource.length )
        if (gridDetailMPB.current.dataSource.length > 0) {
            const newNode = {
                id: 1,
                id_mpb: 1,
                no_item: '',
                diskripsi: '',
                satuan: '',
                qty: 0,
                ket: '',
                berat: 0,
                no_dok: '',
                no_sj: '',
                tgl_sj: '', // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
                jumlah_rp: 0,
            };

            const newNodeJurnal = {
                kode_dokumen: '',
                id_dokumen: 1,
                id: 1,
                dokumen: 'MPB',
                tgl_dokumen: '',
                kode_akun: '',
                no_akun: '',
                nama_akun: '',
                kode_subledger: '',
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: '0.00',
                kredit_rp: '0.00',
                jumlah_rp: '0.00',
                jumlah_mu: '0.00',
                catatan: '',
                persen: 0,
                kode_dept: kodeDept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: '',
                tgl_update: '',
                nama_dept: '',
                nama_kerja: '',
                isledger: '',
                subledger: '',
                tipe: '',
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                total: 0,
            };

            const hasEmptyFields = gridDetailMPB.current.dataSource.some((row: { diskripsi: string }) => row.diskripsi === '');

            if (!hasEmptyFields) {
                await setDataDetail({ nodes: [newNode] });

                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: [],
                }));
                handleSubmitJurnal();
            } else {
                // Jika ada field yang kosong, Anda dapat menangani kasus ini di sini
            }
        } else {
            alert('Tidak ada baris yang tersedia untuk dihapus.');
        }
    };

    // const HandleRemoveAllRows = (
    //     dataDetail: any,
    //     setDataDetail: Function,
    //     handleDokumenBaru: Function
    //     // setButtonDisabled: Function
    // ) => {
    //     // console.log(gridDetailMPB.current.dataSource.length )
    //     if (gridDetailMPB.current.dataSource.length > 0) {
    //         const newNode = {
    //             id: 1,
    //             id_mpb: 1,
    //             no_item: '',
    //             diskripsi: '',
    //             satuan: '',
    //             qty: 0,
    //             ket: '',
    //             berat: 0,
    //             no_dok: '',
    //             no_sj: '',
    //             tgl_sj: '', // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
    //             jumlah_rp: 0,
    //         };

    //         const newNodeJurnalAja = {
    //             kode_dokumen: '',
    //             id_dokumen: 1,
    //             id: 1,
    //             dokumen: 'MPB',
    //             tgl_dokumen: '',
    //             kode_akun: '',
    //             no_akun: '',
    //             nama_akun: '',
    //             kode_subledger: '',
    //             no_subledger: '',
    //             nama_subledger: '',
    //             kurs: 1.0,
    //             kode_mu: 'IDR',
    //             debet_rp: '0.00',
    //             kredit_rp: '0.00',
    //             jumlah_rp: '0.00',
    //             jumlah_mu: '0.00',
    //             catatan: '',
    //             persen: 0,
    //             kode_dept: kodeDept,
    //             kode_kerja: '',
    //             approval: 'N',
    //             posting: 'N',
    //             rekonsiliasi: 'N',
    //             tgl_rekonsil: '',
    //             userid: '',
    //             tgl_update: '',
    //             nama_dept: '',
    //             nama_kerja: '',
    //             isledger: '',
    //             subledger: '',
    //             tipe: '',
    //             no_warkat: '',
    //             tgl_valuta: '',
    //             no_kerja: '',
    //         };

    //         const hasEmptyFields = gridDetailMPB.current.dataSource.some((row: { diskripsi: string }) => row.diskripsi === '');

    //         if (!hasEmptyFields) {
    //             // setDataDetail((state: any) => ({
    //             //     ...state,
    //             //     nodes: [],
    //             // }));
    //             setDataDetail({ nodes: [newNode] });
    //             //                 dataJurnal.nodes.map((item) => {
    //             //                     const debetmodedified = '0.00';
    //             //  return {
    //             //                         setDataJurnal({ nodes: { ...item, debet_rp: debetmodedified } });

    //             //                 });

    //             // handleDokumenBaru();
    //             // setButtonDisabled(false);
    //             // console.log(newNodeJurnal);
    //             const modifiedDataJurnal = {
    //                 ...dataJurnal,
    //                 nodes: dataJurnal.nodes.map((node: any) => ({
    //                     ...node,
    //                     debet_rp: '0.00',
    //                     jumlah_mu: '0.00',
    //                     // kredit_rp: SpreadNumber(node.kredit_rp),
    //                     // jumlah_rp: SpreadNumber(node.jumlah_rp),
    //                 })),
    //             };
    //             setDataJurnal({ nodes: [modifiedDataJurnal] });
    //         } else {
    //             // Jika ada field yang kosong, Anda dapat menangani kasus ini di sini
    //         }
    //     } else {
    //         alert('Tidak ada baris yang tersedia untuk dihapus.');
    //     }
    // };

    const [nilaiBaru, setNilaiBaru] = useState<any>('');
    const [dataJurnal2, setDataJurnal2] = useState({ nodes: [] });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleAutoJurnalUpdate = async (dataDetailUpdateJurnal: any) => {
        const jurnalUpdate = dataDetailUpdateJurnal;
        saveDoc({ nodes: jurnalUpdate });
    };

    const handleUpdateGridJurnal = async () => {
        let id: any, property: any;
        // autojurnal();
        const modifiedDataJurnal = {
            ...dataJurnal,
            nodes: dataJurnal.nodes.map((node: any) => ({
                ...node,
                debet_rp: String(SpreadNumber(tanpaKoma(String(node.debet_rp)))),
                kredit_rp: String(SpreadNumber(tanpaKoma(String(node.kredit_rp)))),
                jumlah_mu: String(SpreadNumber(tanpaKoma(String(node.jumlah_mu)))),
                jumlah_rp: String(SpreadNumber(tanpaKoma(String(node.jumlah_rp)))),
            })),
        };
        setDataJurnal((state: any) => {
            const updatedNodes = state.nodes.map((node: any) => {
                if (node.id_dokumen === id) {
                    if (property === 'debet_rp') {
                        const debet_rp = document.getElementById('debet_rp' + node.id) as HTMLInputElement;
                        const kredit_rp = document.getElementById('kredit_rp' + node.id) as HTMLInputElement;
                        const jumlah_mu = document.getElementById('jumlah_mu' + node.id) as HTMLInputElement;
                        // const detailJurnalUpdate = dataJurnal.nodes.find((item: any) => item.id === id);
                        if (debet_rp) {
                            debet_rp.value = String(SpreadNumber(tanpaKoma(String(modifiedDataJurnal.nodes[0].debet_rp))));
                            kredit_rp.value = String(SpreadNumber(0));
                            jumlah_mu.value = String(SpreadNumber(tanpaKoma(String(modifiedDataJurnal.nodes[0].jumlah_mu))));
                        }
                        return {
                            ...node,
                            // [property]: SpreadNumber(value2),
                            kredit_rp: '0.00',
                            jumlah_mu: String(SpreadNumber(modifiedDataJurnal.nodes[0].jumlah_mu)),
                            jumlah_rp: String(SpreadNumber(modifiedDataJurnal.nodes[0].jumlah_rp)),
                        };
                    }
                    if (property === 'kredit_rp') {
                        const debet_rp = document.getElementById('debet_rp' + node.id) as HTMLInputElement;
                        const kredit_rp = document.getElementById('kredit_rp' + node.id) as HTMLInputElement;
                        const jumlah_mu = document.getElementById('jumlah_mu' + node.id) as HTMLInputElement;

                        if (kredit_rp) {
                            debet_rp.value = String(SpreadNumber(0));
                            kredit_rp.value = String(SpreadNumber(tanpaKoma(String(modifiedDataJurnal.nodes[0].kredit_rp))));
                            jumlah_mu.value = String(SpreadNumber(tanpaKoma(String(modifiedDataJurnal.nodes[0].jumlah_mu * -1))));
                        }
                        let jumlah_mu_modified;
                        if (jumlah_mu_modified === -0) {
                            jumlah_mu_modified = 0;
                        } else {
                            jumlah_mu_modified = String(SpreadNumber(modifiedDataJurnal.nodes[0].jumlah_mu) * -1);
                        }
                        // console.log(jumlah_mu_modified);
                        return {
                            ...node,
                            // [property]: SpreadNumber(value2),
                            debet_rp: '0.00',
                            jumlah_mu: String(SpreadNumber(jumlah_mu_modified)),
                            jumlah_rp: String(SpreadNumber(jumlah_mu_modified)),
                        };
                    }
                }
                return node;
            });

            handleAutoJurnalUpdate(updatedNodes);

            return {
                ...state,
                nodes: updatedNodes,
            };
        });
    };

    const handleBatalClose = () => {
        Swal.fire({
            title: 'Kembali ke halaman MPB LIST ?',
            icon: 'success',
        }).then(() => {
            // window.location.href = './pblist';
            routerMPB.push('./mpblist');
        });
    };

    const handleSaveDokumen = async () => {
        setTombolSimpan(true);
        if (pJenisValue === 'edit') {
            await autojurnal();
        }
        await handleUpdateGridJurnal();
        // await handleUpdateGridJurnal().then(() => {
        //     saveDoc();
        // });
        // await saveDoc();
    };

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            if (pJenisValue !== 'edit') {
                handleDokumenBaru();
            }
            handleSubmitJurnal();
            FillFromSQL(kode_entitas, 'gudang', kode_user)
                .then((result: any) => {
                    setApiGudang(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            FillFromSQL(kode_entitas, 'pengiriman via')
                .then((result: any) => {
                    setApiVia(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            FillFromSQL(kode_entitas, 'departemen')
                .then((result: any) => {
                    setListDepartemen(result);
                    // console.log(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            gridDetailMPB.current?.setProperties({ dataSource: [] });
            gridDetailMPB.current?.refresh();
            if (pJenisValue === 'edit') {
                // if (!kode_mpb === "") {
                EditMpb(pKodeMpbValue);
                // setStatusValue('Terbuka');
            } else {
                // setJenisFormValue('BARU');
                setStatusValue('Terbuka');
                generateNU(kode_entitas, '', '07', moment().format('YYYYMM'))
                    .then((result) => {
                        //  console.log('noMPB ' + result);
                        //  console.log('moment ' + moment().format('YYYYMM'));
                        mSetNoMPB(result);
                        // mSetNoMPB('');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        }
    }, [EditMpb, handleDokumenBaru, handleSubmitJurnal, kode_entitas, kode_user, pJenisValue, pKodeMpbValue, routerMPB.query]);

    const handleDetailBaru = async (dataDetailBaru: any) => {
        // console.log('tombolSimpan');
        //         console.log(tombolSimpan);
        const baru = dataDetailBaru;
        setDataDetail({ nodes: baru });
        //  const ambilTotalRp = dataDetailBaru.reduce((total: any, detailItem: any) => total + SpreadNumber(detailItem.jumlah_rp), 0);

        if (dataDetailBaru.length !== 0) {
            const ambilTotalRp = dataDetailBaru.reduce((total: any, detailItem: any) => {
                return total + detailItem.jumlah_rp;
            }, 0);
            mSetTotalRp(ambilTotalRp);
            setKodeDept(dataDetailBaru[0].kode_dept);
        }
        // console.log('dataDetail', dataDetail);
    };

    return (
        <div>
            <div
                className="table-responsive panel mb-3"
                // style={{ background: '#e3dedf' }}
                style={{ background: '#d7d0d2' }}
            >
                <div className="mb-5">
                    <div className="flex" style={{ alignItems: 'center' }}>
                        <div style={{ flex: 0.5, fontSize: '2.5vh' }}> Memo Pengembalian Barang - Memo Debet </div>
                        <div style={{ flex: 1.0, marginBottom: -11, marginTop: 2 }}></div>
                        <div style={{ marginBottom: -11, marginTop: 2, textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>{/* {jTransaksi} */}</div>
                    </div>

                    <table className={styles.table} style={{ marginTop: 10 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. MPB</th>
                                <th style={{ textAlign: 'center', width: '60%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Supplier</th>
                                <th style={{ textAlign: 'center', width: '20%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Gudang</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="form-input mt-1 flex justify-between" style={{ height: '13px', padding: '0px 3px 29px 8px', marginTop: '1px', marginBottom: '3px' }}>
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            // renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={mTglMpb.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                const selectedTglMpb = moment(args.value);
                                                selectedTglMpb.set({
                                                    hour: moment().hour(),
                                                    minute: moment().minute(),
                                                    second: moment().second(),
                                                });
                                                mSetTglMpb(selectedTglMpb);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* <Flatpickr
                                        value={moment(mTglMpb).format('DD-MM-YYYY HH:mm:ss')}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => {
                                            const selectedTglMpb = moment(date[0]);
                                            selectedTglMpb.set({
                                                hour: moment().hour(),
                                                minute: moment().minute(),
                                                second: moment().second(),
                                            });
                                            mSetTglMpb(selectedTglMpb);
                                        }}
                                    /> */}
                                </td>
                                <td>
                                    <input
                                        className={`${styles.inputTableBasic}`}
                                        type="text"
                                        placeholder="Nomor MPB"
                                        id="No. Mpb"
                                        value={mNoMPB}
                                        readOnly={true}
                                        style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                    />
                                </td>
                                <td>
                                    <div className="flex">
                                        <input
                                            id="supplier"
                                            placeholder="Masukan Nama Supplier"
                                            type="text"
                                            value={suppSelected} //{mNamaSupp}
                                            //defaultValue={suppSelected}
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4 }}
                                            // onChange={(e) => handleSelectOnChange(e.target.value, 'supplier')}
                                            onKeyDown={() => {
                                                setdlgSupplier(true);
                                            }}
                                        />
                                        <div>
                                            <button
                                                className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                onClick={() => {
                                                    // console.log('Ikon diklik!');
                                                }}
                                                style={{ height: 23, marginTop: -4, marginBottom: -4, background: '#e3dedf', borderColor: '#dedede' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    className="ml-2"
                                                    width="15"
                                                    height="15"
                                                    // onClick={() => setdlgSupplier(true)} />
                                                    onClick={() => handleButtonSupp()}
                                                />
                                            </button>
                                            <SupplierModal
                                                isOpen={dlgSupplier}
                                                onClose={() => setdlgSupplier(false)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                onSelectData={(
                                                    selectedData: any,
                                                    selectedNoSuppValue: any,
                                                    selectedkodeSuppValue: any,
                                                    selectedNamaSuppValue: any,
                                                    selecttedKodeAkunPajakBeli: any,
                                                    selectedNoPajakBeli: any,
                                                    selectedNamaPajakBeli: any,
                                                    selectedTipePajakBeli: any
                                                ) =>
                                                    handleSelectedData(
                                                        selectedData,
                                                        selectedNoSuppValue,
                                                        selectedkodeSuppValue,
                                                        selectedNamaSuppValue,
                                                        selecttedKodeAkunPajakBeli,
                                                        selectedNoPajakBeli,
                                                        selectedNamaPajakBeli,
                                                        selectedTipePajakBeli
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <select id="cbGudang" className={`form-select `} style={{ border: 'none' }} value={mKodeGudang} onChange={(e) => handleSelectOnChange(e, 'kode_gudang')}>
                                            <option value="" disabled>
                                                --Pilih Gudang--
                                            </option>
                                            {apiGudang.map((gudang: any) => (
                                                <option key={gudang.kode_gudang} value={gudang.kode_gudang}>
                                                    {gudang.nama_gudang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className={styles.table} style={{ marginTop: 10 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Nama Pengemudi</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. Kendaraan</th>
                                <th style={{ textAlign: 'center', width: '80%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Pengiriman Via (Ekspedisi)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex">
                                        <input
                                            id="pengemudi"
                                            placeholder="Masukan Pengemudi"
                                            type="text"
                                            defaultValue={mPengemudi}
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4 }}
                                            onChange={(e) => mSetPengemudi(e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <input
                                            id="nopol"
                                            placeholder="Masukan Nopol"
                                            type="text"
                                            defaultValue={mNopol}
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4 }}
                                            onChange={(e) => mSetNopol(e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        {/* <select
                                            id="cbekspedisi"
                                            className={`form-select `}
                                            style={{ border: 'none' }}
                                            value={mVia.length > 0 ? selectedVia : ''}
                                            onChange={(e) => setSelectedVia([e.target.value])}
                                        > */}
                                        <select id="cbekspedisi" className={`form-select `} style={{ border: 'none' }} value={mVia} onChange={(e) => handleSelectOnChange(e, 'via')}>
                                            <option value="" disabled>
                                                --Pilih Ekspedisi--
                                            </option>
                                            {apiVia.map((via: any) => (
                                                <option key={via.via} value={via.via}>
                                                    {via.via}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="panel border-2 border-gray-900" id="detail" style={{ borderColor: 'gray', background: '#d7d0d2' }}>
                    <div className="mb-5">
                        {/* <h5 className="text-lgfont-semibold dark:text-white-light">DETAIL</h5> */}
                        <div className=" flex border-b border-gray-300">
                            <button
                                onClick={() => setActiveTab('data_barang')}
                                className={`px-3 py-2 text-xs font-semibold ${activeTab === 'data_barang' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                Data Barang
                            </button>
                            <button
                                onClick={() => setActiveTab('data_jurnal')}
                                className={`px-3 py-2 text-xs font-semibold ${activeTab === 'data_jurnal' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                Jurnal
                            </button>
                        </div>
                        <div className={`flex h-full w-full flex-col rounded border border-black-light ${activeTab === 'data_barang' ? 'block' : 'hidden'}`}>
                            {/* <h4 className="mb-4 text-2xl font-semibold">Data Barang</h4>
                                        <p className="mb-4">GRID DATA BARANG</p> */}
                            {/* <p>
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        </p> */}
                            <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-1"></div>
                            </div>
                            {/* <div className="mb-1 flex" style={{ marginLeft: '95%' }}> */}
                            {/* buton klik tambah baru */}
                            {/* <button title="Tambah Barang" type="submit" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}> */}
                            {/* <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" /> */}
                            {/* </button> */}
                            {/* <button title="Hapus Barang" type="submit" style={{ display: 'flex', alignItems: 'center' }}> */}
                            {/* <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" /> */}
                            {/* </button> */}
                            {/* </div> */}

                            {/* BUAT TABLENYA */}
                            {/* <TabelDetailMpb userid={userid} kode_entitas={kode_entitas} kode_user={kode_user} dataApi={dataDetailList} kodeSupp={mKodeSupp} kodeGudang={mKodeGudang} /> */}
                            {/* END TABLE */}
                            <TabelDetailMpb
                                userid={userid}
                                kode_entitas={kode_entitas}
                                kode_user={kode_user}
                                kodeSupp={mKodeSupp}
                                kodeGudang={mKodeGudang}
                                dataApi={dataDetail}
                                kode_mpb={kodeMpbValue}
                                detailBaru={(dataDetailBaru: any) => handleDetailBaru(dataDetailBaru)}
                                kondisiTombolSimpan={tombolSimpan}
                                gridDetailMPB={gridDetailMPB}
                                // jenis={pJenisValue}
                            />
                        </div>
                        <div className={`flex h-full w-full flex-col rounded border border-black-light ${activeTab === 'data_jurnal' ? 'block' : 'hidden'}`}>
                            <div className="mb-1.5 flex justify-end">
                                {' '}
                                {/* Mengubah posisi flex menjadi justify-end */}
                                {/* TAMBAH DAN DELETE DETAIL JURNAL DI HIDE 4-07-2024 */}
                                {/* <button title="Tambah Akun" type="submit" onClick={handleSubmitJurnal} style={{ display: 'flex', alignItems: 'center' }}>
                                                <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                            </button>
                                            <button title="Hapus Akun" type="submit" onClick={handleRemoveJurnal} style={{ display: 'flex', alignItems: 'center' }}>
                                                <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                            </button> */}
                                <button title="Auto Jurnal" type="submit" onClick={autojurnal} className="btn btn-secondary mr-1" style={{ background: 'black', borderColor: '#5c5a5a' }}>
                                    {/*  <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" /> */}
                                    Auto Jurnal
                                </button>
                            </div>
                            <TableJurnal
                                dataApi={dataJurnal}
                                dataDept={listDepartemen}
                                handleUpdate={handleUpdateJurnal}
                                handleselectcell={handleselectcell}
                                kode_entitas={kode_entitas}
                                userid={userid}
                                nilaiValueNoItem={nilaiValueNoAkun}
                                nilaiValueNamaItem={nilaiValueNamaAkun}
                                handleModalAkunChange={handleModalAkunChange}
                                nilaiTotalId={totalNum}
                                tipeValue={tipeValue}
                                handleModalAkun={handleModalAkun}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '50px', marginTop: '10px' }}>
                                <div>Total Db/Kr</div>
                                <div>{frmNumber(String(SpreadNumber(totalDebet)))}</div>
                                <div>{frmNumber(String(SpreadNumber(totalKredit)))}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '50px', marginTop: '10px', alignSelf: 'flex-end' }}>
                                <div>Selisih</div>
                                <div>{frmNumber(String(SpreadNumber(totalDebet - totalKredit)))}</div>
                                <div style={{ visibility: 'hidden' }}></div>
                                <div style={{ visibility: 'hidden' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel mt-3" style={{ background: '#e3dedf' }}>
                <div className={styles['grid-containerNote1']}>
                    <div className={styles['grid-leftNote']}>
                        <div>
                            <label htmlFor="catatan">Catatan:</label>
                            <form>
                                <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600">
                                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                        <label className="sr-only">Publish post</label>
                                        <textarea
                                            id="editor"
                                            rows={3}
                                            className=" form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                            placeholder=""
                                            value={mCatatan}
                                            // required
                                            onChange={(e) => {
                                                handleSelectOnChange(e, 'catatan');
                                            }}
                                            style={{ height: 100 }}
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* <p className="mt-3">Terbilang:</p>
                        <p className="text-green-500">Nol</p> */}
                    </div>
                    <div className={styles['grid-rightNote']}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1">Total Berat</label>

                            {/* <input type="text" id="totalberat" placeholder="Total Berat.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} /> */}
                            <span style={{ margin: '0 30px' }}>{isNaN(SpreadNumber(mTotalBeratHeader)) ? '' : `${SpreadNumber(mTotalBeratHeader)} Kg`}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-5 flex justify-between">
                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="17" height="17" />
                        Lanjut
                    </button> */}
                    <button type="submit" className="btn btn-secondary mr-1" onClick={handleSaveDokumen} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }} disabled={disabledSimpan}>
                        <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Simpan
                    </button>
                    <Link type="submit" className="btn btn-secondary mr-1" href={`/kcn/ERP/inventory/mpb/mpblist?tabId=${tabId}`} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Batal
                    </Link>
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faPrint} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Cetak
                    </button> */}
                </div>
                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faTrash} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Hapus
                    </button> */}
                    <button
                        type="submit"
                        className="btn btn-secondary mr-1"
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                        onClick={() =>
                            HandleRemoveAllRows(
                                dataDetail,
                                // mSetNamaSupp,
                                // setDisabledIconNoBarang,
                                // setDisabledIconNamaBarang,
                                // setTotalBeratVariabel,
                                // setTotalJumlahVariabel,
                                // setTotalJumlahSetelahPajakVariabel,
                                // setTotalJumlahSetelahPajakFilter,
                                // setValueNilaiDpp,
                                // setValueNilaiDppFilter,
                                // setTotalNilaiPajakVariabel,
                                setDataDetail,
                                handleDokumenBaru
                                // setButtonDisabled
                            )
                        }
                    >
                        <FontAwesomeIcon icon={faBackward} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Bersihkan
                    </button>
                </div>
            </div>
            <AkunDlg
                isOpen={modalAkunDlg}
                onClose={() => setModalAkunDlg(false)}
                onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, 'akun_jurnal')}
                kode_entitas={kode_entitas}
                userid={userid}
                searchtype={modalTipeCari}
                cariNo={nilaiValueNoAkun}
                cariNama={nilaiValueNamaAkun}
                tipeValue={tipeValue}
            />
            <SupplierModalJurnal
                isOpen={modalSuppJurnal}
                onClose={() => setModalSuppJurnal(false)}
                userid={userid}
                kode_entitas={kode_entitas}
                onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, 'supp_jurnal')}
                // handleNamaSupp={handleNamaSupp}
                // nilaiTotalId={changeNumber}
            />
            <SubledgerModal
                isOpen={modalSubledger}
                onClose={() => setModalSubledger(false)}
                userid={userid}
                kode_entitas={kode_entitas}
                onSelectData={(dataObject: any) => handleSelectedDataJurnal(dataObject, 'subledger')}
                // handleNamaSupp={handleNamaSupp}
                // nilaiTotalId={changeNumber}
            />
        </div>
    );
};
export default mpbMainForm;
