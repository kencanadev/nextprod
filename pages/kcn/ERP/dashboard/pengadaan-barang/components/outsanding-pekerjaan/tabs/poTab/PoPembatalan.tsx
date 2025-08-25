import React, { useEffect, useRef, useState } from 'react';
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
    rowSelected,
} from '@syncfusion/ej2-react-grids';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { FaCamera, FaSearch } from 'react-icons/fa';
import moment, { Moment } from 'moment';
import { entitaspajak, frmNumber, generateNU, generateNUDivisi, UpdateStatusCustomerNonAktif } from '@/utils/routines';

import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { enableRipple } from '@syncfusion/ej2-base';
import Swal from 'sweetalert2';
import axios from 'axios';
import idIDLocalization from 'public/syncfusion/locale.json';
import stylesIndex from '@styles/index.module.css';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import 'moment/locale/id';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { SpreadNumber } from '@/pages/kcn/ERP/fa/fpp/utils';
import { ReCalcDataNodes, resetFilePendukung } from './function';
import { downloadBase64Image } from '@/pages/kcn/ERP/master/kendaraan/function/function';
import GridPOBatal from './GridPOBatal';
import PDFForm from './PDFForm';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

interface HeaderState {
    status: any;
    message: any;
    kode_sp: any;
    no_sp: any;
    tgl_sp: any;
    kode_supp: any;
    tgl_berlaku: any;
    tgl_kirim: any;
    alamat_kirim: any;
    via: any;
    fob: any;
    kode_termin: any;
    kode_mu: any;
    kurs: any;
    kurs_pajak: any;
    kena_pajak: any;
    total_mu: any;
    diskon_dok: any;
    diskon_dok_mu: any;
    total_diskon_mu: any;
    total_pajak_mu: any;
    kirim_mu: any;
    netto_mu: any;
    total_rp: any;
    diskon_dok_rp: any;
    total_diskon_rp: any;
    total_pajak_rp: any;
    kirim_rp: any;
    netto_rp: any;
    total_berat: any;
    keterangan: any;
    userid: any;
    tgl_update: any;
    approval: any;
    tgl_approval: any;
    kirim_langsung: any;
    status_kirim: any;
    no_sjpabrik: any;
    tgl_sjpabrik: any;
    tgl_sjfax: any;
    nota: any;
    kontrak: any;
    kode_beli: any;
    fdo: any;
    produksi: any;
    nama_termin: any;
    nama_relasi: any;
    totalSetelahPajak: any;
    sub_total: any;
    dpp: any;
    totPajak: any;
    kode_jual: any;
}

const PembatalanPO = ({
    visible,
    onClose,
    kode_entitas,
    masterData = {},
    refereshData,
    token,
    userid,
    gridRefAsli,
}: {
    visible: boolean;
    onClose: Function;
    kode_entitas: string;
    masterData: any;
    refereshData: Function;
    token: string;
    userid: string;
    gridRefAsli: any;
}) => {
    const header = 'Baru Edit SO';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const fileInputRef = useRef<HTMLInputElement>(null);
    // console.log('refGridGudang',gridRefAsli);
    
    const GridPOBatalReff = useRef<any>(null);
    const GridGrupPOReff = useRef<any>(null);
    const [headerState, setHeaderState] = useState<HeaderState>({
        status: '',
        message: '',
        kode_sp: '',
        no_sp: '',
        tgl_sp: '',
        kode_supp: '',
        tgl_berlaku: '',
        tgl_kirim: '',
        alamat_kirim: '',
        via: '',
        fob: '',
        kode_termin: '',
        kode_mu: '',
        kurs: '',
        kurs_pajak: '',
        kena_pajak: '',
        total_mu: '',
        diskon_dok: '',
        diskon_dok_mu: '',
        total_diskon_mu: '',
        total_pajak_mu: '',
        kirim_mu: '',
        netto_mu: '',
        total_rp: '',
        diskon_dok_rp: '',
        total_diskon_rp: '',
        total_pajak_rp: '',
        kirim_rp: '',
        netto_rp: '',
        total_berat: '',
        keterangan: '',
        userid: '',
        tgl_update: '',
        approval: '',
        tgl_approval: '',
        kirim_langsung: '',
        status_kirim: '',
        no_sjpabrik: '',
        tgl_sjpabrik: '',
        tgl_sjfax: '',
        nota: '',
        kontrak: '',
        kode_beli: '',
        fdo: '',
        produksi: '',
        nama_termin: '',
        nama_relasi: '',
        totalSetelahPajak: '0',
        sub_total: '0',
        dpp: '0',
        totPajak: '0',
        kode_jual: '',
    });
    const [activeTab, setActiveTab] = useState('data_barang');
    const [kodeJualList, setKodeJualList] = useState<any>([]);
    const [pilihanBareng, setPilihanBareng] = useState({
        po_grup: '',
        ppn_atas_nama: '',
        kode_entitas: '',
    });
    const [listBPB, setListBPB] = useState<any>([]);
    const [visibleItem, setVisibleItem] = useState(false);
    const [selectedRowIndexSOBarang, setSelectedRowIndexSOBarang] = useState(0);
    const [marginList, setMarginList] = useState<any>([]);
    const [listPajak, seTlistPajak] = useState<any>([]);
    const [jendelaPendukung, setJendelaPendukung] = useState('gambar');
    const [tabUploadActive, setTabUploadActive] = React.useState<String | any>(0);
    const [uploadedFiles, setUploadedFiles] = React.useState<{ [key: string]: File | null | any }>(resetFilePendukung());
    const [recordListAreaBeli, setRecordListAreaBeli] = useState<any>([]);
    const [visiblePOGrup, setVisiblePOGrup] = useState(false);
    const [listPOGrup, setListPOGrup] = useState<any>([]);
    const [listPPNAtasNama, setListPPNAtasNama] = useState<any>([]);
    const [visiblePPNAtasNama, setVisiblePPNAtasNama] = useState(false);
    const [deleteFilePendukung, setDeleteFilePendukung] = React.useState<[] | any>([]);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [imageTipe, setImageTipe] = useState('');
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [indexPreview, setIndexPreview] = useState(0);
    const [isOpenPreviewDobel, setIsOpenPreviewDobel] = useState(false);
    const [isOpenPreviewDobelTtd, setIsOpenPreviewDobelTtd] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageDataUrlTtd, setImageDataUrlTtd] = useState('');
    const [imageDataUrlTtp, setImageDataUrlTtp] = useState('');
    const [zoomScaleTtd, setZoomScaleTtd] = useState(0.5);
    const [positionTtd, setPositionTtd] = useState({ x: 0, y: 0 });
    const [rotationAngle, setRotationAngle] = useState(0);
    const handleHeaderChange = (e: any) => {
        const { name, value } = e.target;

        // Update filterState
        setHeaderState((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };
    const headerTemplate = () => {
        return (
            <div className="flex h-full w-full gap-3 text-[8pt]">
                <p className="text-[8pt]">Pembatalan PO</p>

                <div className="flex w-[350px] bg-green-400 px-3 text-[8pt] text-yellow-400">
                    {`Kode Beli >>`}
                    <select
                        name="kode_beli"
                        value={headerState.kode_beli ?? ''}
                        onChange={handleHeaderChange}
                        className="block h-[30px] w-[200px] rounded-sm border border-gray-300 bg-gray-50 p-1 text-[8pt]  text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                        <option value="">Select Kode Beli</option>
                        {recordListAreaBeli.map((option : any) => (
                                    <option key={option.kode_beli} value={option.kode_beli}>
                                        {option.kode_beli} | {option.nama_beli}
                                    </option>
                                ))}
                    </select>
                </div>
            </div>
        );
    };
    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // console.log('headerState', headerState);

    const getKodeJual = async () => {
        const response = await axios.get(`${apiUrl}/erp/kode_jual`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const responseListAreaJual = response.data.data;
        setKodeJualList(responseListAreaJual);
    };

    const refreshDataMargin = async () => {
        try {
            const response = await axios.post(
                `${apiUrl}/erp/struktur_margin_harga_standar?`,
                {
                    entitas: kode_entitas,
                    request: 'GET',
                },
                {
                    params: {
                        entitas: kode_entitas,
                    },

                    // entitas=999&param1=SqlcustomerPreferensi&param2=Kas&param3=Y&param4=Kas
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // const modfiedData = response.data.data.filter((item: any) => item.header !== 'Y' && item.nama_customer.toLowerCase().startsWith('kas'))
            setMarginList(response.data.data);
        } catch (error) {}
    };
    const clickTabIndex = (event: any) => {
        const tabIndex = event.currentTarget.tabIndex;
        setTabUploadActive(tabIndex);
        // console.log('Tab index clicked:', tabIndex);
        //
        // e-item e-toolbar-item e-active
    };
    const styleButtonFilePendukung = {
        width: 125 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };
    const handlePaste = (e: any) => {
        e.preventDefault();

        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                const now = new Date();
                const year = now.getFullYear().toString().slice(-2); // Last 2 digits of the year
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');

                const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;

                // Create a new file name with the datetime string and original file extension
                const extension = file.name.split('.').pop();
                const newFileName = `${dateTimeString}.${extension}`;

                // Use a File constructor to create a new file object with the new name
                const renamedFile = new File([file], 'SP' + newFileName, { type: file.type });

                const reader = new FileReader();
                reader.readAsDataURL(renamedFile);
                reader.onloadend = () => {
                    const temp = uploadedFiles;
                    let currentTab = tabUploadActive;
                    temp[parseInt(tabUploadActive + 1)] = { file: renamedFile, fileUrl: reader.result as string, tabIndex: parseInt(tabUploadActive + 1) };
                    console.log('Upload file hapus : ', temp);
                    setTabUploadActive(-1);
                    setTimeout(() => {
                        setTabUploadActive(currentTab);
                    }, 100);
                    setUploadedFiles(temp);
                };
            }
        }
    };
    const handleFileChange = async (event: { target: { files: any[] } } | any) => {
        const file = event.target.files?.[0];
        if (file && file.type.includes('image')) {
            const file = event.target.files[0];
            if (file) {
                // Generate a datetime string
                const now = new Date();
                const year = now.getFullYear().toString().slice(-2); // Last 2 digits of the year
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');

                const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;

                // Create a new file name with the datetime string and original file extension
                const extension = file.name.split('.').pop();
                const newFileName = `${dateTimeString}.${extension}`;

                // Use a File constructor to create a new file object with the new name
                const renamedFile = new File([file], 'SP' + newFileName, { type: file.type });

                const reader = new FileReader();
                reader.readAsDataURL(renamedFile);
                reader.onloadend = () => {
                    const temp = uploadedFiles;
                    let currentTab = tabUploadActive;
                    temp[parseInt(tabUploadActive + 1)] = { file: renamedFile, fileUrl: reader.result as string, tabIndex: parseInt(tabUploadActive + 1) };
                    console.log('Upload file hapus : ', temp);
                    setTabUploadActive(-1);
                    setTimeout(() => {
                        setTabUploadActive(currentTab);
                    }, 100);
                    setUploadedFiles(temp);
                };
            }
        } else {
            alert('Please upload a JPG file.');
        }
        // Reset the input value to allow re-upload of the same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const handleDeleteFilePendukungOne = () => {
        Swal.fire({
            title: 'Yakin hapus File Pendukung urutan ke ' + parseInt(tabUploadActive + 1),
            text: 'Tekan ya jika yakin!',
            icon: 'warning',
            target: '#forDialogAndSwallOri',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya hapus!',
        }).then((result: any) => {
            if (result.isConfirmed) {
                const temp = uploadedFiles;
                temp[parseInt(tabUploadActive + 1)] = { file: null, fileUrl: null, tabIndex: parseInt(tabUploadActive + 1) };
                console.log('Upload file hapus : ', temp);
                setDeleteFilePendukung([...deleteFilePendukung, tabUploadActive + 1]);

                setUploadedFiles(temp);
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'File pendukung ' + parseInt(tabUploadActive + 1),
                    icon: 'success',
                    timer: 1500,
                    target: '#forDialogAndSwallOri',
                });
            }
        });
    };
    const handleBersihkanSemua = () => {
        Swal.fire({
            title: 'Hapus Semua gambar',
            text: 'Tekan ya jika yakin!',
            icon: 'warning',
            target: '#forDialogAndSwallOri',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya hapus!',
        }).then((result) => {
            if (result.isConfirmed) {
                const temp = Object?.values(uploadedFiles || {}).filter((item) => item.file !== null);
                let tempIndexForDelete: any = [];
                temp.map((item) => tempIndexForDelete.push(item.tabIndex));

                console.log('Upload file hapus : ', tempIndexForDelete);
                setDeleteFilePendukung([...tempIndexForDelete]);

                setUploadedFiles(resetFilePendukung());
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'File pendukung ',
                    icon: 'success',
                    timer: 1500,
                    target: '#forDialogAndSwallOri',
                });
            }
        });
    };
    const handlePreview = () => {
        if (uploadedFiles[tabUploadActive + 1].fileUrl === null) {
            return alert('Pilih dulu file pendukung nya');
        }
        const temp = uploadedFiles[tabUploadActive + 1];

        setImageDataUrl(temp.fileUrl);
        setImageTipe(temp.file.type);
        setIsOpenPreview(true);
    };
    const handleZoom = (tipe: any) => {
        if (tipe === 'ttd') {
            setZoomScaleTtd(1);
            setPositionTtd({ x: 0, y: 0 }); // Reset position
            setImageDataUrlTtd('');
        }
    };

    const HandleZoomIn = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const HandleZoomOut = (setZoomScale: Function) => {
        setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const HandleCloseZoom = (setIsOpenPreview: Function) => {
        setIsOpenPreview(false);
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
    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);
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
    const pembatlanHandle = async () => {
        if (headerState.kode_beli === '' || headerState.kode_beli === null || headerState.kode_beli === undefined) {
                    Swal.fire({
                        title: 'Kode beli diisi.',
                        icon: 'warning',
                         target: '#PembatalanPO'
                    });
                    return;
                }
        const objectHeader = {
            kode_entitas: kode_entitas,
            include: headerState.kena_pajak,
            tipeTransaksi: 'produksi',
            kodeSp: headerState.kode_sp,
            tipeDoc: 'batal',
        };
        const dataDetail = await ReCalcDataNodes(GridPOBatalReff.current.dataSource, objectHeader);
        const jsonData = {
            entitas: kode_entitas,
            kode_sp: headerState.kode_sp, // ini nanti dari Backend
            no_sp: headerState.no_sp,
            tgl_sp: moment(headerState.tgl_sp).format('YYYY-MM-DD HH:mm:ss'),
            kode_supp: headerState.kode_supp,
            tgl_berlaku: moment(headerState.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
            tgl_kirim: moment(headerState.tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
            alamat_kirim: headerState.alamat_kirim,
            via: headerState.via,
            fob: headerState.fob,
            kode_termin: headerState.kode_termin,
            kode_mu: headerState.kode_mu,
            kurs: SpreadNumber(headerState.kurs),
            kurs_pajak: SpreadNumber(headerState.kurs_pajak),
            kena_pajak: headerState.kena_pajak,
            total_mu: headerState.total_mu,
            diskon_dok: headerState.diskon_dok,
            diskon_dok_mu: headerState.diskon_dok_mu,
            total_diskon_mu: headerState.total_diskon_mu,
            total_pajak_mu: headerState.total_pajak_mu,
            kirim_mu: headerState.kirim_mu,
            netto_mu: headerState.netto_mu,
            total_rp: headerState.total_rp,
            diskon_dok_rp: headerState.diskon_dok_rp,
            total_diskon_rp: headerState.total_diskon_rp,
            total_pajak_rp: headerState.total_pajak_rp,
            kirim_rp: headerState.kirim_rp,
            netto_rp: headerState.netto_rp,
            total_berat: headerState.total_berat,
            keterangan: headerState.keterangan,
            status: 'Tertutup',
            statusDok: headerState.status,
            userid: userid.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            approval: headerState.approval,
            tgl_approval: moment(headerState.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
            kirim_langsung: headerState.kirim_langsung,
            status_kirim: headerState.status_kirim, // status kirim di default dulu N
            no_sjpabrik: headerState.no_sjpabrik,
            tgl_sjpabrik: moment(headerState.tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
            tgl_sjfax: moment(headerState.tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
            nota: headerState.nota,
            kontrak: headerState.kontrak,
            kode_beli: headerState.kode_beli,
            fdo: headerState.fdo,
            produksi: headerState.produksi,
            detailPo: dataDetail.detailJson,
        };
        const kodeFpb = dataDetail.detailJson[0].kode_fpb;
        const indexxx: number = gridRefAsli.dataSource.findIndex((item: any) => item.no_dok === headerState.no_sp);
        // console.log('jsonData', jsonData, indexxx);

        
        Swal.fire({
            // title: 'Warning',
            title: 'Apakah Anda yakin akan membatalkan data ini ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            target: '#PembatalanPO'
            // allowHtml: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                // const response = await axios.patch(`${apiUrl}/erp/update_po`, jsonData);
                const response =
                    kodeFpb === null || kodeFpb === '' || kodeFpb === undefined
                        ? await axios.patch(`${apiUrl}/erp/update_po_pembatalan`, jsonData)
                        : await axios.post(`${apiUrl}/erp/pembatalan_po`, jsonData); // perubahan 2025-06-05
                const result = response.data;
                const status = result.status;
                const errormsg = result.serverMessage;

                Swal.close();
                if (status === true) {
                    // await uploadFilePendukung();
                    const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                        entitas: kode_entitas,
                        kode_audit: null,
                        dokumen: 'SP',
                        kode_dokumen: headerState.kode_sp,
                        no_dokumen: headerState.no_sp,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'CANCEL',
                        diskripsi: `PO item = ${dataDetail.detailJson.length} total_berat = ${frmNumber(headerState.total_berat)} nilai transaksi ${frmNumber(headerState.kirim_rp)}`,
                        userid: userid.toUpperCase(), // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    });
                    if (auditResponse.data.status === true) {
                        Swal.fire({
                            title: `Data Berhasil Dibatalkan.`,
                            icon: 'success',
                        });
                    }

                    //back to pp list
                    // router.push({ pathname: './polist', query: { name: '', jenisTransaksi: '' } });
                    // router.push({ pathname: './polist' });
gridRefAsli.dataSource[indexxx] = {
            ...gridRefAsli.dataSource[indexxx],
            isRed: 'Y',
            status_app: 'Dibatalkan',
            status: 'Tertutup'
        };
                    gridRefAsli.refresh();
                    onClose();
                } else {
                    Swal.fire({
                        title: errormsg,
                        icon: 'warning',
                        target: '#PembatalanPO'
                    });
                }
            }
        }).catch((error : any) => {
            console.log('error',error);
            
        });
    };
    function terbilang(a: any): string {
        var bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
        var kalimat = '';

        if (typeof a === 'number') {
            a = parseFloat(a.toFixed(2));
        } else {
            a = parseFloat(parseFloat(a).toFixed(2));
        }

        var parts = a.toString().split('.');
        var angkaUtama = parseInt(parts[0]);
        var angkaDesimal = parts[1] ? parseFloat('0.' + parts[1]) : 0;

        function angkaKeKata(angka: number): string {
            if (angka === 0) {
                return '';
            }
            if (angka < 12) {
                return bilangan[angka];
            } else if (angka < 20) {
                return bilangan[angka - 10] + ' Belas';
            } else if (angka < 100) {
                var depan = Math.floor(angka / 10);
                var belakang = angka % 10;
                return bilangan[depan] + ' Puluh ' + (belakang > 0 ? bilangan[belakang] : '');
            } else if (angka < 200) {
                return 'Seratus ' + angkaKeKata(angka - 100);
            } else if (angka < 1000) {
                var depan = Math.floor(angka / 100);
                var belakang = angka % 100;
                return bilangan[depan] + ' Ratus ' + angkaKeKata(belakang);
            } else if (angka < 2000) {
                return 'Seribu ' + angkaKeKata(angka - 1000);
            } else if (angka < 1000000) {
                var depan = Math.floor(angka / 1000);
                var belakang = angka % 1000;
                return angkaKeKata(depan) + ' Ribu ' + angkaKeKata(belakang);
            } else if (angka < 1000000000) {
                var depan = Math.floor(angka / 1000000);
                var belakang = angka % 1000000;
                return angkaKeKata(depan) + ' Juta ' + angkaKeKata(belakang);
            } else if (angka < 1000000000000) {
                var depan = Math.floor(angka / 1000000000);
                var belakang = angka % 1000000000;
                return angkaKeKata(depan) + ' Milyar ' + angkaKeKata(belakang);
            } else if (angka < 1000000000000000) {
                var depan = Math.floor(angka / 1000000000000);
                var belakang = angka % 1000000000000;
                return angkaKeKata(depan) + ' Triliun ' + angkaKeKata(belakang);
            }
            return ''; // Untuk angka yang lebih besar
        }

        kalimat = angkaKeKata(angkaUtama);
        if (kalimat === '') {
            kalimat = 'Nol';
        }

        // Tambahkan bagian desimal menjadi sen
        if (angkaDesimal > 0) {
            var sen = Math.round(angkaDesimal * 100); // Konversi desimal menjadi sen
            if (sen > 0) {
                kalimat += ' Koma ' + angkaKeKata(sen) + ' Sen';
            }
        }

        return kalimat.trim();
    }
    const getPoDetail = async () => {
        // console.log('dataFromSupp', masterData);
        try {
            const res: any = await axios.get(`${apiUrl}/erp/list_data_edit_po`, {
                params: {
                    entitas: kode_entitas,
                    kode_sp: masterData[0].kode_dokumen,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('resresres', res);
            const mod = res.data.data.map((item: any) => ({
                ...item,
                harga_cabang: SpreadNumber(item.harga_cabang),
                harga_mu: SpreadNumber(item.harga_mu),
                jumlah_mu: SpreadNumber(item.jumlah_mu),
                jumlah_rp: SpreadNumber(item.jumlah_rp),
                total_berat: SpreadNumber(SpreadNumber(item.qty_std) * SpreadNumber(item.brt)),
            }));
            const subTot = mod.reduce((total: any, item: any) => {
                return total + item.jumlah_rp;
            }, 0);
            setHeaderState((oldData: HeaderState) => ({
                ...oldData,
                status: res.data.status,
                message: res.data.message,
                kode_sp: res.data.kode_sp,
                no_sp: res.data.no_sp,
                tgl_sp: moment(res.data.tgl_sp),
                kode_supp: res.data.kode_supp,
                tgl_berlaku: moment(res.data.tgl_berlaku),
                tgl_kirim: moment(res.data.tgl_kirim),
                alamat_kirim: res.data.alamat_kirim,
                via: res.data.via,
                fob: res.data.fob,
                kode_termin: res.data.kode_termin,
                kode_mu: res.data.kode_mu,
                kurs: SpreadNumber(res.data.kurs),
                kurs_pajak: SpreadNumber(res.data.kurs_pajak),
                kena_pajak: res.data.kena_pajak,
                total_mu: res.data.total_mu,
                diskon_dok: res.data.diskon_dok,
                diskon_dok_mu: res.data.diskon_dok_mu,
                total_diskon_mu: res.data.total_diskon_mu,
                total_pajak_mu: res.data.total_pajak_mu,
                kirim_mu: res.data.kirim_mu,
                netto_mu: res.data.netto_mu,
                total_rp: res.data.total_rp,
                diskon_dok_rp: res.data.diskon_dok_rp,
                total_diskon_rp: res.data.total_diskon_rp,
                total_pajak_rp: res.data.total_pajak_rp,
                kirim_rp: res.data.kirim_rp,
                netto_rp: res.data.netto_rp,
                total_berat: res.data.total_berat,
                keterangan: res.data.keterangan,
                userid: res.data.userid,
                tgl_update: moment(res.data.tgl_update),
                approval: res.data.approval,
                tgl_approval: moment(res.data.tgl_approval),
                kirim_langsung: res.data.kirim_langsung,
                status_kirim: res.data.status_kirim,
                no_sjpabrik: res.data.no_sjpabrik,
                tgl_sjpabrik: moment(res.data.tgl_sjpabrik),
                tgl_sjfax: moment(res.data.tgl_sjfax),
                nota: res.data.nota,
                kontrak: res.data.kontrak,
                kode_beli: res.data.kode_beli,
                fdo: res.data.fdo,
                produksi: res.data.produksi,
                nama_termin: res.data.nama_termin,
                nama_relasi: res.data.nama_relasi,
                sub_total: subTot,
            }));
          
            GridPOBatalReff.current.setProperties({ dataSource: mod.filter((item : any) => item.qty_sisa > 0) });
            GridPOBatalReff.current.refresh();
        } catch (error) {
            console.error(error);
        }
    };
    const getListPO = async () => {
        const response = await axios.get(`${apiUrl}/erp/get_po_group`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const responseListAreaJual = response.data.data;
        setListPOGrup(responseListAreaJual);
    };
    const getPPNAtasNama = async () => {
        const response = await axios.get(`${apiUrl}/erp/m_ppn_atas_nama`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const responseListAreaJual = response.data.data;
        setListPPNAtasNama(responseListAreaJual);
    };
    const getKodeBeli = async () => {
        const response = await axios.get(`${apiUrl}/erp/m_areabeli`, {
                    params: {
                        entitas: kode_entitas,
                    },
                });

                const responseListAreaBeli = response.data.data;
                setRecordListAreaBeli(responseListAreaBeli);
    };
    useEffect(() => {
        if (isOpenPreview) {
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
    }, [isOpenPreview, handleMouseMove, handleMouseUp, handleWheel]);
    useEffect(() => {
        const dialogElement = document.getElementById('#PembatalanPO');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);
    useEffect(() => {
        getPoDetail();
        getListPO();
        getKodeBeli();
        getPPNAtasNama();
    }, []);
    return (
        <DialogComponent
            id="PembatalanPO"
            isModal={true}
            width="99%"
            height="99%"
            visible={visible}
            close={() => onClose()}
            header={headerTemplate}
            showCloseIcon={true}
            target="#master-layout"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="h-full w-full">
                <div className={`main h-full w-full ${stylesIndex.scale85Dialog}`}>
                    <div className="flex h-[200px] w-full bg-black">
                        <div className="flex h-full w-[calc(100%-80px)] flex-col bg-white">
                            <table className="w-full" cellPadding={0} cellSpacing={0}>
                                <tbody className="text-[15px]/[0.50rem]">
                                    <tr className="h-[34px] border bg-[#5c7ba0] text-center text-[15px]/[0.50rem]">
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] font-bold text-yellow-400">Tanggal</td>
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] text-white">No. PO</td>
                                        <td className="w-[30%] border text-center text-[15px]/[0.50rem] text-white">Supplier</td>
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] text-white">Termin</td>
                                    </tr>
                                    <tr className="h-[34px]">
                                        {/* Tanggal */}
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{moment(headerState.tgl_sp).format('DD-MM-YYYY')}</td>

                                        {/* No. SO */}
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{headerState.no_sp}</td>

                                        {/* Customer */}
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{headerState.nama_relasi}</td>

                                        {/* Termin */}
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{headerState.nama_termin}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="w-full" cellPadding={0} cellSpacing={0}>
                                <tbody className="text-[15px]/[0.50rem]">
                                    <tr className="h-[34px] border bg-[#5c7ba0] text-center text-[15px]/[0.50rem]">
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] font-bold text-yellow-400">Tgl. Berlaku PO</td>
                                        <td className="w-[50%] border text-center text-[15px]/[0.50rem] text-white">Alamat Pengiriman</td>
                                        <td className="w-[10%] border text-center text-[15px]/[0.50rem] text-white">Cara Pengiriman</td>
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] text-white">Pajak</td>
                                    </tr>
                                    <tr className="h-[34px]">
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{moment(headerState.tgl_berlaku).format('DD-MM-YYYY')}</td>
                                        <td rowSpan={3} className="border bg-white p-0 align-top text-xs">
                                            <textarea
                                                name="alamat_kirim"
                                                value={headerState?.alamat_kirim}
                                                onChange={handleHeaderChange}
                                                rows={3}
                                                className="h-full w-full resize-none border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            />
                                        </td>

                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{headerState.fob}</td>

                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{headerState.kena_pajak}</td>
                                    </tr>
                                    <tr className="h-[34px] border bg-[#5c7ba0] text-center text-[15px]/[0.50rem]">
                                        <td className="w-[15%] border text-center text-[15px]/[0.50rem] font-bold text-yellow-400">Tgl. Estimasi Kirim</td>
                                        <td className="w-[10%] border text-center text-[15px]/[0.50rem] text-white" colSpan={2}>
                                            Pemesanan Via
                                        </td>
                                    </tr>
                                    <tr className="h-[34px]">
                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]">{moment(headerState.tgl_kirim).format('DD-MM-YYYY')}</td>

                                        <td className="border bg-white p-0 text-[15px]/[0.50rem]" colSpan={2}>
                                            {headerState.via}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex w-[80px] flex-col bg-[#dedede] p-[3px]">
                            <div className="flex w-full flex-col">
                                <div className="flex w-full flex-col">
                                    <label htmlFor="Kurs" className="w-full flex-shrink">
                                        Kurs
                                    </label>
                                    <input
                                        type="text"
                                        id="kurs"
                                        className="w-full rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Kurs"
                                        name="kurs"
                                        style={{ height: '20px', lineHeight: '20px' }}
                                        value={headerState.kurs}
                                    />

                                    <label htmlFor="Kurs" className="w-full flex-shrink">
                                        Kurs Pajak
                                    </label>
                                    <input
                                        type="text"
                                        id="kurs_pajak"
                                        className="w-full rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Kurs Pajak"
                                        name="kurs_pajak"
                                        value={headerState.kurs_pajak}
                                        style={{ height: '20px', lineHeight: '20px' }}
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-[calc(100%-400px)] w-full flex-col border ">
                        <div className="flex h-[30px] w-full justify-between bg-white">
                            <div className="flex ">
                                <button
                                    onClick={() => setActiveTab('data_barang')}
                                    className={`px-3 py-2 text-xs font-semibold ${activeTab === 'data_barang' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                >
                                    Data Barang
                                </button>
                                <button
                                    onClick={() => setActiveTab('file_pendukung')}
                                    className={`px-3 py-2 text-xs font-semibold ${activeTab === 'file_pendukung' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                >
                                    File Pendukung
                                </button>
                            </div>
                        </div>
                        <div className={`h-[calc(100%-60px)] w-full bg-white ${activeTab === 'data_barang' ? 'block' : 'hidden'}`}>
                            <div className="h-[calc(100%-30px)] w-full p-2">
                                <GridPOBatal GridPOBatalReff={GridPOBatalReff} />
                            </div>
                            <div className="flex h-[30px] w-full justify-between">
                                <div className="flex w-[200px] justify-between text-[15px]">
                                    <p>Total Berat</p>
                                    <p className="text-right">{frmNumber(String(SpreadNumber(headerState.total_berat)))} KG</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex h-[calc(100%-60px)] w-full gap-1 bg-white ${activeTab === 'file_pendukung' ? 'block' : 'hidden'}`}>
                            <div className="panel-tab dsd float-start flex h-full  w-full flex-col " style={{ background: '#fff' }}>
                                <div className="flex w-full pl-5 ">
                                    <button
                                        onClick={() => setJendelaPendukung('gambar')}
                                        className={`px-3 py-2 text-xs font-semibold ${jendelaPendukung === 'gambar' ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        Gambar
                                    </button>
                                    <button
                                        onClick={() => setJendelaPendukung('pdf')}
                                        className={`px-3 py-2 text-xs font-semibold ${jendelaPendukung === 'pdf' ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        PDF
                                    </button>
                                </div>
                                <div className={`h-full w-full gap-1 ${jendelaPendukung === 'gambar' ? 'block' : 'hidden'}`}>
                                    <div className="panel-tab dsd float-start flex h-full  w-full flex-col md:w-[50%]" style={{ background: '#fff' }}>
                                        {/* <TabComponent ref={(t) => (tabDialogFilePendukung = t)} selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                        
                                    </TabComponent> */}
                                        <div className="flex h-[10%] w-full  border">
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 0 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={0}
                                            >
                                                1
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 1 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={1}
                                            >
                                                2
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 2 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={2}
                                            >
                                                3
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 3 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={3}
                                            >
                                                4
                                            </div>
                                            <div
                                                className={`flex w-8 cursor-pointer items-center justify-center text-xs hover:bg-slate-200 ${
                                                    tabUploadActive === 4 && 'z-30 border-4 border-b-0 border-l-slate-200 border-r-slate-200  border-t-slate-200'
                                                }`}
                                                onClick={clickTabIndex}
                                                tabIndex={4}
                                            >
                                                5
                                            </div>
                                        </div>
                                        <div className="flex h-[80%] w-full items-center justify-center overflow-hidden">
                                            <div className={`h-full w-full `} onPaste={(e) => handlePaste(e)}>
                                                {uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl === null ? (
                                                    <div className="flex h-full w-full items-center justify-center ">Gambar belum ada untuk tab {parseInt(tabUploadActive + 1)}</div>
                                                ) : (
                                                    <div className="flex h-full  w-full content-center items-center justify-center">
                                                        <img
                                                            src={uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl}
                                                            alt={`File pendukung urutan ${parseInt(tabUploadActive + 1)}`}
                                                            className="h-full w-auto cursor-pointer "
                                                            onClick={handlePreview}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex h-[250px] min-w-[200px]    rounded border px-5 shadow">
                                        <div className="flex flex-col">
                                            <ButtonComponent onClick={handleClick} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                                Scanner
                                            </ButtonComponent>
                                            <ButtonComponent onClick={handleClick} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                                File
                                            </ButtonComponent>
                                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            <ButtonComponent onClick={handleDeleteFilePendukungOne} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                                Bersihkan Gambar
                                            </ButtonComponent>
                                            <ButtonComponent onClick={handleBersihkanSemua} id="btnFile" type="button" cssClass="e-primary e-small" style={styleButtonFilePendukung}>
                                                Bersihkan Semua
                                            </ButtonComponent>
                                            <ButtonComponent
                                                onClick={() => {
                                                    uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl === null
                                                        ? null
                                                        : downloadBase64Image(uploadedFiles[parseInt(tabUploadActive + 1)]?.fileUrl, uploadedFiles[parseInt(tabUploadActive + 1)]?.file.name);
                                                }}
                                                id="btnFile"
                                                type="button"
                                                cssClass="e-primary e-small"
                                                style={styleButtonFilePendukung}
                                            >
                                                Simpan Ke File
                                            </ButtonComponent>
                                            <ButtonComponent onClick={handlePreview} id="btnFile" type="button" cssClass="e-primary e-small flex" style={styleButtonFilePendukung}>
                                                <span className="flex h-full w-full items-center justify-center gap-2">
                                                    <FaCamera /> Preview
                                                </span>
                                            </ButtonComponent>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-full w-full gap-1 ${jendelaPendukung === 'pdf' ? 'block' : 'hidden'}`}>
                                    <PDFForm masterState={'EDIT'} pdfIndex={51} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
                                    <PDFForm masterState={'EDIT'} pdfIndex={52} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-[180px] w-full ">
                        <div className="flex w-[250px] flex-col gap-2 bg-[#dedede]">
                            <p>PO Grup</p>
                            <span className="flex h-[25px] w-full items-center gap-1">
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="PO Grup"
                                    className="flex-1 rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="PO Grup"
                                    name="PO Grup"
                                    style={{ height: '20px', lineHeight: '20px' }}
                                    onChange={() => {}}
                                    value={pilihanBareng.po_grup}
                                />
                                <button
                                    type="button"
                                    className="flex items-center justify-center rounded-sm bg-blue-600 px-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ height: '20px', lineHeight: '20px' }}
                                    onClick={() => setVisiblePOGrup(true)}
                                >
                                    <FaSearch />
                                </button>
                            </span>

                            <span className="flex h-[25px] w-full items-center gap-1">
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="ppn_atas_nama"
                                    className="flex-1 rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="PPN Atas Nama"
                                    name="ppn_atas_nama"
                                    style={{ height: '20px', lineHeight: '20px' }}
                                    onChange={() => {}}
                                    value={pilihanBareng.ppn_atas_nama}
                                />
                                <button
                                    type="button"
                                    className="flex items-center justify-center rounded-sm bg-blue-600 px-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ height: '20px', lineHeight: '20px' }}
                                    onClick={() => setVisiblePPNAtasNama(true)}
                                >
                                    <FaSearch />
                                </button>
                            </span>

                            <button
                                id="btnTerapkan"
                                className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => {
                                    if (pilihanBareng.kode_entitas === '') {
                                        alert('Pilih PPN Atas Nama Telebih Dahulu');
                                        setVisiblePPNAtasNama(true);
                                        return;
                                    }
                                    if (pilihanBareng.po_grup === '') {
                                        alert('Pilih PO Grup Telebih Dahulu');
                                        setVisiblePOGrup(true);
                                        return;
                                    }
                                    const temp = GridPOBatalReff.current.dataSource;

                                    const TempAsli = temp.map((item: any) => ({
                                        ...item,
                                        kode_entitas: pilihanBareng.kode_entitas,
                                        kodegrup: pilihanBareng.po_grup,
                                        nama_cabang: pilihanBareng.ppn_atas_nama,
                                    }));
                                    GridPOBatalReff.current.dataSource = TempAsli;
                                    GridPOBatalReff.current.refresh();
                                }}
                            >
                                🔂 Terapkan Semua
                            </button>
                        </div>
                        <div className="box-border flex w-[calc(100%-550px)] flex-col p-2">
                            <div className="flex w-full justify-end">
                                <label className="flex w-[400px] gap-2 bg-emerald-400" htmlFor="">
                                    <input type="checkbox" checked={headerState.status} /> <span>Barang Dikirim Langsung ke customer (Kirim Langsung)</span>
                                </label>
                            </div>
                            <p>Catatan :</p>
                            <textarea
                                name="keterangan"
                                value={headerState?.keterangan || ''}
                                // onChange={informasiChange}
                                rows={4}
                                className="w-full resize-none border border-gray-400 bg-gray-50  p-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                            />
                            <p>
                                Terbilang : <span className="text-green-500">{terbilang(String(SpreadNumber(headerState.netto_mu)))}</span>
                            </p>
                        </div>
                        <div className="w-[350px] ">
                            <table className="h-full w-full text-[15px]">
                                <tr>
                                    <td>Sub Total</td>
                                    <td className="text-right">{frmNumber(String(headerState.sub_total))}</td>
                                </tr>
                                <hr />
                                <tr>
                                    <td>Diskon %</td>
                                    <td>
                                        <span className="flex w-full items-center gap-1">
                                            <input
                                                type="text"
                                                id="no_so"
                                                className="w-[50px] rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="%"
                                                name="no_so"
                                                value={headerState.diskon_dok}
                                                style={{ height: '20px', lineHeight: '20px' }}
                                            />
                                            <i>=</i>
                                            <input
                                                type="text"
                                                id="rp"
                                                className="w-full rounded-sm border border-gray-400 bg-gray-50 px-1 text-[15px]/[0.50rem] text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="RP"
                                                name="rp"
                                                style={{ height: '20px', lineHeight: '20px' }}
                                            />
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>DPP</td>
                                    <td className="text-right">{frmNumber(String(headerState.dpp))}</td>
                                </tr>
                                <tr>
                                    <td>Pajak</td>
                                    <td className="text-right">{frmNumber(String(headerState.total_pajak_mu))}</td>
                                </tr>
                                <tr>
                                    <td>Estimasi Biaya Kirim</td>
                                    <td className="text-right">{frmNumber(String(headerState.kirim_rp))}</td>
                                </tr>
                                <tfoot>
                                    <tr>
                                        <td>Total Setelah Pajak</td>
                                        <td className="text-right">{frmNumber(String(headerState.total_rp))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div className="flex h-[30px] w-full justify-between bg-[#dedede]">
                        <div className="flex gap-2">
                            <button id="btnSimpan" className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                                📃 Info Customer
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                id="btnSimpan"
                                className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-red-200  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={pembatlanHandle}
                            >
                                📇 Batalkan
                            </button>
                            <button
                                id="btnTutup"
                                className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => onClose()}
                            >
                                ❌ Tutup
                            </button>
                        </div>
                    </div>
                </div>
                {isOpenPreview && (
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
                            {imageTipe.includes('image') ? (
                                <img
                                    src={imageDataUrl}
                                    alt={`Zoomed ${indexPreview}`}
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
                            ) : (
                                <video
                                    src={imageDataUrl}
                                    style={{
                                        transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                        transition: 'transform 0.1s ease',
                                        cursor: 'pointer',
                                        maxWidth: '100vw',
                                        maxHeight: '100vh',
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    controls
                                    width={500}
                                    height={500}
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
                                <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => HandleCloseZoom(setIsOpenPreview)}></span>
                            </ButtonComponent>
                        </div>
                    </div>
                )}
                {visiblePOGrup && (
                    <DialogComponent
                        id="PoGrupID"
                        isModal={true}
                        width="300"
                        height="500"
                        visible={visiblePOGrup}
                        close={() => setVisiblePOGrup(false)}
                        header={'PO Grup'}
                        showCloseIcon={true}
                        target="#PembatalanPO"
                        closeOnEscape={false}
                        allowDragging={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
                        style={{ position: 'fixed' }}
                    >
                        <div className="h-full w-full">
                            <div className="h-[calc(100%-30px)] w-full">
                                <GridComponent
                                    id="GridGrupPO"
                                    locale="id"
                                    // dataSource={dsTab1}
                                    height={'100%'}
                                    dataSource={listPOGrup}
                                    // rowSelected={selectedRowHandle}
                                    recordDoubleClick={(args) => {
                                        // const temp = GridPOBatalReff.current.dataSource;
                                        // const TempAsli = temp.map((item: any) => ({
                                        //     ...item,
                                        //     kodegrup: args.rowData.kodegrup,
                                        // }));
                                        // GridPOBatalReff.current.dataSource = TempAsli;
                                        // GridPOBatalReff.current.refresh();
                                        setPilihanBareng((oldData) => ({
                                            ...oldData,
                                            po_grup: args.rowData.kodegrup,
                                        }));
                                        setVisiblePOGrup(false);
                                    }}
                                    // dataSource={listBPBNon}
                                    // allowPaging={true}
                                    autoFit={true}
                                    width={'100%'}
                                    gridLines="Both"
                                    allowResizing={true}
                                    allowReordering={true}
                                    allowSorting={true}
                                    rowHeight={23}
                                    // rowDataBound={handleRowDataBound}
                                    // ref={gridCashCount}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="kodegrup" width="auto" headerText="Kode Grup" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                                    </ColumnsDirective>
                                </GridComponent>
                            </div>
                            <div className="flex h-[30px] w-full justify-end gap-2">
                                <button id="btnSimpan" className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                                    📇 OK
                                </button>
                                <button
                                    onClick={() => setVisiblePOGrup(false)}
                                    id="btnTutup"
                                    className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    ❌ Tutup
                                </button>
                            </div>
                        </div>
                    </DialogComponent>
                )}
                {visiblePPNAtasNama && (
                    <DialogComponent
                        id="PPNID"
                        isModal={true}
                        width="300"
                        height="500"
                        visible={visiblePPNAtasNama}
                        close={() => setVisiblePPNAtasNama(false)}
                        header={'PO Grup'}
                        showCloseIcon={true}
                        target="#PembatalanPO"
                        closeOnEscape={false}
                        allowDragging={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
                        style={{ position: 'fixed' }}
                    >
                        <div className="h-full w-full">
                            <div className="h-[calc(100%-30px)] w-full">
                                <GridComponent
                                    id="GridGrupPO"
                                    locale="id"
                                    // dataSource={dsTab1}
                                    height={'100%'}
                                    dataSource={listPPNAtasNama}
                                    // rowSelected={selectedRowHandle}
                                    recordDoubleClick={(args) => {
                                        const temp = GridPOBatalReff.current.dataSource;
                                        const TempAsli = temp.map((item: any) => ({
                                            ...item,
                                            nama_cabang: args.rowData.nama_cabang,
                                            kode_entitas: args.rowData.kodecabang,
                                        }));
                                        // GridPOBatalReff.current.dataSource = TempAsli;
                                        // GridPOBatalReff.current.refresh();
                                        setPilihanBareng((oldData) => ({
                                            ...oldData,
                                            ppn_atas_nama: args.rowData.nama_cabang,
                                            kode_entitas: args.rowData.kodecabang,
                                        }));
                                        setVisiblePPNAtasNama(false);
                                    }}
                                    // dataSource={listBPBNon}
                                    // allowPaging={true}
                                    autoFit={true}
                                    width={'100%'}
                                    gridLines="Both"
                                    allowResizing={true}
                                    allowReordering={true}
                                    allowSorting={true}
                                    rowHeight={23}
                                    // rowDataBound={handleRowDataBound}
                                    // ref={gridCashCount}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="kodecabang" width="auto" headerText="Entitas" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective field="nama_cabang" width="auto" headerText="Nama Cabang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                                    </ColumnsDirective>
                                </GridComponent>
                            </div>
                            <div className="flex h-[30px] w-full justify-end gap-2">
                                <button id="btnSimpan" className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                                    📇 OK
                                </button>
                                <button
                                    onClick={() => setVisiblePPNAtasNama(false)}
                                    id="btnTutup"
                                    className="rounded-md bg-[#3a3f5c] px-4 py-1 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    ❌ Tutup
                                </button>
                            </div>
                        </div>
                    </DialogComponent>
                )}
            </div>
        </DialogComponent>
    );
};

export default PembatalanPO;
