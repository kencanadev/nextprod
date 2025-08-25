import { Tab } from '@headlessui/react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    Toolbar,
    CommandColumn,
    Aggregate,
} from '@syncfusion/ej2-react-grids';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, UploaderComponent, NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { ButtonPropsModel } from '@syncfusion/ej2/popups';
import moment from 'moment';
import { generateNU, myAlertGlobal2, myAlertGlobal3 } from '@/utils/routines';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faRotateLeft, faRotateRight, faSearchMinus, faSearchPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import DaftarDlg from './daftarDlg';
import { cekAvailableData, fetchDataFpmb, fetchDataFromDlg, fetchDataRencekBasedOnSelected, fetchDataRencekPatahBasedOnSelected, fetchListTimbang } from '../api/api';
import { AggregateColumnsDirective, AggregateColumnDirective, AggregateDirective, AggregatesDirective } from '@syncfusion/ej2-react-grids';
// import { resExcel, resPdf, resUnknow, resWord, resZip } from '../../bm/component/resource';
import JSZip from 'jszip';
import { handleFileImageSelect, handleRemoveImage, handleUpload, resExcel, resPdf, resUnknow, resWord, resZip } from '../functions/fpmbFunctions';
import { myAlertGlobal } from '@/utils/global/fungsi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { exitCode } from 'process';
import Swal from 'sweetalert2';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import AlasanDlg from './alasanDlg';

// import { handleFPMBSubmit } from '../functions/fpmbFunctions';
// import { toast } from 'react-toastify';

interface FrmFpmbProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: any;
    onRefreshTipe: any;
    isFilePendukung: any;
    // stateDialog: any;
    // setStateDialog: Function;
}
// interface FileWithOriginalName extends File {
//     originalName: string;
//     idx: number;
//     nama: string;
//     isOpenPreview: boolean;
//     dokumen: string;
//     deleted: boolean;
//     isUploaded: boolean;
//     isZip: boolean;
//     file?: any;
// }
interface FileWithOriginalName extends File {
    originalName: string;
    nama: string;
    idx: number;
    dokumen: string;
    deleted: boolean;
    isUploaded: boolean;
    isOpenPreview: boolean;
    isZip: boolean;
}
interface ImageItem {
    id_dokumen: number;
    dokumen: string;
    filegambar: string;
    fileoriginal: string;
}
// let dgHasilTimbang: Grid | any;
// let dgPatah: Grid | any;
let buttonInputData: ButtonPropsModel[];

let dgHasilRencek: Grid;
let dgPatah: Grid;
// let dgDetailHasilTimbang: Grid;

const FrmFpmb: React.FC<FrmFpmbProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, isFilePendukung }) => {
    const dgDetailHasilTimbang = useRef<GridComponent | null>(null);
    //await generateNU(stateDokumen?.kode_entitas, '', '87', moment().format('YYYYMM')),
    let noDok: any = '';
    let uploaderRef: any = useRef<UploaderComponent>(null);
    let uploaderRef2: any = useRef<UploaderComponent>(null);
    let uploaderRef3: any = useRef<UploaderComponent>(null);
    let uploaderRef4: any = useRef<UploaderComponent>(null);
    let upload1: any;
    let upload2: any;
    let upload3: any;
    let upload4: any;
    let selectedKodeRencekPatah: any = '';

    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [rencekPatahExisting, setRencekPatahExisting] = useState<any[]>([]);
    const [selectedRowDataPatah, setSelectedRowDataPatah] = useState<any>(null);
    const [alasanValue, setAlasanValue] = useState('');
    const [shouldSaveAfterAlasanDlg, setShouldSaveAfterAlasanDlg] = useState(false);

    // const handlePilihAlasan = async (value: any) => {
    //     const vKoreksi =
    //         // '\r\r' +
    //         '\rKoreksi hasil rencek\n' +
    //         'No. MB            : ' +
    //         rencekState[0].no_dokumen_reff +
    //         '\n' +
    //         'ID MB             : ' +
    //         rencekState[0].id_dokumen +
    //         '\n' +
    //         'Nama Barang       : ' +
    //         rencekState[0].nama_barang +
    //         '\n' +
    //         'Qty               : ' +
    //         rencekState[0].qty_sj +
    //         '\n' +
    //         'Alasan Koreksi    : ' +
    //         value.trim();

    //     setAlasanValue(vKoreksi);
    //     setDlgAlasan(false);

    //     const index = rowIndexGrid; // Replace with the actual index you want to update

    //     setRencekStateExisting((prevState) => {
    //         const newState = [...prevState];
    //         const vKoreksiBefore = newState[index].alasan_koreksi;

    //         newState[index] = {
    //             ...newState[index],
    //             alasan_koreksi: vKoreksiBefore + '\n' + vKoreksi, // Update the alasan_koreksi field
    //         };

    //         const updatedRencekState = newState.filter((item) => item.kode_rencek === newState[index].kode_rencek);
    //         console.log('updatedRencekState ', updatedRencekState);
    //         setRencekState(updatedRencekState);
    //         return newState;
    //     });

    //     // await handleSelectedhasilRencek(index);
    //     // await saveDoc();
    // };
    const handlePilihAlasan = (value: any) => {
        const vKoreksi =
            '\rKoreksi hasil rencek\n' +
            'No. MB            : ' +
            rencekState[0].no_dokumen_reff +
            '\n' +
            'ID MB             : ' +
            rencekState[0].id_dokumen +
            '\n' +
            'Nama Barang       : ' +
            rencekState[0].nama_barang +
            '\n' +
            'Qty               : ' +
            rencekState[0].qty_sj +
            '\n' +
            'Alasan Koreksi    : ' +
            value.trim();

        setAlasanValue(vKoreksi); // opsional
        setDlgAlasan(false);

        const newRencekState = [...rencekStateExisting];
        const currentItem = newRencekState[rowIndexGrid];

        const updatedItem = {
            ...currentItem,
            alasan_koreksi: (currentItem.alasan_koreksi || '') + '\n' + vKoreksi,
        };

        newRencekState[rowIndexGrid] = updatedItem;

        setRencekStateExisting(newRencekState);

        // Perbarui turunan jika perlu
        const filtered = newRencekState.filter((item) => item.kode_rencek === updatedItem.kode_rencek);
        setRencekState(filtered);

        // Aktifkan flag trigger simpan otomatis
        setShouldSaveAfterAlasanDlg(true);
    };

    useEffect(() => {
        if (shouldSaveAfterAlasanDlg) {
            saveDoc();
            setShouldSaveAfterAlasanDlg(false);
        }
    }, [shouldSaveAfterAlasanDlg]);

    const [rencekStateExisting, setRencekStateExisting] = useState<any[]>([]);
    const [rencekState, setRencekState] = useState<any[]>([
        {
            kode_rencek: '',
            dokumen: '',
            kode_dokumen_reff: '',
            no_dokumen_reff: '',
            id_dokumen: '',
            tgl_do: null, //moment().format('YYYY-MM-DD HH:mm:ss'),
            tgl_sampai_gudang: null, // moment().format('YYYY-MM-DD HH:mm:ss'),
            tgl_selesai_hitung: null, // moment().format('YYYY-MM-DD HH:mm:ss'),
            nopol: '',
            nama_ekspedisi: '',
            pabrik_asal: '',
            kode_item: '',
            nama_barang: '',
            qty_sj: '',
            qty_utuh: 0,
            qty_kurang: 0,
            qty_patah: 0,
            qty_lebih_utuh: '',
            qty_lebih_patah: '',
            tot_qty_panjang: '',
            tot_qty_panjang_bagi12: '',
            userid: '',
            tgl_rencek: null, //moment().format('YYYY-MM-DD HH:mm:ss'),
            alasan_koreksi: '',
            no_item: '',
            total_berat: '',
            hasil: '',
        },
    ]);

    const [rencekPatahState, setRencekPatahState] = useState([
        {
            kode_rencek: '',
            id_patah: 1,
            panjang_patah: '',
        },
    ]);

    let tglApproval2: any;

    const [fpmbState, setFpmbState] = useState<any>([
        {
            kode_fpm: '',
            no_fpmb: noDok,
            kode_mb: '',
            no_mb: '',
            // tgl_fpmb: moment().format('DD-MM-YYYY HH:mm:ss'),
            tgl_fpmb: moment().format('DD-MM-YYYY'),
            entitas: stateDokumen?.kode_entitas,
            pengajuan: stateDokumen?.tipePengajuan,
            tgl_pengajuan: moment().format('DD-MM-YYYY HH:mm:ss'),
            user_pengajuan: stateDokumen?.userid,
            approval: '',
            // tgl_approval: stateDokumen?.masterDataState === 'EDIT' ? tglApproval2 : stateDokumen?.masterDataState === 'APPROVAL' ? moment().format('YYYY-MM-DD HH:mm:ss') : null,
            tgl_approval: null, //stateDokumen?.masterDataState === 'APPROVAL' ? moment().format('YYYY-MM-DD HH:mm:ss') : tglApproval2,
            user_approval: '', //stateDokumen?.masterDataState === 'APPROVAL' ? stateDokumen?.userid : stateDokumen?.masterDataState === 'BARU' ? '' : stateDokumen?.userid,
            jenis_pengajuan: stateDokumen?.jenisPengajuan,
            jenis_fpmb: stateDokumen?.jenisFpmb,
            tgl_do_sj: null, //moment().format('DD-MM-YYYY HH:mm:ss'),
        },
    ]);

    tglApproval2 = fpmbState[0]?.tgl_approval === '' || fpmbState[0]?.tgl_approval === null ? null : fpmbState[0]?.tgl_approval;

    const formatFloat = (value: number | string | null, decimalPlaces: number = 2): string => {
        if (value === null || value === undefined || value === '') {
            return '0.00';
        }

        const number = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(number)) {
            return '0.00';
        }

        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        });
    };

    const formatDate = (value: string | Date | null): string => {
        if (!value) {
            return '';
        }

        const date = value instanceof Date ? value : new Date(value);

        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    const [modalPreview, setModalPreview] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);
    const [modalSource, setModalSource] = useState('');
    // const [jsonImageEdit, setJsonImageEdit] = useState([]);
    const [jsonImageEdit, setJsonImageEdit] = useState<ImageItem[]>([]);
    const [modalDaftarDlg, setModalDaftarDlg] = useState(false);
    const [dlgAlasan, setDlgAlasan] = useState(false);

    const [selectedItem, setSelectedItem] = useState([]);

    const [buKoreksi, setBuKoreksi] = useState<string>('');

    const [currentTab, setCurrentTab] = useState(0);
    const [selectedRowIndexPatah, setSelectedRowIndexPatah] = useState(0);
    const [tambah, setTambah] = useState(false);
    const [edit, setEdit] = useState(false);

    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [disabledSimpan, setDisabledSimpan] = useState(false);

    const [progressValue, setProgressValue] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    const [displayedProgress, setDisplayedProgress] = useState(0);
    let interval: any;
    const [listImages, setListImages] = useState([]);
    const handleTabChange = (index: number) => {
        setCurrentTab(index);
        // Ambil data yang sesuai untuk tab yang dipilih
        //    fetchDataForTab(index);
    };

    // const [objekImage, setObjekImage] = useState<any>({
    //     preview: null,
    //     preview2: null,
    //     preview3: null,
    //     preview4: null,
    //     nameImage: null,
    //     nameImage2: null,
    //     nameImage3: null,
    //     nameImage4: null,
    //     selectedHead: '1',
    //     isOpenPreview: false,
    //     isDragging: false,
    //     imageDataUrl: '',
    //     indexPreview: '',
    //     indexId: '',
    // });

    const [objekImage, setObjekImage] = useState<any>({
        preview: null,
        nameImage: null,
        selectedHead: '1',
        isOpenPreview: false,
        isDragging: false,
        imageDataUrl: '',
        indexPreview: '',
        indexId: '',
    });

    const [listTimbang, setListTimbang] = useState<any[]>([]);
    const [listRencek, setListRencek] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState('hasil_rencek');
    const [activeTabSub, setActiveTabSub] = useState('Surat Jalan');

    // const [listRencek, setListRencek] = useState<any[]>([]);
    const [rowIndexGrid, setRowIndexGrid] = useState(0);
    const [indexGridDgPatah, setIndexGridDgPatah] = useState(0);

    // Tambahkan state untuk selected row
    const [selectedPatahRows, setSelectedPatahRows] = useState<number[]>([]);
    const [rotationAngle, setRotationAngle] = useState(0);
    const dialogClose = async () => {
        await stateBaru();
        // setObjekImage({
        //     preview: null,
        //     preview2: null,
        //     preview3: null,
        //     preview4: null,
        //     nameImage: null,
        //     nameImage2: null,
        //     nameImage3: null,
        //     nameImage4: null,
        //     selectedHead: '1',
        // });
        onClose();
    };

    const stateBaru = async () => {
        const result = await generateNU(stateDokumen?.kode_entitas, '', '87', moment().format('YYYYMM'));

        setFpmbState([
            {
                kode_fpmb: '',
                no_fpmb: result,
                kode_mb: '',
                no_mb: '',
                // tgl_fpmb: moment().format('DD-MM-YYYY HH:mm:ss'),
                tgl_fpmb: moment().format('DD-MM-YYYY'),
                entitas: stateDokumen?.kode_entitas,
                pengajuan: stateDokumen?.tipePengajuan,
                tgl_pengajuan: moment().format('DD-MM-YYYY HH:mm:ss'),
                user_pengajuan: stateDokumen?.userid,
                approval: '',
                tgl_approval: null, //moment().format('DD-MM-YYYY HH:mm:ss'),
                user_approval: '', //stateDokumen?.userid,
                jenis_pengajuan: stateDokumen?.jenisPengajuan,
                jenis_fpmb: stateDokumen?.jenisFpmb,
                tgl_do_sj: null, //moment().format('DD-MM-YYYY HH:mm:ss'),
            },
        ]);

        setRencekState([
            {
                kode_rencek: '',
                dokumen: '',
                kode_dokumen_reff: '',
                no_dokumen_reff: '',
                id_dokumen: '',
                tgl_do: null, //moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_sampai_gudang: null, //moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_selesai_hitung: null, //moment().format('YYYY-MM-DD HH:mm:ss'),
                nopol: '',
                nama_ekspedisi: '',
                pabrik_asal: '',
                kode_item: '',
                nama_barang: '',
                qty_sj: '',
                qty_utuh: 0,
                qty_kurang: 0,
                qty_patah: 0,
                qty_lebih_utuh: '',
                qty_lebih_patah: '',
                tot_qty_panjang: '',
                tot_qty_panjang_bagi12: '',
                userid: '',
                tgl_rencek: moment().format('YYYY-MM-DD HH:mm:ss'),
                alasan_koreksi: '',
                no_item: '',
                total_berat: '',
                hasil: '',
            },
        ]);

        // setObjekImage({
        //     preview: null,
        //     preview2: null,
        //     preview3: null,
        //     preview4: null,
        //     nameImage: null,
        //     nameImage2: null,
        //     nameImage3: null,
        //     nameImage4: null,
        //     selectedHead: '1',
        // });

        setObjekImage({
            preview: null,
            nameImage: null,
            selectedHead: '1',
            isOpenPreview: false,
            isDragging: false,
            imageDataUrl: '',
            indexPreview: '',
            indexId: '',
        });

        setTimeout(() => {
            if (dgHasilRencek) {
                dgHasilRencek.setProperties({ dataSource: [] });
                dgHasilRencek.dataSource = [];
                dgHasilRencek.refresh();
            }
            if (dgPatah) {
                dgPatah.setProperties({ dataSource: [] });
                dgPatah.dataSource = [];
                dgPatah.refresh();
            }
            if (dgDetailHasilTimbang.current && typeof dgDetailHasilTimbang.current === 'object') {
                dgDetailHasilTimbang.current.setProperties({ dataSource: [] });
                dgDetailHasilTimbang.current.dataSource = [];
                dgDetailHasilTimbang.current.refresh();
            }
        }, 100);

        setRencekPatahExisting([]);
        setRencekStateExisting([]);
        setSelectedPatahRows([]);
        setTotalPanjangPatah(0);
        setSelectedPatahRows([]);
        setRowIndexGrid(0);
    };

    const closeDialogForm = async () => {
        onClose();
    };

    const handleAmbilDataUpload = (e: any) => {
        upload1 = e.uploaderRef;
        upload2 = e.uploaderRef2;
        upload3 = e.uploaderRef3;
        upload4 = e.uploaderRef4;
    };

    const handleDownloadImage = (jenis: string) => {
        const imageUrl = jenis === '1' ? objekImage?.preview : jenis === '2' ? objekImage?.preview2 : jenis === '3' ? objekImage?.preview3 : jenis === '4' ? objekImage?.preview4 : null;
        const fileName = jenis === '1' ? objekImage?.nameImage : jenis === '2' ? objekImage?.nameImage2 : jenis === '3' ? objekImage?.nameImage3 : jenis === '4' ? objekImage?.nameImage4 : null;

        if (!imageUrl || !fileName) {
            console.error('No image to download');
            return;
        }

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreviewImage = (jenis: string) => {
        if (jenis === 'open') {
            setModalPreview(true);
        } else if (jenis === 'close') {
            setModalPreview(false);
        }
    };

    const handleWheel = (event: any) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            setZoomLevel((prevScale) => Math.min(prevScale + 0.1, 6));
        } else {
            setZoomLevel((prevScale) => Math.max(prevScale - 0.1, 0.5));
        }
    };
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    const imageSrc =
        objekImage?.selectedHead === '1'
            ? objekImage?.preview
            : objekImage?.selectedHead === '2'
            ? objekImage?.preview2
            : objekImage?.selectedHead === '3'
            ? objekImage?.preview3
            : objekImage?.selectedHead === '4'
            ? objekImage?.preview4
            : null;

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

    useEffect(() => {
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    useEffect(() => {
        if (progressValue > displayedProgress) {
            const timer = setTimeout(() => {
                setDisplayedProgress((prev) => Math.min(prev + 1, progressValue));
            }, 20); // Adjust this value to control animation speed
            return () => clearTimeout(timer);
        } else if (progressValue < displayedProgress) {
            setDisplayedProgress(progressValue);
        }
    }, [progressValue, displayedProgress]);

    const handleEditImages = async () => {
        const images: FileWithOriginalName[] = [];

        try {
            setIsLoadingProgress(true);
            setProgressValue(0);
            setLoadingMessage('Proses File Pendukung...');

            const { data } = await axios.get<{ data: ImageItem[] }>(`${apiUrl}/erp/load_images`, {
                params: {
                    entitas: stateDokumen?.kode_entitas,
                    param1: stateDokumen?.masterKodeFpmb,
                },
            });

            const response = data.data || [];
            const masterZipItem = response.find((item) => item.id_dokumen === 999);

            let totalImages = 0;
            let processedImages = 0;

            const updateProgress = () => {
                processedImages++;
                const progress = Math.round((processedImages / totalImages) * 100);
                setProgressValue((prev) => (progress > prev ? progress : prev));
            };

            const pushToImages = async (fileName: string, imageUrl: string, originFileGambar: string, matchFromDb?: ImageItem) => {
                if (!imageUrl) return;

                try {
                    const ext = fileName.split('.').pop();
                    const baseName = originFileGambar.replace(/\.[^/.]+$/, '');
                    const newFileName = `${baseName}_${images.length + 1}.${ext}`;

                    const res = await fetch(imageUrl);
                    const blob = await res.blob();

                    const file = new File([blob], newFileName, { type: blob.type }) as FileWithOriginalName;

                    file.originalName = fileName;
                    file.nama = newFileName;
                    file.idx = matchFromDb?.id_dokumen ?? 999;
                    file.dokumen = matchFromDb?.dokumen ?? 'RC1';
                    file.deleted = false;
                    file.isUploaded = true;
                    file.isOpenPreview = false;
                    file.isZip = false;

                    images.push(file);
                } catch (err) {
                    console.warn(`Gagal fetch file: ${fileName}`, err);
                }
            };

            if (masterZipItem) {
                // console.log('ada master ZIP');
                // ✅ Gunakan cara handleEditImages3
                const { data: extractData } = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                    params: {
                        entitas: stateDokumen?.kode_entitas,
                        nama_zip: masterZipItem.filegambar,
                    },
                });

                const unzipList = extractData.images || [];
                totalImages = unzipList.length;

                // for (const unzip of unzipList) {
                //     // Tidak pakai match DB
                //     await pushToImages(unzip.fileName, unzip.imageUrl, masterZipItem.filegambar);
                //     updateProgress();
                // }
                for (const item of unzipList) {
                    const match = response.find((r: any) => r.fileoriginal === item.fileName);
                    await pushToImages(item.fileName, item.imageUrl, masterZipItem.filegambar, match);

                    processedImages++;
                    const progress = Math.round((processedImages / totalImages) * 100);
                    setProgressValue((prev) => (progress > prev ? progress : prev));
                }
            } else {
                console.log('tidak ada master ZIP');
                // ✅ Gunakan cara handleEditImages
                const allowedExt = /\.(jpg|jpeg|png|mp4|mov|pdf|xls|xlsx|doc|docx)$/i;

                const fileCandidates = Array.from(
                    new Map(
                        response
                            .filter((item) => {
                                const file = item.filegambar?.toLowerCase() || '';
                                return allowedExt.test(file) && !file.endsWith('.zip');
                            })
                            .map((item) => [item.filegambar, item])
                    ).values()
                );

                totalImages = fileCandidates.length;

                for (const item of fileCandidates) {
                    const zipName = item.filegambar.replace(/\.[^/.]+$/, '.zip');

                    try {
                        const { data: extractData } = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                            params: {
                                entitas: stateDokumen?.kode_entitas,
                                nama_zip: zipName,
                            },
                        });

                        const unzipList = extractData.images || [];

                        for (const unzip of unzipList) {
                            // ✅ Cocokkan fileoriginal → filegambar
                            const match = response.find((r) => {
                                const dbFile = r.filegambar?.split('/').pop()?.toLowerCase();
                                const unzipFile = unzip.fileName?.split('/').pop()?.toLowerCase();
                                return dbFile === unzipFile;
                            });

                            const originalFileName = match?.fileoriginal || unzip.fileName;
                            await pushToImages(originalFileName, unzip.imageUrl, zipName, match);
                        }
                    } catch (err) {
                        console.warn(`Gagal ekstrak ZIP ${zipName}`, err);
                    }

                    updateProgress();
                }
            }

            console.log('✅ Total Images:', images.length);
            console.log('✅ Images:', images);

            setTimeout(() => {
                setXFiles(images);
                setJsonImageEdit(response);
                setProgressValue(100);
                setIsLoadingProgress(false);
            }, 1000);
        } catch (error) {
            console.error('❌ Error fetching images:', error);
            setProgressValue(0);
            setIsLoadingProgress(false);
        }
    };

    const konten = stateDokumen?.jenisPengajuan == 2 ? 'Daftar DO Mobil Sendiri / Customer Kirim Langsung' : 'Daftar Rencek';
    const buttonStyleDlg = {
        cssFloat: 'left',
        height: 'auto',
        width: stateDokumen?.jenisPengajuan == 2 ? '200px' : '90px',
        marginTop: '1em',
        marginRight: '1em',
        backgroundColor: '#3b3f5c',
        whiteSpace: 'normal',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.5em',
    };
    const tanggalLabel = stateDokumen?.jenisPengajuan == 2 ? 'Tanggal Barang Sampai ke Customer' : 'Tanggal Barang Sampai ke Gudang';
    const colorDate = stateDokumen?.jenisPengajuan == 2 ? 'e-custom-style flex-1 border border-gray-300 !bg-yellow-200 !p-1' : 'e-custom-style flex-1 border border-gray-300';

    const ambilRencekPatah = async (vkodeMb: any) => {
        const rencekResult = await fetchDataRencekBasedOnSelected(stateDokumen?.kode_entitas, vkodeMb, 'all', stateDokumen?.token);

        const fetchRencekPatah: any = [];
        await Promise.all(
            rencekResult.map(async (item: any, index: any) => {
                const loadRencekPatah = await axios.get(`${apiUrl}/erp/rencek_patah_fpmb`, {
                    params: {
                        entitas: stateDokumen?.kode_entitas,
                        param1: item.kode_rencek,
                    },
                    headers: { Authorization: `Bearer ${stateDokumen?.token}` },
                });
                const newRencekPatah = loadRencekPatah.data.data; // Return the result for each item
                fetchRencekPatah.push(...newRencekPatah);
            })
        );
        //add
        setRencekPatahExisting(fetchRencekPatah);

        const patahResult = await fetchDataRencekPatahBasedOnSelected(stateDokumen?.kode_entitas, rencekResult[0].kode_rencek, stateDokumen?.token);

        if (dgPatah) {
            dgPatah.dataSource = patahResult;
            dgPatah.refresh();
        }
    };

    const ambilHasilRencek = async (vkodeMb: any, mappedData: any) => {
        const rencekResult = await fetchDataRencekBasedOnSelected(stateDokumen?.kode_entitas, vkodeMb, 'all', stateDokumen?.token);

        const formattedRencek = rencekResult.map((item: any) => {
            return {
                ...item,
                tgl_do: moment(item.tgl_do).format('YYYY-MM-DD'),
                tgl_rencek: moment(item.tgl_rencek).format('YYYY-MM-DD'),
                tgl_sampai_gudang: moment(item.tgl_sampai_gudang).format('YYYY-MM-DD'),
                tgl_selesai_hitung: moment(item.tgl_selesai_hitung).format('YYYY-MM-DD'),
            };
        });

        if (formattedRencek.length > 0) {
            setRencekState(formattedRencek);
            setRencekStateExisting(formattedRencek);
        } else {
            setRencekState(mappedData);
            setRencekStateExisting(mappedData);
        }
    };

    const handleFetchListTimbang = async (noMb: any) => {
        await fetchListTimbang(stateDokumen?.kode_entitas, noMb, stateDokumen?.token).then((result) => {
            // console.log('result ', result);
            setListTimbang(result);
            if (dgDetailHasilTimbang.current) {
                dgDetailHasilTimbang.current.dataSource = result;
                dgDetailHasilTimbang.current.refresh();
            }
        });
    };

    const handleSelectedhasilRencek = async (index: number) => {
        try {
            const getDetail: any = dgHasilRencek?.dataSource;

            if (dgPatah) {
                dgPatah.dataSource = [];
                dgPatah.refresh();
            }

            // Fetch dan set rencek data
            const rencekResult = await fetchDataRencekBasedOnSelected(stateDokumen?.kode_entitas, getDetail[index].kode_mb, getDetail[index].id_mb, stateDokumen?.token);

            let selectedKodeRencek: any = rencekStateExisting[index]?.kode_rencek;

            const filteredData = rencekStateExisting.filter((item) => item.kode_rencek === selectedKodeRencek);

            setRencekState(filteredData);

            // Fetch dan set patah data
            const patahResult = await fetchDataRencekPatahBasedOnSelected(stateDokumen?.kode_entitas, rencekResult[0].kode_rencek, stateDokumen?.token);

            if (dgPatah) {
                dgPatah.dataSource = patahResult;
                dgPatah.refresh();
            }
        } catch (error) {
            console.error('Error in handleSelectedhasilRencek:', error);
        }
    };

    const handleFetchFpmb = async (kodeMb: any) => {
        try {
            let fpmbResult = await fetchDataFpmb(stateDokumen?.kode_entitas, kodeMb, stateDokumen?.token);

            const getDetail: any = dgHasilRencek?.dataSource;

            const rencekResult = await fetchDataRencekBasedOnSelected(stateDokumen?.kode_entitas, getDetail[0].kode_mb, 'all', stateDokumen?.token);

            const fetchRencekPatah: any = [];
            await Promise.all(
                rencekResult.map(async (item: any, index: any) => {
                    const loadRencekPatah = await axios.get(`${apiUrl}/erp/rencek_patah_fpmb`, {
                        params: {
                            entitas: stateDokumen?.kode_entitas,
                            param1: item.kode_rencek,
                        },
                        headers: { Authorization: `Bearer ${stateDokumen?.token}` },
                    });
                    const newRencekPatah = loadRencekPatah.data.data; // Return the result for each item
                    fetchRencekPatah.push(...newRencekPatah);
                })
            );

            //add
            setRencekPatahExisting(fetchRencekPatah);

            const formattedRencek = rencekResult.map((item: any) => {
                return {
                    ...item,
                    tgl_do: moment(item.tgl_do).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_rencek: moment(item.tgl_rencek).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_sampai_gudang: moment(item.tgl_sampai_gudang).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_selesai_hitung: moment(item.tgl_selesai_hitung).format('YYYY-MM-DD HH:mm:ss'),
                };
            });

            setRencekState(formattedRencek);
            setRencekStateExisting(formattedRencek);
            setFpmbState(fpmbResult);
        } catch (error) {
            console.error('Error fetching FPMB data:', error);
        }
    };

    const handleSelectedDialog = async (dataObject: any) => {
        let jenisFpmb = stateDokumen?.jenisPengajuan == '0' ? 'KG' : stateDokumen?.jenisPengajuan == '1' ? 'MKG' : 'MKL';

        try {
            const result = await fetchDataFromDlg(stateDokumen?.kode_entitas, jenisFpmb, stateDokumen?.masterDataState == 'BARU' ? dataObject.kode_mb : dataObject, stateDokumen?.token);
            // console.log('result ', result);
            setListRencek(result);
            if (dgHasilRencek) {
                dgHasilRencek.dataSource = result;
                dgHasilRencek.refresh();
            }

            const mappedData = result.map((item: any) => ({
                kode_rencek: item.kode_mb + '.' + item.id_mb,
                dokumen: 'MB',
                kode_dokumen_reff: item.kode_mb,
                no_dokumen_reff: item.no_mb,
                id_dokumen: item.id_mb,
                tgl_do: moment(item.tgl_mb).format('YYYY-MM-DD HH:mm:ss'),
                tgl_sampai_gudang: moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_selesai_hitung: moment().format('YYYY-MM-DD HH:mm:ss'),
                nopol: item.nopol,
                nama_ekspedisi: item.nama_relasi,
                pabrik_asal: item.nama_relasi,
                kode_item: item.kode_item,
                nama_barang: item.nama_item,
                qty_sj: item.qty_std,
                qty_utuh: 0,
                qty_kurang: 0,
                qty_patah: 0,
                qty_lebih_utuh: 0,
                qty_lebih_patah: 0,
                tot_qty_panjang: 0,
                tot_qty_panjang_bagi12: 0,
                tgl_rencek: moment().format('YYYY-MM-DD HH:mm:ss'),
                alasan_koreksi: '',
                no_item: item.no_item,
                total_berat: item.total_berat,
                hasil: item.hasil,
                userid: stateDokumen?.userid,
            }));

            // Untuk MKL, langsung map dan set state
            if (stateDokumen?.jenisPengajuan == 2) {
                await Promise.all([
                    // setFpmbState({ ...fpmbState, kode_mb: mappedData[0]?.kode_dokumen_reff, no_mb: mappedData[0]?.no_dokumen_reff }),
                    setFpmbState((prev: any) => {
                        return [
                            {
                                ...prev[0],
                                kode_mb: mappedData[0]?.kode_dokumen_reff,
                                no_mb: mappedData[0]?.no_dokumen_reff,
                                tgl_do_sj: mappedData[0]?.tgl_do,
                            },
                        ];
                    }),

                    // setFpmbState((prevState: any) =>
                    //     prevState.map(({ item, index }: any) => (index === 0 ? { ...item, kode_mb: mappedData[0]?.kode_dokumen_reff, no_mb: mappedData[0]?.no_dokumen_reff } : item))
                    // ),
                    // setRencekState(mappedData),
                    ambilHasilRencek(mappedData[0]?.kode_dokumen_reff, mappedData),

                    setRowIndexGrid(0), // Reset row index
                ]);
                if (stateDokumen?.masterDataState !== 'BARU') {
                    await handleSelectedhasilRencek(0);
                }
            } else {
                // setFpmbState({ ...fpmbState, kode_mb: mappedData[0]?.kode_dokumen_reff, no_mb: mappedData[0]?.no_dokumen_reff });
                setFpmbState((prev: any) => {
                    return [
                        {
                            ...prev[0],
                            kode_mb: mappedData[0]?.kode_dokumen_reff,
                            no_mb: mappedData[0]?.no_dokumen_reff,
                            tgl_do_sj: mappedData[0]?.tgl_do,
                        },
                    ];
                });
                // setFpmbState((prevState: any) =>
                //     prevState.map(({ item, index }: any) => (index === 0 ? { ...item, kode_mb: mappedData[0]?.kode_dokumen_reff, no_mb: mappedData[0]?.no_dokumen_reff } : item))
                // );
                await ambilRencekPatah(mappedData[0]?.kode_dokumen_reff);
                // Untuk KG/MKG
                await ambilHasilRencek(mappedData[0]?.kode_dokumen_reff, []);
                // await handleSelectedhasilRencek(0);
                // Fetch list timbang setelah state terupdate
                await handleFetchListTimbang(stateDokumen?.masterDataState == 'BARU' ? dataObject.no_mb : stateDokumen?.stateNoMb);
            }
        } catch (error) {
            console.error('Error in handleSelectedDialog:', error);
        }
    };

    const groupOptions = {
        columns: ['nama_item'],
        showDropArea: true,
        showGroupedColumn: true,
    };
    const footerSum = (props: any) => {
        return <span>Jumlah: {props.Sum}</span>;
    };
    const footerBerat = (props: any) => {
        return <span>Berat: {props.Sum}</span>;
    };

    // Tambahkan state untuk menyimpan total panjang patah
    const [totalPanjangPatah, setTotalPanjangPatah] = useState(0);

    // Handler untuk input qty_patah

    const actionCompleteGridDetail = async (args: any) => {
        try {
            switch (args.requestType) {
                case 'save':
                    const currentQtyPatah = stateDokumen?.jenisPengajuan == 2 ? rencekState[rowIndexGrid]?.qty_patah || 0 : rencekState[0]?.qty_patah || 0;

                    // Hitung total panjang patah dari grid
                    let totalPanjang = 0;
                    if (dgPatah.dataSource instanceof Array) {
                        totalPanjang = dgPatah.dataSource.reduce((sum: number, row: any) => {
                            return sum + (parseFloat(row.panjang_patah) || 0);
                        }, 0);
                    }

                    setTotalPanjangPatah(totalPanjang);
                    // Update dgPatah data source
                    if (dgPatah.dataSource instanceof Array) {
                        const updatedDataSource = dgPatah.dataSource.map((row, index) => {
                            if (index === args.rowIndex) {
                                return { ...row, ...args.data }; // Update the specific row with new data
                            }
                            return row;
                        });

                        dgPatah.setProperties({ dataSource: updatedDataSource });
                        dgPatah.refresh();

                        // Update rencekPatahExisting dengan data terbaru
                        setRencekPatahExisting((prevState) => {
                            const existingIndex = prevState.findIndex((item) => item.kode_rencek === args.data.kode_rencek && item.id_patah === args.data.id_patah);

                            if (existingIndex >= 0) {
                                // Update existing record
                                const newState = [...prevState];
                                newState[existingIndex] = { ...args.data };
                                return newState;
                            } else {
                                // Add new record
                                return [...prevState, { ...args.data }];
                            }
                        });
                    }

                    if (tambah === false) {
                        const editedData = args.data;
                        if (dgPatah.dataSource instanceof Array) {
                            dgPatah.dataSource[selectedRowIndexPatah] = editedData;
                        }
                        dgPatah.refresh();
                    }

                    await updateTotalAndState();
                    break;
                case 'beginEdit':
                    // setTambah(false);
                    // setEdit(true);
                    await updateTotalAndState();

                    break;
                case 'delete':
                    // Update total setelah delete
                    if (dgPatah.dataSource instanceof Array) {
                        const newTotal = dgPatah.dataSource.reduce((sum: number, row: any) => {
                            return sum + (parseFloat(row.panjang_patah) || 0);
                        }, 0);

                        setTotalPanjangPatah(newTotal);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in actionCompleteGridDetail:', error);
        }
    };

    const handleCreate = async () => {
        const result = await generateNU(stateDokumen?.kode_entitas, '', '87', moment().format('YYYYMM'));
        if (result) {
            setFpmbState((prevFormData: any) => ({
                ...prevFormData,
                no_fpmb: result,
            }));
        } else {
            console.error('undefined');
        }
    };

    const handleEdit = async () => {
        await handleSelectedDialog(stateDokumen?.masterKodeDokumen);
        await handleFetchFpmb(stateDokumen?.masterKodeDokumen);
    };

    const updateTotalAndState = async () => {
        let newTotal = 0;
        if (Array.isArray(dgPatah.dataSource)) {
            newTotal = dgPatah.dataSource.reduce((sum: number, row: any) => {
                return sum + (parseFloat(row.panjang_patah) || 0);
            }, 0);
        }

        // Update rencekState dengan total baru
        setRencekState((prevState) => {
            const newState = [...prevState];
            if (newState[rowIndexGrid]) {
                newState[rowIndexGrid] = {
                    ...newState[rowIndexGrid],
                    tot_qty_panjang: newTotal.toString(),
                    tot_qty_panjang_bagi12: (newTotal / 12).toString(),
                };
            }
            return newState;
        });

        setRencekStateExisting((prevState) => {
            const newState = [...prevState];
            if (newState[rowIndexGrid]) {
                newState[rowIndexGrid] = {
                    ...newState[rowIndexGrid],
                    tot_qty_panjang: newTotal.toString(),
                    tot_qty_panjang_bagi12: (newTotal / 12).toString(),
                };
            }
            return newState;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (stateDokumen?.masterDataState === 'BARU') {
                    // await handleCreate();
                    await stateBaru();
                } else {
                    await handleEdit();
                    await updateTotalAndState();
                    await handleEditImages();
                }
            } catch (error) {
                console.error('Terjadi kesalahan saat memuat data:', error);
            }
        };
        fetchData();
    }, [stateDokumen?.masterDataState, stateDokumen?.masterKodeDokumen, isOpen]);

    const rowSelectingGridDetail = (args: any) => {
        setSelectedRowIndexPatah(args.rowIndex);
    };

    const handleDetailBaru = async (jenis: any) => {
        // Check if dgHasilRencek has data
        if (!dgHasilRencek || !dgHasilRencek.dataSource || (Array.isArray(dgHasilRencek.dataSource) && dgHasilRencek.dataSource.length === 0)) {
            myAlertGlobal('Data Hasil Timbang harus ada sebelum menambah detail baru.', 'frmFpmb');
            return;
        }

        const currentQtyPatah = stateDokumen?.jenisPengajuan == 2 ? rencekState[rowIndexGrid]?.qty_patah || 0 : rencekState[0]?.qty_patah || 0;

        if (currentQtyPatah <= 0) {
            myAlertGlobal('Silahkan isi Qty Patah terlebih dahulu', 'frmFpmb');
            return;
        }

        const maxPanjang = currentQtyPatah;

        const lengthGrid = dgPatah.dataSource instanceof Array ? dgPatah.dataSource.length : 0; // Get the length of the grid
        if (lengthGrid >= maxPanjang) {
            myAlertGlobal('Jumlah barang patah dalam grid sudah mencapai maksimum', 'frmFpmb');
            return;
        }

        // Get the selected kode_rencek from the currently selected row in dgHasilRencek
        const selectedKodeRencek = rencekState[rowIndexGrid]?.kode_rencek;
        if (!selectedKodeRencek) {
            myAlertGlobal('Tidak ada kode rencek yang dipilih.', 'frmFpmb');
            return;
        }

        const newRecord = {
            kode_rencek: selectedKodeRencek, // Use the selected kode_rencek
            id_patah: lengthGrid + 1, // Increment id_patah based on current length
            panjang_patah: '', // Initialize with empty value or user input
        };
        const currentDataSource = dgPatah.dataSource instanceof Array ? dgPatah.dataSource : [];
        dgPatah.setProperties({
            dataSource: [...currentDataSource, newRecord],
        });
        dgPatah.refresh(); // Refresh the grid to show the updated data
    };

    const handleDeletePatah = async () => {
        if (!dgPatah || !selectedRowDataPatah) {
            myAlertGlobal('Pilih data yang akan dihapus', 'frmFpmb');
            return;
        }

        try {
            let idBaru = 0;

            const currentKodeRencek = selectedRowDataPatah.kode_rencek;
            const selectedIdPatah = selectedRowDataPatah.id_patah;

            const updatedRencekPatah = rencekPatahExisting.filter((item) => !(item.kode_rencek === currentKodeRencek && item.id_patah === selectedIdPatah));
            const finalDataSource = updatedRencekPatah.map((item, idx) => {
                if (item.kode_rencek === currentKodeRencek) {
                    idBaru++;
                    return { ...item, id_patah: idBaru };
                }
                return item;
            });

            // Update rencekPatahExisting
            setRencekPatahExisting(finalDataSource);

            // Filter data for current kode_rencek to show in grid
            const currentKodeRencekData = finalDataSource.filter((item) => item.kode_rencek === currentKodeRencek);

            // Update grid
            dgPatah.setProperties({ dataSource: currentKodeRencekData });
            dgPatah.refresh();

            // Update totals
            const newTotal = currentKodeRencekData.reduce((sum, row) => sum + (parseFloat(row.panjang_patah) || 0), 0);
            setTotalPanjangPatah(newTotal);
            await updateTotalAndState();

            // Reset selections
            setSelectedRowDataPatah(null);
            setSelectedPatahRows([]);
        } catch (error) {
            console.error('Error deleting rows:', error);
        }
    };

    // Tambahkan fungsi handle delete all
    const handleDeleteAllPatah = () => {
        if (!dgPatah || !dgPatah.dataSource || (dgPatah.dataSource as any[]).length === 0) {
            myAlertGlobal('Tidak ada data yang bisa dihapus', 'frmFpmb');
            return;
        }

        try {
            // Reset grid datasource dan state
            dgPatah.setProperties({
                dataSource: [],
            });

            setRencekPatahExisting([]);

            // Force refresh grid
            dgPatah.refresh();

            // Reset total panjang
            setTotalPanjangPatah(0);

            // Reset selection
            setSelectedPatahRows([]);
        } catch (error) {
            console.error('Error deleting all rows:', error);
        }
    };

    const handleInputChange = (args: any, name: string, value: any) => {
        let newValue: string | number;

        if (['qty_utuh', 'qty_kurang', 'qty_patah'].includes(name)) {
            const numValue = parseFloat(value) || 0;
            newValue = numValue;

            if (dgPatah) {
                const filteredResults = rencekPatahExisting.filter((item: any) => item.kode_rencek !== rencekState[rowIndexGrid].kode_rencek);

                setRencekPatahExisting(filteredResults);

                dgPatah.dataSource = [];
                dgPatah.refresh();
                setTotalPanjangPatah(0);
            }
        } else {
            newValue = String(value).toUpperCase();
        }

        // Update state rencek dengan qty_patah baru
        // if (stateDokumen?.jenisPengajuan == 2) {
        const updatedRencek = [...rencekState];
        updatedRencek[rowIndexGrid] = {
            ...updatedRencek[rowIndexGrid],
            [name]: newValue,
        };

        setRencekStateExisting(updatedRencek);
        setRencekState(updatedRencek);
        // }else{}
        // setRencekState((prev) => [
        //     {
        //         ...prev[0],
        //         [name]: newValue,
        //     },
        // ]);
    };

    const handleQtyPatahChange2 = (name: string, value: any) => {
        const qtyPatah = parseFloat(value) || 0;

        // Update state rencek dengan qty_patah baru
        if (stateDokumen?.jenisPengajuan == 2) {
            const updatedRencek = [...rencekState];
            updatedRencek[rowIndexGrid] = {
                ...updatedRencek[rowIndexGrid],
                qty_patah: qtyPatah,
            };
            setRencekState(updatedRencek);
        }

        // Reset grid jika qty_patah diubah
        if (dgPatah) {
            dgPatah.dataSource = [];
            dgPatah.refresh();
            setTotalPanjangPatah(0);
        }
    };

    const handleQtyPatahChange = (args: any) => {
        const qtyPatah = parseFloat(args.value) || 0;

        // Update state rencek dengan qty_patah baru
        if (stateDokumen?.jenisPengajuan == 2) {
            const updatedRencek = [...rencekState];
            updatedRencek[rowIndexGrid] = {
                ...updatedRencek[rowIndexGrid],
                qty_patah: qtyPatah,
            };
            setRencekState(updatedRencek);
        }

        // Reset grid jika qty_patah diubah
        if (dgPatah) {
            dgPatah.dataSource = [];
            dgPatah.refresh();
            setTotalPanjangPatah(0);
        }
    };

    const [xFiles, setXFiles] = useState<FileWithOriginalName[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const clearAllFiles = () => {
        setXFiles([]);
        setPreviewFile(null);
    };

    const handleFileUpload = (event: any) => {
        let vRc: any;
        // console.log('event xFiles ', xFiles);
        const newFiles = Array.from(event.target.files as FileList);
        vRc = activeTabSub === 'Surat Jalan' ? 'RC1' : activeTabSub === 'Foto Barang' ? 'RC2' : activeTabSub === 'Video Barang' ? 'RC3' : null;
        let idDokumen = 100;
        let newIndex = xFiles.length;
        const renamedFiles = newFiles.map((file: File, index) => {
            const originalName = file.name;
            const extension = file.name.split('.').pop() || '';
            const newFileName = `RC_${stateDokumen?.kode_entitas}_${moment().format('YYMMDDHHmmss')}_${
                xFiles.length > 0
                    ? Math.max(
                          ...xFiles.map((originalName) => {
                              const match = originalName.name.match(/_(\d+)\.[a-zA-Z0-9]+$/);
                              return match ? parseInt(match[1], 10) : -Infinity;
                          })
                      ) + 1
                    : newIndex + 1
            }.${extension}`;
            const renamedFile = new File([file], newFileName, { type: file.type }) as FileWithOriginalName;
            renamedFile.originalName = originalName;
            renamedFile.idx =
                xFiles.length > 0
                    ? xFiles?.reduce((max, current) => {
                          return current.idx > max.idx ? current : max;
                      }).idx + 1
                    : idDokumen + 1;
            renamedFile.dokumen = vRc;
            renamedFile.isUploaded = false;
            renamedFile.deleted = false;
            // console.log('renamedFile ', renamedFile);
            return renamedFile;
        });

        setXFiles((prevFiles: FileWithOriginalName[]) => [...prevFiles, ...renamedFiles]);
        // console.log('xFiles ', xFiles);
    };

    const clearFile = (idxDok: any) => {
        setXFiles((prevFiles: FileWithOriginalName[]) => {
            return prevFiles.map((file) => {
                if (file.idx === idxDok) {
                    return { ...file, deleted: true } as FileWithOriginalName;
                }
                return file;
            });
        });
    };
    // ... existing code ...
    const handleFileClick = (file: any, imageLocal: any, imageServer: any, idx: any) => {
        setPreviewFile(file);
        if (!file) return null;
        const fileType = file.type;

        if (!fileType) {
            setObjekImage((prevState: any) => ({
                ...prevState,
                isOpenPreview: true,
                imageDataUrl: file.file,
                indexPreview: file.name,
                indexId: idx,
            }));
        } else {
            setObjekImage((prevState: any) => ({
                ...prevState,
                isOpenPreview: true,
                imageDataUrl: URL.createObjectURL(file),
                indexPreview: file.name,
                indexId: idx,
            }));
        }
    };

    const HandleCloseZoom = (setStateDataHeader: Function) => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            isOpenPreview: false,
        }));
    };

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    const isRencekStateEmpty = async (): Promise<boolean> => {
        return rencekState.length === 0 || (rencekState.length === 1 && rencekState[0].kode_rencek === '');
    };

    const blokingan = async () => {
        // throw exitCode;
        if (await isRencekStateEmpty()) {
            let pesanError = `Daftar rencek masih kosong. `;

            await myAlertGlobal(pesanError, 'frmFpmb');

            throw {
                code: 400,
                message: pesanError,
            };
        }
        if (stateDokumen?.statusPengajuan == 'Koreksi' && stateDokumen?.updateFilePendukung !== '0') {
            let pesanError = `Status FPMB sudah koreksi. Mohon lakukan koreksi hasil rencek di FASTD.`;
            await myAlertGlobal(pesanError, 'frmFpmb');
            throw {
                code: 400,
                message: pesanError,
            };
        }
        const cekData = await cekAvailableData(stateDokumen?.kode_entitas, fpmbState[0]?.kode_mb, stateDokumen?.token);
        if (
            cekData &&
            stateDokumen?.masterDataState !== 'EDIT' &&
            stateDokumen?.pAppFPMB !== 'Approval' &&
            stateDokumen?.pAppFPMB !== 'UnApproval' &&
            stateDokumen?.statusPengajuan !== '2' &&
            stateDokumen?.updateFilePendukung !== '0'
        ) {
            let pesanError = `Proses Pengajuan FPMB tidak dapat dilakukan.
                FPMB sudah dibuat dengan No. Pengajuan : ${cekData.dataCek[0]?.no_fpmb}`;

            await myAlertGlobal(pesanError, 'frmFpmb');

            throw {
                code: 400,
                message: pesanError,
            };
        }

        if (buKoreksi !== 'koreksi' && stateDokumen?.updateFilePendukung !== '0') {
            if (xFiles.length == 0) {
                let pesanError = `Daftar File Pendukung Dokumentasi masih kosong. `;

                await myAlertGlobal(pesanError, 'frmFpmb');

                throw {
                    code: 400,
                    message: pesanError,
                };
            }
            const filterfilePendukungSj = xFiles.filter((item) => item.dokumen === 'RC1');
            // console.log('filterfilePendukungSj', filterfilePendukungSj);
            if (filterfilePendukungSj.length == 0) {
                let pesanError = `Daftar File Pendukung Dokumentasi Surat Jalan belum terisi. `;
                setActiveTabSub('Surat Jalan');
                await myAlertGlobal(pesanError, 'frmFpmb');

                throw {
                    code: 400,
                    message: pesanError,
                };
            }
            const filterfilePendukungFotoBarang = xFiles.filter((item) => item.dokumen === 'RC2');
            // console.log('filterfilePendukungFotoBarang', filterfilePendukungFotoBarang);
            if (filterfilePendukungFotoBarang.length == 0) {
                let pesanError = `Daftar File Pendukung Dokumentasi Foto Barang belum terisi. `;
                setActiveTabSub('Foto Barang');
                await myAlertGlobal(pesanError, 'frmFpmb');

                throw {
                    code: 400,
                    message: pesanError,
                };
            }
        }
    };

    const saveDoc3 = async () => {
        // await handleUpload('RC0000001226', 'baru', stateDokumen?.kode_entitas);
    };

    const saveDoc = async () => {
        try {
            let responseAPI: any;
            // const validSaved = await blokingan();
            // if (stateDokumen?.updateFilePendukung !== '0') {
            // if (!validSaved && stateDokumen?.updateFilePendukung !== '0') {
            // await myAlertGlobal('Data belum dapat disimpan, cek data terlebih dahulu', 'frmFpmb');
            // return;
            // } else {

            await blokingan();

            // console.log('fpmbState ', fpmbState);
            const tglApproval = fpmbState[0].tgl_approval === '' || fpmbState[0].tgl_approval === null ? null : moment(fpmbState[0].tgl_approval).format('YYYY-MM-DD HH:mm:ss');
            const tglDoSj = fpmbState[0].tgl_do_sj === '' || fpmbState[0].tgl_do_sj === null ? null : fpmbState[0].tgl_do_sj; //moment(fpmbState[0].tgl_do_sj, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

            const tglFPMBNEW = moment(fpmbState[0].tgl_fpmb, 'DD-MM-YYYY')
                .hour(14) // Menambahkan jam, misalnya jam 14
                .minute(30) // Menambahkan menit, misalnya menit 30
                .second(0);

            const reqBody = {
                pAppFPMB: buKoreksi === 'koreksi' ? 'Koreksi' : stateDokumen?.pAppFPMB,
                entitas: stateDokumen?.kode_entitas,
                kode_fpmb: stateDokumen?.masterKodeDokumen !== 'BARU' ? fpmbState[0].kode_fpmb : '',
                no_fpmb: fpmbState[0].no_fpmb,
                kode_mb: fpmbState[0].kode_mb,
                no_mb: fpmbState[0].no_mb,

                tgl_fpmb: stateDokumen?.masterDataState === 'BARU' ? moment().format('YYYY-MM-DD HH:mm:ss') : fpmbState[0].tgl_fpmb, // Menambahkan detik, misalnya detik 0,

                pengajuan: fpmbState[0].pengajuan,
                tgl_pengajuan: stateDokumen?.masterDataState === 'BARU' ? moment().format('YYYY-MM-DD HH:mm:ss') : fpmbState[0].tgl_pengajuan,
                user_pengajuan: stateDokumen?.userid,
                approval: stateDokumen?.masterDataState === 'APPROVAL' && buKoreksi !== 'koreksi' ? 'Y' : stateDokumen?.masterDataState === 'BARU' ? 'N' : fpmbState[0].approval,
                // tgl_approval: stateDokumen?.masterDataState === 'EDIT' ? tglApproval : stateDokumen?.masterDataState === 'APPROVAL' ? moment().format('YYYY-MM-DD HH:mm:ss') : null,
                tgl_approval:
                    stateDokumen?.masterDataState === 'APPROVAL' && buKoreksi !== 'koreksi'
                        ? moment().format('YYYY-MM-DD HH:mm:ss')
                        : stateDokumen?.masterDataState === 'BARU'
                        ? null
                        : fpmbState[0].tgl_approval, //tglApproval,

                user_approval: stateDokumen?.masterDataState === 'APPROVAL' && buKoreksi !== 'koreksi' ? stateDokumen?.userid : stateDokumen?.masterDataState === 'BARU' ? '' : fpmbState[0].user_approval,
                jenis_pengajuan: fpmbState[0].jenis_pengajuan,
                jenis_fpmb: fpmbState[0].jenis_fpmb,
                tgl_do_sj: tglDoSj,
                // rencek: rencekState.map((data: any, index) => ({
                rencek: rencekStateExisting.map((data: any) => ({
                    ...data,
                    // kode_rencek: rencekState[index]?.kode_rencek, //`${data.kode_dokumen_reff}${data.id_dokumen}`, //data.kode_dokumen_reff + String(data.id_dokumen),
                    kode_rencek: data.kode_rencek,
                    dokumen: 'MB',
                    kode_dokumen_reff: data.kode_dokumen_reff,
                    no_dokumen_reff: data.no_dokumen_reff,
                    id_dokumen: data.id_dokumen,
                    tgl_do: data.tgl_do,
                    tgl_sampai_gudang: data.tgl_sampai_gudang,
                    tgl_selesai_hitung: data.tgl_selesai_hitung,
                    nopol: data.nopol,
                    nama_ekspedisi: data.nama_ekspedisi,
                    pabrik_asal: data.pabrik_asal,
                    kode_item: data.kode_item,
                    nama_barang: data.nama_barang,
                    qty_sj: data.qty_sj,
                    qty_utuh: data.qty_utuh,
                    qty_kurang: data.qty_kurang,
                    qty_patah: data.qty_patah,
                    qty_lebih_utuh: data.qty_lebih_utuh,
                    qty_lebih_patah: data.qty_lebih_patah,
                    tot_qty_panjang: Number(parseFloat(data.tot_qty_panjang).toFixed(2)),
                    tot_qty_panjang_bagi12: Number(parseFloat(data.tot_qty_panjang_bagi12).toFixed(2)),
                    userid: data.userid,
                    tgl_rencek: data.tgl_rencek,
                    alasan_koreksi: data.alasan_koreksi,
                    no_item: data.no_item,
                    total_berat: data.total_berat,
                    hasil: data.hasil,
                })),
                rencek_patah: rencekPatahExisting.map((data: any, index) => ({
                    ...data,
                    id_patah: data.id_patah,
                    panjang_patah: data.panjang_patah,
                })),
            };

            // await handleUpload(stateDokumen?.masterKodeFpmb, 'update', stateDokumen?.kode_entitas);
            // console.log('reqBody ', reqBody);
            // console.log('rencekStateExisting ', rencekStateExisting);

            // console.log('rencekState ', rencekState);
            // return;
            // clearInterval(interval);
            // setIsLoadingProgress(false);
            // setProgressValue(0);
            // return;
            // throw exitCode;

            if (stateDokumen?.masterDataState === 'BARU') {
                if (await myAlertGlobal3('Simpan FPMB ?', 'frmFpmb')) {
                    setIsLoadingProgress(true);
                    setProgressValue(0);

                    interval = setInterval(() => {
                        setProgressValue((prev) => {
                            if (prev >= 90) {
                                clearInterval(interval);
                                return 90;
                            }
                            return prev + 2;
                        });
                    }, 40);

                    // throw exitCode;
                    setLoadingMessage('Proses Simpan...');
                    setProgressValue(20);

                    // await handleUpload('RC0000001226', 'update', stateDokumen?.kode_entitas);

                    responseAPI = await axios.post(`${apiUrl}/erp/simpan_fpmb`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });
                    if (responseAPI.data.status === true) {
                        setLoadingMessage('Upload file pendukung baru...');
                        setProgressValue(40);
                        await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                        await handleUpload(responseAPI.data.data.kodeFPMB);
                    }
                }
            } else if (stateDokumen?.masterDataState === 'EDIT') {
                if (buKoreksi === 'koreksi') {
                    if (await myAlertGlobal3('Koreksi FPMB ?', 'frmFpmb')) {
                        setIsLoadingProgress(true);
                        setProgressValue(0);

                        interval = setInterval(() => {
                            setProgressValue((prev) => {
                                if (prev >= 90) {
                                    clearInterval(interval);
                                    return 90;
                                }
                                return prev + 2;
                            });
                        }, 40);

                        // throw exitCode;
                        setLoadingMessage('Koreksi Data...');
                        setProgressValue(60);
                        // await handleUpload('RC0000001226', 'update', stateDokumen?.kode_entitas);

                        responseAPI = await axios.post(`${apiUrl}/erp/approval_fpmb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        });
                        // if (responseAPI.data.status === true) {
                        //     // await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                        //     await handleUpload(responseAPI.data.data.kodeFPMB, 'update', stateDokumen?.kode_entitas);
                        //     setBuKoreksi('');
                        // }
                    }
                } else {
                    if (await myAlertGlobal3('Edit FPMB ?', 'frmFpmb')) {
                        setIsLoadingProgress(true);

                        setProgressValue(0);

                        interval = setInterval(() => {
                            setProgressValue((prev) => {
                                if (prev >= 90) {
                                    clearInterval(interval);
                                    return 90;
                                }
                                return prev + 2;
                            });
                        }, 40);

                        // throw exitCode;
                        setLoadingMessage('Update Data...');
                        setProgressValue(60);

                        // await handleUpload('RC0000001226', 'update', stateDokumen?.kode_entitas);
                        // throw exitCode;

                        responseAPI = await axios.patch(`${apiUrl}/erp/update_fpmb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        });

                        if (responseAPI.data.status === true) {
                            // await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                            await handleUpload(stateDokumen?.masterKodeFpmb);
                        }
                    }
                }
            } else if (stateDokumen?.masterDataState === 'APPROVAL') {
                if (buKoreksi !== 'koreksi') {
                    if (await myAlertGlobal3('Apakah data pengajuan mutasi barang ini akan disetujui ?', 'frmFpmb')) {
                        setIsLoadingProgress(true);

                        setProgressValue(0);

                        interval = setInterval(() => {
                            setProgressValue((prev) => {
                                if (prev >= 90) {
                                    clearInterval(interval);
                                    return 90;
                                }
                                return prev + 2;
                            });
                        }, 40);

                        // throw exitCode;
                        setLoadingMessage('APPROVAL Data...');
                        setProgressValue(60);

                        // await handleUpload('RC0000001226', 'update', stateDokumen?.kode_entitas);

                        responseAPI = await axios.post(`${apiUrl}/erp/approval_fpmb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        });
                        // if (responseAPI.data.status === true) {
                        //     // await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                        //     await handleUpload(responseAPI.data.data.kodeFPMB, 'update', stateDokumen?.kode_entitas);
                        // }
                    }
                } else {
                    if (await myAlertGlobal3('Koreksi FPMB ?', 'frmFpmb')) {
                        setIsLoadingProgress(true);
                        setProgressValue(0);

                        interval = setInterval(() => {
                            setProgressValue((prev) => {
                                if (prev >= 90) {
                                    clearInterval(interval);
                                    return 90;
                                }
                                return prev + 2;
                            });
                        }, 40);

                        // throw exitCode;
                        setLoadingMessage('Koreksi Data...');
                        setProgressValue(60);
                        // await handleUpload('RC0000001226', 'update', stateDokumen?.kode_entitas);

                        // throw exitCode;

                        responseAPI = await axios.post(`${apiUrl}/erp/approval_fpmb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        });
                        // if (responseAPI.data.status === true) {
                        //     // await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                        //     await handleUpload(responseAPI.data.data.kodeFPMB, 'update', stateDokumen?.kode_entitas);
                        //     setBuKoreksi('');
                        // }
                    }
                }
            } else if (stateDokumen?.masterDataState === 'UNAPPROVAL') {
                if (await myAlertGlobal3('Batal Approve FPMB ?', 'frmFpmb')) {
                    setIsLoadingProgress(true);

                    setProgressValue(0);

                    interval = setInterval(() => {
                        setProgressValue((prev) => {
                            if (prev >= 90) {
                                clearInterval(interval);
                                return 90;
                            }
                            return prev + 2;
                        });
                    }, 40);

                    // throw exitCode;
                    setLoadingMessage('UNAPPROVAL Data...');
                    setProgressValue(60);

                    responseAPI = await axios.post(`${apiUrl}/erp/approval_fpmb`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });

                    // if (responseAPI.data.status === true) {
                    //     // await generateNU(stateDokumen?.kode_entitas, fpmbState[0]?.no_fpmb, '87', moment().format('YYYYMM'));
                    //     await handleUpload(responseAPI.data.data.kodeFPMB, 'update', stateDokumen?.kode_entitas);
                    // }
                }
            } else if (stateDokumen?.masterDataState === 'FILE PENDUKUNG') {
                if (await myAlertGlobal3('Update File Pendukung ?', 'frmFpmb')) {
                    setIsLoadingProgress(true);

                    setProgressValue(0);

                    interval = setInterval(() => {
                        setProgressValue((prev) => {
                            if (prev >= 90) {
                                clearInterval(interval);
                                return 90;
                            }
                            return prev + 2;
                        });
                    }, 40);
                    setLoadingMessage('Update File Pendukung...');
                    setProgressValue(60);
                    await handleUpload(stateDokumen?.masterKodeFpmb);
                }
            }
            // }

            setLoadingMessage('Finalisasi Simpan...');
            setProgressValue(80);

            setTimeout(() => {
                setProgressValue(100);
                clearInterval(interval);
                dialogClose();
                onRefresh();
            }, 1000);
        } catch (error: any) {
            // myAlertGlobal(`Gagal Simpan - ErrorSaveDoc ${error}`, 'frmFpmb');
            // clearInterval(interval);
            // setIsLoadingProgress(false);
            // setProgressValue(0);
            if (error.code) {
                console.error(`Error [Code ${error.code}]: ${error.message}`); // Tangani error berdasarkan kode
                clearInterval(interval);
                setIsLoadingProgress(false);
                setProgressValue(0);
            } else {
                console.error('Unknown error occurred:', error);
                clearInterval(interval);
                setIsLoadingProgress(false);
                setProgressValue(0);
            }
        }
    };

    let fileOri: any = [];

    const base64ToBlob = (base64: string, mimeType: string) => {
        const byteCharacters = atob(base64); // decode base64 menjadi byte string
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
    };

    const extractBase64Data = (base64: string) => {
        const regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,/;
        const matches = base64.match(regex);

        if (matches && matches.length > 1) {
            const mimeType = matches[1]; // MIME type seperti 'image/jpeg', 'video/mp4', dll
            const cleanBase64 = base64.replace(regex, ''); // Menghilangkan prefix
            return { cleanBase64, mimeType };
        }
        return { cleanBase64: base64, mimeType: 'application/octet-stream' }; // Default MIME type jika tidak ditemukan
    };

    // const handleUpload = async (kode_dokumen?: string) => {
    //     const allZip = new JSZip();
    //     console.log('xFiles ', xFiles);
    //     console.log('allZip ', allZip);
    //     for (const file of xFiles) {
    //         console.log('file ', file);
    //         if (file.deleted) {
    //             console.log('file deleted ', file);
    //             try {
    //                 await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
    //                     params: {
    //                         entitas: stateDokumen?.kode_entitas,
    //                         param1: kode_dokumen,
    //                         param2: [file.idx],
    //                     },
    //                 });

    //                 await axios.delete(`${apiUrl}/erp/hapus_file_pendukung_ftp`, {
    //                     params: {
    //                         entitas: stateDokumen?.kode_entitas,
    //                         param1: file.name.replace(/\.[a-zA-Z0-9]+$/, '') + '.zip',
    //                     },
    //                 });
    //             } catch (error) {
    //                 console.error(`Gagal menghapus file: ${file.name}`, error);
    //             }
    //         } else if (!file.isUploaded) {
    //             console.log('file not uploaded ', file);

    //             try {
    //                 const originalName = file.originalName || file.name;
    //                 const zipFileName = file.name.replace(/\.[a-zA-Z0-9]+$/, '') + '.zip';
    //                 const fileInsideZipName = zipFileName.replace('.zip', file.name.slice(file.name.lastIndexOf('.')));

    //                 // ZIP per file → nama isi disesuaikan
    //                 const singleZip = new JSZip();
    //                 singleZip.file(fileInsideZipName, file);
    //                 const zipBlob = await singleZip.generateAsync({ type: 'blob' });

    //                 // Upload ke FTP
    //                 const uploadForm = new FormData();
    //                 uploadForm.append('myimage', zipBlob, zipFileName);
    //                 uploadForm.append('ets', stateDokumen?.kode_entitas);
    //                 uploadForm.append('id_dokumen', `${file.idx}`);
    //                 uploadForm.append('dokumen', file.dokumen);
    //                 uploadForm.append('nama_file_image', zipFileName);

    //                 await axios.post(`${apiUrl}/upload`, uploadForm);

    //                 // Simpan ke DB
    //                 const jsonSimpan = {
    //                     entitas: stateDokumen?.kode_entitas,
    //                     kode_dokumen: kode_dokumen,
    //                     id_dokumen: file.idx,
    //                     dokumen: file.dokumen,
    //                     filegambar: file.name,
    //                     fileoriginal: originalName,
    //                 };
    //                 await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);

    //                 // Tambahkan ke master ZIP
    //                 allZip.file(originalName, file);
    //             } catch (error) {
    //                 console.error(`Error saat upload file baru: ${file.name}`, error);
    //             }
    //         } else {
    //             console.log('file else', file);

    //             // Jika sudah uploaded dan tidak dihapus → tetap masuk master ZIP
    //             allZip.file(file.originalName || file.name, file);
    //         }
    //     }

    //     // Upload Master ZIP (id_dokumen = 999)
    //     try {
    //         const masterZip = await allZip.generateAsync({ type: 'blob' });
    //         console.log('masterZip ', masterZip);
    //         const masterZipName = `RC_${kode_dokumen}.zip`;

    //         const formData = new FormData();
    //         formData.append('myimage', masterZip, masterZipName);
    //         formData.append('ets', stateDokumen?.kode_entitas);
    //         formData.append('id_dokumen', `999`);
    //         formData.append('dokumen', 'RC0');
    //         formData.append('nama_file_image', masterZipName);

    //         await axios.post(`${apiUrl}/upload`, formData);

    //         // ✅ Selalu simpan master ZIP ke DB
    //         const jsonSimpan = {
    //             entitas: stateDokumen?.kode_entitas,
    //             kode_dokumen: kode_dokumen,
    //             id_dokumen: '999',
    //             dokumen: 'RC0',
    //             filegambar: masterZipName,
    //             fileoriginal: masterZipName,
    //         };
    //         await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
    //     } catch (error) {
    //         console.error('Error saat menyimpan master ZIP:', error);
    //     }
    // };
    // const handleUpload = async (kode_dokumen?: string) => {
    //     if (!kode_dokumen) return;

    //     const allZip = new JSZip();
    //     const processedFiles = new Set<string>();
    //     const masterZipName = `RC_${kode_dokumen}.zip`;

    //     // Process each file
    //     for (const file of xFiles) {
    //         const originalName = file.originalName || file.name;

    //         // Skip duplicates
    //         if (processedFiles.has(originalName)) continue;
    //         processedFiles.add(originalName);

    //         try {
    //             // Add file content to master ZIP
    //             const fileContent = await readFileAsArrayBuffer(file);
    //             allZip.file(originalName, fileContent);
    //             console.log(`Added to master ZIP: ${originalName} (${file.size} bytes)`);
    //             // Handle deleted files
    //             if (file.deleted) {
    //                 await handleDeletedFile(file, kode_dokumen);
    //                 continue;
    //             }

    //             // Handle new/updated files
    //             if (!file.isUploaded) {
    //                 await handleNewFileUpload(file, kode_dokumen, originalName);
    //             }
    //         } catch (error) {
    //             console.error(`Error processing file ${originalName}:`, error);
    //         }
    //     }

    //     // Create and upload master ZIP if there are processed files
    //     if (processedFiles.size > 0) {
    //         await uploadMasterZip(allZip, masterZipName, kode_dokumen);
    //     }
    // };

    const handleUpload = async (kode_dokumen?: string) => {
        if (!kode_dokumen) return;

        const allZip = new JSZip();
        const processedFiles = new Map<string, { id_dokumen: string; dokumen: string; count: number }>();
        const masterZipName = `RC_${kode_dokumen}.zip`;

        // Process each file
        for (const file of xFiles) {
            const originalName = file.originalName || file.name;
            const fileKey = `${originalName}_${file.idx}_${file.dokumen}`;

            // Get file extension and name without extension
            const extension = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
            const nameWithoutExt = originalName.includes('.') ? originalName.substring(0, originalName.lastIndexOf('.')) : originalName;

            // Check if we've already processed a file with the same name
            let finalName = originalName;
            const existingFile = processedFiles.get(nameWithoutExt);

            if (existingFile) {
                if (parseFloat(existingFile.id_dokumen) === file.idx && existingFile.dokumen === file.dokumen) {
                    console.log(`Skipping duplicate file: ${originalName} (id_dokumen: ${file.idx}, dokumen: ${file.dokumen})`);
                    continue;
                } else {
                    // Same name but different metadata, add suffix
                    const count = (existingFile.count || 1) + 1;
                    finalName = `${nameWithoutExt}_${count}${extension}`;
                    processedFiles.set(nameWithoutExt, {
                        ...existingFile,
                        count,
                    });
                }
            } else {
                // First time seeing this filename
                processedFiles.set(nameWithoutExt, {
                    id_dokumen: Number(file.idx).toString(),
                    dokumen: file.dokumen,
                    count: 1,
                });
            }

            try {
                // Add file content to master ZIP with the final name
                const fileContent = await readFileAsArrayBuffer(file);
                allZip.file(finalName, fileContent);
                // console.log(`Added to master ZIP: ${finalName} (${file.size} bytes, id_dokumen: ${file.idx}, dokumen: ${file.dokumen})`);

                // Handle deleted files
                if (file.deleted) {
                    // console.log(`Deleting file: ${finalName}`);
                    await handleDeletedFile(file, kode_dokumen);
                    continue;
                }

                // Handle new/updated files
                if (!file.isUploaded) {
                    await handleNewFileUpload(file, kode_dokumen, finalName);
                }
            } catch (error) {
                console.error(`Error processing file ${finalName}:`, error);
            }
        }

        // Create and upload master ZIP if there are processed files
        if (processedFiles.size > 0) {
            await uploadMasterZip(allZip, masterZipName, kode_dokumen);
        }
    };

    // Helper functions
    const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const handleDeletedFile = async (file: any, kode_dokumen: string) => {
        // console.log('handleDeletedFile ', file);
        try {
            await Promise.all([
                // Delete from database
                axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                    params: {
                        entitas: stateDokumen?.kode_entitas,
                        param1: kode_dokumen,
                        param2: [file.idx],
                    },
                }),
                // Delete from FTP
                axios.delete(`${apiUrl}/erp/hapus_file_pendukung_ftp`, {
                    params: {
                        entitas: stateDokumen?.kode_entitas,
                        param1: `${file.name.replace(/\.[a-zA-Z0-9]+$/, '')}.zip`,
                    },
                }),
            ]);
        } catch (error) {
            console.error(`Failed to delete file: ${file.name}`, error);
            throw error;
        }
    };

    const handleNewFileUpload = async (file: any, kode_dokumen: string, originalName: string) => {
        const zipFileName = `${file.name.replace(/\.[a-zA-Z0-9]+$/, '')}.zip`;
        const fileExtension = file.name.slice(file.name.lastIndexOf('.'));
        const fileInsideZipName = zipFileName.replace('.zip', fileExtension);

        try {
            // Create individual ZIP
            const singleZip = new JSZip();
            singleZip.file(fileInsideZipName, file);
            const zipBlob = await singleZip.generateAsync({ type: 'blob' });

            // Upload to server
            const uploadForm = new FormData();
            uploadForm.append('myimage', zipBlob, zipFileName);
            uploadForm.append('ets', stateDokumen?.kode_entitas);
            uploadForm.append('id_dokumen', file.idx);
            uploadForm.append('dokumen', file.dokumen);
            uploadForm.append('nama_file_image', zipFileName);

            await axios.post(`${apiUrl}/upload`, uploadForm);

            // Save file info to database
            await axios.post(`${apiUrl}/erp/simpan_tbimages`, {
                entitas: stateDokumen?.kode_entitas,
                kode_dokumen: kode_dokumen,
                id_dokumen: file.idx,
                dokumen: file.dokumen,
                filegambar: file.name,
                fileoriginal: originalName,
            });
        } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            throw error;
        }
    };

    const uploadMasterZip = async (allZip: JSZip, masterZipName: string, kode_dokumen: string) => {
        try {
            // Generate master ZIP
            const masterZipBlob = await allZip.generateAsync({ type: 'blob' });
            // console.log(`Master ZIP generated: ${masterZipBlob.size} bytes`);
            // Upload master ZIP
            const formData = new FormData();
            formData.append('myimage', masterZipBlob, masterZipName);
            formData.append('ets', stateDokumen?.kode_entitas);
            formData.append('id_dokumen', '999');
            formData.append('dokumen', 'RC0');
            formData.append('nama_file_image', masterZipName);

            await axios.post(`${apiUrl}/upload`, formData);

            console.log(`Master ZIP uploaded successfully: ${masterZipName}`);

            // Save master ZIP info to database
            await axios.post(`${apiUrl}/erp/simpan_tbimages`, {
                entitas: stateDokumen?.kode_entitas,
                kode_dokumen: kode_dokumen,
                id_dokumen: '999',
                dokumen: 'RC0',
                filegambar: masterZipName,
                fileoriginal: masterZipName,
            });
        } catch (error) {
            console.error('Error uploading master ZIP:', error);
            throw error;
        }
    };

    // const debugZipContents = async (zip: JSZip) => {
    //     console.log('=== DEBUG ZIP CONTENTS ===');
    //     console.log(`Total files in ZIP: ${Object.keys(zip.files).length}`);
    //     let index = 1;
    //     for (const [relativePath, file] of Object.entries(zip.files)) {
    //         console.log(`${index++}. ${relativePath} (${file._data.uncompressedSize} bytes)`);
    //     }
    //     console.log('==========================');
    // };

    const getButtonState = (stateDokumen: any) => {
        // console.log('stateDokumen ', stateDokumen);
        const isBaru = stateDokumen?.masterDataState === 'BARU';
        const isEdit = stateDokumen?.masterDataState === 'EDIT';
        const isApproval = stateDokumen?.pAppFPMB === 'Approval';
        const isUnApproval = stateDokumen?.pAppFPMB === 'UnApproval';
        const isStatusY = stateDokumen?.statusApp === 'Y';
        const isUpdateFile = stateDokumen?.updateFilePendukung === '0';
        const isjenisPengajuan = stateDokumen?.jenisPengajuan === '2';
        // console.log('isUpdateFile ', isUpdateFile);
        const buOkEnabled = isBaru || isApproval || isUnApproval || (isjenisPengajuan && !isEdit) || isUpdateFile;
        const buRencekEnabled = isBaru;

        const buKoreksiDisabled = isStatusY || isUnApproval || isUpdateFile; //|| (isUnApproval && isUpdateFile);

        const allowFileButtons = isBaru || isUpdateFile;
        const buDelFileEnabled = allowFileButtons;
        const buGetFileEnabled = allowFileButtons;
        const buPasteImageEnabled = allowFileButtons;

        let captionPanel = '';
        if (isApproval) {
            captionPanel = `Approval - FBM Mobil Ekspedisi - Entitas ${stateDokumen?.kode_entitas}`;
        } else if (isUnApproval) {
            captionPanel = `UnApproval - FBM Mobil Ekspedisi - Entitas ${stateDokumen?.kode_entitas}`;
        } else if (isUpdateFile) {
            captionPanel = `Update / Koreksi File Pendukung - FBM Mobil Ekspedisi - Entitas ${stateDokumen?.kode_entitas}`;
        } else {
            captionPanel = `Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Ekspedisi - Entitas ${stateDokumen?.kode_entitas}`;
        }

        return {
            buOkEnabled,
            buRencekEnabled,
            buKoreksiDisabled,
            buDelFileEnabled,
            buGetFileEnabled,
            buPasteImageEnabled,
            captionPanel,
        };
    };

    const { buOkEnabled, buKoreksiDisabled, buDelFileEnabled, buGetFileEnabled, buPasteImageEnabled, captionPanel } = getButtonState(stateDokumen);

    return (
        <div>
            <DialogComponent
                id="frmFpmb"
                isModal={true}
                width="95%"
                height="85%"
                visible={isOpen}
                close={() => {
                    dialogClose();
                }}
                // header="Pengeluaran Lain"
                // header={stateDokumen?.masterDataState === 'BARU' ? 'Pengeluaran Lain ' : `Pengeluaran Lain (EDIT) : ${headerState?.no_dokumen} `}
                // header={handleHeaderDok}
                // showCloseIcon={true}
                target="#fpmbList"
                closeOnEscape={false}
                allowDragging={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                // style={{ maxHeight: '1800px' }}
                position={{ X: 'center', Y: 'top' }}
                resizeHandles={['All']}
                // enableResize={true}
                // buttons={buttonInputData}
            >
                <div className="border border-gray-300 bg-white">
                    <div className="flex items-center justify-between bg-blue-900 p-2 text-white">
                        <div className="text-sm font-bold">
                            {stateDokumen?.jenisPengajuan === '0'
                                ? stateDokumen?.masterDataState === 'BARU'
                                    ? '<BARU (KG)>'
                                    : stateDokumen?.masterDataState === 'EDIT'
                                    ? '<EDIT (KG)>'
                                    : stateDokumen?.masterDataState === 'APPROVAL'
                                    ? '<APPROVAL(KG)>'
                                    : stateDokumen?.masterDataState === 'UNAPPROVAL'
                                    ? '<UNAPPROVAL(KG)>'
                                    : stateDokumen?.masterDataState === 'FILE PENDUKUNG'
                                    ? '<UPDATE FILE PENDUKUNG (KG)>'
                                    : ''
                                : stateDokumen?.jenisPengajuan === '1'
                                ? stateDokumen?.masterDataState === 'BARU'
                                    ? '<BARU (MKG)>'
                                    : stateDokumen?.masterDataState === 'EDIT'
                                    ? '<EDIT (MKG)>'
                                    : stateDokumen?.masterDataState === 'APPROVAL'
                                    ? '<APPROVAL (MKG)>'
                                    : stateDokumen?.masterDataState === 'UNAPPROVAL'
                                    ? '<UNAPPROVAL (MKG)>'
                                    : stateDokumen?.masterDataState === 'FILE PENDUKUNG'
                                    ? '<UPDATE FILE PENDUKUNG (MKG)>'
                                    : ''
                                : stateDokumen?.jenisPengajuan === '2'
                                ? stateDokumen?.masterDataState === 'BARU'
                                    ? '<BARU (MKL)>'
                                    : stateDokumen?.masterDataState === 'EDIT'
                                    ? '<EDIT (MKL)>'
                                    : stateDokumen?.masterDataState === 'APPROVAL'
                                    ? '<APPROVAL (MKL)>'
                                    : stateDokumen?.masterDataState === 'UNAPPROVAL'
                                    ? '<UNAPPROVAL (MKL)>'
                                    : stateDokumen?.masterDataState === 'FILE PENDUKUNG'
                                    ? '<UPDATE FILE PENDUKUNG (MKL)>'
                                    : ''
                                : ''}
                        </div>
                        <div className="text-sm font-bold">
                            {stateDokumen?.jenisPengajuan === '0'
                                ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Ekspedisi (KG)'
                                : stateDokumen?.jenisPengajuan === '1'
                                ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Sendiri / Customer Kirim Gudang (MKG)'
                                : stateDokumen?.jenisPengajuan === '2'
                                ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Sendiri / Customer Kirim Langsung (MKL)'
                                : ''}
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                                <label className="mr-2 text-sm">Tanggal Pengajuan</label>
                                <DatePickerComponent
                                    locale="tglPengajuan"
                                    cssClass="e-custom-style flex-1 border border-gray-300"
                                    style={{ border: '1px solid #D1D5DB' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    // value={() => {
                                    //     const date = moment(fpmbState?.[0]?.tgl_fpmb).format('DD-MM-YYYY');
                                    //     return date.toDate()
                                    // }}
                                    value={fpmbState[0]?.tgl_fpmb as Date}
                                    // value={fpmbState[0].tgl_fpmb.toDate()}
                                    disabled={true}
                                ></DatePickerComponent>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                                <label className="mr-2 text-sm">No. Pengajuan</label>
                                {/* <input type="text" className="border border-gray-300 p-1" value="1287.1217.00001" readOnly /> */}
                                <input
                                    className={`container form-input`}
                                    style={{ width: '50%', background: '#eeeeee', fontSize: 11, marginTop: 1, marginLeft: 0, borderColor: '#bfc9d4', borderRadius: 2 }}
                                    disabled={true}
                                    value={fpmbState[0]?.no_fpmb}
                                    readOnly
                                ></input>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex h-full flex-col">
                            <div className="flex h-[5%] overflow-auto">
                                <div className=" flex border-b border-gray-300">
                                    <button
                                        onClick={() => setActiveTab('hasil_rencek')}
                                        className={`px-3 py-2 text-xs font-semibold ${activeTab === 'hasil_rencek' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        {stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? 'Hasil Rencek' : 'Hasil Hitung'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('file_pendukung')}
                                        // disabled={true}
                                        className={`px-3 py-2 text-xs font-semibold ${isOpen && 'hidden'} ${
                                            activeTab === 'file_pendukung' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                        }`}
                                    >
                                        File Pendukung
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('file_pendukung_2')}
                                        // disabled={stateDokumen?.jenisPengajuan == 2 ? true : false}
                                        className={`px-3 py-2 text-xs font-semibold ${activeTab === 'file_pendukung_2' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        File Pendukung
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hasil_timbang')}
                                        disabled={stateDokumen?.jenisPengajuan == 2 ? true : false}
                                        className={`px-3 py-2 text-xs font-semibold ${activeTab === 'hasil_timbang' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'} ${
                                            stateDokumen?.jenisPengajuan == 2 ? 'hidden' : 'block'
                                        }`}
                                    >
                                        Hasil Timbang
                                    </button>
                                </div>
                            </div>
                            <div className="h-[95%]">
                                <div className={`${activeTab === 'hasil_rencek' ? 'block' : 'hidden'}`}>
                                    <div className={''}>
                                        {/* <div className="flex h-full flex-col"> */}
                                        {/* <div className="flex-1 overflow-auto"> */}
                                        <div className="grid w-full grid-cols-12 gap-3 border-b p-1">
                                            <div className="col-span-5 flex flex-col">
                                                <div className="text-sm font-bold">DATA HASIL TIMBANG</div>
                                                <div id="grid">
                                                    <GridComponent
                                                        id="dgHasilRencek"
                                                        locale="id"
                                                        ref={(g: any) => (dgHasilRencek = g)}
                                                        allowPaging={true}
                                                        height={268}
                                                        selectionSettings={{
                                                            mode: 'Row',
                                                            type: 'Single',
                                                        }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        allowReordering={true}
                                                        pageSettings={{
                                                            pageSize: 25,
                                                            pageCount: 5,
                                                            pageSizes: ['25', '50', '100', 'All'],
                                                        }}
                                                        gridLines={'Both'}
                                                        allowTextWrap={true}
                                                        textWrapSettings={{ wrapMode: 'Header' }}
                                                        rowSelected={async (args: any) => {
                                                            if (stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1) {
                                                                setRowIndexGrid(args.row.rowIndex);
                                                                await handleSelectedhasilRencek(args.row.rowIndex);
                                                            } else {
                                                                if (stateDokumen?.masterDataState == 'BARU' || stateDokumen?.masterDataState == 'EDIT') {
                                                                    setRowIndexGrid(args.row.rowIndex);
                                                                    selectedKodeRencekPatah = rencekState[args.row.rowIndex]?.kode_rencek;

                                                                    if (selectedKodeRencekPatah) {
                                                                        const filteredData = rencekPatahExisting.filter((item) => item.kode_rencek === selectedKodeRencekPatah);

                                                                        setTimeout(() => {
                                                                            dgPatah.dataSource = filteredData;
                                                                            dgPatah.refresh();
                                                                        }, 200);

                                                                        if (filteredData.length > 0) {
                                                                            const totalPanjang = filteredData.reduce((sum, item) => sum + (parseFloat(item.panjang_patah) || 0), 0);
                                                                            setTotalPanjangPatah(totalPanjang);
                                                                        } else {
                                                                            setTotalPanjangPatah(0);
                                                                            dgPatah.setProperties({ dataSource: [] });
                                                                        }
                                                                    }
                                                                } else {
                                                                    await handleSelectedhasilRencek(args.row.rowIndex);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="no_item"
                                                                headerText="No. Barang"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                //autoFit
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="nama_item"
                                                                headerText="Diskripsi"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                //autoFit
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="qty_std"
                                                                headerText="Jumlah Batang"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                template={(props: any) => formatFloat(props.qty_std, 2)}
                                                            />

                                                            <ColumnDirective
                                                                field="total_berat"
                                                                allowEditing={false}
                                                                headerText="Berat (Kg)"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                                template={(props: any) => formatFloat(props.total_berat, 2)}
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="hasil"
                                                                headerText="Proses Timbang"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="50"
                                                                clipMode="EllipsisWithTooltip"
                                                                template={(props: any) => (
                                                                    <span className={props.hasil === 'Y' ? 'checkmark' : 'crossmark'}>
                                                                        {props.hasil === 'Y' ? '✔️' : '❌'} {/* Display checkmark if approval is 'Y' */}
                                                                    </span>
                                                                )}
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="timbang"
                                                                headerText="Hasil Timbang (Kg)"
                                                                // format={formatFloat}
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                //autoFit
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                template={(props: any) => formatFloat(props.timbang, 2)}
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="finalisasi"
                                                                headerText="Final Timbang"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                //autoFit
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                                template={(props: any) => (
                                                                    <span className={props.finalisasi === 'Y' ? 'checkmark' : 'crossmark'}>
                                                                        {props.finalisasi === 'Y' ? '✔️' : '❌'} {/* Display checkmark if approval is 'Y' */}
                                                                    </span>
                                                                )}
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="rencek"
                                                                headerText="Hasil Rencek"
                                                                // format={formatFloat}
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                //autoFit
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                                template={(props: any) => (
                                                                    <span className={props.rencek === 'Y' ? 'checkmark' : 'crossmark'}>
                                                                        {props.rencek === 'Y' ? '✔️' : '❌'} {/* Display checkmark if approval is 'Y' */}
                                                                    </span>
                                                                )}
                                                            />
                                                        </ColumnsDirective>
                                                        {/* <Inject services={[Page, Aggregate, Group]} /> */}
                                                        <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                                    </GridComponent>
                                                </div>

                                                <div className="text-sm font-bold">KETERANGAN KOREKSI</div>
                                                <textarea
                                                    className="h-24 w-full border border-gray-300 p-2"
                                                    name="catatan"
                                                    autoCapitalize="characters"
                                                    // value={rencekState[rowIndexGrid]?.alasan_koreksi}
                                                    value={
                                                        stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                            ? rencekState[0]?.alasan_koreksi ?? ''
                                                            : rencekState[rowIndexGrid]?.alasan_koreksi
                                                    }
                                                    disabled={true}
                                                    // onChange={(args: any) => handleInputChange(args, args.target.name, args.target.value)}
                                                    // disabled={stateDokumen?.CON_BKK === 'PREVIEW_IMAGE' || stateDokumen?.CON_BKK === 'PREVIEW_IMAGE_ORI' ? true : false}
                                                ></textarea>
                                            </div>
                                            <div className="col-span-4 flex flex-col">
                                                <form className="space-y-1">
                                                    {stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? (
                                                        <div className="mt-4 flex items-center">
                                                            <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                                No. Rencek
                                                            </div>
                                                            <TextBoxComponent
                                                                id="noRencek"
                                                                name="noRencek"
                                                                className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                                placeholder="<No. Rencek>"
                                                                disabled={true}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? rencekState[0]?.kode_rencek
                                                                        : rencekState[rowIndexGrid]?.kode_rencek
                                                                }
                                                                // value={
                                                                //     stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                //         ? rencekStateExisting[0]?.kode_rencek
                                                                //         : rencekStateExisting[rowIndexGrid]?.kode_rencek
                                                                // }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {/* <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Kode Rencek sementara
                                                        </div>
                                                        <TextBoxComponent
                                                            id="noRencek"
                                                            name="noRencek"
                                                            className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                            placeholder="<xxxx>"
                                                            disabled={true}
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? rencekState[0]?.kode_rencek
                                                                    : rencekState[rowIndexGrid]?.kode_rencek
                                                            }
                                                            // value={
                                                            //     stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                            //         ? rencekStateExisting[0]?.kode_rencek
                                                            //         : rencekStateExisting[rowIndexGrid]?.kode_rencek
                                                            // }
                                                        />
                                                    </div> */}
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            No. MB
                                                        </div>
                                                        <TextBoxComponent
                                                            id="noMb"
                                                            name="NoMb"
                                                            className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                            placeholder="<No. MB>"
                                                            disabled={true}
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? rencekState[0]?.no_dokumen_reff
                                                                    : rencekState[rowIndexGrid]?.no_dokumen_reff
                                                            }
                                                            // value={
                                                            //     stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                            //         ? rencekStateExisting[0]?.no_dokumen_reff
                                                            //         : rencekStateExisting[rowIndexGrid]?.no_dokumen_reff
                                                            // }
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 w-1/3 text-xs font-bold">Tanggal DO / SJ</div>
                                                        <DatePickerComponent
                                                            locale="tglDo"
                                                            placeholder="Tgl. DO / SJ"
                                                            cssClass="e-custom-style flex-1 border border-gray-300 "
                                                            style={{ border: '1px solid #D1D5DB' }}
                                                            showClearButton={true}
                                                            format="dd-MM-yyyy"
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? moment(rencekState[0]?.tgl_do).toDate()
                                                                    : moment(rencekState[rowIndexGrid]?.tgl_do).toDate()
                                                            }
                                                            // value={
                                                            //     stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                            //         ? moment(rencekStateExisting[0]?.tgl_do).toDate()
                                                            //         : moment(rencekStateExisting[rowIndexGrid]?.tgl_do).toDate()
                                                            // }
                                                            disabled={true}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 w-1/3 text-xs font-bold">{tanggalLabel}</div>
                                                        <DatePickerComponent
                                                            locale="tglSampaiGudang"
                                                            placeholder="Tgl. Sampai Gudang"
                                                            cssClass={colorDate}
                                                            style={{ border: '1px solid #D1D5DB' }}
                                                            format="dd-MM-yyyy"
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? moment(rencekState[0]?.tgl_sampai_gudang).toDate()
                                                                    : moment(rencekState[rowIndexGrid]?.tgl_sampai_gudang).toDate()
                                                            }
                                                            disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                const indexToUpdate = rowIndexGrid; // Specify the index you want to update

                                                                if (args.value) {
                                                                    const selectedDate = moment(args.value);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setRencekState((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_sampai_gudang: index === indexToUpdate ? moment(selectedDate).format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );

                                                                    setRencekStateExisting((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_sampai_gudang: index === indexToUpdate ? moment(selectedDate).format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );
                                                                } else {
                                                                    setRencekState((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_sampai_gudang: index === indexToUpdate ? moment().format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );

                                                                    setRencekStateExisting((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_sampai_gudang: index === indexToUpdate ? moment().format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 w-1/3 text-xs font-bold">Tanggal Barang Selesai di Hitung</div>
                                                        <DatePickerComponent
                                                            locale="tglSelesaiHitung"
                                                            placeholder="Tgl. Selesai Hitung"
                                                            cssClass="e-custom-style flex-1 border border-gray-300 !bg-yellow-200 !p-1"
                                                            style={{ border: '1px solid #D1D5DB' }}
                                                            format="dd-MM-yyyy"
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? moment(rencekState[0]?.tgl_selesai_hitung).toDate()
                                                                    : moment(rencekState[rowIndexGrid]?.tgl_selesai_hitung).toDate()
                                                            }
                                                            disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                const indexToUpdate = rowIndexGrid; // Specify the index you want to update

                                                                if (args.value) {
                                                                    const selectedDate = moment(args.value);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setRencekState((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_selesai_hitung: index === indexToUpdate ? moment(selectedDate).format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );

                                                                    setRencekStateExisting((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_selesai_hitung: index === indexToUpdate ? moment(selectedDate).format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );
                                                                } else {
                                                                    setRencekState((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_selesai_hitung: index === indexToUpdate ? moment().format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );

                                                                    setRencekStateExisting((prevState) =>
                                                                        prevState.map((state, index) => ({
                                                                            ...state,
                                                                            tgl_selesai_hitung: index === indexToUpdate ? moment().format('YYYY-MM-DD HH:mm:ss') : state.tgl_selesai_hitung,
                                                                        }))
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            No. Polisi
                                                        </div>
                                                        <TextBoxComponent
                                                            id="noPol"
                                                            name="noPol"
                                                            className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                            placeholder="<No. Polisi>"
                                                            disabled={true}
                                                            value={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? rencekState[0]?.nopol : rencekState[rowIndexGrid]?.nopol}
                                                        />
                                                    </div>
                                                    {stateDokumen?.jenisPengajuan == 0 && (
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                                Nama Ekspedisi
                                                            </div>
                                                            <TextBoxComponent
                                                                id="edEkspedisi"
                                                                name="edEkspedisi"
                                                                className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                                placeholder="<Nama Ekspedisi>"
                                                                disabled={true}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? rencekState[0]?.nama_ekspedisi
                                                                        : rencekState[rowIndexGrid]?.nama_ekspedisi
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Pabrik Asal
                                                        </div>
                                                        <TextBoxComponent
                                                            id="edPabrik"
                                                            name="edPabrik"
                                                            className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                            placeholder="<Pabrik Asal>"
                                                            disabled={true}
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? rencekState[0]?.pabrik_asal
                                                                    : rencekState[rowIndexGrid]?.pabrik_asal
                                                            }
                                                        />
                                                    </div>
                                                </form>

                                                <div className="mt-1 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                                <form className="space-y-1">
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Nama Barang
                                                        </div>
                                                        <TextBoxComponent
                                                            id="edBarang"
                                                            name="edBarang"
                                                            className="!w-2/3 !flex-1 !border !border-gray-300 !p-1"
                                                            placeholder="<Nama Barang>"
                                                            disabled={true}
                                                            value={
                                                                stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                    ? rencekState[0]?.nama_barang
                                                                    : rencekState[rowIndexGrid]?.nama_barang
                                                            }
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Quantity di SJ
                                                        </div>
                                                        <div className="flex w-full">
                                                            <TextBoxComponent
                                                                id="edQtySj"
                                                                name="edtySj"
                                                                className="!flex-1 !border !border-gray-300 !p-1"
                                                                placeholder="<Quantity di SJ>"
                                                                disabled={true}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.qty_sj)
                                                                        : formatFloat(rencekState[rowIndexGrid]?.qty_sj)
                                                                }
                                                            />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                    </div>
                                                    <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                                    <div className="mt-4 text-sm font-bold">HASIL HITUNG</div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Barang Utuh
                                                        </div>
                                                        <div className="flex w-full">
                                                            {/*

                                                            <TextBoxComponent
                                                                id="qty_utuh"
                                                                name="qty_utuh"
                                                                className="!flex-1 !border !border-gray-300 !bg-yellow-200 !p-1"
                                                                placeholder="<Barang Utuh>"
                                                                showClearButton={true}
                                                                value={String(
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.qty_sj)
                                                                        : formatFloat(rencekState[rowIndexGrid]?.qty_utuh) || 0
                                                                )}
                                                                disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                                // change={handleQtyPatahChange}
                                                                type="number"
                                                                onChange={(args: any) => {
                                                                    // let value = args.target.value.replace(/[^\d.]/g, '');
                                                                    // // Ensure only one decimal point
                                                                    // const parts = value.split('.');
                                                                    // if (parts.length > 2) {
                                                                    //     value = parts[0] + '.' + parts.slice(1).join('');
                                                                    // }
                                                                    handleInputChange(args, args.target.name, args.target.value);
                                                                }}
                                                            />
                                                            */}
                                                            <TextBoxComponent
                                                                id="qty_utuh"
                                                                name="qty_utuh"
                                                                className="!flex-1 !border !border-gray-300 !bg-yellow-200 !p-1"
                                                                placeholder="<Quantity di SJ>"
                                                                // disabled={true}
                                                                disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.qty_utuh)
                                                                        : formatFloat(rencekState[rowIndexGrid]?.qty_utuh)
                                                                }
                                                                onChange={(args: any) => {
                                                                    // handleInputChange(args, args.target.name, args.target.value);
                                                                    const value = args.target.value;
                                                                    // Validate input: only allow numbers and one decimal point
                                                                    if (/^\d*\.?\d*$/.test(value)) {
                                                                        handleInputChange(args, args.target.name, value);
                                                                    }
                                                                }}
                                                                input={(e: any) => {
                                                                    if (!/^[0-9.]$/.test(e.value) || (e.value === '.' && e.value.includes('.'))) {
                                                                        return;
                                                                    }
                                                                }}
                                                                // type="number"
                                                            />

                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Barang Kurang (yang fisiknya tidak ada)
                                                        </div>
                                                        <div className="flex w-full">
                                                            <TextBoxComponent
                                                                id="qty_kurang"
                                                                name="qty_kurang"
                                                                className="!flex-1 !border !border-gray-300 !bg-yellow-200 !p-1"
                                                                placeholder="<Barang Kurang (yang fisiknya tidak ada)>"
                                                                showClearButton={true}
                                                                value={String(
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.qty_kurang) || 0
                                                                        : formatFloat(rencekState[rowIndexGrid]?.qty_kurang) || 0
                                                                )}
                                                                disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                                // change={handleQtyPatahChange}
                                                                type="number"
                                                                onChange={(args: any) => {
                                                                    // let value = args.target.value.replace(/[^\d.]/g, '');

                                                                    // // Ensure only one decimal point
                                                                    // const parts = value.split('.');
                                                                    // if (parts.length > 2) {
                                                                    //     value = parts[0] + '.' + parts.slice(1).join('');
                                                                    // }
                                                                    handleInputChange(args, args.target.name, args.target.value);
                                                                }}
                                                            />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Barang Patah (yang fisiknya kurang dari 12m)
                                                        </div>
                                                        <div className="flex w-full">
                                                            <TextBoxComponent
                                                                id="qty_patah"
                                                                name="qty_patah"
                                                                className="!flex-1 !border !border-gray-300 !bg-yellow-200 !p-1"
                                                                placeholder="<Barang Patah (yang fisiknya kurang dari 12m)>"
                                                                showClearButton={true}
                                                                value={String(
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.qty_patah) || 0
                                                                        : formatFloat(rencekState[rowIndexGrid]?.qty_patah) || 0
                                                                )}
                                                                disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                                // change={handleQtyPatahChange}
                                                                // change={(args: any) => handleQtyPatahChange2(args.target.name, args.target.value)}
                                                                type="number"
                                                                onChange={(args: any) => {
                                                                    // let value = args.target.value.replace(/[^\d.]/g, '');

                                                                    // // Ensure only one decimal point
                                                                    // const parts = value.split('.');
                                                                    // if (parts.length > 2) {
                                                                    //     value = parts[0] + '.' + parts.slice(1).join('');
                                                                    // }
                                                                    handleInputChange(args, args.target.name, args.target.value);
                                                                }}
                                                            />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="col-span-3">
                                                <div className="text-sm font-bold">Barang Patah (yang fisiknya kurang dari 12m) Terdiri dari :</div>
                                                <div className="text-xs italic">(Isi kolom dibawah dalam satuan meter)</div>
                                                <div id="brokenGrid">
                                                    <GridComponent
                                                        id="dgPatah"
                                                        locale="id"
                                                        ref={(g: any) => (dgPatah = g)}
                                                        editSettings={{
                                                            allowAdding: true, //tambah == true ? true : false,
                                                            allowEditing: stateDokumen?.jenisPengajuan === '2' ? true : false,
                                                            allowDeleting: true,
                                                            newRowPosition: 'Bottom',
                                                        }}
                                                        selectionSettings={{
                                                            mode: 'Row',
                                                            type: 'Single',
                                                        }}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        rowHeight={22}
                                                        width={'100%'}
                                                        height={245}
                                                        gridLines={'Both'}
                                                        disabled={stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1 ? true : false}
                                                        actionComplete={actionCompleteGridDetail}
                                                        rowSelecting={rowSelectingGridDetail}
                                                        aggregates={[
                                                            {
                                                                columns: [
                                                                    {
                                                                        type: 'Sum',
                                                                        field: 'panjang_patah',
                                                                        format: 'N2',
                                                                        footerTemplate: (props: any) => {
                                                                            return <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>;
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        ]}
                                                        rowSelected={(args: any) => {
                                                            // Get selected record using getSelectedRecords
                                                            const selectedRecords = dgPatah.getSelectedRecords();
                                                            const selectedData = selectedRecords && selectedRecords.length > 0 ? selectedRecords[0] : null;

                                                            if (selectedData) {
                                                                setSelectedRowDataPatah(selectedData);
                                                                setIndexGridDgPatah(args.rowIndex);
                                                                setSelectedPatahRows((prev) => [...prev, args.rowIndex]);
                                                            }
                                                        }}
                                                        // rowDeselected={(args: any) => {
                                                        //     setSelectedPatahRows((prev) => prev.filter((index) => index !== args.rowIndex));
                                                        // }}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="kode_rencek"
                                                                headerText="Kode Rencek"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip"
                                                            />

                                                            <ColumnDirective
                                                                allowEditing={false}
                                                                field="id_patah"
                                                                headerText="ID Patah"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="50"
                                                                clipMode="EllipsisWithTooltip"
                                                            />

                                                            <ColumnDirective
                                                                // allowEditing={
                                                                //     stateDokumen?.masterDataState === 'BARU'
                                                                //         ? fpmbState[0]?.pengajuan == '1'
                                                                //         : fpmbState[0]?.pengajuan == '1' || stateDokumen?.masterDataState === 'BARU'
                                                                //         ? fpmbState[0]?.pengajuan == '2'
                                                                //         : fpmbState[0]?.pengajuan == '2'
                                                                // }
                                                                allowEditing={
                                                                    stateDokumen?.masterDataState === 'BARU'
                                                                        ? fpmbState[0]?.jenis_pengajuan == '2'
                                                                        : fpmbState[0]?.jenis_pengajuan == '2' || stateDokumen?.masterDataState === 'EDIT'
                                                                }
                                                                field="panjang_patah"
                                                                headerText="Panjang Patah (m)"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        </ColumnsDirective>

                                                        <Inject services={[Page, Aggregate, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                                    </GridComponent>
                                                </div>
                                                <div style={{ padding: 2 }} className="panel-pager mb-1">
                                                    <div className="mt-1 flex">
                                                        <ButtonComponent
                                                            id="buAdd1"
                                                            type="button"
                                                            cssClass="e-primary e-small"
                                                            iconCss="e-icons e-small e-plus"
                                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                            onClick={() => handleDetailBaru('new')}
                                                            disabled={stateDokumen?.jenisPengajuan == 2 ? false : true}
                                                        />
                                                        <ButtonComponent
                                                            id="buDelete1"
                                                            type="button"
                                                            cssClass="e-warning e-small"
                                                            iconCss="e-icons e-small e-trash"
                                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                            disabled={stateDokumen?.jenisPengajuan == 2 ? false : true}
                                                            onClick={handleDeletePatah}
                                                        />
                                                        <ButtonComponent
                                                            id="buDeleteAll1"
                                                            type="button"
                                                            cssClass="e-danger e-small"
                                                            iconCss="e-icons e-small e-erase"
                                                            style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                            disabled={stateDokumen?.jenisPengajuan == 2 ? false : true}
                                                            onClick={handleDeleteAllPatah}
                                                        />
                                                    </div>
                                                </div>
                                                <form className="mt-2 space-y-1">
                                                    <div className="flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Total Panjang Patahan
                                                        </div>
                                                        <div className="flex w-full">
                                                            <TextBoxComponent
                                                                id="edTotPatahan"
                                                                name="edTotPatahan"
                                                                className="!flex-1 !border !border-gray-300 !p-1"
                                                                placeholder="<Total Panjang Patahan>"
                                                                disabled={true}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.tot_qty_panjang) || ''
                                                                        : formatFloat(rencekState[rowIndexGrid]?.tot_qty_panjang) || ''
                                                                }
                                                            />
                                                            <span className="ml-1 self-center">m</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="mr-2 text-xs font-bold" style={{ width: '52.25%' }}>
                                                            Total Barang Patah
                                                        </div>
                                                        <div className="flex w-full">
                                                            <TextBoxComponent
                                                                id="edTotQtyPatahan"
                                                                name="edTotQtyPatahan"
                                                                className="!flex-1 !border !border-gray-300 !p-1"
                                                                placeholder="<Total Barang Patah>"
                                                                disabled={true}
                                                                value={
                                                                    stateDokumen?.jenisPengajuan == 0 || stateDokumen?.jenisPengajuan == 1
                                                                        ? formatFloat(rencekState[0]?.tot_qty_panjang_bagi12) || ''
                                                                        : formatFloat(rencekState[rowIndexGrid]?.tot_qty_panjang_bagi12) || ''
                                                                }
                                                            />
                                                            <span className="ml-1 self-center">Batang (total panjang dibagi 12)</span>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${activeTab === 'file_pendukung' ? 'block' : 'hidden'}`}>
                                    <div>
                                        <div className="mt-4">
                                            {/* tombol gambar */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-end',
                                                    // position: 'fixed',
                                                    zIndex: 1000, // zIndex untuk bisa diklik
                                                    // right: 0,
                                                    // backgroundColor: '#F2FDF8',
                                                    position: 'absolute',
                                                    // bottom: 0,
                                                    right: 0,
                                                    borderBottomLeftRadius: '6px',
                                                    borderBottomRightRadius: '6px',
                                                    // width: '100%',
                                                    // height: '55px',
                                                    // display: 'inline-block',
                                                    overflowX: 'scroll',
                                                    overflowY: 'hidden',
                                                    scrollbarWidth: 'none',
                                                    // border: '1px solid',
                                                    marginRight: 10,
                                                }}
                                            >
                                                <ButtonComponent
                                                    id="clean"
                                                    content="Hapus Gambar"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-trash"
                                                    style={{ width: '190px', marginRight: 2, backgroundColor: '#3b3f5c' }}
                                                    onClick={() => {
                                                        // handleRemove(imageState.selectedHead, imageState, setImageState); xx
                                                        handleRemoveImage(objekImage?.selectedHead, objekImage, setObjekImage);
                                                    }}
                                                />
                                                <ButtonComponent
                                                    id="cleanall"
                                                    content="Bersihkan Semua Gambar"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-erase"
                                                    style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                                    onClick={() => {
                                                        // handleRemove('all', imageState, setImageState); xx
                                                        handleRemoveImage('all', objekImage, setObjekImage);
                                                    }}
                                                />
                                                <ButtonComponent
                                                    id="savefile"
                                                    content="Simpan ke File"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-download"
                                                    style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                                    onClick={() => {
                                                        handleDownloadImage(objekImage?.selectedHead);
                                                    }}
                                                />
                                                <ButtonComponent
                                                    id="preview"
                                                    content="Preview"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-image"
                                                    style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                                    onClick={() => {
                                                        handlePreviewImage('open');
                                                    }}
                                                />
                                                {modalPreview && imageSrc && (
                                                    <div
                                                        style={{
                                                            position: 'fixed',
                                                            top: '0',
                                                            left: '0',
                                                            width: '100vw',
                                                            height: '100vh',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: '1000',
                                                            overflow: 'hidden',
                                                        }}
                                                        // onClick={() => setModalPreview(false)}
                                                    >
                                                        <div
                                                            style={{
                                                                position: 'relative',
                                                                textAlign: 'center',
                                                                zIndex: '1001',
                                                                cursor: 'grab',
                                                                transform: `translate(${translate.x}px, ${translate.y}px)`,
                                                                transition: isDragging ? 'none' : 'transform 0.1s ease',
                                                            }}
                                                            onMouseDown={handleMouseDown}
                                                            onMouseUp={handleMouseUp}
                                                            onWheel={handleWheel}
                                                        >
                                                            {objekImage?.preview3 ? (
                                                                <video
                                                                    src={objekImage?.preview3}
                                                                    style={{ width: '100%', height: '300px' }}
                                                                    // style={{
                                                                    //     transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                                                    //     transition: 'transform 0.1s ease',
                                                                    //     cursor: 'pointer',
                                                                    //     maxWidth: '100vw',
                                                                    //     maxHeight: '100vh',
                                                                    // }}
                                                                    // onMouseDown={handleMouseDown}
                                                                    // onMouseUp={handleMouseUp}
                                                                    controls
                                                                    width={500}
                                                                />
                                                            ) : (
                                                                <Image
                                                                    src={
                                                                        objekImage?.selectedHead === '1'
                                                                            ? objekImage?.preview
                                                                            : objekImage?.selectedHead === '2'
                                                                            ? objekImage?.preview2
                                                                            : // : objekImage?.selectedHead === '3'
                                                                              // ? objekImage?.preview3
                                                                              // : objekImage?.selectedHead === '4'
                                                                              null
                                                                    }
                                                                    style={{
                                                                        transform: `scale(${zoomLevel})`,
                                                                        transition: 'transform 0.1s ease',
                                                                        cursor: 'pointer',
                                                                        maxWidth: '100vw',
                                                                        maxHeight: '100vh',
                                                                        width: '100%',
                                                                        height: '300px',
                                                                    }}
                                                                    className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                    onMouseDown={handleMouseDown}
                                                                    onMouseUp={handleMouseUp}
                                                                    alt="Large Image"
                                                                    width={300}
                                                                    height={300}
                                                                />
                                                            )}
                                                        </div>
                                                        <div
                                                            style={{
                                                                position: 'fixed',
                                                                top: '10px',
                                                                right: '10px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                zIndex: '1001',
                                                            }}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faSearchMinus}
                                                                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                                                                style={{
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '24px',
                                                                }}
                                                                width={24}
                                                                height={24}
                                                            />
                                                            <FontAwesomeIcon
                                                                icon={faSearchPlus}
                                                                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 6))}
                                                                style={{
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '24px',
                                                                }}
                                                                width={24}
                                                                height={24}
                                                            />
                                                            <FontAwesomeIcon
                                                                icon={faTimes}
                                                                onClick={() => {
                                                                    handlePreviewImage('close');
                                                                    setZoomLevel(1);
                                                                    setTranslate({ x: 0, y: 0 });
                                                                }}
                                                                style={{
                                                                    color: 'white',
                                                                    cursor: 'pointer',
                                                                    fontSize: '24px',
                                                                }}
                                                                width={24}
                                                                height={24}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* tab gambar */}
                                            <TabComponent
                                                // ref={(t) => (tabTtbList = t)}
                                                selectedItem={0}
                                                animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                                height="100%"
                                                style={{ marginTop: -10, fontSize: 12 }}
                                            >
                                                {/* header */}
                                                <div className="e-tab-header" style={{ display: 'flex' }}>
                                                    <button
                                                        tabIndex={0}
                                                        onClick={() => {
                                                            setObjekImage((prevData: any) => ({
                                                                ...prevData,
                                                                selectedHead: '1',
                                                            }));
                                                        }}
                                                        style={{
                                                            marginTop: 10,
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer',
                                                            borderBottom: '3px solid transparent',
                                                        }}
                                                    >
                                                        Surat Jalan (SJ)
                                                    </button>
                                                    <button
                                                        tabIndex={1}
                                                        onClick={async () => {
                                                            setObjekImage([
                                                                {
                                                                    ...objekImage,
                                                                    selectedHead: '2',
                                                                },
                                                            ]);
                                                        }}
                                                        style={{
                                                            marginTop: 10,
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer',
                                                            borderBottom: '3px solid transparent',
                                                        }}
                                                    >
                                                        Foto Barang
                                                    </button>
                                                    <button
                                                        tabIndex={2}
                                                        onClick={async () => {
                                                            setObjekImage({
                                                                ...objekImage,
                                                                selectedHead: '3',
                                                            });
                                                        }}
                                                        style={{
                                                            marginTop: 10,
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer',
                                                            borderBottom: '3px solid transparent',
                                                        }}
                                                    >
                                                        Video Barang
                                                    </button>
                                                </div>

                                                {/* konten tab */}
                                                <div className="e-content">
                                                    {/* //SJ */}
                                                    <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                        <div style={{ display: 'flex' }}>
                                                            <div style={{ width: 400 }}>
                                                                <UploaderComponent
                                                                    id="previewfileupload1"
                                                                    type="file"
                                                                    ref={uploaderRef}
                                                                    multiple={false}
                                                                    selected={async (e: any) => {
                                                                        // await handleFileSelect(e, '1');
                                                                        await handleFileImageSelect(e, '1', objekImage, setObjekImage);

                                                                        // setStateUploader(uploaderRef.current);
                                                                        // setUploaderInstance(uploaderRef.current);
                                                                        // await handleFileImageSelect(e, '1');
                                                                    }}
                                                                    removing={() => handleRemoveImage('1', objekImage, setObjekImage)}
                                                                />
                                                            </div>

                                                            {objekImage?.preview && (
                                                                <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                                    <Image src={objekImage?.preview} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} />
                                                                    {/* <img src={preview} alt="File preview" style={{ maxWidth: '100%', maxHeight: '300px' }} /> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* //FOTO BARANG */}
                                                    <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                        <div style={{ display: 'flex' }}>
                                                            <div style={{ width: 400 }}>
                                                                <UploaderComponent
                                                                    id="previewfileupload2"
                                                                    type="file"
                                                                    ref={uploaderRef2}
                                                                    // asyncSettings={path}
                                                                    // autoUpload={false}
                                                                    multiple={false}
                                                                    // selected={(e) => handleFileSelect(e, '2', imageState, setImageState)}
                                                                    // removing={() => handleRemove('2', imageState, setImageState)}
                                                                    selected={async (e) => {
                                                                        // setTag('2');
                                                                        await handleFileImageSelect(e, '2', objekImage, setObjekImage);

                                                                        // await handleFileImageSelect(e, '2');
                                                                    }}
                                                                    removing={() => handleRemoveImage('2', objekImage, setObjekImage)}
                                                                />
                                                            </div>

                                                            {objekImage?.preview2 && (
                                                                <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                                    <Image src={objekImage?.preview2} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} />
                                                                    {/* <img src={preview} alt="File preview" style={{ maxWidth: '100%', maxHeight: '300px' }} /> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* //VIDEO */}
                                                    <div tabIndex={2} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                                        <div style={{ display: 'flex' }}>
                                                            <div style={{ width: 400 }}>
                                                                <UploaderComponent
                                                                    id="previewfileupload3"
                                                                    type="file"
                                                                    ref={uploaderRef3}
                                                                    // asyncSettings={path}
                                                                    // autoUpload={false}
                                                                    multiple={false}
                                                                    // selected={(e) => handleFileSelect(e, '3', imageState, setImageState)}
                                                                    // removing={() => handleRemove('3', imageState, setImageState)}
                                                                    selected={async (e) => {
                                                                        // setTag('3');
                                                                        await handleFileImageSelect(e, '3', objekImage, setObjekImage);
                                                                        // await handleFileImageSelect(e, '3');
                                                                    }}
                                                                    removing={() => handleRemoveImage('3', objekImage, setObjekImage)}
                                                                />
                                                            </div>

                                                            {objekImage?.preview3 && (
                                                                <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                                    <video
                                                                        src={objekImage?.preview3}
                                                                        style={{ width: '100%', height: '300px' }}
                                                                        // style={{
                                                                        //     transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                                                        //     transition: 'transform 0.1s ease',
                                                                        //     cursor: 'pointer',
                                                                        //     maxWidth: '100vw',
                                                                        //     maxHeight: '100vh',
                                                                        // }}
                                                                        // onMouseDown={handleMouseDown}
                                                                        // onMouseUp={handleMouseUp}
                                                                        controls
                                                                        width={500}
                                                                        height={500}
                                                                    />

                                                                    {/* <Image src={objekImage?.preview3} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} /> */}
                                                                    {/* <img src={preview} alt="File preview" style={{ maxWidth: '100%', maxHeight: '300px' }} /> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabComponent>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${activeTab === 'file_pendukung_2' ? 'block' : 'hidden'}`}>
                                    <div>
                                        <div className="mt-4">
                                            {/* header */}
                                            <div className="flex h-[5%] overflow-auto">
                                                <div className=" flex border-b border-gray-300">
                                                    <button
                                                        onClick={() => {
                                                            setActiveTabSub('Surat Jalan');
                                                            setObjekImage((prevData: any) => ({
                                                                ...prevData,
                                                                selectedHead: '1',
                                                            }));
                                                        }}
                                                        className={`px-3 py-2 text-xs font-semibold ${
                                                            activeTabSub === 'Surat Jalan' ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500 hover:text-black'
                                                        }`}
                                                    >
                                                        Surat Jalan (SJ)
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setActiveTabSub('Foto Barang');
                                                            setObjekImage((prevData: any) => ({
                                                                ...prevData,
                                                                selectedHead: '2',
                                                            }));
                                                        }}
                                                        // disabled={true}
                                                        className={`px-3 py-2 text-xs font-semibold  ${
                                                            activeTabSub === 'Foto Barang' ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500 hover:text-black'
                                                        }`}
                                                    >
                                                        Foto Barang
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setActiveTabSub('Video Barang');
                                                            setObjekImage({
                                                                ...objekImage,
                                                                selectedHead: '3',
                                                            });
                                                        }}
                                                        // disabled={stateDokumen?.jenisPengajuan == 2 ? true : false}
                                                        className={`px-3 py-2 text-xs font-semibold ${
                                                            activeTabSub === 'Video Barang' ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500 hover:text-black'
                                                        }`}
                                                    >
                                                        Video Barang
                                                    </button>
                                                </div>
                                            </div>

                                            {/* konten tab */}
                                            <div className="e-content">
                                                {/* //SJ */}
                                                <div className={`${activeTabSub === 'Surat Jalan' ? 'block' : 'hidden'}`}>
                                                    <div className="flex">
                                                        <div style={{ width: '28%' }}>
                                                            <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung (Surat Jalan) :</label>
                                                            <div
                                                                className="border p-3"
                                                                style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '209px', marginLeft: '10px', overflowY: 'scroll' }}
                                                            >
                                                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                                    {xFiles
                                                                        .filter((item) => item.dokumen === 'RC1' && item.deleted === false)
                                                                        .map((file, index) => {
                                                                            return (
                                                                                <li key={file.idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '5px 0' }}>
                                                                                    <span style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{index + 1} |</span>
                                                                                    <span
                                                                                        style={{
                                                                                            flex: 1,
                                                                                            marginLeft: '10px',
                                                                                            whiteSpace: 'nowrap',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            fontWeight: 'bold',
                                                                                        }}
                                                                                    >
                                                                                        {/* {stateDokumen?.masterDataState === 'Baru' ? file?.name : file?.filegambar} */}
                                                                                        {/* {file.name} */}
                                                                                        {file.originalName}
                                                                                    </span>

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
                                                                                            onClick={() => {
                                                                                                clearFile(file.idx);
                                                                                            }}
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
                                                                                            onClick={() => {
                                                                                                handleFileClick(file, file.name, xFiles[index], xFiles[index].idx);
                                                                                            }}
                                                                                        />
                                                                                    </TooltipComponent>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div style={{ width: '2%' }}></div>
                                                        <div style={{ width: '48%', marginTop: '25px' }}>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf,.xls,.xlsx,.rar"
                                                                style={{ display: 'none' }}
                                                                onChange={handleFileUpload}
                                                                multiple
                                                                id="fileInputSj"
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => document.getElementById('fileInputSj')!.click()}
                                                                disabled={!buGetFileEnabled}
                                                            >
                                                                Ambil File
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => clearAllFiles()}
                                                                disabled={!buDelFileEnabled}
                                                            >
                                                                Hapus Semua File
                                                            </button>
                                                        </div>
                                                        {objekImage?.isOpenPreview && (
                                                            <div
                                                                style={{
                                                                    position: 'fixed',
                                                                    top: '0',
                                                                    left: '0',
                                                                    width: '100vw',
                                                                    height: '100vh',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    zIndex: '1000',
                                                                    overflow: 'hidden',
                                                                }}
                                                                // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                                                            >
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        textAlign: 'center',
                                                                        zIndex: '1001',
                                                                        cursor: 'grab',
                                                                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                                                                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                                                                    }}
                                                                    onMouseDown={handleMouseDown}
                                                                    onMouseUp={handleMouseUp}
                                                                    onWheel={handleWheel}
                                                                >
                                                                    {objekImage?.imageDataUrl?.startsWith('data:video/') ||
                                                                    !['jpg', 'jpeg', 'png', 'webp', 'zip'].includes(objekImage?.indexPreview.split('.').pop()) ? (
                                                                        // {xFiles.some(
                                                                        //     (file: any) =>
                                                                        //         file.imageDataUrl.startsWith('data:video/') ||
                                                                        //         !['jpg', 'jpeg', 'png', 'webp', 'zip'].includes(file.indexPreview.split('.').pop())
                                                                        // )
                                                                        <video
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            // onMouseDown={handleMouseDown}
                                                                            // onMouseUp={handleMouseUp}
                                                                            // // alt="Large Image"
                                                                            // alt={`${objekImage?.indexPreview}`}
                                                                            controls
                                                                        >
                                                                            <source src={objekImage?.imageDataUrl} />
                                                                        </video>
                                                                    ) : (
                                                                        <Image
                                                                            src={objekImage?.imageDataUrl}
                                                                            style={{
                                                                                transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                                                                                transition: 'transform 0.1s ease',
                                                                                cursor: 'pointer',
                                                                                maxWidth: '100vw',
                                                                                maxHeight: '100vh',
                                                                                width: '100%',
                                                                                height: '300px',
                                                                            }}
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            onMouseDown={handleMouseDown}
                                                                            onMouseUp={handleMouseUp}
                                                                            // alt="Large Image"
                                                                            alt={`${objekImage?.indexPreview}`}
                                                                            width={300}
                                                                            height={300}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        position: 'fixed',
                                                                        top: '10px',
                                                                        right: '10px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        zIndex: '1001',
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchMinus}
                                                                        onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchPlus}
                                                                        onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 6))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faRotateLeft}
                                                                        onClick={handleRotateLeft}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faRotateRight}
                                                                        onClick={handleRotateRight}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        onClick={() => {
                                                                            handlePreviewImage('close');
                                                                            setZoomLevel(1);
                                                                            setTranslate({ x: 0, y: 0 });
                                                                            HandleCloseZoom(setObjekImage);
                                                                        }}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* END OBJECT PREVIEW 1 */}
                                                    </div>
                                                </div>

                                                {/* //Foto Barang */}
                                                <div className={`${activeTabSub === 'Foto Barang' ? 'block' : 'hidden'}`}>
                                                    <div className="flex">
                                                        <div style={{ width: '28%' }}>
                                                            <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung (Foto Barang) :</label>
                                                            <div
                                                                className="border p-3"
                                                                style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '209px', marginLeft: '10px', overflowY: 'scroll' }}
                                                            >
                                                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                                    {xFiles
                                                                        .filter((item) => item.dokumen === 'RC2' && item.deleted === false)
                                                                        .map((file, index) => {
                                                                            return (
                                                                                <li key={file.idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '5px 0' }}>
                                                                                    <span style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{index + 1} |</span>
                                                                                    <span
                                                                                        style={{
                                                                                            flex: 1,
                                                                                            marginLeft: '10px',
                                                                                            whiteSpace: 'nowrap',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            fontWeight: 'bold',
                                                                                        }}
                                                                                    >
                                                                                        {/* {stateDokumen?.masterDataState === 'Baru' ? file?.name : file?.filegambar} */}
                                                                                        {/* {file.name} */}
                                                                                        {file.originalName}
                                                                                    </span>

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
                                                                                            onClick={() => {
                                                                                                clearFile(file.idx);
                                                                                            }}
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
                                                                                            onClick={() => {
                                                                                                handleFileClick(file, file.name, xFiles[index], xFiles[index].idx);
                                                                                            }}
                                                                                        />
                                                                                    </TooltipComponent>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div style={{ width: '2%' }}></div>
                                                        <div style={{ width: '48%', marginTop: '25px' }}>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf,.xls,.xlsx,.rar"
                                                                style={{ display: 'none' }}
                                                                onChange={handleFileUpload}
                                                                multiple
                                                                id="fileInputFotoBarang"
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => document.getElementById('fileInputFotoBarang')!.click()}
                                                                disabled={!buGetFileEnabled}
                                                            >
                                                                Ambil File
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => clearAllFiles()}
                                                                // onClick={() => handleUpload('RE0000000084')}
                                                                disabled={!buDelFileEnabled}
                                                            >
                                                                Hapus Semua File
                                                            </button>
                                                        </div>
                                                        {objekImage?.isOpenPreview && (
                                                            <div
                                                                style={{
                                                                    position: 'fixed',
                                                                    top: '0',
                                                                    left: '0',
                                                                    width: '100vw',
                                                                    height: '100vh',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    zIndex: '1000',
                                                                    overflow: 'hidden',
                                                                }}
                                                                // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                                                            >
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        textAlign: 'center',
                                                                        zIndex: '1001',
                                                                        cursor: 'grab',
                                                                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                                                                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                                                                    }}
                                                                    onMouseDown={handleMouseDown}
                                                                    onMouseUp={handleMouseUp}
                                                                    onWheel={handleWheel}
                                                                >
                                                                    {objekImage?.imageDataUrl?.startsWith('data:video/') ||
                                                                    !['jpg', 'jpeg', 'png', 'webp', 'zip'].includes(objekImage?.indexPreview.split('.').pop()) ? (
                                                                        <video
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            // onMouseDown={handleMouseDown}
                                                                            // onMouseUp={handleMouseUp}
                                                                            // // alt="Large Image"
                                                                            // alt={`${objekImage?.indexPreview}`}
                                                                            controls
                                                                        >
                                                                            <source src={objekImage?.imageDataUrl} />
                                                                        </video>
                                                                    ) : (
                                                                        <Image
                                                                            src={objekImage?.imageDataUrl}
                                                                            style={{
                                                                                transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                                                                                transition: 'transform 0.1s ease',
                                                                                cursor: 'pointer',
                                                                                maxWidth: '100vw',
                                                                                maxHeight: '100vh',
                                                                                width: '100%',
                                                                                height: '300px',
                                                                            }}
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            onMouseDown={handleMouseDown}
                                                                            onMouseUp={handleMouseUp}
                                                                            // alt="Large Image"
                                                                            alt={`${objekImage?.indexPreview}`}
                                                                            width={300}
                                                                            height={300}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        position: 'fixed',
                                                                        top: '10px',
                                                                        right: '10px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        zIndex: '1001',
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchMinus}
                                                                        onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchPlus}
                                                                        onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 6))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faRotateLeft}
                                                                        onClick={handleRotateLeft}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faRotateRight}
                                                                        onClick={handleRotateRight}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        onClick={() => {
                                                                            handlePreviewImage('close');
                                                                            setZoomLevel(1);
                                                                            setTranslate({ x: 0, y: 0 });
                                                                            HandleCloseZoom(setObjekImage);
                                                                        }}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* END OBJECT PREVIEW 1 */}
                                                    </div>
                                                </div>

                                                {/* Video Barang */}
                                                <div className={`${activeTabSub === 'Video Barang' ? 'block' : 'hidden'}`}>
                                                    <div className="flex">
                                                        <div style={{ width: '28%' }}>
                                                            <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung (Video Barang) :</label>
                                                            <div
                                                                className="border p-3"
                                                                style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '209px', marginLeft: '10px', overflowY: 'scroll' }}
                                                            >
                                                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                                    {xFiles
                                                                        .filter((item) => item.dokumen === 'RC3' && item.deleted === false)
                                                                        .map((file, index) => {
                                                                            return (
                                                                                // <li key={index} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '5px 0' }}>
                                                                                <li key={file.idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '5px 0' }}>
                                                                                    <span style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{index + 1} |</span>
                                                                                    <span
                                                                                        style={{
                                                                                            flex: 1,
                                                                                            marginLeft: '10px',
                                                                                            whiteSpace: 'nowrap',
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            fontWeight: 'bold',
                                                                                        }}
                                                                                    >
                                                                                        {/* {stateDokumen?.masterDataState === 'Baru' ? file?.name : file?.filegambar} */}
                                                                                        {/* {file.name} */}
                                                                                        {file.originalName}
                                                                                    </span>

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
                                                                                            onClick={() => {
                                                                                                clearFile(file.idx);
                                                                                            }}
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
                                                                                            onClick={() => {
                                                                                                handleFileClick(file, file.name, xFiles[index], xFiles[index].idx);
                                                                                            }}
                                                                                        />
                                                                                    </TooltipComponent>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div style={{ width: '2%' }}></div>
                                                        <div style={{ width: '48%', marginTop: '25px' }}>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf,.xls,.xlsx,.rar"
                                                                style={{ display: 'none' }}
                                                                onChange={handleFileUpload}
                                                                multiple
                                                                id="fileInputVideoBarang"
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => document.getElementById('fileInputVideoBarang')!.click()}
                                                                disabled={!buGetFileEnabled}
                                                            >
                                                                Ambil File
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="btn mb-2 h-[4.5vh]"
                                                                style={{
                                                                    backgroundColor: '#3b3f5c',
                                                                    color: 'white',
                                                                    width: '17%',
                                                                    height: '13%',
                                                                    marginTop: -7,
                                                                    borderRadius: '5px',
                                                                    fontSize: '11px',
                                                                }}
                                                                onClick={() => clearAllFiles()}
                                                                // onClick={() => handleUpload('RE0000000084')}
                                                                disabled={!buDelFileEnabled}
                                                            >
                                                                Hapus Semua File
                                                            </button>
                                                        </div>
                                                        {objekImage?.isOpenPreview && (
                                                            <div
                                                                style={{
                                                                    position: 'fixed',
                                                                    top: '0',
                                                                    left: '0',
                                                                    width: '100vw',
                                                                    height: '100vh',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    zIndex: '1000',
                                                                    overflow: 'hidden',
                                                                }}
                                                                // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                                                            >
                                                                <div
                                                                    style={{
                                                                        position: 'relative',
                                                                        textAlign: 'center',
                                                                        zIndex: '1001',
                                                                        cursor: 'grab',
                                                                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                                                                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                                                                    }}
                                                                    onMouseDown={handleMouseDown}
                                                                    onMouseUp={handleMouseUp}
                                                                    onWheel={handleWheel}
                                                                >
                                                                    {objekImage?.imageDataUrl?.startsWith('data:video/') ||
                                                                    !['jpg', 'jpeg', 'png', 'webp', 'zip'].includes(objekImage?.indexPreview.split('.').pop()) ? (
                                                                        <video
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            // onMouseDown={handleMouseDown}
                                                                            // onMouseUp={handleMouseUp}
                                                                            // // alt="Large Image"
                                                                            // alt={`${objekImage?.indexPreview}`}
                                                                            controls
                                                                        >
                                                                            <source src={objekImage?.imageDataUrl} />
                                                                        </video>
                                                                    ) : (
                                                                        <Image
                                                                            src={objekImage?.imageDataUrl}
                                                                            style={{
                                                                                transform: `rotate(${rotationAngle}deg) scale(${zoomLevel})`,
                                                                                transition: 'transform 0.1s ease',
                                                                                cursor: 'pointer',
                                                                                maxWidth: '100vw',
                                                                                maxHeight: '100vh',
                                                                                width: '100%',
                                                                                height: '300px',
                                                                            }}
                                                                            className={zoomLevel === 2 ? 'zoomed' : ''}
                                                                            onMouseDown={handleMouseDown}
                                                                            onMouseUp={handleMouseUp}
                                                                            // alt="Large Image"
                                                                            alt={`${objekImage?.indexPreview}`}
                                                                            width={300}
                                                                            height={300}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        position: 'fixed',
                                                                        top: '10px',
                                                                        right: '10px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        zIndex: '1001',
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchMinus}
                                                                        onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faSearchPlus}
                                                                        onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 6))}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faTimes}
                                                                        onClick={() => {
                                                                            handlePreviewImage('close');
                                                                            setZoomLevel(1);
                                                                            setTranslate({ x: 0, y: 0 });
                                                                            HandleCloseZoom(setObjekImage);
                                                                        }}
                                                                        style={{
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            fontSize: '24px',
                                                                        }}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* END OBJECT PREVIEW 1 */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${activeTab === 'hasil_timbang' ? 'block' : 'hidden'}`}>
                                    <div>
                                        <div id="brokenGrid">
                                            <GridComponent
                                                id="dgDetailHasilTimbang"
                                                locale="id"
                                                // ref={(g: any) => (dgDetailHasilTimbang = g)}
                                                ref={dgDetailHasilTimbang}
                                                dataSource={listTimbang || []}
                                                allowPaging={true}
                                                allowGrouping={true}
                                                groupSettings={groupOptions}
                                                height={268}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="nama_item"
                                                        headerText="Nama Barang"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="200"
                                                        clipMode="EllipsisWithTooltip"
                                                    />

                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="kode_ikat"
                                                        headerText="Kode Ikat"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />

                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="kuantitas"
                                                        headerText="Kuantitas"
                                                        headerTextAlign="Right"
                                                        // format=(formatFloat)
                                                        template={(props: any) => formatFloat(props.kuantitas, 2)}
                                                        textAlign="Right"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="berat"
                                                        headerText="Berat"
                                                        headerTextAlign="Right"
                                                        template={(props: any) => formatFloat(props.berat, 2)}
                                                        textAlign="Right"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="tgl_timbang"
                                                        headerText="Tanggal"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                        // template={(props: any) => formatDate(props.tgl_timbang)}
                                                    />
                                                    <ColumnDirective
                                                        allowEditing={false}
                                                        field="jam"
                                                        headerText="Jam"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                </ColumnsDirective>
                                                <AggregatesDirective>
                                                    <AggregateDirective>
                                                        <AggregateColumnsDirective>
                                                            <AggregateColumnDirective field="kuantitas" type="Sum" format="N0" groupFooterTemplate={footerSum} />
                                                            <AggregateColumnDirective field="berat" type="Sum" format="N0" groupFooterTemplate={footerBerat} />
                                                        </AggregateColumnsDirective>
                                                    </AggregateDirective>
                                                </AggregatesDirective>

                                                <Inject services={[Page, Aggregate, Group]} />
                                                {/* <Inject services={[Page, Group, Aggregate, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} /> */}
                                            </GridComponent>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-2 mt-1 flex-1" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 10 }}>
                            <div className="space-x-2">
                                <ButtonComponent
                                    id="buBatal"
                                    // className="p-2 text-white"
                                    content="Tutup"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-close"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={() => dialogClose()}
                                />
                                {stateDokumen?.jenisPengajuan != 2 && (
                                    <ButtonComponent
                                        id="buKoreksi"
                                        content="Koreksi"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-edit"
                                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                        onClick={async () => {
                                            setBuKoreksi('koreksi');
                                            setDlgAlasan(true);
                                            // await saveDoc();
                                        }}
                                        disabled={buKoreksiDisabled}
                                        // disabled={stateDokumen?.masterDataState === 'BARU' || stateDokumen?.masterDataState === 'EDIT' ? true : false}
                                        // disabled={
                                        //     stateDokumen?.updateFilePendukung === 0 || stateDokumen?.statusApp === 'Y' || stateDokumen?.pAppFPMB === 'UnApproval' || stateDokumen?.pAppFPMB === 'Approval'
                                        // }
                                    />
                                )}
                                <ButtonComponent
                                    id="buSimpan"
                                    content="Simpan"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-save"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={async () => {
                                        // await handleUpload('RC0000001224');
                                        if (stateDokumen?.masterDataState === 'UNAPPROVAL') {
                                            setBuKoreksi('koreksi');
                                            setDlgAlasan(true);
                                        } else {
                                            await saveDoc();
                                        }
                                    }}
                                    disabled={!buOkEnabled}
                                    // disabled={
                                    //     // tombol Simpan aktif hanya jika salah satu kondisi terpenuhi:
                                    //     !(stateDokumen?.pAppFPMB === 'Approval' || stateDokumen?.pAppFPMB === 'UnApproval' || stateDokumen?.updateFilePendukung === 0)
                                    // }
                                />

                                <ButtonComponent
                                    id="buDlg"
                                    content={konten} //"Daftar Rencek"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-table-of-content"
                                    style={buttonStyleDlg}
                                    // style={{
                                    //     float: 'left',
                                    //     height: 'auto',
                                    //     width: stateDokumen?.jenisPengajuan == 2 ? '200px' : '90px', //'90px',
                                    //     marginTop: 1 + 'em',
                                    //     marginRight: 1 + 'em',
                                    //     backgroundColor: '#3b3f5c',
                                    //     whiteSpace: 'normal',
                                    //     display: 'flex',
                                    //     alignItems: 'center',
                                    // }}
                                    onClick={async () => {
                                        if (!dgHasilRencek || (dgHasilRencek.dataSource instanceof Array && dgHasilRencek.dataSource.length > 0)) {
                                            if (await myAlertGlobal3('Data Hasil Rencek tersedia. ganti data rencek ?', 'frmFpmb')) {
                                                await stateBaru();
                                            }
                                            return;
                                        } else {
                                            setModalDaftarDlg(true);
                                        }
                                    }}
                                    disabled={stateDokumen?.masterDataState === 'BARU' ? false : true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {isLoadingProgress && (
                    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    //     <div className="rounded-lg bg-white p-6 shadow-lg">
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        {progressValue > 0 && <div className="absolute inset-0 bg-black opacity-20" style={{ pointerEvents: 'auto' }} />}
                        <div className="rounded-lg bg-white p-6 shadow-lg">
                            {/* <div className="mb-4 text-center text-lg font-semibold">Loading Data...{tabs[selectedIndex].id}</div> */}
                            <div className="mb-4 text-center text-lg font-semibold">{loadingMessage}</div>
                            <div className="flex justify-center">
                                {progressValue > 0 && (
                                    <div className="relative">
                                        <ProgressBarComponent
                                            id="circular-progress"
                                            type="Circular"
                                            height="160px"
                                            width="160px"
                                            trackThickness={15}
                                            progressThickness={15}
                                            cornerRadius="Round"
                                            trackColor="#f3f3f3"
                                            progressColor="#3b3f5c"
                                            animation={{
                                                enable: true,
                                                duration: 2000, // Match this with the total time of the counter animation
                                                delay: 0,
                                            }}
                                            value={progressValue}
                                        >
                                            <Inject services={[ProgressAnnotation]} />
                                        </ProgressBarComponent>
                                        <div className="absolute left-0 right-0 top-0 flex h-full items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-2xl font-bold">{`${displayedProgress}%`}</span>
                                                <div className="text-sm text-gray-500">Complete</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {modalDaftarDlg && (
                    <DaftarDlg
                        stateDokumen={stateDokumen}
                        isOpen={modalDaftarDlg}
                        onClose={() => {
                            setModalDaftarDlg(false);
                            // setModalFpmb(false);
                            // setJenisFpmb('');
                            // setJenisPengajuan('');
                            // setTipePengajuan('');
                        }}
                        onRefresh={''}
                        onRefreshTipe={0}
                        selectedData={(dataObject: any) => {
                            handleSelectedDialog(dataObject);
                        }}
                    />
                )}
                {dlgAlasan && (
                    <AlasanDlg
                        stateDokumen={stateDokumen}
                        isOpen={dlgAlasan}
                        onClose={async () => {
                            setDlgAlasan(false);
                            // await saveDoc();
                            // setModalFpmb(false);
                            // setJenisFpmb('');
                            // setJenisPengajuan('');
                            // setTipePengajuan('');
                        }}
                        onRefresh={''}
                        onRefreshTipe={0}
                        selectedData={(dataObject: any) => {}}
                        onPilih={handlePilihAlasan}
                    />
                )}
            </DialogComponent>
        </div>
    );
};

export default FrmFpmb;
