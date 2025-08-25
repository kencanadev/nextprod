import { useEffect, useState, useRef } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from './pblist.module.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { faTimes, faCamera, faMagnifyingGlass, faPlay, faList, faSave, faBackward, faPrint, faTrash, faCancel, faFileArchive, faTableList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import SupplierModal from './modal/daftarSupplier';
import AuthModal from './modal/loginModal';
import POModal from './modal/daftarPO';
import React from 'react';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { useTheme } from '@table-library/react-table-library/theme';
import { useRouter } from 'next/router';
import moment from 'moment';
import axios from 'axios';
import { formatNumber, frmNumber, generateNU, FillFromSQL, FirstDayInPeriod, tanpaKoma, fetchPreferensi } from '@/utils/routines';
import Swal from 'sweetalert2';
import { faSort, faSortUp, faSortDown, faCircle, faCirclePlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import DaftarPOItem from './modal/daftarPOItem';
import Draggable from 'react-draggable';
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
L10n.load(idIDLocalization);
enableRipple(true);
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import withReactContent from 'sweetalert2-react-content';
import { entitaspajak, swalDialog } from '@/utils/global/fungsi';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
import { CekUserApp } from '../../fa/ppi/model/apiPpi';
import { swalToast } from '../../fa/ppi/interface/template';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface QueryParams {
    [key: string]: string;
}

// interface PBListProps {
//     userid: any;
//     kode_entitas: any;
//     kode_user: any;
// }

const NewPB = () => {
    const router = useRouter();
    const mounted = useRef(false);
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const [dateTglDokumen, setDateTglDokumen] = useState<any>(moment());
    const [dateTglDiterima, setDateTglDiterima] = useState<any>(moment());
    const [dateTglSj, setDateTglSj] = useState<any>(moment());

    // modal
    const [modalSupplier, setModalSupplier] = useState(false);
    const [modalLogin, setModalLogin] = useState(false);
    const [modalPO, setModalPO] = useState(false);
    const [modalPOItem, setModalPOItem] = useState(false);

    const [disableDaftarPO, setDisableDaftarPO] = useState(false);
    const [selectedNamaSupp, setNamaSupp] = useState('');
    const [selectedKodeSupp, setKodeSupp] = useState('');
    const [kodeGudang, setKodeGudang] = useState('');
    const [kodeVia, setKodeVia] = useState('');
    const [kodeSJ, setKodeSJ] = useState('');
    const [dokumen, setDokumen] = useState('Ambil Sendiri');
    const [pengemudi, setPengemudi] = useState('');
    const [nopol, setNopol] = useState('');
    const [kodeTermin, setKodeTermin] = useState('');
    const [poSelected, setPOSelectedList] = useState([]);
    const [listEkspedisi, setListEkspedisi] = useState([]);
    const [listGudang, setListGudang] = useState([]);
    const [noPB, setNoPB] = useState('');
    const [kodePB, setKodePB] = useState('');
    const [totalBeratHeader, setTotalBeratHeader] = useState(null);
    const [data, setData] = useState({ nodes: [] });
    const [indexNum, setIndexNum] = useState(0);
    const [catatan, setCatatan] = useState('');
    const [diskonDok, setDiskonDok] = useState(0);
    const [kenaPajak, setKenaPajak] = useState('');
    const [kirimMU, setKirimMU] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedRowsImage, setSelectedRowsImage] = useState('');
    const [selectedRowsImagePO, setSelectedRowsImagePO] = useState('');
    const [selectedRowsImageJenis, setSelectedRowsImageJenis] = useState('');
    const [selectedRowsImageServer, setSelectedRowsImageServer] = useState('');
    const [selectedRowsImageServerPO, setSelectedRowsImageServerPO] = useState('');
    const [selectedRowsImageFilegambarServer, setSelectedRowsImageFilegambarServer] = useState('');
    const [selectedRowsImageFilegambarServerPO, setSelectedRowsImageFilegambarServerPO] = useState('');
    const [indexMy, setIndex] = useState(0);

    //=============file pendukung=================

    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [selectedNamaFiles, setNamaFiles] = useState<any>([]);
    const formattedName = moment().format('YYMMDDHHmmss');
    const [indexHapus, setIndexHapus] = useState<number[]>([]);
    const [selectedImages, setSelectedImages] = useState('');
    const [selectedImagesPO, setSelectedImagesPO] = useState('');
    const [modalPosition] = useState({ top: '15%', left: '35%' });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showPreviewModalPO, setShowPreviewModalPO] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomLevelPO, setZoomLevelPO] = useState(1);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [periode, setPeriode] = useState('');
    const vRefreshData = useRef(0);

    //EDIT
    const [headerEdit, setHeaderEdit] = useState(null);
    const [kodePO, setKodePO] = useState('');
    const currentDate = moment().format('YYYY-MM-DD');
    const [selectedFilesPO, setSelectedFilesPO] = useState<any>([]);
    const [isSaving, setIsSaving] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    let decodedData: string = '';
    let routeKodePBValue: any,
        routeTglAwal: any,
        routeTglAkhir: any,
        routeTglSjSuppAwal: any,
        routeTglSjSuppAkhir: any,
        routeEditValue: any,
        routeKontrakValue: any,
        routeTipeDokumen: any,
        routeFilePendukungValue: any,
        routeNoPBValue: any,
        routeNoSJValue: any,
        routeSupplierValue: any,
        routeSelectedGudang: any,
        routeNamaBarangValue: any,
        routeSelectedStatus: any,
        routeSelectedOptionRadio: any,
        routeJenisBarang: any;

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };
    const editKodeGudang = useRef('');
    const [indexPreview, setIndexPreview] = useState(0);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [rotationAngle, setRotationAngle] = useState(0);
    const [tokenRedis, setTokenRedis] = useState<any>('');

    const [zoom, setZoom] = useState(1.0); // nilai default zoom 100%
    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });

    const handleCloseZoom = () => {
        setIsOpenPreview(false);
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

    const handleSubmit = () => {
        // const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = data.nodes.length + 1;

        const newNode = {
            id_lpb: id,
            kode_sp: '',
            id_sp: '',
            kode_pp: '',
            id_pp: '',
            kode_item: '',
            diskripsi: '',
            satuan: '',
            qty_po: '',
            sat_sj: '',
            qty_sj: '',
            qty: '',
            brt: '',
            sat_std: '',
            qty_std: '',
            qty_sisa: '',
            qty_retur: '',
            qty_lkb: '',
            kode_mu: '',
            kurs: '',
            kurs_pajak: '',
            harga_mu: '',
            diskon: '',
            diskon_mu: '',
            potongan_mu: '',
            kode_pajak: '',
            pajak: '',
            include: '',
            pajak_mu: '',
            jumlah_mu: '',
            jumlah_rp: '',
            ket: '',
            kode_dept: '',
            kode_kerja: '',
            kode_fpb: '',
            id_fpb: '',
            kode_fpac: '',
            id_fpac: '',
        };

        // setData((state: any) => ({
        //     ...state,
        //     nodes: state.nodes.concat(newNode),
        // }));

        const hasEmptyFields = data.nodes.some((row: { diskripsi: string }) => row.diskripsi === '');

        if (!hasEmptyFields) {
            setData((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        } else {
            alert('Harap isi task sebelum tambah data');
        }

        // event.preventDefault();
    };

    const Async = async () => {
        const responseListEkspedisi = await axios.get(`${apiUrl}/erp/list_ekspedisi?`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const responseEkspedisi = responseListEkspedisi.data.data;
        setListEkspedisi(responseEkspedisi);

        const result = await fetchPreferensi(kode_entitas, apiUrl);
        setKodeGudang(result[0].kode_gudang);

        // const responseListGudang = await axios.get(`${apiUrl}/erp/list_gudang_forfilter?`, {
        //     params: {
        //         entitas: kode_entitas,
        //         param1: 'ADMIN', // sementara
        //     },
        // });

        // const responseGudang = responseListGudang.data.data;
        // setListGudang(responseGudang);

        await FillFromSQL(kode_entitas, 'gudang', kode_user)
            .then((result: any) => {
                setListGudang(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        const respToken = await axios.get(`${apiUrl}/erp/token_uuid`, {});

        const responseToken = respToken.data.token;
        setTokenRedis(responseToken);
    };

    useEffect(() => {
        // const { kontrak } = router.query;
        // const { name } = router.query;
        // const { edit } = router.query;
        // console.log(kontrak);
        // console.log(name);
        // console.log(edit);

        if (!mounted.current) {
            mounted.current = true;
            handleSubmit();
            console.log('routeKodePBValue = ', routeKodePBValue);
            if (routeKodePBValue === undefined) {
                Async();
            } else {
                Edit(routeKodePBValue);
            }
        }
    }, [router.query]);

    const theme = useTheme({
        Header: `
                    .th {
                      border-bottom: 1px solid #a0a8ae;
                    }
                  `,
        Row: `
                  &:nth-of-type(odd) {
                    background-color: #f9fafb;
                  }
                  &:nth-of-type(even) {
                    background-color: white;
                  }
                  &:not(:last-of-type) .td {
                    border-bottom: 1px solid #a0a8ae;
                  }
                `,
        BaseCell: `
                    &:not(:last-of-type) {
                      border-right: 1px solid #a0a8ae;
                    }
                  `,
        Table: `
                  --data-table-library_grid-template-columns: 9% 6% 13% 6% 15% 4% 5% 4% 5% 4% 5% 5% minmax(300px, 1fr) ;
                `,
    });

    if (isLoading) {
        return;
    }

    // const { edit } = router.query;
    // const { kontrak } = router.query;
    // const { name } = router.query;
    //encode url
    const { str } = router.query;

    if (typeof str === 'string') {
        decodedData = Buffer.from(str, 'base64').toString('ascii');

        const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
            const [key, value] = keyValue.split('=');
            acc[key] = value;
            return acc;
        }, {} as QueryParams);

        const {
            kode_lpb,
            edit,
            kontrak,
            updatefilependukung,
            tglAwal,
            tglAkhir,
            tglSjSuppAwal,
            tglSjSuppAkhir,
            tipe,
            vTipeDokumen,
            noPBValue,
            noSJValue,
            SupplierValue,
            selectedGudang,
            NamaBarangValue,
            selectedStatus,
            selectedOptionRadio,
        } = queryParams;

        routeKodePBValue = kode_lpb;
        routeEditValue = edit;
        routeKontrakValue = kontrak;
        routeTglAwal = tglAwal;
        routeTglAkhir = tglAkhir;
        routeTglSjSuppAwal = tglSjSuppAwal;
        routeTglSjSuppAkhir = tglSjSuppAkhir;
        routeFilePendukungValue = updatefilependukung;
        routeJenisBarang = tipe;
        routeTipeDokumen = vTipeDokumen;
        routeNoPBValue = noPBValue;
        routeNoSJValue = noSJValue;
        routeSupplierValue = SupplierValue;
        routeSelectedGudang = selectedGudang;
        routeNamaBarangValue = NamaBarangValue;
        routeSelectedStatus = selectedStatus;
        routeSelectedOptionRadio = selectedOptionRadio;
    }
    // end

    const backPage = () => {
        const encode = Buffer.from(
            `vPbKontrak=${routeSelectedOptionRadio}&vStatus=${routeSelectedStatus}&vNamaBarang=${routeNamaBarangValue}&vKodeGudang=${routeSelectedGudang}&vSupp=${routeSupplierValue}&vNoSJ=${routeNoSJValue}&vNoPB=${routeNoPBValue}&vTipeDokumen=${routeTipeDokumen}&tglAwal=${routeTglAwal}&tglAkhir=${routeTglAkhir}&tglSjSuppAwal=${routeTglSjSuppAwal}&tglSjSuppAkhir=${routeTglSjSuppAkhir}`
        ).toString('base64');
        router.push({ pathname: './pblist', query: { str: encode } });
    };

    const Edit = async (routeKodePBValue: any) => {
        const responseListEkspedisi = await axios.get(`${apiUrl}/erp/list_ekspedisi?`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const responseEkspedisi = responseListEkspedisi.data.data;
        setListEkspedisi(responseEkspedisi);

        await FillFromSQL(kode_entitas, 'gudang', kode_user)
            .then((result: any) => {
                setListGudang(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        const headerPraPB = await axios.get(`${apiUrl}/erp/app_header_prapb?`, {
            params: {
                entitas: kode_entitas,
                param1: routeKodePBValue,
            },
        });
        console.log({
            entitas: kode_entitas,
            param1: routeKodePBValue,
        });

        const result = headerPraPB.data.data;
        const resHeader = result[0] || {};

        setHeaderEdit(resHeader);
        setKodeSupp(resHeader.kode_supp);
        setKodeTermin(resHeader.kode_termin);
        setNamaSupp(resHeader.nama_relasi);
        setKodeSJ(resHeader.no_reff);
        setDateTglDiterima(resHeader.tgl_trxlpb);
        setDateTglDokumen(resHeader.tgl_lpb);
        setDateTglSj(resHeader.tgl_sj);
        setKodeGudang(resHeader.kode_gudang);
        editKodeGudang.current = resHeader.kode_gudang;
        setKodeVia(resHeader.via);
        setPengemudi(resHeader.pengemudi);
        setNopol(resHeader.nopol);
        setDokumen(resHeader.dokumen);
        setCatatan(resHeader.keterangan);
        setNoPB(resHeader.no_lpb);
        setKodePB(resHeader.kode_lpb);
        setDiskonDok(resHeader.diskon_dok); //
        setKenaPajak(resHeader.kena_pajak); //
        setKirimMU(resHeader.kirim_mu);

        const detailPraPB = await axios.get(`${apiUrl}/erp/app_detail_prapb?`, {
            params: {
                entitas: kode_entitas,
                param1: routeKodePBValue,
            },
        });

        const resDetail = detailPraPB.data.data;
        const modifiedResponse: any = resDetail.map((item: any) => ({
            ...item,
            // qty_sj: frmNumber(item.qty),
            qty_sj: frmNumber(item.qty_sj),
            qty: frmNumber(item.qty),
        }));
        setData({ nodes: modifiedResponse });
        // setKodePO(resDetail[0].kode_sp) // AMBIL KODE PO

        const totalBeratHeader = resDetail.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);
        setTotalBeratHeader(totalBeratHeader);

        //FILE PENDUKUNG
        try {
            const filependukung = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });

            setSelectedFiles(filependukung.data.data);
            //FILE PENDUKUNG PO
            const filependukungPO = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                params: {
                    entitas: kode_entitas,
                    param1: resDetail[0].kode_sp,
                },
            });

            setSelectedFilesPO(filependukungPO.data.data);
        } catch (error) {
            console.log(error);
        }

        // setSelectedFilesPO(filependukungPO.data.data);
    };

    if (routeEditValue !== 'true') {
        generateNU(kode_entitas, '', '04', moment().format('YYYYMM'))
            .then((result) => {
                // console.log(result);
                setNoPB(result);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const getDetailFromAPI = async (no_sp: any, id: any, tipe: any, kode_supp: any) => {
        const obj = {
            entitas: kode_entitas,
            where: {
                kode_supp: `${kode_supp}`,
                tgl_sp: `${currentDate}`,
                no_sp: `${no_sp}`,
                kontrak: routeKontrakValue,
                id_sp: tipe === 'One' ? id : '%',
            },
        };

        const jsonString = JSON.stringify(obj);
        const encodedString = btoa(jsonString);

        try {
            const responseListDlgPO = await axios.get(`${apiUrl}/erp/dlg_detail_po`, {
                params: {
                    cmd: encodedString,
                },
            });
            setButtonDisabled(true);
            const response = responseListDlgPO.data.data;
            setPOSelectedList(response);
            setDiskonDok(response[0].diskon_dok);
            setKenaPajak(response[0].kena_pajak);
            setKirimMU(response[0].kirim_mu);
            setCatatan(response[0].keterangan);
            // setKodePO(response[0].kode_sp);

            console.log('response  === ', response);
            //FILE PENDUKUNG PO NEW
            const filependukungPO = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                params: {
                    entitas: kode_entitas,
                    param1: response[0].kode_sp,
                },
            });

            setSelectedFilesPO(filependukungPO.data.data);
            // setSelectedFilesPO(filependukungPO.data.data);
            console.log('response PO = ', response);
            const modifiedResponse: any = response.map((item: any) => ({
                ...item,
                index: indexNum,
                qty_po: item.qty,
                sat_std: item.satuan,
                qty_sj: frmNumber(item.qty),
                // qty: frmNumber(item.qty),
                qty: frmNumber(item.qty_sisa),
                // qty_std: frmNumber(item.qty_sisa),
                // qty_sisa: frmNumber(item.qty_sisa),
                sat_sj: item.satuan,
                qty_retur: 0,
                qty_lkb: 0,
            }));

            if (tipe === 'One') {
                const filteredNodes = data.nodes.filter((node: any) => node.diskripsi !== '' && node.kode_item !== '');
                const updateModifiedResponse: any = { nodes: [...filteredNodes, ...modifiedResponse] };
                // const updateModifiedResponse;
                // console.log(filteredNodes);
                // if(indexNum ==== filteredNodes.nodes.index)
                const result1 = updateModifiedResponse.nodes.map((data: any, index: number) => ({
                    ...data,
                    id_lpb: index + 1,
                }));
                setData({ nodes: result1 });

                // setDisableDaftarPO(true);
                const totalBeratHeader = result1.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(tanpaKoma(detailItem.qty)), 0);
                setTotalBeratHeader(totalBeratHeader);
            } else {
                const result2 = modifiedResponse.map((data: any, index: number) => ({
                    ...data,
                    id_lpb: index + 1,
                }));
                setData({ nodes: result2 });

                const totalBeratHeader = result2.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(tanpaKoma(detailItem.qty)), 0);
                setTotalBeratHeader(totalBeratHeader);
            }

            console.log('DLG RESPONSE', response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSelectedDataPO = (selectedDataPO: any) => {
        getDetailFromAPI(selectedDataPO, '%', 'Multiple', selectedKodeSupp);
    };

    const handleDaftarPoItem = async (dataObject: any) => {
        vRefreshData.current += 1;
        setDisableDaftarPO(true);
        const { idPo, noPo, kode_supp } = dataObject;

        getDetailFromAPI(noPo, idPo, 'One', kode_supp);
    };

    const handleSelectDataSupp = (selectedData: any, S_NamaRelasi: any, S_KodeTermin: any) => {
        setNamaSupp(S_NamaRelasi);
        setKodeSupp(selectedData);
        setKodeTermin(S_KodeTermin);
    };

    const handleSelectDataLogin = (status: any) => {
        if (status === true) {
            saveDoc('skipBlokAuth');
        }
    };

    const handleDaftarPO = () => {
        vRefreshData.current += 1;
        if (!selectedKodeSupp) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih supplier.',
                icon: 'warning',
            }).then((result) => {
                if (result.isConfirmed) {
                    setModalSupplier(true);
                }
            });
        } else {
            setModalPO(true);
        }
    };

    const handleSelectOnChange = (e: any, tipe: any) => {
        const selectedValue = e.target.value;
        if (tipe === 'kode_gudang') {
            setKodeGudang(selectedValue);
        } else if (tipe === 'via') {
            setKodeVia(selectedValue);
        } else if (tipe === 'kode_sj') {
            setKodeSJ(selectedValue);
        } else if (tipe === 'dokumen') {
            setDokumen(selectedValue);
        } else if (tipe === 'pengemudi') {
            setPengemudi(selectedValue);
        } else if (tipe === 'nopol') {
            setNopol(selectedValue);
        } else if (tipe === 'catatan') {
            setCatatan(selectedValue);
        }
    };

    const handleUpdate = (value: any, id_lpb: any, property: any, option: any, pajak: any) => {
        let value2: any;
        if (value.includes(',')) {
            value2 = parseFloat(tanpaKoma(value));
        } else {
            value2 = value;
        }

        setData((state: any) => {
            const updatedNodes = state.nodes.map((node: any) => {
                let qty: any;
                let qty_po: any;
                let qty_sj: any;

                if (typeof node.qty === 'string' && node.qty.includes(',')) {
                    qty = parseFloat(tanpaKoma(node.qty));
                } else {
                    qty = parseFloat(node.qty);
                }

                // Periksa apakah node.qty_po adalah string sebelum mencoba menggunakan metode includes()
                if (typeof node.qty_po === 'string' && node.qty_po.includes(',')) {
                    qty_po = parseFloat(tanpaKoma(node.qty_po));
                } else {
                    qty_po = parseFloat(node.qty_po);
                }

                // Periksa juga untuk node.qty_sj
                if (typeof node.qty_sj === 'string' && node.qty_sj.includes(',')) {
                    qty_sj = parseFloat(tanpaKoma(node.qty_sj));
                } else {
                    qty_sj = parseFloat(node.qty_sj);
                }

                let diskon_mu;
                if (node.id_lpb === id_lpb) {
                    if (property === 'qty') {
                        if (value2 <= 0 && property === 'qty') {
                            // alert('kuantitas lpb tidak boleh kurang atau sama dengan nol.');
                            Swal.fire({
                                title: 'Warning',
                                text: 'Kuantitas lpb tidak boleh kurang atau sama dengan nol.',
                                icon: 'warning',
                            });
                            const qty = document.getElementById('qty' + node.id_lpb) as HTMLInputElement;
                            if (qty) {
                                qty.value = frmNumber(qty_sj);
                            }
                            return { ...node, [property]: parseFloat(qty_sj) };
                        } else if (property === 'qty' && value2 > qty_sj) {
                            // alert('Kuantitas PB tidak boleh melebihi kuantitas SJ.');
                            Swal.fire({
                                title: 'Warning',
                                text: 'Kuantitas PB tidak boleh melebihi kuantitas SJ.',
                                icon: 'warning',
                            });
                            const qty = document.getElementById('qty' + node.id_lpb) as HTMLInputElement;
                            if (qty) {
                                qty.value = frmNumber(qty_sj);
                            }
                            return { ...node, [property]: parseFloat(qty_sj) };
                        } else {
                            let diskon = node.diskon === '' || node.diskon === null || node.diskon === undefined ? 0 : parseFloat(node.diskon);
                            let potongan_mu = node.potongan_mu === '' || node.potongan_mu === null || node.potongan_mu === undefined ? 0 : parseFloat(node.potongan_mu);
                            let harga = parseFloat(node.harga_mu);
                            diskon_mu = harga * (diskon / 100);
                            let jumlah = parseFloat(value2) * (harga - diskon_mu - potongan_mu);
                            let nilai_pajak = parseFloat(pajak);

                            let totNilaiPajak;
                            if (option === 'N') {
                                totNilaiPajak = 0;
                            } else if (option === 'E') {
                                // totNilaiPajak = (jumlah * nilai_pajak) / 100;
                                let jumlah_mu_diskon = (jumlah * diskonDok) / 100;
                                totNilaiPajak = ((jumlah - jumlah_mu_diskon) * nilai_pajak) / 100;
                            } else if (option === 'I') {
                                if (nilai_pajak === 10) {
                                    // totNilaiPajak = ((100 / 110) * jumlah * nilai_pajak) / 100;
                                    let jumlah_mu_diskon = (jumlah * diskonDok) / 100;
                                    totNilaiPajak = ((jumlah - jumlah_mu_diskon) / 1.1) * 0.1;
                                } else if (nilai_pajak === 11) {
                                    // totNilaiPajak = ((100 / 111) * jumlah * nilai_pajak) / 100;
                                    let jumlah_mu_diskon = (jumlah * diskonDok) / 100;
                                    totNilaiPajak = ((jumlah - jumlah_mu_diskon) / 1.11) * 0.11;
                                } else {
                                    totNilaiPajak = 0;
                                }
                            } else {
                                totNilaiPajak = 0;
                            }
                            const qty = document.getElementById('qty' + node.id_lpb) as HTMLInputElement;
                            if (qty) {
                                qty.value = frmNumber(value2);
                            }

                            console.log('jumlah = ', jumlah, harga, diskon_mu, potongan_mu, node.potongan_mu);

                            return {
                                ...node,
                                [property]: parseFloat(value2),
                                qty_sisa: parseFloat(value2),
                                qty_std: parseFloat(value2),
                                jumlah_mu: jumlah,
                                jumlah_rp: jumlah,
                                diskon_mu: diskon_mu,
                                pajak_mu: totNilaiPajak,
                            };
                        }
                    } else if (property === 'qty_sj') {
                        if (value2 <= 0 && property === 'qty_sj') {
                            // alert('kuantitas sj tidak boleh kurang atau sama dengan nol.');
                            Swal.fire({
                                title: 'Warning',
                                text: 'Kuantitas sj tidak boleh kurang atau sama dengan nol.',
                                icon: 'warning',
                            });
                            const qty_sj_ = document.getElementById('qty_sj' + node.id_lpb) as HTMLInputElement;
                            if (qty_sj_) {
                                qty_sj_.value = frmNumber(qty_sj);
                            }
                            return { ...node, [property]: parseFloat(qty_sj) };
                        } else if (property === 'qty_sj' && value2 > qty_po) {
                            // alert('Kuantitas SJ Supplier lebih banyak dari kuantitas.');
                            Swal.fire({
                                title: 'Warning',
                                text: 'Kuantitas SJ Supplier lebih banyak dari kuantitas.',
                                icon: 'warning',
                            });
                            // alert('Apakah Dibuatkan PP dan PO Sekarang?.');
                            //yes navigate ke pp
                            //no close
                            const qty_sj = document.getElementById('qty_sj' + node.id_lpb) as HTMLInputElement;
                            if (qty_sj) {
                                qty_sj.value = frmNumber(qty_po);
                            }
                            return { ...node, [property]: parseFloat(qty_po) };
                        } else {
                            const qty_sj = document.getElementById('qty_sj' + node.id_lpb) as HTMLInputElement;
                            if (qty_sj) {
                                qty_sj.value = frmNumber(value2);
                            }
                            if (value2 < qty_po) {
                                const qty = document.getElementById('qty' + node.id_lpb) as HTMLInputElement;
                                if (qty) {
                                    qty.value = frmNumber(value2);
                                }
                                return { ...node, [property]: parseFloat(value2), qty: parseFloat(value2), qty_sisa: parseFloat(value2), qty_std: parseFloat(value2) };
                            }
                            return { ...node, [property]: parseFloat(value2) };
                        }
                    } else if (property === 'ket') {
                        return { ...node, [property]: value2 };
                    }
                } else {
                    return node;
                }
            });
            const totalBeratHeader = updatedNodes.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);
            setTotalBeratHeader(totalBeratHeader);

            return {
                ...state,
                nodes: updatedNodes,
            };
        });
    };

    const handleRemove = (id_lpb: any, index: any) => {
        // if (data.nodes.length === 0) {
        //     alert('Tidak bisa menghapus row data terakhir, sisakan setidaknya 1 row data untuk ditampilkan');
        // } else {
        if (id_lpb) {
            Swal.fire({
                title: 'Hapus Data Barang',
                text: `Anda yakin ingin menghapus data barang baris ${index + 1}?`,
                icon: 'warning',
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'Batal',
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    if (data.nodes.length === 1) {
                        Clear();
                    } else {
                        setData((state) => {
                            const filteredNodes = state.nodes.filter((node: any) => node.id_lpb !== id_lpb);
                            const totalBeratHeader = filteredNodes.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);
                            setTotalBeratHeader(totalBeratHeader);
                            return {
                                ...state,
                                nodes: filteredNodes,
                            };
                        });
                    }
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    console.log('Batal');
                }
            });
        }
        // setData((state) => ({
        //     ...state,
        //     nodes: state.nodes.filter((node: any) => node.id_lpb !== id_lpb),
        // }));
        // }
    };

    const Clear = async () => {
        setDisableDaftarPO(false);
        try {
            const newNode: any = {
                id_lpb: 1,
                kode_sp: '',
                id_sp: '',
                kode_pp: '',
                id_pp: '',
                kode_item: '',
                diskripsi: '',
                satuan: '',
                qty_po: '',
                sat_sj: '',
                qty_sj: '',
                qty: 0,
                brt: 0,
                sat_std: '',
                qty_std: '',
                qty_sisa: '',
                qty_retur: '',
                qty_lkb: '',
                kode_mu: '',
                kurs: '',
                kurs_pajak: '',
                harga_mu: '',
                diskon: '',
                diskon_mu: '',
                potongan_mu: '',
                kode_pajak: '',
                pajak: '',
                include: '',
                pajak_mu: '',
                jumlah_mu: '',
                jumlah_rp: '',
                ket: '',
                kode_dept: '',
                kode_kerja: '',
                kode_fpb: '',
                id_fpb: '',
                kode_fpac: '',
                id_fpac: '',
            };

            // setKodeSupp('');
            // setNamaSupp('');
            // setKodeSJ('');
            // setKodeGudang('');
            // setKodeVia('');
            // setPengemudi('');
            // setNopol('');
            // setDokumen('Ambil Sendiri');
            setTotalBeratHeader(null);
            setCatatan('');
            let detail: { diskripsi: any } = data.nodes[0];
            if (data.nodes.length > 0 && detail.diskripsi !== '') {
                setData({ nodes: [] });
                handleSubmit();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const showWarning = (message: string) => {
        Swal.fire({
            title: 'Warning',
            text: `${message}`,
            icon: 'warning',
        });
    };

    const prosesBloking = async (auth: any) => {
        let descriptions: any = [];
        // let descriptionsItemStokOpname: any = [];
        //CEK GUDANG
        let hasil = false;
        let resultBlok: any;
        let resultBlokOpname: any;
        // let descriptionsItemStokOpname: any[] = []; // Pastikan array diinisialisasi dalam fungsi

        // Cek Backdate 14 hari
        // Fungsi pengecekan tanggal
        const today = moment().startOf('day'); // Hari ini
        const chosenDate = moment(dateTglDiterima).startOf('day'); // Tanggal yang dipilih / dari input
        const diffDays = chosenDate.diff(today, 'days'); // Selisih dalam hari

        const cekEntitasPajak = await entitaspajak(kode_entitas, userid);
        const resultCekUserApp: any[] = await CekUserApp(kode_entitas, userid);
        const allowBackdate = resultCekUserApp?.[0]?.app_backdate === 'Y';
        const isAdmin = userid === 'administrator';

        console.log('resultCekUserApp = ', resultCekUserApp, cekEntitasPajak, isAdmin, allowBackdate);
        console.log({
            today,
            chosenDate,
            cekEntitasPajak,
            isAdmin,
            allowBackdate,
            diffDays,
            resultCekUserApp,
        });

        // Lakukan validasi hanya jika bukan entitas pajak dan bukan admin
        if (cekEntitasPajak === 'false' && !isAdmin && !allowBackdate) {
            // Backdate > 14 hari
            if (diffDays < -14) {
                showWarning('Tanggal tidak boleh lebih dari 14 hari sebelum tanggal hari ini.');
                return;
            }

            // Future date > 3 hari
            if (diffDays > 3) {
                showWarning('Tanggal tidak boleh lebih dari 3 hari setelah tanggal hari ini.');
                return;
            }
        }

        //CEK GUDANG
        const cekGudangPB = async () => {
            try {
                let responseCekGudang = await axios.get(`${apiUrl}/erp/id_master_gudang?`, {
                    params: {
                        entitas: kode_entitas,
                        kode_gudang: kodeGudang,
                    },
                });

                // Periksa apakah nama gudang memiliki awalan "GU"
                const namaGudang = responseCekGudang.data.data[0].nama_gudang;
                const hasPrefixGU = namaGudang.startsWith('GU.');

                return hasPrefixGU;
            } catch (error) {
                console.error('Error while fetching data cekGudangPB:', error);
                throw error;
            }
        };

        try {
            var blockingGudang = await cekGudangPB();
        } catch (error) {
            console.error('Error Gudang:', error);
        }

        // CEK STOK
        const cekStokPB = async () => {
            let hasil = false;
            for (let i = 0; i < data.nodes.length; i++) {
                const item: any = data.nodes[i];
                let responseCekStok = await axios.get(`${apiUrl}/erp/cekstok_item_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeGudang,
                        param2: item.kode_item,
                        param3: currentDate,
                    },
                });

                if (parseFloat(responseCekStok.data.data[0].stok) < 100) {
                    hasil = true; // Set hasil to true if any item's stock is less than 100
                    descriptions.push({
                        no_item: item.no_item,
                        diskripsi: item.diskripsi,
                        stok: responseCekStok.data.data[0].stok,
                    });
                } else {
                    descriptions.push({
                        no_item: item.no_item,
                        diskripsi: item.diskripsi,
                        stok: responseCekStok.data.data[0].stok,
                    });
                }
            }
            return hasil;
        };
        let blockingStok = false;
        try {
            blockingStok = await cekStokPB();
        } catch (error) {
            console.error('Error:', error);
        }
        //END CEK STOK

        if (!selectedKodeSupp) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih supplier',
                icon: 'warning',
            }).then((result) => {
                if (result.isConfirmed) {
                    setModalSupplier(true);
                }
            });
            return;
        }

        if (!kodeSJ) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan isi Nomor SJ / Kontrak',
                icon: 'warning',
            });
            return;
        }

        if (!kodeGudang) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih Gudang',
                icon: 'warning',
            });
            return;
        }

        if (!kodeVia) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih Via Pengiriman',
                icon: 'warning',
            });
            return;
        }

        if (!pengemudi) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan isi Pengemudi',
                icon: 'warning',
            });
            return;
        }

        if (!nopol) {
            Swal.fire({
                title: 'Warning',
                text: 'Silahkan isi No. Kendaraan',
                icon: 'warning',
            });
            return;
        }

        const kode = data.nodes[0];

        if (kode) {
            var { kode_item }: { kode_item: any } = kode;
        } else {
            var kode_item: any = '';
        }

        if (data.nodes.length === 1 && kode_item === '') {
            Swal.fire({
                title: 'Warning',
                text: 'Data Barang belum diisi.',
                icon: 'warning',
            });
            return;
        }

        let QtyOver = false;
        data.nodes.forEach((node: any) => {
            if (node.qty > node.qty_po) {
                QtyOver = true;
                return;
            }
        });

        if (QtyOver) {
            Swal.fire({
                title: 'Warning',
                text: 'Qty PB lebih besar dari pada PO.',
                icon: 'warning',
            });
            return;
        }

        // CEK NO_REFF / NO SJ SAMA
        let blockress = false;
        let blockressVariabel: any;

        const cekNoReff = async () => {
            try {
                const responseCekNoReff = await axios.get(`${apiUrl}/erp/get_status_noreff_pb?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeSJ,
                    },
                });
                const ressCekNoReff = responseCekNoReff.data.data;

                if (auth !== 'skipBlokAuth') {
                    if (ressCekNoReff.length > 0) {
                        blockress = true;
                    } else {
                        blockress = false;
                    }
                }
            } catch (error) {
                console.error('Terjadi kesalahan saat melakukan pengecekan no_reff:', error);
                throw error; // Rethrow error to be caught in outer try-catch block
            }
        };

        try {
            await cekNoReff();
        } catch (error) {
            console.error('Error:', error);
        }

        // if (blockress) {
        //     Swal.fire({
        //         title: 'Warning',
        //         text: 'Apakah nomor referensi tersebut akan dipakai kembali?.',
        //         icon: 'warning',
        //         showCancelButton: true,
        //         confirmButtonText: 'Lanjutkan',
        //         cancelButtonText: 'Batal',
        //     }).then((result) => {
        //         if (result.isConfirmed) {
        //             blockress = false;
        //             blockressVariabel = 'lanjut';
        //             // saveDoc('skipBlokAuth');
        //             // prosesData('no', descriptions, blockingGudang, blockingStok);
        //         } else if (result.dismiss === Swal.DismissReason.cancel) {
        //             blockress = true;
        //             blockressVariabel = 'batal';
        //         }
        //     });

        //     // harus blocking terakhir
        //     return;
        // } 23-05-2025

        if (blockress) {
            const style = document.createElement('style');
            style.innerHTML = `
                            .swal2-popup .btn {
                                margin-left: 10px;
                                }

                            .swal2-confirm, .swal2-cancel {
                                width: 70px;  /* Atur ukuran lebar yang sama */
                                height: 33px;  /* Atur ukuran tinggi yang sama */
                                font-size: 14px;  /* Sesuaikan ukuran font */
                            }
                            `;
            document.head.appendChild(style);

            const result = await withReactContent(swalDialog).fire({
                // title: `<div style="text-align: left; font-size:14px;margin-top: -40px;margin-bottom: -23px;">
                //         <span>Warning</span>
                //         <br>
                //         </div>`,
                html: `<div style="text-align: center; font-size:12px; margin-left:12px; font-weight:bold;">Apakah nomor referensi tersebut akan dipakai kembali?</div>`,
                confirmButtonText: 'Lanjutkan',
                cancelButtonText: 'Batal',
                showCancelButton: true,
            });
            if (result.isConfirmed) {
                blockressVariabel = 'lanjut';
                blockress = false;
                // lanjut loop
            } else {
                blockressVariabel = 'batal';
                blockress = true;
            }
        }

        if (blockressVariabel === 'batal') {
            return;
        }

        // Cek Kode Gudang
        const responseCekGudang = await axios.get(`${apiUrl}/erp/id_master_gudang?`, {
            params: {
                entitas: kode_entitas,
                kode_gudang: kodeGudang,
            },
        });
        // Periksa apakah nama gudang memiliki awalan "GU"
        const listGudang = responseCekGudang.data.data[0];
        console.log(' nama_gudang = ', listGudang.nama_gudang);
        console.log(' jenis = ', listGudang.jenis);

        if (
            (kode_entitas === '100' && listGudang.nama_gudang === 'GU. TOKO') ||
            (kode_entitas === '300' && listGudang.nama_gudang === 'GU. TOKO') ||
            (listGudang.jenis === 'E' && listGudang.nama_gudang !== 'GV. TRANSIT') ||
            listGudang.jenis === 'P' ||
            listGudang.jenis === 'C' ||
            kode_entitas === '770' ||
            kode_entitas === '800' ||
            kode_entitas === '801' ||
            kode_entitas === '802' ||
            kode_entitas === '899'
        ) {
            // Lakukan sesuatu di sini
            console.log('masuk sini kondisi');
            resultBlok = 5;
        } else {
            for (let i = 0; i < data.nodes.length; i++) {
                const item: any = data.nodes[i];

                let responseCekStokOpname = await axios.get(`${apiUrl}/erp/check_opname`, {
                    params: {
                        entitas: kode_entitas,
                        param1: item.kode_item,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                let responseCekStok = await axios.get(`${apiUrl}/erp/cekstok_item_pb`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeGudang,
                        param2: item.kode_item,
                        param3: currentDate,
                    },
                });

                const stok = parseFloat(responseCekStok.data.data[0]?.stok || '0'); // Pastikan data valid
                const opnameData = responseCekStokOpname.data.data || [];
                console.log('masuk sini ga = ', opnameData, stok);

                // Hanya tambahkan jika stok < 100 DAN ada data opname
                if (stok < 100 && opnameData.length > 0) {
                    hasil = true;
                    // descriptionsItemStokOpname.push({
                    //     no_item: item.no_item,
                    //     diskripsi: item.diskripsi,
                    //     stok: stok,
                    // });
                    console.log('masuk sini');

                    const style = document.createElement('style');
                    style.innerHTML = `
                            .swal2-popup .btn {
                                margin-left: 10px;
                                }

                            .swal2-confirm, .swal2-cancel {
                                width: 70px;  /* Atur ukuran lebar yang sama */
                                height: 33px;  /* Atur ukuran tinggi yang sama */
                                font-size: 14px;  /* Sesuaikan ukuran font */
                            }
                            `;
                    document.head.appendChild(style);

                    const result = await withReactContent(swalDialog).fire({
                        title: `<div style="text-align: left; font-size:14px;margin-top: -40px;margin-bottom: -23px;">
                        <span>Ditemukan Item di Gudang Utama yang qty nya kurang dari 100 dan sudah ada di Jadwal Stok Opname !</span>
                        <span>Proses Simpan untuk detail dibawah ini akan dilanjutkan : </span><br>
                        </div>`,
                        html: `<div style="text-align: left; font-size:12px; margin-left:12px; font-weight:bold;">
                        No Item : ${item.no_item} <br>
                        Nama Item : ${item.diskripsi}
                    </div>`,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        showCancelButton: true,
                    });
                    if (result.isConfirmed) {
                        resultBlokOpname = 1;
                        // lanjut loop
                    }
                } else if (stok < 100 && opnameData.length <= 0) {
                    console.log('asadasdasdasd');

                    const style = document.createElement('style');
                    style.innerHTML = `
                            .swal2-popup .btn {
                                margin-left: 10px;
                                }

                            .swal2-confirm, .swal2-cancel {
                                width: 160px;  /* Atur ukuran lebar yang sama */
                                height: 33px;  /* Atur ukuran tinggi yang sama */
                                font-size: 14px;  /* Sesuaikan ukuran font */
                            }
                            `;
                    document.head.appendChild(style);

                    const result = await withReactContent(swalDialog).fire({
                        // title: 'Warning',
                        title: `<div style="text-align: left; font-size:14px;margin-top: -40px;margin-bottom: -23px;">
                        <span>Ditemukan item di Gudang Utama yang qty nya kurang dari 100!</span>
                        </div>`,
                        html: `<div style="text-align: left; font-size:12px; margin-left:12px; font-weight:bold;">
                        No Item : ${item.no_item} <br>
                        Nama Item : ${item.diskripsi}
                    </div>`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'OK, Lanjut stok opname',
                        cancelButtonText: 'Permintaan otorisasi user',
                    });

                    if (result.isConfirmed) {
                        // lanjut
                        resultBlok = 3;
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        resultBlok = 2;
                        // break; // stop loop
                    }
                }
            }
        }

        console.log('resultBlok = ', resultBlok);
        if (resultBlok === 2) {
            setModalLogin(true);
        } else if (resultBlokOpname === 1) {
            saveDoc('');
            console.log('Masuk Bloking resultBlokOpname 1');
        } else if (resultBlok === 3) {
            console.log('OK, Lanjut stok opname');
        } else {
            saveDoc('');
            console.log('Masuk Bloking Noraml 1');
        }

        // return { hasil, descriptionsItemStokOpname };

        // let blockingCekStokOpname: boolean = false; // Inisialisasi nilai default
        // try {
        //     const result = await cekStokOpname();
        //     blockingCekStokOpname = result.hasil;
        //     descriptionsItemStokOpname = result.descriptionsItemStokOpname;

        // } catch (error) {
        //     console.error('Error Gudang:', error);
        // }
    };

    const saveDoc = async (auth: any) => {
        let descriptions: any = [];
        let descriptionsItemStokOpname: any = [];
        console.log('masuk sini =', data.nodes);
        const totalRpFromDetail = data.nodes.reduce((total, detailItem: any) => {
            console.log('parseFloat(tanpaKoma(detailItem.jumlah_mu)) = ', parseFloat(detailItem.jumlah_mu));

            const jumlahMu = typeof detailItem.jumlah_mu === 'string' && detailItem.jumlah_mu.includes(',') ? parseFloat(tanpaKoma(detailItem.jumlah_mu)) : parseFloat(detailItem.jumlah_mu);
            return total + jumlahMu;
        }, 0);

        console.log('totalRpFromDetail = ', totalRpFromDetail);

        const totalDiskonRP = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.diskon_mu), 0);

        const totalPotonganRP = data.nodes.reduce((total, detailItem: any) => total + (parseFloat(detailItem.potongan_mu) || 0), 0);

        const totalPajakRP = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.pajak_mu), 0);

        const diskonDokRP = totalRpFromDetail * (diskonDok / 100);

        const totalBeratHeader = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);

        let totalNettoRP;
        let totalPajak;
        let kirim;

        if (kenaPajak === 'N') {
            totalNettoRP = totalRpFromDetail + parseFloat(kirimMU) - diskonDokRP;
            totalPajak = totalPajakRP;
            kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
        } else if (kenaPajak === 'I') {
            let IncludeDPP = totalRpFromDetail - diskonDokRP;
            totalNettoRP = IncludeDPP + parseFloat(kirimMU) - diskonDokRP;
            totalPajak = totalPajakRP;
            kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
        } else if (kenaPajak === 'E') {
            if (diskonDok) {
                // IKUT FAS PB
                // totalPajak = totalPajakRP - totalPajakRP * (diskonDok / 100);
                // IKUT FAS PO
                totalPajak = totalPajakRP;
                totalNettoRP = totalRpFromDetail - diskonDokRP + totalPajak + parseFloat(kirimMU);
                // alert(totalNettoRP);
                kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
            } else {
                totalPajak = totalPajakRP;
                totalNettoRP = totalRpFromDetail;
                kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
            }
        }

        // const modifiedDetail = (prevState: any) => ({
        //     ...prevState,
        //     nodes: prevState.nodes.filter((node: any) => node.diskripsi !== '' && node.no_item !== ''),
        // });
        let defaultNoPB: any;
        if (routeEditValue !== 'true') {
            const fromAPI = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
            defaultNoPB = fromAPI;
        } else {
            defaultNoPB = noPB;
        }

        const modifiedData = {
            entitas: kode_entitas,
            kode_lpb: kodePB,
            no_lpb: defaultNoPB,
            tgl_lpb: moment(dateTglDokumen).format('YYYY-MM-DD HH:mm:ss'),
            tgl_sj: moment(dateTglSj).format('YYYY-MM-DD HH:mm:ss'),
            no_reff: kodeSJ,
            dokumen: dokumen,
            kode_gudang: kodeGudang,
            kode_supp: selectedKodeSupp,
            fob: null,
            via: kodeVia,
            pengemudi: pengemudi,
            nopol: nopol,
            // persediaan: 'Y', // default
            persediaan: routeJenisBarang === 'nonPersediaan' ? 'N' : 'Y', // default
            total_rp: totalRpFromDetail,
            total_diskon_rp: totalDiskonRP + totalPotonganRP,
            total_pajak_rp: totalPajak,
            netto_rp: totalNettoRP, // kalkulasi atau diapproval
            keterangan: catatan,
            total_berat: totalBeratHeader, //
            status: 'Terbuka', // default
            userid: userid,
            tgl_update: currentDateTime,
            kirim: kirim, //
            kirim_mu: parseFloat(kirimMU), //
            diskon_dok: diskonDok, // default tidak ada diheader
            diskon_dok_rp: diskonDokRP, // default tidak ada diheader
            kena_pajak: kenaPajak, //
            kode_termin: kodeTermin,
            kontrak: routeKontrakValue,
            status_export: null,
            fdo: null, // barang untuk realisasi ke cabang
            tgl_trxlpb: moment(dateTglDiterima).format('YYYY-MM-DD HH:mm:ss'),
            status_dok: null,
            no_pralpb: null,
            tgl_pralpb: null,
            token: tokenRedis,
            detail: data.nodes.map((data: any, index) => ({
                ...data,
                kode_pb: kodePB,
                qty: typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty),
                qty_std: typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty),
                // qty_sisa: typeof data.qty_sisa === 'string' && data.qty_sisa.includes(',') ? parseFloat(tanpaKoma(data.qty_sisa)) : parseFloat(data.qty_sisa),
                qty_sj: typeof data.qty_sj === 'string' && data.qty_sj.includes(',') ? parseFloat(tanpaKoma(data.qty_sj)) : parseFloat(data.qty_sj),
                id_lpb: index + 1,
                jumlah_mu:
                    (typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty)) *
                    ((typeof data.harga_mu === 'string' && data.harga_mu.includes(',') ? parseFloat(tanpaKoma(data.harga_mu)) : parseFloat(data.harga_mu)) -
                        (data.diskon_mu == null || data.diskon_mu === undefined ? 0 : parseFloat(data.diskon_mu)) -
                        (data.potongan_mu == null || data.potongan_mu === undefined ? 0 : parseFloat(data.potongan_mu))),
                jumlah_rp:
                    (typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty)) *
                    ((typeof data.harga_mu === 'string' && data.harga_mu.includes(',') ? parseFloat(tanpaKoma(data.harga_mu)) : parseFloat(data.harga_mu)) -
                        (data.diskon_mu == null || data.diskon_mu === undefined ? 0 : parseFloat(data.diskon_mu)) -
                        (data.potongan_mu == null || data.potongan_mu === undefined ? 0 : parseFloat(data.potongan_mu))),
            })),
        };

        const NettoRPAudit = totalNettoRP === undefined ? 0 : totalNettoRP;
        console.log('modifiedData = ', modifiedData);

        // //SAVE DOC
        try {
            if (isSaving) return; // Menghindari double input
            setIsSaving(true);
            if (routeEditValue === 'true') {
                // handleUpload(kodePB, 'update');
                const response = await axios.patch(`${apiUrl}/erp/update_pb`, modifiedData);

                if (response.data.status === true) {
                    handleUpload(kodePB, 'update');
                    // INSERT AUDIT EDIT
                    const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                        entitas: kode_entitas,
                        kode_audit: null,
                        dokumen: 'PB',
                        kode_dokumen: kodePB,
                        no_dokumen: noPB,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'EDIT',
                        diskripsi: `PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${NettoRPAudit.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        userid: userid, // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    });

                    // await generateNU(kode_entitas, noPB, '04', dateTglDokumen.format('YYYYMM'));
                    // handleUpload(kodePB);
                    Swal.fire({
                        title: 'Berhasil simpan perubahan PB',
                        icon: 'success',
                    }).then(() => {
                        // window.location.href = './pblist';
                        // router.push('./pblist');
                        backPage();
                    });
                    // router.push('./pblist');
                } else {
                    Swal.fire({
                        title: 'Warning',
                        text: 'Gagal menyimpan perubahan PB',
                        icon: 'error',
                    });
                }
            } else {
                const response = await axios.post(`${apiUrl}/erp/simpan_pb`, modifiedData);

                if (response.data.status === true) {
                    handleUpload(response.data.kode_dokumen, 'baru');
                    await generateNU(kode_entitas, noPB, '04', dateTglDokumen.format('YYYYMM'));
                    // INSERT AUDIT NEW
                    const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                        entitas: kode_entitas,
                        kode_audit: null,
                        dokumen: 'PB',
                        kode_dokumen: response.data.kode_dokumen,
                        no_dokumen: noPB,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'NEW',
                        diskripsi: `PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${NettoRPAudit.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        userid: userid, // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    });

                    Swal.fire({
                        title: 'Berhasil simpan PB',
                        icon: 'success',
                    }).then(() => {
                        // window.location.href = './pblist';
                        // router.push('./pblist');
                        backPage();
                    });
                    // router.push('./pblist');
                } else {
                    Swal.fire({
                        title: 'Warning',
                        text: 'Gagal menyimpan perubahan PB',
                        icon: 'error',
                    });
                }
            }
        } catch (error) {
            console.error('Error during API request:', error);

            Swal.fire({
                title: 'Terjadi kesalahan',
                text: 'Gagal menyimpan PB. Silakan coba lagi.',
                icon: 'error',
            });
        } finally {
            setIsSaving(false); // Setelah proses penyimpanan selesai
        }
        // // }
    };

    const prosesData = async (auth: any, descriptions: any, blockingGudang: any, blockingStok: any) => {
        if (auth !== 'skipBlokAuth' && blockingGudang === true && blockingStok === true) {
            Swal.fire({
                title: 'Warning',
                html: `<div style="text-align: center; font-size: 18px"> Ditemukan item di Gudang Utama yang qty nya kurang dari 100!<br><br></div>
                <div style="text-align: left; font-size: 14px">
                    ${descriptions.map((desc: any, index: any) => `${index + 1}. ${desc.diskripsi} Stok : ${desc.stok} No. Item : ${desc.no_item}`).join('<br>')}
                </div>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'OK, Lanjut stok opname',
                cancelButtonText: 'Permintaan otorisasi user',
                customClass: {
                    confirmButton: 'swal-button',
                    cancelButton: 'swal-button',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    // router.push('../../main/main');
                    // resultBlok = 3;
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    setModalLogin(true);
                }
            });
        } else {
            console.log('Masuk sini');
            const totalRpFromDetail = data.nodes.reduce((total, detailItem: any) => {
                const jumlahMu = typeof detailItem.jumlah_mu === 'string' && detailItem.jumlah_mu.includes(',') ? parseFloat(tanpaKoma(detailItem.jumlah_mu)) : parseFloat(detailItem.jumlah_mu);
                return total + jumlahMu;
            }, 0);
            console.log('totalRpFromDetail = ', totalRpFromDetail);

            const totalDiskonRP = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.diskon_mu), 0);

            const totalPotonganRP = data.nodes.reduce((total, detailItem: any) => total + (parseFloat(detailItem.potongan_mu) || 0), 0);

            const totalPajakRP = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.pajak_mu), 0);

            const diskonDokRP = totalRpFromDetail * (diskonDok / 100);

            const totalBeratHeader = data.nodes.reduce((total, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);

            let totalNettoRP;
            let totalPajak;
            let kirim;

            if (kenaPajak === 'N') {
                totalNettoRP = totalRpFromDetail + parseFloat(kirimMU) - diskonDokRP;
                totalPajak = totalPajakRP;
                kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
            } else if (kenaPajak === 'I') {
                let IncludeDPP = totalRpFromDetail - diskonDokRP;
                totalNettoRP = IncludeDPP + parseFloat(kirimMU) - diskonDokRP;
                totalPajak = totalPajakRP;
                kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
            } else if (kenaPajak === 'E') {
                if (diskonDok) {
                    // IKUT FAS PB
                    // totalPajak = totalPajakRP - totalPajakRP * (diskonDok / 100);
                    // IKUT FAS PO
                    totalPajak = totalPajakRP;
                    totalNettoRP = totalRpFromDetail - diskonDokRP + totalPajak + parseFloat(kirimMU);
                    // alert(totalNettoRP);
                    kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
                } else {
                    totalPajak = totalPajakRP;
                    totalNettoRP = totalRpFromDetail;
                    kirim = (parseFloat(kirimMU) / totalNettoRP) * 100;
                }
            }

            // const modifiedDetail = (prevState: any) => ({
            //     ...prevState,
            //     nodes: prevState.nodes.filter((node: any) => node.diskripsi !== '' && node.no_item !== ''),
            // });
            let defaultNoPB: any;
            if (routeEditValue !== 'true') {
                const fromAPI = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
                defaultNoPB = fromAPI;
            } else {
                defaultNoPB = noPB;
            }

            const modifiedData = {
                entitas: kode_entitas,
                kode_lpb: kodePB,
                no_lpb: defaultNoPB,
                tgl_lpb: moment(dateTglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                tgl_sj: moment(dateTglSj).format('YYYY-MM-DD HH:mm:ss'),
                no_reff: kodeSJ,
                dokumen: dokumen,
                kode_gudang: kodeGudang,
                kode_supp: selectedKodeSupp,
                fob: null,
                via: kodeVia,
                pengemudi: pengemudi,
                nopol: nopol,
                persediaan: routeJenisBarang === 'nonPersediaan' ? 'N' : 'Y', // default
                total_rp: totalRpFromDetail,
                total_diskon_rp: totalDiskonRP + totalPotonganRP,
                total_pajak_rp: totalPajak,
                netto_rp: totalNettoRP, // kalkulasi atau diapproval
                keterangan: catatan,
                total_berat: totalBeratHeader, //
                status: 'Terbuka', // default
                userid: userid,
                tgl_update: currentDateTime,
                kirim: kirim, //
                kirim_mu: parseFloat(kirimMU), //
                diskon_dok: diskonDok, // default tidak ada diheader
                diskon_dok_rp: diskonDokRP, // default tidak ada diheader
                kena_pajak: kenaPajak, //
                kode_termin: kodeTermin,
                kontrak: routeKontrakValue,
                status_export: null,
                fdo: null, // barang untuk realisasi ke cabang
                tgl_trxlpb: moment(dateTglDiterima).format('YYYY-MM-DD HH:mm:ss'),
                status_dok: null,
                no_pralpb: null,
                tgl_pralpb: null,
                detail: data.nodes.map((data: any, index) => ({
                    ...data,
                    kode_pb: kodePB,
                    qty: typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty),
                    qty_sj: typeof data.qty_sj === 'string' && data.qty_sj.includes(',') ? parseFloat(tanpaKoma(data.qty_sj)) : parseFloat(data.qty_sj),
                    id_lpb: index + 1,
                    jumlah_mu:
                        (typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty)) *
                        ((typeof data.harga_mu === 'string' && data.harga_mu.includes(',') ? parseFloat(tanpaKoma(data.harga_mu)) : parseFloat(data.harga_mu)) -
                            (data.diskon_mu == null || data.diskon_mu === undefined ? 0 : parseFloat(data.diskon_mu)) -
                            (data.potongan_mu == null || data.potongan_mu === undefined ? 0 : parseFloat(data.potongan_mu))),
                    jumlah_rp:
                        (typeof data.qty === 'string' && data.qty.includes(',') ? parseFloat(tanpaKoma(data.qty)) : parseFloat(data.qty)) *
                        ((typeof data.harga_mu === 'string' && data.harga_mu.includes(',') ? parseFloat(tanpaKoma(data.harga_mu)) : parseFloat(data.harga_mu)) -
                            (data.diskon_mu == null || data.diskon_mu === undefined ? 0 : parseFloat(data.diskon_mu)) -
                            (data.potongan_mu == null || data.potongan_mu === undefined ? 0 : parseFloat(data.potongan_mu))),
                })),
            };

            const NettoRPAudit = totalNettoRP === undefined ? 0 : totalNettoRP;

            //SAVE DOC
            try {
                if (isSaving) return; // Menghindari double input
                setIsSaving(true);
                if (routeEditValue === 'true') {
                    // handleUpload(kodePB, 'update');
                    const response = await axios.patch(`${apiUrl}/erp/update_pb`, modifiedData);

                    if (response.data.status === true) {
                        handleUpload(kodePB, 'update');
                        // INSERT AUDIT EDIT
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'PB',
                            kode_dokumen: kodePB,
                            no_dokumen: noPB,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'EDIT',
                            diskripsi: `PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${NettoRPAudit.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });

                        // await generateNU(kode_entitas, noPB, '04', dateTglDokumen.format('YYYYMM'));
                        // handleUpload(kodePB);
                        Swal.fire({
                            title: 'Berhasil simpan perubahan PB',
                            icon: 'success',
                        }).then(() => {
                            // window.location.href = './pblist';
                            // router.push('./pblist');
                            backPage();
                        });
                        // router.push('./pblist');
                    } else {
                        Swal.fire({
                            title: 'Warning',
                            text: 'Gagal menyimpan perubahan PB',
                            icon: 'error',
                        });
                    }
                } else {
                    const response = await axios.post(`${apiUrl}/erp/simpan_pb`, modifiedData);

                    if (response.data.status === true) {
                        handleUpload(response.data.kode_dokumen, 'baru');
                        await generateNU(kode_entitas, noPB, '04', dateTglDokumen.format('YYYYMM'));
                        // INSERT AUDIT NEW
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'PB',
                            kode_dokumen: response.data.kode_dokumen,
                            no_dokumen: noPB,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'NEW',
                            diskripsi: `PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${NettoRPAudit.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });

                        Swal.fire({
                            title: 'Berhasil simpan PB',
                            icon: 'success',
                        }).then(() => {
                            // window.location.href = './pblist';
                            // router.push('./pblist');
                            backPage();
                        });
                        // router.push('./pblist');
                    } else {
                        Swal.fire({
                            title: 'Warning',
                            text: 'Gagal menyimpan perubahan PB',
                            icon: 'error',
                        });
                    }
                }
            } catch (error) {
                console.error('Error during API request:', error);

                Swal.fire({
                    title: 'Terjadi kesalahan',
                    text: 'Gagal menyimpan PB. Silakan coba lagi.',
                    icon: 'error',
                });
            } finally {
                setIsSaving(false); // Setelah proses penyimpanan selesai
            }
        }
    };

    // ===========================FILE PENDUKUNG===============================

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const clipboardFiles = event.clipboardData?.files;
            if (clipboardFiles && clipboardFiles.length > 0) {
                const newFiles = Array.from(clipboardFiles).map((file) => {
                    const now = new Date();
                    const formatted =
                        'PB' +
                        now.getFullYear().toString() +
                        String(now.getMonth() + 1).padStart(2, '0') +
                        String(now.getDate()).padStart(2, '0') +
                        String(now.getHours()).padStart(2, '0') +
                        String(now.getMinutes()).padStart(2, '0');

                    return {
                        file, // simpan file asli
                        source: 'paste',
                        namaPaste: `${formatted}.png`,
                    };
                });
                setSelectedFiles((prevFiles: any) => [...prevFiles, ...newFiles]);

                const newNamaFiles = new Array(newFiles.length).fill(formattedName || 'untitled');
                setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, ...newNamaFiles]);
            }
        };

        window.addEventListener('paste', handlePaste);

        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [formattedName]);

    const handleFileChange = (event: any) => {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) {
            console.warn('Tidak ada file dipilih');
            return;
        }

        const newFiles = Array.from(fileList).map((file) => ({
            file,
            source: 'manual',
            namaPaste: '',
        }));
        setSelectedFiles((prevFiles: any) => [...prevFiles, ...newFiles]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, ...newNamaFiles]);
    };

    const handleUpload = async (kode_dokumen: any, jenis: any) => {
        try {
            if (jenis === 'update') {
                // Proses untuk update file
                await handleDeleteUnusedFiles(kode_dokumen); // Menghapus file yang tidak digunakan
                await handleFileUpdate(kode_dokumen); // Menghandle update file
            } else if (jenis === 'baru') {
                // Proses untuk file baru
                const formData = new FormData();
                let entitas;

                selectedFiles.forEach((file: any, index: any) => {
                    formData.append(`myimage`, file.file);
                    const fileExtension = file.file?.name.split('.').pop();
                    formData.append(`nama_file_image`, `PB${selectedNamaFiles[index]}.${fileExtension}`);
                    formData.append(`kode_dokumen`, kode_dokumen);
                    formData.append(`id_dokumen`, 101 + index);
                    formData.append(`dokumen`, 'PB');
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

                try {
                    const response = await axios.post(`${apiUrl}/upload`, formData);

                    if (response.data.status === true) {
                        let jsonSimpan;
                        if (Array.isArray(response.data.nama_file_image)) {
                            // Jika terdapat banyak file
                            jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => ({
                                entitas: kode_entitas,
                                kode_dokumen: kode_dokumen,
                                id_dokumen: response.data.id_dokumen[index],
                                dokumen: 'PB',
                                filegambar: namaFile,
                                fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                            }));
                        } else {
                            // Jika hanya satu file
                            jsonSimpan = {
                                entitas: kode_entitas,
                                kode_dokumen: kode_dokumen,
                                id_dokumen: response.data.id_dokumen,
                                dokumen: 'PB',
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
            } else {
                console.log('Jenis yang diberikan tidak valid.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFileUpdate = async (kode_dokumen: any) => {
        const fileUpdate = selectedFiles.filter((file: any) => file.file?.name);

        if (fileUpdate.length > 0) {
            try {
                // Upload file yang diperbarui
                const uploadResponse = await uploadFiles(fileUpdate, kode_dokumen);

                if (uploadResponse.status === true) {
                    // Jika upload berhasil

                    // Persiapkan data untuk disimpan di database
                    const jsonSimpan = prepareDataForSave(uploadResponse, kode_dokumen);

                    // Gabungkan array baru dengan data yang sudah ada

                    // Simpan data ke database
                    const saveResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);

                    if (routeFilePendukungValue === 'true' && saveResponse.data.status === true) {
                        console.log('NAVIGATE UPDATE FILE PENDUKUNG');
                        Swal.fire({
                            title: 'Berhasil update file pendukung PB',
                            icon: 'success',
                        }).then(() => {
                            // window.location.href = './pblist';
                            router.push('./pblist');
                        });
                    }
                } else {
                    console.log('Gagal mengupload file');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.log('Tidak ada file yang diperbarui');
        }
    };

    const handleNewFiles = async (kode_dokumen: any) => {
        // Proses untuk file baru
        const formData = prepareFormDataForNewFiles(kode_dokumen);

        try {
            // Upload file baru
            const response = await axios.post(`${apiUrl}/upload`, formData);

            // Persiapkan data untuk disimpan di database
            const jsonSimpan = prepareDataForSave(response.data, kode_dokumen);

            if (response.data.status === true) {
                // Jika upload berhasil
                try {
                    // Simpan data ke database
                    const saveResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
                } catch (error) {
                    console.error('Error saat menyimpan data:', error);
                }
            } else {
                console.log('Gagal mengupload file baru');
            }
        } catch (error) {
            console.error('Error saat mengupload file baru:', error);
        }
    };

    const prepareFormDataForNewFiles = (kode_dokumen: any) => {
        // Persiapan FormData untuk file baru
        const formData = new FormData();
        let entitas;

        selectedFiles.forEach((file: any, index: any) => {
            formData.append(`myimage`, file);
            const fileExtension = file.name.split('.').pop();
            formData.append(`nama_file_image`, `PB${selectedNamaFiles[index]}.${fileExtension}`);
            formData.append(`kode_dokumen`, kode_dokumen);
            formData.append(`id_dokumen`, 101 + index);
            formData.append(`dokumen`, 'PB');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        return formData;
    };

    const uploadFiles = async (files: any[], kode_dokumen: any) => {
        try {
            // Mengambil data file pendukung dengan menggunakan await
            const filependukungResponse = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_dokumen,
                },
            });

            const filependukung = filependukungResponse.data.data;
            const maxIdDokumen = filependukung.reduce((max: any, item: any) => Math.max(max, item.id_dokumen), 0);

            // const BB = maxIdDokumen + 1;

            let S_id_dokumen;
            //GANTI BB KONDISIKAN JIKA LENGHT > 0
            if (filependukung.length > 0) {
                S_id_dokumen = maxIdDokumen + 1;
            } else {
                S_id_dokumen = 101;
            }
            // Persiapkan FormData untuk upload
            const formData = prepareFormDataForUpdate(files, kode_dokumen, S_id_dokumen);

            // Upload file
            const response = await axios.post(`${apiUrl}/upload`, formData);

            return response.data;
        } catch (error) {
            console.error('Error saat mengupload file:', error);
            return { status: false };
        }
    };

    const prepareFormDataForUpdate = (files: any[], kode_dokumen: any, nomor: any) => {
        // Persiapan FormData untuk file yang diperbarui
        const formData = new FormData();
        let entitas;

        files.forEach((file: any, index: any) => {
            formData.append(`myimage`, file.file);
            const fileExtension = file.file?.name.split('.').pop();
            formData.append(`nama_file_image`, `PB${selectedNamaFiles[index]}.${fileExtension}`);
            formData.append(`kode_dokumen`, kode_dokumen);
            formData.append(`id_dokumen`, nomor + index);
            formData.append(`dokumen`, 'PB');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        return formData;
    };

    const prepareDataForSave = (response: any, kode_dokumen: any) => {
        // Persiapan data untuk disimpan di database

        let jsonSimpan;

        if (Array.isArray(response.nama_file_image)) {
            // Jika ada banyak file
            jsonSimpan = response.nama_file_image.map((namaFile: any, index: any) => ({
                entitas: kode_entitas,
                kode_dokumen: response.kode_dokumen[index],
                id_dokumen: response.id_dokumen[index],
                dokumen: response.dokumen[index],
                filegambar: namaFile,
                fileoriginal: response.filesinfo[index] ? response.filesinfo[index].fileoriginal : null,
            }));
        } else {
            // Jika hanya satu file
            jsonSimpan = {
                entitas: kode_entitas,
                kode_dokumen: kode_dokumen,
                id_dokumen: response.id_dokumen,
                dokumen: 'PB',
                filegambar: response.nama_file_image,
                fileoriginal: response.filesinfo,
            };
        }

        return jsonSimpan;
    };

    const handleDeleteUnusedFiles = async (kode_dokumen: any) => {
        // Logika untuk menghapus file pendukung yang tidak digunakan
        // ...
        const filependukung = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
            params: {
                entitas: kode_entitas,
                param1: kode_dokumen,
            },
        });

        const modifiedResponse = filependukung.data.data;
        const ambilsemuaiddokumen = modifiedResponse.map((item: any) => item.id_dokumen);

        // Contoh penggunaan axios.delete untuk menghapus file pendukung
        try {
            const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_dokumen,
                    param2: indexHapus, // Sesuaikan dengan data yang diperlukan untuk menghapus
                },
            });
        } catch (error) {
            console.error('Error saat menghapus file pendukung:', error);
        }
    };

    const handleFileSelect = (index: any, file: any, imageserver: any, dokumen: any, filegambar: any) => {
        // console.log(index);
        // console.log(file);
        // console.log(imageserver);
        // console.log(filegambar);
        if (dokumen === 'PB') {
            setSelectedRowsImage(index);
            if (file === undefined) {
                setSelectedRowsImageJenis('server');
                setSelectedRowsImageServer(imageserver);
                setSelectedRowsImageFilegambarServer(filegambar);
            } else {
                setSelectedRowsImageJenis('local');
            }
        }
    };

    const handleFileSelectPO = (index: any, file: any, imageserver: any, dokumen: any, filegambar: any) => {
        if (dokumen === 'PO') {
            setSelectedRowsImageJenis('server');
            setSelectedRowsImagePO(index);
            setSelectedRowsImageServerPO(imageserver);
            setSelectedRowsImageFilegambarServerPO(filegambar);
        }
    };

    const handleHapusFile = (index: any) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);
        setIndexHapus([...indexHapus, 101 + index]);
    };

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    type ExtractedFile = {
        imageUrl: string;
        fileName: string;
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
    };

    const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault(); // cegah scroll bawaan biar fokus ke zoom

        const delta = e.deltaY;
        setZoom((prev) => {
            let newZoom = prev + (delta > 0 ? -0.1 : 0.1);
            return Math.min(Math.max(newZoom, 0.5), 3); // zoom antara 50% dan 300%
        });
    };

    const handleFileClick = async (index: any, jenis: any, imageserver: any, dokumen: any, filegambar: any) => {
        if (dokumen === 'PB') {
            const imageToPreview = selectedFiles[index];
            // console.log('index = ', index, jenis, imageserver, dokumen, selectedFiles, imageToPreview);
            if (!imageToPreview) return null;

            const fileType = imageToPreview.file?.type;
            // const fileTypeServer = imageServer;
            let extension, namaFile;
            // console.log('aaaaaaaaaaaaaaaaa = ', extension, fileType, filegambar);
            if (fileType === undefined) {
                const fileName = filegambar;
                namaFile = filegambar;
                extension = fileName.split('.').pop(); // Hasil: "pdf"
                if (extension === 'pdf') {
                    const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${namaFile}`);
                    // console.log('responsePreviewPdf = ', responsePreviewPdf);
                    if (!responsePreviewPdf.ok) {
                        throw new Error('Failed to fetch PDF');
                    }
                    // Assuming the response contains the URL directly
                    const pdfBlob = await responsePreviewPdf.blob();
                    const pdfObjectURL = URL.createObjectURL(pdfBlob);

                    setPdfUrl(pdfObjectURL);
                    setPreviewPdf(true);
                } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                    setIsOpenPreview(true);
                    setImageDataUrl(imageserver);
                    setIndexPreview(index);
                } else {
                    downloadBase64Image(imageserver, imageToPreview.file?.name);
                }
            } else {
                const fileName = imageToPreview.file?.name;
                namaFile = imageToPreview.file?.name;
                extension = fileName.split('.').pop(); // Hasil: "pdf"
                // console.log('aaaaaaaaaaaaaaaaa 1 = ', extension);
                if (extension === 'pdf') {
                    const pdfObjectURL = URL.createObjectURL(imageToPreview.file);
                    setPdfUrl(pdfObjectURL);
                    setPreviewPdf(true);
                } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                    const imageToPreview = selectedFiles[index];
                    if (!imageToPreview) {
                        console.error('Gambar tidak ditemukan atau tidak valid.');
                        return;
                    }

                    let previewImages = [];
                    previewImages.push(URL.createObjectURL(new Blob([imageToPreview.file])));
                    setIsOpenPreview(true);
                    setImageDataUrl(previewImages.join(','));
                    setIndexPreview(index);
                } else {
                    downloadBase64Image1(imageserver, imageToPreview.file?.name, imageToPreview.file);
                }
            }
        } else if (dokumen === 'PO') {
            if (imageserver === '') {
                Swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih file pendukung PO terlebih dahulu',
                    icon: 'warning',
                });
                return;
            }

            const isBase64PDF = imageserver.startsWith('data:application/pdf;base64,');
            if (isBase64PDF) {
                window.open(imageserver, '_blank');
            } else {
                // setShowPreviewModalPO(true);
                // setSelectedImagesPO(imageserver);

                setIsOpenPreview(true);
                setImageDataUrl(imageserver);
                setIndexPreview(index);
            }
        }
    };

    const handlePreview = (index: any, jenis: any, imageserver: any, dokumen: any) => {
        if (dokumen === 'PB') {
            // ====================PB===========================
            if (jenis === 'server') {
                // setShowPreviewModal(true);
                // setSelectedImages(imageserver);
                setIsOpenPreview(true);
                setImageDataUrl(imageserver);
                setIndexPreview(index);
            } else if (jenis === 'local') {
                const imageToPreview = selectedFiles[index];
                if (!imageToPreview) {
                    console.error('Gambar tidak ditemukan atau tidak valid.');
                    return;
                }

                let previewImages = [];
                // if (imageToPreview instanceof ArrayBuffer) {
                previewImages.push(URL.createObjectURL(new Blob([imageToPreview])));
                // } else if (typeof imageToPreview === 'string') {
                //     previewImages.push(imageToPreview);
                // }

                // if (previewImages.length > 0) {
                // setSelectedImages(previewImages.join(','));
                // setShowPreviewModal(true);

                setIsOpenPreview(true);
                setImageDataUrl(previewImages.join(','));
                setIndexPreview(index);

                // } else {
                //     console.error('Tidak dapat menampilkan pratinjau gambar.');
                // }
            }
            // ====================END PB===========================
        } else if (dokumen === 'PO') {
            const isBase64PDF = imageserver.startsWith('data:application/pdf;base64,');
            if (isBase64PDF) {
                window.open(imageserver, '_blank');
            } else {
                // setShowPreviewModalPO(true);
                // setSelectedImagesPO(imageserver);

                setIsOpenPreview(true);
                setImageDataUrl(imageserver);
                setIndexPreview(index);
            }
        }
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

    const handleZoomIn = () => {
        setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const handleZoomOut = () => {
        setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    // Di bagian lain setelah modal ditutup
    const handleClosePreviewModal = () => {
        setShowPreviewModal(false);
        setSelectedImages('');
        URL.revokeObjectURL(selectedImages);
    };

    const handleClosePreviewModalPO = () => {
        setShowPreviewModalPO(false);
        setSelectedImagesPO('');
        URL.revokeObjectURL(selectedImagesPO);
    };

    // ===========================FILE PENDUKUNG END===============================

    const fromFirstDayInPeriod = async () => {
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            setPeriode(periode);
        } catch (error) {}
    };

    fromFirstDayInPeriod();

    const handleBersihkan = () => {
        setButtonDisabled(false);
        routeFilePendukungValue === 'true' ? null : Clear();
    };

    const onFiltering = (args: any) => {
        let query = new Query();
        query = args.text !== '' ? query.where('ekspedisi', 'startswith', args.text, true) : query;
        args.updateData(listGudang, query);
    };

    return (
        <div>
            {/* Form Grid Layouts */}
            <div className="table-responsive panel mb-3" style={{ background: '#dedede' }}>
                <div className="mb-5">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <div className={styles.titleText}>Penerimaan Barang</div>
                        </div>
                        <div className="flex">
                            {routeKontrakValue === 'Y' ? (
                                <>
                                    {routeFilePendukungValue === 'true' ? (
                                        <div className={styles.titleText} style={{ marginRight: 20, textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                            UPDATE FILE PENDUKUNG
                                        </div>
                                    ) : null}
                                    <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                        KONTRAK
                                    </div>
                                </>
                            ) : (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                    NON KONTRAK
                                </div>
                            )}
                        </div>
                    </div>

                    <table className={styles.table}>
                        <tbody>
                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal Dokumen</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal Diterima</th>
                                <th style={{ textAlign: 'center', width: '50%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. PB</th>
                                <th style={{ textAlign: 'center', width: '30%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Supplier</th>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    {/* <>{moment(dateTglDokumen).format('DD-MM-YYYY')}</> */}
                                    {/* <Flatpickr
                                        value={moment(dateTglDokumen).format('DD-MM-YYYY')}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                            onReady: function (dateObj, dateStr, instance) {
                                                const input = instance.altInput || instance.input;
                                                input.disabled = true; // Disable the input
                                            },
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        // onChange={(date) => setDateTglDokumen(date)}
                                    /> */}

                   {/*

                   <DatePickerComponent
                                        locale="id"
                                        style={{ fontSize: '12px' }}
                                        cssClass="e-custom-style"
                                        //   renderDayCell={onRenderDayCell}
                                        enableMask={true}
                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        value={moment(dateTglDokumen).toDate()}
                                        readOnly
                                        // change={(args: ChangeEventArgsCalendar) => {
                                        //     setDate1(moment(args.value).format('YYYY-MM-DD'));
                                        // }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                   */}                 
                                    {kode_entitas === '760' ||
                                    kode_entitas === '770' ||
                                    kode_entitas === '800' ||
                                    kode_entitas === '801' ||
                                    kode_entitas === '802' ||
                                    kode_entitas === '803' ||
                                    kode_entitas === '804' ||
                                    kode_entitas === '805' ||
                                    kode_entitas === '899' ? (
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
                                                value={moment(dateTglDokumen).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    setDateTglDokumen(moment(args.value).format('YYYY-MM-DD HH:mm:ss'));
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>
                                    ) : (
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            //   renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(dateTglDokumen).toDate()}
                                            readOnly
                                            // change={(args: ChangeEventArgsCalendar) => {
                                            //     setDate1(moment(args.value).format('YYYY-MM-DD'));
                                            // }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    )}

                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {/* <Flatpickr
                                        value={moment(dateTglDiterima).format('DD-MM-YYYY')}
                                        // options={{
                                        //     dateFormat: 'd-m-Y',
                                        // }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => {
                                            const selectedDate = moment(date[0]);
                                            selectedDate.set({
                                                hour: moment().hour(),
                                                minute: moment().minute(),
                                                second: moment().second(),
                                            });
                                            setDateTglDiterima(selectedDate);
                                        }}
                                        options={
                                            routeFilePendukungValue === 'true'
                                                ? {
                                                      dateFormat: 'd-m-Y',
                                                      onReady: function (dateObj, dateStr, instance) {
                                                          const input = instance.altInput || instance.input;
                                                          input.disabled = true; // Disable the input
                                                      },
                                                  }
                                                : { dateFormat: 'd-m-Y' }
                                        }
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
                                            value={moment(dateTglDiterima).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDateTglDiterima(moment(args.value).format('YYYY-MM-DD HH:mm:ss'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', color: 'black' }}>
                                    <div className="flex" style={{ justifyContent: 'center' }}>
                                        {/* <input type="text" value={noPB} readOnly style={{ justifyContent: 'center' }} /> */}
                                        {noPB}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex">
                                        <input
                                            id="termin bayar"
                                            placeholder="Pilih Supplier"
                                            value={selectedNamaSupp}
                                            type="text"
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            readOnly
                                        />
                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                            <button
                                                className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                onClick={() => {
                                                    console.log('Ikon diklik!');
                                                }}
                                                style={{ height: 23, marginTop: -4, marginBottom: -4, background: '#dedede', borderColor: '#dedede' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    className="ml-2"
                                                    width="15"
                                                    height="15"
                                                    onClick={() => {
                                                        vRefreshData.current += 1;
                                                        if (routeFilePendukungValue === 'true') {
                                                            console.log('Update file only');
                                                        } else {
                                                            if (selectedKodeSupp) {
                                                                // alert('apa akan diganti');
                                                                Swal.fire({
                                                                    title: 'Warning',
                                                                    text: `Mengganti Supplier akan menghapus data barang.\n Apakah anda akan membersihkan data barang?`,
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonText: 'Ya bersihkan',
                                                                    cancelButtonText: 'Batal',
                                                                    customClass: {
                                                                        confirmButton: 'swal-button',
                                                                        cancelButton: 'swal-button',
                                                                    },
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        Clear();
                                                                        setModalSupplier(true);
                                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                                        console.log('Batal');
                                                                    }
                                                                });
                                                            } else {
                                                                setModalSupplier(true);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </button>
                                            <SupplierModal
                                                isOpen={modalSupplier}
                                                onClose={() => setModalSupplier(false)}
                                                onSelectData={(selectedData: any, S_NamaRelasi: any, S_KodeTermin: any) => handleSelectDataSupp(selectedData, S_NamaRelasi, S_KodeTermin)}
                                                kode_entitas={kode_entitas}
                                                routeJenisBarang={routeJenisBarang}
                                                vRefreshData={vRefreshData.current}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. SJ / Kontrak</th>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tgl. SJ / Kontrak</th>
                                <th style={{ width: '50%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Gudang</th>
                                <th style={{ width: '30%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Via Pengiriman (Ekspedisi)</th>
                            </tr>

                            <tr>
                                <td>
                                    <div className="flex">
                                        <input
                                            style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            id="salesman"
                                            placeholder="No. SJ / Kontrak"
                                            type="text"
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            value={kodeSJ}
                                            onChange={(e) => handleSelectOnChange(e, 'kode_sj')}
                                            readOnly={routeFilePendukungValue === 'true' ? true : false}
                                        />
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {/* <Flatpickr
                                        value={moment(dateTglSj).format('DD-MM-YYYY')}
                                        // options={{
                                        //     dateFormat: 'd-m-Y',
                                        // }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => {
                                            const selectedDate = moment(date[0]);
                                            selectedDate.set({
                                                hour: moment().hour(),
                                                minute: moment().minute(),
                                                second: moment().second(),
                                            });
                                            setDateTglSj(selectedDate);
                                        }}
                                        options={
                                            routeFilePendukungValue === 'true'
                                                ? {
                                                      dateFormat: 'd-m-Y',
                                                      onReady: function (dateObj, dateStr, instance) {
                                                          const input = instance.altInput || instance.input;
                                                          input.disabled = true; // Disable the input
                                                      },
                                                  }
                                                : { dateFormat: 'd-m-Y' }
                                        }
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
                                            value={moment(dateTglSj).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setDateTglSj(moment(args.value).format('YYYY-MM-DD HH:mm:ss'));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <select
                                        id="a"
                                        className={`form-select text-white-dark`}
                                        style={{ border: 'none', textAlign: 'center', color: !kodeGudang ? 'gray' : 'black' }}
                                        value={kodeGudang}
                                        onChange={(e) => handleSelectOnChange(e, 'kode_gudang')}
                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                    >
                                        <option value="" disabled>
                                            Pilih Gudang
                                        </option>
                                        {listGudang.map((option: any, index) => (
                                            <option key={index} value={option.kode_gudang} style={{ color: 'black' }}>
                                                {option.nama_gudang}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    {/* <select
                                        id="b"
                                        className={`form-select text-white-dark`}
                                        style={{ border: 'none', textAlign: 'center', color: !kodeVia ? 'gray' : 'black' }}
                                        value={kodeVia}
                                        onChange={(e) => handleSelectOnChange(e, 'via')}
                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                    >
                                        <option value="" disabled>
                                            Pilih Via Pengiriman
                                        </option>
                                        {listEkspedisi.map((option: any, index) => (
                                            <option key={index} value={option.ekspedisi} style={{ color: 'black' }}>
                                                {option.ekspedisi}
                                            </option>
                                        ))}
                                    </select> */}
                                    <span className="flex items-center justify-center rounded-md bg-white">
                                        <ComboBoxComponent
                                            id="ddlelement"
                                            popupHeight="250px"
                                            fields={{ text: 'ekspedisi', value: 'ekspedisi' }}
                                            filtering={onFiltering}
                                            allowFiltering={true}
                                            value={kodeVia}
                                            dataSource={listEkspedisi}
                                            placeholder="Pilih Pengiriman"
                                            onChange={(event: any) => setKodeVia(event.value)}
                                            style={{
                                                width: '100%',
                                                borderRadius: '10px', // rounded-sm
                                                border: '0px solid #9ca3af', // border-gray-400
                                                backgroundColor: 'transparent', // bg-gray-50
                                                padding: '', // p-2
                                                fontSize: '0.50rem', // text-xs
                                                color: '#1f2937', // text-gray-900
                                                outline: 'none',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Nama Pengemudi</th>
                                <th style={{ textAlign: 'center', width: '60%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }} colSpan={2}>
                                    No. Kendaraan
                                </th>
                                <th style={{ textAlign: 'center', width: '30%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Cara Pengiriman</th>
                            </tr>

                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <input
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        id="salesman"
                                        placeholder="Nama Pengemudi"
                                        type="text"
                                        className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                        value={pengemudi}
                                        onChange={(e) => handleSelectOnChange(e, 'pengemudi')}
                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                    />
                                </td>
                                <td colSpan={2} style={{ textAlign: 'center' }}>
                                    <input
                                        style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        id="salesman"
                                        placeholder="No. Kendaraan"
                                        type="text"
                                        className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                        value={nopol}
                                        onChange={(e) => handleSelectOnChange(e, 'nopol')}
                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                    />
                                </td>
                                <td>
                                    <div className="flex">
                                        <select
                                            id="c"
                                            className={`form-select text-white-dark`}
                                            style={{ border: 'none', textAlign: 'center', color: 'black' }}
                                            value={dokumen}
                                            onChange={(e) => handleSelectOnChange(e, 'dokumen')}
                                            disabled={routeFilePendukungValue === 'true' ? true : false}
                                        >
                                            <option value="Ambil Sendiri">Ambil Sendiri</option>
                                            <option value="Dikirim">Dikirim</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <Tabs>
                <TabList>
                    <Tab>Data Barang</Tab>
                    <Tab>File Pendukung</Tab>
                </TabList>
                {/* DATA BARANG */}
                <TabPanel>
                    <div className="panel" style={{ background: '#dedede' }}>
                        <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                                <div
                                    style={
                                        {
                                            // width: '200px',
                                        }
                                    }
                                >
                                    <div className="mb-1 flex" style={{ justifyContent: 'flex-end' }}>
                                        <button
                                            title="Tambah Barang"
                                            type="submit"
                                            onClick={() => (routeFilePendukungValue === 'true' ? null : handleSubmit())}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button>
                                        <button
                                            title="Hapus Barang"
                                            type="submit"
                                            style={{ display: 'flex', alignItems: 'center' }}
                                            onClick={() => (routeFilePendukungValue === 'true' ? null : handleRemove(selectedRow, indexMy))}
                                        >
                                            <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button>
                                    </div>
                                    <div style={{ width: '100%' }}>
                                        <Table
                                            style={{ width: '100%' }}
                                            data={data}
                                            theme={theme}
                                            // sort={sort}
                                            // pagination={pagination}
                                            layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
                                        >
                                            {(tableList: any[]) => (
                                                <>
                                                    <Header>
                                                        <HeaderRow style={{ userSelect: 'none' }}>
                                                            <HeaderCell
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                    // width: '200px',
                                                                }}
                                                            >
                                                                <div>No. PO</div>
                                                            </HeaderCell>

                                                            <HeaderCell
                                                                style={{
                                                                    display: 'flex',
                                                                    textAlign: 'center',
                                                                    justifyContent: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <div>PO Group</div>
                                                            </HeaderCell>

                                                            <HeaderCell
                                                                style={{
                                                                    display: 'flex',
                                                                    textAlign: 'center',
                                                                    justifyContent: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <div>PPN Atas Nama</div>
                                                            </HeaderCell>

                                                            <HeaderCell
                                                                style={{
                                                                    display: 'flex',
                                                                    textAlign: 'center',
                                                                    justifyContent: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                No. Barang
                                                            </HeaderCell>
                                                            <HeaderCell
                                                                style={{
                                                                    display: 'flex',
                                                                    textAlign: 'center',
                                                                    justifyContent: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                    // width: '350px',
                                                                }}
                                                            >
                                                                <div>Nama Barang</div>
                                                            </HeaderCell>

                                                            <HeaderCell
                                                                gridColumnStart={6}
                                                                gridColumnEnd={8}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: '#0c0c0c',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <div style={{ marginBottom: '10px' }}>PO</div>
                                                                <hr />
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <div style={{ marginLeft: '25px', marginTop: '20px' }}>Satuan</div>
                                                                    <div style={{ marginRight: '25px', marginTop: '20px' }}>Kuantitas</div>
                                                                </div>
                                                            </HeaderCell>
                                                            <HeaderCell
                                                                gridColumnStart={8}
                                                                gridColumnEnd={10}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: '#0c0c0c',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <div style={{ marginBottom: '10px' }}>SJ Supplier</div>
                                                                <hr />
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <div style={{ marginLeft: '25px', marginTop: '20px' }}>Satuan</div>
                                                                    <div style={{ marginRight: '25px', marginTop: '20px' }}>Kuantitas</div>
                                                                </div>
                                                            </HeaderCell>
                                                            <HeaderCell
                                                                gridColumnStart={10}
                                                                gridColumnEnd={13}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: '#0c0c0c',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <div style={{ marginBottom: '10px' }}>PB</div>
                                                                <hr />
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <div style={{ marginLeft: '10px', marginTop: '20px' }}>Satuan</div>
                                                                    <div style={{ marginTop: '20px' }}>Kuantitas</div>
                                                                    <div style={{ marginRight: '10px', marginTop: '20px' }}>Berat (Kg)</div>
                                                                </div>
                                                            </HeaderCell>
                                                            <HeaderCell
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                Keterangan
                                                            </HeaderCell>
                                                            {/* <HeaderCell
                                                                style={{
                                                                    textAlign: 'center',
                                                                    userSelect: 'none',
                                                                    backgroundColor: 'rgb(94, 98, 98)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                A
                                                            </HeaderCell> */}
                                                        </HeaderRow>
                                                    </Header>

                                                    <Body>
                                                        {tableList.map((item: any, index) => (
                                                            <Row key={item.id_lpb} item={item}>
                                                                <Cell>
                                                                    <div className="flex">
                                                                        <input
                                                                            type="text"
                                                                            style={{
                                                                                width: '100%',
                                                                                border: 'none',
                                                                                fontSize: '14px',
                                                                                outline: 'none',
                                                                                background: 'transparent',
                                                                                backgroundColor: selectedRow === item.id_lpb ? '#adf4f5' : 'transparent',
                                                                                // color: selectedRow === item.id_lpb ? 'white' : 'black',
                                                                                cursor: 'pointer',
                                                                            }}
                                                                            value={item.no_sp}
                                                                            onFocus={() => {
                                                                                setSelectedRow(item.id_lpb);
                                                                                setIndex(index);
                                                                            }}
                                                                            readOnly
                                                                        />
                                                                        <div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (routeFilePendukungValue === 'true') {
                                                                                        console.log('update file only');
                                                                                    } else {
                                                                                        if (!selectedKodeSupp) {
                                                                                            Swal.fire({
                                                                                                title: 'Warning',
                                                                                                text: 'Silahkan pilih supplier',
                                                                                                icon: 'warning',
                                                                                            }).then((result) => {
                                                                                                if (result.isConfirmed) {
                                                                                                    setModalSupplier(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            setModalPOItem(true);
                                                                                            // generateIndex(index);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={faMagnifyingGlass}
                                                                                    className="ml-2"
                                                                                    width="15"
                                                                                    height="15"
                                                                                    // onClick={() => setModalPOItem(true)}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Cell>

                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: '#dedede',
                                                                        }}
                                                                        value={item.kodegrup}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>

                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: '#dedede',
                                                                        }}
                                                                        value={item.nama_cabang}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>

                                                                <Cell style={{ textAlign: 'center' }}>
                                                                    <div className="flex">
                                                                        <input
                                                                            type="text"
                                                                            style={{
                                                                                width: '100%',
                                                                                border: 'none',
                                                                                fontSize: '14px',
                                                                                outline: 'none',
                                                                                background: 'transparent',
                                                                            }}
                                                                            value={item.no_item}
                                                                            onFocus={() => {
                                                                                setSelectedRow(item.id_lpb);
                                                                                setIndex(index);
                                                                            }}
                                                                            readOnly
                                                                        />
                                                                        <div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    vRefreshData.current += 1;
                                                                                    if (routeFilePendukungValue === 'true') {
                                                                                        console.log('update file only');
                                                                                    } else {
                                                                                        if (!selectedKodeSupp) {
                                                                                            Swal.fire({
                                                                                                title: 'Warning',
                                                                                                text: 'Silahkan pilih supplier',
                                                                                                icon: 'warning',
                                                                                            }).then((result) => {
                                                                                                if (result.isConfirmed) {
                                                                                                    setModalSupplier(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            setModalPOItem(true);
                                                                                            // generateIndex(index);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={faMagnifyingGlass}
                                                                                    className="ml-2"
                                                                                    width="15"
                                                                                    height="15"
                                                                                    // onClick={() => setModalPOItem(true)}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Cell>

                                                                <Cell>
                                                                    <div className="flex">
                                                                        <input
                                                                            type="text"
                                                                            style={{
                                                                                width: '100%',
                                                                                border: 'none',
                                                                                fontSize: '14px',
                                                                                outline: 'none',
                                                                                background: 'transparent',
                                                                            }}
                                                                            value={item.diskripsi}
                                                                            onFocus={() => {
                                                                                setSelectedRow(item.id_lpb);
                                                                                setIndex(index);
                                                                            }}
                                                                            readOnly
                                                                        />
                                                                        <div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    vRefreshData.current += 1;
                                                                                    if (routeFilePendukungValue === 'true') {
                                                                                        console.log('update file only');
                                                                                    } else {
                                                                                        if (!selectedKodeSupp) {
                                                                                            Swal.fire({
                                                                                                title: 'Warning',
                                                                                                text: 'Silahkan pilih supplier',
                                                                                                icon: 'warning',
                                                                                            }).then((result) => {
                                                                                                if (result.isConfirmed) {
                                                                                                    setModalSupplier(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            setModalPOItem(true);
                                                                                            // generateIndex(index);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={faMagnifyingGlass}
                                                                                    className="ml-2"
                                                                                    width="15"
                                                                                    height="15"
                                                                                    // onClick={() => setModalPOItem(true)}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Cell>

                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: '#dedede',
                                                                        }}
                                                                        value={item.sat_std}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>

                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: '#dedede',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={frmNumber(item.qty_po)}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>
                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.sat_sj}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>
                                                                <Cell>
                                                                    <input
                                                                        id={`qty_sj${item.id_lpb}`}
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        defaultValue={item.qty_sj}
                                                                        onBlur={(event) => handleUpdate(event.target.value, item.id_lpb, 'qty_sj', item.include, item.pajak)}
                                                                        onKeyDown={(event) => {
                                                                            const char = event.key;
                                                                            const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                                            if (!isValidChar) {
                                                                                event.preventDefault();
                                                                            }
                                                                            const inputValue = (event.target as HTMLInputElement).value;
                                                                            if (char === '.' && inputValue.includes('.')) {
                                                                                event.preventDefault();
                                                                            }
                                                                        }}
                                                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                                                        // onKeyPress={(event) => {
                                                                        //     const isNumeric = /^[0-9]*$/;
                                                                        //     if (!isNumeric.test(event.key)) {
                                                                        //         event.preventDefault();
                                                                        //     }
                                                                        // }}
                                                                    />
                                                                </Cell>

                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.satuan}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>
                                                                <Cell>
                                                                    <input
                                                                        id={`qty${item.id_lpb}`}
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        defaultValue={item.qty}
                                                                        // defaultValue={item.qty_sisa}
                                                                        onBlur={(event) => handleUpdate(event.target.value, item.id_lpb, 'qty', item.include, item.pajak)}
                                                                        onKeyDown={(event) => {
                                                                            const char = event.key;
                                                                            const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                                            if (!isValidChar) {
                                                                                event.preventDefault();
                                                                            }
                                                                            const inputValue = (event.target as HTMLInputElement).value;
                                                                            if (char === '.' && inputValue.includes('.')) {
                                                                                event.preventDefault();
                                                                            }
                                                                        }}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                                                    />
                                                                </Cell>
                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: '#dedede',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={
                                                                            typeof item.qty === 'string' ? frmNumber(item.brt * parseFloat(item.qty.replace(',', ''))) : frmNumber(item.brt * item.qty)
                                                                        }
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </Cell>
                                                                <Cell>
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.ket}
                                                                        onFocus={() => {
                                                                            setSelectedRow(item.id_lpb);
                                                                            setIndex(index);
                                                                        }}
                                                                        onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'ket', '', '')}
                                                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                                                    />
                                                                </Cell>
                                                                {/* <Cell>
                                                                    <button onClick={() => handleRemove(item.id_lpb)} type="submit" style={{ display: 'flex', alignItems: 'center', color: 'red' }}>
                                                                        <FaMinusCircle style={{ marginRight: '5px' }} />
                                                                    </button>
                                                                </Cell> */}
                                                            </Row>
                                                        ))}
                                                    </Body>
                                                    {/* <TaskName isOpen={modaltable} onClose={() => setModalTable(false)} onSelectData={(selectedData: any) => handleSelectDataSupp(selectedData)} /> */}
                                                </>
                                            )}
                                        </Table>
                                    </div>
                                </div>
                                <div className="mt-4"></div>
                            </div>
                        </div>

                        <div className="my-0 flex justify-between">
                            <div className="flex" style={{ alignItems: 'center', marginTop: -10, fontWeight: 'bold' }}>
                                <span>Total Tonase :</span>
                                <span style={{ margin: '0 30px' }}>{frmNumber(totalBeratHeader)} Kg</span>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                {/* FILE PENDUKUNG */}
                <TabPanel>
                    <div className="panel" style={{ background: '#dedede' }}>
                        <div className="panel">
                            <div className={styles['grid-container']}>
                                <div className={styles['grid-left']}>
                                    <Tabs>
                                        <div style={{ display: 'flex', maxWidth: '1400px' }}>
                                            {/* list image PB */}
                                            <div style={{ flex: '1' }}>
                                                <table style={{ width: '100%' }}>
                                                    <caption style={{ fontWeight: 'bold' }}>Daftar file dokumen pendukung PB</caption>
                                                    <colgroup>
                                                        <col style={{ width: '10%' }} />
                                                        <col style={{ width: '90%' }} />
                                                    </colgroup>
                                                    <thead>
                                                        <tr>
                                                            <th>No</th>
                                                            <th>Nama File</th>
                                                        </tr>
                                                    </thead>
                                                    {/* {edit !== 'true' ? ( */}
                                                    <tbody>
                                                        {selectedFiles.map((file: any, index: any) => {
                                                            // console.log('file = ', file, file.source);
                                                            return (
                                                                <tr
                                                                    key={index}
                                                                    onClick={() => handleFileSelect(index, file.file?.name, file.decodeBase64_string, 'PB', file.filegambar)}
                                                                    style={{ cursor: 'pointer', backgroundColor: selectedRowsImage === index ? '#e2e8f0' : 'inherit' }}
                                                                >
                                                                    <td>{index + 1}</td>
                                                                    <td>
                                                                        {file.source === 'paste'
                                                                            ? file.namaPaste
                                                                            : file.file?.name === undefined
                                                                            ? file.fileoriginal === 'image.png'
                                                                                ? file.filegambar
                                                                                : file.fileoriginal
                                                                            : file.file?.name}
                                                                    </td>
                                                                    {/* <td>{file.file?.name === undefined ? file.file?.fileoriginal : file.file?.name}</td> */}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* button PB */}
                                            <div style={{ marginLeft: '20px', marginTop: '25px' }}>
                                                <div className={styles['grid-right']} style={{ marginTop: '-21px' }}>
                                                    {/* <button type="submit" className="btn btn-gray mb-2 h-[4.5vh]" onClick={handleUpload} style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}>
                                        Capture
                                    </button> */}
                                                    <input id="fileInput" type="file" onChange={handleFileChange} multiple style={{ display: 'none' }} />
                                                    <button
                                                        type="button"
                                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                                        onClick={() => {
                                                            const fileInput = document.getElementById('fileInput');
                                                            if (fileInput) {
                                                                fileInput.click();
                                                            }
                                                        }}
                                                    >
                                                        Ambil File
                                                    </button>
                                                    <button
                                                        onClick={() => handleHapusFile(selectedRowsImage)}
                                                        // onClick={() => handleUpload('PB0000043553', 'baru')}
                                                        type="submit"
                                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                                    >
                                                        Hapus File
                                                    </button>
                                                    {/* <button
                                        onClick={() => alert('simpan file')}
                                        // disabled={selectedFiles.filter((file: any) => file.selected).length === 0}
                                        type="submit"
                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                    >
                                        Simpan ke File
                                    </button> */}
                                                    <button
                                                        // onClick={() => handlePreview(selectedRowsImage, selectedRowsImageJenis, selectedRowsImageServer, 'PB')}
                                                        onClick={() => handleFileClick(selectedRowsImage, selectedRowsImageJenis, selectedRowsImageServer, 'PB', selectedRowsImageFilegambarServer)}
                                                        type="submit"
                                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                                    >
                                                        <FontAwesomeIcon icon={faCamera} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                        Preview
                                                    </button>
                                                </div>
                                            </div>
                                            {/* list image PO */}
                                            <div style={{ flex: '1' }}>
                                                <table style={{ width: '100%' }}>
                                                    <caption style={{ fontWeight: 'bold' }}>Daftar file dokumen pendukung PO</caption>
                                                    <colgroup>
                                                        <col style={{ width: '10%' }} />
                                                        <col style={{ width: '90%' }} />
                                                    </colgroup>
                                                    <thead>
                                                        <tr>
                                                            <th>No</th>
                                                            <th>Nama File</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedFilesPO.map((file: any, index: any) => (
                                                            <tr
                                                                key={index}
                                                                onClick={() => handleFileSelectPO(index, file.name, file.decodeBase64_string, 'PO', file.filegambar)}
                                                                style={{ cursor: 'pointer', backgroundColor: selectedRowsImagePO === index ? '#e2e8f0' : 'inherit' }}
                                                            >
                                                                <td>{index + 1}</td>
                                                                <td>{file.filegambar}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* button PO */}
                                            <div style={{ marginLeft: '20px', marginTop: '25px' }}>
                                                <div className={styles['grid-right']} style={{ marginTop: '-21px' }}>
                                                    {/* <button type="submit" className="btn btn-gray mb-2 h-[4.5vh]" onClick={() => alert('Refresh')} style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}>
                                        Refresh
                                    </button> */}
                                                    {/* <button
                                        type="submit"
                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                        onClick={() => alert('Simpan ke File')}
                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                    >
                                        Simpan ke File
                                    </button> */}
                                                    <button
                                                        // onClick={() => handlePreview(selectedRowsImagePO, selectedRowsImageJenis, selectedRowsImageServerPO, 'PO')}
                                                        onClick={() =>
                                                            handleFileClick(selectedRowsImagePO, selectedRowsImageJenis, selectedRowsImageServerPO, 'PO', selectedRowsImageFilegambarServerPO)
                                                        }
                                                        type="submit"
                                                        className="btn btn-gray mb-2 h-[4.5vh]"
                                                        style={{ backgroundColor: 'gray', color: 'white', height: '15%' }}
                                                    >
                                                        <FontAwesomeIcon icon={faCamera} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                        Preview
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>

            {/* CATATAN */}
            <div className="panel mt-3" style={{ background: '#dedede' }}>
                <div className={styles['grid-containerNote']}>
                    <div className={styles['grid-leftNote']}>
                        <div>
                            <label style={{ fontWeight: 'bold' }} htmlFor="catatan">
                                Catatan:
                            </label>
                            <form>
                                <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600">
                                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                        <label className="sr-only">Publish post</label>
                                        <textarea
                                            id="editor"
                                            rows={3}
                                            className=" form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                            placeholder="Write note here..."
                                            // required
                                            value={catatan}
                                            onChange={(e) => {
                                                handleSelectOnChange(e, 'catatan');
                                            }}
                                            readOnly={routeFilePendukungValue === 'true' ? true : false}
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* <p className="mt-3">Terbilang:</p>
                        <p className="text-green-500">Nol</p> */}
                    </div>
                </div>
            </div>
            {/* BUTTON BAWAH */}
            <div className="my-5 flex justify-between">
                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="17" height="17" />
                        Lanjut
                    </button> */}
                    <button
                        type="submit"
                        className="btn btn-secondary mr-1"
                        onClick={() => {
                            if (routeFilePendukungValue === 'true') {
                                handleUpload(kodePB, 'update');
                            } else {
                                const fromFirstDayInPeriod = async () => {
                                    try {
                                        // var daysDifferenceFutureDate = moment(dateTglDiterima).diff(moment(currentDateTime), 'days');
                                        // var daysDifferenceBackDate = moment(currentDateTime).diff(moment(dateTglDiterima), 'days');
                                        // // console.log(daysDifferenceFutureDate);
                                        // // console.log(daysDifferenceBackDate);
                                        // if (daysDifferenceFutureDate > 2) {
                                        //     console.log('Tanggal terima future date lebih besar dari 3 hari.');
                                        //     Swal.fire({
                                        //         title: 'Warning',
                                        //         text: 'Tanggal terima future date lebih besar dari 3 hari.',
                                        //         icon: 'warning',
                                        //     });
                                        // } else if (daysDifferenceBackDate > 14) {
                                        //     console.log('Tanggal terima back date lebih besar dari 14 hari.');
                                        //     Swal.fire({
                                        //         title: 'Warning',
                                        //         text: 'Tanggal terima back date lebih besar dari 14 hari.',
                                        //         icon: 'warning',
                                        //     });
                                        // } else {
                                        const periode = await FirstDayInPeriod(kode_entitas);
                                        // BLOCKING: tgl_dokumen//lpb < tgl currentdate
                                        const formatPeriode = moment(periode).format('YYYY-MM-DD');
                                        if (moment(dateTglDokumen).format('YYYY-MM-DD') < formatPeriode) {
                                            // blok periode
                                            Swal.fire({
                                                title: 'Warning',
                                                text: 'Tanggal tidak dalam periode akuntansi.',
                                                icon: 'warning',
                                            });
                                        } else {
                                            if (moment(dateTglDokumen).format('YYYY-MM-DD') < moment(currentDateTime).format('YYYY-MM-DD')) {
                                                // blok < currentdate
                                                Swal.fire({
                                                    title: 'Warning',
                                                    text: 'Tgl. Dokumen lebih kecil dari hari ini.',
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Tetap lanjutkan transaksi',
                                                    cancelButtonText: 'Batal',
                                                    customClass: {
                                                        confirmButton: 'swal-button',
                                                        cancelButton: 'swal-button',
                                                    },
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        console.log('Tetap lanjutkan transaksi');
                                                        // saveDoc('');
                                                        prosesBloking('');
                                                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                        console.log('Batal');
                                                    }
                                                });
                                            } else {
                                                console.log('lolos');
                                                // saveDoc('');
                                                prosesBloking('');
                                            }
                                        }
                                        // }
                                    } catch (error) {}
                                };
                                fromFirstDayInPeriod();
                            }
                        }}
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                    >
                        <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Simpan
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary mr-1"
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                        onClick={() => backPage()} // Mengarahkan kembali ke halaman sebelumnya saat tombol "Batal" ditekan
                    >
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Batal
                    </button>

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
                    {disableDaftarPO === false ? (
                        <button
                            disabled={buttonDisabled}
                            type="submit"
                            className="btn btn-gray mb-2 md:mb-0 md:mr-2"
                            style={{ backgroundColor: '#5c5a5a', color: 'white', borderColor: '#5c5a5a' }}
                            onClick={() => (routeFilePendukungValue === 'true' ? null : handleDaftarPO())}
                        >
                            <FontAwesomeIcon icon={faFileArchive} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            <POModal
                                isOpen={modalPO}
                                onClose={() => setModalPO(false)}
                                onSelectDataPO={(selectedDataPO: any) => handleSelectedDataPO(selectedDataPO)}
                                kodeSupp={selectedKodeSupp}
                                kode_entitas={kode_entitas}
                                kontrak={routeKontrakValue}
                            />
                            Daftar PO
                        </button>
                    ) : null}
                    <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }} onClick={handleBersihkan}>
                        <FontAwesomeIcon icon={faBackward} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Bersihkan
                    </button>
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faList} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Info Customer
                    </button> */}
                </div>
            </div>
            <DaftarPOItem
                isOpen={modalPOItem}
                onClose={() => setModalPOItem(false)}
                onSelectData={(dataObject: any) => handleDaftarPoItem(dataObject)}
                kode_entitas={kode_entitas}
                kode_supp={selectedKodeSupp}
                kontrak={routeKontrakValue}
            />
            <AuthModal isOpen={modalLogin} onClose={() => setModalLogin(false)} onSelectData={(status: any) => handleSelectDataLogin(status)} kode_entitas={kode_entitas} />
            {showPreviewModal && selectedImages !== '' && (
                <Draggable>
                    <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition}>
                        <div className="overflow-auto">
                            <div
                                style={{ transform: `scale(${zoomLevel})` }}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    const newZoomLevel = zoomLevel + e.deltaY * -0.01;
                                    setZoomLevel(Math.min(Math.max(newZoomLevel, 1), 3)); // Batasi zoom level antara 1 dan 3
                                }}
                            >
                                <img
                                    src={selectedImages}
                                    style={{ maxWidth: '1000px', maxHeight: '500px' }}
                                    onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)} // Toggle zoom level saat gambar diklik
                                    className={zoomLevel === 2 ? 'zoomed' : ''} // Tambahkan kelas zoomed saat gambar diperbesar
                                />
                            </div>
                        </div>
                        <button
                            className={`${styles.closeButtonDetailDragable}`}
                            onClick={() => {
                                handleClosePreviewModal();
                                setZoomLevel(1); // Reset zoom level saat modal ditutup
                                setShowPreviewModal(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                    </div>
                </Draggable>
            )}
            {showPreviewModalPO && selectedImagesPO !== '' && (
                <Draggable>
                    <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition}>
                        <div className="overflow-auto">
                            <div
                                style={{ transform: `scale(${zoomLevelPO})` }}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    const newZoomLevel = zoomLevelPO + e.deltaY * -0.01;
                                    setZoomLevelPO(Math.min(Math.max(newZoomLevel, 1), 3)); // Batasi zoom level antara 1 dan 3
                                }}
                            >
                                <img
                                    src={selectedImagesPO}
                                    style={{ maxWidth: '1000px', maxHeight: '500px' }}
                                    onClick={() => setZoomLevelPO(zoomLevelPO === 1 ? 2 : 1)} // Toggle zoom level saat gambar diklik
                                    className={zoomLevelPO === 2 ? 'zoomed' : ''} // Tambahkan kelas zoomed saat gambar diperbesar
                                />
                            </div>
                        </div>
                        <button
                            className={`${styles.closeButtonDetailDragable}`}
                            onClick={() => {
                                handleClosePreviewModalPO();
                                setZoomLevelPO(1); // Reset zoom level saat modal ditutup
                                setShowPreviewModalPO(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                    </div>
                </Draggable>
            )}

            {/* ============================================================ */}
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
            {/* {PreviewPdf && (
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
            )} */}

            {PreviewPdf && (
                <Draggable>
                    <div className={styles.modalPreviewPictureDragable} style={modalPosition1}>
                        {/* PDF Viewer dengan scroll + zoom */}
                        <div className={styles.scrollableContent} style={{ maxHeight: '700px', overflowY: 'auto' }} onWheel={handleWheelZoom}>
                            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                {Array.from(new Array(numPages), (el, index) => (
                                    <PagePDF
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        scale={zoom} // Pastikan PagePDF menerima prop scale dan meneruskan ke <Page />
                                        className={styles.page}
                                    />
                                ))}
                            </Document>
                        </div>

                        {/* Tombol close */}
                        <button className={styles.closeButtonDetailDragable} onClick={cancelPreviewPdf}>
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default NewPB;
