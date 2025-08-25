import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
// import idIDLocalization from 'public/syncfusion/locale.json';
// L10n.load(idIDLocalization);
import * as ReactDom from 'react-dom';
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Pakai fungsi dari routines ============================
import { DiskonByCalc, FillFromSQL, fetchPreferensi, formatNumber, frmNumber, generateNU, generateNUDivisi, tanpaKoma } from '@/utils/routines';
//========================================================
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes, faUpload, faEraser } from '@fortawesome/free-solid-svg-icons';
import { GetListHargaEkspedisi } from '../model/apiRpe';
import { swalDialog, swalToast } from './template';
// import styles from '../rpelist.module.css';
import ExcelJS from 'exceljs';
import { GetListDeptRpe, GetListKryRpe, GetListAreaJualRpe, GetListSettingRpe, GetListAkunJurnal, GetListSubledger } from '../model/api';
import { HandleCloseZoom, HandleZoomIn, HandleZoomOut, CekPeriodeAkutansi, CekTglMinusSatu, CurrencyFormat } from '../functional/fungsiFormRpe';
import styles from '../rpelist.module.css';
import Draggable from 'react-draggable';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

enableRipple(true);

interface templateDetailRpeProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    token: any;
    onRenderDayCell: any;
    stateDataHeader: any;
    dataBarang: any;
    dataJurnal: any;
    tabPhuList: any;
    setStateDataHeader: Function;
    setStateDataArray: Function;
    stateDataArray: any;
    setDataBarang: Function;
    setDataJurnal: Function;
    // setDataKeuangan: Function;
    setStateDataFooter: Function;
    stateDataFooter: any;
    masterDataState: any;
    setFiles: any;
    setPreviewFile: any;
    handleFileUpload: any;
    files: any;
    previewFile: any;
    setFilesUpload: Function;
}

let gridKeyDataBarang = ``;
const TemplateDetailRpe: React.FC<templateDetailRpeProps> = ({
    userid,
    kode_entitas,
    entitas,
    token,
    onRenderDayCell,
    stateDataHeader,
    tabPhuList,
    dataBarang,
    dataJurnal,
    setStateDataHeader,
    setStateDataArray,
    stateDataArray,
    setDataBarang,
    setDataJurnal,
    // setDataKeuangan,
    setStateDataFooter,
    stateDataFooter,
    masterDataState,
    setFiles,
    setPreviewFile,
    handleFileUpload,
    files,
    previewFile,
    setFilesUpload,
}: templateDetailRpeProps) => {
    // State State Untuk Detail
    const [stateDataDetail, setStateDataDetail] = useState({
        // ============================
        // Lain Lain
        vPjk: '',
        vKodeDokumen: '',
        vMu: '',
        isChecboxPelunasanPajak: false,
        idDokumen: 0,
        jumlahFaktur: 0,
        isChecboxPilih: false,
        // ============================

        // Data Jurnal
        rowsIdJurnal: '',
        totalDebet: 0,
        totalKredit: 0,
        totalSelisih: 0,
        dialogDaftarCustomerVisible: false,
        searchNoCust: '',
        searchNamaCust: '',
        searchNamaSales: '',
        searchKeywordNoCust: '',
        searchKeywordNamaCust: '',
        searchKeywordNamaSales: '',
        activeSearchDaftarCustomer: 'namaCust',

        selectedOptionDepartemen: '',

        // Data Subledger Jurnal
        dialogDaftarSubledgerVisible: false,
        searchNoSubledger: '',
        searchNamaSubledger: '',
        searchKeywordNamaSubledger: '',
        searchKeywordNoSubledger: '',

        // Cari No Surat jalan
        searchNoSj: '',
        searchKeywordNoSj: '',
    });

    gridKeyDataBarang = `${moment().format('HHmmss')}-${JSON.stringify(dataBarang?.nodes)}`;
    let currentDaftarBarang: any[] = [];
    let currentDaftarJurnal: any[] = [];
    const gridRpeListRef = useRef<GridComponent>(null);
    const gridJurnalRpeListRef = useRef<GridComponent>(null);
    const [numberId, setNumberId] = useState(-1);
    const [documentData, setDocumentData] = useState<any>(null);

    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };

    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const qtyParams = { params: { format: 'N2' } };

    //=========== Setting format tanggal sesuai locale ID ===========
    const formatFloat: Object = { skeleton: 'C3', format: ',0.####;-,0.#####;#', maximumFractionDigits: 4, minimumFractionDigits: 2 };
    const formatCurrency: Object = { skeleton: 'C3', format: ',0.00;-,0.00;#', maximumFractionDigits: 2 };

    const getHargaEkspedisi = async (args: any) => {
        console.log('sdasdsadasdada = ', args);
        const paramObject = {
            kode_entitas: kode_entitas,
            jenis_kirim: args.jenis_kirim,
            nama_ekspedisi: stateDataHeader?.namaEkspedisi,
            jenis_mobil: args.jenis_mobil,
            token: token,
        };
        const respHargaEkspedisi: any[] = await GetListHargaEkspedisi(paramObject);
        const parsedHargaEkspedisi = respHargaEkspedisi?.map((item) => ({
            ...item,
            harga: parseFloat(item.harga),
            harga_tambahan: parseFloat(item.harga_tambahan),
        }));
        await setStateDataArray((prevState: any) => ({
            ...prevState,
            dataHargaEkspedisi: parsedHargaEkspedisi,
        }));
        await setStateDataHeader((prevState: any) => ({
            ...prevState,
            dialogDaftarHargaEkspedisiVisible: true,
            indexId: args.id,
        }));
    };

    // merubah koma yang jadi 1 aja
    const editTemplateTambahanJarak = (args: any) => {
        console.log('templateTambahanJarak = ', args);
        return (
            <div>
                <input
                    style={{ textAlign: 'right', backgroundColor: 'transparent', border: 'none', marginLeft: '-21px' }}
                    id="tambahan_jarak"
                    name="tambahan_jarak"
                    value={args.tambahan_jarak}
                    disabled={true}
                />
            </div>
        );
    };

    //=================================== RECALC JURNAL ==================================
    const actionBeginDataJurnal = async (args: any) => {
        if (args.requestType === 'save') {
            if (dataJurnal?.nodes.length > 0) {
                setDataJurnal((state: any) => {
                    // Mengecek apakah ada node yang memiliki 'no_sj' yang kosong
                    const hasEmptyNodes = state.nodes.some((node: any) => node.no_akun === '');
                    if (hasEmptyNodes === true) {
                    }

                    return {
                        ...state,
                    };
                });

                const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                    return {
                        ...node,
                    };
                });

                await setDataJurnal({ nodes: newNodes });
            } else {
                setDataJurnal((state: any) => {
                    // Mengecek apakah ada node yang memiliki 'no_sj' yang kosong
                    const hasEmptyNodes = state.nodes.some((node: any) => node.no_akun === '');
                    if (hasEmptyNodes === true) {
                        withReactContent(swalDialog)
                            .fire({
                                title: ``,
                                html: '<p style="font-size:12px; margin-left: 46px;">Ada data jurnal yang kosong, hapus data jurnal</p>',
                                width: '280px',
                                heightAuto: true,
                                target: '#dialogPhuList',
                                focusConfirm: false,
                                // showCancelButton: true,
                                confirmButtonText: '&ensp; Hapus &ensp;',
                                // cancelButtonText: 'Tidak',
                                reverseButtons: true,
                                allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                                allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                                customClass: {
                                    confirmButton: styles['custom-confirm-button'],
                                    // cancelButton: 'custom-cancel-button' // Jika Anda ingin mengatur warna untuk tombol batal juga
                                },
                            })
                            .then(async (result) => {
                                if (result.value) {
                                    setDataJurnal((state: any) => {
                                        const updatedNodes = state.nodes.filter((node: any) => node.no_akun !== null);

                                        return {
                                            ...state,
                                            nodes: updatedNodes,
                                        };
                                    });
                                } else if (result.dismiss === swal.DismissReason.cancel) {
                                    //...
                                }
                            });
                    }

                    return {
                        ...state,
                    };
                });
            }
        }
    };
    const actionCompleteDataJurnal = async (args: any) => {
        console.log(args.requestType, 'kkkkkkkkkk');
        if (args.requestType === 'save' || args.requestType === 'refresh' || args.requestType === 'beginEdit') {
            if (tipeDetailJurnal.current === '') {
                const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                    return {
                        ...node,
                        departemen: node.departemen,
                        kode_dept: node.kode_dept,
                    };
                });

                await setDataJurnal({ nodes: newNodes });
            } else {
                let inputJurnalRef: any, idJurnalRef: any;
                if (tipeDetailJurnal.current === 'debetRp') {
                    inputJurnalRef = inputDebetJurnalRef.current;
                    idJurnalRef = rowIdJurnalRef.current;
                    reCall(tipeDetailJurnal.current, inputJurnalRef, setDataJurnal, idJurnalRef);
                } else if (tipeDetailJurnal.current === 'kreditRp') {
                    inputJurnalRef = inputKreditJurnalRef.current;
                    idJurnalRef = rowIdKreditJurnalRef.current;
                    reCall(tipeDetailJurnal.current, inputJurnalRef, setDataJurnal, idJurnalRef);
                } else if (tipeDetailJurnal.current === 'keterangan') {
                    inputJurnalRef = inputKetJurnalRef.current;
                    idJurnalRef = rowIdKetJurnalRef.current;
                    reCall(tipeDetailJurnal.current, inputJurnalRef, setDataJurnal, idJurnalRef);
                } else if (tipeDetailJurnal.current === 'kurs') {
                    inputJurnalRef = inputKursJurnalRef.current;
                    idJurnalRef = rowIdKursJurnalRef.current;
                    reCall(tipeDetailJurnal.current, inputJurnalRef, setDataJurnal, idJurnalRef);
                } else if (tipeDetailJurnal.current === 'jumlahMu') {
                    inputJurnalRef = inputJumlahMuJurnalRef.current;
                    idJurnalRef = rowIdJumlahMuJurnalRef.current;
                    reCall(tipeDetailJurnal.current, inputJurnalRef, setDataJurnal, idJurnalRef);
                } else if (tipeDetailJurnal.current === 'departemen') {
                    inputJurnalRef = inputDepartemenJurnalRef.current;
                    idJurnalRef = rowIdDepartemenJurnalRef.current;

                    await setStateDataDetail((prevState: any) => ({
                        ...prevState,
                        selectedOptionDepartemen: inputJurnalRef.nama_dept,
                    }));
                    const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                        if (node.id === idJurnalRef) {
                            return {
                                ...node,
                                departemen: inputJurnalRef.nama_dept,
                                kode_dept: inputJurnalRef.kode_dept,
                            };
                        } else {
                            return node;
                        }
                    });

                    await setDataJurnal({ nodes: newNodes });
                }
            }
        }
    };

    const inputDebetJurnalRef = useRef(null);
    const inputKreditJurnalRef = useRef(null);
    const inputKetJurnalRef = useRef(null);
    const inputKursJurnalRef = useRef(null);
    const inputJumlahMuJurnalRef = useRef(null);
    const inputDepartemenJurnalRef = useRef(null);

    const rowIdJurnalRef = useRef(null);
    const rowIdKreditJurnalRef = useRef(null);
    const rowIdKetJurnalRef = useRef(null);
    const rowIdKursJurnalRef = useRef(null);
    const rowIdJumlahMuJurnalRef = useRef(null);
    const rowIdDepartemenJurnalRef = useRef(null);

    const tipeDetailJurnal = useRef('');

    const reCall = async (tipe: string, value: any, setDataJurnal: any, rowsIdJurnal: any) => {
        if (tipe === 'debetRp') {
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        debet_rp: parseFloat(value),
                        jumlah_mu: value * parseFloat(node.kurs),
                        kredit_rp: 0,
                    };
                } else {
                    return node;
                }
            });

            const totalDebet = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.debet_rp);
            }, 0);
            const totalKredit = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.kredit_rp);
            }, 0);

            const selisih = totalDebet - totalKredit;
            const nilaiSelisih = selisih >= 0 ? selisih : selisih * -1;

            setStateDataDetail((prevState: any) => ({
                ...prevState,
                totalDebet: totalDebet,
                totalKredit: totalKredit,
                totalSelisih: nilaiSelisih,
            }));

            await setDataJurnal({ nodes: newNodes });
        } else if (tipe === 'kreditRp') {
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        kredit_rp: parseFloat(value),
                        jumlah_mu: value * parseFloat(node.kurs) * -1,
                        debet_rp: 0,
                    };
                } else {
                    return node;
                }
            });

            const totalDebet = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.debet_rp);
            }, 0);
            const totalKredit = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.kredit_rp);
            }, 0);

            const selisih = totalDebet - totalKredit;
            const nilaiSelisih = selisih >= 0 ? selisih : selisih * -1;

            setStateDataDetail((prevState: any) => ({
                ...prevState,
                totalDebet: totalDebet,
                totalKredit: totalKredit,
                totalSelisih: nilaiSelisih,
            }));

            await setDataJurnal({ nodes: newNodes });
        } else if (tipe === 'keterangan') {
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        catatan: value,
                    };
                } else {
                    return node;
                }
            });

            await setDataJurnal({ nodes: newNodes });
        } else if (tipe === 'kurs') {
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        kurs: value,
                        debet_rp: value * (node.debet_rp === 0 ? 0 : node.jumlah_mu),
                        kredit_rp: value * (node.kredit_rp === 0 ? 0 : node.jumlah_mu * -1),
                        jumlah_mu: node.jumlah_mu,
                    };
                } else {
                    return node;
                }
            });

            const totalDebet = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.debet_rp);
            }, 0);
            const totalKredit = newNodes.reduce((total: any, item: any) => {
                return total + parseFloat(item.kredit_rp);
            }, 0);

            const selisih = totalDebet - totalKredit;
            const nilaiSelisih = selisih >= 0 ? selisih : selisih * -1;

            setStateDataDetail((prevState: any) => ({
                ...prevState,
                totalDebet: totalDebet,
                totalKredit: totalKredit,
                totalSelisih: nilaiSelisih,
            }));

            await setDataJurnal({ nodes: newNodes });
        } else if (tipe === 'jumlahMu') {
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        jumlah_mu: value,
                        debet_rp: value * parseFloat(node.kurs),
                        kredit_rp: 0,
                        // kredit_rp: value * (node.kredit_rp === 0 ? 0 : parseFloat(node.kurs)),
                    };
                } else {
                    return node;
                }
            });

            await setDataJurnal({ nodes: newNodes });
        } else if (tipe === 'departemen') {
            await setStateDataDetail((prevState: any) => ({
                ...prevState,
                selectedOptionDepartemen: value.kode_dept,
            }));
            const newNodes = await dataJurnal?.nodes?.map((node: any) => {
                if (node.id === rowsIdJurnal) {
                    return {
                        ...node,
                        departemen: value.nama_dept,
                        kode_dept: value.kode_dept,
                    };
                } else {
                    return node;
                }
            });

            await setDataJurnal({ nodes: newNodes });
        }
    };

    //=================================== AUTO JURNAL=====================================

    const autojurnal = async () => {
        //masukan akun diskon

        let vTotalBayar = 0;
        let vTotalBayar1 = 0;
        let vTotalBayar2 = 0;
        let vTotalBayarTanpaPPH23 = 0;

        vTotalBayar1 = Number(stateDataFooter?.subTotal) + stateDataFooter?.tambahanJarak + Number(stateDataFooter?.biayaLainLain);

        vTotalBayar2 = stateDataHeader?.nominalInvoice;

        console.log('vTotalBayar1: ', vTotalBayar2);

        if (vTotalBayar1 < vTotalBayar2) {
            if (stateDataHeader?.kodepph23 !== 'N') {
                vTotalBayar = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.nilaiPph23 - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayarTanpaPPH23 = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            } else {
                vTotalBayarTanpaPPH23 = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayar = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            }
        } else {
            if (stateDataHeader?.kodepph23 !== 'N') {
                vTotalBayar = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.nilaiPph23 - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayarTanpaPPH23 = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            } else {
                vTotalBayarTanpaPPH23 = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayar = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            }
        }

        let ket = '';

        ket = 'RPE ' + stateDataHeader?.noRpe + ', HUTANG ' + stateDataHeader?.namaEkspedisi;

        let vkode_dept = '';
        let vnama_dept = '';
        let vkode_kry = '';
        let vnama_kry = '';
        let vkode_jual = '';

        let vkode_akun = '';
        let vno_akun = '';
        let vnama_akun = '';
        let vtipe = '';

        let vkode_subledger = '';
        let vno_subledger = '';
        let vnama_subledger = '';
        let vsubledger = '';
        const responsDataDept = await GetListDeptRpe(kode_entitas, token);
        if (responsDataDept.status === true) {
            const filternamadept = responsDataDept.data.filter((item: any) => item.nama_dept === 'LOGISTIK');
            if (filternamadept[0].nama_dept === 'LOGISTIK') {
                vkode_dept = filternamadept[0].kode_dept;
                vnama_dept = filternamadept[0].nama_dept;
            } else {
                vkode_dept = '';
                vnama_dept = '';
            }
        }

        const responsDataKry = await GetListKryRpe(kode_entitas, token);
        if (responsDataKry.status === true) {
            const filternamakry = responsDataKry.data.filter((item: any) => item.nama_kry === 'KANTOR');
            if (filternamakry[0].nama_kry === 'KANTOR') {
                vkode_kry = filternamakry[0].kode_kry;
            } else {
                vkode_kry = '';
                vnama_kry = '';
            }
        }

        const responsDataAreaJual = await GetListAreaJualRpe(kode_entitas, token);
        if (responsDataAreaJual.status === true) {
            if (kode_entitas === '300') {
                const filternamajual1 = responsDataAreaJual.data.filter((item: any) => item.nama_jual === 'DISTRIBUTOR');
                if (filternamajual1[0].nama_jual === 'DISTRIBUTOR') {
                    vkode_jual = filternamajual1[0].kode_jual;
                } else {
                    vkode_jual = '';
                }
            } else {
                const filternamajual2 = responsDataAreaJual.data.filter((item: any) => item.nama_jual === 'KANTOR');
                if (filternamajual2[0].nama_jual === 'KANTOR') {
                    vkode_jual = filternamajual2[0].kode_jual;
                } else {
                    vkode_jual = '';
                }
            }
        }

        const responsAkunJurnal = await GetListAkunJurnal(kode_entitas, token);
        if (responsAkunJurnal.status === true) {
            const filternamaakun = responsAkunJurnal.data.filter((item: any) => item.nama_akun === 'Piutang Lainnya');
            if (filternamaakun[0].nama_akun === 'Piutang Lainnya') {
                vkode_akun = filternamaakun[0].kode_akun;
                vno_akun = filternamaakun[0].no_akun;
                vnama_akun = filternamaakun[0].nama_akun;
                vtipe = filternamaakun[0].tipe;
            } else {
                vkode_akun = '';
                vno_akun = '';
                vnama_akun = '';
                vtipe = '';
            }
        }

        const responsListSubledger = await GetListSubledger(kode_entitas, token);
        if (responsListSubledger.status === true) {
            const filternamasubledger = responsListSubledger.data.filter((item: any) => item.nama_subledger === 'PAJAK PPH 23');
            console.log('filternamasubledger = ', filternamasubledger, responsListSubledger);

            if (filternamasubledger[0].nama_subledger === 'PAJAK PPH 23') {
                vkode_subledger = filternamasubledger[0].kode_subledger;
                vno_subledger = filternamasubledger[0].no_subledger;
                vnama_subledger = filternamasubledger[0].nama_subledger;
                vsubledger = filternamasubledger[0].subledger;
            } else {
                vkode_subledger = '';
                vno_subledger = '';
                vnama_subledger = '';
                vsubledger = '';
            }
        }

        const responsDataSetting = await GetListSettingRpe(kode_entitas, token);

        // hapus semua
        setDataJurnal((state: any) => ({
            ...state,
            nodes: state.nodes.filter((node: any) => node.id_rpe === -1),
        }));

        let i = 1; // id_dokumen

        const newNodeJurnal = [
            {
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader?.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: responsDataSetting.data[0].kode_akun_dbeks,
                no_akun: responsDataSetting.data[0].no_debet_eks,
                nama_akun: responsDataSetting.data[0].nama_debet_eks,
                tipe: responsDataSetting.data[0].tipe_debet_eks,
                kode_subledger: null,
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : 0.0,
                kredit_rp: masterDataState === 'APPROVE' ? 0.0 : vTotalBayarTanpaPPH23,
                jumlah_rp: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : -vTotalBayarTanpaPPH23,
                jumlah_mu: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : -vTotalBayarTanpaPPH23,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: userid.toUpperCase(), //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: '',
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            },
            {
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader?.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: responsDataSetting.data[0].kode_akun_crrpe,
                no_akun: responsDataSetting.data[0].no_kredit_rpe,
                nama_akun: responsDataSetting.data[0].nama_kredit_rpe,
                tipe: responsDataSetting.data[0].tipe_kredit_rpe,
                kode_subledger: null,
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? 0.0 : vTotalBayar,
                kredit_rp: masterDataState === 'APPROVE' ? vTotalBayar : 0.0,
                jumlah_rp: masterDataState === 'APPROVE' ? -vTotalBayar : vTotalBayar,
                jumlah_mu: masterDataState === 'APPROVE' ? -vTotalBayar : vTotalBayar,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: '', //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: '',
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            },
        ];

        // Hanya push entry PPH 23 jika pph23 !== 'N'
        console.log('stateDataHeader?.kodepph23 = ', stateDataHeader?.kodepph23);

        if (stateDataHeader?.kodepph23 !== 'N') {
            newNodeJurnal.push({
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader?.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: vkode_akun,
                no_akun: vno_akun,
                nama_akun: vnama_akun,
                tipe: vtipe,
                kode_subledger: vkode_subledger as any,
                no_subledger: vno_subledger,
                nama_subledger: vnama_subledger,
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? 0.0 : stateDataFooter?.nilaiPph23,
                kredit_rp: masterDataState === 'APPROVE' ? stateDataFooter?.nilaiPph23 : 0.0,
                jumlah_rp: masterDataState === 'APPROVE' ? -stateDataFooter?.nilaiPph23 : stateDataFooter?.nilaiPph23,
                jumlah_mu: masterDataState === 'APPROVE' ? -stateDataFooter?.nilaiPph23 : stateDataFooter?.nilaiPph23,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: '', //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: vsubledger,
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            });
        }

        // // Tambahkan node baru dengan ID yang diinkremen
        // const newNodeJurnal = {
        //     kode_dokumen: '',
        //     id_dokumen: i,
        //     id: i,
        //     dokumen: 'PB',
        //     tgl_dokumen: '',
        //     kode_akun: responsDataSetting.data[0].kode_debet_eks,
        //     no_akun: responsDataSetting.data[0].no_debet_eks,
        //     nama_akun: responsDataSetting.data[0].nama_debet_eks,
        //     tipe: responsDataSetting.data[0].tipe_debet_eks,
        //     kode_subledger: null,
        //     no_subledger: '',
        //     nama_subledger: '',
        //     kurs: 1.0,
        //     kode_mu: 'IDR',
        //     debet_rp:  masterDataState === 'APPROVE' ? frmNumber(vTotalBayar) : 0.00,
        //     kredit_rp: masterDataState === 'APPROVE' ? 0.00: frmNumber(vTotalBayar) ,
        //     jumlah_rp: masterDataState === 'APPROVE' ? frmNumber(vTotalBayar) : frmNumber(-vTotalBayar),
        //     jumlah_mu: masterDataState === 'APPROVE' ? frmNumber(vTotalBayar) : frmNumber(-vTotalBayar),
        //     catatan: masterDataState === 'APPROVE' ? ket: '[REV] '+ket,
        //     persen: 0,
        //     kode_dept: vkode_dept,
        //     kode_kerja: '',
        //     approval: 'N',
        //     posting: 'N',
        //     rekonsiliasi: 'N',
        //     tgl_rekonsil: '',
        //     userid: '',//kode_user,
        //     tgl_update: '',
        //     nama_dept: vnama_dept,
        //     nama_kerja: '',
        //     isledger: '',
        //     subledger: '',
        //     no_warkat: '',
        //     tgl_valuta: '',
        //     no_kerja: '',
        //     kode_kry:vkode_kry,
        //     kode_jual:vkode_jual,
        // };

        // // Tambahkan node baru ke state dan inkremen nilai i
        // setDataJurnal((state: any) => ({
        //     ...state,
        //     nodes: state.nodes.concat(newNodeJurnal),
        // }));

        // i++;

        // // Tambahkan node AKUN HUTANG
        // const newNodeJurnalHutang = {
        //     kode_dokumen: '',
        //     id_dokumen: i,
        //     id: i,
        //     dokumen: 'PB',
        //     tgl_dokumen: '',
        //     kode_akun: responsDataSetting.data[0].kode_akun_crrpe,
        //     no_akun: responsDataSetting.data[0].no_kredit_rpe,
        //     nama_akun: responsDataSetting.data[0].nama_kredit_rpe,
        //     tipe: responsDataSetting.data[0].tipe_kredit_rpe,
        //     kode_subledger: null,
        //     no_subledger: '',
        //     nama_subledger: '',
        //     kurs: 1.0,
        //     kode_mu: 'IDR',
        //     debet_rp:  masterDataState === 'APPROVE' ? 0.00 : frmNumber(vTotalBayar) ,
        //     kredit_rp: masterDataState === 'APPROVE' ? frmNumber(vTotalBayar) : 0.00  ,
        //     jumlah_rp: masterDataState === 'APPROVE' ? frmNumber(-vTotalBayar) : frmNumber(vTotalBayar),
        //     jumlah_mu: masterDataState === 'APPROVE' ? frmNumber(-vTotalBayar) : frmNumber(vTotalBayar),
        //     catatan: masterDataState === 'APPROVE' ? ket: '[REV] '+ket,
        //     persen: 0,
        //     kode_dept: vkode_dept,
        //     kode_kerja: '',
        //     approval: 'N',
        //     posting: 'N',
        //     rekonsiliasi: 'N',
        //     tgl_rekonsil: '',
        //     userid: '',//kode_user,
        //     tgl_update: '',
        //     nama_dept: vnama_dept,
        //     nama_kerja: '',
        //     isledger: '',
        //     subledger: '',
        //     no_warkat: '',
        //     tgl_valuta: '',
        //     no_kerja: '',
        //     kode_kry:vkode_kry,
        //     kode_jual:vkode_jual,
        // };

        // Tambahkan node baru ke state dan inkremen nilai i

        const totalDebet = newNodeJurnal.reduce((total: any, item: any) => {
            return total + parseFloat(item.debet_rp);
        }, 0);
        const totalKredit = newNodeJurnal.reduce((total: any, item: any) => {
            return total + parseFloat(item.kredit_rp);
        }, 0);

        setStateDataDetail((prevState: any) => ({
            ...prevState,
            totalDebet: totalDebet,
            totalKredit: totalKredit,
            totalSelisih: totalDebet - totalKredit,
        }));

        setDataJurnal((state: any) => ({
            ...state,
            nodes: state.nodes.concat(newNodeJurnal),
        }));

        // i++;

        //============================================================================

        // setBlockingJurnal(false); // unblocking jurnal
        // const { nodes } = data;
        // let totalDiskonMu = 0,
        //     totalBerat = 0,
        //     totpsd = 0,
        //     kode_psd = '',
        //     psd = 0,
        //     pajak = 0,
        //     kirim_mu = 0;

        // const newNodes = nodes.map((node: any) => {
        //     let pajak_mu = parseFloat(node.pajak_mu);
        //     let kurs_pajak = parseFloat(node.kurs_pajak);
        //     let jumlah_rp = parseFloat(node.jumlah_rp);

        //     pajak += pajak_mu * kurs_pajak;

        //     if (node.include === 'I') {
        //         totpsd += jumlah_rp - pajak_mu * kurs_pajak;
        //     } else {
        //         totpsd += jumlah_rp;
        //     }

        //     if (node.kode_akun_persedian !== '') {
        //         kode_psd = node.kode_akun_persediaan;

        //         if (node.include === 'I') {
        //             psd += pajak_mu;
        //             console.log(psd);
        //         } else {
        //             psd += jumlah_rp;
        //         }
        //     }

        //     return {
        //         ...node,
        //     };
        // });

        // setDataJurnal((state: any) => ({
        //     ...state,
        //     nodes: newNodes,
        // }));

        // // hapus semua
        // setDataJurnal((state) => ({
        //     ...state,
        //     nodes: state.nodes.filter((node: any) => node.id_pp === -1),
        // }));

        // let i = 1; // id_dokumen

        // // Masukkan akun persediaan
        // if (kode_psd !== '') {
        //     var AkunPersediaan = await axios.get(`${apiUrl}/erp/akun_jurnal_by_id?`, {
        //         params: {
        //             entitas: kode_entitas,
        //             param1: kode_psd,
        //             param2: 'all',
        //             param3: 'all',
        //         },
        //     });
        //     const resAkunPersediaan = AkunPersediaan.data.data;

        //     // Tambahkan node baru dengan ID yang diinkremen
        //     const newNodeJurnal = {
        //         kode_dokumen: '',
        //         id_dokumen: i,
        //         id: i,
        //         dokumen: 'PB',
        //         tgl_dokumen: '',
        //         kode_akun: kode_psd,
        //         no_akun: resAkunPersediaan[0].no_akun,
        //         nama_akun: resAkunPersediaan[0].nama_akun,
        //         tipe: resAkunPersediaan[0].tipe,
        //         kode_subledger: null,
        //         no_subledger: '',
        //         nama_subledger: '',
        //         kurs: 1.0,
        //         kode_mu: 'IDR',
        //         debet_rp: frmNumber(totpsd), //psd
        //         kredit_rp: '0.00',
        //         jumlah_rp: frmNumber(totpsd), //psd
        //         jumlah_mu: frmNumber(totpsd), //psd
        //         catatan: 'Penerimaan Barang No: ' + noPB,
        //         persen: 0,
        //         kode_dept: kodeDept,
        //         kode_kerja: '',
        //         approval: 'N',
        //         posting: 'N',
        //         rekonsiliasi: 'N',
        //         tgl_rekonsil: '',
        //         userid: kode_user,
        //         tgl_update: '',
        //         nama_dept: '',
        //         nama_kerja: '',
        //         isledger: '',
        //         subledger: '',
        //         no_warkat: '',
        //         tgl_valuta: '',
        //         no_kerja: '',
        //     };

        //     // Tambahkan node baru ke state dan inkremen nilai i
        //     setDataJurnal((state: any) => ({
        //         ...state,
        //         nodes: state.nodes.concat(newNodeJurnal),
        //     }));

        //     i++;
        // }

        // //masukan akun jika beban cabang
        // if (kirimMU > 0) {
        //     if (tipeSupp === 'cabang') {
        //         const newNodeJurnal = {
        //             kode_dokumen: '',
        //             id_dokumen: i,
        //             id: i,
        //             dokumen: 'PB',
        //             tgl_dokumen: '',
        //             kode_akun: kodeAkunBeban,
        //             no_akun: noBeban,
        //             nama_akun: namaBeban,
        //             tipe: tipeBeban,
        //             kode_subledger: null,
        //             no_subledger: '',
        //             nama_subledger: '',
        //             kurs: 1.0,
        //             kode_mu: 'IDR',
        //             debet_rp: frmNumber(kirimMU),
        //             kredit_rp: '0.00',
        //             jumlah_rp: frmNumber(kirimMU),
        //             jumlah_mu: frmNumber(kirimMU),
        //             catatan: 'Biaya Pengiriman PB No: ' + noPB,
        //             persen: 0,
        //             kode_dept: kodeDept,
        //             kode_kerja: '',
        //             approval: 'N',
        //             posting: 'N',
        //             rekonsiliasi: 'N',
        //             tgl_rekonsil: '',
        //             userid: kode_user,
        //             tgl_update: '',
        //             nama_dept: '',
        //             nama_kerja: '',
        //             isledger: '',
        //             subledger: '',
        //             no_warkat: '',
        //             tgl_valuta: '',
        //             no_kerja: '',
        //         };
        //         setDataJurnal((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.concat(newNodeJurnal),
        //         }));
        //         i++;
        //     } else {
        //         // biaya kirim
        //         await fetchPreferensi(kode_entitas, apiUrl)
        //             .then((result) => {
        //                 let S_kodeAkunPengiriman = result[0].kode_akun_pengiriman === '' || result[0].kode_akun_pengiriman === null ? '' : result[0].kode_akun_pengiriman;
        //                 let S_noAkunPengiriman = result[0].no_kirim === '' || result[0].no_kirim === null ? '' : result[0].no_kirim;
        //                 let S_namaAkunPengiriman = result[0].nama_kirim === '' || result[0].nama_kirim === null ? '' : result[0].nama_kirim;
        //                 let S_tipeAkunPengiriman = result[0].tipe_kirim === '' || result[0].tipe_kirim === null ? '' : result[0].tipe_kirim;

        //                 const id = dataJurnal?.nodes.length + 1;
        //                 const newNodeJurnal = {
        //                     kode_dokumen: '',
        //                     id_dokumen: i,
        //                     id: i,
        //                     dokumen: 'PB',
        //                     tgl_dokumen: '',
        //                     kode_akun: S_kodeAkunPengiriman,
        //                     no_akun: S_noAkunPengiriman,
        //                     nama_akun: S_namaAkunPengiriman,
        //                     tipe: S_tipeAkunPengiriman,
        //                     kode_subledger: null,
        //                     no_subledger: '',
        //                     nama_subledger: '',
        //                     kurs: 1.0,
        //                     kode_mu: 'IDR',
        //                     debet_rp: frmNumber(kirimMU),
        //                     kredit_rp: '0.00',
        //                     jumlah_rp: frmNumber(kirimMU),
        //                     jumlah_mu: frmNumber(kirimMU),
        //                     catatan: 'Biaya Pengiriman PB No: ' + noPB,
        //                     persen: 0,
        //                     kode_dept: kodeDept,
        //                     kode_kerja: '',
        //                     approval: 'N',
        //                     posting: 'N',
        //                     rekonsiliasi: 'N',
        //                     tgl_rekonsil: '',
        //                     userid: kode_user,
        //                     tgl_update: '',
        //                     nama_dept: '',
        //                     nama_kerja: '',
        //                     isledger: '',
        //                     subledger: '',
        //                     no_warkat: '',
        //                     tgl_valuta: '',
        //                     no_kerja: '',
        //                 };
        //                 setDataJurnal((state: any) => ({
        //                     ...state,
        //                     nodes: state.nodes.concat(newNodeJurnal),
        //                 }));
        //                 i++;
        //             })
        //             .catch((error) => {
        //                 console.error('Error:', error);
        //             });
        //     }
        // }

        // //masukan akun pajak
        // if (pajak > 0) {
        //     const id = dataJurnal?.nodes.length + 1;
        //     const newNodeJurnal = {
        //         kode_dokumen: '',
        //         id_dokumen: i,
        //         id: i,
        //         dokumen: 'PB',
        //         tgl_dokumen: '',
        //         kode_akun: kodeAkunPajakBeli,
        //         no_akun: noPajakBeli,
        //         nama_akun: namaPajakBeli,
        //         tipe: tipePajakBeli,
        //         kode_subledger: null,
        //         no_subledger: '',
        //         nama_subledger: '',
        //         kurs: 1.0,
        //         kode_mu: 'IDR',
        //         debet_rp: frmNumber(pajak),
        //         kredit_rp: '0.00',
        //         jumlah_rp: frmNumber(pajak),
        //         jumlah_mu: frmNumber(pajak),
        //         catatan: 'Pajak ' + namaRelasi + ', PB No: ' + noPB,
        //         persen: 0,
        //         kode_dept: kodeDept,
        //         kode_kerja: '',
        //         approval: 'N',
        //         posting: 'N',
        //         rekonsiliasi: 'N',
        //         tgl_rekonsil: '',
        //         userid: kode_user,
        //         tgl_update: '',
        //         nama_dept: '',
        //         nama_kerja: '',
        //         isledger: '',
        //         subledger: '',
        //         no_warkat: '',
        //         tgl_valuta: '',
        //         no_kerja: '',
        //     };
        //     setDataJurnal((state: any) => ({
        //         ...state,
        //         nodes: state.nodes.concat(newNodeJurnal),
        //     }));
        //     i++;
        // }

        // // masukan akun kas
        // if (namaTermin === 'C.O.D') {
        //     if (tipeSupp !== 'cabang') {
        //         await fetchPreferensi(kode_entitas, apiUrl)
        //             .then((result) => {
        //                 // setkodeAkunKas(result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas);
        //                 // setnoAkunKas(result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas);
        //                 // setnamaAkunKas(result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas);
        //                 // settipeAkunKas(result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas);
        //                 let S_kodeAkunKas = result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas;
        //                 let S_noAkunKas = result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas;
        //                 let S_namaAkunKas = result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas;
        //                 let S_tipeAkunKas = result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas;

        //                 const id = dataJurnal?.nodes.length + 1;
        //                 const newNodeJurnal = {
        //                     kode_dokumen: '',
        //                     id_dokumen: i,
        //                     id: i,
        //                     dokumen: 'PB',
        //                     tgl_dokumen: '',
        //                     kode_akun: S_kodeAkunKas,
        //                     no_akun: S_noAkunKas,
        //                     nama_akun: S_namaAkunKas,
        //                     tipe: S_tipeAkunKas,
        //                     kode_subledger: kodeSuppM,
        //                     no_subledger: noSupp,
        //                     nama_subledger: namaRelasi,
        //                     kurs: 1.0,
        //                     kode_mu: 'IDR',
        //                     debet_rp: '0.00',
        //                     kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
        //                     jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //                     jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //                     catatan: 'Pembelian Barang PB No: ' + noPB,
        //                     persen: 0,
        //                     kode_dept: kodeDept,
        //                     kode_kerja: '',
        //                     approval: 'N',
        //                     posting: 'N',
        //                     rekonsiliasi: 'N',
        //                     tgl_rekonsil: '',
        //                     userid: kode_user,
        //                     tgl_update: '',
        //                     nama_dept: '',
        //                     nama_kerja: '',
        //                     isledger: '',
        //                     subledger: noSupp + '-' + namaRelasi,
        //                     no_warkat: '',
        //                     tgl_valuta: '',
        //                     no_kerja: '',
        //                 };
        //                 setDataJurnal((state: any) => ({
        //                     ...state,
        //                     nodes: state.nodes.concat(newNodeJurnal),
        //                 }));
        //                 i++;
        //             })
        //             .catch((error) => {
        //                 console.error('Error:', error);
        //             });
        //     } else {
        //         await fetchPreferensi(kode_entitas, apiUrl)
        //             .then((result) => {
        //                 setkodeAkunKas(result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas);
        //                 setnoAkunKas(result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas);
        //                 setnamaAkunKas(result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas);
        //                 settipeAkunKas(result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas);
        //             })
        //             .catch((error) => {
        //                 console.error('Error:', error);
        //             });
        //         const id = dataJurnal?.nodes.length + 1;
        //         const newNodeJurnal = {
        //             kode_dokumen: '',
        //             id_dokumen: i,
        //             id: i,
        //             dokumen: 'PB',
        //             tgl_dokumen: '',
        //             kode_akun: kodeAkunKas,
        //             no_akun: noAkunKas,
        //             nama_akun: namaAkunKas,
        //             tipe: tipeAkunKas,
        //             kode_subledger: null,
        //             no_subledger: '',
        //             nama_subledger: '',
        //             kurs: 1.0,
        //             kode_mu: 'IDR',
        //             debet_rp: '0.00',
        //             kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
        //             jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             catatan: 'Pembelian Barang PB No: ' + noPB,
        //             persen: 0,
        //             kode_dept: kodeDept,
        //             kode_kerja: '',
        //             approval: 'N',
        //             posting: 'N',
        //             rekonsiliasi: 'N',
        //             tgl_rekonsil: '',
        //             userid: kode_user,
        //             tgl_update: '',
        //             nama_dept: '',
        //             nama_kerja: '',
        //             isledger: '',
        //             subledger: '',
        //             no_warkat: '',
        //             tgl_valuta: '',
        //             no_kerja: '',
        //         };
        //         setDataJurnal((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.concat(newNodeJurnal),
        //         }));
        //         i++;
        //     }
        // } else {
        //     // hutang supplier
        //     if (tipeSupp !== 'cabang') {
        //         const id = dataJurnal?.nodes.length + 1;
        //         const newNodeJurnal = {
        //             kode_dokumen: '',
        //             id_dokumen: i,
        //             id: i,
        //             dokumen: 'PB',
        //             tgl_dokumen: '',
        //             kode_akun: kodeAkunHutang,
        //             no_akun: noHutang,
        //             nama_akun: namaHutang,
        //             tipe: tipeHutang,
        //             kode_subledger: kodeSuppM,
        //             no_subledger: noSupp,
        //             nama_subledger: namaRelasi,
        //             kurs: 1.0,
        //             kode_mu: 'IDR',
        //             debet_rp: '0.00',
        //             kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
        //             jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             catatan: 'Hutang ' + namaRelasi + ', PB No: ' + noPB,
        //             persen: 0,
        //             kode_dept: kodeDept,
        //             kode_kerja: '',
        //             approval: 'N',
        //             posting: 'N',
        //             rekonsiliasi: 'N',
        //             tgl_rekonsil: '',
        //             userid: kode_user,
        //             tgl_update: '',
        //             nama_dept: '',
        //             nama_kerja: '',
        //             isledger: '',
        //             subledger: noSupp + '-' + namaRelasi,
        //             no_warkat: '',
        //             tgl_valuta: '',
        //             no_kerja: '',
        //         };
        //         setDataJurnal((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.concat(newNodeJurnal),
        //         }));
        //         i++;
        //     } else {
        //         const id = dataJurnal?.nodes.length + 1;
        //         const newNodeJurnal = {
        //             kode_dokumen: '',
        //             id_dokumen: i,
        //             id: i,
        //             dokumen: 'PB',
        //             tgl_dokumen: '',
        //             kode_akun: kodeAkunHutang,
        //             no_akun: noHutang,
        //             nama_akun: namaHutang,
        //             tipe: tipeHutang,
        //             kode_subledger: kodeSuppM,
        //             no_subledger: '',
        //             nama_subledger: '',
        //             kurs: 1.0,
        //             kode_mu: 'IDR',
        //             debet_rp: '0.00',
        //             kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
        //             jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
        //             catatan: 'Hutang ' + namaRelasi + ', PB No: ' + noPB,
        //             persen: 0,
        //             kode_dept: kodeDept,
        //             kode_kerja: '',
        //             approval: 'N',
        //             posting: 'N',
        //             rekonsiliasi: 'N',
        //             tgl_rekonsil: '',
        //             userid: kode_user,
        //             tgl_update: '',
        //             nama_dept: '',
        //             nama_kerja: '',
        //             isledger: '',
        //             subledger: '',
        //             no_warkat: '',
        //             tgl_valuta: '',
        //             no_kerja: '',
        //         };
        //         setDataJurnal((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.concat(newNodeJurnal),
        //         }));
        //         i++;
        //     }
        // }

        // //masukan akun diskon
        // if (nominalDiskon > 0) {
        //     try {
        //         const result = await fetchPreferensi(kode_entitas, apiUrl);
        //         setkodeAkunDiskonBeli(result[0].kode_akun_diskon_beli === '' || result[0].kode_akun_diskon_beli === null ? '' : result[0].kode_akun_diskon_beli);
        //         setnoAkunDiskonBeli(result[0].no_diskon_beli === '' || result[0].no_diskon_beli === null ? '' : result[0].no_diskon_beli);
        //         setnamaAkunDiskonBeli(result[0].nama_diskon_beli === '' || result[0].nama_diskon_beli === null ? '' : result[0].nama_diskon_beli);
        //         settipeAkunDiskonBeli(result[0].tipe_diskon_beli === '' || result[0].tipe_diskon_beli === null ? '' : result[0].tipe_diskon_beli);
        //         let S_kodeAkunDiskonBeli = result[0].kode_akun_diskon_beli === '' || result[0].kode_akun_diskon_beli === null ? '' : result[0].kode_akun_diskon_beli;
        //         let S_noAkunDiskonBeli = result[0].no_diskon_beli === '' || result[0].no_diskon_beli === null ? '' : result[0].no_diskon_beli;
        //         let S_namaAkunDiskonBeli = result[0].nama_diskon_beli === '' || result[0].nama_diskon_beli === null ? '' : result[0].nama_diskon_beli;
        //         let S_tipeAkunDiskonBeli = result[0].tipe_diskon_beli === '' || result[0].tipe_diskon_beli === null ? '' : result[0].tipe_diskon_beli;

        //         const id = dataJurnal?.nodes.length + 1;
        //         const newNodeJurnal = {
        //             kode_dokumen: '',
        //             id_dokumen: i,
        //             id: i,
        //             dokumen: 'PB',
        //             tgl_dokumen: '',
        //             kode_akun: S_kodeAkunDiskonBeli,
        //             no_akun: S_noAkunDiskonBeli,
        //             nama_akun: S_namaAkunDiskonBeli,
        //             tipe: S_tipeAkunDiskonBeli,
        //             kode_subledger: null,
        //             no_subledger: '',
        //             nama_subledger: '',
        //             kurs: 1.0,
        //             kode_mu: 'IDR',
        //             debet_rp: '0.00',
        //             kredit_rp: frmNumber(nominalDiskon),
        //             jumlah_rp: frmNumber(nominalDiskon * -1),
        //             jumlah_mu: frmNumber(nominalDiskon * -1),
        //             catatan: 'Potongan Pembelian PB No: ' + noPB,
        //             persen: 0,
        //             kode_dept: kodeDept,
        //             kode_kerja: '',
        //             approval: 'N',
        //             posting: 'N',
        //             rekonsiliasi: 'N',
        //             tgl_rekonsil: '',
        //             userid: kode_user,
        //             tgl_update: '',
        //             nama_dept: '',
        //             nama_kerja: '',
        //             isledger: '',
        //             subledger: '',
        //             no_warkat: '',
        //             tgl_valuta: '',
        //             no_kerja: '',
        //         };
        //         setDataJurnal((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.concat(newNodeJurnal),
        //         }));
        //         i++;
        //     } catch (error) {
        //         console.error('Error:', error);
        //     }
        // }
    };

    //================ Editing template untuk kolom grid detail barang ==================
    const EditTemplateHargaEks = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="harga_eks_add" name="harga_eks_add" className="harga_eks_add" value={frmNumberSyncfusion(args.harga_eks)} disabled={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buHargaEks"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    getHargaEkspedisi(args);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const frmNumberSyncfusion = (value: any) => {
        // Menggunakan fungsi Number() untuk mengonversi string menjadi angka
        let numericValue = Number(value);

        // Memeriksa apakah nilai numerik adalah NaN
        if (isNaN(numericValue)) {
            numericValue = 0; // Mengubah NaN menjadi 0
        }

        // Menggunakan fungsi Number.toLocaleString() untuk memformat angka
        const formattedValue = numericValue.toLocaleString('de-DE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return formattedValue;
    };

    //================ Template untuk kolom grid list data ==================
    const templatePilih = (args: any) => {
        const checkboxStyle = {
            accentColor: '#4361EE',
        };
        return <input onClick={(event: any) => handleTemplatePilih(args, event.target.checked)} type="checkbox" checked={args.idChecked > 0 ? true : false} style={checkboxStyle} readOnly />;
    };

    const editTemplatePilih = (args: any) => {
        const checkboxStyle = {
            accentColor: '#4361EE',
        };
        return <input onClick={(event: any) => handleTemplatePilih(args, event.target.checked)} type="checkbox" checked={args.idChecked > 0 ? true : false} style={checkboxStyle} readOnly />;
    };

    const handleTemplatePilih = async (args: any, event: any) => {
        const isCheck = event;
        const id = args.id;
        console.log('sdsadadsaadsa = ', args);
        const newNodes = await dataBarang?.nodes?.map((node: any) => {
            if (node.id === id) {
                if (isCheck === true) {
                    return {
                        ...node,
                        idChecked: node.netto_rp,
                        waktuCeklis: 1,
                    };
                } else {
                    return {
                        ...node,
                        idChecked: 0,
                        waktuCeklis: 0,
                    };
                }
            } else {
                return node;
            }
        });

        let totNettoRp: any;
        let beratTotal: any;
        let beratKlaim: any;
        let tambahanJarak: any;
        let totalKlaimEkspedisi: any;

        totNettoRp = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                // return acc + parseFloat(node.netto_rp);
                return acc + parseFloat(node.total_rp);
            }
            return acc;
        }, 0);
        beratTotal = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_berat);
            }
            return acc;
        }, 0);
        beratKlaim = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_berat_ekspedisi);
            }
            return acc;
        }, 0);

        tambahanJarak = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.tambahan_jarak);
            }
            return acc;
        }, 0);

        totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
            if (node.idChecked > 0) {
                return acc + parseFloat(node.total_klaim_ekspedisi);
            }
            return acc;
        }, 0);

        console.log('newNodes = ', newNodes);
        const isNoZeroPayment = newNodes.every((node: any) => node.idChecked !== 0);
        console.log('isNoZeroPayment = ', isNoZeroPayment);
        if (isNoZeroPayment) {
            await setStateDataHeader((prevState: any) => ({
                ...prevState,
                disabledResetPembayaran: false,
                disabledBayarAllInvoice: false,
                disabledBatalInvoice: false,
                disabledBatalSemuaPembayaran: true,
            }));
        } else {
            await setStateDataHeader((prevState: any) => ({
                ...prevState,
                disabledResetPembayaran: true,
                disabledBayarAllInvoice: false,
                disabledBatalInvoice: false,
                disabledBatalSemuaPembayaran: false,
            }));
        }

        console.log('tambahanJarak = ', parseFloat(stateDataFooter?.biayaLainLain));
        const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
        const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
        const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
        const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

        await setStateDataFooter((prevState: any) => ({
            ...prevState,
            subTotal: totNettoRp,
            totalTagihan: total_tagihan,
            nominalInvoice: stateDataHeader?.nominalInvoice,
            totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
            totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
            potonganEkspedisiLain: potongan_ekspedisi,
            nilaiPph23: nilai_pph23,
            totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
            beratTotal: beratTotal,
            beratKlaim: beratKlaim,
            tambahanJarak: tambahanJarak,
        }));
        await setDataBarang({ nodes: newNodes });
    };

    const getFormattedName = (index: number) => {
        return moment().add(index, 'second').format('YYMMDDHHmmss');
    };

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const handleUpload = async (kode_rpe: any) => {
        const formData = new FormData();
        let entitas;

        // Menggunakan state files sebagai selectedFiles
        files.forEach((file: File, index: number) => {
            const tabIdx: any = 100 + index; // Anda bisa menyesuaikan ini dengan nilai tabIdx yang sesuai
            const formattedName = getFormattedName(index);
            formData.append('myimage', file);

            const fileExtension = file.name.split('.').pop(); // Ambil ekstensi file
            formData.append('nama_file_image', `RPE${formattedName}.${fileExtension}`);
            formData.append('kode_dokumen', kode_rpe); // Pastikan kodeSp sudah diatur sebelumnya
            formData.append('id_dokumen', tabIdx);
            formData.append('dokumen', 'RPE-');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        // Cetak log untuk debugging
        // console.log('Selected Files = ' + files.length);

        // console.log('FormData Contents:');
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        if (files.length > 0) {
            console.log('masuk data kalo ada yang baru');
            await axios
                .post(`${apiUrl}/upload`, formData)
                .then((response) => {
                    let jsonSimpan;
                    console.log(response.data);
                    if (Array.isArray(response.data.nama_file_image)) {
                        // Buat array JSON berdasarkan respon
                        jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => {
                            return {
                                entitas: kode_entitas,
                                kode_dokumen: kode_rpe,
                                id_dokumen: response.data.id_dokumen[index],
                                dokumen: 'RPE-',
                                filegambar: namaFile,
                                fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                            };
                        });
                        console.log(jsonSimpan);
                        console.log(JSON.stringify(jsonSimpan));
                    } else {
                        jsonSimpan = {
                            entitas: kode_entitas,
                            kode_dokumen: kode_rpe,
                            id_dokumen: response.data.id_dokumen,
                            dokumen: 'RPE-',
                            filegambar: response.data.nama_file_image,
                            fileoriginal: response.data.filesinfo,
                        };
                        console.log('satu');
                        console.log(jsonSimpan);
                    }
                    // if (response.data.status === true) {
                    //     // if (selectedFile !== 'update') {
                    //     axios
                    //         .post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan)
                    //         .then((response) => {
                    //             console.log(response);
                    //         })
                    //         .catch((error) => {
                    //             console.error('Error:', error);
                    //         });
                    //     // }
                    // }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    };

    const pilihFilePendukung = (file: any, index: any) => {
        setNumberId(index);
        setDocumentData(file);
    };

    const clearFile = (fileIndex: any) => {
        setFiles((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileIndex));
        setFilesUpload((prevFiles: any) => prevFiles.filter((_: any, index: any) => index !== fileIndex));
        if (previewFile && previewFile.name === files[fileIndex].name) {
            setPreviewFile(null);
        }
    };

    const clearAllFiles = () => {
        setFiles([]);
        setPreviewFile(null);
    };

    const handleFileClick = async (file: File, imageLocal: any) => {
        console.log();

        setPreviewFile(file);
        if (!file) return null;

        const fileType = file.type;
        // const fileTypeServer = imageServer;
        let extension, namaFile;

        if (fileType === undefined) {
            const fileName = imageLocal.filegambar;
            namaFile = imageLocal.filegambar;
            extension = fileName.split('.').pop(); // Hasil: "pdf"

            console.log('kode_entitas = ', kode_entitas, namaFile);

            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${namaFile}`);
                console.log('responsePreviewPdf = ', responsePreviewPdf);

                if (!responsePreviewPdf.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                // Assuming the response contains the URL directly
                const pdfBlob = await responsePreviewPdf.blob();
                const pdfObjectURL = URL.createObjectURL(pdfBlob);
                console.log('pdfObjectURL = ', pdfObjectURL);

                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: imageLocal.decodeBase64_string,
                    indexPreview: file.name,
                }));
            } else {
                downloadBase64Image(imageLocal.decodeBase64_string, file.name);
            }
        } else {
            const fileName = file.name;
            namaFile = file.name;
            extension = fileName.split('.').pop(); // Hasil: "pdf"

            if (extension === 'pdf') {
                const pdfObjectURL = URL.createObjectURL(file);
                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: URL.createObjectURL(file),
                    indexPreview: file.name,
                }));
            } else {
                downloadBase64Image1(imageLocal.decodeBase64_string, file.name, file);
            }
        }
    };

    const downloadBase64Image = (base64Image: string, filename: string) => {
        console.log('filename = ', filename);

        const byteString = atob(base64Image.split(',')[1]); // Decode base64
        const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0]; // Extract mime type

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });

        // Create an object URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a link element, set its href to the blob URL and download attribute
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;

        // Append link to the body, click it and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the object URL
        URL.revokeObjectURL(blobUrl);
    };

    const downloadBase64Image1 = (base64Image: string | undefined, filename: string, documentData: File | undefined) => {
        if (base64Image) {
            try {
                const byteString = atob(base64Image.split(',')[1]); // Decode base64
                const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type

                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);

                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                const blob = new Blob([ab], { type: mimeString });

                // Buat URL dan trigger download
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error processing Base64 image:', error);
            }
        } else if (documentData) {
            try {
                const blobUrl = URL.createObjectURL(documentData);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = documentData.name; // Gunakan nama asli
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading original file:', error);
            }
        } else {
            console.log('No Base64 or documentData available.');
        }
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
    };

    const handlePreview = async (imageLocal: any) => {
        const fileName = imageLocal.filegambar;

        if (fileName === undefined) {
            downloadBase64Image1(imageLocal.decodeBase64_string, imageLocal.name, imageLocal);
        } else {
            const extension = fileName.split('.').pop(); // Hasil: "pdf"
            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${imageLocal.filegambar}`);

                if (!responsePreviewPdf.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                // Assuming the response contains the URL directly
                const pdfBlob = await responsePreviewPdf.blob();
                const pdfObjectURL = URL.createObjectURL(pdfBlob);

                setPdfUrl(pdfObjectURL);
                setPreviewPdf(true);
            } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    isOpenPreview: true,
                    imageDataUrl: imageLocal.decodeBase64_string,
                    indexPreview: imageLocal.name,
                }));
            } else {
                downloadBase64Image1(imageLocal.decodeBase64_string, imageLocal.name, imageLocal);
            }
        }
    };

    const templateTambahanJarak = (args: any) => {
        return (
            <div>
                <input
                    style={{ textAlign: 'right', backgroundColor: 'transparent', border: 'none', marginLeft: '-30px' }}
                    id="tambahan_jarak"
                    name="tambahan_jarak"
                    value={frmNumberSyncfusion(args.tambahan_jarak)}
                    disabled={true}
                />
            </div>
        );
    };

    const handleDeleteDetail = async (tipe: any, args: any) => {
        if (tipe === 'hapus') {
            console.log('args = ', args?.getSelectedRecords());
            const dataArgs = args?.getSelectedRecords();
            if (dataArgs.length > 0) {
                console.log('dataArgs[0].id = ', dataArgs[0].id);
                const newNodes = await dataBarang?.nodes?.map((node: any) => {
                    if (node.id === dataArgs[0].id) {
                        return {
                            ...node,
                            idChecked: 0,
                            waktuCeklis: 0,
                        };
                    } else {
                        return node;
                    }
                });

                let totNettoRp: any;
                let beratTotal: any;
                let tambahanJarak: any;
                let totalKlaimEkspedisi: any;

                totNettoRp = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.netto_rp);
                    }
                    return acc;
                }, 0);
                beratTotal = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.total_berat);
                    }
                    return acc;
                }, 0);

                tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.tambahan_jarak);
                    }
                    return acc;
                }, 0);

                totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                    if (node.idChecked > 0) {
                        return acc + parseFloat(node.total_klaim_ekspedisi);
                    }
                    return acc;
                }, 0);

                const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
                const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
                const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
                const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

                await setStateDataFooter((prevState: any) => ({
                    ...prevState,
                    subTotal: totNettoRp,
                    totalTagihan: total_tagihan,
                    nominalInvoice: stateDataHeader?.nominalInvoice,
                    totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                    totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                    potonganEkspedisiLain: potongan_ekspedisi,
                    nilaiPph23: nilai_pph23,
                    totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                    beratTotal: beratTotal,
                }));
                await setDataBarang({ nodes: newNodes });
            } else {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
                    width: '100%',
                    target: '#dialogFormRpe',
                    // customClass: {
                    //     popup: styles['colored-popup'], // Custom class untuk sweetalert
                    // },
                });
                return;
            }
        } else {
            const newNodes = await dataBarang?.nodes?.map((node: any) => {
                return {
                    ...node,
                    idChecked: 0,
                    waktuCeklis: 0,
                };
            });

            let totNettoRp: any;
            let beratTotal: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            totNettoRp = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.netto_rp);
                }
                return acc;
            }, 0);
            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);

            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter?.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter?.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter?.potonganEkspedisiLain) : 0;

            await setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                totalTagihan: total_tagihan,
                nominalInvoice: stateDataHeader?.nominalInvoice,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
            }));
            await setDataBarang({ nodes: newNodes });
        }
    };

    return (
        <div className="panel-tab !h-[calc(100%-380px)] bg-black" style={{ background: '#F7F7F7', width: '100%' }}>
            <TabComponent ref={(t) => (tabPhuList = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                <div className="e-tab-header !h-[30px]">
                    <div tabIndex={0}>1. Alokasi Pembayaran</div>
                    <div tabIndex={1}>2. Jurnal</div>
                    <div tabIndex={2}>3. Bukti Pendukung</div>
                </div>
                <div className="e-content !h-full">
                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={0}>
                        {/* <TooltipComponent ref={(t) => (tooltipDetailBarang = t)} beforeRender={beforeRenderDetailBarang} openDelay={1000} target=".e-headertext"> */}
                        <div className="h-[calc(100%-70px)] w-full">
                            <GridComponent
                                key={gridKeyDataBarang}
                                id="gridRpeList"
                                name="gridRpeList"
                                className="gridRpeList"
                                locale="id"
                                ref={gridRpeListRef}
                                dataSource={dataBarang?.nodes}
                                // dataSource={stateDataDetail.searchKeywordNoSj !== '' ? filteredDataBarang : dataBarang?.nodes}
                                editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                allowResizing={true}
                                autoFit={true}
                                rowHeight={22}
                                height={'100%'} //170 barang jadi 150 barang produksi
                                gridLines={'Both'}
                                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                // actionBegin={actionBeginDetailBarang}
                                // actionComplete={actionCompleteDetailBarang}
                                recordClick={(args: any) => {
                                    currentDaftarBarang = gridRpeListRef.current?.getSelectedRecords() || [];
                                    if (currentDaftarBarang.length > 0) {
                                        gridRpeListRef.current?.startEdit();
                                    }
                                }}
                            >
                                <ColumnsDirective>
                                    {/* <ColumnDirective field="id" type="number" isPrimaryKey={true} headerText="No." headerTextAlign="Center" textAlign="Center" width="30" /> */}
                                    <ColumnDirective
                                        field="no_fbm"
                                        isPrimaryKey={true}
                                        headerText="No. FBM"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="120"
                                        // clipMode="EllipsisWithTooltip"
                                        // template={(args: any) => TemplateNoSj(args)}
                                        // editTemplate={EditTemplateNoSj}
                                    />

                                    <ColumnDirective
                                        field="nopol"
                                        isPrimaryKey={true}
                                        headerText="No. Kendaraan"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="80"
                                        // editTemplate={EditTemplateNoVch}
                                    />
                                    <ColumnDirective
                                        field="no_mb"
                                        isPrimaryKey={true}
                                        headerText="No. MB"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="120"
                                        // editTemplate={EditTemplateNoFb}
                                    />
                                    <ColumnDirective
                                        field="tgl_mb"
                                        isPrimaryKey={true}
                                        headerText="Tgl. MB"
                                        headerTextAlign="Center"
                                        textAlign="Center"
                                        width="80"
                                        format={formatDate}
                                        type="date"
                                        // template={(args: any) => TemplateTglFb(args)}
                                        // editTemplate={EditTemplateTglFb}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="nama_gudang"
                                        headerText="Gudang Asal"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="200"
                                        // editTemplate={EditTemplateHari}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="nama_tujuan"
                                        headerText="Gudang Tujuan"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="200"
                                        // editTemplate={EditTemplateHari}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="pph23"
                                        headerText="PPH 23"
                                        headerTextAlign="Center"
                                        textAlign="Center"
                                        width="50"
                                        // editTemplate={EditTemplateHari}
                                    />
                                    <ColumnDirective
                                        field="total_berat"
                                        isPrimaryKey={true}
                                        // format={formatFloat}
                                        headerText="Total Berat"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        format="N2"
                                        edit={qtyParams}
                                        width="100"
                                        // editTemplate={EditTemplateSisa}
                                    />
                                    <ColumnDirective
                                        field="harga_eks"
                                        isPrimaryKey={true}
                                        // format={formatFloat}
                                        format="N2"
                                        headerText="Harga Ekspedisi"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="100"
                                        editTemplate={EditTemplateHargaEks}
                                    />
                                    <ColumnDirective
                                        field="total_rp"
                                        isPrimaryKey={true}
                                        format="N2"
                                        edit={qtyParams}
                                        headerText="Nilai"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="120"
                                        // editTemplate={EditTemplateSisa}
                                    />
                                    <ColumnDirective
                                        field="tambahan_jarak"
                                        isPrimaryKey={true}
                                        format="N2"
                                        headerText="Tambahan Jarak"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="120"
                                        editTemplate={editTemplateTambahanJarak}
                                        template={templateTambahanJarak}
                                    />
                                    <ColumnDirective
                                        template={templatePilih}
                                        // field="nama_barang"
                                        headerText="Pilih"
                                        headerTextAlign="Center"
                                        textAlign="Center"
                                        width="50"
                                        editTemplate={editTemplatePilih}
                                    />
                                    <ColumnDirective
                                        field="total_klaim_ekspedisi"
                                        isPrimaryKey={true}
                                        format="N2"
                                        headerText="Nilai Klaim Ekspedisi FBM"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="150"
                                    />
                                </ColumnsDirective>

                                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                            </GridComponent>
                        </div>
                        {/* </TooltipComponent> */}

                        <div className="panel-pager h-[30px]">
                            <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                    <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                        <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                            <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                    <div className="mt-1 flex">
                                                        {/* <ButtonComponent
                                                                                id="buEdit1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-edit"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                onClick={() => DetailBarangEdit(gridPhuList)}
                                                                            /> */}
                                                        <ButtonComponent
                                                            id="buDelete1"
                                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                            cssClass="e-warning e-small"
                                                            iconCss="e-icons e-small e-trash"
                                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                            // onClick={() =>
                                                            //     DetailNoFakturDelete(
                                                            //         gridPhuListRef.current,
                                                            //         swalDialog,
                                                            //         setDataBarang,
                                                            //         setStateDataFooter,
                                                            //         setStateDataHeader,
                                                            //         stateDataHeader,
                                                            //         stateDataFooter
                                                            //     )
                                                            // }
                                                            onClick={() => {
                                                                handleDeleteDetail('hapus', gridRpeListRef.current);
                                                            }}
                                                        />
                                                        <ButtonComponent
                                                            id="buDeleteAll1"
                                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                            cssClass="e-danger e-small"
                                                            iconCss="e-icons e-small e-erase"
                                                            style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                            // onClick={() =>
                                                            //     DetailNoFakturDeleteAll(
                                                            //         gridPhuListRef.current,
                                                            //         swalDialog,
                                                            //         setDataBarang,
                                                            //         setStateDataFooter,
                                                            //         setStateDataHeader,
                                                            //         stateDataHeader,
                                                            //         stateDataFooter
                                                            //     )
                                                            // }
                                                            onClick={() => {
                                                                handleDeleteDetail('hapusAll', gridRpeListRef.current);
                                                            }}
                                                        />
                                                        <div className="flex" style={{ width: '30%' }}>
                                                            <div style={{ width: '50%' }}>
                                                                <div className="set-font-11" style={{ marginRight: 2 + 'em' }}>
                                                                    <b>Berat Klaim &nbsp; : &nbsp;&nbsp;&nbsp;</b>
                                                                </div>
                                                            </div>
                                                            <div style={{ width: '50%' }}>
                                                                <div className="set-font-11" style={{ marginRight: 2 + 'em' }}>
                                                                    <b>Berat Total &nbsp;: &nbsp;&nbsp;&nbsp;{frmNumber(stateDataFooter?.beratTotal)}</b>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                        {/* <TooltipComponent ref={(t) => (tooltipDetailBarang = t)} beforeRender={beforeRenderDetailBarang} openDelay={1000} target=".e-headertext"> */}
                        <div className="h-[calc(100%-70px)] w-full">
                            <GridComponent
                                // key={gridKeyDataJurnal}
                                id="gridJurnalList"
                                name="gridJurnalList"
                                className="gridJurnalList"
                                locale="id"
                                ref={gridJurnalRpeListRef}
                                dataSource={dataJurnal?.nodes}
                                editSettings={{ allowAdding: true, allowEditing: false, allowDeleting: true, newRowPosition: 'Bottom' }}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                allowResizing={true}
                                autoFit={true}
                                rowHeight={22}
                                height={'100%'}
                                gridLines={'Both'}
                                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                actionBegin={actionBeginDataJurnal}
                                actionComplete={actionCompleteDataJurnal}
                                recordClick={(args: any) => {
                                    currentDaftarJurnal = gridJurnalRpeListRef.current?.getSelectedRecords() || [];
                                    if (currentDaftarJurnal.length > 0) {
                                        gridJurnalRpeListRef.current?.startEdit();
                                    }
                                }}
                            >
                                <ColumnsDirective>
                                    {/* <ColumnDirective field="id" type="number" isPrimaryKey={true} headerText="No." headerTextAlign="Center" textAlign="Center" width="30" /> */}
                                    <ColumnDirective
                                        field="no_akun"
                                        isPrimaryKey={true}
                                        headerText="No. Akun"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="100"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={(args: any) =>
                                        //     EditTemplateNoAkun(
                                        //         args,
                                        //         'akunKredit',
                                        //         setStateDataHeader,
                                        //         setDataDaftarAkunKredit,
                                        //         setDataDaftarSupplier,
                                        //         kode_entitas,
                                        //         stateDataHeader?.kodeSupplierValue,
                                        //         setDataDaftarUangMuka,
                                        //         setStateDataDetail,
                                        //         setDataDaftarCustomer,
                                        //         setDataDaftarSubledger,
                                        //         dokumenId.current,
                                        //         tipe_Add.current
                                        //     )
                                        // }
                                    />
                                    <ColumnDirective
                                        field="nama_akun"
                                        isPrimaryKey={true}
                                        headerText="Nama Akun"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="130"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={(args: any) =>
                                        //     EditTemplateNamaAkun(
                                        //         args,
                                        //         'akunKredit',
                                        //         setStateDataHeader,
                                        //         setDataDaftarAkunKredit,
                                        //         setDataDaftarSupplier,
                                        //         kode_entitas,
                                        //         stateDataHeader?.kodeSupplierValue,
                                        //         setDataDaftarUangMuka,
                                        //         setStateDataDetail,
                                        //         setDataDaftarCustomer,
                                        //         setDataDaftarSubledger,
                                        //         dokumenId.current,
                                        //         tipe_Add.current
                                        //     )
                                        // }
                                    />
                                    <ColumnDirective
                                        field="debet_rp"
                                        isPrimaryKey={true}
                                        format={formatFloat}
                                        editType="numericedit"
                                        // edit={qtyParams}
                                        // editTemplate={EditTemplateDebetRp}
                                        headerText="Debet"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="100"
                                        clipMode="EllipsisWithTooltip"
                                    />
                                    <ColumnDirective
                                        field="kredit_rp"
                                        isPrimaryKey={true}
                                        format={formatFloat}
                                        editType="numericedit"
                                        // edit={qtyParams}
                                        // editTemplate={EditTemplateKreditRp}
                                        headerText="Kredit"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="100"
                                        clipMode="EllipsisWithTooltip"
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="catatan"
                                        headerText="Keterangan"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="200"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={EditTemplateKeterangan}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="kode_mu"
                                        headerText="MU"
                                        headerTextAlign="Center"
                                        textAlign="Center"
                                        width="50"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={EditTemplateMu}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="kurs"
                                        headerText="Kurs"
                                        headerTextAlign="Center"
                                        textAlign="Center"
                                        width="50"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={EditTemplateKurs}
                                    />
                                    <ColumnDirective
                                        field="jumlah_mu"
                                        isPrimaryKey={true}
                                        // headerTemplate={headerSisaNilaiFaktur}
                                        format={formatFloat}
                                        editType="numericedit"
                                        // edit={qtyParams}
                                        // template={(args: any) => <div>{args.jumlah_mu < 0 ? '(' + CurrencyFormat(args.jumlah_mu * -1) + ')' : CurrencyFormat(args.jumlah_mu)}</div>}
                                        headerText="Jumlah [MU]"
                                        headerTextAlign="Center"
                                        textAlign="Right"
                                        width="110"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={EditTemplateJumlahMu}
                                    />
                                    <ColumnDirective
                                        isPrimaryKey={true}
                                        field="subledger"
                                        headerText="Subsidiary Ledger"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="150"
                                        clipMode="EllipsisWithTooltip"
                                        // editTemplate={(args: any) =>
                                        //     EditTemplateSubledger(
                                        //         args,
                                        //         'subledger',
                                        //         setStateDataHeader,
                                        //         setDataDaftarAkunKredit,
                                        //         setDataDaftarSupplier,
                                        //         kode_entitas,
                                        //         stateDataHeader?.kodeSupplierValue,
                                        //         setDataDaftarUangMuka,
                                        //         setStateDataDetail,
                                        //         setDataDaftarCustomer,
                                        //         setDataDaftarSubledger,
                                        //         dokumenId.current,
                                        //         tipe_Add.current
                                        //     )
                                        // }
                                    />
                                    <ColumnDirective
                                        // editTemplate={TemplateDepartemen}
                                        isPrimaryKey={true}
                                        field="nama_dept"
                                        headerText="Departemen"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="100"
                                    />
                                    <ColumnDirective
                                        // editTemplate={TemplateDepartemen}
                                        isPrimaryKey={true}
                                        field="kode_jual"
                                        headerText="Divisi Penjualan"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        width="100"
                                    />
                                </ColumnsDirective>

                                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                            </GridComponent>
                        </div>
                        {/* </TooltipComponent> */}

                        <div className="panel-pager">
                            <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                    <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                        <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                            <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                    <div className="-mt-[18px] flex ">
                                                        <div style={{ width: '75%' }}>
                                                            {masterDataState !== 'APPROVAL' ? null : (
                                                                <>
                                                                    <ButtonComponent
                                                                        id="buAdd1"
                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                        cssClass="e-primary e-small"
                                                                        iconCss="e-icons e-small e-plus"
                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                        // onClick={handleAddDetailJurnal}
                                                                    />
                                                                    <ButtonComponent
                                                                        id="buDelete1"
                                                                        // content="Hapus"
                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                        cssClass="e-warning e-small"
                                                                        iconCss="e-icons e-small e-trash"
                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                        // onClick={() =>
                                                                        //     DetailNoFakturJurnal(
                                                                        //         'delete',
                                                                        //         kode_entitas,
                                                                        //         stateDataHeader?.namaAkunValue,
                                                                        //         setStateDataHeader,
                                                                        //         setDataDaftarAkunKredit,
                                                                        //         setDataDaftarSupplier,
                                                                        //         stateDataHeader?.kodeSupplierValue,
                                                                        //         setDataDaftarUangMuka,
                                                                        //         dataBarang,
                                                                        //         stateDataHeader?.jumlahBayar,
                                                                        //         modalJenisPembayaran,
                                                                        //         setDataJurnal,
                                                                        //         stateDataHeader,
                                                                        //         gridJurnalListRef.current,
                                                                        //         setStateDataDetail,
                                                                        //         dataJurnal,
                                                                        //         setDataDaftarCustomer,
                                                                        //         setDataDaftarSubledger,
                                                                        //         dokumenId.current,
                                                                        //         tipe_Add.current,
                                                                        //         masterDataState,
                                                                        //         editDataJurnal
                                                                        //     )
                                                                        // }
                                                                    />
                                                                    <ButtonComponent
                                                                        id="buDeleteAll1"
                                                                        // content="Bersihkan"
                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                        cssClass="e-danger e-small"
                                                                        iconCss="e-icons e-small e-erase"
                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                        // onClick={() =>
                                                                        //     DetailNoFakturJurnal(
                                                                        //         'deleteAll',
                                                                        //         kode_entitas,
                                                                        //         stateDataHeader?.namaAkunValue,
                                                                        //         setStateDataHeader,
                                                                        //         setDataDaftarAkunKredit,
                                                                        //         setDataDaftarSupplier,
                                                                        //         stateDataHeader?.kodeSupplierValue,
                                                                        //         setDataDaftarUangMuka,
                                                                        //         dataBarang,
                                                                        //         stateDataHeader?.jumlahBayar,
                                                                        //         modalJenisPembayaran,
                                                                        //         setDataJurnal,
                                                                        //         stateDataHeader,
                                                                        //         gridJurnalListRef.current,
                                                                        //         setStateDataDetail,
                                                                        //         dataJurnal,
                                                                        //         setDataDaftarCustomer,
                                                                        //         setDataDaftarSubledger,
                                                                        //         dokumenId.current,
                                                                        //         tipe_Add.current,
                                                                        //         masterDataState,
                                                                        //         editDataJurnal
                                                                        //     )
                                                                        // }
                                                                    />
                                                                </>
                                                            )}

                                                            <ButtonComponent
                                                                id="buApproval"
                                                                content="Auto Jurnal"
                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                onClick={() => autojurnal()}
                                                                cssClass="e-danger e-small"
                                                                iconCss="e-icons e-small e-description"
                                                                style={
                                                                    masterDataState !== 'APPROVE' && masterDataState !== 'BATAL_APPROVE'
                                                                        ? { marginTop: 0 + 'em', marginRight: 1.5 + 'em', backgroundColor: '#9b9595', color: 'white' }
                                                                        : { marginTop: 0 + 'em', marginRight: 1.5 + 'em', backgroundColor: '#3b3f5c' }
                                                                }
                                                                disabled={masterDataState !== 'APPROVE' && masterDataState !== 'BATAL_APPROVE' ? true : false}
                                                            />
                                                        </div>
                                                        <div style={{ width: '25%' }}>
                                                            <div className=" flex">
                                                                <div style={{ width: '30%', textAlign: 'right' }}>
                                                                    <b>Total Db/Kr :</b>
                                                                </div>
                                                                <div style={{ width: '35%', textAlign: 'right', color: '#72181d' }}> {<b>{CurrencyFormat(stateDataDetail.totalDebet)}</b>}</div>
                                                                <div style={{ width: '35%', textAlign: 'right', color: '#091ef7' }}> {<b>{CurrencyFormat(stateDataDetail.totalKredit)}</b>}</div>
                                                            </div>

                                                            <div className="mt-1 flex">
                                                                <div style={{ width: '30%', textAlign: 'right' }}>
                                                                    <b>Selisih :</b>
                                                                </div>
                                                                <div style={{ width: '35%', textAlign: 'right', color: '#f70909' }}>{<b>{CurrencyFormat(stateDataDetail.totalSelisih)}</b>}</div>
                                                                {/* <div style={{ width: '35%', textAlign: 'right' }}>
                                                                                        <b>{CurrencyFormat(stateDataDetail.totalSelisihKredit)}</b>
                                                                                    </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                        <div className="flex h-full">
                            <div style={{ width: '28%' }}>
                                <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung :</label>
                                <div className="!h-[calc(100%-80px)] border p-3" style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, marginLeft: '10px', overflowY: 'scroll' }}>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {files?.map((file: any, index: any) => (
                                            <li
                                                onClick={() => pilihFilePendukung(file, index)}
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #ccc',
                                                    padding: '5px 0',
                                                    backgroundColor: numberId === index ? 'yellow' : 'white', // Ubah warna background
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <span style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{index + 1} |</span>
                                                <span style={{ flex: 1, marginLeft: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                                                    {file.name === undefined ? file.fileoriginal : file.name}
                                                </span>
                                                {/* <button onClick={() => clearFile(index)} style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                Hapus
                                            </button> */}
                                                {/* <TooltipComponent content={`Hapus File Index ${index + 1}`} position="TopCenter">
                                                <ButtonComponent
                                                    id="close"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-close"
                                                    style={{
                                                        color: '#121111',
                                                        cursor: 'pointer',
                                                        fontSize: '5px',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        padding: 0,
                                                        fontWeight: 'bold',
                                                    }}
                                                    // onClick={() => clearFile(index)}
                                                    onClick={() => handleHapusFile(index)}
                                                />
                                            </TooltipComponent> */}
                                                <TooltipComponent content={`Hapus File Index ${index + 1}`} position="TopCenter">
                                                    <ButtonComponent
                                                        id="close"
                                                        cssClass="e-primary e-small"
                                                        iconCss="e-icons e-close"
                                                        style={{
                                                            color: '#121111',
                                                            cursor: 'pointer',
                                                            fontSize: '5px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                            fontWeight: 'bold',
                                                        }}
                                                        onClick={() => clearFile(index)}
                                                    />
                                                </TooltipComponent>
                                                <TooltipComponent content={`Preview Index ${index + 1}`} position="TopCenter">
                                                    <ButtonComponent
                                                        id={`preview-${index}`}
                                                        cssClass="e-primary e-small custom-button"
                                                        iconCss="e-icons e-zoom-in"
                                                        style={{
                                                            marginLeft: '10px',
                                                            color: '#121111',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                        }}
                                                        onClick={() => handleFileClick(file, file)}
                                                    />
                                                </TooltipComponent>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div style={{ width: '2%' }}></div>
                            <div style={{ width: '48%', marginTop: '25px' }}>
                                <input type="file" accept="image/*,.pdf,.xls,.xlsx,.rar" style={{ display: 'none' }} onChange={handleFileUpload} multiple id="fileInput" />

                                <>
                                    <input
                                        type="file"
                                        // id={`imageInput${index}`}
                                        // name={`image${index}`}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        // onChange={(e) => handleFileUpload(e, index)}
                                        multiple
                                    />
                                    <button
                                        type="button"
                                        className="btn mb-2 h-[4.5vh]"
                                        style={{
                                            backgroundColor: '#3b3f5c',
                                            color: 'white',
                                            width: '20%',
                                            height: '15%',
                                            marginTop: -7,
                                            borderRadius: '5px',
                                            fontSize: '11px',
                                        }}
                                        // onClick={() => handleClick(index)}
                                        onClick={() => document.getElementById('fileInput')!.click()}
                                    >
                                        <FontAwesomeIcon icon={faUpload} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Ambil File
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn mb-2 h-[4.5vh]"
                                        style={{
                                            backgroundColor: '#3b3f5c',
                                            color: 'white',
                                            width: '20%',
                                            height: '15%',
                                            marginTop: -7,
                                            borderRadius: '5px',
                                            fontSize: '11px',
                                        }}
                                        // onClick={() => handleUploadZip('123')}
                                        // onClick={() => clearImage(index)}
                                        onClick={() => clearAllFiles()}
                                    >
                                        <FontAwesomeIcon icon={faEraser} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Hapus Semua
                                    </button>
                                </>
                                <button
                                    type="button"
                                    className="btn mb-2 h-[4.5vh]"
                                    style={{
                                        backgroundColor: '#3b3f5c',
                                        color: 'white',
                                        width: '20%',
                                        height: '15%',
                                        marginTop: -7,
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                    }}
                                    onClick={() => downloadBase64Image1(documentData.decodeBase64_string, documentData.name, documentData)}
                                >
                                    Simpan File
                                </button>
                                <button
                                    type="submit"
                                    className="btn mb-2 h-[4.5vh]"
                                    style={{
                                        backgroundColor: '#3b3f5c',
                                        color: 'white',
                                        width: '20%',
                                        height: '15%',
                                        marginTop: -7,
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                    }}
                                    onClick={() => handlePreview(documentData)}
                                    // onClick={() => handleUpload('RE0000000084')}
                                >
                                    Preview
                                </button>
                            </div>
                            {/* <div style={{ width: '100%', marginTop: '20px' }}>{openPreview()}</div> */}
                        </div>
                    </div>
                </div>
            </TabComponent>

            {/* Modal Preview File Pendukung untuk PDF 1 */}
            {PreviewPdf && (
                <>
                    <Draggable>
                        <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition1}>
                            <div className={`${styles.scrollableContent}`} style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <PagePDF key={`page_${index + 1}`} pageNumber={index + 1} className={styles.page} />
                                    ))}
                                </Document>
                            </div>
                            <button className={`${styles.closeButtonDetailDragable}`} onClick={cancelPreviewPdf}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                </>
            )}
        </div>
    );
};

export default TemplateDetailRpe;
