import React, { Fragment, useEffect, useRef, useState } from 'react';

// Syncfusion
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
    CommandColumn,
    AggregatesDirective,
    AggregateDirective,
    AggregateColumnsDirective,
    AggregateColumnDirective,
    Aggregate,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { FocusInEventArgs, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Tab } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faBook, faCamera, faCheck, faFile, faFolder, faList, faSave, faStop, faTimes, faX } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '@/pages/api/sessionContext';
import moment from 'moment';
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import styles from './index.module.css';
import JSZip, { file } from 'jszip';
import Draggable from 'react-draggable';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { GetLoadGambarByName, UpdateCatatan } from './api';
import { headerBuktiTtpSalesman, headerNominalPembayaran, headerSpesimenSesuai, headerSpesimenTtdCustomer, headerSpesimenTtdStaf } from './template';
import { s } from '@fullcalendar/core/internal-common';

L10n.load(idIDLocalization);
enableRipple(true);

const swalPopUp = swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
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

const swalDialog = swal.mixin({
    customClass: {
        confirmButton: 'btn btn-primary btn-sm',
        cancelButton: 'btn btn-dark btn-sm ltr:mr-3 rtl:ml-3',
        popup: 'sweet-alerts',
    },
    buttonsStyling: false,
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

// Styling
const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const modalPositionFilePendukung = { top: '29%', right: '43%', width: '363px', background: '#dedede' };
const modalPositionFilePendukungTTP = { top: '29%', right: '56%', width: '541px', background: '#dedede' };
const modalPositionFilePendukungTTD = { top: '29%', right: '17%', width: '541px', background: '#dedede' };

const DaftarBuktiTTP = () => {
    // Sessions
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    // Global State Management
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);
    const [selectedRowTtp, setSelectedRowTtp] = useState('');
    const [selectedRow, setSelectedRow] = useState<any>({});

    const [imageDataUrlTtd, setImageDataUrlTtd] = useState('');
    const [imageDataUrlTtp, setImageDataUrlTtp] = useState('');
    const [zoomScaleTtd, setZoomScaleTtd] = useState(0.5);
    const [positionTtd, setPositionTtd] = useState({ x: 0, y: 0 });
    const [indexPreviewTtd, setIndexPreviewTtd] = useState('');
    const [indexPreviewTtp, setIndexPreviewTtp] = useState('');
    const [kodeCustTtd, setKodeCustTtd] = useState('');
    const [zoomScale, setZoomScale] = useState(0.5);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isOpenPreviewDobel, setIsOpenPreviewDobel] = useState(false);
    const [isOpenPreviewDobelTtd, setIsOpenPreviewDobelTtd] = useState(false);
    const [indexPreview, setIndexPreview] = useState(0);
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [plagInputCatatan, setPlagInputCatatan] = useState(false);
    const [InputCatatan, setInputCatatan] = useState('');
    const [openPreview, setOpenPreview] = useState(false);
    const [selectedImgUrl, setSelectedImgUrl] = useState('');
    const [rotationAngle, setRotationAngle] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [showDialogUpload, setShowDialogUpload] = useState(false);

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

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

    const modalRef = useRef<HTMLDivElement>(null);

    const handleFocusModal = () => {
        if (modalRef.current) {
            uploaderRef2.current.focus();
        }
    };

    const HandleZoomIn = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const HandleZoomOut = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const handleMouseUp = () => {
        setIsDragging(false);
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

    useEffect(() => {
        if (openPreview) {
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
    }, [openPreview, handleMouseMove, handleMouseUp, handleWheel]);

    // ref
    let uploaderRef: any = useRef(null);
    let uploaderRef2: any = useRef<UploaderComponent>(null);

    // Filter State Management
    const [filterData, setFilterData] = useState({
        // DATE FILTER
        tgl_awal: moment(),
        tgl_akhir: moment().endOf('month'),
        isTglChecked: true,
        tgl_awal_kembali: moment(),
        tgl_akhir_kembali: moment().endOf('month'),
        isTglKembaliChecked: false,

        // OTHER FILTER
        no_ttp: '',
        isNoTtp: false,
        customer: '',
        isCustomer: false,
        salesman: '',
        isSalesman: false,
        userid: '',
        isUserid: false,
        prosesPosting: 'Semua',
        buktiTtp: 'Semua',
        buktiTtpKeuangan: 'Semua',
        kesesuaianSpesimen: 'Semua',
    });

    const updateStateFilter = (field: any, value: any) => {
        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const paramProps = { ttd: '', kode_dokumen: '', no_ttp: '', catatan: '', plagInputCatatan: false, plag: 0 };
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    // Refs
    const gridListData = useRef<GridComponent | any>(null);

    // Handle Filter
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    // GLOBAL FUNCTIONS
    const removeImageExtension = (filename: string): string => {
        return filename.replace(/\.(jpg|jpeg|png)$/i, '');
    };

    const loadImageDobel = async (filePendukung: any, filependukungTtd: any, kode_cust: any, tipe: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        setIndexPreviewTtp(filePendukung);
        setIndexPreviewTtd(filependukungTtd);
        setKodeCustTtd(kode_cust);
        setZoomScale(1); // Reset zoom scale
        setPosition({ x: 0, y: 0 }); // Reset position
        setImageDataUrlTtp('');
        setImageDataUrlTtd('');

        if (tipe === 'buktiTtp') {
            let fileGambar;
            if (filePendukung === null) {
                fileGambar = removeImageExtension(filependukungTtd);
            } else {
                fileGambar = removeImageExtension(filePendukung);
            }
            let vnamaZip = fileGambar + '.zip';

            const responsePreviewImg = await fetch(`${apiUrl}/erp/extrak_zip?entitas=${kode_entitas}&nama_zip=${vnamaZip}`);
            const data = await responsePreviewImg.json();
            if (data.status === true) {
                const imageUrl = data.images.find((item: any) => item.fileName === filePendukung)?.imageUrl;
                setImageDataUrlTtp(imageUrl || '');
                setIsOpenPreviewDobel(true);
            }

            // TTD Spesimen
            const paramObject = {
                kode_entitas: kode_entitas,
                kode_cust: kode_cust,
                filePendukung: filependukungTtd,
            };

            try {
                const respDecodeFileGambar = await GetLoadGambarByName(paramObject);

                if (respDecodeFileGambar.status === true) {
                    setImageDataUrlTtd(respDecodeFileGambar.data[0].decodeBase64_string || '');
                    setIsOpenPreviewDobelTtd(true);
                } else {
                    // Jika status dari response false
                    setImageDataUrlTtd('');
                    console.error('Data tidak ditemukan atau tidak valid.');
                }
            } catch (error: any) {
                // Mengatur tampilan default saat error terjadi
                setImageDataUrlTtd('');

                // Menangani error secara spesifik
                if (error.response) {
                    // Error 500 dari server
                    console.error(`Server Error: ${error.response.status} - ${error.response.data}`);
                } else if (error.request) {
                    // Permintaan dibuat tetapi tidak ada respon
                    console.error('No response received from server.');
                } else {
                    // Error saat membuat permintaan
                    console.error('Error:', error.message);
                }

                await withReactContent(swalPopUp).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Terjadi kesalahan saat memuat gambar. File gambar tidak ada di FTP.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogPhuList',
                    heightAuto: true,
                    timer: 3000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
            }
        } else if (tipe === 'ttdCust') {
            let fileGambar = removeImageExtension(filePendukung);
            let vnamaZip = fileGambar + '.zip';

            const responsePreviewImg = await fetch(`${apiUrl}/erp/extrak_zip?entitas=${kode_entitas}&nama_zip=${vnamaZip}`);
            const data = await responsePreviewImg.json();
            if (data.status === true) {
                const imageUrl = data.images[0].imageUrl;
                setImageDataUrlTtp(imageUrl || '');
                setIsOpenPreviewDobel(true);

                // TTD Spesimen
                const paramObject = {
                    kode_entitas: kode_entitas,
                    kode_cust: kode_cust,
                    filePendukung: filependukungTtd,
                };

                const respDecodeFileGambar = await GetLoadGambarByName(paramObject);

                if (respDecodeFileGambar.status === true) {
                    setImageDataUrlTtd(respDecodeFileGambar.data[0].decodeBase64_string || '');
                    setIsOpenPreviewDobelTtd(true);
                } else {
                    // Jika status dari response false
                    setImageDataUrlTtd('');
                    console.error('Data tidak ditemukan atau tidak valid.');
                }
            }
        } else {
            let fileGambar = removeImageExtension(filePendukung);
            let vnamaZip = fileGambar + '.zip';

            const responsePreviewImg = await fetch(`${apiUrl}/erp/extrak_zip?entitas=${kode_entitas}&nama_zip=${vnamaZip}`);
            const data = await responsePreviewImg.json();
            if (data.status === true) {
                const imageUrl = data.images.find((item: any) => item.fileName === filePendukung)?.imageUrl;
                setImageDataUrlTtp(imageUrl || '');
                setIsOpenPreviewDobel(true);
            }

            const paramObject = {
                kode_entitas: kode_entitas,
                kode_cust: kode_cust,
                filePendukung: filePendukung,
            };

            try {
                const respDecodeFileGambar = await GetLoadGambarByName(paramObject);

                if (respDecodeFileGambar.status === true) {
                    setImageDataUrlTtd(respDecodeFileGambar.data[0].decodeBase64_string || '');
                    setIsOpenPreviewDobelTtd(true);
                } else {
                    // Jika status dari response false
                    setImageDataUrlTtd('');
                    console.error('Data tidak ditemukan atau tidak valid.');
                }
            } catch (error: any) {
                // Mengatur tampilan default saat error terjadi
                setImageDataUrlTtd('');

                // Menangani error secara spesifik
                if (error.response) {
                    // Error 500 dari server
                    console.error(`Server Error: ${error.response.status} - ${error.response.data}`);
                } else if (error.request) {
                    // Permintaan dibuat tetapi tidak ada respon
                    console.error('No response received from server.');
                } else {
                    // Error saat membuat permintaan
                    console.error('Error:', error.message);
                }

                await withReactContent(swalPopUp).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Terjadi kesalahan saat memuat gambar. File gambar tidak ada di FTP.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogPhuList',
                    heightAuto: true,
                    timer: 3000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
            }
        }
    };

    const deleteImage = async (kode_dokumen: string) => {
        try {
            const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_dokumen,
                    param2: '1,999', // Sesuaikan dengan data yang diperlukan untuk menghapus
                },
            });

            if (response.status === 200) {
                const reqBody = {
                    entitas: kode_entitas,
                    filegambar_scan: null,
                    tgl_scan: null,
                    userid_scan: null,
                    ttd: selectedRow.ttd,
                    catatan: selectedRow.catatan,
                    kode_dokumen: selectedRow.kode_dokumen,
                };

                const res = await axios.post(`${apiUrl}/erp/update_daftar_ttp?`, reqBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 200) {
                    withReactContent(swalDialog).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">Hapus file berhasil</p>`,
                        // width: '100%',
                        target: '#main-target',
                        showConfirmButton: false,
                        timer: 2000,
                    });

                    setTimeout(() => {
                        fetchData();
                    }, 1000);
                }

                // fetchData();
            }
            console.log('Response dari penghapusan file pendukung:', response.data);
        } catch (error) {
            console.error('Error saat menghapus file pendukung:', error);
        }
    };

    const OpenPreviewDobel = async (tipe: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        setIndexPreview(1);
        setIsOpenPreview(true);
        setZoomScale(0.5); // Reset zoom scale
        setPosition({ x: 0, y: 0 }); // Reset position
        setImageDataUrl('');

        if (tipe === 'ttp') {
            let fileGambar = indexPreviewTtp.replace('.jpg', '');
            let vnamaZip = fileGambar + '.zip';

            const responsePreviewImg = await fetch(`${apiUrl}/erp/extrak_zip?entitas=${kode_entitas}&nama_zip=${vnamaZip}`);
            const data = await responsePreviewImg.json();

            if (data.status === true) {
                const imageUrl = data.images.find((item: any) => item.fileName === indexPreviewTtp)?.imageUrl;
                setImageDataUrl(imageUrl || '');
            }
        } else {
            const paramObject = {
                kode_entitas: kode_entitas,
                kode_cust: kodeCustTtd,
                filePendukung: indexPreviewTtd,
            };

            try {
                const respDecodeFileGambar = await GetLoadGambarByName(paramObject);

                if (respDecodeFileGambar.status === true) {
                    setImageDataUrl(respDecodeFileGambar.data[0].decodeBase64_string || '');
                } else {
                    // Jika status dari response false
                    setImageDataUrlTtd('');
                    console.error('Data tidak ditemukan atau tidak valid.');
                }
            } catch (error: any) {
                // Mengatur tampilan default saat error terjadi
                setImageDataUrlTtd('');

                // Menangani error secara spesifik
                if (error.response) {
                    // Error 500 dari server
                    console.error(`Server Error: ${error.response.status} - ${error.response.data}`);
                } else if (error.request) {
                    // Permintaan dibuat tetapi tidak ada respon
                    console.error('No response received from server.');
                } else {
                    // Error saat membuat permintaan
                    console.error('Error:', error.message);
                }

                await withReactContent(swalPopUp).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Terjadi kesalahan saat memuat gambar. File gambar tidak ada di FTP.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    target: '#dialogPhuList',
                    heightAuto: true,
                    timer: 3000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
            }
        }
    };

    const updateCatatan = async () => {
        const paramObject = {
            entitas: kode_entitas,
            catatan: InputCatatan,
            ttd: paramProps.ttd,
            kode_dokumen: paramProps.kode_dokumen,
        };

        const response = await UpdateCatatan(paramObject, token);
        const result = response.data;
        const status = result.status;
        const errormsg = result.serverMessage;
        if (status !== true) {
            withReactContent(swalDialog).fire({
                title: ``,
                html: errormsg,
                icon: 'warning',
                width: '20%',
                heightAuto: true,
                showConfirmButton: true,
                confirmButtonText: 'Ok',
            });
        } else {
            setPlagInputCatatan(false);
            await withReactContent(swalPopUp).fire({
                icon: 'success',
                title: '<p style="font-size:12px;color:white;margin-right: -42px;">Catatan Berhasil disimpan.</p>',
                width: '50%', // Atur lebar popup sesuai kebutuhan
                heightAuto: true,
                timer: 2000,
                showConfirmButton: false, // Menampilkan tombol konfirmasi
                allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            const catatan = document.getElementById(`catatan${paramProps.kode_dokumen}`) as HTMLInputElement;
            if (catatan) {
                catatan.value = InputCatatan;
            }
        }
    };

    const handleSpesimenSesuai = async (args: any) => {
        let paramObject, plaging;
        if (args.ttd === 'Y') {
            paramObject = {
                entitas: kode_entitas,
                catatan: args.catatan,
                ttd: 'N',
                kode_dokumen: args.kode_dokumen,
            };
            plaging = 'X';
        } else if (args.ttd === 'N') {
            paramObject = {
                entitas: kode_entitas,
                catatan: args.catatan,
                ttd: null,
                kode_dokumen: args.kode_dokumen,
            };
            plaging = '';
        } else {
            paramObject = {
                entitas: kode_entitas,
                catatan: args.catatan,
                ttd: 'Y',
                kode_dokumen: args.kode_dokumen,
            };
            plaging = '✔';
        }

        const response = await UpdateCatatan(paramObject, token);
        const result = response.data;
        const status = result.status;
        const errormsg = result.serverMessage;
        if (status !== true) {
            withReactContent(swalDialog).fire({
                title: ``,
                html: errormsg,
                icon: 'warning',
                width: '20%',
                heightAuto: true,
                showConfirmButton: true,
                confirmButtonText: 'Ok',
            });
        } else {
            await withReactContent(swalPopUp).fire({
                icon: 'success',
                title: '<p style="font-size:12px;color:white;margin-right: -42px;">Spesimen Sesuai Berhasil Plaging.</p>',
                width: '50%', // Atur lebar popup sesuai kebutuhan
                heightAuto: true,
                timer: 2000,
                showConfirmButton: false, // Menampilkan tombol konfirmasi
                allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });

            setTimeout(() => {
                fetchData();
            }, 1000);
        }
    };

    const handleRowSelected = (args: any) => {
        setSelectedRow(args.data);
        setSelectedRowTtp(args.data.no_ttp);
    };

    // ====== FETCHING DATA =======
    const fetchData = async () => {
        const params: any = {
            entitas: kode_entitas,
            param1: 'all',
            param2: filterData.isNoTtp ? filterData.no_ttp : 'all',
            param3: filterData.isTglChecked ? filterData.tgl_awal.format('YYYY-MM-DD') : 'all',
            param4: filterData.isTglChecked ? filterData.tgl_akhir.format('YYYY-MM-DD') : 'all',
            param5: filterData.isCustomer ? filterData.customer : 'all',
            param6: filterData.isSalesman ? filterData.salesman : 'all',
            param7: filterData.isTglKembaliChecked ? filterData.tgl_awal_kembali.format('YYYY-MM-DD') : 'all',
            param8: filterData.isTglKembaliChecked ? filterData.tgl_akhir_kembali.format('YYYY-MM-DD') : 'all',
            param9: filterData.isUserid ? filterData.userid : 'all',
            param10: filterData.prosesPosting === 'Semua' ? 'all' : filterData.prosesPosting === 'Ya' ? 'Y' : 'N',
            param11: filterData.buktiTtp === 'Semua' ? 'all' : filterData.buktiTtp === 'Ada' ? 'Y' : 'N',
            param12: filterData.buktiTtpKeuangan === 'Semua' ? 'all' : filterData.buktiTtpKeuangan === 'Ada' ? 'Y' : 'N',
            param13: filterData.kesesuaianSpesimen === 'Semua' ? 'all' : filterData.kesesuaianSpesimen === 'Sesuai' ? 'Y' : filterData.kesesuaianSpesimen === 'Tidak Sesuai' ? 'N' : 'X',
        };

        try {
            const response = await axios.get(`${apiUrl}/erp/list_daftar_bukti_ttp`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });

            const modifiedData = response.data.data.map((item: any) => ({
                ...item,
                jml_bayar: parseFloat(item.jml_bayar),
            }));

            const filteredData = modifiedData.filter((item: any) => {
                if (selectedTab === 0) return item.tombol === 'Y';
                else if (selectedTab === 1) return item.tombol === 'N';
                else return item.tombol === 'Y' || item.tombol === 'N';
            });

            setData(filteredData);
            gridListData.current?.setProperties({ dataSource: filteredData });
            gridListData.current?.refresh();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // useEffect(() => {
    //   fetchData();
    // }, []);

    useEffect(() => {
        fetchData();
    }, [selectedTab]);

    // TEMPLATE
    const templateBuktiTTP = (args: any) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                    {args.tombol_ttp === 'Y' ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <input
                                readOnly={true}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    borderRadius: '5px', // Atur sesuai dengan kebutuhan
                                    fontSize: '16px', // Sesuaikan ukuran font
                                }}
                                value={'✔️'}
                            />
                        </div>
                    ) : null}
                </div>
                <div onClick={() => loadImageDobel(args.filegambar_ttp, args.filegambar_ttd, args.kode_cust, 'buktiTtp')} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {args.tombol_ttp === 'Y' ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}
                </div>
            </div>
        );
    };

    const templateTombolTTD = (args: any) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                    {args.tombol_ttd === 'Y' ? (
                        <input
                            readOnly={true}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                borderRadius: '5px', // Atur sesuai dengan kebutuhan
                                fontSize: '16px', // Sesuaikan ukuran font
                            }}
                            value={'✔️'}
                        />
                    ) : null}
                </div>
                <div onClick={() => loadImageDobel(args.filegambar_ttp, args.filegambar_ttd, args.kode_cust, 'buktiTtp')} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {args.tombol_ttd === 'Y' ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}
                </div>
            </div>
        );
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const fileName = file.name.toLowerCase();
            const lastDotIndex = fileName.lastIndexOf('.');
            const fileExt = fileName.slice(lastDotIndex + 1).toLowerCase();

            // Membuat nama file sesuai format yang diinginkan
            const nameImage = `IMG_TTP${moment(selectedRow.tgl_ttp).format('YYMMDD')}${selectedRow.kode_dokumen}.${fileExt}`;

            const zip = new JSZip();
            zip.file(nameImage, file);

            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const formData = new FormData();
                formData.append('myimage', zipBlob);
                formData.append('ets', kode_entitas);
                formData.append('nama_file_image', `IMG_TTP${moment(selectedRow.tgl_ttp).format('YYMMDD')}${selectedRow.kode_dokumen}.zip`);

                const response = await axios.post(`${apiUrl}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200) {
                    const combinedArray = [
                        {
                            entitas: kode_entitas,
                            kode_dokumen: selectedRow.kode_dokumen,
                            id_dokumen: '1',
                            dokumen: 'PU',
                            filegambar: nameImage,
                            fileOriginal: file.name,
                        },
                        {
                            entitas: kode_entitas,
                            kode_dokumen: selectedRow.kode_dokumen,
                            id_dokumen: '999',
                            dokumen: 'PU',
                            filegambar: `IMG_${selectedRow.kode_dokumen}.zip`,
                            fileOriginal: `IMG_${selectedRow.kode_dokumen}.zip`,
                        },
                    ];

                    try {
                        const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);

                        if (insertResponse.status === 201) {
                            // const result = await axios.get(`${apiUrl}/erp/master_detail_posting_ttp?`, {
                            //   params: {
                            //     entitas: kode_entitas,
                            //     param1: selectedRow.kode_dokumen,
                            //   },
                            //   headers: { Authorization: `Bearer ${token}` },
                            // });

                            // const { master, detail } = result.data.data;
                            // console.log('Master:', master);
                            // console.log('Detail:', detail);

                            // Data.quTTPMfilegambar_scan.Value:= ExtractFileName(FImage);
                            //    Data.quTTPMtgl_scan.Value:= AppDate;
                            //    Data.quTTPMuserid_scan.Value:= Userid;
                            //    Data.quTTPMtombol.Value:= 'Y';

                            const reqBody = {
                                entitas: kode_entitas,
                                filegambar_scan: nameImage,
                                tgl_scan: moment().format('YYYY-MM-DD HH:mm:ss'),
                                userid_scan: userid.toUpperCase(),
                                ttd: selectedRow.ttd,
                                catatan: selectedRow.catatan,
                                kode_dokumen: selectedRow.kode_dokumen,
                            };

                            const res = await axios.post(`${apiUrl}/erp/update_daftar_ttp?`, reqBody, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.status === 200) {
                                withReactContent(swalDialog).fire({
                                    icon: 'success',
                                    title: `<p style="font-size:12px">Upload file berhasil</p>`,
                                    // width: '100%',
                                    target: '#main-target',
                                    showConfirmButton: false,
                                    timer: 2000,
                                });

                                setTimeout(() => {
                                    fetchData();
                                }, 1000);
                            }

                            // fetchData();
                        }
                    } catch (error) {}
                } else {
                    console.error('Upload failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error saat menyimpan data baru:', error);
            }
        }
    };

    const [refData, setRefData] = useState<any>(null);
    const [imageFile, setImageFile] = useState({
        nameImage: '',
        previewImg: '',
    });

    const updateStateImg = (field: any, value: any) => {
        setImageFile((prevState: any) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleFileSelect2 = async (args: any) => {
        setRefData(uploaderRef2.current);
        // console.log('Uploader Ref:', uploaderRef2.current);
        const file = args.filesData[0].rawFile;
        if (!file) {
            console.error('File tidak ditemukan');
            return;
        }

        const fileName = file.name.toLowerCase(); // Ubah nama file ke huruf kecil
        const lastDotIndex = fileName.lastIndexOf('.');
        const fileExtension = fileName.slice(lastDotIndex + 1).toLowerCase();

        const nameImage = `IMG_TTP${moment(selectedRow.tgl_ttp).format('YYMMDD')}${selectedRow.kode_dokumen}.${fileExtension}`;

        updateStateImg('nameImage', nameImage);
        const reader = new FileReader();
        reader.readAsDataURL(file);

        // console.log('nameImage: ', nameImage);
        // console.log('file: ', file);

        reader.onload = (e: any) => {
            // console.log('Image Preview:', e.target.result);
            updateStateImg('previewImg', e.target.result);
        };
    };

    const handleUpload = async () => {
        if (refData) {
            const rawFile = await fetch(imageFile.previewImg).then((res) => res.blob());
            const nameImage = imageFile.nameImage;

            const zip = new JSZip();
            zip.file(nameImage, rawFile);

            try {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const formData = new FormData();

                formData.append('myimage', zipBlob);
                formData.append('ets', kode_entitas);
                formData.append('nama_file_image', `IMG_TTP${moment(selectedRow.tgl_ttp).format('YYMMDD')}${selectedRow.kode_dokumen}.zip`);

                const response = await axios.post(`${apiUrl}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200) {
                    const combinedArray = [
                        {
                            entitas: kode_entitas,
                            kode_dokumen: selectedRow.kode_dokumen,
                            id_dokumen: '1',
                            dokumen: 'PU',
                            filegambar: nameImage,
                            fileOriginal: null,
                        },
                        {
                            entitas: kode_entitas,
                            kode_dokumen: selectedRow.kode_dokumen,
                            id_dokumen: '999',
                            dokumen: 'PU',
                            filegambar: `IMG_${selectedRow.kode_dokumen}.zip`,
                            fileOriginal: `IMG_${selectedRow.kode_dokumen}.zip`,
                        },
                    ];

                    try {
                        const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, combinedArray);

                        if (insertResponse.status === 201) {
                            const reqBody = {
                                entitas: kode_entitas,
                                filegambar_scan: nameImage,
                                tgl_scan: moment().format('YYYY-MM-DD HH:mm:ss'),
                                userid_scan: userid.toUpperCase(),
                                ttd: selectedRow.ttd,
                                catatan: selectedRow.catatan,
                                kode_dokumen: selectedRow.kode_dokumen,
                            };

                            const res = await axios.post(`${apiUrl}/erp/update_daftar_ttp?`, reqBody, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (res.status === 200) {
                                withReactContent(swalDialog).fire({
                                    icon: 'success',
                                    title: `<p style="font-size:12px">Upload file berhasil</p>`,
                                    // width: '100%',
                                    target: '#main-target',
                                    showConfirmButton: false,
                                    timer: 2000,
                                });
                                setTimeout(() => {
                                    fetchData();
                                }, 1000);
                            }
                            // fetchData();
                        }
                    } catch (error) {
                        console.error('Error saat menyimpan data baru:', error);
                    }
                }
            } catch (error) {
                console.error('Error saat upload data baru:', error);
            } finally {
                setShowDialogUpload(false);
            }
        }
    };

    const checkValueAccessorLevel2 = (field: string, data: any, column: any) => {
        if (data[field] === 'Y') return `✔️`;
        else if (data[field] === 'N') return `❌`;
        return '';
    };

    const templateTombolTTDStaff = (args: any) => {
        const alertDelete = () => {
            swal.fire({
                icon: 'question',
                html: `
        <div className="flex flex-col gap-2 !pr-0">
        <strong class="text-lg mb-4">Hapus dokumen pendukung?</strong>
        <p>Tanggal : ${moment(args.tgl_ttp).format('DD-MM-YYYY')}</p>
        <p>No. TTP : ${args.no_ttp}</p>
        </div>
        `,
                showCancelButton: true,
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
                backdrop: true,
                target: '#main-target',
            }).then((res) => {
                if (res.isConfirmed) {
                    deleteImage(selectedRow.kode_dokumen);
                }
            });
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                    {args.tombol === 'Y' ? (
                        <input
                            readOnly={true}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                borderRadius: '5px', // Atur sesuai dengan kebutuhan
                                fontSize: '16px', // Sesuaikan ukuran font
                            }}
                            value={'✔️'}
                        />
                    ) : null}
                </div>
                <div className="flex items-center gap-1">
                    {args.filegambar_scan !== null ? (
                        <>
                            <div onClick={alertDelete} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                {args.filegambar_scan !== null ? <FontAwesomeIcon icon={faStop} width="18" height="18" /> : null}
                            </div>
                            <div onClick={() => loadImageDobel(args.filegambar_scan, args.filegambar_ttd, args.kode_cust, 'ttdCust')} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                {args.filegambar_scan !== null ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* <input type="file" accept="image/*" id="file" hidden /> */}
                            {/* <input id={args.no_ttp} type="file" ref={uploaderRef} onChange={(e) => handleFileSelect(e)} hidden /> */}
                            <label
                                onClick={() => {
                                    setShowDialogUpload(true);
                                    setImageFile({
                                        nameImage: '',
                                        previewImg: '',
                                    });
                                }}
                                style={{ fontWeight: 'bold', fontSize: '14px' }}
                            >
                                {args.filegambar_scan === null ? <FontAwesomeIcon icon={faFolder} width="18" height="18" /> : null}
                            </label>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // const templateSpesimenSesuai = (args: any) => {
    //   return (
    //     <div onDoubleClick={() => handleSpesimenSesuai(args)}>
    //       <div style={args.ttd === 'Y' ? { color: 'green', fontWeight: 'bold', fontSize: '14px' } : args.ttd === 'N' ? { color: 'red', fontWeight: 'bold', fontSize: '14px' } : {}}>
    //         {args.ttd === 'Y' ? (
    //           <div style={{ position: 'relative', display: 'inline-block' }}>
    //             <input
    //               id={`ttd${args.kode_dokumen}`}
    //               readOnly={true}
    //               style={{
    //                 width: '100%',
    //                 height: '100%',
    //                 textAlign: 'center',
    //                 backgroundColor: 'transparent',
    //                 borderRadius: '5px', // Atur sesuai dengan kebutuhan
    //                 fontSize: '16px', // Sesuaikan ukuran font
    //               }}
    //               value={'✔'}
    //             />
    //             {/* <FontAwesomeIcon
    //                           icon={faCheck} // Atau ikon lain sesuai kebutuhan
    //                           style={{
    //                               position: 'absolute',
    //                               left: '50%', // Menyesuaikan posisi ikon
    //                               top: '50%',
    //                               transform: 'translate(-50%, -50%)',
    //                               color: 'green',
    //                           }}
    //                       /> */}
    //           </div>
    //         ) : args.ttd === 'N' ? (
    //           <div style={{ position: 'relative', display: 'inline-block' }}>
    //             <input
    //               id={`ttd${args.kode_dokumen}`}
    //               readOnly={true}
    //               style={{
    //                 width: '100%',
    //                 height: '100%',
    //                 textAlign: 'center',
    //                 backgroundColor: 'transparent',
    //                 borderRadius: '5px', // Atur sesuai dengan kebutuhan
    //                 fontSize: '16px', // Sesuaikan ukuran font
    //               }}
    //               value={'X'}
    //             />
    //           </div>
    //         ) : (
    //           <div style={{ position: 'relative', display: 'inline-block' }}>
    //             <input
    //               id={`ttd${args.kode_dokumen}`}
    //               readOnly={true}
    //               style={{
    //                 width: '233px',
    //                 backgroundColor: 'transparent',
    //                 border: 'none',
    //                 paddingLeft: '25px', // Pemberian ruang untuk ikon
    //               }}
    //             />
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   );
    // };

    const handleActionComplete = (args: any) => {
        if (args.requestType === 'save') {
            const { data } = args;

            const reqBody = {
                entitas: kode_entitas,
                catatan: data?.catatan,
                ttd: data?.ttd,
                kode_dokumen: data?.kode_dokumen,
            };

            axios.patch(`${apiUrl}/erp/update_catatan`, reqBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    };

    const handleRecordDblClick = async (args: any) => {
        if (args.column.field === 'ttd') {
            let paramObject;
            if (args.rowData.ttd === 'Y') {
                paramObject = {
                    entitas: kode_entitas,
                    catatan: args.rowData.catatan,
                    ttd: 'N',
                    kode_dokumen: args.rowData.kode_dokumen,
                };
            } else if (args.rowData.ttd === 'N') {
                paramObject = {
                    entitas: kode_entitas,
                    catatan: args.rowData.catatan,
                    ttd: null,
                    kode_dokumen: args.rowData.kode_dokumen,
                };
            } else {
                paramObject = {
                    entitas: kode_entitas,
                    catatan: args.rowData.catatan,
                    ttd: 'Y',
                    kode_dokumen: args.rowData.kode_dokumen,
                };
            }

            const response = await UpdateCatatan(paramObject, token);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status !== true) {
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                });
            } else {
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Spesimen Sesuai Berhasil Plaging.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });

                setTimeout(() => {
                    fetchData();
                }, 1000);
            }
        }
    };

    // Grid configuration
    const gridOptions = {
        pageSettings: {
            pageSize: 25,
            pageCount: 5,
            pageSizes: ['25', '50', '100', 'All'],
        },
        selectionSettings: {
            mode: 'Row',
            type: 'Single',
        },
        allowPaging: true,
        allowSorting: true,
        allowFiltering: false,
        allowResizing: true,
        autoFit: true,
        allowReordering: true,
        rowHeight: 22,
        height: '100%',
        gridLines: 'Both',
        // loadingIndicator: { indicatorType: 'Shimmer' },
    };

    return (
        <div className="Main h-[75vh]" id="main-target">
            {/* === Search Group & Button Group === */}
            <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col items-center justify-between md:flex-row">
                <div className="gap-2 sm:flex">
                    {/*=== Button Group ===*/}
                    <div className="flex flex-col pr-1 md:flex-row">
                        <ButtonComponent
                            id="btnFilter"
                            cssClass="e-primary e-small"
                            style={
                                panelVisible
                                    ? {
                                          width: '57px',
                                          height: '28px',
                                          marginBottom: '0.5em',
                                          marginTop: '0.5em',
                                          marginRight: '0.8em',
                                      }
                                    : { ...styleButton, color: 'white' }
                            }
                            onClick={handleFilterClick}
                            disabled={panelVisible}
                            content="Filter"
                        />
                    </div>
                </div>

                <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                        Daftar Bukti Tanda Terima Pembayaran
                    </span>
                </div>
            </div>

            {/* === Filter & Table === */}
            <div className="relative flex h-[calc(100vh-230px)] gap-3">
                {/* Filter */}
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[320px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede' }}
                    >
                        <div className="flex h-full flex-col pb-3">
                            <div className="pb-5">
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                    <div className="shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            {/* prettier-ignore */}
                                            <path
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                d="M22 5.814v.69c0 1.038 0 1.557-.26 1.987-.26.43-.733.697-1.682 1.231l-2.913 1.64c-.636.358-.955.538-1.182.735a2.68 2.68 0 00-.9 1.49c-.063.285-.063.619-.063 1.286v2.67c0 1.909 0 2.863-.668 3.281-.668.418-1.607.05-3.486-.684-.895-.35-1.342-.524-1.594-.879C9 18.907 9 18.451 9 17.542v-2.67c0-.666 0-1-.064-1.285a2.68 2.68 0 00-.898-1.49c-.228-.197-.547-.377-1.183-.735l-2.913-1.64c-.949-.534-1.423-.8-1.682-1.23C2 8.06 2 7.541 2 6.503v-.69"
                                            />
                                            <path
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815"
                                                opacity="0.5"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                </div>
                            </div>

                            <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                            <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="flex h-full flex-col gap-6 overflow-auto">
                                    {/* Filter List */}
                                    <div>
                                        {/* No Dokumen */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="No. TTP"
                                                checked={filterData.isNoTtp}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isNoTtp', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={filterData.no_ttp}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('no_ttp', value);
                                                        updateStateFilter('isNoTtp', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* // TANGGAL DOKUMEN // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tanggal"
                                                checked={filterData.isTglChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isTglChecked', value);
                                                }}
                                            />
                                        </div>

                                        <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
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
                                                    value={filterData.tgl_awal.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateFilter('tgl_awal', moment(args.value));
                                                        updateStateFilter('isTglChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                            <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
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
                                                    value={filterData.tgl_akhir.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateFilter('tgl_akhir', moment(args.value));
                                                        updateStateFilter('isTglChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>

                                        {/* Supplier */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Customer"
                                                checked={filterData.isCustomer}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isCustomer', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={filterData.customer}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('customer', value);
                                                        updateStateFilter('isCustomer', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Salesman */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Salesman"
                                                checked={filterData.isSalesman}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isSalesman', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={filterData.salesman}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('salesman', value);
                                                        updateStateFilter('isSalesman', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* // TANGGAL KEMBALI TTP // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tgl. Kembali TTP"
                                                checked={filterData.isTglKembaliChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isTglKembaliChecked', value);
                                                }}
                                            />
                                        </div>

                                        <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
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
                                                    value={filterData.tgl_awal_kembali.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateFilter('tgl_awal_kembali', moment(args.value));
                                                        updateStateFilter('isTglKembaliChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                            <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
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
                                                    value={filterData.tgl_akhir_kembali.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateFilter('tgl_akhir_kembali', moment(args.value));
                                                        updateStateFilter('isTglKembaliChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>

                                        {/* Userid */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="User ID"
                                                checked={filterData.isUserid}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isUserid', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={filterData.userid}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('userid', value);
                                                        updateStateFilter('isUserid', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Proses Posting */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Proses Posting</span>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2">
                                                {['Ya', 'Tidak', 'Semua'].map((option) => (
                                                    <label key={option} className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="lunas"
                                                            value={option}
                                                            checked={filterData.prosesPosting === option}
                                                            onChange={(e) => updateStateFilter('prosesPosting', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-1">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bukti TTP Salesman */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Bukti TTP Salesman</span>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2">
                                                {['Ada', 'Tidak Ada', 'Semua'].map((option) => (
                                                    <label key={option} className="inline-flex flex-wrap items-center">
                                                        <input
                                                            type="radio"
                                                            name="statusApproval"
                                                            value={option}
                                                            checked={filterData.buktiTtp === option}
                                                            onChange={(e) => updateStateFilter('buktiTtp', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-1">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bukti TTP Staf Keuangan */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Bukti TTP Staf Keuangan</span>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2">
                                                {['Ada', 'Tidak Ada', 'Semua'].map((option) => (
                                                    <label key={option} className="inline-flex flex-wrap items-center">
                                                        <input
                                                            type="radio"
                                                            name="ttpStaf"
                                                            value={option}
                                                            checked={filterData.buktiTtpKeuangan === option}
                                                            onChange={(e) => updateStateFilter('buktiTtpKeuangan', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-1">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Kesesuaian Spesimen */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Kesesuaian Spesimen</span>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2">
                                                {['Sesuai', 'Tidak Sesuai', 'Belum Dicheck', 'Semua'].map((option) => (
                                                    <label key={option} className="inline-flex flex-wrap items-center">
                                                        <input
                                                            type="radio"
                                                            name="kesesuaianSpesimen"
                                                            value={option}
                                                            checked={filterData.kesesuaianSpesimen === option}
                                                            onChange={(e) => updateStateFilter('kesesuaianSpesimen', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-1">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Refresh Button */}
                                    <div className="flex justify-center">
                                        <button type="button" onClick={fetchData} className="btn btn-primary mt-2">
                                            <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}

                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* Table */}
                <div className="h-full flex-1 overflow-auto">
                    <Tab.Group defaultIndex={0}>
                        <Tab.List className="flex gap-2">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab(0)}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                    >
                                        Diterima
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab(1)}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                    >
                                        Belum Diterima
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab(2)}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                    >
                                        Semua
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="h-[calc(100%_-_40px)]">
                            {(selectedTab === 0 || selectedTab === 1 || selectedTab === 2) && (
                                <GridComponent
                                    {...gridOptions}
                                    editSettings={{
                                        allowAdding: true,
                                        allowEditing: true,
                                        allowDeleting: true,
                                        newRowPosition: 'Bottom',
                                    }}
                                    ref={gridListData}
                                    dataSource={filteredData.length > 0 ? filteredData : data}
                                    locale="id"
                                    rowSelected={handleRowSelected}
                                    actionComplete={handleActionComplete}
                                    recordDoubleClick={handleRecordDblClick}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="no_ttp"
                                            headerText="No. TTP"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            allowEditing={false}
                                            width="120"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="tgl_ttp"
                                            headerText="Tanggal"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="80"
                                            clipMode="EllipsisWithTooltip"
                                            type="date"
                                            format={formatDate}
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="nama_relasi"
                                            headerText="Customer"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="300"
                                            clipMode="EllipsisWithTooltip"
                                            allowEditing={false}
                                            // template={handleDppCustomer}
                                        />
                                        <ColumnDirective
                                            field="nama_sales"
                                            headerText="Salesman"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="150"
                                            clipMode="EllipsisWithTooltip"
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="jml_bayar"
                                            headerText="Nominal Total Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            //autoFit
                                            width="150"
                                            // headerTemplate={headerNominalPembayaran}
                                            clipMode="EllipsisWithTooltip"
                                            allowEditing={false}
                                            format={'N2'}
                                        />
                                        <ColumnDirective
                                            field="tombol_ttp"
                                            headerText="Bukti TTP Salesman"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // headerTemplate={headerBuktiTtpSalesman}
                                            width="100"
                                            template={templateBuktiTTP}
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="tombol"
                                            headerText=" Bukti TTP Staff Keuangan"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // headerTemplate={headerSpesimenTtdStaf}
                                            width="100"
                                            template={templateTombolTTDStaff}
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="tombol_ttd"
                                            headerText="Spesimen TTD Customer"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // headerTemplate={headerSpesimenTtdCustomer}
                                            width="100"
                                            template={templateTombolTTD}
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="ttd"
                                            headerText="Spesimen Sesuai"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            // headerTemplate={headerSpesimenSesuai}
                                            width="100"
                                            // template={templateSpesimenSesuai}
                                            valueAccessor={checkValueAccessorLevel2}
                                            allowEditing={false}
                                        />
                                        <ColumnDirective
                                            field="catatan"
                                            headerText="Catatan"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="250"
                                            allowEditing={true}
                                            // template={editTemplateCatatan}
                                        />
                                        <ColumnDirective
                                            field="tgl_scan"
                                            headerText="Tgl. Kembali TTP"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="100"
                                            clipMode="EllipsisWithTooltip"
                                            allowEditing={false}
                                            type="date"
                                            format="dd-mm-yyyy"
                                        />
                                        <ColumnDirective
                                            field="userid_scan"
                                            headerText="UserId"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="130"
                                            clipMode="EllipsisWithTooltip"
                                            allowEditing={false}
                                        />
                                    </ColumnsDirective>
                                    <AggregatesDirective>
                                        <AggregateDirective>
                                            <AggregateColumnsDirective>
                                                <AggregateColumnDirective field="jml_bayar" type="Sum" format={'N2'} />
                                            </AggregateColumnsDirective>
                                        </AggregateDirective>
                                    </AggregatesDirective>
                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, Aggregate]} />
                                </GridComponent>
                            )}
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
            {/* Modal Approval Pengajuan */}
            {isOpenPreviewDobel && (
                <>
                    <Draggable>
                        <div className={`${styles.modalDetailDragable}`} style={modalPositionFilePendukungTTP}>
                            <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                                <div style={{ marginBottom: 21 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                        Bukti TTP Salesman : <span style={{ fontWeight: 'bold', color: 'red' }}>{selectedRowTtp}</span>
                                    </span>
                                </div>
                                <hr style={{ border: '1px solid gray' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                                    <div className="e-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <div style={{ width: '100%', height: '50%', marginTop: '5px' }}>
                                            <div className="flex" style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <div
                                                        className="border p-3"
                                                        style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '450px' }}
                                                        onClick={() => {
                                                            setOpenPreview(true);
                                                            setSelectedImgUrl(imageDataUrlTtp);
                                                        }}
                                                    >
                                                        <img src={imageDataUrlTtp} alt={`Zoomed ${indexPreviewTtp}`} style={{ maxWidth: '100%', maxHeight: '106%' }} />
                                                    </div>
                                                </div>
                                                <div style={{ width: '5%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    className={`${styles.closeButtonDetailDragable}`}
                                    onClick={() => {
                                        setIsOpenPreviewDobel(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                </button>
                            </div>
                        </div>
                    </Draggable>
                </>
            )}
            {/* ============================================================ */}

            {isOpenPreviewDobelTtd && (
                <>
                    <Draggable>
                        <div className={`${styles.modalDetailDragable}`} style={modalPositionFilePendukungTTD}>
                            <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                                <div style={{ marginBottom: 21 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                        Spesimen TTD Customer : <span style={{ fontWeight: 'bold', color: 'red' }}>{selectedRowTtp}</span>
                                    </span>
                                </div>
                                <hr style={{ border: '1px solid gray' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '5px' }} tabIndex={1}>
                                    <div className="e-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <div style={{ width: '100%', height: '50%', marginTop: '5px' }}>
                                            <div className="flex" style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <div
                                                        className="border p-3"
                                                        style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11, height: '450px' }}
                                                        onClick={() => {
                                                            setOpenPreview(true);
                                                            setSelectedImgUrl(imageDataUrlTtd);
                                                        }}
                                                    >
                                                        <img src={imageDataUrlTtd} style={{ maxWidth: '100%', maxHeight: '100%' }} alt={`Zoomed ${indexPreviewTtd}`} />
                                                    </div>
                                                </div>
                                                <div style={{ width: '5%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    className={`${styles.closeButtonDetailDragable}`}
                                    onClick={() => {
                                        setIsOpenPreviewDobelTtd(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                </button>
                            </div>
                        </div>
                    </Draggable>
                </>
            )}
            {/* ============================================================ */}

            {openPreview && (
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
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        <img
                            src={selectedImgUrl}
                            alt="previewImg"
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
                            <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomIn(setZoomScale)}></span>
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
                            <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomOut(setZoomScale)}></span>
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
                            <span
                                className="e-icons e-close"
                                style={{ fontSize: '20px', fontWeight: 'bold' }}
                                onClick={() => {
                                    setOpenPreview(false);
                                    setSelectedImgUrl('');
                                }}
                            ></span>
                        </ButtonComponent>
                    </div>
                </div>
            )}

            {showDialogUpload && (
                <Draggable>
                    <div className={`${styles.modalDetailDragable} e-content`} style={modalPositionFilePendukungTTD}>
                        <div className="e-content overflow-auto" style={{ maxHeight: '600px' }}>
                            <div style={{ marginBottom: 21 }}>
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>Upload File</span>
                            </div>
                            <hr style={{ border: '1px solid gray' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '300px', marginTop: '5px' }} tabIndex={1}>
                                {imageFile.previewImg ? (
                                    <div className="h-full w-[75%]">
                                        <img src={imageFile.previewImg} alt="" />
                                    </div>
                                ) : (
                                    <div className="flex h-full w-[75%] flex-col items-center justify-center border-2 border-dotted border-black">
                                        <div className="h-full w-full opacity-0">
                                            <UploaderComponent type="file" id="upload-files2" className="opacity-0" multiple={false} ref={uploaderRef2} selected={handleFileSelect2} />
                                        </div>
                                        {/* <span>CTRL + V to Paste File</span> */}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <label htmlFor="upload-files2" className="cursor-pointer rounded bg-gray-400 px-2 py-1 text-center text-sm text-white hover:bg-gray-500">
                                        Pilih File
                                    </label>
                                    <button
                                        className="mt-2 cursor-pointer rounded bg-gray-400 px-2 py-1 text-sm text-white hover:bg-gray-500"
                                        onClick={() => {
                                            setImageFile({
                                                nameImage: '',
                                                previewImg: '',
                                            });
                                            handleFocusModal();
                                        }}
                                    >
                                        Hapus File
                                    </button>
                                    <button
                                        className="mt-2 cursor-pointer rounded bg-gray-400 px-2 py-1 text-sm text-white hover:bg-gray-500"
                                        onClick={() => {
                                            handleUpload();
                                            handleFocusModal();
                                        }}
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button
                                className={`${styles.closeButtonDetailDragable}`}
                                onClick={() => {
                                    setShowDialogUpload(false);
                                    setImageFile({
                                        nameImage: '',
                                        previewImg: '',
                                    });
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default DaftarBuktiTTP;
