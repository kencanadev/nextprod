import React, { useEffect, useRef, useState } from 'react';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, ChangeEventArgs } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { frmNumber, generateNU } from '@/utils/routines';
import moment from 'moment';
import axios from 'axios';

import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import { loadCldr, L10n, DragEventArgs } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import Image from 'next/image';
import DialogListVendor from './DialogListVendor';
import DialogListBarang from './DialogListBarang';
import { FillFromSQL } from '@/utils/routines';
import DialogListKendaraan from './DialogListKendaraan';
import { editTemplateAkunBarang, editTemplateKendaraan, editTemplateSatuanBarang } from './template';
import { Recalc, SpreadNumber, swalToast, validate } from '../utils';
import { useSupplier } from '@/lib/fa/fpp/hooks/useSupplier';
import { useBarang } from '@/lib/fa/fpp/hooks/useBarang';
import { useKendaraan } from '@/lib/fa/fpp/hooks/useKendaraan';
import DialogListEntitas from './DialogListEntitas';
import { useEntitas } from '@/lib/fa/fpp/hooks/useEntitas';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import useUploadFiles2 from '@/lib/fa/fpp/hooks/useUploadFiles2';

L10n.load(idIDLocalization);

interface DialogFrmFppProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    kode_entitas: string;
    statusPage: string;
    userid: string;
    kode_dokumen: string;
    kode_user: string;
    onRefresh: Function;
    statusFpp: string;
    approval: any;
    entitas_user: string;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const resPdf =
    'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAbbSURBVHhe7dx5bBVVFMfxU1pKacvashXZZBEwVaL8oWIJBKICCiggiIpL1KhBBRUsIZZoRCUqGncxSEAxkSCIuOAKQUWERmVzDSBbkaVgKRTaQuu7M4e8PtrSecC0M2++n3/eOfeVQNIfc+/cd+cJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4CFx+upbH6ZIuZa+EPrHzhh5RLK1jVn19BW1JPQ/+bGFKfKstjGLYNWBIISLYNWSnpOnamWL9XARrFrS5d7xgQoXwapFQQoXwaplQQkXwaoDQQgXwaojsR4uglWHYjlcBKuOxWq4CJYHxGK4CJZHxFq4CJaHxFK4CJbHxEq4CJYHxUK4CJZH+T1cBMvD/BwuguVxfg0XwfIBP4aLYPlEdeHS0nMIlo9UFS6vCoXe3/z2lM65NuKIN3+HXLHgCoIFVxAsuIJgwRUEC64gWHAFwYIrCFYUkjt0lN6z5srgzbtleP4xGbB6nXQcd6e+i4rYIHUopdP50m/5ammQ3kJHwjbmZMtfM2doV7vYIPW5bhMmVxkqo0d2jjRo0VI7GATLibg4aTd6rDaVxScnS8awG7SDQbAcSGrdRhJSG2ln+/2ZJ7WyNc3spRUMguVAYtNmWoUV/vm7VraE1FStYBAsB4r379MqLCV0h1hRWWmpVjAIlgMl+fvl+JHD2tnSrsjSylZWXKwVDILlQHlZmRxY+5N2tvQr+2plK9qxTSsYBMuh/FXfa2VLSIlcUxX+9YdWMAiWQ3lLF2tVtcI/IhfzQUewHCrYsE4O/bZRu0ilhYfk8Oa/tYNBsKKwbf5crSKZabL8xAntYBCsKGyd/ZaUFvynXdj+H1ZqhZMIVhSOHy6ULW+/oV1YdVNkkBGsKB3Ijdx2MLpNnGx9nogwghWljCHDtApL79OXc1mnIFhRiEtIkDaDr9MuUub05yS5XXvtQLCi0CKrnySmpWsXqX7TZtJ79nsSFx+vI8FGsKLQ/ubbtLIV792jlS39iizpnp2jXbARLIcSGjWWtkMjD/OtuWOs7F3+tXa2HtmPy3kjx2gXXATLoXajxlgnRU86snWz7Fu5XHLvHhd5rCZ0d3jp67Ol2SW9dSCYCJZD5991n1a2be/OESkvl2P/7pa1oStXxfNYJoB9lnwhTS6KPFVq1l/J7TtYd5HmJqDt9aOk9TVDpGmvS6Re/fr6U7GBp3QcaNG3v2R99q129qG+ZT07yrHdeToSWn/ddKv1aFjF/SxzjuvvV1+Uxj0utEKW2rlrtQE6UVQkOxa8L5uemCrF+/bqaM28+pQOwXLg8g+WSJshQ7UT2blogawZN1q7sIuenSldxk/U7swU7dguK/pfZl0JneDxL59K7dJNWg+6VjvbljdftV7N1adlvwGS+fTzMnDtxrMOlWH2wnpMmaadf3HFqkHvt+dZ09xJ5iGKDVMnSdvhI62rWGKz5vqOc2YqNR9cl4QW/WbTtVHXC6TxhZn6rj2FftKh6mcYT8VU6BI3g2V+4QNzN53Rpmf58eNScvBAtQ+ylpWUSNH2f6Qs9HNJLVtJYvM0fScUrNCf+6RduD8dpkIf6j4lJ6pQmS2ILbNekx/HDJeloWCYBb45alOVeomJ1jTbuHvPiFAZB3PXaOVfXLGqkNSqtXSdMEm63P9QjcEyJ0vNseW8jxdLwcb1Ohqp1cCrpWfOU472tszTQN8N6i8Hf87VkdNjKnTJuQxWUpsM6whMpzvukfiGDXW0MrPNsP2D+bL9/XlRncVqNeAqyRg2wtq7apjRVkdtJ44elT1fLZPfpk+TQ5s26GjNCJZLzkWwTIgumDRVuj74iMQnJeloZWanffMbL8vuz5ae9VHkhJSUULjOk3qhv8+cSj2at8tal0WLYLnkbINlriK9XnpdUjp11pHKzN7SjzcOtaY9r2Hx7jHmY5dL35xjffRyulAZvzx0rydD5WWBDJZZnPf7ZpV0uOV2HameWUft+fJz7eBU4IJlDuRlLVshTTIv1pHqmfNW67Mf1g7RCFywer3wirXxWZFZQ5kNy1P9+vB4KTmQrx2iEahgme9bOPUQntnUNHdjZsOyoq3vzJJdHy3UDtEKVLAS09IqbXiahbv54tqK8levknWPPqAdzkSggnV0544aj6MUrP9VVo28tsqpEc4FKljme67Muqm6jUgz9X03ZICU/ndQR3CmArd4z/t4kawc1N/aRS89VGB9U8y/yz6VH4ZdLT/dMso6WYCzx0c6PsfOOwKFYMEVBAuuIFhwBcGCKwgWXEGw4AqCBVcQLLiCYMEVBAsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAjRP4H3ioVWRJnzY0AAAAASUVORK5CYII=';

const DialogFrmFpp: React.FC<DialogFrmFppProps> = ({ isOpen, onClose, token, kode_entitas, statusPage, userid, kode_dokumen, kode_user, onRefresh, statusFpp, approval, entitas_user }) => {
    // MASTER DATA
    const [selectedRowIndex, setSelectedRowIndex] = useState<any>(0);
    const [selectedRowIdx, setSelectedRowIdx] = useState<any>(0);
    const [isAmountFocused, setIsAmountFocused] = useState(false);
    const [isAmountFocused2, setIsAmountFocused2] = useState(false);
    const [masterData, setMasterData] = useState<any>({
        no_fpp: '',
        tgl_fpp: moment().format('DD-MM-YYYY'),
        kode_entitas: entitas_user,
        tgl_harus_bayar: moment().add(3, 'days').format('DD-MM-YYYY'),
        nama_bank: '',
        no_rekening: '',
        nama_rekening: '',
        diskon_dok: 0,
        diskon_dok_mu: 0,
        keterangan: '',
        total_rp: 0,
        diskon_dok_rp: 0,
        total_diskon_rp: 0,
        kirim_rp: 0,
        netto_rp: 0,
        status: '',
        userid: '',
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        approval: '0',
        tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
        status_export: '',
        tgl_bayar: moment().format('DD-MM-YYYY'),
        lunas_rp: 0,
        no_reff: '',
        user_input: userid?.toUpperCase(),
        jenis_bayar: '',
        kode_supp: '',
        no_supp: '',
        nama_supp: '',

        // exclude
        bayar_rp: 0,
        sisa_rp: 0,
        terbilang: '',
    });

    const [dataM, setDataM] = useState<any>({});
    const [dataD, setDataD] = useState<any>([]);
    const [selectedPengajuan, setSelectedPengajuan] = useState<any>(0);
    const [selectedPembayaran, setSelectedPembayaran] = useState<any>(0);

    const updateState = (field: any, value: any) => {
        setMasterData((prevState: any) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const gridFppList = useRef<GridComponent>(null);

    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

    // UPLOAD FILES
    const {
        dataFiles,
        handleDownloadImage,
        handleFileSelect,
        handleRemove,
        handleUpload,
        imageSrc,
        selectedHead,
        setDataFiles,
        setJsonImageEdit,
        setSelectedHead,
        updateStateFiles,
        uploaderRefPembayaran1,
        uploaderRefPembayaran2,
        uploaderRefPembayaran3,
        uploaderRefPembayaran4,
        uploaderRefPembayaran5,
        uploaderRefPengajuan1,
        uploaderRefPengajuan2,
        uploaderRefPengajuan3,
        uploaderRefPengajuan4,
        uploaderRefPengajuan5,
    } = useUploadFiles2({
        apiUrl,
        kode_entitas,
        statusPage,
        kode_dokumen,
    });

    const disabledInput = (() => {
        if (statusPage === 'CREATE') return false;

        if ((statusFpp || '').toLowerCase() === 'lunas') {
            return true;
        }

        // Condition 2: Disable if approval is 1 or 2 AND user is not from entity 898
        if ((approval == '1' || approval == '2') && entitas_user !== '899') {
            return true;
        }

        // Otherwise, don't disable
        return false;
    })();

    const disabledBtn = (() => {
        if (statusPage === 'CREATE') return false;
        if (statusPage === 'EDIT' && statusFpp === 'Lunas' && entitas_user !== '899') return true;
        if (statusPage === 'EDIT' && approval == '0') return false;
        if (statusPage === 'UPDATE-FILE' && entitas_user === '899') return false;
        if (statusPage === 'APPROVAL') return false;
        if ((approval == '1' || approval == '2') && entitas_user === '899') return false;
        return true;
    })();

    // LOAD IMAGE PENGAJUAN
    useEffect(() => {
        const getStateIndex = (id: number) => {
            if (id >= 1 && id <= 5) return id - 1;
            if (id >= 20 && id <= 24) return id - 15;
            return null;
        };

        const loadImages = async () => {
            if (statusPage === 'EDIT' || statusPage === 'APPROVAL' || statusPage === 'UPDATE-FILE' || statusPage === 'PEMBAYARAN') {
                try {
                    // Load images data
                    const loadtbImages = await axios.get(`${apiUrl}/erp/load_images`, {
                        params: {
                            entitas: kode_entitas,
                            param1: kode_dokumen,
                        },
                    });

                    const result = loadtbImages.data.data;
                    setJsonImageEdit(result);

                    // Process each image from the result
                    const imageLoadPromises = result.map(async (item: any) => {
                        try {
                            const response = await axios.get(`${apiUrl}/erp/load_fileGambar_byId`, {
                                params: {
                                    entitas: kode_entitas,
                                    param1: kode_dokumen,
                                    param2: item.id_dokumen,
                                },
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            return {
                                ...item,
                                imageData: response.data,
                                status: 'fulfilled',
                            };
                        } catch (error) {
                            console.error(`Error loading image for id_dokumen=${item.id_dokumen}:`, error);

                            // Return item dengan informasi error, tapi tetap disertakan dalam hasil
                            return {
                                ...item,
                                imageData: null, // atau nilai default yang sesuai
                                error: error,
                                status: 'rejected',
                            };
                        }
                    });

                    // Wait for all image loads to complete, termasuk yang error
                    const results = await Promise.allSettled(imageLoadPromises);

                    // Ambil semua hasil, baik yang sukses maupun gagal
                    const loadedImages = results.map((result) => {
                        // Untuk promise yang resolved secara normal
                        if (result.status === 'fulfilled') {
                            return result.value;
                        }
                        // Untuk promise yang rejected, gunakan data dari error handler di atas
                        // Dengan Promise.allSettled() seharusnya tidak pernah masuk ke sini karena
                        // kita sudah menangani error di dalam map function
                        return result.reason || { status: 'rejected', error: 'Unknown error' };
                    });

                    // Set states based on id_dokumen ranges
                    loadedImages.forEach((image) => {
                        console.log('IMAGES: ', image);
                        const { id_dokumen, filegambar, imageData, fileoriginal, status } = image;

                        // Helper function to determine state index
                        const stateIndex = getStateIndex(Number(id_dokumen));

                        if (stateIndex !== null) {
                            // Update preview state jika data tersedia
                            const previewStateName = `preview${stateIndex + 1}`;
                            if (status === 'fulfilled' && imageData && imageData.data && imageData.data[0]) {
                                updateStateFiles(previewStateName, imageData.data[0].decodeBase64_string);
                            } else {
                                // Opsional: Set nilai default atau placeholder jika image gagal diload
                                updateStateFiles(previewStateName, ''); // atau gambar placeholder
                            }

                            // Update name state
                            const nameStateName = `nameImage${stateIndex + 1}`;
                            updateStateFiles(nameStateName, filegambar);

                            // Update name original
                            const originalNameState = `nameOriginal${stateIndex + 1}`;
                            updateStateFiles(originalNameState, fileoriginal);
                        }
                    });

                    // Handle ZIP file if exists
                    const zipData = result.find((item: any) => item.id_dokumen === '999');
                    if (zipData) {
                        const loadImage = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                            params: {
                                entitas: kode_entitas,
                                nama_zip: zipData.filegambar,
                            },
                        });

                        const images = loadImage.data.images;

                        images.forEach((fileUri: any) => {
                            const matchingImage = result.find((item: any) => item.filegambar === fileUri.fileName);
                            if (matchingImage) {
                                const stateIndex = getStateIndex(Number(matchingImage.id_dokumen));
                                if (stateIndex !== null) {
                                    updateStateFiles(`preview${stateIndex + 1}`, fileUri.imageUrl);
                                    updateStateFiles(`nameImage${stateIndex + 1}`, fileUri.fileName);
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error loading images:', error);
                }
            }
        };

        loadImages();
    }, [kode_entitas, kode_dokumen, statusPage]);

    // IMAGE DOWNLOAD & PREVIEW
    const [modalPreview, setModalPreview] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    const handlePreviewImage = (jenis: string) => {
        // console.log('imageSrc: ', imageSrc);

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

    // GLOBAL
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }
    useEffect(() => {
        const dialogElement = document.getElementById('dialogFrmFpp');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    const handleCreate = async () => {
        const result = await generateNU(kode_entitas, '', '22', moment().format('YYYYMM'));
        if (result) {
            updateState('no_fpp', result);
        } else {
            console.error('undefined');
        }
    };

    // Handle Edit
    const handleEdit = async () => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: kode_dokumen,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master } = response.data.data;
        setDataM(master);

        updateState('no_fpp', master.no_fpp);
        updateState('tgl_fpp', moment(master.tgl_fpp).format('DD-MM-YYYY'));
        updateState('kode_entitas', master.kode_entitas);
        updateState('tgl_harus_bayar', moment(master.tgl_harus_bayar).format('DD-MM-YYYY'));
        updateState('tgl_bayar', moment(master.tgl_harus_bayar).format('DD-MM-YYYY'));
        updateState('nama_bank', (master.nama_bank || '').toUpperCase().trim());
        updateState('no_rekening', master.no_rekening);
        updateState('nama_rekening', master.nama_rekening);
        updateState('diskon_dok', master.diskon_dok);
        updateState('diskon_dok_mu', master.diskon_dok_mu);
        updateState('keterangan', master.keterangan);
        updateState('total_rp', master.total_rp);
        updateState('diskon_dok_rp', master.diskon_dok_rp);
        updateState('total_diskon_rp', master.total_diskon_rp);
        updateState('kirim_rp', master.kirim_rp);
        updateState('netto_rp', master.netto_rp);
        updateState('status', master.status);
        updateState('userid', master.userid);
        updateState('status_export', master.status_export);
        updateState('lunas_rp', master.lunas_rp);
        updateState('no_reff', master.no_reff);
        updateState('user_input', master.user_input);
        updateState('jenis_bayar', master.jenis_bayar);
        updateState('kode_supp', master.kode_supp);
        updateState('no_supp', master.no_supp);
        updateState('nama_supp', master.nama_supp);
        updateState('approval', String(master.approval));

        const { detail } = response.data.data;
        setDataD(detail);

        if (detail.length > 0) {
            const mappedBarang = detail.map((item: any) => ({
                ...item,
                harga_mu: SpreadNumber(item.harga_mu),
                harga_baru_mu: SpreadNumber(item.harga_baru_mu),
                diskon_mu: SpreadNumber(item.diskon_mu),
                potongan_mu: SpreadNumber(item.potongan_mu),
                jumlah_mu: SpreadNumber(item.jumlah_rp),
            }));
            gridFppList.current!.dataSource = mappedBarang;
        }
    };

    const fetchData = () => {
        try {
            if (statusPage === 'CREATE') {
                handleCreate();
            } else {
                handleEdit();
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat memuat data:', error);
        }
    };

    // console.log('modalPreview',modalPreview);

    useEffect(() => {
        fetchData();
    }, [statusPage, kode_entitas, token]);

    // Save Doc
    const saveDoc = async (flag: string) => {
        let modifiedDetailJurnal;

        if (Array.isArray(gridFppList.current!.dataSource)) {
            // modified jurnalo
            modifiedDetailJurnal = gridFppList.current!.dataSource.map((item: any) => ({
                ...item,
                kode_fpp: statusPage === 'CREATE' ? '' : kode_dokumen,
                qty_std: item.qty,
                jumlah_rp: item.jumlah_mu,
            }));
        }

        // validasi
        const validationResult = validate(gridFppList.current!, masterData, statusPage);

        if (!validationResult!.isValid) {
            swal.fire({
                icon: 'warning',
                text: validationResult!.message,
                target: '#dialogFrmFpp',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        // Validasi untuk file pengajuan (preview1-preview5)
        const hasAnySubmissionFile = [dataFiles.preview1, dataFiles.preview2, dataFiles.preview3, dataFiles.preview4, dataFiles.preview5].some((preview) => preview !== '');

        // Validasi untuk file pembayaran (preview6-preview10)
        const hasAnyPaymentFile = [dataFiles.preview6, dataFiles.preview7, dataFiles.preview8, dataFiles.preview9, dataFiles.preview10].some((preview) => preview !== '');

        // validasi file pengajuan
        if (!hasAnySubmissionFile) {
            swal.fire({
                icon: 'warning',
                text: 'File pendukung pengajuan belum di upload',
                showConfirmButton: false,
                timer: 1500,
                target: '#dialogFrmFpp',
            });
            return;
        }

        // validasi file pembayaran
        if (statusPage === 'PEMBAYARAN' && !hasAnyPaymentFile) {
            swal.fire({
                icon: 'warning',
                text: 'File pendukung pembayaran belum di upload',
                showConfirmButton: false,
                timer: 1500,
                target: '#dialogFrmFpp',
            });
            return;
        }

        const noFpp = await generateNU(kode_entitas, '', '22', moment().format('YYYYMM'));

        const date = moment(masterData.tgl_fpp, 'DD-MM-YYYY')
            .set({
                hour: moment().hours(),
                minute: moment().minutes(),
                second: moment().seconds(),
            })
            .format('YYYY-MM-DD HH:mm:ss');

        const tglBayar = moment(masterData.tgl_bayar, 'DD-MM-YYYY')
            .set({
                hour: moment().hours(),
                minute: moment().minutes(),
                second: moment().seconds(),
            })
            .format('YYYY-MM-DD HH:mm:ss');
        const tglHarusBayar = moment(masterData.tgl_harus_bayar, 'DD-MM-YYYY')
            .set({
                hour: moment().hours(),
                minute: moment().minutes(),
                second: moment().seconds(),
            })
            .format('YYYY-MM-DD HH:mm:ss');

        const reqBody = {
            entitas: kode_entitas,
            // kode_fpp: statusPage === 'EDIT' || statusPage === 'APPROVAL' ? kode_dokumen : '',
            kode_fpp: statusPage === 'CREATE' ? '' : kode_dokumen,
            // no_fpp: statusPage === 'EDIT' || statusPage === 'APPROVAL' ? masterData.no_fpp : noFpp,
            no_fpp: statusPage === 'CREATE' ? noFpp : masterData.no_fpp,
            tgl_fpp: date,
            kode_entitas: masterData.kode_entitas,
            tgl_harus_bayar: tglHarusBayar,
            nama_bank: masterData.nama_bank.trim(),
            no_rekening: masterData.no_rekening,
            nama_rekening: masterData.nama_rekening,
            diskon_dok: masterData.diskon_dok,
            diskon_dok_mu: masterData.diskon_dok_mu,
            keterangan: masterData.keterangan,
            total_rp: masterData.total_rp,
            diskon_dok_rp: masterData.diskon_dok_rp,
            total_diskon_rp: masterData.total_diskon_rp,
            kirim_rp: masterData.kirim_rp,
            netto_rp: masterData.netto_rp,
            status: 'Terbuka',
            userid: (userid || '').toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            approval: String(masterData.approval),
            tgl_approval: masterData.tgl_approval,
            status_export: 'Baru',
            tgl_bayar: tglBayar,
            lunas_rp: masterData.lunas_rp,
            no_reff: masterData.no_reff,
            user_input: (userid || '').toUpperCase(),
            jenis_bayar: masterData.jenis_bayar,
            kode_supp: masterData.kode_supp,
            no_supp: masterData.no_supp,
            nama_supp: masterData.nama_supp,
            cek_nota_asli: null,
            user_cek_nota_asli: null,
            tgl_cek_nota_asli: null,
            cek_nota_coret: null,
            user_cek_nota_coret: null,
            tgl_cek_nota_coret: null,
            filegambar: null,
            tgl_scan: null,
            user_scan: null,
            detail: modifiedDetailJurnal,
        };

        // console.log(reqBody);

        try {
            startProgress();
            let responseAPI;
            let itemLen = 0;
            if (Array.isArray(gridFppList.current!.dataSource)) {
                itemLen = gridFppList.current!.dataSource.length;
            }

            // SIMPAN / UPDATE DATA BODY
            if (statusPage === 'CREATE') {
                responseAPI = await axios.post(`${apiUrl}/erp/simpan_fpp`, reqBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (statusPage === 'EDIT') {
                if ((statusFpp || '').toLowerCase() === 'lunas') {
                    const body = {
                        ...dataM,
                        userid: masterData.user_input,
                        tgl_approval: dataM.tgl_approval === null ? null : moment(dataM.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_bayar: dataM.tgl_bayar === null ? null : moment(dataM.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_fpp: dataM.tgl_fpp === null ? null : moment(dataM.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_harus_bayar: dataM.tgl_harus_bayar === null ? null : moment(dataM.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_cek_nota_asli: dataM.tgl_cek_nota_coret === null ? null : moment(dataM.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_update: dataM.tgl_update === null ? null : moment(dataM.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_cek_nota_coret: dataM.tgl_cek_nota_coret === null ? null : moment(dataM.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
                        detail: [...dataD],
                        entitas: kode_entitas,
                    };

                    responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, body, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    responseAPI = await axios.patch(
                        `${apiUrl}/erp/update_fpp`,
                        { ...reqBody, user_input: masterData.user_input },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                }
            } else if (statusPage === 'APPROVAL') {
                const userAccess = await axios.get(`${apiUrl}/erp/users_akses?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kode_user,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const user_app_fpp = userAccess.data.data[0].app_fpp;

                if (flag === 'approval') {
                    const modifiedBody = {
                        ...reqBody,
                        approval: user_app_fpp,
                        user_input: masterData.user_input,
                    };

                    responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else if (flag === 'reject') {
                    const modifiedBody = {
                        ...reqBody,
                        approval: user_app_fpp,
                        status: 'Tolak',
                        user_input: masterData.user_input,
                    };

                    responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else if (flag === 'correction') {
                    const modifiedBody = {
                        ...reqBody,
                        approval: String(Number(user_app_fpp) - 1),
                        status: 'Koreksi',
                        user_input: masterData.user_input,
                    };

                    responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            } else if (statusPage === 'PEMBAYARAN') {
                const userAccess = await axios.get(`${apiUrl}/erp/users_akses?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kode_user,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const user_app_fpp = userAccess.data.data[0].app_fpp;

                const lunasRp = SpreadNumber(masterData.lunas_rp) + Number(masterData.bayar_rp);

                const modifiedBody = {
                    ...reqBody,
                    approval: '2',
                    lunas_rp: lunasRp,
                    status: lunasRp > 0 && lunasRp >= masterData.netto_rp ? 'Lunas' : 'Lunas Sebagian',
                    user_input: masterData.user_input,
                };

                responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (statusPage === 'UPDATE-FILE') {
                const body = {
                    ...dataM,
                    tgl_approval: dataM.tgl_approval === null ? null : moment(dataM.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_bayar: dataM.tgl_bayar === null ? null : moment(dataM.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_fpp: dataM.tgl_fpp === null ? null : moment(dataM.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_harus_bayar: dataM.tgl_harus_bayar === null ? null : moment(dataM.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_asli: dataM.tgl_cek_nota_coret === null ? null : moment(dataM.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: dataM.tgl_update === null ? null : moment(dataM.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_coret: dataM.tgl_cek_nota_coret === null ? null : moment(dataM.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
                    detail: [...dataD],
                    entitas: kode_entitas,
                };
                responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, body, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // CEK STATUS RESPONSEAPI
            if (responseAPI && responseAPI.data.status) {
                if (statusPage === 'CREATE') {
                    await generateNU(kode_entitas, noFpp, '22', moment().format('YYYYMM'));

                    handleUpload(responseAPI.data.data.kodeFPP);

                    // Save Audit
                    const auditBody = {
                        entitas: kode_entitas,
                        kode_audit: null,
                        dokumen: 'FP',
                        kode_dokumen: responseAPI.data.kode_fpp,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'NEW',
                        diskripsi: `FP item = ${itemLen} nilai transaksi = ${masterData.total_rp}`,
                        userid: (userid || '').toUpperCase(),
                        system_user: '',
                        system_ip: '',
                        system_mac: '',
                    };

                    await axios.post(`${apiUrl}/erp/simpan_audit`, auditBody);
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Input Data berhasil</p>`,
                        width: '100%',
                        target: '#dialogFrmFpp',
                    });
                    endProgress();
                } else if (statusPage === 'EDIT') {
                    handleUpload(kode_dokumen);
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Edit Data berhasil</p>`,
                        width: '100%',
                        target: '#dialogFrmFpp',
                    });
                    endProgress();
                } else if (statusPage === 'UPDATE-FILE') {
                    handleUpload(kode_dokumen);
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Update File Pendukung berhasil</p>`,
                        width: '100%',
                        target: '#dialogFrmFpp',
                    });
                    endProgress();
                } else if (statusPage === 'APPROVAL') {
                    handleUpload(kode_dokumen);
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Approve Data berhasil</p>`,
                        width: '100%',
                        target: '#dialogFrmFpp',
                    });
                    endProgress();
                } else if (statusPage === 'PEMBAYARAN') {
                    handleUpload(kode_dokumen);
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Pembayaran Data berhasil</p>`,
                        width: '100%',
                        target: '#dialogFrmFpp',
                    });
                    endProgress();
                }
            }

            setTimeout(() => {
                if (Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource.splice(0, itemLen);
                }
                swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });
                onClose();
                onRefresh();
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            endProgress();
        } finally {
            endProgress();
        }
    };

    // Supplier
    const {
        modalDaftarSupplier,
        setModalDaftarSupplier,
        listDaftarSupplier,
        filteredDataSupplier,
        setFilteredDataSupplier,
        searchNoSupp,
        setSearchNoSupp,
        searchNamaRelasi,
        setSearchNamaRelasi,
        selectedSupplier,
        setSelectedSupplier,
        PencarianSupplier,
        handlePilihVendor,
    } = useSupplier(apiUrl, token, kode_entitas, updateState, masterData);

    // Barang
    const {
        setShowModalBarang,
        PencarianBarang,
        handlePilihBarang,
        listDaftarBarang,
        searchDiskripsi,
        setFilteredDataBarang,
        setSearchDiskripsi,
        setSelectedBarang,
        showModalBarang,
        filteredDataBarang,
    } = useBarang(apiUrl, token, kode_entitas, selectedSupplier, selectedRowIndex, gridFppList.current!, statusPage, masterData);

    // Kendaraan
    const {
        PencarianKendaraan,
        filteredDataKendaraan,
        handlePilihKendaraan,
        listDaftarKendaraan,
        searchNopol,
        setFilteredDataKendaraan,
        setSearchNopol,
        setSelectedKendaraan,
        setShowModalKendaraan,
        showModalKendaraan,
    } = useKendaraan(apiUrl, masterData.kode_entitas, token, selectedRowIndex, gridFppList.current!);

    // Buttons
    let buttonsFrmFpp: ButtonPropsModel[];

    // Tambahan ini untuk button
    buttonsFrmFpp = [
        ...(statusPage === 'APPROVAL'
            ? [
                  {
                      buttonModel: {
                          content: 'Ditolak',
                          iconCss: 'e-icons e-small e-export-xls',
                          cssClass: 'e-primary e-small',
                          disabled: disabledBtn,
                      },
                      isFlat: false,
                      click: () => {
                          // Tambahkan fungsi untuk tombol "Proses" di sini
                          saveDoc('reject');
                      },
                  },
                  {
                      buttonModel: {
                          content: 'Koreksi',
                          iconCss: 'e-icons e-small e-annotation-edit',
                          cssClass: 'e-primary e-small',
                          disabled: disabledBtn,
                      },
                      isFlat: false,
                      click: () => {
                          // Tambahkan fungsi untuk tombol "Proses" di sini
                          saveDoc('correction');
                      },
                  },
              ]
            : []),
        {
            buttonModel: {
                content: statusPage === 'CREATE' || statusPage === 'EDIT' || statusPage === 'UPDATE-FILE' ? 'Simpan' : statusPage === 'APPROVAL' ? 'Disetujui' : 'Bayar',
                iconCss: statusPage === 'CREATE' || statusPage === 'EDIT' || statusPage === 'UPDATE-FILE' ? 'e-icons e-small e-save' : 'e-icons e-small e-check-box',
                cssClass: 'e-primary e-small',
                disabled: disabledBtn,
            },
            isFlat: false,
            click: () => {
                saveDoc('approval');
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                iconCss: 'e-icons e-small e-close',
                cssClass: 'e-primary e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: () => {
                onClose();
                if (Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource.splice(0, gridFppList.current!.dataSource.length);
                    gridFppList.current!.refresh();
                }
            },
        },
    ];

    const [tambah, setTambah] = useState(false);
    const [edit, setEdit] = useState(false);
    const [listSatuan, setListSatuan] = useState<any>([]);
    const [listBank, setListBank] = useState<any>([]);

    useEffect(() => {
        const fetchSatuan = async () => {
            await FillFromSQL(kode_entitas, 'satuan')
                .then((result: any) => {
                    setListSatuan(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        };

        const fetchBank = async () => {
            await axios
                .get(`${apiUrl}/erp/list_daftar_bank`, {
                    params: {
                        entitas: kode_entitas,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res: any) => {
                    // Buat data custom
                    const customData = {
                        nama_bank: '',
                        userid: '',
                        tgl_update: '',
                    };

                    // Tambahkan data custom ke array response
                    const updatedData = [...res.data.data, customData];

                    // Update state dengan data yang sudah ditambah
                    setListBank(updatedData);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        fetchBank();
        fetchSatuan();
    }, []);

    // ENTITAS
    const {
        filteredDataEntitas,
        handlePilihEntitas,
        pencarianEntitas,
        searchKodeCabang,
        searchNamaCabang,
        setSelectedEntitas,
        setShowModalEntitas,
        showModalEntitas,
        listDaftarEntitas,
        setFilteredDataEntitas,
        setSearchKodeCabang,
        setSearchNamaCabang,
    } = useEntitas(apiUrl, token, kode_entitas, updateState);

    const handleDiskripsiChange = (e: any, index: number) => {
        if (Array.isArray(gridFppList.current!.dataSource)) {
            gridFppList.current!.dataSource[index] = {
                ...gridFppList.current!.dataSource[index],
                diskripsi: e,
            };
            gridFppList.current?.refresh();
        }
    };

    const handleSatuanChange = (e: any, index: number) => {
        if (Array.isArray(gridFppList.current!.dataSource)) {
            gridFppList.current!.dataSource[index] = {
                ...gridFppList.current!.dataSource[index],
                satuan: e.value,
            };
            gridFppList.current?.refresh();
        }
    };

    const actionCompleteDetailJurnal = async (args: any) => {
        switch (args.requestType) {
            case 'save':
                const editedData = args.data;
                if (Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource[args.rowIndex] = editedData;
                }
                Recalc(gridFppList.current!, masterData, updateState);
                gridFppList.current!.refresh();
                break;
            case 'beginEdit':
                setTambah(false);
                setEdit(true);
                Recalc(gridFppList.current!, masterData, updateState);
                break;
            case 'delete':
                if (Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource.forEach((item: any, index: any) => {
                        item.id = index + 1;
                    });
                }
                gridFppList.current!.refresh();
                break;
            case 'refresh':
                Recalc(gridFppList.current!, masterData, updateState);
                setTambah(false);
                setEdit(false);
                break;
            default:
                break;
        }
    };

    const handleDataJurnal = async (jenis: any) => {
        let totalLine;
        let isNoBarangNotEmpty;
        let isSatuanNull;

        if (Array.isArray(gridFppList.current!.dataSource)) {
            totalLine = gridFppList.current!.dataSource.length;
            isNoBarangNotEmpty = gridFppList.current!.dataSource.every((item: any) => item.jumlah_mu > 0);
            isSatuanNull = gridFppList.current!.dataSource.some((item: any) => item.satuan === null);
        }

        // validasi
        if (masterData.nama_supp === '') {
            swal.fire({
                icon: 'warning',
                text: 'Data Vendor belum diisi',
                target: '#dialogFrmFpp',
                showConfirmButton: false,
                timer: 1500,
            });

            setTimeout(() => {
                setModalDaftarSupplier(true);
            }, 1700);
            return;
        }

        if (isSatuanNull) {
            swal.fire({
                icon: 'warning',
                text: 'Data Satuan belum diisi',
                target: '#dialogFrmFpp',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        if ((totalLine === 0 && jenis === 'new') || (isNoBarangNotEmpty && jenis === 'new')) {
            const detailBarangBaru = {
                id_fpp: totalLine! + 1,
                diskripsi: null,
                satuan: null,
                qty: 0,
                qty_std: 0,
                sat_std: null,
                qty_batal: 0,
                harga_mu: 0,
                harga_baru_mu: 0,
                selisih_harga_mu: 0,
                diskon: 0,
                diskon_mu: 0,
                potongan_mu: 0,
                jumlah_rp: 0,
                jumlah_mu: 0,
                export: null,
                catatan: null,
                nopol: null,
                noranka: null,
                ukuran: null,
                merk: null,
                kode_supp: null,
                id_supp: null,
                kode_jenis: null,
                nama_jenis_supp: null,
            };

            gridFppList.current!.addRecord(detailBarangBaru, totalLine);
            gridFppList.current!.refresh();
        } else {
            document.getElementById('gridFppList')?.focus();
            withReactContent(swalToast).fire({
                icon: 'error',
                title: '<p style="font-size:12px">Jumlah MU tidak boleh kurang dari nol</p>',
                width: '100%',
                target: '#gridFppList',
            });
        }
    };

    // DELETE DATA DI ALOKASI DANA
    const DetailAlokasiDanaDelete = () => {
        withReactContent(swal)
            .fire({
                html: `Hapus data di baris ${selectedRowIdx + 1}?`,
                width: '15%',
                target: '#dialogFrmFpp',
                showCancelButton: true,
                confirmButtonText: '<p style="font-size:10px">Ya</p>',
                cancelButtonText: '<p style="font-size:10px">Tidak</p>',
            })
            .then((result) => {
                if (result.isConfirmed && Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource.splice(selectedRowIdx, 1);
                    gridFppList.current!.dataSource.forEach((item: any, index: any) => {
                        item.id = index + 1;
                    });
                    gridFppList.current!.refresh();
                }
            });
    };

    const DetailAlokasiDanaAll = () => {
        withReactContent(swal)
            .fire({
                html: 'Hapus semua data barang?',
                width: '15%',
                target: '#dialogFrmFpp',
                showCancelButton: true,
                confirmButtonText: '<p style="font-size:10px">Ya</p>',
                cancelButtonText: '<p style="font-size:10px">Tidak</p>',
            })
            .then((result) => {
                if (result.isConfirmed && Array.isArray(gridFppList.current!.dataSource)) {
                    // Clear the grid data
                    gridFppList.current!.dataSource.splice(0, gridFppList.current!.dataSource.length);
                    gridFppList.current!.refresh();
                }
            });
    };

    return (
        <DialogComponent
            id="dialogFrmFpp"
            isModal
            width="95%"
            height="97%"
            visible={isOpen}
            close={() => {
                onClose();
                if (Array.isArray(gridFppList.current!.dataSource)) {
                    gridFppList.current!.dataSource.splice(0, gridFppList.current!.dataSource.length);
                    gridFppList.current!.refresh();
                }
            }}
            header={
                statusPage === 'CREATE'
                    ? `FORM PENGAJUAN PEMBAYARAN < BARU >`
                    : statusPage === 'EDIT' || statusPage === 'UPDATE-FILE'
                    ? 'FORM PENGAJUAN PEMBAYARAN < EDIT >'
                    : 'FORM PENGAJUAN PEMBAYARAN'
            }
            showCloseIcon
            target={'#main-target'}
            closeOnEscape
            allowDragging
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            buttons={buttonsFrmFpp}
        >
            <div className="mb-1">
                {/* =========== MASTER HEADER =========== */}
                <div className="flex gap-5 px-7 py-1">
                    {/* ====== LEFT SIDE ======= */}
                    <div>
                        {/* Tgl Buat */}
                        <div className="flex items-center gap-2">
                            <label className="w-20 text-right">Tgl. Buat</label>
                            <div className="form-input mt-1 flex justify-between !p-0.5 !pl-2" style={{ width: '50%', borderRadius: 2 }}>
                                <DatePickerComponent
                                    disabled={true}
                                    locale="id"
                                    cssClass="custom-icon"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={masterData.tgl_fpp}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        updateState('tgl_fpp', moment(args.value).format('DD-MM-YYYY'));
                                    }}
                                    style={{ paddingLeft: '8px', paddingTop: '0px', paddingBottom: '0px', fontSize: '8px !important' }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>
                        {/* No FPP */}
                        <div className="mt-1 flex items-center gap-2">
                            <label className="w-20 text-right">No. FPP</label>
                            <input className="form-input !py-0.5 !pl-2 !pr-0.5 !text-[11px]" style={{ width: '50%', borderRadius: 2 }} value={masterData.no_fpp} readOnly />
                        </div>
                        {/* Nama Vendor */}
                        <div className="mt-1 flex items-center gap-2">
                            <label className="w-20 text-right">Nama Vendor</label>
                            <div className="flex text-xs">
                                <input className="form-input !py-0.5 !pl-2 !pr-0.5 !text-[10px]" style={{ width: '30%', borderRadius: 2 }} value={masterData.no_supp} readOnly />
                                <input
                                    className="form-input !py-0.5 !pl-2 !pr-0.5 !text-[10px]"
                                    style={{ width: '60%', borderRadius: 2 }}
                                    disabled={disabledInput}
                                    value={masterData.nama_supp}
                                    onChange={(e) => updateState('nama_supp', e.target.value)}
                                />
                                {!disabledInput && (
                                    <button
                                        className="ml-1 flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                        style={{ height: 25, marginLeft: 0, borderRadius: 2 }}
                                        onClick={() => {
                                            setModalDaftarSupplier(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" style={{ margin: '2px 2px 0px 6px' }} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Tgl Pembayaran */}
                        <div className="flex items-center gap-2">
                            <label className="w-20 text-right">Tgl. Pembayaran</label>
                            <div className="form-input mt-1 flex justify-between !py-0.5 !pl-2 !pr-0.5" style={{ width: '50%', borderRadius: 2 }}>
                                <DatePickerComponent
                                    disabled={disabledInput}
                                    locale="id"
                                    cssClass="custom-icon"
                                    enableMask={true}
                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={masterData.tgl_harus_bayar}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        updateState('tgl_harus_bayar', moment(args.value).format('DD-MM-YYYY'));
                                    }}
                                    style={{ paddingLeft: '8px', paddingTop: '0px', paddingBottom: '0px', fontSize: '8px !important' }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>
                        {/* Nama Bank */}
                        <div className="flex items-center gap-2">
                            <label className="w-20 text-right">Nama Bank</label>
                            {disabledInput ? (
                                <input className="form-input !py-0.5 !pl-2 pr-0.5 text-[10px]" readOnly style={{ width: '50%', borderRadius: 2 }} defaultValue={masterData.nama_bank} />
                            ) : (
                                <div className="form-input mt-1 flex justify-between !py-0 !pl-2 !pr-0.5" style={{ width: '50%', borderRadius: 2 }}>
                                    <DropDownListComponent
                                        id="customers"
                                        dataSource={listBank}
                                        fields={{ value: 'nama_bank', text: `nama_bank` }}
                                        sortOrder="Ascending"
                                        placeholder="Pilih Bank"
                                        value={masterData.nama_bank}
                                        onChange={(e: any) => updateState('nama_bank', e.value)}
                                        style={{ paddingLeft: '8px' }}
                                        cssClass="custom-icon"
                                    />
                                </div>
                            )}
                        </div>
                        {/* No Rekening */}
                        <div className="mt-1 flex items-center gap-2">
                            <label className="w-20 text-right">No. Rekening</label>
                            <input
                                className="form-input !py-0.5 !pl-2 !pr-0.5 text-[11px]"
                                disabled={disabledInput}
                                style={{ width: '50%', borderRadius: 2 }}
                                defaultValue={masterData.no_rekening}
                                onBlur={(e) => updateState('no_rekening', e.target.value)}
                            />
                        </div>
                        {/* Nama Pemilik Rekening */}
                        <div className="flex items-center gap-2">
                            <label className="w-20 text-right">Nama Pemilik Rek.</label>
                            <input
                                className="form-input py-0.5 !pr-0.5 pl-2 text-[11px]"
                                disabled={disabledInput}
                                style={{ width: '50%', borderRadius: 2 }}
                                defaultValue={masterData.nama_rekening}
                                onBlur={(e) => updateState('nama_rekening', e.target.value)}
                            />
                        </div>
                        {/* Jenis Pembayaran */}
                        {/* <div className="mt-1 flex items-start gap-2">
                <label className="w-20 text-right">Jenis Pembayaran</label>
                <div className="grid grid-cols-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <input disabled={disabledInput} type="radio" id="tunai" value="Tunai" checked={masterData.jenis_bayar === 'Tunai'} onChange={(e) => updateState('jenis_bayar', e.target.value)} />
                      <label htmlFor="tunai">Tunai</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        disabled={disabledInput}
                        type="radio"
                        id="setor-tunai"
                        value="Setor Tunai"
                        checked={masterData.jenis_bayar === 'Setor Tunai'}
                        onChange={(e) => updateState('jenis_bayar', e.target.value)}
                      />
                      <label htmlFor="setor-tunai">Setor Tunai</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        disabled={disabledInput}
                        type="radio"
                        id="transfer"
                        value="Transfer"
                        checked={masterData.jenis_bayar === 'Transfer'}
                        onChange={(e) => updateState('jenis_bayar', e.target.value)}
                      />
                      <label htmlFor="transfer">Transfer</label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <input
                        disabled={disabledInput}
                        type="radio"
                        id="transfer-pt"
                        value="Transfer PT"
                        checked={masterData.jenis_bayar === 'Transfer PT'}
                        onChange={(e) => updateState('jenis_bayar', e.target.value)}
                      />
                      <label htmlFor="transfer-pt">Transfer dari Rekening PT</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        disabled={disabledInput}
                        type="radio"
                        id="cc"
                        value="Kartu Kredit"
                        checked={masterData.jenis_bayar === 'Kartu Kredit'}
                        onChange={(e) => updateState('jenis_bayar', e.target.value)}
                      />
                      <label htmlFor="cc">Kartu Kredit</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input disabled={disabledInput} type="radio" id="flip" value="Flip" checked={masterData.jenis_bayar === 'Flip'} onChange={(e) => updateState('jenis_bayar', e.target.value)} />
                      <label htmlFor="flip">Flip</label>
                    </div>
                  </div>
                </div>
              </div> */}
                    </div>
                    {/* ====== RIGHT SIDE ====== */}
                    <div>
                        <div className="flex gap-3">
                            {/* Keterangan */}
                            <div className="flex flex-col gap-1">
                                {/* ENTITAS */}
                                <div className="mt-1 flex items-center gap-2">
                                    <label className="w-20">ENTITAS</label>
                                    <div className="flex">
                                        <input className="form-input py-0.5 pl-2 pr-0.5 text-[11px]" style={{ width: '100%', borderRadius: 2 }} value={masterData.kode_entitas} readOnly />
                                        {entitas_user === '899' && !disabledInput ? (
                                            <button
                                                className="ml-1 flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                style={{ height: 25, marginLeft: 0, borderRadius: 2 }}
                                                onClick={() => {
                                                    setShowModalEntitas(true);
                                                    console.log(entitas_user, 'das');
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" style={{ margin: '2px 2px 0px 6px' }} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="">Keterangan</label>
                                    <textarea
                                        disabled={disabledInput}
                                        cols={50}
                                        rows={5}
                                        className="border border-gray-400 p-1 text-[11px] !text-black"
                                        defaultValue={masterData.keterangan}
                                        onBlur={(e) => updateState('keterangan', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="mt-1 flex items-start gap-2">
                                    <label className="w-20 text-left">Jenis Pembayaran</label>
                                    <div className="grid grid-cols-2">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="tunai"
                                                    value="Tunai"
                                                    checked={masterData.jenis_bayar === 'Tunai'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="tunai">Tunai</label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="setor-tunai"
                                                    value="Setor Tunai"
                                                    checked={masterData.jenis_bayar === 'Setor Tunai'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="setor-tunai">Setor Tunai</label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="transfer"
                                                    value="Transfer"
                                                    checked={masterData.jenis_bayar === 'Transfer'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="transfer">Transfer</label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="transfer-pt"
                                                    value="Transfer PT"
                                                    checked={masterData.jenis_bayar === 'Transfer PT'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="transfer-pt">Transfer dari Rekening PT</label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="cc"
                                                    value="Kartu Kredit"
                                                    checked={masterData.jenis_bayar === 'Kartu Kredit'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="cc">Kartu Kredit</label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    disabled={disabledInput}
                                                    type="radio"
                                                    id="flip"
                                                    value="Flip"
                                                    checked={masterData.jenis_bayar === 'Flip'}
                                                    onChange={(e) => updateState('jenis_bayar', e.target.value)}
                                                />
                                                <label htmlFor="flip">Flip</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tanggal Dibayar */}
                            {(statusPage || '').toLowerCase() === 'pembayaran' ? (
                                <div className="h-full bg-white-dark px-2 py-3 text-white">
                                    <span className="flex w-full items-center justify-center bg-purple-800 px-2 text-center">Tgl. Dibayar</span>
                                    <div className="mt-5 flex items-center gap-2">
                                        <label className="w-14 text-right">Tgl. Bayar</label>
                                        <div className="form-input mt-1 flex justify-between" style={{ width: '70%', borderRadius: 2 }}>
                                            <DatePickerComponent
                                                id="custom-datepicker"
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                value={masterData.tgl_bayar}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    updateState('tgl_bayar', moment(args.value).format('DD-MM-YYYY'));
                                                }}
                                                style={{ margin: '-5px' }}
                                                // disabled={true}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <label className="w-14 text-right">No. Reff</label>
                                        <input
                                            className="form-input py-1.5"
                                            style={{ width: '70%', borderRadius: 2 }}
                                            defaultValue={masterData.no_reff}
                                            onBlur={(e) => updateState('no_reff', e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <label className="w-14 text-right">Jumlah Bayar</label>
                                        <input
                                            className="form-input py-1.5 text-right"
                                            style={{ width: '70%', borderRadius: 2 }}
                                            onChange={(e) => updateState('bayar_rp', e.target.value)}
                                            value={isAmountFocused ? masterData.bayar_rp : frmNumber(masterData.bayar_rp)}
                                            onFocus={() => setIsAmountFocused(true)}
                                            onBlur={() => {
                                                setIsAmountFocused(false);
                                                Recalc(gridFppList.current!, masterData, updateState);
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                {/* ======== DETAIL JURNAL ==========  */}
                <div className="panel-tab mb-1" style={{ background: '#F7F7F7', width: '100%', height: 'auto' }}>
                    <TabComponent selectedItem={statusPage === 'UPDATE-FILE' ? 1 : 0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                        {/* Header */}
                        <div className="e-tab-header custom-tab-wrap !max-h-[25px]">
                            <div
                                tabIndex={0}
                                style={{
                                    marginTop: 5,
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '15px 15px',
                                    cursor: 'pointer',
                                    borderBottom: '3px solid transparent',
                                }}
                                className="h-full w-full"
                            >
                                1. Alokasi Dana
                            </div>
                            <div
                                tabIndex={1}
                                onClick={() => setSelectedHead('pengajuan-1')}
                                style={{
                                    marginTop: 5,
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '15px 15px',
                                    cursor: 'pointer',
                                    borderBottom: '3px solid transparent',
                                }}
                                className="h-full w-full"
                            >
                                2. File Pengajuan
                            </div>
                            <div
                                tabIndex={2}
                                onClick={() => setSelectedHead('pembayaran-1')}
                                style={{
                                    marginTop: 5,
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '15px 15px',
                                    cursor: 'pointer',
                                    borderBottom: '3px solid transparent',
                                }}
                                className="h-full w-full"
                            >
                                3. File Pembayaran
                            </div>
                        </div>

                        {/* Content */}
                        <div className="e-content">
                            {/* 1. Alokasi Dana - INDEX [0] */}
                            <div
                                onClick={() => {
                                    Recalc(gridFppList.current!, masterData, updateState);
                                }}
                                style={{ width: '100%', height: '100%', marginTop: '5px' }}
                                tabIndex={0}
                            >
                                <GridComponent
                                    id="gridFppList"
                                    name="gridFppList"
                                    locale="id"
                                    ref={gridFppList}
                                    editSettings={{
                                        allowAdding: true,
                                        allowEditing: !disabledInput,
                                        allowDeleting: true,
                                        newRowPosition: 'Bottom',
                                    }}
                                    rowSelected={(args: any) => setSelectedRowIdx(args.rowIndex)}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    allowResizing={true}
                                    autoFit={true}
                                    rowHeight={22}
                                    height={140}
                                    gridLines={'Both'}
                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    actionComplete={actionCompleteDetailJurnal}
                                    // recordClick={(args: any) => {
                                    //     currentDaftarBarang = gridPpiListRef.current?.getSelectedRecords() || [];
                                    //     if (currentDaftarBarang.length > 0) {
                                    //         gridPpiListRef.current?.startEdit();
                                    //         document.getElementById('bayar_mu')?.focus();
                                    //     }
                                    // }}
                                    readOnly={disabledInput}
                                >
                                    <ColumnsDirective>
                                        {/* <ColumnDirective field="id_fpp" isPrimaryKey /> */}
                                        <ColumnDirective field="nama_jenis_supp" headerText="Kategori Vendor" headerTextAlign="Center" textAlign="Left" width="150" allowEditing={false} />
                                        <ColumnDirective
                                            field="diskripsi"
                                            headerText="Diskripsi atau Nama Barang"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            autoFit
                                            editTemplate={(args: any) => editTemplateAkunBarang(args, { setSelectedRowIndex, setShowModalBarang, handleDiskripsiChange, setTambah })}
                                        />
                                        <ColumnDirective field="merk" headerText="Merk" headerTextAlign="Center" textAlign="Left" width="100" />
                                        <ColumnDirective field="ukuran" headerText="Ukuran" headerTextAlign="Center" textAlign="Right" width="70" />
                                        <ColumnDirective
                                            field="satuan"
                                            headerText="Satuan"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="70"
                                            editTemplate={(args: any) => {
                                                const props: any = {
                                                    dataSource: listSatuan,
                                                    onChange: handleSatuanChange,
                                                };
                                                return editTemplateSatuanBarang(args, props);
                                            }}
                                        />
                                        <ColumnDirective
                                            field="qty"
                                            headerText="Kuantitas"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            width="60"
                                            format="N"
                                            type="number"
                                            // template={(props: any) => {
                                            //   return <span>{props.qty ? parseFloat(props.qty).toLocaleString('en-US') : ''}</span>;
                                            // }}
                                        />
                                        <ColumnDirective
                                            columns={[
                                                { field: 'harga_mu', format: 'N2', headerText: 'Harga', headerTextAlign: 'Center', textAlign: 'Right', width: 80, minWidth: 30, allowEditing: true },
                                                { field: 'harga_baru_mu', format: 'N2', headerText: 'Harga Baru', headerTextAlign: 'Center', textAlign: 'Right', width: 80, minWidth: 50 },
                                                { field: 'selisih_harga_mu', headerText: 'Selisih Harga', headerTextAlign: 'Center', textAlign: 'Right', width: 80, minWidth: 50, allowEditing: false },
                                            ]}
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            headerText="Harga Item"
                                            width={240}
                                        />
                                        <ColumnDirective field="diskon" headerText="Diskon (%)" headerTextAlign="Center" textAlign="Left" width="100" />
                                        <ColumnDirective field="potongan_mu" format="N2" headerText="Potongan" headerTextAlign="Center" textAlign="Right" width="100" />
                                        <ColumnDirective field="jumlah_mu" format="N2" headerText="Jumlah" headerTextAlign="Center" textAlign="Right" width="100" allowEditing={false} />
                                        <ColumnDirective field="catatan" headerText="Catatan" headerTextAlign="Center" textAlign="Left" width="100" clipMode="EllipsisWithTooltip" />
                                        {/* <ColumnDirective
                        columns={[
                          { field: 'nopol', headerText: 'No Kendaraan', headerTextAlign: 'Center', width: 130, minWidth: 30, editTemplate: (props: any) => <EditTemplate {...props} /> },
                          { field: 'noranka', headerText: 'No Rangka', headerTextAlign: 'Center', width: 130, minWidth: 50, allowEditing: false },
                        ]}
                        textAlign="Center"
                        headerTextAlign="Center"
                        headerText="Masukkan untuk biaya maintenance kendaraan"
                      /> */}
                                        <ColumnDirective
                                            field="nopol"
                                            headerText="No Kendaraan"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            editTemplate={(args: any) => editTemplateKendaraan(args, { setSelectedRowIndex, setShowModalKendaraan })}
                                        />
                                        <ColumnDirective field="noranka" headerText="No Rangka" headerTextAlign="Center" textAlign="Left" width="100" allowEditing={false} />
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
                                                            <div className="mb-5 mt-1 flex">
                                                                <div className="flex flex-col gap-3" style={{ width: '70%' }}>
                                                                    {!disabledInput && (
                                                                        <div>
                                                                            <ButtonComponent
                                                                                id="buAdd1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-plus"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                onClick={() => handleDataJurnal('new')}
                                                                            />
                                                                            <ButtonComponent
                                                                                id="buDelete1"
                                                                                // content="Hapus"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-warning e-small"
                                                                                iconCss="e-icons e-small e-trash"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                onClick={() => {
                                                                                    DetailAlokasiDanaDelete();
                                                                                }}
                                                                            />
                                                                            <ButtonComponent
                                                                                id="buDeleteAll1"
                                                                                // content="Bersihkan"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-danger e-small"
                                                                                iconCss="e-icons e-small e-erase"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                onClick={() => {
                                                                                    DetailAlokasiDanaAll();
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex gap-2">
                                                                            <span>User Input</span>
                                                                            <input className="border border-gray-400 p-1" type="text" disabled value={(masterData.user_input || '').toUpperCase()} />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span>Catatan :</span>
                                                                            <span>Jika ada pembulatan masukkan ke diskon</span>
                                                                        </div>
                                                                        <p className="mt-5 text-green-700">{masterData.terbilang}</p>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '28%' }}>
                                                                    <div className="flex justify-end">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Sub Total :</b>
                                                                        </div>
                                                                        <div style={{ width: '35%', textAlign: 'right' }}>
                                                                            <b>{frmNumber(masterData.total_rp)}</b>
                                                                        </div>
                                                                    </div>

                                                                    <hr className="my-1.5" />

                                                                    <div className="mt-1 flex justify-end gap-2">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Diskon (%)</b>
                                                                        </div>
                                                                        <div style={{ width: '10%', textAlign: 'right' }}>
                                                                            <input
                                                                                disabled={disabledInput}
                                                                                type="text"
                                                                                className="w-10 border border-gray-400 p-1"
                                                                                value={masterData.diskon_dok}
                                                                                onChange={(e) => {
                                                                                    updateState('diskon_dok', e.target.value);
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    if (Number(masterData.diskon_dok) === 0) {
                                                                                        updateState('diskon_dok_mu', 0);
                                                                                        updateState('diskon_dok', 0);
                                                                                    } else {
                                                                                        Recalc(gridFppList.current!, masterData, updateState);
                                                                                    }
                                                                                }}
                                                                                onKeyPress={(e) => {
                                                                                    if (!/^[0-9.]$/.test(e.key) || (e.key === '.' && e.currentTarget.value.includes('.'))) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <b>=</b>
                                                                        </div>
                                                                        <div style={{ width: '15%', textAlign: 'right' }}>
                                                                            <input
                                                                                type="text"
                                                                                className="w-full border border-gray-400 p-1"
                                                                                value={isAmountFocused2 ? masterData.diskon_dok_mu : frmNumber(masterData.diskon_dok_mu)}
                                                                                onChange={(e) => {
                                                                                    updateState('diskon_dok_mu', e.target.value);
                                                                                }}
                                                                                onFocus={() => setIsAmountFocused2(true)}
                                                                                onBlur={(e) => {
                                                                                    setIsAmountFocused2(false);
                                                                                    if (Number(masterData.diskon_dok_mu) === 0) {
                                                                                        updateState('diskon_dok_mu', 0);
                                                                                        updateState('diskon_dok', 0);
                                                                                    } else {
                                                                                        Recalc(gridFppList.current!, masterData, updateState);
                                                                                    }
                                                                                }}
                                                                                onKeyPress={(e) => {
                                                                                    if (!/^[0-9.]$/.test(e.key) || (e.key === '.' && e.currentTarget.value.includes('.'))) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                                disabled={disabledInput}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-1 flex justify-end gap-2">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Biaya Lain-Lain</b>
                                                                        </div>
                                                                        <div style={{ width: '25%', textAlign: 'right' }}>
                                                                            <input
                                                                                disabled={disabledInput}
                                                                                type="text"
                                                                                className="w-20 border border-gray-400 p-1"
                                                                                value={isAmountFocused2 ? masterData.kirim_rp : frmNumber(masterData.kirim_rp)}
                                                                                onKeyPress={(e) => {
                                                                                    if (!/^[0-9.]$/.test(e.key) || (e.key === '.' && e.currentTarget.value.includes('.'))) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                                onChange={(e) => {
                                                                                    updateState('kirim_rp', e.target.value);
                                                                                }}
                                                                                onFocus={() => setIsAmountFocused2(true)}
                                                                                onBlur={(e) => {
                                                                                    setIsAmountFocused2(false);
                                                                                    Recalc(gridFppList.current!, masterData, updateState);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <hr className="my-1.5" />

                                                                    <div className="flex justify-end">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Total :</b>
                                                                        </div>
                                                                        <div style={{ width: '35%', textAlign: 'right' }}>
                                                                            <b>{frmNumber(masterData.netto_rp)}</b>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-end">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Lunas :</b>
                                                                        </div>
                                                                        <div style={{ width: '35%', textAlign: 'right' }}>
                                                                            <b>{frmNumber(masterData.lunas_rp)}</b>
                                                                        </div>
                                                                    </div>

                                                                    <hr className="my-1.5" />

                                                                    <div className="flex justify-end">
                                                                        <div style={{ width: '30%', textAlign: 'right' }}>
                                                                            <b>Sisa :</b>
                                                                        </div>
                                                                        <div style={{ width: '35%', textAlign: 'right' }}>
                                                                            <b>{frmNumber(masterData.sisa_rp)}</b>
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
                            {/* 2. File Pengajuan - INDEX [1] */}
                            <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        zIndex: 1000, // zIndex untuk bisa diklik
                                        position: 'absolute',
                                        right: 0,
                                        borderBottomLeftRadius: '6px',
                                        borderBottomRightRadius: '6px',
                                        overflowX: 'scroll',
                                        overflowY: 'hidden',
                                        scrollbarWidth: 'none',
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
                                            handleRemove(`${selectedHead}`);
                                        }}
                                    />
                                    <ButtonComponent
                                        id="cleanall"
                                        content="Bersihkan Semua Gambar"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-erase"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            handleRemove('pengajuan-all');
                                        }}
                                    />

                                    <ButtonComponent
                                        id="savefile"
                                        content="Simpan ke File"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-download"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            handleDownloadImage(`${selectedHead}`);
                                        }}
                                    />

                                    <ButtonComponent
                                        id="preview"
                                        content="Preview"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-image"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            if (imageSrc.startsWith('data:application/pdf')) {
                                                // Create a Blob from the base64 data
                                                const byteCharacters = atob(imageSrc.split(',')[1]);
                                                const byteNumbers = new Array(byteCharacters.length);

                                                for (let i = 0; i < byteCharacters.length; i++) {
                                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                }

                                                const byteArray = new Uint8Array(byteNumbers);
                                                const blob = new Blob([byteArray], { type: 'application/pdf' });

                                                // Create a URL for the blob and open it in a new tab
                                                const blobUrl = URL.createObjectURL(blob);
                                                window.open(blobUrl, '_blank');

                                                // Clean up the URL object after the tab is opened
                                                setTimeout(() => {
                                                    URL.revokeObjectURL(blobUrl);
                                                }, 100);

                                                return;
                                            }
                                            console.log('masuk bre');

                                            handlePreviewImage('open');
                                        }}
                                    />
                                </div>
                                <TabComponent
                                    selectedItem={selectedPengajuan}
                                    animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                    height="100%"
                                    style={{ marginTop: -10, fontSize: 12 }}
                                >
                                    <div className="e-tab-header custom-tab-wrap" style={{ display: 'flex' }}>
                                        <div
                                            tabIndex={0}
                                            onClick={() => {
                                                setSelectedHead('pengajuan-1');
                                                setSelectedPengajuan(0);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            1
                                        </div>
                                        <div
                                            tabIndex={1}
                                            onClick={() => {
                                                setSelectedHead('pengajuan-2');
                                                setSelectedPengajuan(1);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            2
                                        </div>
                                        <div
                                            tabIndex={2}
                                            onClick={() => {
                                                setSelectedHead('pengajuan-3');
                                                setSelectedPengajuan(2);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            3
                                        </div>
                                        <div
                                            tabIndex={3}
                                            onClick={() => {
                                                setSelectedHead('pengajuan-4');
                                                setSelectedPengajuan(3);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            4
                                        </div>
                                        <div
                                            tabIndex={4}
                                            onClick={() => {
                                                setSelectedHead('pengajuan-5');
                                                setSelectedPengajuan(4);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            5
                                        </div>
                                    </div>
                                    <div className="e-content">
                                        {/* [1] */}
                                        <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPengajuan1}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pengajuan-1')}
                                                        removing={() => handleRemove('pengajuan-1')}
                                                    />
                                                </div>
                                                {dataFiles.preview1 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview1.startsWith('data:application/pdf') ? resPdf : dataFiles.preview1}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [2] */}
                                        <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPengajuan2}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pengajuan-2')}
                                                        removing={() => handleRemove('pengajuan-2')}
                                                    />
                                                </div>
                                                {dataFiles.preview2 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview2.startsWith('data:application/pdf') ? resPdf : dataFiles.preview2}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [3] */}
                                        <div tabIndex={2} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPengajuan3}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pengajuan-3')}
                                                        removing={() => handleRemove('pengajuan-3')}
                                                    />
                                                </div>
                                                {dataFiles.preview3 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview3.startsWith('data:application/pdf') ? resPdf : dataFiles.preview3}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [4] */}
                                        <div tabIndex={3} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPengajuan4}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pengajuan-4')}
                                                        removing={() => handleRemove('pengajuan-4')}
                                                    />
                                                </div>
                                                {dataFiles.preview4 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview4.startsWith('data:application/pdf') ? resPdf : dataFiles.preview4}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [5] */}
                                        <div tabIndex={4} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPengajuan5}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pengajuan-5')}
                                                        removing={() => handleRemove('pengajuan-5')}
                                                    />
                                                </div>
                                                {dataFiles.preview5 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview5.startsWith('data:application/pdf') ? resPdf : dataFiles.preview5}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabComponent>
                            </div>
                            {/* 3. File Pembayaran - INDEX [2] */}
                            <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        zIndex: 1000, // zIndex untuk bisa diklik
                                        position: 'absolute',
                                        right: 0,
                                        borderBottomLeftRadius: '6px',
                                        borderBottomRightRadius: '6px',
                                        overflowX: 'scroll',
                                        overflowY: 'hidden',
                                        scrollbarWidth: 'none',
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
                                            handleRemove(`${selectedHead}`);
                                        }}
                                    />
                                    <ButtonComponent
                                        id="cleanall"
                                        content="Bersihkan Semua Gambar"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-erase"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            handleRemove('pembayaran-all');
                                        }}
                                    />

                                    <ButtonComponent
                                        id="savefile"
                                        content="Simpan ke File"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-download"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            handleDownloadImage(`${selectedHead}`);
                                        }}
                                    />

                                    <ButtonComponent
                                        id="preview"
                                        content="Preview"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-image"
                                        style={{ width: '190px', marginTop: 5, marginRight: 2, backgroundColor: '#3b3f5c' }}
                                        onClick={() => {
                                            if (imageSrc.startsWith('data:application/pdf')) {
                                                // Create a Blob from the base64 data
                                                const byteCharacters = atob(imageSrc.split(',')[1]);
                                                const byteNumbers = new Array(byteCharacters.length);

                                                for (let i = 0; i < byteCharacters.length; i++) {
                                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                }

                                                const byteArray = new Uint8Array(byteNumbers);
                                                const blob = new Blob([byteArray], { type: 'application/pdf' });

                                                // Create a URL for the blob and open it in a new tab
                                                const blobUrl = URL.createObjectURL(blob);
                                                window.open(blobUrl, '_blank');

                                                // Clean up the URL object after the tab is opened
                                                setTimeout(() => {
                                                    URL.revokeObjectURL(blobUrl);
                                                }, 100);

                                                return;
                                            }

                                            handlePreviewImage('open');
                                        }}
                                    />
                                </div>
                                <TabComponent selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%" style={{ marginTop: -10, fontSize: 12 }}>
                                    <div className="e-tab-header custom-tab-wrap" style={{ display: 'flex' }}>
                                        <div
                                            tabIndex={0}
                                            onClick={() => {
                                                setSelectedHead('pembayaran-1');
                                                setSelectedPembayaran(0);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            1
                                        </div>
                                        <div
                                            tabIndex={1}
                                            onClick={() => {
                                                setSelectedHead('pembayaran-2');
                                                setSelectedPembayaran(1);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            2
                                        </div>
                                        <div
                                            tabIndex={2}
                                            onClick={() => {
                                                setSelectedHead('pembayaran-3');
                                                setSelectedPembayaran(2);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            3
                                        </div>
                                        <div
                                            tabIndex={3}
                                            onClick={() => {
                                                setSelectedHead('pembayaran-4');
                                                setSelectedPembayaran(3);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            4
                                        </div>
                                        <div
                                            tabIndex={4}
                                            onClick={() => {
                                                setSelectedHead('pembayaran-5');
                                                setSelectedPembayaran(4);
                                            }}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            5
                                        </div>
                                    </div>
                                    <div className="e-content">
                                        {/* [1] */}
                                        <div tabIndex={0} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPembayaran1}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pembayaran-1')}
                                                        removing={() => handleRemove('pembayaran-1')}
                                                    />
                                                </div>
                                                {dataFiles.preview6 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview6.startsWith('data:application/pdf') ? resPdf : dataFiles.preview6}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [2] */}
                                        <div tabIndex={1} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPembayaran2}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pembayaran-2')}
                                                        removing={() => handleRemove('pembayaran-2')}
                                                    />
                                                </div>
                                                {dataFiles.preview7 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview7.startsWith('data:application/pdf') ? resPdf : dataFiles.preview7}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [3] */}
                                        <div tabIndex={2} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPembayaran3}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pembayaran-3')}
                                                        removing={() => handleRemove('pembayaran-3')}
                                                    />
                                                </div>
                                                {dataFiles.preview8 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview8.startsWith('data:application/pdf') ? resPdf : dataFiles.preview8}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [4] */}
                                        <div tabIndex={3} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPembayaran4}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pembayaran-4')}
                                                        removing={() => handleRemove('pembayaran-4')}
                                                    />
                                                </div>
                                                {dataFiles.preview9 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview9.startsWith('data:application/pdf') ? resPdf : dataFiles.preview9}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* [5] */}
                                        <div tabIndex={4} style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: 400 }}>
                                                    <UploaderComponent
                                                        id="previewfileupload"
                                                        type="file"
                                                        ref={uploaderRefPembayaran5}
                                                        multiple={false}
                                                        selected={(e) => handleFileSelect(e, 'pembayaran-5')}
                                                        removing={() => handleRemove('pembayaran-5')}
                                                    />
                                                </div>
                                                {dataFiles.preview10 && (
                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                        <Image
                                                            src={dataFiles.preview10.startsWith('data:application/pdf') ? resPdf : dataFiles.preview10}
                                                            alt="Large Image"
                                                            width={300}
                                                            height={300}
                                                            style={{ width: '100%', height: '300px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabComponent>
                            </div>
                        </div>
                    </TabComponent>
                </div>
            </div>

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
                        <Image
                            src={imageSrc}
                            style={{
                                transform: `scale(${zoomLevel})`,
                                transition: 'transform 0.1s ease',
                                cursor: 'pointer',
                                maxWidth: '100vw',
                                maxHeight: '100vh',
                            }}
                            className={zoomLevel === 2 ? 'zoomed' : ''}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            alt="Large Image"
                            width={500}
                            height={500}
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
                            cssClass="e-flat e-primary"
                            iconCss="e-icons e-zoom-out"
                            onClick={() => {
                                setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
                            }}
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '25px',
                            }}
                        />
                        <ButtonComponent
                            cssClass="e-flat e-primary"
                            iconCss="e-icons e-zoom-in"
                            onClick={() => {
                                setZoomLevel((prev) => Math.min(prev + 0.1, 6));
                            }}
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '25px',
                            }}
                        />
                        <ButtonComponent
                            cssClass="e-flat e-primary"
                            iconCss="e-icons e-close"
                            onClick={() => {
                                handlePreviewImage('close');
                                setZoomLevel(1);
                                setTranslate({ x: 0, y: 0 });
                            }}
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '25px',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* DIALOG SUPPLIER */}
            {modalDaftarSupplier && (
                <DialogListVendor
                    isOpen={modalDaftarSupplier}
                    onClose={() => {
                        setModalDaftarSupplier(false);
                        setSearchNoSupp('');
                        setSearchNamaRelasi('');
                        setFilteredDataSupplier(listDaftarSupplier);
                    }}
                    handlePilihVendor={() => handlePilihVendor()}
                    pencarianSupplier={(e: any, a: any) => PencarianSupplier(e, a)}
                    setSelectedSupplier={setSelectedSupplier}
                    dataSource={searchNoSupp !== '' || searchNamaRelasi !== '' ? filteredDataSupplier : listDaftarSupplier}
                />
            )}

            {/* DIALOG BARANG */}
            {showModalBarang && (
                <DialogListBarang
                    isOpen={showModalBarang}
                    onClose={() => {
                        setShowModalBarang(false);
                        setSearchDiskripsi('');
                        setFilteredDataBarang(listDaftarBarang);
                    }}
                    handlePilihBarang={handlePilihBarang}
                    pencarianBarang={(e: any, a: any) => PencarianBarang(e, a)}
                    setSelectedBarang={setSelectedBarang}
                    dataSource={searchDiskripsi !== '' ? filteredDataBarang : listDaftarBarang}
                    setSelectedRowIndex={setSelectedRowIndex}
                />
            )}

            {/* DIALOG KENDARAAM */}
            {showModalKendaraan && (
                <DialogListKendaraan
                    isOpen={showModalKendaraan}
                    onClose={() => {
                        setShowModalKendaraan(false);
                        setSearchNopol('');
                        setFilteredDataKendaraan(listDaftarKendaraan);
                    }}
                    handlePilihKendaraan={handlePilihKendaraan}
                    pencarianKendaraan={(e: any, a: any) => PencarianKendaraan(e, a)}
                    setSelectedKendaraan={setSelectedKendaraan}
                    dataSource={searchNopol !== '' ? filteredDataKendaraan : listDaftarKendaraan}
                />
            )}

            {/* DIALOG ENTITAS */}
            {showModalEntitas && (
                <DialogListEntitas
                    isOpen={showModalEntitas}
                    onClose={() => {
                        setShowModalEntitas(false);
                        setSearchKodeCabang('');
                        setSearchNamaCabang('');
                        setFilteredDataEntitas(listDaftarEntitas);
                    }}
                    dataSource={searchKodeCabang !== '' || searchNamaCabang !== '' ? filteredDataEntitas : listDaftarEntitas}
                    pencarianEntitas={(e: any, a: any) => pencarianEntitas(e, a)}
                    handlePilihEntitas={handlePilihEntitas}
                    setSelectedEntitas={setSelectedEntitas}
                />
            )}

            {/* DIALOG PROGRESS BAR */}
            <GlobalProgressBar />
            {/* END DIALOG PROGRESS BAR */}
        </DialogComponent>
    );
};

export default DialogFrmFpp;
