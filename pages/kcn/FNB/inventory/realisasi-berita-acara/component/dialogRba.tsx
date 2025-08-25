import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';

// Pakai fungsi dari routines ============================
import { frmNumber } from '@/utils/routines';
//========================================================

import { useRouter } from 'next/router';

import styles from '@styles/index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faMagnifyingGlass, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import {
    headerTemplateHarga,
    headerTemplateHargaPusat,
    headerTemplateHargaPph,
    headerTemplateJumlah,
    headerTemplateJumlahCabang,
    headerTemplateJumlahPabrik,
    headerTemplateJumlahPph,
    headerTemplateHargaCabang,
    headerTemplatePabrik,
    headerTemplatePabrikQtyAcc,
    headerTemplatePabrikQtyKlaim,
    headerTemplatePabrikQtyFJ,
    checkValueAccessorGlobal,
    swalDialog,
    swalToast,
    swalPopUp,
} from '@/utils/inventory/realisasi-berita-acara/interface/fungsi';
import { GetHargaKontrak, GetListDetailKonsolidasiRba, GetListNoRekCabang, GetSettingAC, GetTbImagesRPEBA, getListDaftarFbm } from '@/lib/inventory/realisasi-berita-acara/api/api';
import { apiPph22 } from '@/utils/inventory/realisasi-berita-acara/template/HandleChangeParamsObject';
import { ReCalc } from '@/lib/inventory/realisasi-berita-acara/functional/reCalc';
import Draggable from 'react-draggable';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
import DialogDaftarFbm from '../modal/dialogDaftarFbm';
import { cekDataDiDatabase, generateNU } from '@/utils/global/fungsi';
// Configure worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import { useSession } from '@/pages/api/sessionContext';

enableRipple(true);

interface dialogRbaProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    masterKodeDokumen: any;
    masterDataState: any;
    dataEntitas: any;
    isOpen: boolean;
    onClose: any;
    onRefresh: any;
    kode_user: any;
    refreshKey: any;
    onOpen: any;
    token: any;
    valueAppBackdate: boolean;
    stateDataHeaderList: any;
}

const DialogRba: React.FC<dialogRbaProps> = ({
    userid,
    kode_entitas,
    entitas,
    masterKodeDokumen,
    masterDataState,
    dataEntitas,
    isOpen,
    onClose,
    onRefresh,
    kode_user,
    refreshKey,
    onOpen,
    token,
    valueAppBackdate,
    stateDataHeaderList,
}: dialogRbaProps) => {
    const router = useRouter();
    const gridRbaListRef = useRef<GridComponent | any>(null);
    let imageUrls: any;
    let tabRbaList: Tab | any;
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    const { sessionData, isLoading } = useSession();
    const nip = sessionData?.nip ?? '';

    // Loading data indicator
    const [showLoader, setShowLoader] = useState(true);
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });
    // END STATE FILE PENDUKUNG

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };
    const [dialogDaftarFbmVisible, setDialogDaftarFbmVisible] = useState(false);
    const vRefreshData = useRef(0);
    const editFormatNumber = { params: { showSpinButton: false, format: 'N2', validatedecimalontype: true } };
    const [tokenRedis, setTokenRedis] = useState<any>('');

    const [stateDataHeader, setStateDataHeader] = useState({
        kodeRpeba: '',
        tglRpeba: moment(),
        noRpeBa: '',
        noReff: '',
        noFbm: '',
        pph22: '',
        tglAcc: moment(),
        via: '',
        noRekEntitas: '',

        indexPreview: '',
        imageDataUrl: '',
        isOpenPreview: false,

        searchNamaViaDaftarFbm: '',
        tipeFilterOpen: '',
        tipeFocusOpen: '',

        kode_fbm: '',
    });

    const [stateDataFooter, setStateDataFooter] = useState({
        ket: '',
        catatanDepKeuangan: '',
        totalFj: '',
        totalPabrik: '',
        bebanCabang: '',

        totalPph: '',
    });

    const [stateDataDetail, setStateDataDetail] = useState({
        totalBarang: 0,
        totalBeratPabrik: 0,
    });

    const [stateDataNoRekCabang, setStateDataNoRekCabang] = useState<any>([]);
    const [stateDataDaftarFbm, setStateDataDaftarFbm] = useState<any>([]);
    const [stateDataDaftarFbmOriginal, setStateDataDaftarFbmOriginal] = useState<any>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [filesUpload, setFilesUpload] = useState<File[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const contentLoader = () => {
        return (
            <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#ffffff00] dark:bg-[#060818]">
                <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
                    <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
                    </path>
                    <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        );
    };

    const [refreshKeyNoRek, setRefreshKeyNoRek] = useState(0);
    const [refreshKeyPph22, setRefreshKeyPph22] = useState(0);

    const closeDialogRbaList = async () => {
        if (masterDataState === 'BARU') {
            clearAllImages();
        } else {
            clearAllImages();
        }
        ReCallRefreshModal();
        setTimeout(async () => {
            await onRefresh();
        }, 100);
        await onClose();
        setRefreshKeyNoRek((prevKey: any) => prevKey + 1);
        setRefreshKeyPph22((prevKey: any) => prevKey + 1);
        vFilterSaveLoad.current += 1;
    };

    const ReCallRefreshModal = () => {
        const pph22 = document.getElementById('pph22') as HTMLInputElement;
        if (pph22) {
            pph22.value = '';
        }

        const noRekEntitas = document.getElementById('noRekEntitas') as HTMLInputElement;
        if (noRekEntitas) {
            noRekEntitas.value = '';
        }

        setStateDataHeader((prevState: any) => ({
            ...prevState,
            tglRpeba: moment(),
            noRpeBa: '',
            noReff: '',
            noFbm: '',
            pph22: '',
            tglAcc: moment(),
            via: '',
            noRekEntitas: '',
        }));

        setStateDataFooter((prevState: any) => ({
            ...prevState,
            ket: '',
            catatanDepKeuangan: '',
            totalFj: '',
            totalPabrik: '',
            bebanCabang: '',
        }));

        setStateDataDetail((prevState: any) => ({
            ...prevState,
            totalBarang: 0,
        }));
        setFiles([]);
        setFilesUpload([]);

        gridRbaListRef.current?.setProperties({ dataSource: [] });
        gridRbaListRef.current?.refresh();
    };

    // Base URL API Data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    let buttonInputData: ButtonPropsModel[];
    buttonInputData = [
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: closeDialogRbaList,
        },
    ];

    //=============================================================================
    //=============================================================================

    // DATA TERBARU
    const masterDataStateRef = useRef('');
    type ExtractedFile = {
        imageUrl: string;
        fileName: string;
    };

    //======== Datasource =========
    // Data Konsolidasi RBA
    const refreshDatasource = async () => {
        masterDataStateRef.current = masterDataState;
        setShowLoader(true);
        if (kode_entitas !== null || kode_entitas !== '') {
            const paramObject = {
                kode_entitas: dataEntitas,
                token: token,
                kode_rpeba: masterKodeDokumen,
            };

            const respNoRekcabang = await GetListNoRekCabang(dataEntitas === '' ? kode_entitas : dataEntitas, token);
            setStateDataNoRekCabang(respNoRekcabang);
            try {
                if (masterDataState == 'BARU') {
                    await generateNU(kode_entitas, '', '86', stateDataHeader.tglRpeba.format('YYYYMM'))
                        .then((result: any) => {
                            setStateDataHeader((prevState) => ({
                                ...prevState,
                                noRpeBa: result,
                            }));
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                } else if (masterDataState === 'EDIT' || masterDataState === 'APPROVAL' || masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA') {
                    const responseData = await GetListDetailKonsolidasiRba(paramObject);
                    const respDataHeader = responseData.data.master;
                    const respDataDetail = responseData.data.detail;

                    if (responseData.status === true) {
                        // const responseDataImage = await GetTbImages(kode_entitas, responsData.data[0].kode_ttb);

                        setStateDataHeader((prevState) => ({
                            ...prevState,
                            kodeRpeba: respDataHeader.kode_rpeba,
                            tglRpeba: moment(respDataHeader.tgl_rpeba),
                            noRpeBa: respDataHeader.no_rpeba,
                            noReff: respDataHeader.no_reff,
                            noFbm: respDataHeader.no_fbm,
                            pph22: respDataHeader.pph22,
                            tglAcc: moment(respDataHeader.tgl_acc),
                            via: respDataHeader.via,
                            noRekEntitas: respDataHeader.norek,
                            kode_fbm: respDataHeader.kode_fbm,
                        }));

                        const respDataDetailFix = respDataDetail.map((item: any, index: number) => ({
                            ...item,
                            id: `${index + 1}`,
                            brtsat: item.brtsat === null ? 0 : parseFloat(item.brtsat),
                            harga_mu: item.harga_mu === null ? 0 : parseFloat(item.harga_mu),
                            harga_pph: item.harga_pph === null ? 0 : parseFloat(item.harga_pph),
                            harga_pusat: item.harga_pusat === null ? 0 : parseFloat(item.harga_pusat),
                            jumlah_mu: item.jumlah_mu === null ? 0 : parseFloat(item.jumlah_mu),
                            jumlah_pph: item.jumlah_pph === null ? 0 : parseFloat(item.jumlah_pph),
                            jumlah_pusat: item.jumlah_pusat === null ? 0 : parseFloat(item.jumlah_pusat),
                        }));

                        gridRbaListRef.current?.setProperties({ dataSource: respDataDetailFix });
                        gridRbaListRef.current?.refresh();

                        setStateDataDetail((prevState: any) => ({
                            ...prevState,
                            totalBarang: respDataDetail.length,
                            totalBeratPabrik: respDataHeader.total_berat,
                        }));

                        setStateDataFooter((prevState) => ({
                            ...prevState,
                            ket: respDataHeader.keterangan,
                            catatanDepKeuangan: respDataHeader.catatan_keuangan,
                            totalFj: respDataHeader.total_mu,
                            totalPabrik: respDataHeader.total_pusat,
                            bebanCabang: respDataHeader.netto_mu,
                            totalPph: respDataHeader.total_pph,
                        }));

                        const resppph22 = apiPph22.filter((data: any) => data.value === respDataHeader.pph22);
                        const respNoRekcabang = stateDataNoRekCabang.filter((data: any) => data.norek === respDataHeader.norek);

                        const pph22 = document.getElementById('pph22') as HTMLInputElement;
                        if (pph22) {
                            pph22.value = resppph22[0].nama_pph;
                        }

                        const noRekEntitas = document.getElementById('noRekEntitas') as HTMLInputElement;
                        if (noRekEntitas) {
                            noRekEntitas.value =
                                respNoRekcabang.length === 0 ? '' : `${respNoRekcabang[0].kodecabang} - ${respNoRekcabang[0].bank} - ${respNoRekcabang[0].norek} - ${respNoRekcabang[0].nama_rek}`;
                        }

                        const loadImages = await GetTbImagesRPEBA(dataEntitas, respDataHeader.kode_rpeba);
                        addFilesFromData(loadImages);
                        // Konversi fileoriginal menjadi name sebelum disimpan ke setFiles
                    }
                } else {
                }
            } catch (error) {
                console.error(error);
            }
        }
        if (kode_entitas == null || kode_entitas == '') {
            withReactContent(swalDialog).fire({
                title: `<p style="font-size:12px">Sesi login telah habis, silahkan login kembali.</p>`,
                icon: 'error',
                width: '360px',
                heightAuto: true,
            });

            setTimeout(() => {
                router.push({ pathname: '/' });
            }, 1000);
        } else {
            setShowLoader(false);
        }
    };

    const vFilterSaveLoad = useRef(0);

    const refreshDataApi = async () => {
        const paramObject = {
            kode_entitas: kode_entitas,
            token: token,
        };
        const respDaftarFbm = await getListDaftarFbm(paramObject);
        setStateDataDaftarFbm(respDaftarFbm);
        setStateDataDaftarFbmOriginal(respDaftarFbm);

        const respToken = await axios.get(`${apiUrl}/erp/token_uuid`, {});

        const responseToken = respToken.data.token;
        setTokenRedis(responseToken);
    };

    useEffect(() => {
        refreshDatasource();
        refreshDataApi();
    }, [refreshKey]);
    // END

    useEffect(() => {
        ReCallRefreshModal();
    }, [refreshKey]);

    interface ImageData {
        dokumen: string;
        filegambar: string;
        fileoriginal: any; // Sesuaikan dengan tipe yang sesuai
        gambar: any; // Sesuaikan dengan tipe yang sesuai
        id_dokumen: number; // Sesuaikan dengan tipe yang sesuai
        kode_dokumen: string;
        st: string;
        base64_string: string;
        decodeBase64_string: string;
        nama_file: string;
    }

    const [selectedFile, setSelectedFile] = useState('baru');
    const [images, setImages] = useState<string[][]>([]);
    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [selectedNamaFiles, setNamaFiles] = useState<any>([]);
    const formattedName = moment().format('YYMMDDHHmmss');
    const [fileGambar, setFileGambar] = useState('');
    const [loadFilePendukung, setLoadFilePendukung] = useState<ImageData[]>([]);

    // Tentukan tipe dari setiap entri JSON
    interface JsonEntry {
        entitas: string;
        kode_dokumen: string;
        id_dokumen: string;
        dokumen: string;
        filegambar: string;
    }

    const clearAllImages = () => {
        setImages([]);

        setSelectedFiles([]);
        setLoadFilePendukung([]);
        // Mengatur ulang input file
    };

    // const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [rotationAngle, setRotationAngle] = useState(0);

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    const handleCloseZoom = () => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            isOpenPreview: false,
        }));
    };

    const handleWheel = (event: any) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            // Scroll up
            setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
        } else {
            // Scroll down
            setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
        }
    };

    const handleMouseDown = (event: any) => {
        setIsDragging(true);
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleMouseMove = (event: any) => {
        if (isDragging) {
            setPosition({
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (stateDataHeader.isOpenPreview) {
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [stateDataHeader.isOpenPreview, handleMouseMove, handleMouseUp, handleWheel]);

    const handleZoomIn = () => {
        setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const handleZoomOut = () => {
        setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    // Fungsi untuk menangani paste gambar
    const handlePaste = (e: any, tabIndex: any) => {
        e.preventDefault();

        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newImageUrl = event.target?.result;
                    // Memastikan bahwa newImageUrl adalah string sebelum menggunakannya
                    if (typeof newImageUrl === 'string') {
                        const newImages = [...images];
                        newImages[tabIndex] = [newImageUrl];
                        setImages(newImages);
                    }
                };
                reader.readAsDataURL(file);

                if (selectedFile === 'update') {
                    setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIndex }]);
                    setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, fileGambar.substring(0, fileGambar.length - 4)]);
                }
                if (selectedFile === 'baru') {
                    setSelectedFiles((prevFiles: any) => [...prevFiles, { file, tabIndex }]);
                    setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, formattedName]);
                }
            }
        }
    };

    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabClick = (index: any) => {
        setSelectedTab(index);
    };

    //=================================================================
    const headerTemplateBeratPabrik = () => {
        const bgcolor = 'tranparent';
        const fcolor = '#5d676e';
        return (
            <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
                <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
                    Berat Pabrik
                    <br />
                    (Kg)
                </span>
            </div>
        );
    };

    const headerTemplateNoKontrak = () => {
        const bgcolor = 'tranparent';
        const fcolor = '#5d676e';
        return (
            <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
                <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
                    No. Kontrak
                    <br />
                    Pabrik / Supplier
                </span>
            </div>
        );
    };

    const prosesBloking = (tipe: any) => {
        if (tipe === 'simpan') {
            if (stateDataHeader.noRpeBa === '' || stateDataHeader.noRpeBa === null || stateDataHeader.noRpeBa === undefined) {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px;color:white;">Nomor RBA belum diisi.</p>',
                    width: '16%',
                    target: '#dialogRbeList',
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }
            if (gridRbaListRef.current?.dataSource.length === 0) {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px;color:white;">Data Barang belum diisi.</p>',
                    width: '16%',
                    target: '#dialogRbeList',
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }

            saveDoc(tipe);
        } else {
            saveDoc(tipe);
        }
    };

    const handlePph22 = async (value: any) => {
        const respSettingAc = await GetSettingAC(kode_entitas, token);
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            pph22: value,
        }));
        console.log('respSettingAc = ', respSettingAc.length, gridRbaListRef.current.dataSource);
        // const respHargaKontrakPusat = respSettingAc.length > 0 ? await GetHargaKontrak(respSettingAc[0].fbm_kodepusat, item.kode_item, item.no_kontrak, token) : 0;
        if (value === 'P') {
            const updated = gridRbaListRef.current.dataSource.map((item: any) => {
                const hargaDasar = item.harga_pusat / 1.113;
                const hargaDasarHitung = hargaDasar * (11 / 100);
                const harga_pph = hargaDasar + hargaDasarHitung;
                console.log('harga_pph = ', parseFloat(harga_pph.toFixed(2)), item.qty_pabrik_acc);
                const jumlah_pph = item.qty_pabrik_acc * harga_pph;

                return {
                    ...item,
                    harga_pph: parseFloat(harga_pph.toFixed(2)),
                    jumlah_pph: parseFloat(jumlah_pph.toFixed(2)),
                    // jumlah_pph: (Math.ceil(jumlah_pph * 100) / 100).toFixed(2),
                };
            });

            gridRbaListRef.current.setProperties({ dataSource: updated });
            gridRbaListRef.current?.refresh();
        } else {
            const updated = gridRbaListRef.current.dataSource.map((item: any) => ({
                ...item,
                harga_pph: 0,
                jumlah_pph: 0,
            }));
            gridRbaListRef.current.setProperties({ dataSource: updated });
            gridRbaListRef.current?.refresh();
        }
    };

    const saveDoc = async (tipe: any) => {
        startProgress();

        let defaultNoRba: any;
        if (masterDataState === 'BARU') {
            const result = await generateNU(kode_entitas, '', '86', stateDataHeader.tglRpeba.format('YYYYMM'));
            defaultNoRba = result;
        } else {
            defaultNoRba = stateDataHeader.noRpeBa;
        }

        const paramObject = {
            user_app2: tipe === 'disetujui' ? userid.toUpperCase() : tipe === 'koreksi' ? null : tipe === 'ditolak' ? null : null,
            tgl_app2: tipe === 'disetujui' ? moment().format('YYYY-MM-DD HH:mm:ss') : tipe === 'koreksi' ? null : tipe === 'ditolak' ? null : null,
            level_app: stateDataHeaderList.appRba,
            app: tipe === 'disetujui' ? 'Y' : tipe === 'koreksi' ? 'N' : tipe === 'ditolak' ? 'N' : 'N',
            approval: tipe === 'disetujui' ? 'Y' : tipe === 'koreksi' ? 'C' : tipe === 'ditolak' ? 'N' : 'N',
            tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
            catatan_konsol: stateDataHeaderList.inputCatatanKonsol,
            kode_rpeba: masterKodeDokumen,
            kode_nip: nip,
        };
        const reCalcData = await ReCalc(paramObject, gridRbaListRef.current);
        const jsonData = {
            entitas: dataEntitas,
            // kode_nip: null,
            kode_nip: nip,
            dataRBA: reCalcData.detailAppRba,

            // Manual RBA
            // no_rpeba: stateDataHeader.noRpeBa,
            kode_dokumen: masterDataState === 'BARU' ? '' : stateDataHeader.kodeRpeba,
            kode_rpeba: masterDataState === 'BARU' ? '' : stateDataHeader.kodeRpeba,
            no_rpeba: defaultNoRba,
            tgl_rpeba: moment(stateDataHeader.tglRpeba).format('YYYY-MM-DD HH:mm:ss'),
            tgl_acc: moment(stateDataHeader.tglAcc).format('YYYY-MM-DD HH:mm:ss'),
            via: stateDataHeader.via,
            kode_mu: 'IDR',
            total_mu: stateDataFooter.totalFj,
            total_pusat: stateDataFooter.totalPabrik,
            netto_mu: stateDataFooter.bebanCabang,
            total_berat: stateDataDetail.totalBeratPabrik,
            keterangan: stateDataFooter.ket,
            status: 'Terbuka',
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            approval: null,
            tgl_approval: null,
            realisasi: null,
            no_reff: stateDataHeader.noReff,
            toleransi: 0.2,
            kode_supp: null,
            kode_fbm: stateDataHeader.kode_fbm,
            pph22: stateDataHeader.pph22 === '' ? 'N' : stateDataHeader.pph22,
            norek: stateDataHeader.noRekEntitas,
            total_pph: stateDataFooter.totalPph,
            level_app: null,
            user_app1: null,
            tgl_app1: null,
            user_app2: null,
            tgl_app2: null,
            app: 'N',
            kode_pdf: null,
            token: tokenRedis,
            detail: reCalcData.detailRba, // ini array
            catatan_keuangan: stateDataFooter.catatanDepKeuangan,
        };
        console.log('jsonData = ', jsonData);
        const tipeAlertApp = tipe === 'disetujui' ? 'Disetujui' : tipe === 'koreksi' ? 'Dikoreksi' : 'Ditolak';
        if (masterDataState === 'BARU') {
            // endProgress();
            const cekDataRba = await cekDataDiDatabase(kode_entitas, 'tb_m_rpeba', 'no_rpeba', jsonData?.no_rpeba, token);
            if (cekDataRba) {
                // jsonData.no_ttb = defaultNoTtb;
                const generateCounter = await generateNU(kode_entitas, defaultNoRba, '86', moment(stateDataHeader.tglRpeba).format('YYYYMM'));
                const generateNoDok = await generateNU(kode_entitas, '', '86', moment(stateDataHeader.tglRpeba).format('YYYYMM'));
                jsonData.no_rpeba = generateNoDok;
            }

            const response = await axios.post(`${apiUrl}/erp/simpan_realisasi_berita_acara`, jsonData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = response.data;
            const status = result.status;
            const errormsg = result.error;
            if (status === true) {
                await handleUpload(result.data.kode_rpeba);
                await generateNU(kode_entitas, result.data.no_rpeba, '86', moment(stateDataHeader.tglRpeba).format('YYYYMM'));
                // await generateNUDivisi(kode_entitas, noTtbValue, divisiPenjualan, '08', moment(date1).format('YYYYMM'), moment(date1).format('YYMM') + `${divisiPenjualan}`);
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil disimpan.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogRbeList',
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                await closeDialogRbaList();
                endProgress();
                // setDisabledTombolSimpan(false);
            } else {
                endProgress();
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    target: '#dialogRbeList',
                });
            }
            console.log('jsonData = ', jsonData);
        } else if (masterDataState === 'EDIT') {
            // endProgress();
            console.log('jsonData Edit = ', jsonData);
            try {
                await handleUpload(stateDataHeader.kodeRpeba);
                const response = await axios.patch(`${apiUrl}/erp/update_realisasi_berita_acara`, jsonData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const result = response.data;
                const status = result.status;
                const errormsg = result.error;
                if (status === true) {
                    endProgress();
                    await withReactContent(swalPopUp).fire({
                        icon: 'success',
                        title: '<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil di edit.</p>',
                        width: '50%', // Atur lebar popup sesuai kebutuhan
                        target: '#dialogRbeList',
                        heightAuto: true,
                        timer: 2000,
                        showConfirmButton: false, // Menampilkan tombol konfirmasi
                        allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                        allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                        customClass: {
                            popup: styles['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    await closeDialogRbaList();
                } else {
                    endProgress();
                    withReactContent(swalDialog).fire({
                        title: ``,
                        html: errormsg,
                        icon: 'warning',
                        width: '20%',
                        heightAuto: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Ok',
                        target: '#dialogRbeList',
                    });
                }
            } catch (error) {
                endProgress();
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errorMessage,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    target: '#dialogRbeList',
                });
            }
        } else if (masterDataState === 'APPKONSOLIDASIRBA') {
            const response = await axios.post(`${apiUrl}/erp/approval_rba_konsolidasi`, jsonData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const resultSimpan = response.data;
            const status = resultSimpan.status;
            const errormsg = resultSimpan.serverMessage;
            if (status === true) {
                endProgress();
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: `<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil ${tipeAlertApp}.</p>`,
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogRbeList',
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                closeDialogRbaList();
            } else {
                endProgress();
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    target: '#dialogRbeList',
                });
                return;
            }
        } else if (masterDataState === 'APPROVAL') {
            const response = await axios.post(`${apiUrl}/erp/approval_rba_konsolidasi`, jsonData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const resultSimpan = response.data;
            const status = resultSimpan.status;
            const errormsg = resultSimpan.serverMessage;
            if (status === true) {
                endProgress();
                await handleUpload(stateDataHeader.kodeRpeba);
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: `<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil ${tipeAlertApp}.</p>`,
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogRbeList',
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                closeDialogRbaList();
            } else {
                endProgress();
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    target: '#dialogRbeList',
                });
                return;
            }
        }
    };

    const clearFile = (fileIndex: any) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== fileIndex));
        setFilesUpload((prevFiles) => prevFiles.filter((_, index) => index !== fileIndex));
        if (previewFile && previewFile.name === files[fileIndex].name) {
            setPreviewFile(null);
        }
    };

    const handleFileClick = async (file: File, imageLocal: any) => {
        setPreviewFile(file);
        if (!file) return null;

        const fileType = file.type;
        // const fileTypeServer = imageServer;
        let extension, namaFile;

        if (fileType === undefined) {
            const fileName = imageLocal.filegambar;
            namaFile = imageLocal.filegambar;
            extension = fileName.split('.').pop(); // Hasil: "pdf"

            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${dataEntitas}&param1=${namaFile}`);

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

    const handleFileUpload = (event: any) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles: any) => [...prevFiles, ...newFiles]);
        setFilesUpload((prevFiles: any) => [...prevFiles, ...newFiles]);
    };

    const clearAllFiles = () => {
        setFiles([]);
        setFilesUpload([]);
        setPreviewFile(null);
    };

    const base64ToBlob = (base64: string, mimeType: string): Blob => {
        try {
            if (!base64 || typeof base64 !== 'string') {
                throw new Error('Base64 string tidak valid');
            }

            const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, ''); // Hapus prefix
            const byteCharacters = atob(cleanBase64); // Decode base64
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            return new Blob([byteNumbers], { type: mimeType });
        } catch (error) {
            console.error('❌ Error decoding base64:', error);
            return new Blob(); // Return Blob kosong jika gagal
        }
    };

    const addFilesFromData = (loadImages: any) => {
        const formattedData = loadImages.map((item: any) => ({
            ...item,
            name: item.fileoriginal, // Tambahkan properti 'name'
        }));

        const formattedDataUpload = loadImages
            .map((item: any) => {
                if (!item.decodeBase64_string || typeof item.decodeBase64_string !== 'string') {
                    return null;
                }

                try {
                    const base64Data = item.decodeBase64_string.replace(/^data:image\/[a-z]+;base64,/, ''); // Hapus prefix
                    const mimeTypeMatch = item.decodeBase64_string.match(/^data:(image\/[a-z]+);base64,/);
                    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'; // Default ke JPEG jika tidak ditemukan

                    const fileData = base64ToBlob(base64Data, mimeType);
                    if (!fileData) {
                        return null;
                    }

                    const newFile = new File([fileData], item.fileoriginal || 'default.jpg', { type: mimeType });

                    return newFile;
                } catch (error) {
                    return null;
                }
            })
            .filter(Boolean); // Hapus nilai null

        setFiles((prevFiles: any) => [...prevFiles, ...formattedData]);
        setFilesUpload((prevFiles) => [...prevFiles, ...formattedDataUpload]); // Update state
    };

    const handlePreviewPdf = (setPreviewPdf: Function) => {
        setPreviewPdf(true);
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
    };

    const downloadBase64Image = (base64Image: string, filename: string) => {
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

    const [numberId, setNumberId] = useState(-1);
    const [documentData, setDocumentData] = useState<any>(null);

    const pilihFilePendukung = (file: any, index: any) => {
        setNumberId(index);
        setDocumentData(file);
    };

    const handlePreview = async (imageLocal: any) => {
        const fileName = imageLocal.filegambar;

        if (fileName === undefined) {
            downloadBase64Image1(imageLocal.decodeBase64_string, imageLocal.name, imageLocal);
        } else {
            const extension = fileName.split('.').pop(); // Hasil: "pdf"
            if (extension === 'pdf') {
                const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${dataEntitas}&param1=${imageLocal.filegambar}`);

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

    const clickDaftarFbm = async () => {
        vRefreshData.current += 1;
        setDialogDaftarFbmVisible(true);
    };

    const handleKeyDownNoFbm = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault(); // Mencegah perubahan nilai input
        const value = event.key;
        vRefreshData.current += 1;
        const paramObject = {
            kode_entitas: kode_entitas,
            token: token,
        };
        const respDaftarFbm = await getListDaftarFbm(paramObject);

        setStateDataDaftarFbm(respDaftarFbm);
        handleSearchDialog(value, respDaftarFbm);
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            searchNamaViaDaftarFbm: value,
            tipeFilterOpen: 'Input',
            tipeFocusOpen: 'namaVia',
        }));
        setDialogDaftarFbmVisible(true);
    };

    const handleSearchDialog = (value: any, gridDaftarFbm: any) => {
        if (gridDaftarFbm && Array.isArray(gridDaftarFbm)) {
            let filteredData = gridDaftarFbm;

            if (value.trim() !== '') {
                filteredData = gridDaftarFbm.filter((item) => item.via.toLowerCase().startsWith(value.toLowerCase()));
            }
            setStateDataDaftarFbm(filteredData);
        }
    };

    const handleActionBagin = async (args: any) => {
        if (args.requestType === 'save') {
            if (gridRbaListRef.current && Array.isArray(gridRbaListRef.current.dataSource)) {
                const dataSource = [...gridRbaListRef.current.dataSource]; // Salin array
                const jmlPabrik = parseFloat(args.data.harga_pusat) * parseFloat(args.data.qty_pabrik_acc);
                const jmlPph = parseFloat(args.data.harga_pph) * parseFloat(args.data.qty_pabrik_acc);
                const jmlBerat = parseFloat(args.data.brtsat) * parseFloat(args.data.qty_pabrik_acc);
                const editedData = {
                    ...args.data,
                    jumlah_pusat: isNaN(jmlPabrik) ? 0 : jmlPabrik,
                    jumlah_pph: isNaN(jmlPph) ? 0 : jmlPph,
                    berat: isNaN(jmlBerat) ? 0 : jmlBerat.toFixed(2),
                    harga_pusat: parseFloat(args.data.harga_pusat),
                };

                // Update elemen di array salinan
                dataSource[args.rowIndex] = editedData;

                // Menghitung total netto_mu
                const totalCabang = dataSource.reduce((sum: any, item: any) => sum + (parseFloat(item.jumlah_mu) || 0), 0);
                const totalPabrik = dataSource.reduce((sum: any, item: any) => sum + (parseFloat(item.jumlah_pusat) || 0), 0);
                const totalPph = dataSource.reduce((sum: any, item: any) => sum + (parseFloat(item.jumlah_pph) || 0), 0);
                const totalBerat = dataSource.reduce((sum: any, item: any) => sum + (parseFloat(item.berat) || 0), 0);
                const totalBebanCabang = totalCabang - totalPabrik;

                setStateDataFooter((prevState: any) => ({
                    ...prevState,
                    totalPabrik: totalPabrik,
                    bebanCabang: totalBebanCabang > 0 ? totalBebanCabang : 0,
                    totalPph: totalPph,
                }));

                setStateDataDetail((prevState: any) => ({
                    ...prevState,
                    totalBeratPabrik: totalBerat,
                }));

                // Set dataSource baru
                gridRbaListRef.current.dataSource = dataSource;
                gridRbaListRef.current.refresh(); // Perbarui tampilan grid
            } else {
                console.error('DataSource is undefined or not an array.');
            }
        }
    };

    const handleUpload = async (kode_dokumen: any) => {
        // Proses untuk file baru
        const formData = new FormData();
        let entitas;

        const kode_Dokumen = kode_entitas + 'RPEBA' + kode_dokumen;

        filesUpload.forEach((file: any, index: any) => {
            // Ambil timestamp tanpa detik terakhir
            const baseTime = moment().format('YYMMDDHHmmss'); // Misalnya: 250311105806
            const newSeconds = (parseInt(baseTime.slice(-2)) + index).toString().padStart(2, '0'); // Tambahkan index ke detik terakhir

            // Gabungkan kembali
            const fileName = `RPEBA${baseTime.slice(0, -2)}${newSeconds}`;
            const fileExtension = file.name.split('.').pop();

            formData.append(`myimage`, file);
            formData.append(`nama_file_image`, `${fileName}.${fileExtension}`);
            formData.append(`kode_dokumen`, kode_Dokumen);
            formData.append(`id_dokumen`, 101 + index);
            formData.append(`dokumen`, 'RPEBA-');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        // console.log('FormData Contents:');
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        // // console.log('JsonInput = ', jsonData);
        // console.log('JsonInput = ', formData);

        if (masterDataState !== 'BARU') {
            const responseFilePendukung = await axios.get(`${apiUrl}/erp/get_tb_images?`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_Dokumen,
                },
            });

            if (responseFilePendukung?.data.data.length !== 0) {
                const filePendukung_lama: any[] = [];
                const kodeDokumen = kode_Dokumen;
                responseFilePendukung.data.data.map((item: any) => {
                    filePendukung_lama.push(item.id_dokumen);
                });
                const result = filePendukung_lama.join(',');

                await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeDokumen,
                        param2: result,
                    },
                });
            }
        }

        try {
            const response = await axios.post(`${apiUrl}/upload`, formData);

            if (response.data.status === true) {
                let jsonSimpan;
                if (Array.isArray(response.data.nama_file_image)) {
                    // Jika terdapat banyak file
                    jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => ({
                        entitas: kode_entitas,
                        kode_dokumen: kode_Dokumen,
                        id_dokumen: response.data.id_dokumen[index],
                        dokumen: 'RPEBA-',
                        filegambar: namaFile,
                        fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                    }));
                } else {
                    // Jika hanya satu file
                    jsonSimpan = {
                        entitas: kode_entitas,
                        kode_dokumen: kode_Dokumen,
                        id_dokumen: response.data.id_dokumen,
                        dokumen: 'RPEBA-',
                        filegambar: response.data.nama_file_image,
                        fileoriginal: response.data.filesinfo,
                    };
                }

                try {
                    // Simpan data ke database
                    const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
                } catch (error) {
                    console.error('Error saat menyimpan data baru:', error);
                }
            } else {
                console.log('tidak upload');
            }
        } catch (error) {
            console.error('Error saat mengunggah file baru:', error);
        }
    };

    //=================================================================

    return (
        <div>
            {/*==================================================================================================*/}
            {/*====================== Modal dialog untuk input edit dan menambah data baru ======================*/}
            {/*==================================================================================================*/}
            <DialogComponent
                id="dialogRbeList"
                name="dialogRbeList"
                className="dialogRbeList"
                target="#main-target"
                header={() => {
                    let header: JSX.Element | string = '';
                    if (masterDataState == 'BARU') {
                        header = (
                            <div>
                                <div className="header-title">
                                    Realisasi Berita Acara Pabrik <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[ BARU ]</span>
                                </div>
                            </div>
                        );
                    } else if (masterDataState == 'EDIT' || masterDataState === 'EDITKONSOLIDASIRBA') {
                        header = (
                            <div>
                                <div className="header-title">
                                    Realisasi Berita Acara Pabrik <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[ EDIT ]</span>
                                </div>
                            </div>
                        );
                    } else if (masterDataState == 'APPROVAL' || masterDataState === 'APPKONSOLIDASIRBA') {
                        header = (
                            <div>
                                <div className="header-title">
                                    Realisasi Berita Acara Pabrik <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[ APPROVAL ]</span>
                                </div>
                            </div>
                        );
                    }
                    return header;
                }}
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                enableResize={true}
                resizeHandles={['All']}
                allowDragging={true}
                showCloseIcon={true}
                width="90%" //"70%"
                height="78%"
                position={{ X: 'center', Y: 8 }}
                style={{ position: 'fixed' }}
                buttons={buttonInputData}
                close={() => {
                    closeDialogRbaList();
                }}
                closeOnEscape={false}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
            >
                <div style={{ minWidth: '70%', overflow: 'auto' }}>
                    <div>
                        {/* screen loader  */}
                        {showLoader && contentLoader()}

                        <div>
                            {/* ===============  Master Header Data ========================   */}
                            <div className="mb-1">
                                <div className="panel-tabel" style={{ width: '100%' }}>
                                    <table className={styles.table} style={{ width: '70%' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '15%' }}>Tanggal</th>
                                                <th style={{ width: '15%' }}>No. RPEBA</th>
                                                <th style={{ width: '20%' }}>No. Referensi</th>
                                                <th style={{ width: '25%' }}>No. Form Barang Masuk</th>
                                                <th style={{ width: '20%' }}>PPH 22</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <>
                                                        {masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? (
                                                            <input
                                                                className={` container form-input`}
                                                                style={{
                                                                    fontSize: 11,
                                                                    marginLeft: -8,
                                                                    borderColor: 'transparent',
                                                                    width: '105%',
                                                                    borderRadius: 2,
                                                                    color: '#5c5c5c',
                                                                }}
                                                                disabled={true}
                                                                value={moment(stateDataHeader.tglRpeba).format('DD-MM-YYYY')}
                                                                // value={moment(dataHeaderAPI?.tglTransaksiMutasi).toDate()}
                                                                readOnly
                                                            ></input>
                                                        ) : (
                                                            <DatePickerComponent
                                                                key="datepicker" // Unique key for DatePickerComponent
                                                                locale="id"
                                                                cssClass="e-custom-style"
                                                                // renderDayCell={onRenderDayCell}
                                                                placeholder="Tgl. Rpeba"
                                                                enableMask={true}
                                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                showClearButton={false}
                                                                format="dd-MM-yyyy"
                                                                value={stateDataHeader.tglRpeba.toDate()}
                                                                // change={(args: ChangeEventArgsCalendar) => {
                                                                //     if (args.value) {
                                                                //         const selectedDate = moment(args.value);
                                                                //         selectedDate.set({
                                                                //             hour: moment().hour(),
                                                                //             minute: moment().minute(),
                                                                //             second: moment().second(),
                                                                //         });
                                                                //         setDate1(selectedDate);
                                                                //     } else {
                                                                //         setDate1(moment());
                                                                //     }
                                                                // }}
                                                            >
                                                                <Inject services={[MaskedDateTime]} />
                                                            </DatePickerComponent>
                                                        )}
                                                    </>
                                                </td>
                                                <td>
                                                    <TextBoxComponent
                                                        placeholder="<No. RPEBA>"
                                                        readOnly={true}
                                                        // readonly={masterDataStatemasterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' ? true : false}
                                                        value={stateDataHeader.noRpeBa}
                                                    />
                                                </td>
                                                <td>
                                                    <TextBoxComponent
                                                        placeholder="<No. Referensi>"
                                                        readOnly={true}
                                                        // readonly={masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' ? true : false}
                                                        value={stateDataHeader.noReff}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="flex">
                                                        <div className="container form-input" style={{ border: 'none', fontWeight: 'normal', fontSize: '11px', marginLeft: '-60px' }}>
                                                            <input
                                                                style={{ backgroundColor: 'white', borderRadius: '5px' }}
                                                                placeholder="<NO. FBM>"
                                                                value={stateDataHeader.noFbm}
                                                                onFocus={(event) => {
                                                                    if (event.target instanceof HTMLInputElement) {
                                                                        event.target.select();
                                                                    }
                                                                }}
                                                                onKeyDown={(event) => {
                                                                    if (masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL') {
                                                                    } else {
                                                                        handleKeyDownNoFbm(event);
                                                                    }
                                                                }}
                                                                readOnly={
                                                                    masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? true : false
                                                                }
                                                            ></input>
                                                            {/* <TextBoxComponent
                                                                className={`${styles.inputTableBasic}`}
                                                                placeholder="NO FBM"
                                                                value={stateDataHeader.noFbm}
                                                                onFocus={(event) => {
                                                                    if (event.target instanceof HTMLInputElement) {
                                                                        event.target.select();
                                                                    }
                                                                }}
                                                                input={(args: ChangeEventArgsInput) => {
                                                                    const value: any = args.value;
                                                                    handleNamaFbm(value);
                                                                }}
                                                                
                                                                style={{ backgroundColor: 'white', borderRadius: '5px' }}
                                                                readonly={masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' ? true : false}
                                                            /> */}
                                                        </div>
                                                        {masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? (
                                                            <div>
                                                                <button
                                                                    className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                                    style={{ height: '17px', background: 'white', borderColor: 'white' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div onClick={clickDaftarFbm}>
                                                                <button
                                                                    className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                                    style={{ height: '17px', background: 'white', borderColor: 'white' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex">
                                                        <DropDownListComponent
                                                            key={`dropdown-${refreshKeyPph22}`}
                                                            id="pph22"
                                                            className="form-select"
                                                            // dataSource={apiPph22.map((data) => data.nama_pph)}
                                                            dataSource={apiPph22} // Langsung pakai objek, bukan hanya nama_pph
                                                            fields={{ text: 'nama_pph', value: 'value' }}
                                                            placeholder="-- Silahkan Pilih PPH22 --"
                                                            change={(args: any) => {
                                                                if (masterDataState === 'EDITKONSOLIDASIRBA') {
                                                                } else {
                                                                    handlePph22(args.value);
                                                                }
                                                            }}
                                                            value={stateDataHeader.pph22} // Ini membuat dropdown otomatis memilih opsi yang sesuai
                                                            disabled={
                                                                masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? true : false
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className={styles.table}>
                                                <th style={{ width: '3%' }}>Tgl Acc</th>
                                                <th colSpan={2} style={{ width: '55%' }}>
                                                    Via (Ekspedisi)
                                                </th>
                                                <th colSpan={2} style={{ width: '55%' }}>
                                                    No. Rekening Entitas
                                                </th>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? (
                                                        <input
                                                            className={` container form-input`}
                                                            style={{
                                                                fontSize: 11,
                                                                marginLeft: -8,
                                                                borderColor: 'transparent',
                                                                width: '105%',
                                                                borderRadius: 2,
                                                                color: '#5c5c5c',
                                                            }}
                                                            disabled={true}
                                                            value={moment(stateDataHeader.tglAcc).format('DD-MM-YYYY')}
                                                            // value={moment(dataHeaderAPI?.tglTransaksiMutasi).toDate()}
                                                            readOnly
                                                        ></input>
                                                    ) : (
                                                        <DatePickerComponent
                                                            key="datepicker" // Unique key for DatePickerComponent
                                                            locale="id"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            placeholder="Tgl. ACC"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={stateDataHeader.tglAcc.toDate()}
                                                            // change={(args: ChangeEventArgsCalendar) => {
                                                            //     if (args.value) {
                                                            //         const selectedDate = moment(args.value);
                                                            //         selectedDate.set({
                                                            //             hour: moment().hour(),
                                                            //             minute: moment().minute(),
                                                            //             second: moment().second(),
                                                            //         });
                                                            //         setDate1(selectedDate);
                                                            //     } else {
                                                            //         setDate1(moment());
                                                            //     }
                                                            // }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    )}
                                                </td>
                                                <td colSpan={2}>
                                                    <TextBoxComponent
                                                        placeholder="<Via (Ekspedisi)>"
                                                        readOnly={true}
                                                        // readonly={masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' ? true : false}
                                                        value={stateDataHeader.via}
                                                    />
                                                </td>
                                                <td colSpan={2}>
                                                    <div className="container form-input" style={{ border: 'none' }}>
                                                        <DropDownListComponent
                                                            key={`dropdown-${refreshKeyNoRek}`}
                                                            id="noRekEntitas"
                                                            className="form-select"
                                                            dataSource={stateDataNoRekCabang.map((data: any) => ({
                                                                text: `${data.kodecabang} - ${data.norek} - ${data.nama_rek}`,
                                                                value: data.norek,
                                                            }))}
                                                            fields={{ text: 'text', value: 'value' }}
                                                            placeholder="-- Silahkan Pilih No Rek Entitas --"
                                                            // change={(args: ChangeEventArgsDropDown) => {
                                                            //     const value: any = args.value;
                                                            //     HandleAlasanChange(value, setSelectedOptionAlasan);
                                                            // }}
                                                            // value={selectedOptionAlasan}
                                                            readonly={masterDataState === 'BARU' || masterDataState === 'EDIT' || masterDataState === 'EDITKONSOLIDASIRBA' ? false : true}
                                                            value={stateDataHeader.noRekEntitas} // Ini membuat dropdown otomatis memilih opsi yang sesuai
                                                            change={(args: any) => {
                                                                if (masterDataState === 'EDITKONSOLIDASIRBA') {
                                                                } else {
                                                                    setStateDataHeader((prevState: any) => ({
                                                                        ...prevState,
                                                                        noRekEntitas: args.value,
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ===============  Detail Data ========================   */}
                            <div className="panel-tab" style={{ background: '#F7F7F7', width: '100%', height: '433px' }}>
                                <TabComponent ref={(t) => (tabRbaList = t)} selectedItem={selectedTab} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                    <div className="e-tab-header">
                                        <div tabIndex={0} onClick={() => handleTabClick(0)}>
                                            1. Data Barang
                                        </div>
                                        <div tabIndex={1} onClick={() => handleTabClick(1)}>
                                            2. File Pendukung
                                        </div>
                                    </div>
                                    {/*===================== Content menampilkan data barang =======================*/}
                                    <div className="e-content">
                                        <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={0}>
                                            <GridComponent
                                                id="gridRbaList"
                                                name="gridRbaList"
                                                className="gridRbaList"
                                                locale="id"
                                                ref={gridRbaListRef}
                                                // dataSource={dataBarang.nodes}
                                                editSettings={
                                                    masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL'
                                                        ? { allowAdding: false, allowEditing: false, allowDeleting: false, newRowPosition: 'Bottom' }
                                                        : { allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }
                                                }
                                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                allowResizing={true}
                                                autoFit={true}
                                                rowHeight={22}
                                                height={301} //170 barang jadi 150 barang produksi
                                                gridLines={'Both'}
                                                // // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                // recordClick={(args: any) => {
                                                //     currentDaftarBarang = gridTtbListRef.current?.getSelectedRecords() || [];
                                                //     if (currentDaftarBarang.length > 0) {
                                                //         gridTtbListRef.current?.startEdit();
                                                //         document.getElementById('kuantitas')?.focus();
                                                //     }
                                                // }}
                                                actionBegin={handleActionBagin}
                                                // actionComplete={handleActionComplate}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective
                                                        field="id_fbm"
                                                        visible={false}
                                                        type="number"
                                                        isPrimaryKey={true}
                                                        headerText="No."
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        width="30"
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="nama_supp"
                                                        headerText="Nama Supplier"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="160"
                                                        clipMode="EllipsisWithTooltip"
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective field="no_fj" headerText="No. Faktur Jual" headerTextAlign="Center" textAlign="Left" width="110" allowEditing={false} />
                                                    <ColumnDirective
                                                        field="tgl_fj"
                                                        headerText="Tgl. Faktur"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        width="85"
                                                        type="date"
                                                        format={formatDate}
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        field="tgl_mb"
                                                        headerText="Tgl. SJ"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="85"
                                                        type="date"
                                                        format={formatDate}
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" headerTextAlign="Center" textAlign="Center" width="80" allowEditing={false} />
                                                    <ColumnDirective field="no_item" headerText="No. Barang" headerTextAlign="Center" textAlign="Center" width="70" allowEditing={false} />
                                                    <ColumnDirective field="diskripsi" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" width="200" allowEditing={false} />
                                                    <ColumnDirective field="satuan" headerText="Satuan" headerTextAlign="Center" textAlign="Center" width="50" allowEditing={false} />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'qty',
                                                                headerText: 'Qty FJ',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '80',
                                                                headerTemplate: headerTemplatePabrikQtyFJ,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                                allowEditing: false,
                                                            },
                                                            {
                                                                field: 'qty_pabrik_real',
                                                                headerText: 'Qty Klaim',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '80',
                                                                headerTemplate: headerTemplatePabrikQtyKlaim,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                                allowEditing: false,
                                                            },
                                                            {
                                                                field: 'qty_pabrik_acc',
                                                                headerText: 'Qty Acc',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '80',
                                                                headerTemplate: headerTemplatePabrikQtyAcc,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                            },
                                                        ]}
                                                        headerText="Pabrik"
                                                        textAlign="Center"
                                                        headerTemplate={headerTemplatePabrik}
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'harga_mu',
                                                                headerText: 'Cabang',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateHargaCabang,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                                allowEditing: false,
                                                            },
                                                            {
                                                                field: 'harga_pusat',
                                                                headerText: 'Pusat',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateHargaPusat,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                            },
                                                            {
                                                                field: 'harga_pph',
                                                                headerText: 'PPH',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateHargaPph,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                            },
                                                        ]}
                                                        headerText="Harga"
                                                        textAlign="Center"
                                                        headerTemplate={headerTemplateHarga}
                                                    />
                                                    <ColumnDirective
                                                        field="berat"
                                                        headerText="Berat Pabrik(Kg)"
                                                        headerTextAlign="Center"
                                                        format="N2"
                                                        textAlign="Right"
                                                        width="70"
                                                        headerTemplate={headerTemplateBeratPabrik}
                                                        valueAccessor={checkValueAccessorGlobal}
                                                        editType="numericedit"
                                                        edit={editFormatNumber}
                                                        allowEditing={false}
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'jumlah_mu',
                                                                headerText: 'Cabang',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateJumlahCabang,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                                allowEditing: false,
                                                            },
                                                            {
                                                                field: 'jumlah_pusat',
                                                                headerText: 'Pabrik',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateJumlahPabrik,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                                editType: 'numericedit',
                                                                edit: editFormatNumber,
                                                                allowEditing: false,
                                                            },
                                                            {
                                                                field: 'jumlah_pph',
                                                                headerText: 'PPH',
                                                                format: 'N2',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                //autoFit
                                                                width: '100',
                                                                headerTemplate: headerTemplateJumlahPph,
                                                                valueAccessor: checkValueAccessorGlobal,
                                                            },
                                                        ]}
                                                        headerText="Jumlah"
                                                        textAlign="Center"
                                                        headerTemplate={headerTemplateJumlah}
                                                    />
                                                    <ColumnDirective
                                                        field="no_kontrak"
                                                        headerText="No. Kontrak Pabrik / Supplier"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        width="200"
                                                        headerTemplate={headerTemplateNoKontrak}
                                                        allowEditing={false}
                                                    />
                                                </ColumnsDirective>

                                                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                            </GridComponent>

                                            <div className="panel-pager">
                                                <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                    <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                        <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                            <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                    <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                        <div className="mt-1 flex">
                                                                            <div className="flex" style={{ width: '42%' }}>
                                                                                <div style={{ width: '30%' }}>
                                                                                    <div className="set-font-11">
                                                                                        <b>Total Berat Pabrik :</b>
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ width: '70%' }}>
                                                                                    <div className="set-font-11">
                                                                                        <b>{stateDataDetail.totalBeratPabrik.toFixed(2)} Kg</b>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {masterDataState === 'EDITKONSOLIDASIRBA' ||
                                                                            masterDataState === 'APPKONSOLIDASIRBA' ||
                                                                            masterDataState === 'APPROVAL' ? null : (
                                                                                <>
                                                                                    {/* <ButtonComponent
                                                                                        id="buAdd1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-primary e-small"
                                                                                        iconCss="e-icons e-small e-plus"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                    /> */}
                                                                                    {/* <ButtonComponent
                                                                                    id="buEdit1"
                                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                    cssClass="e-primary e-small"
                                                                                    iconCss="e-icons e-small e-edit"
                                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                    onClick={() => DetailBarangEdit(gridTtbList)}
                                                                                /> */}
                                                                                    {/* <ButtonComponent
                                                                                        id="buDelete1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-warning e-small"
                                                                                        iconCss="e-icons e-small e-trash"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                    />
                                                                                    <ButtonComponent
                                                                                        id="buDeleteAll1"
                                                                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                        cssClass="e-danger e-small"
                                                                                        iconCss="e-icons e-small e-erase"
                                                                                        style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                    /> */}
                                                                                </>
                                                                            )}
                                                                            <div className="set-font-11" style={{ marginLeft: 'auto', marginRight: '2em' }}>
                                                                                <b>Jumlah Barang :</b>&nbsp;&nbsp;&nbsp;{stateDataDetail.totalBarang}
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
                                            <div className="flex">
                                                <div style={{ width: '28%' }}>
                                                    <label style={{ marginLeft: '13px', fontSize: '11px' }}>Daftar File Dokumen Pendukung :</label>
                                                    <div
                                                        className="border p-3"
                                                        style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '360px', marginLeft: '10px', overflowY: 'scroll' }}
                                                    >
                                                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                            {files.map((file, index) => (
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
                                                                    <span
                                                                        style={{ flex: 1, marginLeft: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}
                                                                    >
                                                                        {file.name}
                                                                    </span>
                                                                    {/* <button onClick={() => clearFile(index)} style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                                        Hapus
                                                                    </button> */}
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
                                                    {masterDataState === 'BARU' || masterDataState === 'EDIT' || masterDataState === 'APPROVAL' ? (
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
                                                                    height: '8%',
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
                                                                    height: '8%',
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
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        className="btn mb-2 h-[4.5vh]"
                                                        style={{
                                                            backgroundColor: '#3b3f5c',
                                                            color: 'white',
                                                            width: '20%',
                                                            height: '8%',
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
                                                            height: '8%',
                                                            marginTop: -7,
                                                            borderRadius: '5px',
                                                            fontSize: '11px',
                                                        }}
                                                        onClick={() => handlePreview(documentData)}
                                                        // onClick={() => handleUpload('RE0000000084')}
                                                    >
                                                        Preview
                                                    </button>
                                                    {/* <button
                                                        type="button"
                                                        className="btn mb-2 h-[4.5vh]"
                                                        style={{
                                                            backgroundColor: '#3b3f5c',
                                                            color: 'white',
                                                            width: '17%',
                                                            height: '8%',
                                                            marginTop: -7,
                                                            borderRadius: '5px',
                                                            fontSize: '11px',
                                                        }}
                                                        onClick={() => handleUpload('BA0000000173')}
                                                    >
                                                        Test
                                                    </button> */}
                                                </div>
                                                {/* <div style={{ width: '100%', marginTop: '20px' }}>{openPreview()}</div> */}
                                            </div>
                                        </div>
                                    </div>
                                </TabComponent>
                            </div>

                            {/* ===============  Master Footer Data ========================   */}

                            <div className="mt-1">
                                <div className="flex">
                                    <div style={{ width: '50%' }}>
                                        <p className="set-font-11">
                                            <b>Keterangan :</b>
                                        </p>
                                        <div style={{ width: '98%' }}>
                                            <textarea
                                                disabled={masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? true : false}
                                                value={stateDataFooter.ket}
                                                style={{ width: '100%', height: '50px', border: '1px solid #888', resize: 'none' }}
                                                onChange={(event) => {
                                                    setStateDataFooter((prevState) => ({
                                                        ...prevState,
                                                        ket: event.target.value,
                                                    }));
                                                }}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div style={{ width: '35%' }}>
                                        <p className="set-font-11">
                                            <b>Catatan untuk departemen keuangan :</b>
                                        </p>
                                        <div style={{ width: '95%' }}>
                                            <textarea
                                                disabled={masterDataState === 'EDITKONSOLIDASIRBA' || masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL' ? true : false}
                                                value={stateDataFooter.catatanDepKeuangan}
                                                style={{ width: '100%', height: '50px', border: '1px solid #888', resize: 'none' }}
                                                onChange={(event) => {
                                                    setStateDataFooter((prevState) => ({
                                                        ...prevState,
                                                        catatanDepKeuangan: event.target.value,
                                                    }));
                                                }}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div style={{ width: '15%', marginTop: '7px' }}>
                                        <div className="flex">
                                            <div style={{ width: '50%' }}>
                                                <label style={{ color: 'black' }}>Total FJ</label>
                                            </div>
                                            <div style={{ width: '50%' }}>
                                                <div style={{ textAlign: 'right', color: 'black', fontWeight: 'bold' }}>{frmNumber(stateDataFooter.totalFj)}</div>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <div style={{ width: '50%' }}>
                                                <label style={{ color: 'black' }}>Total Pabrik</label>
                                            </div>
                                            <div style={{ width: '50%' }}>
                                                <div style={{ textAlign: 'right', color: 'black', fontWeight: 'bold' }}>{frmNumber(stateDataFooter.totalPabrik)}</div>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <div style={{ width: '50%' }}>
                                                <label style={{ color: 'black' }}>Beban Cabang</label>
                                            </div>
                                            <div style={{ width: '50%' }}>
                                                <div style={{ textAlign: 'right', color: 'red', fontWeight: 'bold' }}>{frmNumber(stateDataFooter.bebanCabang)}</div>
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
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
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
                        {(masterDataState === 'BARU' || masterDataState === 'EDIT' || masterDataState === 'APPROVAL' || masterDataState === 'APPKONSOLIDASIRBA') && (
                            <ButtonComponent
                                id="buBatalDokumen1"
                                content="Batal"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 3.2 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={closeDialogRbaList}
                            />
                        )}
                        {(masterDataState === 'BARU' || masterDataState === 'EDIT') && (
                            <ButtonComponent
                                id="buSimpanDokumen1"
                                content="Simpan"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-save"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => prosesBloking('simpan')}
                                // disabled={disableTombolSimpan}
                            />
                        )}
                        {(masterDataState === 'APPKONSOLIDASIRBA' || masterDataState === 'APPROVAL') && (
                            <>
                                <ButtonComponent
                                    id="buDisetujui"
                                    content="Disetujui"
                                    cssClass="e-primary e-small"
                                    // iconCss="e-icons e-small e-save"
                                    style={{ height: '28px', float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 2.3 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={() => prosesBloking('disetujui')}
                                    // disabled={disableTombolSimpan}
                                />
                                <ButtonComponent
                                    id="buKoreksi"
                                    content="Koreksi"
                                    cssClass="e-primary e-small"
                                    // iconCss="e-icons e-small e-save"
                                    style={{ height: '28px', float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 2.3 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={() => prosesBloking('koreksi')}
                                    // disabled={disableTombolSimpan}
                                />
                                <ButtonComponent
                                    id="buDitolak"
                                    content="Ditolak"
                                    cssClass="e-primary e-small"
                                    // iconCss="e-icons e-small e-save"
                                    style={{ height: '28px', float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 2.3 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={() => prosesBloking('ditolak')}
                                    // disabled={disableTombolSimpan}
                                />
                            </>
                        )}

                        {masterDataState === 'EDITKONSOLIDASIRBA' && (
                            <ButtonComponent
                                id="buTutup1"
                                content="Tutup"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-save"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 2.3 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={closeDialogRbaList}
                            />
                        )}
                    </div>
                    {/* ============================================================ */}
                    {stateDataHeader.isOpenPreview && (
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
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                }}
                            >
                                <img
                                    src={stateDataHeader.imageDataUrl}
                                    alt={`Zoomed ${stateDataHeader.indexPreview}`}
                                    style={{
                                        transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                        transition: 'transform 0.1s ease',
                                        cursor: 'pointer',
                                        maxWidth: '100vw',
                                        maxHeight: '100vh',
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                />
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
                                <ButtonComponent
                                    id="zoomIn"
                                    cssClass="e-primary e-small"
                                    iconCss=""
                                    style={{
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                    }}
                                >
                                    <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={handleZoomIn}></span>
                                </ButtonComponent>

                                <ButtonComponent
                                    id="zoomOut"
                                    cssClass="e-primary e-small"
                                    iconCss=""
                                    style={{
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                    }}
                                >
                                    <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={handleZoomOut}></span>
                                </ButtonComponent>

                                <ButtonComponent
                                    cssClass="e-primary e-small"
                                    style={{
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        marginTop: '-10px',
                                    }}
                                >
                                    <span className="e-icons e-undo" style={{ fontSize: '32px' }} onClick={handleRotateLeft}></span>
                                </ButtonComponent>
                                <ButtonComponent
                                    cssClass="e-primary e-small"
                                    style={{
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        marginTop: '-20px',
                                    }}
                                >
                                    <span className="e-icons e-redo" style={{ fontSize: '32px' }} onClick={handleRotateRight}></span>
                                </ButtonComponent>

                                <ButtonComponent
                                    id="close"
                                    cssClass="e-primary e-small"
                                    iconCss=""
                                    style={{
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '24px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                    }}
                                >
                                    <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={handleCloseZoom}></span>
                                </ButtonComponent>
                            </div>
                        </div>
                    )}

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
                <GlobalProgressBar />
            </DialogComponent>

            <DialogDaftarFbm
                kode_entitas={kode_entitas}
                token={token}
                visible={dialogDaftarFbmVisible}
                stateDataDaftarFbm={stateDataDaftarFbm}
                stateDataDaftarFbmOriginal={stateDataDaftarFbmOriginal}
                vRefreshData={vRefreshData.current}
                setDialogDaftarFbmVisible={setDialogDaftarFbmVisible}
                setStateDataHeader={setStateDataHeader}
                stateDataHeader={stateDataHeader}
                gridRbaListRef={gridRbaListRef.current}
                setStateDataFooter={setStateDataFooter}
                stateDataFooter={stateDataFooter}
            />
            {/*==================================================================================================*/}
        </div>
    );
};

export default DialogRba;
