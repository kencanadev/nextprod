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
import React from 'react';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { faSort, faSortUp, faSortDown, faCircle, faCirclePlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@table-library/react-table-library/theme';
import { useRouter } from 'next/router';
import moment, { isMoment } from 'moment';
import axios from 'axios';
import TerminModal from './modal/terminBayar';
import {
    generateNU,
    frmNumber,
    formatNumber,
    tanpaKoma,
    myAlertGlobal2,
    GetEntitasUser,
    GetEntitasPusat,
    generateNofakturFB,
    generateNUDivisi,
    ResetTime2,
    GetSuppMapping,
    GetCustMapping,
    qty2QtyStd,
} from '@/utils/routines';
import { fetchPreferensi, FillFromSQL, generateTerbilang, FirstDayInPeriod } from '@/utils/routines';
import AkunDlg from './modal/akundlg';
import Swal from 'sweetalert2';
import TableJurnal from './component/tableJurnal';
import SupplierModal from './modal/supplier';
import SubledgerModal from './modal/subledger';
import Draggable from 'react-draggable';
import { parse } from 'path';
import AuthModal from './modal/loginModal';
import { useSession } from '@/pages/api/sessionContext';
import { exitCode } from 'process';
import withReactContent from 'sweetalert2-react-content';
import { cekDataDiDatabase, cekNoDokTerakhir, entitaspajak, swalDialog } from '@/utils/global/fungsi';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
import { CekUserApp } from '../../fa/ppi/model/apiPpi';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface QueryParams {
    [key: string]: string;
}

// interface PBListProps {
//     userid: any;
//     kode_entitas: any;
//     kode_user: any;
// }

const ApprovalPB = () => {
    const { sessionData, isLoading } = useSession();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const router = useRouter();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    // console.log(sessionData?.kode_entitas);
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    const [dateTglDokumen, setDateTglDokumen] = useState<any>(moment());
    const [dateTglDiterima, setDateTglDiterima] = useState<any>(moment());
    const [dateTglSj, setDateTglSj] = useState<any>(moment());

    // modal
    const [modalTermin, setModalTermin] = useState(false);
    const [modalLogin, setModalLogin] = useState(false);

    const [kontrak, setKontrak] = useState();
    const [listSupplier, setListSupplier] = useState([]);
    const [listEkspedisi, setListEkspedisi] = useState([]);
    const [listGudang, setListGudang] = useState([]);
    const [listDepartemen, setListDepartemen] = useState([]);
    const [noPB, setNoPB] = useState('');
    const [kodePB, setKodePB] = useState('');

    const [kodeFpb, setKodeFpb] = useState('');
    const [statusExport, setStatusExport] = useState('');
    const [lpbkontrak, setLpbkontrak] = useState('');
    const [kodeMu, setKodeMu] = useState('');
    const [kenaPajak, setKenaPajak] = useState('');

    const [exportNonKontrak, setExportNonKontrak] = useState(false);
    const [exportKontrakPusat, setExportKontrakPusat] = useState(false);
    const [otomatisFB, setOtomatisFB] = useState(false);

    const [noSJ, setNoSj] = useState('');
    const [nopol, setNopol] = useState('');
    const [pengemudi, setPengemudi] = useState('');
    const [kodeGudang, setKodeGudang] = useState('');
    const [selectedNamaSupp, setNamaSupp] = useState('');
    const [kodeSuppM, setKodeSuppM] = useState();
    const [selectedKodeTermin, setSelectedKodeTermin] = useState();
    const [terminSelected, setterminSelected] = useState('');
    const [kodePajak, setKodePajak] = useState();
    const [via, setVia] = useState();
    const [dokumen, setKodeDokumen] = useState();
    const [data, setData] = useState({ nodes: [] });
    const [subTotal, setSubTotal] = useState(0);
    const [totalDiskonRP, setTotalDiskonRP] = useState(0);
    const [totalPotonganRP, setTotalPotonganRP] = useState(0);
    const [terbilang, setTerbilang] = useState('');
    const [headerPB, setHeaderPB] = useState({ nodes: [] });

    const [selectedOptionPajak, setSelectedOptionPajak] = useState('N');
    const [valueNilaiDpp, setValueNilaiDpp] = useState(0);
    const [valueStringPajak, setValueStringPajak] = useState('');
    const [totalJumlahVariabel, setTotalJumlahVariabel] = useState(0);
    const [totalNilaiPajakRP, setTotalNilaiPajakRP] = useState(0);
    const [nominalDiskon, setNominalDiskon] = useState(0);
    const [persenDiskon, setPersenDiskon] = useState(0);
    const [fdo, setFDO] = useState('default');
    const [totalBeratHeader, setTotalBeratHeader] = useState(null);
    const [nominalBiayaKirim, setNominalBiayaKirim] = useState(0);
    const [persenBiayaKirim, setPersenBiayaKirim] = useState(0);

    const [TglPB, setTglPB] = useState('');
    const [TglSJ, setTglSJ] = useState('');
    const [NoReff, setNoReff] = useState('');
    const [FOB, setFOB] = useState('');
    const [Persediaan, setPersediaan] = useState('');
    const [Keterangan, setKeterangan] = useState('');
    const [Status, setStatus] = useState('');
    const [UserID, setUserID] = useState('');
    const [TglTrxLpb, setTglTrxLpb] = useState('');
    const [totalDebet, setTotalDebet] = useState(0);
    const [totalKredit, setTotalKredit] = useState(0);
    const [selisih, setSelisih] = useState(0);

    const currentDate = moment().format('YYYY-MM-DD');

    //=====jurnal=========================
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
    const [kursPajak, setKursPajak] = useState(0);
    const [totalNettoRPSet, setTotalNettoRPSet] = useState(0);
    const totalNettoRPSetRef = useRef(0);
    const [totalPajakSet, setTotalPajakSet] = useState(0);
    const [kirimSet, setKirimSet] = useState(0);

    const [kodeSupp, setkodeSupp] = useState('');
    const [noSupp, setnoSupp] = useState('');
    const [kodeDept, setKodeDept] = useState('');
    const [modalSuppJurnal, setModalSuppJurnal] = useState(false);
    const [modalSubledger, setModalSubledger] = useState(false);
    const [blockingJurnal, setBlockingJurnal] = useState(false);
    const [blockingDetailPajak, setBlockingDetailPajak] = useState(false);
    const [autoJurnalEkse, setautoJurnalEkse] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };

    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });

    const [apiResponseSelectNilaiPajak, setApiResponseSelectNilaiPajak] = useState({
        status: false,
        message: '',
        data: [],
    });

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
          --data-table-library_grid-template-columns: 8% 5% 12% 5% 20% 5% 5% 5% 5% 5% 5% 5% 5% 7% 7% 7% 9% 7% minmax(300px, 1fr);
          overflow-x: auto;
        `,
    });

    const theme2 = useTheme({
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
          --data-table-library_grid-template-columns: 7% 10% 7% 7% 20% 3% 3% 7% 10% minmax(400px, 1fr);
          overflow-x: auto;
        `,
    });

    //========jurnal
    const [dataJurnal, setDataJurnal] = useState({ nodes: [] });
    const [selectcellid_pbValue, setselectcellid_pbValue] = useState<any>('');
    const [nilaiValueNoAkun, setNilaiValueNoAKun] = useState('');
    const [nilaiValueNamaAkun, setNilaiValueNamaAkun] = useState('');
    const [totalNum, setTotalNum] = useState(0);
    const [tipeValue, setTipeValue] = useState('');
    const [modalAkunDlg, setModalAkunDlg] = useState(false);
    const [rowid, setRowId] = useState<any>(0);
    const [modalTipeCari, setModalTipeCari] = useState('');
    const mounted = useRef(false);
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
    const [showLoader, setShowLoader] = useState(false);
    const [dariFpb, setDariFpb] = useState(false);

    useEffect(() => {
        const totalDebetRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            return total + parseFloat(tanpaKoma(node.debet_rp));
        }, 0);

        const totalKreditRp = dataJurnal.nodes.reduce((total: any, node: any) => {
            return total + parseFloat(tanpaKoma(node.kredit_rp));
        }, 0);

        // console.log('🚀 ~ useEffect ~ totalDebetRp:', totalDebetRp);
        // console.log('🚀 ~ useEffect ~ totalKreditRp:', totalKreditRp);

        setTotalDebet(totalDebetRp);
        setTotalKredit(totalKreditRp);
        setSelisih(totalDebetRp - totalKreditRp);

        //HANDLE TERBILANG
        if (selectedOptionPajak === 'N') {
            // console.log(subTotal, nominalDiskon, kirimMU);
            var nilaiTerbilang = subTotal - nominalDiskon + kirimMU;
            let [bagianBulat, bagianDesimal] = nilaiTerbilang.toString().split('.');
            // console.log(nilaiTerbilang);
            generateTerbilang(kode_entitas, parseFloat(bagianBulat))
                .then((result) => {
                    setTerbilang(result);
                    // alert(result);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (selectedOptionPajak === 'I') {
            var nilaiTerbilang = valueNilaiDpp + totalNilaiPajakRP + kirimMU;
            let [bagianBulat, bagianDesimal] = nilaiTerbilang.toString().split('.');
            generateTerbilang(kode_entitas, parseFloat(bagianBulat))
                .then((result) => {
                    setTerbilang(result);
                    // alert(result);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (selectedOptionPajak === 'E') {
            var nilaiTerbilang = valueNilaiDpp + totalNilaiPajakRP + kirimMU;
            console.log(nilaiTerbilang);
            let [bagianBulat, bagianDesimal] = nilaiTerbilang.toString().split('.');
            generateTerbilang(kode_entitas, parseFloat(bagianBulat))
                .then((result) => {
                    setTerbilang(result);
                    // alert(result);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        //END
    }, [dataJurnal, subTotal, nominalDiskon, kirimMU, valueNilaiDpp, totalNilaiPajakRP]);

    //FILE PENDUKUNG
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

    const [selectedRowsImage, setSelectedRowsImage] = useState('');
    const [selectedRowsImagePO, setSelectedRowsImagePO] = useState('');
    const [selectedRowsImageJenis, setSelectedRowsImageJenis] = useState('');
    const [selectedRowsImageServer, setSelectedRowsImageServer] = useState('');
    const [selectedRowsImageServerPO, setSelectedRowsImageServerPO] = useState('');
    const [selectedRowsImageFilegambarServer, setSelectedRowsImageFilegambarServer] = useState('');
    const [selectedRowsImageFilegambarServerPO, setSelectedRowsImageFilegambarServerPO] = useState('');
    const [selectedFilesPO, setSelectedFilesPO] = useState<any>([]);

    const [getEntitasPst, setGetEntitasPst] = useState('');
    const [getEntitasUser, setGetEntitasUser] = useState('');
    const [transakiOtomatis, setTransaksiOtomatis] = useState(false);

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    const [indexPreview, setIndexPreview] = useState(0);
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.5);

    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [rotationAngle, setRotationAngle] = useState(0);

    const handleRotateLeft = () => setRotationAngle(rotationAngle - 90);
    const handleRotateRight = () => setRotationAngle(rotationAngle + 90);

    const { view } = router.query;
    //=====================================

    const [kodeAkun, setKodeAkun] = useState<any[]>([]);

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

    const handleZoomIn = () => {
        setZoomScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
    };

    const handleZoomOut = () => {
        setZoomScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
    };

    const [zoom, setZoom] = useState(1.0); // nilai default zoom 100%

    const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault(); // cegah scroll bawaan biar fokus ke zoom

        const delta = e.deltaY;
        setZoom((prev) => {
            let newZoom = prev + (delta > 0 ? -0.1 : 0.1);
            return Math.min(Math.max(newZoom, 0.5), 3); // zoom antara 50% dan 300%
        });
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
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
        const fetchData = async () => {
            try {
                // console.log('kode_entitas kode_entitas ', kode_entitas);
                const transformedData = await fetchPreferensi(kode_entitas, apiUrl);
                setKodeAkun(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const { str } = router.query;
    let decodedData: string = '';
    let routeTglAwal: any, routeTglAkhir: any, routeTglSjSuppAwal: any, routeTglSjSuppAkhir: any;
    let routeViewValue: any,
        routeKodePBValue: any,
        routeStatusValue: any,
        routeFilePendukungValue: any,
        routeNoPBValue: any,
        routeNoSJValue: any,
        routeSupplierValue: any,
        routeSelectedGudang: any,
        routeNamaBarangValue: any,
        routeSelectedStatus: any,
        routeSelectedOptionRadio: any,
        routeTipeDokumen: any;
    //encode url

    if (typeof str === 'string') {
        decodedData = Buffer.from(str, 'base64').toString('ascii');

        const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
            const [key, value] = keyValue.split('=');
            acc[key] = value;
            return acc;
        }, {} as QueryParams);

        const {
            kode_lpb,
            view,
            status,
            updatefilependukung,
            tglAwal,
            tglAkhir,
            tglSjSuppAwal,
            tglSjSuppAkhir,
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
        routeViewValue = view;
        routeStatusValue = status;
        routeFilePendukungValue = updatefilependukung;
        routeTglAwal = tglAwal;
        routeTglAkhir = tglAkhir;
        routeTglSjSuppAwal = tglSjSuppAwal;
        routeTglSjSuppAkhir = tglSjSuppAkhir;
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
    useEffect(() => {
        const fetchData = async () => {
            // console.log(autoJurnalEkse);
            await Async();
            if (autoJurnalEkse === true) {
                autojurnal();
            }
        };

        fetchData();
    }, [autoJurnalEkse]);

    let headerPraPB: any;
    const Async = async () => {
        if (routeViewValue === 'true') {
            // edit
            //APPROVED
            headerPraPB = await axios.get(`${apiUrl}/erp/header_approved_pb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });
            var detailPraPB = await axios.get(`${apiUrl}/erp/detail_approved_pb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });
            var detailJurnal = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });

            const response = detailJurnal.data.data;
            const parsedResDetailJurnal = response.map((item: any) => ({
                ...item,
                debet_rp: frmNumber(item.debet_rp),
                kredit_rp: frmNumber(item.kredit_rp),
                // jumlah_mu: frmNumber(item.jumlah_mu),
                jumlah_mu: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
                jumlah_rp: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
                // jumlah_rp: frmNumber(item.jumlah_rp),
                // jumlah_rp: item.qty * (item.harga_mu - item.diskon_mu - item.potongan_mu),
                // jumlah_mu: parseFloat(item.jumlah_mu),
                // harga_mu: parseFloat(item.harga_mu),
                // berat: parseFloat(item.berat),
                // diskon: item.diskon === '' ? frmNumber(0) : frmNumber(item.diskon),
                // diskon_mu: item.diskon_mu === '' ? 0 : parseFloat(item.diskon_mu),
                // potongan_mu: frmNumber(item.potongan_mu),
                // nilai_pajak: 0,
            }));
            setDataJurnal({ nodes: parsedResDetailJurnal });
            // console.log('parsedResDetailJurnal');
            // console.log(parsedResDetailJurnal);
        } else {
            // console.log('kode_entitas', kode_entitas);
            // console.log('routeKodePBValue', routeKodePBValue);
            headerPraPB = await axios.get(`${apiUrl}/erp/app_header_prapb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });
            var detailPraPB = await axios.get(`${apiUrl}/erp/app_detail_prapb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });
        }

        const resHeader = headerPraPB.data.data;
        // console.log('resHeader', resHeader);
        setHeaderPB(resHeader);
        setSelectedKodeTermin(resHeader[0].kode_termin);
        setterminSelected(resHeader[0].nama_termin);
        setNamaSupp(resHeader[0].nama_relasi);
        setnamaRelasi(resHeader[0].nama_relasi);
        setnoSupp(resHeader[0].no_supp);
        setKontrak(resHeader[0].kontrak);
        setNoPB(resHeader[0].no_lpb);
        setKodePB(resHeader[0].kode_lpb);
        setKursPajak(resHeader[0].kurs_pajak);
        setnamaTermin(resHeader[0].nama_termin);

        setNopol(resHeader[0].nopol);
        setNoSj(resHeader[0].no_reff);
        setPengemudi(resHeader[0].pengemudi);
        setKodeGudang(resHeader[0].kode_gudang);
        setKodeSuppM(resHeader[0].kode_supp);
        setPersenDiskon(resHeader[0].diskon_dok);
        setNominalDiskon(resHeader[0].diskon_dok_rp);
        setTotalDiskonRP(parseFloat(resHeader[0].total_diskon_rp));
        setSelectedOptionPajak(resHeader[0].kena_pajak);
        // handlePajakChange(resHeader[0].kena_pajak); // HITUNG PAJAK JIKA ADA PAJAK
        setkodeAkunHutang(resHeader[0].kode_akun_hutang);
        setnoHutang(resHeader[0].no_hutang);
        setnamaHutang(resHeader[0].nama_hutang);
        setkodeAkunPajakBeli(resHeader[0].kode_akun_pajakbeli);
        setnoPajakBeli(resHeader[0].no_pajakbeli);
        setnamaPajakBeli(resHeader[0].nama_pajakbeli);
        settipePajakBeli(resHeader[0].tipe_pajakbeli);
        setkirimMU(resHeader[0].kirim_mu);
        setkurs(resHeader[0].kurs);
        settipeHutang(resHeader[0].tipe_hutang);

        // =============kurangnya==================
        setTglPB(resHeader[0].tgl_lpb);
        setTglSJ(resHeader[0].tgl_sj);
        setNoReff(resHeader[0].no_reff);
        setFOB(resHeader[0].fob);
        setFDO(resHeader[0].fdo);
        setPersediaan(resHeader[0].persediaan);
        setKeterangan(resHeader[0].keterangan); // belum isi field freetext
        setTotalBeratHeader(resHeader[0].total_berat);
        setStatus(resHeader[0].status);
        setUserID(resHeader[0].userid);
        setTglTrxLpb(resHeader[0].tgl_trxlpb);
        setKodeDokumen(resHeader[0].dokumen);
        setKodePajak(resHeader[0].kode_pajak);
        setVia(resHeader[0].via);
        setDateTglDokumen(resHeader[0].tgl_lpb);
        setDateTglDiterima(resHeader[0].tgl_trxlpb);
        setDateTglSj(resHeader[0].tgl_sj);
        setStatusExport(resHeader[0].status_export);
        setLpbkontrak(resHeader[0].kontrak);
        setKodeMu(resHeader[0].kode_mu);
        setKenaPajak(resHeader[0].kena_pajak);

        const responseListSupplier = await axios.get(`${apiUrl}/erp/supplier_pb?`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const keterangan = document.getElementById('keterangan') as HTMLInputElement;
        if (keterangan) {
            keterangan.value = resHeader[0].keterangan;
        }

        const responseSupplier = responseListSupplier.data.data;
        setListSupplier(responseSupplier);

        const resDetail = detailPraPB.data.data;
        console.log('resDetail dddd', resDetail);
        setKodeDept(resDetail[0].kode_dept);
        setKodeFpb(resDetail[0].kode_fpb);

        const parsedResDetail = resDetail.map((item: any) => ({
            ...item,
            // kode_pajak: null,
            // pajak: null,
            // include: 'N',
            // jumlah_mu: parseFloat(item.jumlah_mu),
            // jumlah_mu2: parseFloat(item.qty || 0) * (parseFloat(item.harga_mu || 0) - (parseFloat(item.diskon || 0) * parseFloat(item.harga_mu || 0)) / 100 - parseFloat(item.potongan_mu || 0)),
            // jumlah_mu: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
            // jumlah_rp: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
            jumlah_mu: parseFloat(item.qty || 0) * (parseFloat(item.harga_mu || 0) - (parseFloat(item.diskon || 0) * parseFloat(item.harga_mu || 0)) / 100 - parseFloat(item.potongan_mu || 0)),
            jumlah_rp: parseFloat(item.qty || 0) * (parseFloat(item.harga_mu || 0) - (parseFloat(item.diskon || 0) * parseFloat(item.harga_mu || 0)) / 100 - parseFloat(item.potongan_mu || 0)),
            harga_mu: parseFloat(item.harga_mu),
            berat: parseFloat(item.berat),
            diskon: item.diskon === '' ? frmNumber(0) : frmNumber(item.diskon),
            diskon_mu: item.diskon_mu === '' ? 0 : parseFloat(item.diskon_mu),
            potongan_mu: frmNumber(item.potongan_mu),
            nilai_pajak: 0,
        }));
        setData({ nodes: parsedResDetail });
        // console.log();
        // console.log('parsedResDetail', parsedResDetail);
        const totalJumlahMu = parsedResDetail.reduce((total: any, item: any) => {
            return total + parseFloat(item.jumlah_mu);
        }, 0);

        const totalBeratHeader = resDetail.reduce((total: any, detailItem: any) => total + parseFloat(detailItem.brt) * parseFloat(detailItem.qty), 0);
        setTotalBeratHeader(totalBeratHeader);

        setSubTotal(totalJumlahMu);
        let biayakirimpersen = (parseFloat(resHeader[0].kirim_mu) / totalJumlahMu) * 100;
        setPersenBiayaKirim(biayakirimpersen);

        if (resHeader[0].kena_pajak === 'N') {
            setValueNilaiDpp(0);
        } else if (resHeader[0].kena_pajak === 'I') {
            // let IncludeDPP = parseFloat(resHeader[0].total_rp) - parseFloat(resHeader[0].total_pajak_rp) - parseFloat(resHeader[0].diskon_dok_rp);
            let IncludeDPP = (totalJumlahMu - nominalDiskon) / 1.11;
            // let IncludeDPP = (totalJumlahMu - nominalDiskon) / 1.1;
            let NilaiPajak = (IncludeDPP * 11) / 100;
            // setTotalNilaiPajakRP(parseFloat(resHeader[0].total_pajak_rp));
            setTotalNilaiPajakRP(NilaiPajak);
            setValueNilaiDpp(IncludeDPP);
        } else if (resHeader[0].kena_pajak === 'E') {
            if (resHeader[0].diskon_dok) {
                // === 'E'
                //IKUT FAS PB
                // setTotalNilaiPajakRP(resHeader[0].total_pajak_rp - resHeader[0].total_pajak_rp * (parseFloat(resHeader[0].diskon_dok) / 100));
                //IKUT FAS PO
                let IncludeDPP = (totalJumlahMu - nominalDiskon) / 1.1;
                let NilaiPajak = (IncludeDPP * 10) / 100;
                setTotalNilaiPajakRP(NilaiPajak);
                setValueNilaiDpp(resHeader[0].total_rp - resHeader[0].diskon_dok_rp);
            } else {
                setValueNilaiDpp(resHeader[0].total_rp);
                setTotalNilaiPajakRP(resHeader[0].total_pajak_rp);
            }
        }

        const responseListEkspedisi = await axios.get(`${apiUrl}/erp/list_ekspedisi?`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const responseEkspedisi = responseListEkspedisi.data.data;
        setListEkspedisi(responseEkspedisi);

        // const responseListGudang = await axios.get(`${apiUrl}/erp/list_gudang_forfilter?`, {
        //     params: {
        //         entitas: kode_entitas,
        //         param1: kode_user, // sementara userid
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

        const responseListPajak = await axios.get(`${apiUrl}/erp/nilai_pajak`, {
            params: {
                entitas: kode_entitas,
            },
        });

        const responseListNilaiPajak = responseListPajak.data;
        setApiResponseSelectNilaiPajak(responseListNilaiPajak);

        await FillFromSQL(kode_entitas, 'departemen')
            .then((result: any) => {
                setListDepartemen(result);
                // console.log(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        try {
            //FILE PENDUKUNG
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

            // console.log('filependukungPO.data.data');
            // console.log(filependukungPO.data.data);
            setSelectedFilesPO(filependukungPO.data.data);
            // setSelectedFilesPO(filependukungPO.data.data);
        } catch (error) {
            console.log(error);
        }
        // setautoJurnalEkse(true);
        if (routeStatusValue === 'terfaktur') {
            var detailJurnal = await axios.get(`${apiUrl}/erp/jurnal_by_kodedokumen?`, {
                params: {
                    entitas: kode_entitas,
                    param1: routeKodePBValue,
                },
            });

            const response = detailJurnal.data.data;
            const parsedResDetailJurnal = response.map((item: any) => ({
                ...item,
                debet_rp: frmNumber(item.debet_rp),
                kredit_rp: frmNumber(item.kredit_rp),
                // Perubahan tanggal 2025-07-17
                jumlah_mu: item.debet_rp > 0 ? frmNumber(item.debet_rp) : frmNumber(item.kredit_rp * -1),
                jumlah_rp: item.debet_rp > 0 ? frmNumber(item.debet_rp) : frmNumber(item.kredit_rp * -1),

                // // jumlah_mu: frmNumber(item.jumlah_mu),
                // jumlah_mu: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
                // jumlah_rp: parseFloat(item.qty) * (parseFloat(item.harga_mu) - (parseFloat(item.diskon) * parseFloat(item.harga_mu)) / 100 - parseFloat(item.potongan_mu)),
                // // jumlah_rp: frmNumber(item.jumlah_rp),
                // // jumlah_rp: item.qty * (item.harga_mu - item.diskon_mu - item.potongan_mu),
                // // jumlah_mu: parseFloat(item.jumlah_mu),
                // // harga_mu: parseFloat(item.harga_mu),
                // // berat: parseFloat(item.berat),
                // // diskon: item.diskon === '' ? frmNumber(0) : frmNumber(item.diskon),
                // // diskon_mu: item.diskon_mu === '' ? 0 : parseFloat(item.diskon_mu),
                // // potongan_mu: frmNumber(item.potongan_mu),
                // // nilai_pajak: 0,
            }));
            // console.log('parsedResDetailJurnal = ', parsedResDetailJurnal);

            setDataJurnal({ nodes: parsedResDetailJurnal });
        } else {
            setautoJurnalEkse(true);
        }
    };

    if (isLoading) {
        return;
    }

    const selectNilaiPajak = apiResponseSelectNilaiPajak.data.map((item: any) => ({
        kode_pajak: item.kode_pajak,
        nilai: item.nilai,
        catatan: item.catatan,
    }));
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // useEffect(() => {
    //     const fetchData = async () => {
    //         // if (!mounted.current) {
    //         //     mounted.current = true;

    //         // handleSubmitJurnal();
    //         autojurnal();
    //         // } else {
    //         // }
    //     };
    //     fetchData();
    // }, [kode_entitas]);

    const handleSelectOnChange = (e: any, tipe: any) => {
        const selectedValue = e.target.value;
        if (tipe === 'kode_gudang') {
            setKodeGudang(selectedValue);
        } else if (tipe === 'via') {
            setVia(selectedValue);
        } else if (tipe === 'dokumen') {
            setKodeDokumen(selectedValue);
        }
    };

    const handleSelectedTermin = (selectedData: any, selectedNamaTermin: any) => {
        setSelectedKodeTermin(selectedData);
        setterminSelected(selectedNamaTermin);
    };

    const handleUpdate = (value: any, id_lpb: any, property: any, option: any) => {
        let value2: any;
        if (value.includes(',')) {
            value2 = parseFloat(tanpaKoma(value));
        } else {
            value2 = value;
        }
        console.log(value + id_lpb + property + option);
        if (value !== null && value !== undefined && value !== '') {
            setBlockingJurnal(true); // blocking jurnal saat ada perubahan
            setData((state: any) => {
                const updatedNodes = state.nodes.map((node: any) => {
                    let harga = parseFloat(node.harga_mu);
                    // let harga = parseFloat(node.harga_mu);
                    let qty = parseFloat(node.qty);
                    let diskon = node.diskon === '' ? 0 : parseFloat(node.diskon);
                    let potongan_mu = node.potongan_mu === '' ? 0 : parseFloat(tanpaKoma(node.potongan_mu));
                    let diskon_mu;

                    if (node.id_lpb === id_lpb) {
                        if (property === 'harga_mu') {
                            if (property === 'harga_mu' && value2 <= 0) {
                                alert('Harga tidak boleh kurang atau sama dengan nol.');
                            }
                            harga = value === '' ? 0 : parseFloat(tanpaKoma(value));
                            diskon_mu = harga * (diskon / 100);
                            const harga_mu = document.getElementById('harga_mu' + node.id_lpb) as HTMLInputElement;
                            if (harga_mu) {
                                harga_mu.value = frmNumber(harga);
                            }
                        } else if (property === 'diskon') {
                            diskon = value === '' ? 0 : parseFloat(tanpaKoma(value));
                            diskon_mu = harga * (diskon / 100);
                            const diskon_ui = document.getElementById('diskon_ui' + node.id_lpb) as HTMLInputElement;
                            if (diskon_ui) {
                                diskon_ui.value = frmNumber(diskon);
                            }
                            if (diskon_mu >= node.jumlah_mu) {
                                alert('Diskon tidak boleh melebihi Total harga.');
                            }
                        } else if (property === 'potongan_mu') {
                            potongan_mu = value === '' || value === '0' || value === null ? 0 : parseFloat(tanpaKoma(value));
                            diskon_mu = harga * (diskon / 100);
                            const potongan = document.getElementById('potongan_mu' + node.id_lpb) as HTMLInputElement;
                            if (potongan) {
                                potongan.value = frmNumber(potongan_mu);
                            }
                            if (potongan_mu >= node.jumlah_mu) {
                                alert('Potongan tidak boleh melebihi Total harga.');
                            }
                        } else if (property === 'pajak') {
                            diskon_mu = harga * (diskon / 100);
                            let nilai_pajak = parseInt(value);

                            let jumlah_mu = parseFloat(node.jumlah_mu);
                            let totNilaiPajak;

                            if (option === 'N') {
                                totNilaiPajak = 0;
                            } else if (option === 'E') {
                                // alert('diekse');
                                let jumlah_mu_diskon = (jumlah_mu * persenDiskon) / 100;
                                totNilaiPajak = ((jumlah_mu - jumlah_mu_diskon) * nilai_pajak) / 100;
                            } else if (option === 'I') {
                                if (nilai_pajak === 10) {
                                    // totNilaiPajak = ((100 / 110) * jumlah_mu*nilai_pajak) / 100;
                                    let jumlah_mu_diskon = (jumlah_mu * persenDiskon) / 100;
                                    totNilaiPajak = ((jumlah_mu - jumlah_mu_diskon) / 1.1) * 0.1;
                                } else if (nilai_pajak === 11) {
                                    // totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                                    let jumlah_mu_diskon = (jumlah_mu * persenDiskon) / 100;
                                    totNilaiPajak = ((jumlah_mu - jumlah_mu_diskon) / 1.11) * 0.11;
                                } else {
                                    totNilaiPajak = 0;
                                }
                            } else {
                                totNilaiPajak = 0;
                            }

                            var kode_pajak;

                            if (nilai_pajak === 0) {
                                kode_pajak = 'N';
                            } else if (nilai_pajak === 10) {
                                kode_pajak = 'S';
                            } else if (nilai_pajak === 11) {
                                kode_pajak = 'T';
                            }

                            return {
                                ...node,
                                [property]: value,
                                kode_pajak: kode_pajak,
                                pajak_mu: totNilaiPajak,
                                include: option,
                            };
                        }

                        let nilai_diskon = harga * (diskon / 100);
                        // let harga_diskon = harga - nilai_diskon;
                        // let harga_diskon_potongan = harga - potongan_mu;
                        // let jumlah_normal = qty * harga;
                        let jumlah = qty * (harga - nilai_diskon - potongan_mu);

                        // if(property === 'harga'){
                        //      diskon_mu = harga * (diskon / 100);
                        // }

                        if (property === 'potongan_mu') {
                            return { ...node, [property]: value, jumlah_mu: jumlah, jumlah_rp: jumlah, diskon_mu: diskon_mu };
                        } else {
                            return { ...node, [property]: parseFloat(tanpaKoma(value)), jumlah_mu: jumlah, jumlah_rp: jumlah, diskon_mu: diskon_mu };
                        }
                    } else {
                        return node;
                    }
                });

                const totalJumlahMu = updatedNodes.reduce((total: any, item: any) => {
                    return total + parseFloat(item.jumlah_mu);
                }, 0);

                const totalPajakRP = updatedNodes.reduce((total: any, item: any) => {
                    return total + parseFloat(item.pajak_mu);
                }, 0);

                const totalDiskonRP = updatedNodes.reduce((total: any, item: any) => {
                    return total + parseFloat(item.diskon_mu);
                }, 0);

                const totalPotonganRP = updatedNodes.reduce((total: any, item: any) => {
                    return total + parseFloat(item.potongan_mu);
                }, 0);

                setSubTotal(totalJumlahMu);
                setTotalDiskonRP(totalDiskonRP);
                setTotalPotonganRP(totalPotonganRP);
                if (option === 'N') {
                    setValueNilaiDpp(0);
                } else if (option === 'I') {
                    let IncludeDPP = totalJumlahMu - totalPajakRP - nominalDiskon;
                    setTotalNilaiPajakRP(totalPajakRP);
                    // setValueNilaiDpp(IncludeDPP);
                    setValueNilaiDpp(IncludeDPP);
                    // console.log(totalJumlahMu);
                } else if (option === 'E') {
                    // console.log('masuk EEE');
                    if (persenDiskon) {
                        // IKUT FAS PB
                        // setTotalNilaiPajakRP(totalPajakRP - totalPajakRP * (persenDiskon / 100));
                        // IKUT FAS PO
                        setTotalNilaiPajakRP(totalPajakRP);
                        setValueNilaiDpp(totalJumlahMu - nominalDiskon);
                    } else {
                        setValueNilaiDpp(totalJumlahMu);
                        setTotalNilaiPajakRP(totalPajakRP);
                    }
                }
                // handleTerbilang(totalJumlahMu);

                // console.log(updatedNodes);

                return {
                    ...state,
                    nodes: updatedNodes,
                };
            });
        } else {
            console.log('String kosong');
            setData((state: any) => {
                const updatedNodes = state.nodes.map((node: any) => {
                    if (node.id_lpb === id_lpb) {
                        return { ...node, [property]: 0, jumlah_mu: 0, jumlah_rp: 0 };
                    }
                    return node;
                });

                return {
                    ...state,
                    nodes: updatedNodes,
                };
            });
        }
    };

    const handleUpdateJurnal = (value: any, id_dokumen: any, property: any) => {
        setBlockingJurnal(false); // unblocking jurnal
        let value2: any;

        if (value.includes(',')) {
            value2 = parseFloat(tanpaKoma(value));
        } else {
            value2 = value;
        }
        if (value2 === '0.00') {
            console.log('nothing');
        } else {
            // console.log('🚀 ~ handleUpdateJurnal ~ value:', value);
            setDataJurnal((state: any) => {
                const updatedNodes = state.nodes.map((node: any) => {
                    if (node.id_dokumen === id_dokumen) {
                        if (property === 'debet_rp') {
                            const debet_rp = document.getElementById('debet_rp' + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById('kredit_rp' + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById('jumlah_mu' + node.id_dokumen) as HTMLInputElement;
                            if (debet_rp) {
                                // if (value.includes(',')) {
                                // debet_rp.value = value2;
                                // kredit_rp.value = '0.00';
                                // jumlah_mu.value = value2;
                                // } else {
                                debet_rp.value = frmNumber(value2);
                                kredit_rp.value = frmNumber(0);
                                jumlah_mu.value = frmNumber(value2);
                                // }
                            }
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                kredit_rp: '0.00',
                                jumlah_mu: frmNumber(value2),
                                jumlah_rp: frmNumber(value2),
                            };
                        }
                        if (property === 'kredit_rp') {
                            // console.log(node.kredit_rp);
                            const debet_rp = document.getElementById('debet_rp' + node.id_dokumen) as HTMLInputElement;
                            const kredit_rp = document.getElementById('kredit_rp' + node.id_dokumen) as HTMLInputElement;
                            const jumlah_mu = document.getElementById('jumlah_mu' + node.id_dokumen) as HTMLInputElement;

                            if (kredit_rp) {
                                // if (value.includes(',')) {
                                //     debet_rp.value = '0.00';
                                //     kredit_rp.value = value;
                                //     jumlah_mu.value = '-' + value;
                                // } else {
                                debet_rp.value = frmNumber(0);
                                kredit_rp.value = frmNumber(value2);
                                jumlah_mu.value = frmNumber(value2 * -1);
                                // }
                            }
                            let jumlah_mu_modified;
                            if (jumlah_mu_modified === -0) {
                                jumlah_mu_modified = 0;
                            } else {
                                jumlah_mu_modified = value2 * -1;
                            }
                            console.log(jumlah_mu_modified);
                            return {
                                ...node,
                                [property]: frmNumber(value2),
                                debet_rp: '0.00',
                                jumlah_mu: frmNumber(jumlah_mu_modified),
                                jumlah_rp: frmNumber(jumlah_mu_modified),
                            };
                        }
                        // return {
                        //     ...node,
                        //     [property]: value,
                        //     jumlah_mu: value,
                        //     jumlah_rp: value,
                        // };
                    }
                    return node;
                });
                return {
                    ...state,
                    nodes: updatedNodes,
                };
            });
        }
    };

    const handleSubmit = (event: any) => {
        const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;

        const newNode = {
            id,
            name: '',
            deadline: new Date(),
            type: 'LEARN',
            isComplete: false,
            titleA: '',
            titleB: '',
            task: null,
        };

        const hasEmptyFields = data.nodes.some((row: { name: string }) => row.name === '');

        if (!hasEmptyFields) {
            setData((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        } else {
            alert('Harap isi task sebelum tambah data');
        }

        event.preventDefault();
    };

    // console.log(data, 'data');

    const handleRemove = (id_sp: any) => {
        // if (data.nodes.length === 0) {
        //     alert('Tidak bisa menghapus row data terakhir, sisakan setidaknya 1 row data untuk ditampilkan');
        // } else {
        setData((state) => ({
            ...state,
            nodes: state.nodes.filter((node: any) => node.id_sp !== id_sp),
        }));
        // }
    };

    const GetEntitasFromFPB = async (kodeEntitas: any, kodeFpb: any) => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_fpb?`, {
            params: {
                entitas: kodeEntitas,
                param1: kodeFpb,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        // console.log({ entitas: kodeEntitas, param1: kodeFpb });
        // console.log('response.data.data', response.data.data);
        return response.data.data;
    };

    const GetNamaGudang = async (kodeEntitas: any, kode_gudang: any) => {
        const response = await axios.get(`${apiUrl}/erp/id_master_gudang?`, {
            params: {
                entitas: kodeEntitas,
                kode_gudang: kode_gudang,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('response namaGudang 1', response);
        // console.log('response namaGudang 2', response.data);
        // console.log('response namaGudang 3', response.data.data[0].nama_gudang);

        const namaGudang = response.data.data[0].nama_gudang;
        // console.log('response namaGudang 3', namaGudang);

        return namaGudang;
    };

    const ApiBatal = async (batal: any, kodeLpb: any) => {
        const modifiedData = {
            entitas: kode_entitas,
            kode_lpb: kodeLpb,
        };

        return await axios.post(`${apiUrl}/erp/batal_approval`, modifiedData);
    };

    const showWarning = (message: string) => {
        Swal.fire({
            title: 'Warning',
            text: `${message}`,
            icon: 'warning',
            target: '#approvalPB',
        });
    };
    const filterFDO = useRef(0);
    const prosesBloking = async (auth: any) => {
        let descriptionsItemStokOpname: any = [];
        let hasil = false;
        let resultBlok: any;
        let resultBlokOpname: any;
        //BLOCKING

        // // Cek Backdate 14 hari
        // // Fungsi pengecekan tanggal
        // const today = moment().startOf('day'); // Hari ini
        // const chosenDate = moment(dateTglDiterima).startOf('day'); // Tanggal yang dipilih / dari input
        // const diffDays = chosenDate.diff(today, 'days'); // Selisih dalam hari

        // const cekEntitasPajak = await entitaspajak(kode_entitas, userid);
        // const resultCekUserApp: any[] = await CekUserApp(kode_entitas, userid);
        // const allowBackdate = resultCekUserApp?.[0]?.app_backdate === 'Y';
        // const isAdmin = userid === 'administrator';

        // console.log('resultCekUserApp = ', resultCekUserApp, cekEntitasPajak, isAdmin, allowBackdate);
        // console.log({
        //     today,
        //     chosenDate,
        //     cekEntitasPajak,
        //     isAdmin,
        //     allowBackdate,
        //     diffDays,
        //     resultCekUserApp,
        // });

        // // Lakukan validasi hanya jika bukan entitas pajak dan bukan admin
        // if (cekEntitasPajak === 'false' && !isAdmin && !allowBackdate) {
        //     // Backdate > 14 hari
        //     if (diffDays < -14) {
        //         showWarning('Tanggal tidak boleh lebih dari 14 hari sebelum tanggal hari ini.');
        //         return;
        //     }

        //     // Future date > 3 hari
        //     if (diffDays > 3) {
        //         showWarning('Tanggal tidak boleh lebih dari 3 hari setelah tanggal hari ini.');
        //         return;
        //     }
        // }

        // ================ JURNAL ==========================================
        // console.log(dataJurnal.nodes);
        const modifiedDataJurnal = {
            ...dataJurnal,
            nodes: dataJurnal.nodes.map((node: any) => ({
                ...node,
                debet_rp: parseFloat(tanpaKoma(node.debet_rp)),
                kredit_rp: parseFloat(tanpaKoma(node.kredit_rp)),
                jumlah_mu: parseFloat(tanpaKoma(node.jumlah_mu)) === -0 ? 0 : parseFloat(tanpaKoma(node.jumlah_mu)),
                jumlah_rp: parseFloat(tanpaKoma(node.jumlah_rp)) === -0 ? 0 : parseFloat(tanpaKoma(node.jumlah_rp)),
            })),
        };

        // CEK DETAIL PAJAK
        let S_blockingDetailPajak = false;
        const cekDetailPajak = async () => {
            const results = await Promise.all(
                data.nodes.map(async (detail: any) => {
                    if (selectedOptionPajak !== 'N' && detail.kode_pajak === 'N') {
                        return true;
                    } else {
                        return false;
                    }
                })
            );
            return results.some((result) => result === true);
        };

        try {
            S_blockingDetailPajak = await cekDetailPajak();
        } catch (error) {
            console.error('Error Gudang:', error);
        }

        let descriptions: any = [];

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
                    // console.log('MASUK SINI');
                    hasil = true;
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

        if (S_blockingDetailPajak) {
            console.log('Masuk saveDoc Tidak 4');
            Swal.fire({
                title: 'Pajak',
                text: 'Terdapat perbedaan data pajak pada barang.',
                icon: 'warning',
                target: '#approvalPB',
            });
            return;
        }

        if ((modifiedDataJurnal.nodes.length === 1 && modifiedDataJurnal.nodes[0].jumlah_mu === 0) || modifiedDataJurnal.nodes[0].jumlah_mu === 0) {
            // console.log('SILAHKAN AUTO JURNAL DULU');
            // alert('BLOCKING SILAHKAN AUTO JURNAL DULU');
            console.log('Masuk saveDoc Tidak 5');
            Swal.fire({
                title: 'Jurnal',
                text: 'Silahkan Lakukan Auto Jurnal Terlebih dulu.',
                icon: 'warning',
                target: '#approvalPB',
            });
            return;
        }

        if (blockingJurnal === true) {
            console.log('Masuk saveDoc Tidak 6');
            Swal.fire({
                title: 'Jurnal',
                text: 'Terdapat Perubahan Data Silahkan Lakukan Auto Jurnal Terlebih dulu.',
                icon: 'warning',
                target: '#approvalPB',
            });

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
                } else if (stok < 100 && opnameData.length <= 0 && blockingGudang === true) {
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

        if (fdo === 'default' || fdo === null || fdo === '') {
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

            const result = await Swal.fire({
                title: 'Warning',
                html: `Barang untuk direalisasikan ke cabang?`,
                icon: 'warning',
                target: '#approvalPB',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            });

            if (result.isConfirmed) {
                if (resultBlok === 2) {
                    setModalLogin(true);
                } else if (resultBlokOpname === 1) {
                    filterFDO.current = 1;
                    saveDoc('');
                    console.log('Masuk Bloking resultBlokOpname 1');
                } else if (resultBlok === 3) {
                    console.log('OK, Lanjut stok opname');
                } else {
                    filterFDO.current = 1;
                    saveDoc('');
                    console.log('Masuk Bloking Noraml 1');
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                filterFDO.current = 0;
saveDoc('');
                setFDO('');
                // break; // stop loop
            }
            return;
        }

        if (fdo === 'P') {
            if (resultBlok === 2) {
                setModalLogin(true);
            } else if (resultBlokOpname === 1) {
                filterFDO.current = 2;
                saveDoc('');
                console.log('Masuk Bloking resultBlokOpname 1');
            } else if (resultBlok === 3) {
                console.log('OK, Lanjut stok opname');
            } else {
                filterFDO.current = 2;
                saveDoc('');
                console.log('Masuk Bloking Noraml 1');
            }
            return;
        }
    };

    const backPage = () => {
        const encode = Buffer.from(
            `vPbKontrak=${routeSelectedOptionRadio}&vStatus=${routeSelectedStatus}&vNamaBarang=${routeNamaBarangValue}&vKodeGudang=${routeSelectedGudang}&vSupp=${routeSupplierValue}&vNoSJ=${routeNoSJValue}&vNoPB=${routeNoPBValue}&vTipeDokumen=${routeTipeDokumen}&tglAwal=${routeTglAwal}&tglAkhir=${routeTglAkhir}&tglSjSuppAwal=${routeTglSjSuppAwal}&tglSjSuppAkhir=${routeTglSjSuppAkhir}`
        ).toString('base64');
        router.push({ pathname: './pblist', query: { str: encode } });
    };

    // const saveDoc = async (auth: any) => {
    //     console.log('Log SaveDoc');
    // };

    // untuk penggunaan usestate get detail, ambil params where saja masuk state
    const saveDoc = async (auth: any) => {
        // // ================ JURNAL ==========================================
        // // console.log(dataJurnal.nodes);
        const modifiedDataJurnal = {
            ...dataJurnal,
            nodes: dataJurnal.nodes.map((node: any) => ({
                ...node,
                debet_rp: parseFloat(tanpaKoma(node.debet_rp)),
                kredit_rp: parseFloat(tanpaKoma(node.kredit_rp)),
                jumlah_mu: parseFloat(tanpaKoma(node.jumlah_mu)) === -0 ? 0 : parseFloat(tanpaKoma(node.jumlah_mu)),
                jumlah_rp: parseFloat(tanpaKoma(node.jumlah_rp)) === -0 ? 0 : parseFloat(tanpaKoma(node.jumlah_rp)),
            })),
        };

        let totalNettoRP = 0;
        let totalPajak = 0;
        let kirim = 0;
        if (selectedOptionPajak === 'N') {
            totalNettoRP = subTotal + kirimMU - nominalDiskon;
            totalPajak = totalNilaiPajakRP;
            setTotalPajakSet(totalPajak);
            // setTotalNettoRPSet(totalNettoRP);
            totalNettoRPSetRef.current = totalNettoRP;
            kirim = (kirimMU / totalNettoRP) * 100;
        } else if (selectedOptionPajak === 'I') {
            let IncludeDPP = subTotal - nominalDiskon;
            totalNettoRP = IncludeDPP + kirimMU - nominalDiskon;
            totalPajak = totalNilaiPajakRP;
            setTotalPajakSet(totalPajak);
            // setTotalNettoRPSet(totalNettoRP);
            totalNettoRPSetRef.current = totalNettoRP;
            kirim = (kirimMU / totalNettoRP) * 100;
        } else if (selectedOptionPajak === 'E') {
            if (nominalDiskon) {
                //IKUT FAS PB
                // totalPajak = totalNilaiPajakRP - totalNilaiPajakRP * (persenDiskon / 100);
                // IKUT FAS PO
                totalPajak = totalNilaiPajakRP;
                setTotalPajakSet(totalNilaiPajakRP);
                totalNettoRP = subTotal - nominalDiskon + totalPajak + kirimMU;
                // setTotalNettoRPSet(totalNettoRP);
                // setTotalNettoRPSet(totalNettoRP);
                totalNettoRPSetRef.current = totalNettoRP;
                kirim = (kirimMU / totalNettoRP) * 100;
            } else {
                totalPajak = totalNilaiPajakRP;
                setTotalPajakSet(totalPajak);
                totalNettoRP = subTotal + totalPajak + kirimMU;
                // setTotalNettoRPSet(totalNettoRP);
                totalNettoRPSetRef.current = totalNettoRP;
                kirim = (kirimMU / totalNettoRP) * 100;
            }
        }

        const modifiedData = {
            entitas: kode_entitas,
            no_lpb: noPB,
            kode_lpb: kodePB,
            tgl_lpb: TglPB, //moment().format('YYYY-MM-DD HH:mm:ss'), //TglPB,
            tgl_sj: TglSJ,
            no_reff: NoReff,
            dokumen: dokumen,
            kode_gudang: kodeGudang,
            kode_supp: kodeSuppM,
            fob: FOB,
            via: via,
            pengemudi: pengemudi,
            nopol: nopol,
            persediaan: Persediaan, // default
            total_rp: subTotal,
            total_diskon_rp: totalDiskonRP + totalPotonganRP,
            total_pajak_rp: totalPajak,
            netto_rp: totalNettoRP,
            keterangan: Keterangan,
            total_berat: totalBeratHeader,
            // status: routeStatusValue === 'terbuka' ? 'Approval_Flag' : 'Approval', // kondisi models API
            status: 'Approval',
            userid: UserID,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kirim: kirim,
            kirim_mu: kirimMU,
            diskon_dok: persenDiskon === null ? 0 : persenDiskon,
            diskon_dok_rp: nominalDiskon === null ? 0 : nominalDiskon,
            kena_pajak: selectedOptionPajak,
            kode_termin: selectedKodeTermin,
            kontrak: kontrak,
            // status_export
            // fdo: 'P', //fdo,
            fdo: filterFDO.current === 0 ? null : filterFDO.current === 1 ? 'P' : fdo,
            no_pralpb: noPB,
            tgl_trxlpb: TglTrxLpb,
            tgl_pralpb: TglPB,
            // status_dok
            // no_pralpb
            // tgl_pralpb
            // detail: data.nodes,
            detail: data.nodes.map((data: any, index) => ({
                ...data,
                potongan_mu: parseFloat(tanpaKoma(data.potongan_mu)),
                // qty_sisa: data.qty_std - data.qty,
            })),
            // detail_jurnal: modifiedDataJurnal.nodes.map((data: any, index) => ({
            jurnal: modifiedDataJurnal.nodes.map((data: any, index) => ({
                ...data,
                kode_dokumen: kodePB,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_valuta: null,
                tgl_rekonsil: null,
                no_warkat: null,
                kode_kerja: null,
                audit: null,
                kode_kry: null,
                kode_jual: null,
                no_kontrak_um: null,
                userid: userid,
            })),
            // detail_jurnal: modifiedDataJurnal.nodes,
        };

        console.log('modifiedData = ', modifiedData);

        const hasEmptyFields = dataJurnal.nodes.some((row: { no_akun: string }) => row.no_akun === '');
        if (hasEmptyFields) {
            Swal.fire({
                title: 'Harap isi Semua Data Sebelum Melakukan Simpan Data.',
                icon: 'error',
                target: '#approvalPB',
            });
            throw 'exit';
        } else if (selisih !== 0) {
            Swal.fire({
                title: 'Selisih',
                text: 'Terdapat nilai selisih antara Debit dan Kredit',
                icon: 'error',
                target: '#approvalPB',
            });
            throw 'exit';
        } else {
            // await ExportNonKontrakCabang(modifiedData)
            //     .then(async (result: any) => {
            //         // console.log('ExportNonKontrakCabang ', result);
            //         // const responseExportNonKontrak = await axios.post(`${apiUrl}/erp/exportnonkontrak`, result);

            //         console.log('modifiedData = ', modifiedData, result);
            //         // console.log('totalNettoRPSet = ', totalNettoRPSet, (totalNettoRPSet * kurs - 0) * kurs);
            //         // console.log('sTotalJumlahMuPusat = ', sTotalJumlahMuPusat, (sTotalJumlahMuPusat * kurs + potonganFJPusat) * kurs);
            //     })
            //     .catch((e: any) => {
            //         console.log('error', e.response);
            //     });

            // SAVE DOC
            try {
                // router.push('./fb');
                console.log('transaksi otomatis 2');
                setTransaksiOtomatis(true);
                try {
                    setShowLoader(true);

                    const response = await axios.patch(`${apiUrl}/erp/update_approval_pb`, modifiedData);
                    let responseExportNonKontrakCabangApi: any;
                    let responseExportKontrakPusatApi: any;
                    // console.log('response ', response);
                    if (response.data.status === true) {
                        //     Await the validation approval
                        await validasiApproval().then(async (result: any) => {
                            console.log('awer = ', result);

                            // console.log('reslrtttcccc ', result);
                            // throw exitCode;
                            if (result === 'exportNonKontrak') {
                                console.log('masuk exportNonKontrak');
                                await ExportNonKontrakCabang(modifiedData)
                                    .then(async (result: any) => {
                                        console.log('ExportNonKontrakCabang ', result);
                                        // const responseExportNonKontrak = await axios.post(`${apiUrl}/erp/exportnonkontrak`, result);
                                        const responseExportNonKontrak = await axios
                                            .post(`${apiUrl}/erp/exportnonkontrak`, result, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            })
                                            .then(async (result) => {
                                                // console.log('exportnonkontrak ', result);
                                                responseExportNonKontrakCabangApi = result.data;
                                                console.log('responseExportNonKontrakCabangApi', responseExportNonKontrakCabangApi);
                                                if (result) {
                                                    const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeFB !== '') {
                                                        await generateNU(kode_entitas, sNoFBCabangBeli, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeSPM !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoSpmCabangBeli, sSoKodeJual, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJual);
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeSJ !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoSjCabangBeli, sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeFJ !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoFjCabangBeli, sSoKodeJual, '13', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
                                                    }
                                                    //GENERATE NO DOKUMEN PUSAT SETELAH APPROVE BERHASIL
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodePB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoPBPusat, '04', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeFB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoFBPusat, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeSPM !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoSpmPusat,
                                                            sSoKodeJualPusat,
                                                            '11',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + sSoKodeJualPusat
                                                        );
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeSJ !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoSjPusat,
                                                            sSoKodeJualPusat,
                                                            '12',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + `${sSoKodeJualPusat}`
                                                        );
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeFJ !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoFjPusat,
                                                            sSoKodeJualPusat,
                                                            '13',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + `${sSoKodeJualPusat}`
                                                        );
                                                    }
                                                }
                                            })
                                            .catch((e: any) => {
                                                responseExportNonKontrakCabangApi = e.response;
                                            });
                                        // console.log('responseExportNonKontrak', responseExportNonKontrakCabangApi);
                                        // if (responseExportNonKontrak !== undefined) {
                                        // console.log('responseExportNonKontrakCabangApi', responseExportNonKontrakCabangApi);
                                        if (responseExportNonKontrakCabangApi.status === true) {
                                            const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                                entitas: kode_entitas,
                                                kode_audit: null,
                                                dokumen: 'PB',
                                                kode_dokumen: kodePB,
                                                no_dokumen: noPB,
                                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                proses: 'EDIT',
                                                diskripsi: `Approval PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${totalNettoRP.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                userid: userid, // userid login web
                                                system_user: '', //username login
                                                system_ip: '', //ip address
                                                system_mac: '', //mac address
                                            });
                                            myAlertGlobal2(`Approval dan Export Dokumen PB Berhasil' ${response.status}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        } else {
                                            myAlertGlobal2(`Gagal Approval PB 4 : ${responseExportNonKontrakCabangApi.data.error}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        backPage();
                                                    }, 1000);
                                                    // setTimeout(async () => {
                                                    //     const response: any = await ApiBatal('Approval', kodePB);
                                                    //     if (response.data.status === true) {
                                                    //         // console.log(response.data.status);
                                                    //         Swal.fire({
                                                    //             title: `Terjadi kesalahan PB 4`,
                                                    //             text: 'Gagal menyimpan PB. Silakan coba lagi.',
                                                    //             icon: 'error',
                                                    //         }).then(() => {
                                                    //             // Reload halaman
                                                    //             setTimeout(() => {
                                                    //                 //   closeDialog();
                                                    //                 window.location.href = './pblist';
                                                    //                 router.push('./pblist');
                                                    //             }, 1000);
                                                    //             // window.location.reload();
                                                    //         });
                                                    //     } else {
                                                    //         console.error('Respons tidak valid');
                                                    //     }
                                                    // }, 1000);
                                                }
                                            });
                                        }
                                    })
                                    .catch((e: any) => {
                                        console.log('error', e);
                                        myAlertGlobal2(`Approval Dokumen PB Berhasil' ${response.status}`, 'approvalPB').then((result) => {
                                            if (result.isConfirmed) {
                                                setTimeout(() => {
                                                    //   closeDialog();
                                                    backPage();
                                                }, 1000);
                                            }
                                        });
                                    });
                            } else if (result === 'exportKontrakPusat') {
                                console.log('masuk exportKontrakPusat');
                                await ExportKontrakPusat(modifiedData)
                                    .then(async (result: any) => {
                                        console.log('result ExportKontrakPusat', result);
                                        // const responseExportNonKontrak = await axios.post(`${apiUrl}/erp/exportnonkontrak`, result);
                                        const responseExportKontrakPusat = await axios
                                            .post(`${apiUrl}/erp/exportkontrak`, result, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            })
                                            .then(async (result) => {
                                                console.log('result ssss', result);
                                                responseExportKontrakPusatApi = result.data;
                                                if (result) {
                                                    const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
                                                    if (responseExportKontrakPusatApi.kodeDokumenPembeli?.kodeFB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoFBKontrakPusat, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportKontrakPusatApi.kodeDokumenPembeli?.kodeSPM !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoMBKontrakPusat, '23', moment().format('YYYYMM'));
                                                    }
                                                }
                                            })
                                            .catch((e: any) => {
                                                responseExportKontrakPusatApi = e.response;
                                            });
                                        console.log('responseExportKontrakPusat', responseExportKontrakPusat);
                                        if (responseExportKontrakPusatApi.status === true) {
                                            const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                                entitas: kode_entitas,
                                                kode_audit: null,
                                                dokumen: 'PB',
                                                kode_dokumen: kodePB,
                                                no_dokumen: noPB,
                                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                proses: 'EDIT',
                                                diskripsi: `Approval PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${totalNettoRP.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                userid: userid, // userid login web
                                                system_user: '', //username login
                                                system_ip: '', //ip address
                                                system_mac: '', //mac address
                                            });
                                            myAlertGlobal2(`Approval dan Export Dokumen PB Berhasil' ${responseExportKontrakPusatApi.message}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        } else {
                                            myAlertGlobal2(`Gagal Approval PB 5 : ${responseExportKontrakPusatApi.data.error}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        }
                                    })
                                    .catch((e: any) => {
                                        console.log('error', e.response);
                                    });
                            } else if (result === 'cekPoDariPB') {
                                // console.log('masukkkkk');
                                myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat belum di Apporved', 'approvalPB').then((result) => {
                                    if (result.isConfirmed) {
                                        try {
                                            setTimeout(async () => {
                                                const response: any = await ApiBatal('Approval', kodePB);
                                                if (response.data.status === true) {
                                                    // console.log(response.data.status);
                                                    Swal.fire({
                                                        title: 'Data Approval PB Berhasil di Rollback',
                                                        icon: 'success',
                                                        target: '#approvalPB',
                                                    }).then(() => {
                                                        // Reload halaman
                                                        setTimeout(() => {
                                                            //   closeDialog();
                                                            // window.location.href = './pblist';
                                                            // router.push('./pblist');
                                                            backPage();
                                                        }, 1000);
                                                        // window.location.reload();
                                                    });
                                                } else {
                                                    console.error('Respons tidak valid');
                                                }
                                            }, 1000);
                                        } catch (error) {
                                            console.error('Terjadi kesalahan:', error);
                                            Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                                        }
                                    }
                                });
                            } else if (result === 'cekPoDariPB tidak tersedia') {
                                // console.log('masukkkkk');
                                myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat tidak tersedia', 'approvalPB').then((result) => {
                                    if (result.isConfirmed) {
                                        try {
                                            setTimeout(async () => {
                                                const response: any = await ApiBatal('Approval', kodePB);
                                                if (response.data.status === true) {
                                                    // console.log(response.data.status);
                                                    Swal.fire({
                                                        title: 'Data Approval PB Berhasil di Rollback',
                                                        icon: 'success',
                                                        target: '#approvalPB',
                                                    }).then(() => {
                                                        // Reload halaman
                                                        setTimeout(() => {
                                                            //   closeDialog();
                                                            // window.location.href = './pblist';
                                                            // router.push('./pblist');
                                                            backPage();
                                                        }, 1000);
                                                        // window.location.reload();
                                                    });
                                                } else {
                                                    console.error('Respons tidak valid');
                                                }
                                            }, 1000);
                                        } catch (error) {
                                            console.error('Terjadi kesalahan:', error);
                                            Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                                        }
                                    }
                                });
                            } else if (result === 'exportBatal') {
                                setTimeout(() => {
                                    //   closeDialog();
                                    backPage();
                                }, 1000);
                            } else {
                                let sTotalNetto = 0;
                                let itemFbCabangBeli = 0;
                                let sNoFBCabangBeli = '';

                                sNoFBCabangBeli = await generateNofakturFB(apiUrl, kode_entitas, noPB);
                                //FAKTUR BELI CABANG BELI
                                const vDetailFbCabangBeli = async () => {
                                    const sKodeDeptCabang = await FetchDepartemen(kode_entitas);
                                    const dataDetail = await Promise.all(
                                        // data.nodes.map((item: any, idFbPusat: any) => {
                                        modifiedData.detail.map((item: any, idFbPusat: any) => {
                                            sTotalNetto = sTotalNetto + item.qty_std * item.harga_mu;
                                            itemFbCabangBeli++;
                                            return {
                                                kode_fb: 'oto',
                                                id_fb: idFbPusat + 1,
                                                kode_lpb: item.kode_lpb,
                                                id_lpb: item.id_lpb,
                                                kode_sp: item.kode_sp,
                                                id_sp: item.id_sp,
                                                kode_pp: item.kode_pp,
                                                id_pp: item.id_pp,
                                                kode_item: item.kode_item,
                                                diskripsi: item.diskripsi,
                                                satuan: item.satuan,
                                                qty: item.qty,
                                                sat_std: item.sat_std,
                                                qty_std: item.qty_std,
                                                kode_mu: item.kode_mu,
                                                kurs: item.kurs,
                                                kurs_pajak: item.kurs_pajak,
                                                harga_mu: item.harga_mu,
                                                diskon: item.diskon,
                                                diskon_mu: item.diskon_mu,
                                                potongan_mu: item.potongan_mu,
                                                kode_pajak: item.kode_pajak,
                                                pajak: item.pajak,
                                                include: item.include,
                                                pajak_mu: item.pajak_mu,
                                                jumlah_mu: item.jumlah_mu,
                                                jumlah_rp: item.jumlah_rp,
                                                ket: null,
                                                kode_dept: sKodeDeptCabang[0].dept,
                                                kode_kerja: null,
                                                berat: item.berat,
                                            };
                                        })
                                    );

                                    return dataDetail;
                                };
                                const FBCabangBeliJson = async () => {
                                    let sDetailFbCabangBeli = await vDetailFbCabangBeli();
                                    const objectFbCabangBeli = {
                                        entitas: kode_entitas,
                                        kode_fb: 'oto',
                                        no_fb: sNoFBCabangBeli,
                                        tgl_fb: moment(modifiedData.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                                        tgl_trxfb: moment(modifiedData.tgl_trxlpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                                        tgl_buku: moment(modifiedData.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                                        kode_supp: modifiedData.kode_supp,
                                        kode_termin: modifiedData.kode_termin,
                                        kode_mu: 'IDR',
                                        kurs: kurs,
                                        kurs_pajak: kursPajak,
                                        kena_pajak: selectedOptionPajak,
                                        no_faktur_pajak: null,
                                        total_mu: subTotal * kurs,
                                        diskon_dok: persenDiskon === null ? 0 : persenDiskon,
                                        diskon_dok_mu: nominalDiskon === null ? 0 : nominalDiskon * kurs,
                                        total_diskon_mu: totalDiskonRP * kurs,
                                        total_pajak_mu: totalPajakSet * kurs,
                                        kirim_mu: kirimMU,
                                        netto_mu: sTotalNetto, //totalNettoRPSet * kurs,
                                        memo_mu: 0,
                                        lunas_mu: 0,
                                        memo_pajak: 0,
                                        lunas_pajak: 0,
                                        total_rp: subTotal,
                                        diskon_dok_rp: nominalDiskon === null ? 0 : nominalDiskon,
                                        total_diskon_rp: totalDiskonRP + totalPotonganRP,
                                        total_pajak_rp: totalPajakSet,
                                        kirim_rp: kurs * kirimMU,
                                        netto_rp: sTotalNetto, //totalNettoRPSet,
                                        total_berat: totalBeratHeader,
                                        kode_akun_kirim: kodeAkun[0]?.kode_akun_pengiriman,
                                        kode_akun_diskon_termin: kodeAkun[0]?.kode_akun_diskon_item,
                                        kode_akun_diskon_dok: kodeAkun[0]?.kode_akun_diskon_beli,
                                        keterangan: Keterangan,
                                        status: 'Terbuka',
                                        userid: userid,
                                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        kode_lpb: kodePB,
                                        fdo: null,
                                        ppn: selectedOptionPajak,
                                        detail: [...sDetailFbCabangBeli],
                                        audit: {
                                            entitas: kode_entitas,
                                            kode_audit: 'oto',
                                            dokumen: 'FB',
                                            kode_dokumen: 'oto',
                                            no_dokumen: sNoFBCabangBeli,
                                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            proses: 'NEW',
                                            diskripsi: `Auto FB Approval disetujui item =  ${itemFbCabangBeli}  nilai transaksi ${sTotalNetto.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`,
                                            userid: userid, // userid login web
                                            system_user: '', //username login
                                            system_ip: '', //ip address
                                            system_mac: '', //mac address
                                        },
                                    };
                                    let returnObjekFbCabangBeli = { ...objectFbCabangBeli };

                                    return returnObjekFbCabangBeli;
                                };

                                const vFBCabangBeliJson = await FBCabangBeliJson();
                                console.log('vFBCabangBeliJson = ', vFBCabangBeliJson);
                                const apiPost = `${apiUrl}/erp/simpan_fb?`;

                                const response = await axios.post(apiPost, vFBCabangBeliJson);

                                if (response.data.status === true) {
                                    // Jika POST Master FB berhasil, lanjut POST ke tb_audit
                                    await generateNU(kode_entitas, sNoFBCabangBeli, '03', moment().format('YYYYMM'));
                                    try {
                                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                            entitas: kode_entitas,
                                            kode_audit: null,
                                            dokumen: 'FB',
                                            kode_dokumen: response.data.kode_dokumen,
                                            no_dokumen: sNoFBCabangBeli,
                                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            proses: 'NEW',
                                            diskripsi: `Auto FB Approval disetujui item =  ${itemFbCabangBeli}  nilai transaksi ${sTotalNetto.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`,
                                            userid: userid,
                                            system_user: '', //username login
                                            system_ip: '', //ip address
                                            system_mac: '', //mac address
                                        });
                                        // console.log(auditResponse, 'auditResponse');
                                    } catch (auditError) {
                                        console.error('Error posting data to simpan_audit API:', auditError);
                                    }
                                } else {
                                }
                                myAlertGlobal2(`Approval PB Manual Berhasil' ${response.status}`, 'approvalPB').then((result) => {
                                    if (result.isConfirmed) {
                                        setTimeout(() => {
                                            //   closeDialog();
                                            backPage();
                                        }, 1000);
                                    }
                                });
                            }
                        });
                    } else {
                        Swal.fire({
                            title: 'Warning',
                            text: `Gagal Approval PB 6 : ${response.data.serverMessage}`,
                            icon: 'error',
                            target: '#approvalPB',
                        });
                    }
                    // console.log('response simpan approve PB', response.data);
                } finally {
                    setShowLoader(false);
                }
            } catch (error) {
                console.log('transakiOtomatis ', transakiOtomatis);
                setTimeout(async () => {
                    const response: any = await ApiBatal('Approval', kodePB);
                    if (response.data.status === true) {
                        // console.log(response.data.status);
                        Swal.fire({
                            title: `Terjadi kesalahanXXX ${error}`,
                            text: 'Gagal menyimpan PB. Silakan coba lagi.',
                            icon: 'error',
                            target: '#approvalPB',
                        }).then(() => {
                            // Reload halaman
                            setTimeout(() => {
                                //   closeDialog();
                                // window.location.href = './pblist';
                                // router.push('./pblist');
                                backPage();
                            }, 1000);
                            // window.location.reload();
                        });
                    } else {
                        console.error('Respons tidak valid');
                    }
                }, 1000);
                // if (transakiOtomatis) {
                //     try {
                //         setTimeout(async () => {
                //             const response: any = await ApiBatal('Approval', kodePB);
                //             if (response.data.status === true) {
                //                 // console.log(response.data.status);
                //                 Swal.fire({
                //                     title: 'Terjadi kesalahan',
                //                     text: 'Gagal menyimpan PB. Silakan coba lagi.',
                //                     icon: 'error',
                //                 }).then(() => {
                //                     // Reload halaman
                //                     setTimeout(() => {
                //                         //   closeDialog();
                //                         window.location.href = './pblist';
                //                         router.push('./pblist');
                //                     }, 1000);
                //                     // window.location.reload();
                //                 });
                //             } else {
                //                 console.error('Respons tidak valid');
                //             }
                //         }, 1000);
                //     } catch (error) {
                //         console.error('Terjadi kesalahan:', error);
                //         Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                //     }
                // } else {
                //     console.error('Error during API request:', error);
                //     Swal.fire({
                //         title: 'Terjadi kesalahan',
                //         text: 'Gagal menyimpan PB. Silakan coba lagi.',
                //         icon: 'error',
                //     });
                // }
            }
        }
        // }
        // }
    };

    const prosesData = async (modifiedDataJurnal: any) => {
        let totalNettoRP = 0;
        let totalPajak = 0;
        let kirim = 0;
        if (selectedOptionPajak === 'N') {
            totalNettoRP = subTotal + kirimMU - nominalDiskon;
            totalPajak = totalNilaiPajakRP;
            setTotalPajakSet(totalPajak);
            setTotalNettoRPSet(totalNettoRP);
            kirim = (kirimMU / totalNettoRP) * 100;
        } else if (selectedOptionPajak === 'I') {
            let IncludeDPP = subTotal - nominalDiskon;
            totalNettoRP = IncludeDPP + kirimMU - nominalDiskon;
            totalPajak = totalNilaiPajakRP;
            setTotalPajakSet(totalPajak);
            setTotalNettoRPSet(totalNettoRP);
            kirim = (kirimMU / totalNettoRP) * 100;
        } else if (selectedOptionPajak === 'E') {
            if (nominalDiskon) {
                //IKUT FAS PB
                // totalPajak = totalNilaiPajakRP - totalNilaiPajakRP * (persenDiskon / 100);
                // IKUT FAS PO
                totalPajak = totalNilaiPajakRP;
                setTotalPajakSet(totalNilaiPajakRP);
                totalNettoRP = subTotal - nominalDiskon + totalPajak + kirimMU;
                setTotalNettoRPSet(totalNettoRP);
                setTotalNettoRPSet(totalNettoRP);
                kirim = (kirimMU / totalNettoRP) * 100;
            } else {
                totalPajak = totalNilaiPajakRP;
                setTotalPajakSet(totalPajak);
                totalNettoRP = subTotal + totalPajak + kirimMU;
                setTotalNettoRPSet(totalNettoRP);
                kirim = (kirimMU / totalNettoRP) * 100;
            }
        }

        const modifiedData = {
            entitas: kode_entitas,
            no_lpb: noPB,
            kode_lpb: kodePB,
            tgl_lpb: TglPB, //moment().format('YYYY-MM-DD HH:mm:ss'), //TglPB,
            tgl_sj: TglSJ,
            no_reff: NoReff,
            dokumen: dokumen,
            kode_gudang: kodeGudang,
            kode_supp: kodeSuppM,
            fob: FOB,
            via: via,
            pengemudi: pengemudi,
            nopol: nopol,
            persediaan: Persediaan, // default
            total_rp: subTotal,
            total_diskon_rp: totalDiskonRP + totalPotonganRP,
            total_pajak_rp: totalPajak,
            netto_rp: totalNettoRP,
            keterangan: Keterangan,
            total_berat: totalBeratHeader,
            // status: routeStatusValue === 'terbuka' ? 'Approval_Flag' : 'Approval', // kondisi models API
            status: 'Approval',
            userid: UserID,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            kirim: kirim,
            kirim_mu: kirimMU,
            diskon_dok: persenDiskon === null ? 0 : persenDiskon,
            diskon_dok_rp: nominalDiskon === null ? 0 : nominalDiskon,
            kena_pajak: selectedOptionPajak,
            kode_termin: selectedKodeTermin,
            kontrak: kontrak,
            // status_export
            fdo: 'P', //fdo,
            no_pralpb: noPB,
            tgl_trxlpb: TglTrxLpb,
            tgl_pralpb: TglPB,
            // status_dok
            // no_pralpb
            // tgl_pralpb
            // detail: data.nodes,
            detail: data.nodes.map((data: any, index) => ({
                ...data,
                potongan_mu: parseFloat(tanpaKoma(data.potongan_mu)),
                // qty_sisa: data.qty_std - data.qty,
            })),
            // detail_jurnal: modifiedDataJurnal.nodes.map((data: any, index) => ({
            jurnal: modifiedDataJurnal.nodes.map((data: any, index: any) => ({
                ...data,
                kode_dokumen: kodePB,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                tgl_valuta: null,
                tgl_rekonsil: null,
                no_warkat: null,
                kode_kerja: null,
                audit: null,
                kode_kry: null,
                kode_jual: null,
                no_kontrak_um: null,
                userid: userid,
            })),
            // detail_jurnal: modifiedDataJurnal.nodes,
        };

        const hasEmptyFields = dataJurnal.nodes.some((row: { no_akun: string }) => row.no_akun === '');
        if (hasEmptyFields) {
            Swal.fire({
                title: 'Harap isi Semua Data Sebelum Melakukan Simpan Data.',
                icon: 'error',
                target: '#approvalPB',
            });
            throw 'exit';
        } else if (selisih !== 0) {
            Swal.fire({
                title: 'Selisih',
                text: 'Terdapat nilai selisih antara Debit dan Kredit',
                icon: 'error',
                target: '#approvalPB',
            });
            throw 'exit';
        } else {
            // SAVE DOC
            try {
                // router.push('./fb');
                console.log('transaksi otomatis 2');
                setTransaksiOtomatis(true);
                try {
                    setShowLoader(true);

                    const response = await axios.patch(`${apiUrl}/erp/update_approval_pb`, modifiedData);
                    let responseExportNonKontrakCabangApi: any;
                    let responseExportKontrakPusatApi: any;
                    // console.log('response ', response);
                    if (response.data.status === true) {
                        //     Await the validation approval
                        await validasiApproval().then(async (result: any) => {
                            // console.log('reslrtttcccc ', result);
                            // throw exitCode;
                            if (result === 'exportNonKontrak') {
                                console.log('masuk exportNonKontrak');
                                await ExportNonKontrakCabang(modifiedData)
                                    .then(async (result: any) => {
                                        // console.log('ExportNonKontrakCabang ', result);
                                        // const responseExportNonKontrak = await axios.post(`${apiUrl}/erp/exportnonkontrak`, result);

                                        const responseExportNonKontrak = await axios
                                            .post(`${apiUrl}/erp/exportnonkontrak`, result, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            })
                                            .then(async (result) => {
                                                // console.log('exportnonkontrak ', result);

                                                responseExportNonKontrakCabangApi = result.data;
                                                console.log('responseExportNonKontrakCabangApi', responseExportNonKontrakCabangApi);

                                                if (result) {
                                                    const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeFB !== '') {
                                                        await generateNU(kode_entitas, sNoFBCabangBeli, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeSPM !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoSpmCabangBeli, sSoKodeJual, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJual);
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeSJ !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoSjCabangBeli, sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPembeli?.kodeFJ !== '') {
                                                        await generateNUDivisi(kode_entitas, sNoFjCabangBeli, sSoKodeJual, '13', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
                                                    }

                                                    //GENERATE NO DOKUMEN PUSAT SETELAH APPROVE BERHASIL
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodePB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoPBPusat, '04', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeFB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoFBPusat, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeSPM !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoSpmPusat,
                                                            sSoKodeJualPusat,
                                                            '11',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + sSoKodeJualPusat
                                                        );
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeSJ !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoSjPusat,
                                                            sSoKodeJualPusat,
                                                            '12',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + `${sSoKodeJualPusat}`
                                                        );
                                                    }
                                                    if (responseExportNonKontrakCabangApi.kodeDokumenPusat?.kodeFJ !== '') {
                                                        await generateNUDivisi(
                                                            getEntPusat[0].kode_entitas,
                                                            sNoFjPusat,
                                                            sSoKodeJualPusat,
                                                            '13',
                                                            moment().format('YYYYMM'),
                                                            moment().format('YYMM') + `${sSoKodeJualPusat}`
                                                        );
                                                    }
                                                }
                                            })
                                            .catch((e: any) => {
                                                responseExportNonKontrakCabangApi = e.response;
                                            });

                                        // console.log('responseExportNonKontrak', responseExportNonKontrakCabangApi);
                                        // if (responseExportNonKontrak !== undefined) {
                                        // console.log('responseExportNonKontrakCabangApi', responseExportNonKontrakCabangApi);
                                        if (responseExportNonKontrakCabangApi.status === true) {
                                            const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                                entitas: kode_entitas,
                                                kode_audit: null,
                                                dokumen: 'PB',
                                                kode_dokumen: kodePB,
                                                no_dokumen: noPB,
                                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                proses: 'EDIT',
                                                diskripsi: `Approval PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${totalNettoRP.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                userid: userid, // userid login web
                                                system_user: '', //username login
                                                system_ip: '', //ip address
                                                system_mac: '', //mac address
                                            });
                                            myAlertGlobal2(`Approval dan Export Dokumen PB Berhasil' ${response.status}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        // window.location.href = './pblist';
                                                        // router.push('./pblist');
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        } else {
                                            myAlertGlobal2(`Gagal Approval PB 4 : ${responseExportNonKontrakCabangApi.data.error}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        // window.location.href = './pblist';
                                                        // router.push('./pblist');
                                                        backPage();
                                                    }, 1000);
                                                    // setTimeout(async () => {
                                                    //     const response: any = await ApiBatal('Approval', kodePB);
                                                    //     if (response.data.status === true) {
                                                    //         // console.log(response.data.status);
                                                    //         Swal.fire({
                                                    //             title: `Terjadi kesalahan PB 4`,
                                                    //             text: 'Gagal menyimpan PB. Silakan coba lagi.',
                                                    //             icon: 'error',
                                                    //         }).then(() => {
                                                    //             // Reload halaman
                                                    //             setTimeout(() => {
                                                    //                 //   closeDialog();
                                                    //                 window.location.href = './pblist';
                                                    //                 router.push('./pblist');
                                                    //             }, 1000);
                                                    //             // window.location.reload();
                                                    //         });
                                                    //     } else {
                                                    //         console.error('Respons tidak valid');
                                                    //     }
                                                    // }, 1000);
                                                }
                                            });
                                        }
                                    })
                                    .catch((e: any) => {
                                        console.log('error', e.response);
                                    });
                            } else if (result === 'exportKontrakPusat') {
                                console.log('masuk exportKontrakPusat');
                                await ExportKontrakPusat(modifiedData)
                                    .then(async (result: any) => {
                                        console.log('result ExportKontrakPusat', result);
                                        // const responseExportNonKontrak = await axios.post(`${apiUrl}/erp/exportnonkontrak`, result);
                                        const responseExportKontrakPusat = await axios
                                            .post(`${apiUrl}/erp/exportkontrak`, result, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            })
                                            .then(async (result) => {
                                                console.log('result ssss', result);
                                                responseExportKontrakPusatApi = result.data;
                                                if (result) {
                                                    const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
                                                    if (responseExportKontrakPusatApi.kodeDokumenPembeli?.kodeFB !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoFBKontrakPusat, '03', moment().format('YYYYMM'));
                                                    }
                                                    if (responseExportKontrakPusatApi.kodeDokumenPembeli?.kodeSPM !== '') {
                                                        await generateNU(getEntPusat[0].kode_entitas, sNoMBKontrakPusat, '23', moment().format('YYYYMM'));
                                                    }
                                                }
                                            })
                                            .catch((e: any) => {
                                                responseExportKontrakPusatApi = e.response;
                                            });
                                        console.log('responseExportKontrakPusat', responseExportKontrakPusat);
                                        if (responseExportKontrakPusatApi.status === true) {
                                            const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                                                entitas: kode_entitas,
                                                kode_audit: null,
                                                dokumen: 'PB',
                                                kode_dokumen: kodePB,
                                                no_dokumen: noPB,
                                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                proses: 'EDIT',
                                                diskripsi: `Approval PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${totalNettoRP.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`,
                                                userid: userid, // userid login web
                                                system_user: '', //username login
                                                system_ip: '', //ip address
                                                system_mac: '', //mac address
                                            });
                                            myAlertGlobal2(`Approval dan Export Dokumen PB Berhasil' ${responseExportKontrakPusatApi.message}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        // window.location.href = './pblist';
                                                        // router.push('./pblist');
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        } else {
                                            myAlertGlobal2(`Gagal Approval PB 5 : ${responseExportKontrakPusatApi.data.error}`, 'approvalPB').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(() => {
                                                        //   closeDialog();
                                                        // window.location.href = './pblist';
                                                        // router.push('./pblist');
                                                        backPage();
                                                    }, 1000);
                                                }
                                            });
                                        }
                                    })
                                    .catch((e: any) => {
                                        console.log('error', e.response);
                                    });
                            } else if (result === 'cekPoDariPB') {
                                // console.log('masukkkkk');
                                myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat belum di Apporved', 'approvalPB').then((result) => {
                                    if (result.isConfirmed) {
                                        try {
                                            setTimeout(async () => {
                                                const response: any = await ApiBatal('Approval', kodePB);
                                                if (response.data.status === true) {
                                                    // console.log(response.data.status);
                                                    Swal.fire({
                                                        title: 'Data Approval PB Berhasil di Rollback',
                                                        icon: 'success',
                                                        target: '#approvalPB',
                                                    }).then(() => {
                                                        // Reload halaman
                                                        setTimeout(() => {
                                                            //   closeDialog();
                                                            // window.location.href = './pblist';
                                                            // router.push('./pblist');
                                                            backPage();
                                                        }, 1000);
                                                        // window.location.reload();
                                                    });
                                                } else {
                                                    console.error('Respons tidak valid');
                                                }
                                            }, 1000);
                                        } catch (error) {
                                            console.error('Terjadi kesalahan:', error);
                                            Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                                        }
                                    }
                                });
                            } else if (result === 'cekPoDariPB tidak tersedia') {
                                // console.log('masukkkkk');
                                myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat tidak tersedia', 'approvalPB').then((result) => {
                                    if (result.isConfirmed) {
                                        try {
                                            setTimeout(async () => {
                                                const response: any = await ApiBatal('Approval', kodePB);
                                                if (response.data.status === true) {
                                                    // console.log(response.data.status);
                                                    Swal.fire({
                                                        title: 'Data Approval PB Berhasil di Rollback',
                                                        icon: 'success',
                                                        target: '#approvalPB',
                                                    }).then(() => {
                                                        // Reload halaman
                                                        setTimeout(() => {
                                                            //   closeDialog();
                                                            // window.location.href = './pblist';
                                                            // router.push('./pblist');
                                                            backPage();
                                                        }, 1000);
                                                        // window.location.reload();
                                                    });
                                                } else {
                                                    console.error('Respons tidak valid');
                                                }
                                            }, 1000);
                                        } catch (error) {
                                            console.error('Terjadi kesalahan:', error);
                                            Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        Swal.fire({
                            title: 'Warning',
                            text: `Gagal Approval PB 6 : ${response.data.serverMessage}`,
                            icon: 'error',
                            target: '#approvalPB',
                        });
                    }
                    // console.log('response simpan approve PB', response.data);
                } finally {
                    setShowLoader(false);
                }
            } catch (error) {
                console.log('transakiOtomatis ', transakiOtomatis);
                setTimeout(async () => {
                    const response: any = await ApiBatal('Approval', kodePB);
                    if (response.data.status === true) {
                        // console.log(response.data.status);
                        Swal.fire({
                            title: `Terjadi kesalahanXXX ${error}`,
                            text: 'Gagal menyimpan PB. Silakan coba lagi.',
                            icon: 'error',
                            target: '#approvalPB',
                        }).then(() => {
                            // Reload halaman
                            setTimeout(() => {
                                //   closeDialog();
                                // window.location.href = './pblist';
                                // router.push('./pblist');
                                backPage();
                            }, 1000);
                            // window.location.reload();
                        });
                    } else {
                        console.error('Respons tidak valid');
                    }
                }, 1000);
                // if (transakiOtomatis) {
                //     try {
                //         setTimeout(async () => {
                //             const response: any = await ApiBatal('Approval', kodePB);
                //             if (response.data.status === true) {
                //                 // console.log(response.data.status);
                //                 Swal.fire({
                //                     title: 'Terjadi kesalahan',
                //                     text: 'Gagal menyimpan PB. Silakan coba lagi.',
                //                     icon: 'error',
                //                 }).then(() => {
                //                     // Reload halaman
                //                     setTimeout(() => {
                //                         //   closeDialog();
                //                         window.location.href = './pblist';
                //                         router.push('./pblist');
                //                     }, 1000);
                //                     // window.location.reload();
                //                 });
                //             } else {
                //                 console.error('Respons tidak valid');
                //             }
                //         }, 1000);
                //     } catch (error) {
                //         console.error('Terjadi kesalahan:', error);
                //         Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                //     }
                // } else {
                //     console.error('Error during API request:', error);
                //     Swal.fire({
                //         title: 'Terjadi kesalahan',
                //         text: 'Gagal menyimpan PB. Silakan coba lagi.',
                //         icon: 'error',
                //     });
                // }
            }
        }
    };

    const handlePajakChange = async (event: any) => {
        // const selectedValue = event.target.value;
        const selectedValue = event;
        // console.log('AAAAAAAAAAAAAA' + selectedValue);
        setSelectedOptionPajak(selectedValue);
        if (selectedValue == 'N') {
            data.nodes.map((node: any) => {
                // console.log(node.id_lpb);
                handleUpdate('0.00', node.id_lpb, 'pajak', selectedValue);
            });
            setValueStringPajak('');
            setValueNilaiDpp(0);
            setTotalNilaiPajakRP(0);
            // handleUpdate(0, 'N', 'pajak');
            // console.log(data.nodes.id_lpb);
        } else if (selectedValue === 'E') {
            data.nodes.map((node: any) => {
                // console.log(node.id_lpb);
                handleUpdate('0.00', node.id_lpb, 'pajak', selectedValue);
            });
            setValueStringPajak('');
            setValueNilaiDpp(subTotal);
            // setValueNilaiDpp(totalJumlahVariabel);
            // handleUpdate(0, 'E', 'pajak');
        } else if (selectedValue === 'I') {
            data.nodes.map((node: any) => {
                // console.log(node.id_lpb);
                handleUpdate('0.00', node.id_lpb, 'pajak', selectedValue);
            });
            // handleUpdate(0, 'I', 'pajak');
            // if (totalJumlahVariabel !== 0) {
            setValueNilaiDpp(subTotal);
            setValueStringPajak('Sudah termasuk pajak.');
            // setValueNilaiDpp(totalJumlahVariabel);
            // }
        }
        // console.log('TEST =' + selectedValue);
        // Lakukan sesuatu dengan nilai yang dipilih
    };

    const handleDiskonSubtotal = (persen: any) => {
        // reset nilai pajak saat diskon diisi
        setSelectedOptionPajak('N');
        data.nodes.map((node: any) => {
            // console.log(node.id_lpb);
            handleUpdate('0.00', node.id_lpb, 'pajak', 'N');
        });
        // alert('Diekse');
        let nilai_diskon = subTotal * (persen / 100);
        setNominalDiskon(nilai_diskon);
        setPersenDiskon(persen);
        let updateDPP = subTotal - nilai_diskon;
        // console.log('UPDATE DPP ' + updateDPP);
        // console.log('UPDATE NILAI DISKON ' + nilai_diskon);

        setTotalNilaiPajakRP(0);
        if (selectedOptionPajak !== 'N') {
            setValueNilaiDpp(updateDPP);
        }
    };

    const handleNominalDiskonSubtotal = (nominal: any) => {
        let persen_diskon = (nominal / subTotal) * 100;
        setPersenDiskon(persen_diskon);
        setNominalDiskon(nominal);
        // reset nilai pajak saat diskon diisi
        setSelectedOptionPajak('N');
        data.nodes.map((node: any) => {
            // console.log(node.id_lpb);
            handleUpdate('0.00', node.id_lpb, 'pajak', 'N');
        });

        let updateDPP = subTotal - nominal;
        setTotalNilaiPajakRP(0);
        // setValueNilaiDpp(updateDPP);
    };

    const handleBiayaKirimPersen = (persen: any) => {
        let nilaiBiayaKirim = subTotal * (persen / 100);
        setPersenBiayaKirim(persen);
        setkirimMU(nilaiBiayaKirim);
    };

    const handleBiayaKirimNominal = (nominal: any) => {
        let persenBiayaKirim = (nominal / subTotal) * 100;
        setPersenBiayaKirim(persenBiayaKirim);
        // setNominalBiayaKirim(nominal);
        setkirimMU(parseFloat(nominal));
    };

    // const handleTerbilang = (totalJumlahMu: any) => {
    //     generateTerbilang(kode_entitas, totalJumlahMu)
    //         .then((result) => {
    //             setTerbilang(result);
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         });
    // };

    const updateSaveDoc = async () => {
        const modifiedData = {
            entitas: kode_entitas,
        };
    };

    // ===============JURNAL==========================================================================================

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
            // setKodeDept(value);
            console.log(value);
            console.log(id);

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
                console.log('ada akun' + id + jenis_jurnal);
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
                    console.log(responCekSubledger[0].subledger);
                    if (responCekSubledger[0].subledger === 'Y') {
                        setModalSubledger(true);
                    } else {
                        // alert('Tidak memiliki akun subledger');
                        Swal.fire({
                            title: 'Subledger',
                            text: 'Akun yang dipilih tidak memiliki akun subledger',
                            icon: 'warning',
                            target: '#approvalPB',
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
                alert('silahkan pilig akun dilu');
                console.log('silahkan pilig akun dilu' + id + jenis_jurnal);
            }
        }
    };

    const handleSubmitJurnal = () => {
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataJurnal.nodes.length + 1;

        const newNode = {
            kode_dokumen: '',
            id_dokumen: id,
            id: id,
            dokumen: '',
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
                target: '#approvalPB',
            });
            throw 'exit';
        } else if (hasQtyNol) {
            Swal.fire({
                title: 'Jumlah  tidak boleh lebih kecil atau sama dengan Nol.',
                icon: 'error',
                target: '#approvalPB',
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
                target: '#approvalPB',
            });
        } else {
            Swal.fire({
                title: `Hapus Data Akun baris ${selectcellid_pbValue} ?`,
                showCancelButton: true,
                target: '#approvalPB',
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

    const handleSelectedData = async (dataObject: any, tipe: any) => {
        if (tipe === 'akun_jurnal') {
            const { selectedkode_akun, selectedno_akun, selectednama_akun, selectedtipe } = dataObject;

            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            kode_akun: selectedkode_akun,
                            no_akun: selectedno_akun,
                            nama_akun: selectednama_akun,
                            tipe: selectedtipe,
                            catatan: '',
                            nama_subledger: '',
                            no_subledger: '',
                            subledger: '',
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
            console.log(dataObject);
            setDataJurnal((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id === rowid) {
                        return {
                            ...node,
                            catatan: 'Hutang ' + selectedData + ', PB No: ' + noPB,
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
            console.log(dataObject);
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

    const autojurnal = async () => {
        setBlockingJurnal(false); // unblocking jurnal
        const { nodes } = data;
        let totalDiskonMu = 0,
            totalBerat = 0,
            totpsd = 0,
            kode_psd = '',
            psd = 0,
            pajak = 0,
            kirim_mu = 0;

        const newNodes = nodes.map((node: any) => {
            let pajak_mu = parseFloat(node.pajak_mu);
            let kurs_pajak = parseFloat(node.kurs_pajak);
            let jumlah_rp = parseFloat(node.jumlah_rp);

            pajak += pajak_mu * kurs_pajak;

            if (node.include === 'I') {
                totpsd += jumlah_rp - pajak_mu * kurs_pajak;
            } else {
                totpsd += jumlah_rp;
            }

            if (node.kode_akun_persedian !== '') {
                kode_psd = node.kode_akun_persediaan;

                if (node.include === 'I') {
                    psd += pajak_mu;
                    console.log(psd);
                } else {
                    psd += jumlah_rp;
                }
            }

            return {
                ...node,
            };
        });

        setData((state: any) => ({
            ...state,
            nodes: newNodes,
        }));

        // hapus semua
        setDataJurnal((state) => ({
            ...state,
            nodes: state.nodes.filter((node: any) => node.id_pp === -1),
        }));

        let i = 1; // id_dokumen

        // Masukkan akun persediaan
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
                dokumen: 'PB',
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
                debet_rp: frmNumber(totpsd), //psd
                kredit_rp: '0.00',
                jumlah_rp: frmNumber(totpsd), //psd
                jumlah_mu: frmNumber(totpsd), //psd
                catatan: 'Penerimaan Barang No: ' + noPB,
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

        //masukan akun jika beban cabang
        if (kirimMU > 0) {
            if (tipeSupp === 'cabang') {
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'PB',
                    tgl_dokumen: '',
                    kode_akun: kodeAkunBeban,
                    no_akun: noBeban,
                    nama_akun: namaBeban,
                    tipe: tipeBeban,
                    kode_subledger: null,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: frmNumber(kirimMU),
                    kredit_rp: '0.00',
                    jumlah_rp: frmNumber(kirimMU),
                    jumlah_mu: frmNumber(kirimMU),
                    catatan: 'Biaya Pengiriman PB No: ' + noPB,
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
            } else {
                // biaya kirim
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result: any) => {
                        let S_kodeAkunPengiriman = result[0].kode_akun_pengiriman === '' || result[0].kode_akun_pengiriman === null ? '' : result[0].kode_akun_pengiriman;
                        let S_noAkunPengiriman = result[0].no_kirim === '' || result[0].no_kirim === null ? '' : result[0].no_kirim;
                        let S_namaAkunPengiriman = result[0].nama_kirim === '' || result[0].nama_kirim === null ? '' : result[0].nama_kirim;
                        let S_tipeAkunPengiriman = result[0].tipe_kirim === '' || result[0].tipe_kirim === null ? '' : result[0].tipe_kirim;

                        const id = dataJurnal.nodes.length + 1;
                        const newNodeJurnal = {
                            kode_dokumen: '',
                            id_dokumen: i,
                            id: i,
                            dokumen: 'PB',
                            tgl_dokumen: '',
                            kode_akun: S_kodeAkunPengiriman,
                            no_akun: S_noAkunPengiriman,
                            nama_akun: S_namaAkunPengiriman,
                            tipe: S_tipeAkunPengiriman,
                            kode_subledger: null,
                            no_subledger: '',
                            nama_subledger: '',
                            kurs: 1.0,
                            kode_mu: 'IDR',
                            debet_rp: frmNumber(kirimMU),
                            kredit_rp: '0.00',
                            jumlah_rp: frmNumber(kirimMU),
                            jumlah_mu: frmNumber(kirimMU),
                            catatan: 'Biaya Pengiriman PB No: ' + noPB,
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
                    })
                    .catch((error: any) => {
                        console.error('Error:', error);
                    });
            }
        }

        //masukan akun pajak
        if (pajak > 0) {
            const id = dataJurnal.nodes.length + 1;
            const newNodeJurnal = {
                kode_dokumen: '',
                id_dokumen: i,
                id: i,
                dokumen: 'PB',
                tgl_dokumen: '',
                kode_akun: kodeAkunPajakBeli,
                no_akun: noPajakBeli,
                nama_akun: namaPajakBeli,
                tipe: tipePajakBeli,
                kode_subledger: null,
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: frmNumber(pajak),
                kredit_rp: '0.00',
                jumlah_rp: frmNumber(pajak),
                jumlah_mu: frmNumber(pajak),
                catatan: 'Pajak ' + namaRelasi + ', PB No: ' + noPB,
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

        // masukan akun kas
        if (terminSelected === 'C.O.D') {
            if (tipeSupp !== 'cabang') {
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result: any) => {
                        // setkodeAkunKas(result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas);
                        // setnoAkunKas(result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas);
                        // setnamaAkunKas(result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas);
                        // settipeAkunKas(result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas);
                        let S_kodeAkunKas = result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas;
                        let S_noAkunKas = result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas;
                        let S_namaAkunKas = result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas;
                        let S_tipeAkunKas = result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas;

                        const id = dataJurnal.nodes.length + 1;
                        const newNodeJurnal = {
                            kode_dokumen: '',
                            id_dokumen: i,
                            id: i,
                            dokumen: 'PB',
                            tgl_dokumen: '',
                            kode_akun: S_kodeAkunKas,
                            no_akun: S_noAkunKas,
                            nama_akun: S_namaAkunKas,
                            tipe: S_tipeAkunKas,
                            kode_subledger: kodeSuppM,
                            no_subledger: noSupp,
                            nama_subledger: namaRelasi,
                            kurs: 1.0,
                            kode_mu: 'IDR',
                            debet_rp: '0.00',
                            kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
                            jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                            jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                            catatan: 'Pembelian Barang PB No: ' + noPB,
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
                            subledger: noSupp + '-' + namaRelasi,
                            no_warkat: '',
                            tgl_valuta: '',
                            no_kerja: '',
                        };
                        setDataJurnal((state: any) => ({
                            ...state,
                            nodes: state.nodes.concat(newNodeJurnal),
                        }));
                        i++;
                    })
                    .catch((error: any) => {
                        console.error('Error:', error);
                    });
            } else {
                await fetchPreferensi(kode_entitas, apiUrl)
                    .then((result: any) => {
                        setkodeAkunKas(result[0].kode_akun_kas === '' || result[0].kode_akun_kas === null ? '' : result[0].kode_akun_kas);
                        setnoAkunKas(result[0].no_kas === '' || result[0].no_kas === null ? '' : result[0].no_kas);
                        setnamaAkunKas(result[0].nama_kas === '' || result[0].nama_kas === null ? '' : result[0].nama_kas);
                        settipeAkunKas(result[0].tipe_kas === '' || result[0].tipe_kas === null ? '' : result[0].tipe_kas);
                    })
                    .catch((error: any) => {
                        console.error('Error:', error);
                    });
                const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'PB',
                    tgl_dokumen: '',
                    kode_akun: kodeAkunKas,
                    no_akun: noAkunKas,
                    nama_akun: namaAkunKas,
                    tipe: tipeAkunKas,
                    kode_subledger: null,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00',
                    kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
                    jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    catatan: 'Pembelian Barang PB No: ' + noPB,
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
        } else {
            // hutang supplier
            if (tipeSupp !== 'cabang') {
                const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'PB',
                    tgl_dokumen: '',
                    kode_akun: kodeAkunHutang,
                    no_akun: noHutang,
                    nama_akun: namaHutang,
                    tipe: tipeHutang,
                    kode_subledger: kodeSuppM,
                    no_subledger: noSupp,
                    nama_subledger: namaRelasi,
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00',
                    kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
                    jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    catatan: 'Hutang ' + namaRelasi + ', PB No: ' + noPB,
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
                    subledger: noSupp + '-' + namaRelasi,
                    no_warkat: '',
                    tgl_valuta: '',
                    no_kerja: '',
                };
                setDataJurnal((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(newNodeJurnal),
                }));
                i++;
            } else {
                const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'PB',
                    tgl_dokumen: '',
                    kode_akun: kodeAkunHutang,
                    no_akun: noHutang,
                    nama_akun: namaHutang,
                    tipe: tipeHutang,
                    kode_subledger: kodeSuppM,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00',
                    kredit_rp: frmNumber(totpsd + pajak + kirimMU * kurs - nominalDiskon),
                    jumlah_rp: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    jumlah_mu: frmNumber((totpsd + pajak + kirimMU * kurs - nominalDiskon) * -1),
                    catatan: 'Hutang ' + namaRelasi + ', PB No: ' + noPB,
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
        }

        //masukan akun diskon
        if (nominalDiskon > 0) {
            try {
                const result = await fetchPreferensi(kode_entitas, apiUrl);
                setkodeAkunDiskonBeli(result[0].kode_akun_diskon_beli === '' || result[0].kode_akun_diskon_beli === null ? '' : result[0].kode_akun_diskon_beli);
                setnoAkunDiskonBeli(result[0].no_diskon_beli === '' || result[0].no_diskon_beli === null ? '' : result[0].no_diskon_beli);
                setnamaAkunDiskonBeli(result[0].nama_diskon_beli === '' || result[0].nama_diskon_beli === null ? '' : result[0].nama_diskon_beli);
                settipeAkunDiskonBeli(result[0].tipe_diskon_beli === '' || result[0].tipe_diskon_beli === null ? '' : result[0].tipe_diskon_beli);
                let S_kodeAkunDiskonBeli = result[0].kode_akun_diskon_beli === '' || result[0].kode_akun_diskon_beli === null ? '' : result[0].kode_akun_diskon_beli;
                let S_noAkunDiskonBeli = result[0].no_diskon_beli === '' || result[0].no_diskon_beli === null ? '' : result[0].no_diskon_beli;
                let S_namaAkunDiskonBeli = result[0].nama_diskon_beli === '' || result[0].nama_diskon_beli === null ? '' : result[0].nama_diskon_beli;
                let S_tipeAkunDiskonBeli = result[0].tipe_diskon_beli === '' || result[0].tipe_diskon_beli === null ? '' : result[0].tipe_diskon_beli;

                const id = dataJurnal.nodes.length + 1;
                const newNodeJurnal = {
                    kode_dokumen: '',
                    id_dokumen: i,
                    id: i,
                    dokumen: 'PB',
                    tgl_dokumen: '',
                    kode_akun: S_kodeAkunDiskonBeli,
                    no_akun: S_noAkunDiskonBeli,
                    nama_akun: S_namaAkunDiskonBeli,
                    tipe: S_tipeAkunDiskonBeli,
                    kode_subledger: null,
                    no_subledger: '',
                    nama_subledger: '',
                    kurs: 1.0,
                    kode_mu: 'IDR',
                    debet_rp: '0.00',
                    kredit_rp: frmNumber(nominalDiskon),
                    jumlah_rp: frmNumber(nominalDiskon * -1),
                    jumlah_mu: frmNumber(nominalDiskon * -1),
                    catatan: 'Potongan Pembelian PB No: ' + noPB,
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
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // ===========================FILE PENDUKUNG===============================

    const handleFileChange = (event: any) => {
        const newFiles = [...event.target.files];
        setSelectedFiles((prevFiles: any) => [...prevFiles, ...newFiles]);

        const newNamaFiles = new Array(newFiles.length).fill(formattedName);
        setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, ...newNamaFiles]);
    };

    const handleUpload = async (kode_dokumen: any, jenis: any) => {
        console.log(jenis);

        try {
            if (jenis === 'update') {
                console.log('UPDATE MASUK');

                // Proses untuk update file
                await handleDeleteUnusedFiles(kode_dokumen); // Menghapus file yang tidak digunakan
                await handleFileUpdate(kode_dokumen); // Menghandle update file
            } else if (jenis === 'baru') {
                console.log('BARU MASUK');

                // Proses untuk file baru
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
                            console.log(insertResponse);
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
        const fileUpdate = selectedFiles.filter((file: any) => file.name);
        console.log('fileUpdate:', fileUpdate);

        if (fileUpdate.length > 0) {
            try {
                // Upload file yang diperbarui
                const uploadResponse = await uploadFiles(fileUpdate, kode_dokumen);

                if (uploadResponse.status === true) {
                    // Jika upload berhasil

                    // Persiapkan data untuk disimpan di database
                    const jsonSimpan = prepareDataForSave(uploadResponse, kode_dokumen);

                    // Gabungkan array baru dengan data yang sudah ada
                    console.log(uploadResponse);
                    console.log(jsonSimpan);

                    // Simpan data ke database
                    const saveResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
                    console.log('Response dari menyimpan data:', saveResponse);
                    if (routeFilePendukungValue === 'true' && saveResponse.data.status === true) {
                        console.log('NAVIGATE UPDATE FILE PENDUKUNG');
                        Swal.fire({
                            title: 'Berhasil update file pendukung PB Approved',
                            icon: 'success',
                            target: '#approvalPB',
                        }).then(() => {
                            // window.location.href = './pblist';
                            // router.push('./pblist');
                            backPage();
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
            console.log('Response dari upload file baru:', response.data);

            // Persiapkan data untuk disimpan di database
            const jsonSimpan = prepareDataForSave(response.data, kode_dokumen);

            if (response.data.status === true) {
                // Jika upload berhasil
                try {
                    // Simpan data ke database
                    const saveResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
                    console.log('Response dari menyimpan data:', saveResponse);
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
            console.log('ID Dokumen Tertinggi:', maxIdDokumen);
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
            console.log('Response dari uploadFiles:', response.data);
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
            formData.append(`myimage`, file);
            const fileExtension = file.name.split('.').pop();
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
        console.log(response);
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

        console.log(jsonSimpan);

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
            console.log('Response dari penghapusan file pendukung:', response.data);
        } catch (error) {
            console.error('Error saat menghapus file pendukung:', error);
        }
    };

    const handleFileSelect = (index: any, file: any, imageserver: any, dokumen: any, filegambar: any) => {
        // console.log(index);
        // console.log(file);
        // console.log(imageserver);
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

    const handleFileClick = async (index: any, jenis: any, imageserver: any, dokumen: any, filegambar: any) => {
        if (dokumen === 'PB') {
            const imageToPreview = selectedFiles[index];
            console.log('index = ', index, jenis, imageserver, dokumen, selectedFiles);
            if (!imageToPreview) return null;

            const fileType = imageToPreview.type;
            // const fileTypeServer = imageServer;
            let extension, namaFile;
            if (fileType === undefined) {
                const fileName = filegambar;
                namaFile = filegambar;
                extension = fileName.split('.').pop(); // Hasil: "pdf"
                if (extension === 'pdf') {
                    const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${namaFile}`);

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
                    downloadBase64Image(imageserver, imageToPreview.name);
                }
            } else {
                const fileName = imageToPreview.name;
                namaFile = imageToPreview.name;
                extension = fileName.split('.').pop(); // Hasil: "pdf"
                if (extension === 'pdf') {
                    const pdfObjectURL = URL.createObjectURL(imageToPreview);
                    setPdfUrl(pdfObjectURL);
                    setPreviewPdf(true);
                } else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
                    const imageToPreview = selectedFiles[index];
                    if (!imageToPreview) {
                        console.error('Gambar tidak ditemukan atau tidak valid.');
                        return;
                    }

                    let previewImages = [];
                    previewImages.push(URL.createObjectURL(new Blob([imageToPreview])));
                    setIsOpenPreview(true);
                    setImageDataUrl(previewImages.join(','));
                    setIndexPreview(index);
                } else {
                    downloadBase64Image1(imageserver, imageToPreview.name, imageToPreview);
                }
            }
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

    const handlePreview = (index: any, jenis: any, imageserver: any, dokumen: any) => {
        // console.log(dokumen + index);
        if (dokumen === 'PB') {
            // ====================PB===========================
            if (jenis === 'server') {
                setShowPreviewModal(true);
                setSelectedImages(imageserver);
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
                setSelectedImages(previewImages.join(','));
                setShowPreviewModal(true);
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
                setShowPreviewModalPO(true);
                setSelectedImagesPO(imageserver);
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

    // Di bagian lain setelah modal ditutup
    const handleClosePreviewModal = () => {
        console.log('dihapus');
        setShowPreviewModal(false);
        setSelectedImages('');
        URL.revokeObjectURL(selectedImages);
    };

    const handleClosePreviewModalPO = () => {
        console.log('dihapus PO');
        setShowPreviewModalPO(false);
        setSelectedImagesPO('');
        URL.revokeObjectURL(selectedImagesPO);
    };

    const handleSelectDataLogin = (status: any) => {
        // alert(status);
        console.log(status);
        if (status === true) {
            saveDoc('skipBlokAuth');
        }
    };

    // ===========================FILE PENDUKUNG END===============================
    const cekPoByKodeFpb = async (kode_entitas_pusat: any, kode_fpb: any, token: any): Promise<any[]> => {
        const response = await axios.get(`${apiUrl}/erp/get_po_bykode_fpb?`, {
            params: {
                entitas: kode_entitas_pusat,
                param1: kode_fpb ?? '',
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        // console.log('param', {
        //     params: {
        //         entitas: kode_entitas_pusat,
        //         param1: kode_fpb,
        //     },
        // });
        const listDokumen = response.data.data;
        // console.log(listDetailDokumen);

        return listDokumen;
    };

    // setGetEntitasPst(getEntUser[0].kode_entitas);
    // setGetEntitasUser(getEntPusat[0].kode_entitas);

    // const validasiApproval: any = async () => {
    //     const cekPoDariFpb = await cekPoByKodeFpb(kode_entitas, kodeFpb, token);
    //     // console.log('cekPoDariFpb', cekPoDariFpb);
    //     if (cekPoDariFpb.length >= 1) {
    //         console.log('cekPoDariFpb', cekPoDariFpb[0].approval);
    //         if (cekPoDariFpb[0].approval !== 'Y') {
    //             myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat belum di Apporved', 'approvalPB');
    //             throw exitCode;
    //         } else {
    //             const getEntUser: any = await GetEntitasUser(kode_entitas, userid, token);
    //             const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
    //             setGetEntitasPst(getEntPusat);
    //             console.log('kode_entitas', kode_entitas);
    //             console.log('getEntPusat[0].kode_entitas', getEntPusat[0].kode_entitas);
    //             console.log('getEntUser[0].kode_entitas', getEntUser[0].kode_entitas);
    //             console.log('statusExport', statusExport);
    //             if (kode_entitas !== getEntPusat[0].kode_entitas && getEntUser[0].kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil') {
    //                 // ExportNonKontrakCabang;
    //                 //setExportNonKontrak(true);
    //                 await Swal.fire({
    //                     title: `APPROVAL PB INI AKAN MEMBENTUK TRANSAKSI OTOMATIS (NON KONTRAK) CABANG. \n
    //                         LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
    //                     showCancelButton: true,
    //                     confirmButtonText: 'Ok',
    //                     cancelButtonText: 'Batal',
    //                     target: '#approvalPB',
    //                 }).then(async (result) => {
    //                     // let e: any;
    //                     if (result.isConfirmed) {
    //                         setOtomatisFB(true);
    //                         setExportNonKontrak(true);
    //                         console.log('SIMPAN NON KONTRAK');
    //                     } else {
    //                         // setOtomatisFB(false);
    //                         // myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
    //                         // router.push('./fb');
    //                     }
    //                 });
    //             } else if (kode_entitas === getEntPusat[0].kode_entitas && getEntUser[0].kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil' && kontrak === 'Y') {
    //                 await Swal.fire({
    //                     title: `APPROVAL PB INI AKAN MEMBENTUK TRANSAKSI OTOMATIS (KONTRAK) PUSAT & CABANG. \n
    //                         LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
    //                     showCancelButton: true,
    //                     confirmButtonText: 'Ok',
    //                     cancelButtonText: 'Batal',
    //                     target: '#approvalPB',
    //                 }).then(async (result) => {
    //                     // let e: any;
    //                     if (result.isConfirmed) {
    //                         setOtomatisFB(true);
    //                         setExportKontrakPusat(true);
    //                         console.log('SIMPAN KONTRAK');
    //                     } else {
    //                         setOtomatisFB(false);
    //                         myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
    //                         // router.push('./fb');
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // };

    // const validasiApproval: any = async () => {
    //     try {
    //         const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
    //         const cekPoDariFpb = await cekPoByKodeFpb(getEntPusat[0].kode_entitas, kodeFpb, token);
    //         console.log('cekPoDariFpb ', cekPoDariFpb);

    //         if (cekPoDariFpb.length < 1 || cekPoDariFpb[0].approval !== 'Y') {
    //             // myAlertGlobal2('Approval tidak dapat dilanjutkan. PO di Pusat belum di Apporved', 'approvalPB');
    //             // throw exitCode;
    //             return 'cekPoDariPB';
    //         }

    //         const getEntUser: any = await GetEntitasUser(kode_entitas, userid, token);
    //         console.log('getEntUser ', getEntUser);
    //         console.log('getEntPusat ', getEntPusat);
    //         // const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
    //         setGetEntitasPst(getEntPusat[0].kode_entitas);
    //         if (kode_entitas !== getEntPusat[0].kode_entitas && getEntUser[0].kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil') {
    //             const result = await Swal.fire({
    //                 title: `APPROVAL PB INI AKAN MEMBENTUK TRANSAKSI OTOMATIS (NON KONTRAK) CABANG. \n LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
    //                 showCancelButton: true,
    //                 confirmButtonText: 'Ok',
    //                 cancelButtonText: 'Batal',
    //                 target: '#approvalPB',
    //             });
    //             if (result.isConfirmed) {
    //                 return 'exportNonKontrak';
    //             } else {
    //                 setFDO('');
    //             }
    //         } else if (kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil' && kontrak === 'Y') {
    //             const result = await Swal.fire({
    //                 title: `APPROVAL PB INI AKAN MEMBENTUK TRANSAKSI OTOMATIS (KONTRAK) PUSAT & CABANG. \n LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
    //                 showCancelButton: true,
    //                 confirmButtonText: 'Ok',
    //                 cancelButtonText: 'Batal',
    //                 target: '#approvalPB',
    //             });
    //             if (result.isConfirmed) {
    //                 return 'exportKontrakPusat';
    //             } else {
    //                 setFDO('');
    //                 myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
    //             }
    //         } else {
    //             myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
    //         }
    //     } catch (error) {
    //         console.error('Error in validasiApproval:', error);
    //     }
    // };
    const validasiApproval: any = async () => {
        try {
            const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
            console.log('kodeFpb sssss', kodeFpb);
            const cekPoDariFpb = await cekPoByKodeFpb(getEntPusat[0].kode_entitas, kodeFpb, token);
            console.log('cekPoDariFpb ', cekPoDariFpb);

            setDariFpb(cekPoDariFpb[0]?.kode_fpb === '' || cekPoDariFpb[0]?.kode_fpb === null ? false : true);

            if (cekPoDariFpb.length > 0) {
                if (cekPoDariFpb[0].approval !== 'Y') {
                    return 'cekPoDariPB';
                } else {
                    const getEntUser: any = await GetEntitasUser(kode_entitas, userid, token);
                    // console.log('kode_entitas ', kode_entitas);
                    // console.log('getEntUser ', getEntUser[0].kode_entitas);
                    // console.log('getEntPusat ', getEntPusat[0].kode_entitas);
                    // console.log('statusExport ', statusExport);
                    // console.log('kontrak ', kontrak);

                    // const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
                    setGetEntitasPst(getEntPusat[0].kode_entitas);
                    if (kode_entitas !== getEntPusat[0].kode_entitas && getEntUser[0].kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil') {
                        const result = await Swal.fire({
                            title: `APPROVAL- PB INI KALO DARI FPB AKAN MEMBENTUK TRANSAKSI OTOMATIS, APABILA DARI PB MANUAL AKAN APPROVE PB SEBELUMNYA  \n LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
                            showCancelButton: true,
                            confirmButtonText: 'Ok',
                            target: '#approvalPB',
                            cancelButtonText: 'Batal',
                        });
                        if (result.isConfirmed) {
                            if (Persediaan !== 'N') {
                                return 'exportNonKontrak';
                            }
                        } else {
                            setFDO('');
                            return 'exportBatal';
                        }
                    } else if (kode_entitas === getEntPusat[0].kode_entitas && statusExport !== 'Berhasil' && kontrak === 'Y') {
                        const result = await Swal.fire({
                            title: `APPROVAL-- PB INI AKAN MEMBENTUK TRANSAKSI OTOMATIS, APABILA DARI PB MANUAL AKAN APPROVE PB SEBELUMNYA \n LANJUTKAN PROSES APPROVAL DAN TRANSAKSI OTOMATIS ?`,
                            showCancelButton: true,
                            confirmButtonText: 'Ok',
                            cancelButtonText: 'Batal',
                            target: '#approvalPB',
                        });
                        if (result.isConfirmed) {
                            if (Persediaan !== 'N') {
                                return 'exportKontrakPusat';
                            }
                        } else {
                            setFDO('');
                            return 'exportBatal';
                            // myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
                        }
                    } else {
                        // myAlertGlobal2('Segera lakukan pembuatan dokumen Faktur Pembelian untuk PB ini', 'approvalPB');
                    }
                }
            } else {
                return 'cekPoDariPB tidak tersedia';
            }
        } catch (error) {
            console.error('Error in validasiApproval:', error);
        }
    };

    const FetchDepartemen = async (kode_entitas: any): Promise<any[]> => {
        const response = await axios.get(`${apiUrl}/erp/get_kode_kerja?`, {
            params: {
                entitas: kode_entitas,
            },
        });
        const listDetailDokumen = response.data.data;
        // console.log(listDetailDokumen);

        return listDetailDokumen;
    };

    const FetchCustomerMapping = async (kode_entitas_pusat: any, kode_entitas_beli: any, token: any): Promise<any[]> => {
        const response = await axios.get(`${apiUrl}/erp/customer_mapping?`, {
            params: {
                entitas: kode_entitas_pusat,
                param1: kode_entitas_beli,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        const listDetailDokumen = response.data.data;
        return listDetailDokumen;
    };

    let sNoFBCabangBeli = '';
    let sNoSpmCabangBeli = ''; //generateNUDivisi(kode_entitas, '', sSoKodeJual, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJual);
    let sNoSjCabangBeli = ''; //generateNUDivisi(kode_entitas, '', sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
    let sNoFjCabangBeli = ''; //generateNUDivisi(kode_entitas, '', sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
    let sSoKodeJual = '';

    let sSoKodeJualPusat = '';
    let sNoPBPusat = ''; //await generateNU(getEntPusat[0].kode_entitas, '', '04', moment().format('YYYYMM'));
    let sNoFBPusat = ''; //generateNU(getEntPusat[0].kode_entitas, '', '03', moment().format('YYYYMM'));
    // let sNoFBPusat1 = '';
    // let sNoFBCabangBeli1 = '';
    // let sNoFBKontrakPusat1 = '';
    let sNoSpmPusat = ''; //generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJualPusat);
    let sNoSjPusat = ''; //await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJualPusat}`);
    let sNoFjPusat = ''; //await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '13', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJualPusat}`);
    let sNoFjCabang = ''; //await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '13', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJualPusat}`);

    let sNoFBKontrakPusat = '';
    let sNoMBKontrakPusat = ''; //await generateNU(kode_entitas, '', '23', moment().format('YYYYMM'));

    const ExportNonKontrakCabang = async (jsonApprovePb: any) => {
        // console.log('jsonApprovePb atas', jsonApprovePb);
        const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
        let itemFbCabangBeli = 0;
        let itemSPMCabangBeli = 0;
        let itemSJCabangBeli = 0;
        sNoFBCabangBeli = await generateNofakturFB(apiUrl, kode_entitas, noPB);
        //await generateNU(kode_entitas, '', '03', moment().format('YYYYMM')),
        // const sNoSOCabangBeli = await generateNUDivisi(kode_entitas, '', '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + '01');
        let sTotalMUSoCabang = 0;
        let sTotalBeratSoCabang = 0;
        let ssokode_custCabangBeli = '';
        let ssoalamat_kirim = '';
        let ssokode_kirim = '';
        let KodeSoCabang = '';
        let tglBackTimeDokumen: any;
        let tglBackTimeTrxDokumen: any;
        let tglResetTglSjDokumen: any;
        let tglResetTglSjPusatDokumen: any;
        let totalNilaiHpp: any;
        let sTotalNetto = 0;

        const cekPoDariFpb = await cekPoByKodeFpb(getEntPusat[0].kode_entitas, kodeFpb, token);

        const formatTgl = moment(TglPB).format('YYYY-MM-DD');
        tglBackTimeDokumen = await ResetTime2(kode_entitas, formatTgl);
        // const kodeAkun = await fetchPreferensi(kode_entitas, apiUrl);

        const formatTglSj = moment(TglSJ).format('YYYY-MM-DD HH:mm:ss');
        tglResetTglSjDokumen = await ResetTime2(kode_entitas, formatTglSj);
        tglResetTglSjPusatDokumen = await ResetTime2(getEntPusat[0].kode_entitas, formatTglSj);

        const vPBCabangBeliJson = {
            pb: {
                ...jsonApprovePb,
                audit: {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'PB',
                    kode_dokumen: kodePB,
                    no_dokumen: noPB,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'APPROVAL PB',
                    diskripsi: `Approval PB item = ${data.nodes.length} total_berat = ${totalBeratHeader} nilai transaksi ${totalNettoRPSetRef.current.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    userid: userid, // userid login web
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                },
            },
        };

        //FAKTUR BELI CABANG BELI
        const vDetailFbCabangBeli = async () => {
            const sKodeDeptCabang = await FetchDepartemen(kode_entitas);
            const dataDetail = await Promise.all(
                // data.nodes.map((item: any, idFbPusat: any) => {
                jsonApprovePb.detail.map((item: any, idFbPusat: any) => {
                    sTotalNetto = sTotalNetto + item.qty_std * item.harga_mu;
                    itemFbCabangBeli++;
                    return {
                        kode_fb: 'oto',
                        id_fb: idFbPusat + 1,
                        kode_lpb: item.kode_lpb,
                        id_lpb: item.id_lpb,
                        kode_sp: item.kode_sp,
                        id_sp: item.id_sp,
                        kode_pp: item.kode_pp,
                        id_pp: item.id_pp,
                        kode_item: item.kode_item,
                        diskripsi: item.diskripsi,
                        satuan: item.satuan,
                        qty: item.qty,
                        sat_std: item.sat_std,
                        // qty_std: item.qty_std,
                        qty_std: item.qty,
                        kode_mu: item.kode_mu,
                        kurs: item.kurs,
                        kurs_pajak: item.kurs_pajak,
                        harga_mu: item.harga_mu,
                        diskon: item.diskon,
                        diskon_mu: item.diskon_mu,
                        potongan_mu: item.potongan_mu,
                        kode_pajak: item.kode_pajak,
                        pajak: item.pajak,
                        include: item.include,
                        pajak_mu: item.pajak_mu,
                        jumlah_mu: item.jumlah_mu,
                        jumlah_rp: item.jumlah_rp,
                        ket: null,
                        kode_dept: sKodeDeptCabang[0].dept,
                        kode_kerja: null,
                        berat: item.berat,
                    };
                })
            );

            return dataDetail;
        };
        const FBCabangBeliJson = async () => {
            let sDetailFbCabangBeli = await vDetailFbCabangBeli();
            // let noDokBaru: any;
            // noDokBaru = await generateNU(kode_entitas, '', '03', moment().format('YYYYMM'));

            // const cekData = await cekDataDiDatabase(kode_entitas, 'tb_m_fb', 'no_fb', noDokBaru, token);
            // if (cekData) {
            //     // const cekNoDok = await cekDataDiDatabase(kode_entitas, 'tb_m_ttb_master', 'no_ttb', jsonData?.no_ttb, token);
            //     // sNoFBPusat = await generateNUDivisi(kode_entitas, defaultNoTtb, divisiPenjualan, '08', moment(date1).format('YYYYMM'), moment(date1).format('YYMM') + `${divisiPenjualan}`);
            //     sNoFBCabangBeli1 = await generateNU(kode_entitas, noDokBaru, '03', moment().format('YYYYMM'));
            //     sNoFBCabangBeli = await generateNU(kode_entitas, '', '03', moment().format('YYYYMM'));
            // } else {
            //     sNoFBCabangBeli = noDokBaru;
            // }
            const objectFbCabangBeli = {
                fb: {
                    kode_fb: 'oto',
                    no_fb: sNoFBCabangBeli,
                    tgl_fb: moment(jsonApprovePb.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    tgl_trxfb: moment(jsonApprovePb.tgl_trxlpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    tgl_buku: moment(jsonApprovePb.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    kode_supp: jsonApprovePb.kode_supp,
                    kode_termin: jsonApprovePb.kode_termin,
                    kode_mu: 'IDR',
                    kurs: kurs,
                    kurs_pajak: kursPajak,
                    kena_pajak: selectedOptionPajak,
                    no_faktur_pajak: null,
                    total_mu: subTotal * kurs,
                    diskon_dok: persenDiskon === null ? 0 : persenDiskon,
                    diskon_dok_mu: nominalDiskon === null ? 0 : nominalDiskon * kurs,
                    total_diskon_mu: totalDiskonRP * kurs,
                    total_pajak_mu: totalPajakSet * kurs,
                    kirim_mu: kirimMU,
                    // netto_mu: sTotalNetto, //totalNettoRPSet * kurs,
                    netto_mu: subTotal * kurs, //totalNettoRPSet * kurs,
                    memo_mu: 0,
                    lunas_mu: 0,
                    memo_pajak: 0,
                    lunas_pajak: 0,
                    total_rp: subTotal,
                    diskon_dok_rp: nominalDiskon === null ? 0 : nominalDiskon,
                    total_diskon_rp: totalDiskonRP + totalPotonganRP,
                    total_pajak_rp: totalPajakSet,
                    kirim_rp: kurs * kirimMU,
                    // netto_rp: sTotalNetto, //totalNettoRPSet,
                    netto_rp: subTotal * kurs, //totalNettoRPSet,
                    total_berat: totalBeratHeader,
                    kode_akun_kirim: kodeAkun[0]?.kode_akun_pengiriman,
                    kode_akun_diskon_termin: kodeAkun[0]?.kode_akun_diskon_item,
                    kode_akun_diskon_dok: kodeAkun[0]?.kode_akun_diskon_beli,
                    keterangan: Keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_lpb: kodePB,
                    fdo: null,
                    ppn: selectedOptionPajak,
                    detail: [...sDetailFbCabangBeli],
                    audit: {
                        entitas: kode_entitas,
                        kode_audit: 'oto',
                        dokumen: 'FB',
                        kode_dokumen: 'oto',
                        no_dokumen: sNoFBCabangBeli,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'NEW',
                        diskripsi: `Auto FB Approval disetujui item =  ${itemFbCabangBeli}  nilai transaksi ${(subTotal * kurs).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        userid: userid, // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    },
                },
            };
            let returnObjekFbCabangBeli = { ...objectFbCabangBeli };

            return returnObjekFbCabangBeli;
        };

        let sTotalMUSoSPMCabang = 0;
        let sTotalBeratSoSPMCabang = 0;
        //SPM CABANG BELI
        const vDetailSPMCabangBeli = async () => {
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdSPM: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdSPM: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '' && item.cara_kirim === 'KP') {
                        KodeSoCabang = item.kode_so;
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_cabang?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.kode_so,
                                param2: item.id_so,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSo = response.data.data;

                        // if (getDetailSo.length >= 1) {
                        sSoKodeJual = item.kode_jual;
                        // sTotalMUSoCabang = sTotalMUSoCabang + item.qty_std * getDetailSo[0].harga_mu;
                        // sTotalBeratSoCabang = sTotalBeratSoCabang + item.qty_std * item.brt;

                        sTotalMUSoSPMCabang = sTotalMUSoSPMCabang + item.qty * getDetailSo[0].harga_mu;
                        sTotalBeratSoSPMCabang = sTotalBeratSoSPMCabang + item.qty * item.brt;

                        itemSPMCabangBeli++;

                        return {
                            kode_do: 'oto',
                            id_do: sIdSPM + 1,
                            kode_so: item.kode_so,
                            id_so: item.id_so,
                            kode_item: item.kode_item,
                            diskripsi: item.diskripsi,
                            satuan: item.satuan,
                            // qty: item.qty,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std, //item.qty_std - item.qty,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getDetailSo[0].harga_mu,
                            diskon: getDetailSo[0].diskon,
                            diskon_mu: getDetailSo[0].diskon_mu,
                            potongan_mu: getDetailSo[0].potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: item.qty_std * getDetailSo[0].harga_mu,
                            // jumlah_rp: item.qty_std * getDetailSo[0].harga_mu,
                            jumlah_mu: item.qty * getDetailSo[0].harga_mu,
                            jumlah_rp: item.qty * getDetailSo[0].harga_mu,
                            berat: getDetailSo[0].berat,
                            kode_dept: getDetailSo[0].kode_dept,
                            kode_kerja: getDetailSo[0].kode_kerja,
                            qty_batal: 0,
                            cara_kirim: item?.cara_kirim,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            // console.log('dataDetail SPM', dataDetail);
            return dataDetail;
        };
        const SPMCabangBeliJson = async () => {
            // console.log('sSoKodeJual ', sSoKodeJual);
            let sDetailsPMCabangBeli = await vDetailSPMCabangBeli();
            // const newData = sDetailsPMCabangBeli.find(async (item) => item.cara_kirim === 'KP');
            // console.log('iiii', newData);
            if (sDetailsPMCabangBeli?.every((item: any) => item?.cara_kirim === 'KP')) {
                sNoSpmCabangBeli = await generateNUDivisi(kode_entitas, '', sSoKodeJual, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJual);
                const sKodeDeptCabang = await FetchDepartemen(kode_entitas);
                // let KodeDeptCabang = sKodeDeptCabang[0]?.dept;
                // let KodeKerjaCabang = sKodeDeptCabang[0]?.kerja;

                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: KodeSoCabang,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSo = response.data.data;
                if (getMasterSo.length > 0) {
                    ssokode_custCabangBeli = getMasterSo[0].kode_cust;
                    ssoalamat_kirim = getMasterSo[0].alamat_kirim;
                    ssokode_kirim = getMasterSo[0].kode_kirim;
                    const objectSpmCabangBeli = {
                        spm: {
                            kode_do: 'oto',
                            no_do: sNoSpmCabangBeli,
                            tgl_do: TglPB,
                            tgl_kirim: moment(TglSJ).format('YYYY-MM-DD'),
                            kode_cust: ssokode_custCabangBeli,
                            alamat_kirim: ssoalamat_kirim,
                            via: 'ARMADA PABRIK',
                            fob: 'Dikirim',
                            pengemudi: pengemudi,
                            nopol: nopol,
                            total_berat: sTotalBeratSoSPMCabang,
                            keterangan: '[Otomatis SPM (Approve PB) - No PB Cabang : ' + noPB + ']',
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            kode_gudang: kodeGudang,
                            kode_kirim: ssokode_kirim,
                            kode_jual: sSoKodeJual,
                            keterangan_batal: null,
                            nota: null,
                            fdo: null,
                            cetak_tunai: getMasterSo[0].cetak_tunai,
                            detail: [...sDetailsPMCabangBeli],
                            audit: {
                                entitas: kode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'DO',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoSpmCabangBeli,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto SPM item =  ${itemSPMCabangBeli}  total berat ${sTotalBeratSoSPMCabang.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekSpmCabangBeli = { ...objectSpmCabangBeli };
                    return returnObjekSpmCabangBeli;
                } else {
                    // console.log('Master So Kosong');
                    return null;
                }
            } else {
                return null;
            }

            // return newData;
        };

        //SJ CABANG BELI
        let totalNilaiHppSj = 0;
        let nilaiHpp = 0;
        let sTotalMUSoSJCabang = 0;
        let sTotalBeratSoSJCabang = 0;

        const vDetailSJCabangBeli = async () => {
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdSj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdSj: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '' && item.cara_kirim === 'KP') {
                        KodeSoCabang = item.kode_so;
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_cabang?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.kode_so,
                                param2: item.id_so,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSo = response.data.data;

                        // if (getDetailSo.length >= 1) {
                        // sSoKodeJual = item.kode_jual;

                        const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');

                        const responseHpp = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.kode_item,
                                param2: vTgl, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: kodeGudang, //item.kode_booking,
                            },
                        });

                        const responseDataHpp = responseHpp.data.data;

                        // perubahaan dan penambhana pengecekna item untuk mengambil nama_cetak
                        // 2025-05-26
                        const resultItemNamaCetak = await axios.get(`${apiUrl}/erp/harga_per_item?`, {
                            params: {
                                entitas: kode_entitas,
                                kode_item: item.kode_item,
                            },
                        });

                        const responseItemNamaCetak = resultItemNamaCetak.data.data;
                        // =====

                        nilaiHpp = responseDataHpp.hpp;
                        // totalNilaiHppSj = totalNilaiHppSj + responseDataHpp.hpp * getDetailSo[0].qty_std;
                        // totalNilaiHppSj = totalNilaiHppSj + responseDataHpp.hpp * getDetailSo[0].qty; perubahan 11-07-2025
                        totalNilaiHppSj = totalNilaiHppSj + responseDataHpp.hpp * item.qty; // Perubahan tanggal 2025-07-11

                        // sTotalMUSoCabang = sTotalMUSoCabang + item.qty_std * getDetailSo[0].harga_mu;
                        // sTotalBeratSoCabang = sTotalBeratSoCabang + item.qty_std * item.brt;

                        sTotalMUSoSJCabang = sTotalMUSoSJCabang + item.qty * getDetailSo[0].harga_mu;
                        sTotalBeratSoSJCabang = sTotalBeratSoSJCabang + item.qty * item.brt;

                        itemSJCabangBeli++;

                        return {
                            kode_sj: 'oto',
                            id_sj: sIdSj + 1,
                            kode_do: 'oto',
                            id_do: sIdSj + 1,
                            kode_so: item.kode_so,
                            id_so: item.id_so,
                            kode_item: item.kode_item,
                            // diskripsi: item.diskripsi,
                            diskripsi:
                                responseItemNamaCetak.length > 0
                                    ? responseItemNamaCetak[0].nama_cetak === '' || responseItemNamaCetak[0].nama_cetak === null || responseItemNamaCetak[0].nama_cetak === undefined
                                        ? item.diskripsi
                                        : responseItemNamaCetak[0].nama_cetak
                                    : item.diskripsi, // Perubahan 2025-05-26
                            satuan: item.satuan,
                            // qty: item.qty_std,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            //qty_sisa: item.qty_std - item.qty,
                            qty_retur: 0,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getDetailSo[0].harga_mu,
                            hpp: responseDataHpp.hpp,
                            diskon: getDetailSo[0].diskon,
                            diskon_mu: getDetailSo[0].diskon_mu,
                            potongan_mu: getDetailSo[0].potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: item.qty_std * getDetailSo[0].harga_mu,
                            // jumlah_rp: item.qty_std * getDetailSo[0].harga_mu,
                            jumlah_mu: item.qty * getDetailSo[0].harga_mu,
                            jumlah_rp: item.qty * getDetailSo[0].harga_mu,
                            kode_dept: null,
                            kode_kerja: null,
                            diskon_dok_mu: 0,
                            kirim_mu: 0,
                            no_kontrak: null,
                            no_mbref: null,
                            no_lpb: noPB,
                            cara_kirim: item?.cara_kirim,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };
        const SJCabangBeliJson = async () => {
            let sDetailSJCabangBeli = await vDetailSJCabangBeli();

            if (sDetailSJCabangBeli?.every((item: any) => item?.cara_kirim === 'KP')) {
                sNoSjCabangBeli = await generateNUDivisi(kode_entitas, '', sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);

                const sTotalMUSoCabang = sDetailSJCabangBeli?.reduce((total: any, item: any) => {
                    return total + parseFloat(item?.jumlah_m || 0);
                }, 0);

                const detailjsonApprovePb = await jsonApprovePb.detail;
                const totalBerat = detailjsonApprovePb?.reduce((total: any, item: any) => {
                    return total + parseFloat(item.qty_std) * parseFloat(item.brt);
                }, 0);

                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: KodeSoCabang,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSo = response.data.data;

                if (getMasterSo.length > 0) {
                    ssokode_custCabangBeli = getMasterSo[0].kode_cust;
                    ssoalamat_kirim = getMasterSo[0].alamat_kirim;
                    ssokode_kirim = getMasterSo[0].kode_kirim;

                    const objectSjCabangBeli = {
                        sj: {
                            kode_sj: 'oto',
                            no_sj: sNoSjCabangBeli,
                            tgl_sj: tglBackTimeDokumen,
                            // tgl_trxsj: tglBackTimeDokumen,
                            tgl_trxsj: tglResetTglSjDokumen,
                            no_reff: null,
                            kode_gudang: kodeGudang,
                            kode_cust: ssokode_custCabangBeli,
                            alamat_kirim: ssoalamat_kirim,
                            via: 'ARMADA PABRIK',
                            fob: 'Dikirim',
                            pengemudi: pengemudi,
                            nopol: nopol,
                            // total_rp: sTotalMUSoCabang ?? 0,
                            total_rp: sTotalMUSoSJCabang,
                            total_diskon_rp: 0,
                            total_pajak_rp: 0,
                            // netto_rp: sTotalMUSoCabang ?? 0,
                            netto_rp: sTotalMUSoSJCabang,
                            total_berat: sTotalBeratSoSJCabang,
                            keterangan: '[Otomatis SJ (Approve PB) - No PB Cabang : ' + noPB + ']',
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            dokumen: null,
                            kode_jual: sSoKodeJual,
                            kirim: 'N',
                            nota: null,
                            cetak_tunai: getMasterSo[0].cetak_tunai,
                            detail: [...sDetailSJCabangBeli],
                            jurnal: [
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 1,
                                    dokumen: 'SJ',
                                    tgl_dokumen: TglPB,
                                    kode_akun: kodeAkun[0]?.kode_akun_hpp,
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: totalNilaiHppSj,
                                    kredit_rp: 0,
                                    jumlah_rp: totalNilaiHppSj,
                                    jumlah_mu: totalNilaiHppSj,
                                    catatan: 'Harga Pokok No. SJ: ' + sNoSjCabangBeli,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                    no_kontrak_um: null,
                                },
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 2,
                                    dokumen: 'SJ',
                                    tgl_dokumen: TglPB,
                                    kode_akun: kodeAkun[0]?.kode_akun_persediaan,
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: 0,
                                    kredit_rp: totalNilaiHppSj,
                                    jumlah_rp: -totalNilaiHppSj,
                                    jumlah_mu: -totalNilaiHppSj,
                                    catatan: 'Persediaan barang No. SJ: ' + sNoSjCabangBeli,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                    no_kontrak_um: null,
                                },
                            ],
                            audit: {
                                entitas: kode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'SJ',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoSjCabangBeli,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto SJ item =  ${itemSJCabangBeli}   total berat = ${sTotalBeratSoSJCabang} nilai transaksi ${sTotalMUSoSJCabang.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid,
                                system_user: '',
                                system_ip: '',
                                system_mac: '',
                            },
                        },
                    };
                    let returnObjekSJCabangBeli = { ...objectSjCabangBeli };
                    return returnObjekSJCabangBeli;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        };

        //FJ CABANG BELI
        let totalNilaiHppFJCabang = 0;
        let itemFJCabangBeli = 0;
        let potonganFJCabang = 0;
        let sTotalMUSoFJCabang = 0;
        let sTotalBeratSoFJCabang = 0;

        const vDetailFJCabangBeli = async () => {
            // console.log('PARAMETER kode_entitas ', kode_entitas);
            sTotalMUSoCabang = 0;
            sTotalBeratSoCabang = 0;
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdFj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdFj: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '' && item.cara_kirim === 'KP') {
                        KodeSoCabang = item.kode_so;
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_cabang?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.kode_so,
                                param2: item.id_so,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSo = response.data.data;

                        // if (getDetailSo.length >= 1) {
                        // sSoKodeJual = item.kode_jual;

                        const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');

                        const responseHpp = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.kode_item,
                                param2: vTgl, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: kodeGudang,
                            },
                        });

                        const responseDataHpp = await responseHpp.data.data;

                        // perubahaan dan penambhana pengecekna item untuk mengambil nama_cetak
                        // 2025-05-26
                        const resultItemNamaCetak = await axios.get(`${apiUrl}/erp/harga_per_item?`, {
                            params: {
                                entitas: kode_entitas,
                                kode_item: getDetailSo[0].kode_item,
                            },
                        });

                        const responseItemNamaCetak = resultItemNamaCetak.data.data;
                        // =====

                        if (item.diskon_mu > 0 || item.potongan_mu > 0) {
                            //   IsBonus = true;
                            potonganFJCabang = potonganFJCabang + item.kurs * item.qty_std * (item.diskon_mu + item.potongan_mu);
                        }

                        // totalNilaiHpp = totalNilaiHpp + responseDataHpp.hpp * getDetailSo[0].qty_std;
                        totalNilaiHppFJCabang = totalNilaiHppFJCabang + responseDataHpp.hpp * getDetailSo[0].qty;

                        // sTotalMUSoCabang = sTotalMUSoCabang + item.qty_std * getDetailSo[0].harga_mu;
                        // sTotalBeratSoCabang = sTotalBeratSoCabang + item.qty_std * item.brt;

                        sTotalMUSoFJCabang = sTotalMUSoFJCabang + item.qty * getDetailSo[0].harga_mu;
                        sTotalBeratSoFJCabang = sTotalBeratSoFJCabang + item.qty * item.brt;

                        itemFJCabangBeli++;

                        return {
                            kode_fj: 'oto',
                            id_fj: sIdFj + 1,
                            kode_sj: 'oto',
                            id_sj: sIdFj + 1,
                            kode_do: 'oto',
                            id_do: sIdFj + 1,
                            kode_so: getDetailSo[0].kode_so,
                            id_so: getDetailSo[0].id_so,
                            kode_item: getDetailSo[0].kode_item,
                            // diskripsi: getDetailSo[0].diskripsi,
                            diskripsi:
                                responseItemNamaCetak.length > 0
                                    ? responseItemNamaCetak[0].nama_cetak === '' || responseItemNamaCetak[0].nama_cetak === null || responseItemNamaCetak[0].nama_cetak === undefined
                                        ? getDetailSo[0].diskripsi
                                        : responseItemNamaCetak[0].nama_cetak
                                    : getDetailSo[0].diskripsi, // Perubahan 2025-05-26
                            satuan: getDetailSo[0].satuan,
                            // qty: item.qty_std,
                            qty: item.qty,
                            sat_std: getDetailSo[0].sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getDetailSo[0].harga_mu,
                            diskon: getDetailSo[0].diskon,
                            diskon_mu: getDetailSo[0].diskon_mu,
                            potongan_mu: getDetailSo[0].potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: getDetailSo[0].harga_mu * item.qty_std,
                            // jumlah_rp: getDetailSo[0].harga_mu * item.qty_std,
                            jumlah_mu: getDetailSo[0].harga_mu * item.qty,
                            jumlah_rp: getDetailSo[0].harga_mu * item.qty,
                            berat: getDetailSo[0].berat,
                            kode_dept: null,
                            kode_kerja: null,
                            hpp: responseDataHpp.hpp,
                            bonus: 'N',
                            id_bonus: 0,
                            id_fbm: 0,
                            cara_kirim: item?.cara_kirim,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };
        const FJCabangBeliJson = async () => {
            let sDetailFJCabangBeli = await vDetailFJCabangBeli();

            // sNoFjCabang = oneToOneNumber(sNoSjCabangBeli, '13', new Date());
            if (sDetailFJCabangBeli?.every((item: any) => item?.cara_kirim === 'KP')) {
                // sNoFjCabangBeli = await generateNUDivisi(kode_entitas, '', sSoKodeJual, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJual}`);
                const modifiedNoSJ = sNoSjCabangBeli.toString().split('');
                if (modifiedNoSJ.length >= 4 && !isNaN(parseInt(modifiedNoSJ[3]))) {
                    modifiedNoSJ[3] = (parseInt(modifiedNoSJ[3]) + 1).toString();
                }
                const newNoSJ = modifiedNoSJ.join('');
                sNoFjCabangBeli = newNoSJ;

                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: KodeSoCabang,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSo = response.data.data;
                if (getMasterSo.length > 0) {
                    const formatTgl = moment(TglPB).format('YYYY-MM-DD');
                    const formatTglTrxLpb = moment(TglTrxLpb).format('YYYY-MM-DD');
                    const kodeAkun = await fetchPreferensi(kode_entitas, apiUrl);
                    const responseKodeAkunByCust = await axios.get(`${apiUrl}/erp/kode_piutang_by_cust?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: getMasterSo[0].kode_cust,
                        },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const getKodeAkunByCust = responseKodeAkunByCust.data.data;
                    tglBackTimeDokumen = await ResetTime2(kode_entitas, formatTgl);
                    tglBackTimeTrxDokumen = await ResetTime2(kode_entitas, formatTglTrxLpb);
                    ssokode_custCabangBeli = getMasterSo[0].kode_cust;
                    ssoalamat_kirim = getMasterSo[0].alamat_kirim;
                    ssokode_kirim = getMasterSo[0].kode_kirim;
                    const objectFjCabangBeli = {
                        fj: {
                            kode_fj: 'oto',
                            no_fj: sNoFjCabangBeli,
                            tgl_fj: tglBackTimeDokumen, //Now,
                            tgl_trxfj: tglBackTimeTrxDokumen, //Now,
                            tgl_buku: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //Now,
                            no_reff: null,
                            kode_sales: getMasterSo[0].kode_sales,
                            kode_cust: getMasterSo[0].kode_cust,
                            kode_akun_piutang: null,
                            tgl_kirim: null,
                            alamat_kirim: getMasterSo[0].alamat_kirim,
                            via: 'ARMADA PABRIK',
                            fob: null,
                            kode_termin: getMasterSo[0].kode_termin,
                            kode_mu: getMasterSo[0].kode_mu,
                            kurs: getMasterSo[0].kurs,
                            kurs_pajak: getMasterSo[0].kurs_pajak,
                            kena_pajak: getMasterSo[0].kena_pajak,
                            no_faktur_pajak: null,
                            diskon_dok: null,
                            total_mu: getMasterSo[0].total_mu,
                            diskon_dok_mu: 0,
                            total_diskon_mu: 0,
                            total_pajak_mu: 0,
                            kirim_mu: 0,
                            // netto_mu: sTotalMUSoCabang,
                            netto_mu: sTotalMUSoFJCabang,
                            uang_Muka_mu: 0,
                            memo_mu: null,
                            lunas_mu: 0,
                            memo_pajak: null,
                            lunas_pajak: null,
                            // total_rp: sTotalMUSoCabang,
                            total_rp: sTotalMUSoFJCabang,
                            diskon_dok_rp: 0,
                            total_diskon_rp: 0,
                            total_pajak_rp: 0,
                            kirim_rp: 0,
                            // netto_rp: sTotalMUSoCabang,
                            netto_rp: sTotalMUSoFJCabang,
                            // total_berat: sTotalBeratSoCabang,
                            total_berat: sTotalBeratSoFJCabang,
                            kode_akun_kirim: null,
                            kode_akun_diskon_termin: null,
                            kode_akun_diskon_dok: null,
                            keterangan: `[No PB Cabang : ${noPB} `,
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            dokumen: 'Dikirim',
                            beban_antar_cabang: null,
                            kode_tagih: getMasterSo[0].kode_sales,
                            kode_penjual: getMasterSo[0].kode_sales,
                            bd: 'N',
                            bayar_mu: null,
                            tunai: null,
                            debet: null,
                            debet_tunai: null,
                            kredit: null,
                            kredit_dp: null,
                            kredit_diskon: null,
                            kredit_bp: null,
                            kredit_biaya: null,
                            voucher: null,
                            bulat: null,
                            kode_mk: null,
                            retur: null,
                            tum: null,
                            kode_tum: null,
                            koreksi: 'N',
                            referal: null,
                            kode_jual: sSoKodeJual,
                            approval: 'Y',
                            apptime: null,
                            fdo: null,
                            komplit: 'N',
                            fbm: null,
                            klaim: 'N',
                            nama_om: null,
                            nama_spv: null,
                            tgl_limpahan: null,
                            sales_penjual: null,
                            cetak_tunai: getMasterSo[0].cetak_tunai,
                            kode_termin_cetak_fj: null,
                            jenis_limpahan: null,
                            tarik_fpac: 'N',
                            ppn: 'N',
                            transfer: 0,
                            detail: [...sDetailFJCabangBeli],
                            jurnal: [
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 1,
                                    dokumen: 'FJ',
                                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                    kode_akun: getKodeAkunByCust[0].Kode_akun_piutang,
                                    kode_subledger: getMasterSo[0].kode_cust,
                                    kurs: kurs,
                                    debet_rp: sTotalMUSoFJCabang * kurs - 0 * kurs,
                                    kredit_rp: 0,
                                    jumlah_rp: sTotalMUSoFJCabang * kurs - 0 * kurs,
                                    jumlah_mu: sTotalMUSoFJCabang * kurs - 0 * kurs,
                                    catatan: 'Piutang Faktur No  ' + sNoFjCabangBeli,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                    no_kontrak_um: null,
                                },
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 2,
                                    dokumen: 'FJ',
                                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                    kode_akun: kodeAkun[0].kode_akun_jual,
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: 0,
                                    kredit_rp: sTotalMUSoFJCabang * kurs + potonganFJCabang * kurs,
                                    jumlah_rp: -(sTotalMUSoFJCabang * kurs) + potonganFJCabang * kurs,
                                    jumlah_mu: -(sTotalMUSoFJCabang * kurs) + potonganFJCabang * kurs,
                                    catatan: 'Penjualan  faktur No. ' + sNoFjCabangBeli + ' kepada ' + getKodeAkunByCust[0].nama_relasi,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                    no_kontrak_um: null,
                                },
                            ],
                            audit: {
                                entitas: kode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'FJ',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoFjCabangBeli,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto FJ item =  ${itemFJCabangBeli} nilai transaksi ${sTotalMUSoFJCabang.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekFjCabangBeli = { ...objectFjCabangBeli };
                    return returnObjekFjCabangBeli;
                } else {
                    // console.log('Master So Kosong');
                    return null;
                }
            } else {
                return null;
            }
        };

        // const vPBCabangBeliJson = PBCabangBeliJson; //await PBCabangBeliJson();
        const vFBCabangBeliJson = await FBCabangBeliJson();
        const vSPMCabangBeliJson = await SPMCabangBeliJson();

        const vSJCabangBeliJson = await SJCabangBeliJson();
        const vFJCabangBeliJson = await FJCabangBeliJson();

        //===========================OTOMATIS PUSAT====================================
        //=============================================================================
        //=============================================================================
        // console.log('OTOMATIS PUSAT');
        let sTotalMUPOOS = 0;
        let sTotalBeratPOOS = 0;
        let sTotalMUST = 0;
        let sTotalBeratST = 0;
        let itemPbPusat = 0;
        let itemFbPusat = 0;
        let sTerminPusat = '';
        let sKodeSuppPusat = '';
        let tipeBooking = '';
        //SPM PUSAT
        let sTotalMUSoPusat = 0;
        let sTotalBeratSoPusat = 0;
        let sTotalJumlahMuPusat = 0;
        let itemSPMPusat = 0;

        let KodeSoPusat = '';
        let ssokode_custPusat = '';

        const sKodeDeptPusat = await FetchDepartemen(getEntPusat[0].kode_entitas);

        const vDetailPBPusat = async () => {
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdFj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdPb: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '') {
                        const responseFpb = await axios.get(`${apiUrl}/erp/get_detail_fpb_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailFpb = responseFpb.data.data;
                        sKodeSuppPusat = getDetailFpb[0].kode_booking;

                        // if (getDetailFpb.length >= 1) {
                        const responseSp = await axios.get(`${apiUrl}/erp/get_sp_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                                param3: getDetailFpb[0].tipe_booking === 'PO' ? 'PO' : getDetailFpb[0].tipe_booking === 'OS' ? 'OS' : '',
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        const getSpPusat = responseSp.data.data;
                        sTerminPusat = getSpPusat[0].kode_termin;

                        if (getDetailFpb[0].tipe_booking === 'PO' || getDetailFpb[0].tipe_booking === 'OS') {
                            // sTotalMUPOOS = sTotalMUPOOS + item.qty_std * getSpPusat[0].harga_mu;
                            // sTotalBeratPOOS = sTotalBeratPOOS + item.qty_std * item.brt;
                            sTotalMUPOOS = sTotalMUPOOS + item.qty * getSpPusat[0].harga_mu;
                            sTotalBeratPOOS = sTotalBeratPOOS + item.qty * item.brt;
                        } else if (getDetailFpb[0].tipe_booking === 'ST') {
                            // sTotalMUST = sTotalMUST + item.qty_std * item.harga_mu;
                            // sTotalBeratST = sTotalBeratST + item.qty_std * item.brt;
                            sTotalMUST = sTotalMUST + item.qty * item.harga_mu;
                            sTotalBeratST = sTotalBeratST + item.qty * item.brt;
                        }

                        // if (getDetailFpb[0].tipe_booking === 'PO') {

                        // }
                        // if (getSpPusat.length >= 1) {
                        const responseItem = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        const vItem = responseItem.data.data;

                        itemPbPusat++;
                        // console.log('getSpPusat', getSpPusat);
                        return {
                            kode_fb: 'oto',
                            kode_lpb: 'oto',
                            id_lpb: sIdPb + 1,
                            kode_sp: getSpPusat[0].kode_sp,
                            id_sp: getSpPusat[0].id_sp,
                            kode_pp: getSpPusat[0].kode_sp === null ? '' : getSpPusat[0].kode_pp,
                            id_pp: getSpPusat[0].id_pp,
                            kode_item: vItem[0].kode_item,
                            diskripsi: vItem[0].nama_item,
                            satuan: item.satuan,
                            qty_po: getSpPusat[0].qty,
                            sat_sj: item.satuan,
                            qty_sj: item.qty_sj,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            // qty_sisa: item.qty_std - item.qty,
                            qty_retur: 0,
                            qty_lkb: 0,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getSpPusat[0].harga_mu,
                            diskon: item.diskon,
                            diskon_mu: item.diskon_mu,
                            potongan_mu: item.potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: item.qty_std * getSpPusat[0].harga_mu,
                            // jumlah_rp: item.qty_std * getSpPusat[0].harga_mu,
                            jumlah_mu: item.qty * getSpPusat[0].harga_mu,
                            jumlah_rp: item.qty * getSpPusat[0].harga_mu,
                            ket: '[No PB Cabang : ' + kode_entitas + '-' + noPB + ']',
                            kode_dept: sKodeDeptPusat[0]?.dept,
                            kode_kerja: null,
                            export: 'N',
                            kode_fpb: getDetailFpb[0].kode_fpb,
                            id_fpb: getDetailFpb[0].id_fpb,
                            kode_fpac: null,
                            id_fpac: null,
                            ty_fdo: 0,
                            no_kontrak: null,
                        };
                        // }
                        // else {
                        //     return null;
                        // }
                        // } else {
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };
        const vJurnalPBPusat = async (sNoPBJurnalPusat: any) => {
            let getsuppByKode: any;
            let vKodeAkun: any;
            let vCatatan: any;
            let vKodeSubLedger: any;
            const response = await axios.get(`${apiUrl}/erp/get_supp_by_kode`, {
                params: {
                    entitas: getEntPusat[0].kode_entitas,
                    param1: sKodeSuppPusat,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            getsuppByKode = response.data.data;

            const quSetting = await fetchPreferensi(getEntPusat[0].kode_entitas, apiUrl);

            if (getsuppByKode[0].nama_termin === 'C.O.D') {
                vKodeAkun = quSetting[0].kode_akun_kas;
                vCatatan = 'Pembelian Barang PB No: ' + sNoPBJurnalPusat;
            } else {
                vKodeAkun = quSetting[0].kode_akun_hutang;
                vCatatan = `Hutang  ${getsuppByKode[0].nama_relasi}, PB No: ${sNoPBJurnalPusat}`;
            }
            if (getsuppByKode[0].tipe !== 'cabang') {
                vKodeSubLedger = sKodeSuppPusat;
            } else {
                vKodeSubLedger = null;
            }

            const dataDetail = [
                {
                    kode_dokumen: 'oto',
                    id_dokumen: 1,
                    dokumen: 'PB',
                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: quSetting[0].kode_akun_persediaan,
                    kode_subledger: null,
                    kurs: 1,
                    debet_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,
                    kredit_rp: 0,
                    jumlah_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,
                    jumlah_mu: tipeBooking === 'ST' ? sTotalMUST / 1 : sTotalMUPOOS / 1, //totpsd / 1,
                    catatan: 'Penerimaan Barang No: ' + sNoPBJurnalPusat,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0,
                    kode_dept: sKodeDeptPusat[0].dept,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                },
                {
                    kode_dokumen: 'oto',
                    id_dokumen: 2,
                    dokumen: 'PB',
                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'),
                    kode_akun: vKodeAkun,
                    kode_subledger: vKodeSubLedger,
                    kurs: 1,
                    debet_rp: 0,
                    kredit_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS,
                    jumlah_rp: tipeBooking === 'ST' ? -1 * sTotalMUST : -1 * sTotalMUPOOS, //-1 * totpsd,
                    jumlah_mu: tipeBooking === 'ST' ? -1 * (sTotalMUST / 1) : -1 * (sTotalMUPOOS / 1), //-1 * (totpsd / 1),
                    catatan: vCatatan,
                    no_warkat: null,
                    tgl_valuta: null,
                    persen: 0,
                    kode_dept: sKodeDeptPusat[0].dept,
                    kode_kerja: null,
                    approval: 'N',
                    posting: 'N',
                    rekonsiliasi: 'N',
                    tgl_rekonsil: null,
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    audit: null,
                    kode_kry: null,
                    kode_jual: null,
                    no_kontrak_um: null,
                },
            ];

            return dataDetail;
        };
        const PBPusatJson = async () => {
            if (cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null) {
                let tglResetDokumen: any;
                let tglResetTrxDokumen: any;
                const quCustMapping = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
                sNoPBPusat = await generateNU(getEntPusat[0].kode_entitas, '', '04', moment().format('YYYYMM'));
                const formatTglPb = moment(TglPB).format('YYYY-MM-DD HH:mm:ss');
                const formatTglTrxLpb = moment(TglTrxLpb).format('YYYY-MM-DD HH:mm:ss');
                tglResetDokumen = await ResetTime2(getEntPusat[0].kode_entitas, formatTglPb);
                tglResetTrxDokumen = await ResetTime2(getEntPusat[0].kode_entitas, formatTglTrxLpb);
                const kodeAkunPusat = await fetchPreferensi(getEntPusat[0].kode_entitas, apiUrl);

                let getsuppByKode: any;

                const sDetailPBPusat = await vDetailPBPusat();
                const sJurnalPBPusat = await vJurnalPBPusat(sNoPBPusat);

                const response = await axios.get(`${apiUrl}/erp/get_supp_by_kode`, {
                    params: {
                        entitas: getEntPusat[0].kode_entitas,
                        param1: sKodeSuppPusat,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                getsuppByKode = response.data.data;

                const objectPbPusat = {
                    pb: {
                        kode_lpb: 'oto',
                        no_lpb: sNoPBPusat,
                        tgl_lpb: tglResetDokumen,
                        tgl_trxlpb: tglResetTrxDokumen,
                        tgl_sj: TglSJ,
                        no_reff: NoReff,
                        dokumen: dokumen,
                        kode_gudang: quCustMapping[0].kode_gudang,
                        kode_supp: sKodeSuppPusat,
                        fob: null,
                        via: via,
                        pengemudi: pengemudi,
                        nopol: nopol,
                        persediaan: Persediaan,
                        total_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS,
                        total_diskon_rp: 0,
                        total_pajak_rp: 0,
                        netto_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS,
                        keterangan: '[No PB Cabang : ' + kode_entitas + '-' + noPB + ']', //+' '#13+
                        total_berat: tipeBooking === 'ST' ? sTotalBeratST : sTotalBeratPOOS,
                        status: 'Terbuka',
                        userid: userid,
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        kirim: 0,
                        kirim_mu: 0,
                        diskon_dok: null,
                        diskon_dok_rp: 0,
                        kena_pajak: getsuppByKode[0].kode_pajak === null || getsuppByKode[0].kode_pajak === 'N' ? 'N' : 'I',
                        kode_termin: sTerminPusat,
                        kontrak: kontrak,
                        status_export: null,
                        fdo: null,
                        status_dok: null,
                        no_pralpb: null,
                        tgl_pralpb: null,
                        detail: [...sDetailPBPusat],
                        jurnal: [...sJurnalPBPusat],
                        audit: {
                            entitas: getEntPusat[0].kode_entitas,
                            kode_audit: 'oto',
                            dokumen: 'PB',
                            kode_dokumen: 'oto',
                            no_dokumen: sNoPBPusat,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'NEW',
                            diskripsi: `Auto PB Approval item =  ${itemPbPusat}  total berat ${sTotalBeratPOOS} nilai transaksi ${(tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS).toLocaleString(
                                'en-US',
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        },
                    },
                };
                let returnObjekPbPusat = { ...objectPbPusat };
                return returnObjekPbPusat;
            } else {
                return null;
            }
        };

        let sTotalMUPOOSFB = 0;
        let sTotalBeratPOOSFB = 0;
        let sTotalMUSTFB = 0;
        let sTotalBeratSTFB = 0;
        const vDetailFBPusat = async () => {
            sTotalMUPOOS = 0;
            sTotalBeratPOOS = 0;
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdFj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdFB: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '') {
                        const response = await axios.get(`${apiUrl}/erp/get_detail_fpb_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailFpb = response.data.data;
                        sKodeSuppPusat = getDetailFpb[0].kode_booking;

                        const responseSp = await axios.get(`${apiUrl}/erp/get_sp_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                                param3: getDetailFpb[0].tipe_booking === 'PO' ? 'PO' : getDetailFpb[0].tipe_booking === 'OS' ? 'OS' : '',
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        const getSpPusat = responseSp.data.data;
                        sTerminPusat = getSpPusat[0].kode_termin;

                        // if (getDetailFpb.length >= 1) {
                        if (getDetailFpb[0].tipe_booking === 'PO' || getDetailFpb[0].tipe_booking === 'OS') {
                            // sTotalMUPOOS = sTotalMUPOOS + item.qty_std * getSpPusat[0].harga_mu;
                            // sTotalBeratPOOS = sTotalBeratPOOS + item.qty_std * item.brt;
                            sTotalMUPOOSFB = sTotalMUPOOSFB + item.qty * getSpPusat[0].harga_mu;
                            sTotalBeratPOOSFB = sTotalBeratPOOSFB + item.qty * item.brt;
                        } else if (getDetailFpb[0].tipe_booking === 'ST') {
                            // sTotalMUST = sTotalMUST + item.qty_std * item.harga_mu;
                            // sTotalBeratST = sTotalBeratST + item.qty_std * item.brt;
                            sTotalMUSTFB = sTotalMUSTFB + item.qty * item.harga_mu;
                            sTotalBeratSTFB = sTotalBeratSTFB + item.qty * item.brt;
                        }

                        // if (getDetailFpb[0].tipe_booking === 'PO') {

                        // }
                        // if (getSpPusat.length > 0) {
                        const responseItem = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const vItem = responseItem.data.data;

                        itemFbPusat++;

                        return {
                            kode_fb: '',
                            id_fb: sIdFB + 1,
                            kode_lpb: '',
                            id_lpb: sIdFB + 1,
                            kode_sp: getSpPusat[0].kode_sp,
                            id_sp: getSpPusat[0].id_sp,
                            kode_pp: getSpPusat[0].kode_pp === null ? '' : getSpPusat[sIdFB].kode_pp,
                            id_pp: getSpPusat[0].id_pp,
                            kode_item: vItem[0].kode_item,
                            diskripsi: vItem[0].nama_item,
                            satuan: item.satuan,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getSpPusat[0].harga_mu, //quGetFpbDetailPusat.FieldValues['harga_beli_mu'],//item.harga_mu,
                            diskon: item.diskon,
                            diskon_mu: item.diskon_mu,
                            potongan_mu: item.potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: item.qty_std * getSpPusat[0].harga_mu, //quGetFpbDetailPusat.FieldValues['harga_beli_mu'],//item.jumlah_mu,
                            // jumlah_rp: item.qty_std * getSpPusat[0].harga_mu, //quGetFpbDetailPusat.FieldValues['harga_beli_mu'],//item.jumlah_rp,
                            jumlah_mu: item.qty * getSpPusat[0].harga_mu, //quGetFpbDetailPusat.FieldValues['harga_beli_mu'],//item.jumlah_mu,
                            jumlah_rp: item.qty * getSpPusat[0].harga_mu,
                            ket: null,
                            kode_dept: sKodeDeptPusat[0]?.dept,
                            kode_kerja: null,
                            berat: item.brt,
                        };
                        // } else {
                        //     return null;
                        // }
                        // } else {
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };
        const FBPusatJson = async () => {
            if (cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null) {
                let tglResetDokumen: any;
                let tglResetTrxDokumen: any;
                const quCustMapping = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
                if (kode_entitas === '898') {
                    sNoFBPusat = await generateNofakturFB(apiUrl, getEntPusat[0].kode_entitas, noPB);
                } else {
                    sNoFBPusat = await generateNofakturFB(apiUrl, getEntPusat[0].kode_entitas, sNoPBPusat);
                }
                // if (kode_entitas === '898') {
                //     sNoFBPusat = await generateNofakturFB(apiUrl, getEntPusat[0].kode_entitas, noPB);
                // } else {
                // let noDokBaru: any;
                // noDokBaru = await generateNU(getEntPusat[0].kode_entitas, '', '03', moment().format('YYYYMM'));

                // const cekData = await cekDataDiDatabase(getEntPusat[0].kode_entitas, 'tb_m_fb', 'no_fb', noDokBaru, token);
                // if (cekData) {
                //     // const cekNoDok = await cekDataDiDatabase(kode_entitas, 'tb_m_ttb_master', 'no_ttb', jsonData?.no_ttb, token);
                //     // sNoFBPusat = await generateNUDivisi(kode_entitas, defaultNoTtb, divisiPenjualan, '08', moment(date1).format('YYYYMM'), moment(date1).format('YYMM') + `${divisiPenjualan}`);
                //     sNoFBPusat1 = await generateNU(getEntPusat[0].kode_entitas, noDokBaru, '03', moment().format('YYYYMM'));
                //     sNoFBPusat = await generateNU(getEntPusat[0].kode_entitas, '', '03', moment().format('YYYYMM'));
                // } else {
                //     sNoFBPusat = noDokBaru;
                // }
                // }

                const formatTglPb = moment(TglPB).format('YYYY-MM-DD HH:mm:ss');
                const formatTglTrxLpb = moment(TglTrxLpb).format('YYYY-MM-DD HH:mm:ss');
                tglResetDokumen = await ResetTime2(getEntPusat[0].kode_entitas, formatTglPb);
                tglResetTrxDokumen = await ResetTime2(getEntPusat[0].kode_entitas, formatTglTrxLpb);
                const kodeAkunPusat = await fetchPreferensi(getEntPusat[0].kode_entitas, apiUrl);

                let getsuppByKode: any;

                const sDetailFBPusat = await vDetailFBPusat();
                const response = await axios.get(`${apiUrl}/erp/get_supp_by_kode`, {
                    params: {
                        entitas: getEntPusat[0].kode_entitas,
                        param1: sKodeSuppPusat,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getsuppByKode = response.data.data;
                const objectFbPusat = {
                    fb: {
                        kode_fb: 'oto',
                        no_fb: sNoFBPusat,
                        tgl_fb: formatTglPb, //Now,
                        tgl_trxfb: formatTglTrxLpb, //Now,
                        tgl_buku: formatTglPb, //Now,
                        kode_supp: sKodeSuppPusat,
                        kode_termin: sTerminPusat,
                        kode_mu: kodeMu,
                        kurs: kurs,
                        kurs_pajak: kursPajak,
                        kena_pajak: kenaPajak,
                        no_faktur_pajak: null,
                        // total_mu: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,,
                        total_mu: tipeBooking === 'ST' ? sTotalMUSTFB : sTotalMUPOOSFB, //totpsd,,
                        diskon_dok: '',
                        diskon_dok_mu: 0,
                        total_diskon_mu: 0,
                        total_pajak_mu: 0,
                        kirim_mu: 0,
                        // netto_mu: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,,
                        netto_mu: tipeBooking === 'ST' ? sTotalMUSTFB : sTotalMUPOOSFB, //totpsd,,
                        memo_mu: 0,
                        lunas_mu: 0,
                        memo_pajak: 0,
                        lunas_pajak: 0,
                        // total_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,,
                        total_rp: tipeBooking === 'ST' ? sTotalMUSTFB : sTotalMUPOOSFB, //totpsd,,
                        diskon_dok_rp: 0,
                        total_diskon_rp: 0,
                        total_pajak_rp: 0,
                        kirim_rp: 0,
                        // netto_rp: tipeBooking === 'ST' ? sTotalMUST : sTotalMUPOOS, //totpsd,,
                        netto_rp: tipeBooking === 'ST' ? sTotalMUSTFB : sTotalMUPOOSFB, //totpsd,,
                        // total_berat: tipeBooking === 'ST' ? sTotalBeratST : sTotalBeratPOOS,
                        total_berat: tipeBooking === 'ST' ? sTotalBeratSTFB : sTotalBeratPOOSFB,
                        kode_akun_kirim: kodeAkunPusat[0].kode_akun_pengiriman,
                        kode_akun_diskon_termin: kodeAkunPusat[0].kode_akun_diskon_item,
                        kode_akun_diskon_dok: kodeAkunPusat[0].kode_akun_diskon_beli,
                        keterangan: '',
                        status: 'Terbuka',
                        userid: userid,
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        kode_lpb: 'oto',
                        fdo: null,
                        nota: null,
                        ppn: 'N',
                        detail: [...sDetailFBPusat],
                        audit: {
                            entitas: getEntPusat[0].kode_entitas,
                            kode_audit: '',
                            dokumen: 'FB',
                            kode_dokumen: '',
                            no_dokumen: sNoFBPusat,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'NEW',
                            diskripsi: `Auto FB Approval disetujui item =  ${itemFbPusat} nilai transaksi ${(tipeBooking === 'ST' ? sTotalMUSTFB : sTotalMUPOOSFB).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        },
                    },
                };
                let returnObjekFbPusat = { ...objectFbPusat };
                return returnObjekFbPusat;
            } else {
                return null;
            }
        };

        let sTotalMUSoSPMPusat = 0;
        let sTotalBeratSoSPMPusat = 0;
        const vDetailSPMPusat = async () => {
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdSPM: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdSPM: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '') {
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSoPusat = response.data.data;

                        const responseItemPusat = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        let vItemPusat = responseItemPusat.data.data;

                        KodeSoPusat = getDetailSoPusat[0].kode_so;
                        sSoKodeJualPusat = getDetailSoPusat[0].kode_jual;

                        // if (getDetailSoPusat.length >= 1) {
                        // sTotalMUSoPusat = sTotalMUSoPusat + item.qty_std * getDetailSoPusat[0].harga_mu;
                        // sTotalBeratSoPusat = sTotalBeratSoPusat + item.qty_std * item.brt;

                        sTotalMUSoSPMPusat = sTotalMUSoSPMPusat + item.qty * getDetailSoPusat[0].harga_mu;
                        sTotalBeratSoSPMPusat = sTotalBeratSoSPMPusat + item.qty * item.brt;

                        itemSPMPusat++;

                        return {
                            kode_do: 'oto',
                            id_do: sIdSPM + 1,
                            kode_so: getDetailSoPusat[0].kode_so,
                            id_so: getDetailSoPusat[0].id_so,
                            kode_item: vItemPusat[0].kode_item,
                            diskripsi: vItemPusat[0].nama_item,
                            satuan: item.satuan,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            // qty_sisa: item.qty_std - item.qty,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: item.harga_mu,
                            diskon: item.diskon,
                            diskon_mu: item.diskon_mu,
                            potongan_mu: item.potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            jumlah_mu: item.jumlah_mu, // item.qty_std * item.harga_mu,
                            jumlah_rp: item.jumlah_mu, //item.qty_std * item.harga_mu,
                            berat: item.brt,
                            kode_dept: getDetailSoPusat[0]?.kode_dept,
                            kode_kerja: null,
                            qty_batal: 0,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            // sSoKodeJualPusat2 = sSoKodeJualPusat;
            return dataDetail;
        };
        const SPMPusatJson = async () => {
            if (cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null) {
                let sDetailsPMPusat = await vDetailSPMPusat();
                sNoSpmPusat = await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '11', moment().format('YYYYMM'), moment().format('YYMM') + sSoKodeJualPusat);
                // const sKodeDeptPusat = await FetchDepartemen(getEntPusat[0].kode_entitas);
                const quCustMappingPusat = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
                // let KodeDeptPusat = sKodeDeptPusat[0]?.dept;
                // let KodeKerjaPusat = sKodeDeptPusat[0]?.kerja;

                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: getEntPusat[0].kode_entitas,
                        param1: KodeSoPusat,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSoPusat = response.data.data;
                // console.log('getMasterSoPusat', getMasterSoPusat);
                if (getMasterSoPusat.length >= 1) {
                    ssokode_custPusat = getMasterSoPusat[0].kode_cust;
                    ssoalamat_kirim = getMasterSoPusat[0].alamat_kirim;
                    ssokode_kirim = getMasterSoPusat[0].kode_kirim;
                    const objectSpmPusat = {
                        spm: {
                            kode_do: 'oto',
                            no_do: sNoSpmPusat,
                            tgl_do: TglPB, //now,
                            tgl_kirim: moment(TglSJ).format('YYYY-MM-DD'), //Now,
                            kode_cust: ssokode_custPusat,
                            alamat_kirim: ssoalamat_kirim,
                            via: 'ARMADA SENDIRI',
                            fob: 'Diambil',
                            pengemudi: pengemudi,
                            nopol: nopol,
                            // total_berat: sTotalBeratSoCabang,
                            total_berat: sTotalBeratSoSPMPusat,
                            keterangan: '[Otomatis SPM (Approve PB) - No PB Cabang : ' + noPB + ']',
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            kode_gudang: quCustMappingPusat[0].kode_gudang,
                            kode_kirim: quCustMappingPusat[0].kode_kirim,
                            kode_jual: sSoKodeJualPusat,
                            keterangan_batal: null,
                            nota: null,
                            fdo: null,
                            cetak_tunai: getMasterSoPusat[0].cetak_tunai,
                            detail: [...sDetailsPMPusat],
                            audit: {
                                entitas: getEntPusat[0].kode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'DO',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoSpmPusat,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto SPM item =  ${itemSPMPusat}  total berat ${sTotalBeratSoSPMPusat.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekSpmPusat = { ...objectSpmPusat };
                    return returnObjekSpmPusat;
                } else {
                    // console.log('Master So Kosong');
                    return null;
                }
            } else {
                return null;
            }
        };

        //SJ PUSAT
        let itemSJPusat = 0;
        let totalNilaiHppSJPusat = 0;
        let sTotalMUSoSJPusat = 0;
        let sTotalBeratSoSJPusat = 0;

        const vDetailSJPusat = async () => {
            sTotalBeratSoPusat = 0;
            sTotalMUSoPusat = 0;
            totalNilaiHpp = 0;
            const quCustMappingPusat = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdSj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdSj: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '') {
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSoPusat = response.data.data;

                        // if (getDetailSoPusat.length >= 1) {
                        const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');

                        const responseItemPusat = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        let vItemPusat = responseItemPusat.data.data;

                        const responseHpp = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: vItemPusat[0].kode_item,
                                param2: vTgl, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: quCustMappingPusat[0].kode_gudang,
                            },
                        });
                        const responseDataHpp = responseHpp.data.data;

                        // perubahaan dan penambhana pengecekna item untuk mengambil nama_cetak
                        // 2025-05-26
                        const resultItemNamaCetak = await axios.get(`${apiUrl}/erp/harga_per_item?`, {
                            params: {
                                entitas: kode_entitas,
                                kode_item: vItemPusat[0].kode_item,
                            },
                        });

                        const responseItemNamaCetak = resultItemNamaCetak.data.data;
                        console.log('responseItemNamaCetak sini = ', responseItemNamaCetak);

                        // =====

                        sSoKodeJualPusat = getDetailSoPusat[0].kode_jual;
                        // totalNilaiHpp = totalNilaiHpp + responseDataHpp.hpp * getDetailSoPusat[0].qty_std;
                        // totalNilaiHppSJPusat = totalNilaiHppSJPusat + responseDataHpp.hpp * getDetailSoPusat[0].qty; perubahan 11-07-2025
                        totalNilaiHppSJPusat = totalNilaiHppSJPusat + responseDataHpp.hpp * item.qty;
                        // sTotalMUSoPusat = sTotalMUSoPusat + item.qty_std * getDetailSoPusat[0].harga_mu;
                        // sTotalBeratSoPusat = sTotalBeratSoPusat + item.qty_std * item.brt;

                        sTotalMUSoSJPusat = sTotalMUSoSJPusat + item.qty * getDetailSoPusat[0].harga_mu;
                        sTotalBeratSoSJPusat = sTotalBeratSoSJPusat + item.qty * item.brt;

                        itemSJPusat++;

                        return {
                            kode_sj: 'oto',
                            id_sj: sIdSj + 1,
                            kode_do: 'oto',
                            id_do: sIdSj + 1,
                            kode_so: getDetailSoPusat[0].kode_so,
                            id_so: getDetailSoPusat[0].id_so,
                            kode_item: vItemPusat[0].kode_item,
                            // diskripsi: vItemPusat[0].nama_item,
                            diskripsi:
                                responseItemNamaCetak.length > 0
                                    ? responseItemNamaCetak[0].nama_cetak === '' || responseItemNamaCetak[0].nama_cetak === null || responseItemNamaCetak[0].nama_cetak === undefined
                                        ? vItemPusat[0].nama_item
                                        : responseItemNamaCetak[0].nama_cetak
                                    : vItemPusat[0].nama_item, // Perubahan 2025-05-26
                            satuan: item.satuan,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            // qty_sisa: item.qty_std - item.qty,
                            qty_retur: 0,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: getDetailSoPusat[0].harga_mu,
                            hpp: responseDataHpp.hpp,
                            diskon: getDetailSoPusat[0].diskon,
                            diskon_mu: getDetailSoPusat[0].diskon_mu,
                            potongan_mu: getDetailSoPusat[0].potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            // jumlah_mu: item.qty_std * getDetailSoPusat[0].harga_mu,
                            // jumlah_rp: item.qty_std * getDetailSoPusat[0].harga_mu,
                            jumlah_mu: item.qty * getDetailSoPusat[0].harga_mu,
                            jumlah_rp: item.qty * getDetailSoPusat[0].harga_mu,
                            kode_dept: null,
                            kode_kerja: null,
                            diskon_dok_mu: 0,
                            kirim_mu: 0,
                            no_kontrak: null,
                            no_mbref: null,
                            no_lpb: sNoPBPusat,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };
        const SJPusatJson = async () => {
            if (cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null) {
                let sDetailSJPusat = await vDetailSJPusat();
                sNoSjPusat = await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '12', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJualPusat}`);
                const quCustMappingPusat = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: getEntPusat[0].kode_entitas,
                        param1: KodeSoPusat,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSoPusat = response.data.data;
                if (getMasterSoPusat.length >= 1) {
                    ssokode_custPusat = getMasterSoPusat[0].kode_cust;
                    ssoalamat_kirim = getMasterSoPusat[0].alamat_kirim;
                    ssokode_kirim = getMasterSoPusat[0].kode_kirim;
                    const objectSjPusat = {
                        sj: {
                            kode_sj: 'oto',
                            no_sj: sNoSjPusat,
                            tgl_sj: tglBackTimeDokumen, //Now,
                            // tgl_trxsj: tglBackTimeDokumen, //Now,
                            tgl_trxsj: tglResetTglSjPusatDokumen, //Now,
                            no_reff: null,
                            kode_gudang: quCustMappingPusat[0].kode_gudang, //kodeGudang,
                            kode_cust: ssokode_custPusat,
                            alamat_kirim: ssoalamat_kirim,
                            via: 'ARMADA PABRIK',
                            fob: 'Dikirim',
                            pengemudi: pengemudi,
                            nopol: nopol,
                            // total_rp: sTotalMUSoCabang,
                            total_rp: sTotalMUSoSJPusat,
                            total_diskon_rp: 0,
                            total_pajak_rp: 0,
                            // netto_rp: sTotalMUSoCabang,
                            // total_berat: sTotalBeratSoCabang,
                            netto_rp: sTotalMUSoSJPusat,
                            total_berat: sTotalBeratSoSJPusat,
                            keterangan: `[Otomatis SJ (Approve PB) - No PB Cabang : ${kode_entitas} - ${noPB} ]`,
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            dokumen: null,
                            kode_jual: sSoKodeJualPusat,
                            kirim: 'N',
                            nota: null,
                            fdo: null,
                            cetak_tunai: getMasterSoPusat[0].cetak_tunai,
                            detail: [...sDetailSJPusat],
                            jurnal: [
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 1,
                                    dokumen: 'SJ',
                                    tgl_dokumen: TglPB, //now,
                                    kode_akun: kodeAkun[0]?.kode_akun_hpp, // FieldByName('kode_akun_hpp'),
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: totalNilaiHppSJPusat,
                                    kredit_rp: 0,
                                    jumlah_rp: totalNilaiHppSJPusat,
                                    jumlah_mu: totalNilaiHppSJPusat,
                                    catatan: 'Harga Pokok No. SJ: ' + sNoSjPusat,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJualPusat,
                                    no_kontrak_um: null,
                                },
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 2,
                                    dokumen: 'SJ',
                                    tgl_dokumen: TglPB, //moment().format('YYYY-MM-DD HH:mm:ss'),
                                    kode_akun: kodeAkun[0]?.kode_akun_persediaan, // FieldByName('kode_akun_persediaan'),
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: 0,
                                    kredit_rp: totalNilaiHppSJPusat,
                                    jumlah_rp: -totalNilaiHppSJPusat,
                                    jumlah_mu: -totalNilaiHppSJPusat,
                                    catatan: 'Persediaan barang No. SJ: ' + sNoSjPusat,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJualPusat,
                                    no_kontrak_um: null,
                                },
                            ],
                            audit: {
                                entitas: getEntPusat[0].ode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'SJ',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoSjPusat,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto SJ item =  ${itemSJPusat} total berat = ${sTotalBeratSoSJPusat} nilai transaksi ${sTotalMUSoSJPusat.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekSJPusat = { ...objectSjPusat };
                    return returnObjekSJPusat;
                } else {
                    // console.log('Master So Kosong');
                    return null;
                }
            } else {
                return null;
            }
        };

        let itemFJPusat = 0;
        let potonganFJPusat = 0;
        let totalNilaiHppFJPusat = 0;
        let sTotalMUSoFJPusat = 0;
        let sTotalBeratSoFJPusat = 0;

        const vDetailFJPusat = async () => {
            totalNilaiHpp = 0;
            sTotalMUSoPusat = 0;
            sTotalBeratSoPusat = 0;
            sTotalJumlahMuPusat = 0;
            sSoKodeJualPusat = '';
            const quCustMappingPusat = await FetchCustomerMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
            const dataDetail = await Promise.all(
                // data.nodes.map(async (item: any, sIdFj: any) => {
                jsonApprovePb.detail.map(async (item: any, sIdFj: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '') {
                        KodeSoCabang = item.kode_so;
                        const response = await axios.get(`${apiUrl}/erp/get_detail_so_pusat?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.kode_fpb,
                                param2: item.id_fpb,
                            },
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const getDetailSoPusat = response.data.data;
                        // console.log('getDetailSoPusat FJ ', getDetailSoPusat);

                        // if (getDetailSoPusat.length >= 1) {
                        sSoKodeJualPusat = getDetailSoPusat[0].kode_jual;

                        const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');
                        const responseItemPusat = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        let vItemPusat = responseItemPusat.data.data;

                        const responseHpp = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: getEntPusat[0].kode_entitas,
                                param1: vItemPusat[0].kode_item,
                                param2: moment().format('YYYY-MM-DD HH:mm:ss'), //vTgl, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                param3: quCustMappingPusat[0].kode_gudang,
                            },
                        });
                        const responseDataHpp = responseHpp.data.data;

                        // perubahaan dan penambhana pengecekna item untuk mengambil nama_cetak
                        // 2025-05-26
                        const resultItemNamaCetak = await axios.get(`${apiUrl}/erp/harga_per_item?`, {
                            params: {
                                entitas: kode_entitas,
                                kode_item: vItemPusat[0].kode_item,
                            },
                        });

                        const responseItemNamaCetak = resultItemNamaCetak.data.data;
                        // =====

                        // totalNilaiHpp = totalNilaiHpp + responseDataHpp.hpp * item.qty_std;
                        totalNilaiHppFJPusat = totalNilaiHppFJPusat + responseDataHpp.hpp * item.qty;

                        // sTotalMUSoPusat = sTotalMUSoPusat + item.qty_std * item.harga_mu;
                        // sTotalBeratSoPusat = sTotalBeratSoPusat + item.qty_std * item.brt;

                        sTotalMUSoFJPusat = sTotalMUSoFJPusat + item.qty * item.harga_mu;
                        sTotalBeratSoFJPusat = sTotalBeratSoFJPusat + item.qty * item.brt;

                        sTotalJumlahMuPusat = sTotalJumlahMuPusat + item.jumlah_mu;
                        if (item.diskon_mu > 0 || item.potongan_mu > 0) {
                            //   IsBonus = true;
                            // potonganFJPusat = potonganFJPusat + item.kurs * item.qty_std * (item.diskon_mu + item.potongan_mu);
                            potonganFJPusat = potonganFJPusat + item.kurs * item.qty * (item.diskon_mu + item.potongan_mu);
                        }

                        itemFJPusat++;

                        return {
                            kode_fj: 'oto',
                            id_fj: sIdFj + 1,
                            kode_sj: 'oto',
                            id_sj: sIdFj + 1,
                            kode_do: 'oto',
                            id_do: sIdFj + 1,
                            kode_so: getDetailSoPusat[0].kode_so,
                            id_so: getDetailSoPusat[0].id_so,
                            kode_item: vItemPusat[0].kode_item,
                            // diskripsi: vItemPusat[0].nama_item,
                            diskripsi:
                                responseItemNamaCetak.length > 0
                                    ? responseItemNamaCetak[0].nama_cetak === '' || responseItemNamaCetak[0].nama_cetak === null || responseItemNamaCetak[0].nama_cetak === undefined
                                        ? vItemPusat[0].nama_item
                                        : responseItemNamaCetak[0].nama_cetak
                                    : vItemPusat[0].nama_item, // Perubahan 2025-05-26
                            satuan: item.satuan,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            // qty_std: item.qty_std,
                            qty_std: item.qty,
                            qty_sisa: item.qty_std,
                            // qty_sisa: item.qty_std - item.qty,
                            kode_mu: item.kode_mu,
                            kurs: item.kurs,
                            kurs_pajak: item.kurs_pajak,
                            harga_mu: item.harga_mu,
                            diskon: item.diskon,
                            diskon_mu: item.diskon_mu,
                            potongan_mu: item.potongan_mu,
                            kode_pajak: item.kode_pajak,
                            pajak: item.pajak,
                            include: item.include,
                            pajak_mu: item.pajak_mu,
                            jumlah_mu: item.jumlah_mu,
                            jumlah_rp: item.jumlah_rp,
                            berat: item.brt,
                            kode_dept: null,
                            kode_kerja: null,
                            hpp: responseDataHpp.hpp,
                            bonus: 'N',
                            id_bonus: 0,
                            id_fbm: 0,
                        };
                        // } else {
                        //     // console.log('Detail So Kosong');
                        //     return null;
                        // }
                    } else {
                        return null;
                    }
                })
            );
            return dataDetail;
        };

        const FJPusatJSON = async () => {
            if (cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null) {
                let sDetailFJPusat = await vDetailFJPusat();
                // sNoFjPusat = await generateNUDivisi(getEntPusat[0].kode_entitas, '', sSoKodeJualPusat, '13', moment().format('YYYYMM'), moment().format('YYMM') + `${sSoKodeJualPusat}`);
                const modifiedNoSJ = sNoSjPusat.toString().split('');
                if (modifiedNoSJ.length >= 4 && !isNaN(parseInt(modifiedNoSJ[3]))) {
                    modifiedNoSJ[3] = (parseInt(modifiedNoSJ[3]) + 1).toString();
                }
                const newNoSJ = modifiedNoSJ.join('');
                sNoFjPusat = newNoSJ;

                const response = await axios.get(`${apiUrl}/erp/header_so?`, {
                    params: {
                        entitas: getEntPusat[0].kode_entitas,
                        param1: KodeSoPusat,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const getMasterSoPusat = response.data.data;
                if (getMasterSoPusat.length >= 1) {
                    const formatTgl = moment(TglPB).format('YYYY-MM-DD');
                    const formatTglTrxLpb = moment(TglTrxLpb).format('YYYY-MM-DD');
                    tglBackTimeDokumen = await ResetTime2(kode_entitas, formatTgl);
                    tglBackTimeTrxDokumen = await ResetTime2(kode_entitas, formatTglTrxLpb);
                    ssokode_custPusat = getMasterSoPusat[0].kode_cust;
                    ssoalamat_kirim = getMasterSoPusat[0].alamat_kirim;
                    ssokode_kirim = getMasterSoPusat[0].kode_kirim;
                    const kodeAkun = await fetchPreferensi(kode_entitas, apiUrl);
                    const getCustpMapping: any = await GetCustMapping(getEntPusat[0].kode_entitas, kode_entitas, token);
                    const responseTermin = await axios.get(`${apiUrl}/erp/termin_by_nama?`, {
                        params: {
                            entitas: getEntPusat[0].kode_entitas,
                            param1: terminSelected,
                        },
                    });

                    const responseTerminByNama = responseTermin.data.data;

                    const responseSoPusat = await axios.get(`${apiUrl}/erp/get_join_so_pusat?`, {
                        params: {
                            entitas: getEntPusat[0].kode_entitas,
                            param1: KodeSoPusat,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const responseSoPst = responseSoPusat.data.data;

                    const responseKodeAkunByCust = await axios.get(`${apiUrl}/erp/kode_piutang_by_cust?`, {
                        params: {
                            entitas: getEntPusat[0].kode_entitas,
                            param1: responseSoPst[0].kode_cust,
                        },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const getKodeAkunByCust = responseKodeAkunByCust.data.data;

                    console.log('totalNettoRPSet = ', totalNettoRPSet, (totalNettoRPSet * kurs - 0) * kurs);
                    console.log('sTotalJumlahMuPusat = ', sTotalJumlahMuPusat, potonganFJPusat, (sTotalJumlahMuPusat * kurs + potonganFJPusat) * kurs);

                    const objectFjPusat = {
                        fj: {
                            kode_fj: 'oto',
                            no_fj: sNoFjPusat,
                            tgl_fj: tglBackTimeDokumen, //Now,
                            tgl_trxfj: tglBackTimeTrxDokumen, //Now,
                            tgl_buku: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //Now,
                            no_reff: null,
                            kode_sales: getMasterSoPusat[0].kode_sales,
                            kode_cust: getCustpMapping[0].kode_cust,
                            kode_akun_piutang: null,
                            tgl_kirim: null,
                            alamat_kirim: getCustpMapping[0].alamat_kirim1,
                            via: 'ARMADA SENDIRI',
                            fob: null,
                            kode_termin: responseTerminByNama[0].kode_termin,
                            kode_mu: responseSoPst[0].kode_mu,
                            kurs: responseSoPst[0].kurs,
                            kurs_pajak: responseSoPst[0].kurs_pajak,
                            kena_pajak: responseSoPst[0].kena_pajak,
                            no_faktur_pajak: null,
                            diskon_dok: null,
                            // total_mu: sTotalMUSoPusat,
                            total_mu: sTotalMUSoFJPusat,
                            diskon_dok_mu: 0,
                            total_diskon_mu: 0,
                            total_pajak_mu: 0,
                            kirim_mu: 0,
                            // netto_mu: sTotalMUSoPusat,
                            netto_mu: sTotalMUSoFJPusat,
                            uang_Muka_mu: 0,
                            memo_mu: null,
                            lunas_mu: 0,
                            memo_pajak: null,
                            lunas_pajak: null,
                            // total_rp: sTotalMUSoPusat,
                            total_rp: sTotalMUSoFJPusat,
                            diskon_dok_rp: 0,
                            total_diskon_rp: 0,
                            total_pajak_rp: 0,
                            kirim_rp: 0,
                            // netto_rp: sTotalMUSoPusat,
                            netto_rp: sTotalMUSoFJPusat,
                            // total_berat: sTotalBeratSoPusat,
                            total_berat: sTotalBeratSoFJPusat,
                            kode_akun_kirim: null,
                            kode_akun_diskon_termin: null,
                            kode_akun_diskon_dok: null,
                            keterangan: `[No PB Cabang : ${kode_entitas} - ${noPB}]`,
                            status: 'Terbuka',
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            dokumen: 'Diambil',
                            beban_antar_cabang: null,
                            kode_tagih: responseSoPst[0].kode_sales,
                            kode_penjual: responseSoPst[0].kode_sales,
                            bd: 'N',
                            bayar_mu: null,
                            tunai: null,
                            debet: null,
                            debet_tunai: null,
                            kredit: null,
                            kredit_dp: null,
                            kredit_diskon: null,
                            kredit_bp: null,
                            kredit_biaya: null,
                            voucher: null,
                            bulat: null,
                            kode_mk: null,
                            retur: null,
                            tum: null,
                            kode_tum: null,
                            koreksi: 'N',
                            referal: null,
                            kode_jual: sSoKodeJualPusat,
                            approval: 'Y',
                            apptime: null,
                            fdo: null,
                            komplit: 'N',
                            fbm: null,
                            klaim: 'N',
                            nama_om: null,
                            nama_spv: null,
                            tgl_limpahan: null,
                            sales_penjual: null,
                            cetak_tunai: getMasterSoPusat[0].cetak_tunai,
                            kode_termin_cetak_fj: null,
                            jenis_limpahan: null,
                            tarik_fpac: 'N',
                            ppn: 'N',
                            transfer: 0,
                            detail: [...sDetailFJPusat],
                            jurnal: [
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 1,
                                    dokumen: 'FJ',
                                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                    kode_akun: getKodeAkunByCust[0].Kode_akun_piutang,
                                    kode_subledger: getCustpMapping[0].kode_cust,
                                    kurs: kurs,
                                    // debet_rp: totalNettoRPSet * kurs - 0 * kurs,
                                    debet_rp: sTotalJumlahMuPusat * kurs + potonganFJPusat * kurs,
                                    kredit_rp: 0,
                                    // jumlah_rp: totalNettoRPSet * kurs - 0 * kurs,
                                    // jumlah_mu: totalNettoRPSet * kurs - 0 * kurs,
                                    jumlah_rp: sTotalJumlahMuPusat * kurs + potonganFJPusat * kurs,
                                    jumlah_mu: sTotalJumlahMuPusat * kurs + potonganFJPusat * kurs,
                                    catatan: 'Piutang Faktur No  ' + sNoFjPusat,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                },
                                {
                                    kode_dokumen: 'oto',
                                    id_dokumen: 2,
                                    dokumen: 'FJ',
                                    tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                    kode_akun: kodeAkun[0].kode_akun_jual,
                                    kode_subledger: null,
                                    kurs: kurs,
                                    debet_rp: 0,
                                    kredit_rp: sTotalJumlahMuPusat * kurs + potonganFJPusat * kurs,
                                    jumlah_rp: -(sTotalJumlahMuPusat * kurs) + potonganFJPusat * kurs,
                                    jumlah_mu: -(sTotalJumlahMuPusat * kurs) + potonganFJPusat * kurs,
                                    catatan: 'Penjualan  faktur No. ' + sNoFjPusat + ' kepada ' + getCustpMapping[0].nama_relasi,
                                    no_warkat: null,
                                    tgl_valuta: null,
                                    persen: 0,
                                    kode_dept: null,
                                    kode_kerja: null,
                                    approval: 'N',
                                    posting: 'N',
                                    rekonsiliasi: 'N',
                                    tgl_rekonsil: null,
                                    userid: userid,
                                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    audit: null,
                                    kode_kry: null,
                                    kode_jual: sSoKodeJual,
                                },
                            ],
                            audit: {
                                entitas: getEntPusat[0].kode_entitas,
                                kode_audit: 'oto',
                                dokumen: 'FJ',
                                kode_dokumen: 'oto',
                                no_dokumen: sNoFjPusat,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto FJ item =  ${itemFJPusat} nilai transaksi ${sTotalMUSoFJPusat.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekFjPusat = { ...objectFjPusat };
                    return returnObjekFjPusat;
                } else {
                    // console.log('Master So Kosong');
                    return null;
                }
            } else {
                return null;
            }
        };

        const vPBPusatJson = await PBPusatJson();
        const vFBPusatJson = await FBPusatJson();
        const vSPMPusatJson = await SPMPusatJson();
        const vSJPusatJson = await SJPusatJson();
        const vFJPusatJson = await FJPusatJSON();

        // throw exitCode;
        const jsonApprovalPb = {
            entitas_pembeli: kode_entitas,
            pembeli: {
                //  ...vPBCabangBeliJson,
                ...vFBCabangBeliJson,
                ...vSPMCabangBeliJson,
                ...vSJCabangBeliJson,
                ...vFJCabangBeliJson,
            },
            entitas_pusat: getEntPusat[0].kode_entitas,
            pusat: {
                ...vPBPusatJson,
                ...vFBPusatJson,
                ...vSPMPusatJson,
                ...vSJPusatJson,
                ...vFJPusatJson,
            },
            kode_pb: kodePB,
        };
        // console.log('selesai jsonApprovalPb');
        // console.log('jsonApprovalPb bawah ', jsonApprovalPb);

        // throw exitCode;
        return jsonApprovalPb;
    };

    async function oneToOneNumber(vOld: string, dok: string, vTgl: Date): Promise<string> {
        const quInfo = await axios.get(`${apiUrl}/erp/get_info`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('quInfo', quInfo.data.data[0].kode);
        const vTahun = vTgl.getFullYear();
        const vBulan = vTgl.getMonth() + 1; // getMonth() returns 0-based index
        const vHari = vTgl.getDate();

        // Simulasi dari Data.quInfokode.AsString yang di-passing sebagai parameter 'kode'
        const kodeInfo = quInfo.data.data[0].kode;

        const suffix = vOld.slice(5); // Copy(vOld, 6, Length(vOld)) di Delphi = slice(5) di JS
        return `${kodeInfo}${dok}.${suffix}`;
    }

    function oneToOneNumberFJPusat(vOld: string, dok: string, vTgl: Date): string {
        let reg = vOld.slice(10, 20).trim();

        reg = reg
            .split('')
            .filter((char) => /\d/.test(char))
            .join('');

        while (reg.length < 5) {
            reg = '0' + reg + 'B';
        }

        const prefix = vOld.slice(0, 2);
        const mid = vOld.slice(5, 9);

        return `${prefix}${dok}.${mid}.${reg}`;
    }

    const hasil = oneToOneNumberFJPusat('0112.1308.00208', '13', new Date());
    const hasil1 = oneToOneNumberFJPusat('AC12.1308.00420', '13', new Date());
    console.log('hasil = ', hasil, hasil1);

    const ExportKontrakPusat = async (jsonApprovePb: any) => {
        // console.log('jsonApprovePb Kontrak Pusat', jsonApprovePb);

        // const getEntPusat: any = await GetEntitasPusat(kode_entitas, 'pusat', token);
        let itemFbCabangBeli = 0;
        let itemMbCabangBeli = 0;
        let sTotalNetto = 0;

        // if (kode_entitas === '898') {
        //     console.log('masuk sini 1');
        //     sNoFBKontrakPusat = await generateNofakturFB(apiUrl, kode_entitas, noPB);
        // } else {
        // console.log('masuk sini 2');

        // let noDokBaru: any;
        // noDokBaru = await generateNU(kode_entitas, '', '03', moment().format('YYYYMM'));

        // const cekData = await cekDataDiDatabase(kode_entitas, 'tb_m_fb', 'no_fb', noDokBaru, token);
        // if (cekData) {
        //     // const cekNoDok = await cekDataDiDatabase(kode_entitas, 'tb_m_ttb_master', 'no_ttb', jsonData?.no_ttb, token);
        //     // sNoFBPusat = await generateNUDivisi(kode_entitas, defaultNoTtb, divisiPenjualan, '08', moment(date1).format('YYYYMM'), moment(date1).format('YYMM') + `${divisiPenjualan}`);
        //     sNoFBKontrakPusat1 = await generateNU(kode_entitas, noDokBaru, '03', moment().format('YYYYMM'));
        //     sNoFBKontrakPusat = await generateNU(kode_entitas, '', '03', moment().format('YYYYMM'));
        // } else {
        //     sNoFBKontrakPusat = noDokBaru;
        // }

        // }
        let sTotalMUMb = 0;
        let sTotalBeratMb = 0;
        let tglBackTimeDokumen: any;

        const formatTgl = moment(TglPB).format('YYYY-MM-DD');
        tglBackTimeDokumen = await ResetTime2(kode_entitas, formatTgl);
        // console.log('masuk pa eko ');

        //FAKTUR BELI CABANG BELI
        const vDetailFbCabangBeli = async () => {
            sTotalNetto = 0;
            //  sTotalBeratPOOS = 0;
            const sKodeDeptCabang = await FetchDepartemen(kode_entitas);
            const dataDetail = await Promise.all(
                // data.nodes.map((item: any, idFbPusat: any) => {
                jsonApprovePb.detail.map((item: any, idFbPusat: any) => {
                    sTotalNetto = sTotalNetto + item.qty_std * item.harga_mu;
                    itemFbCabangBeli++;
                    return {
                        kode_fb: 'oto',
                        id_fb: idFbPusat + 1,
                        kode_lpb: item.kode_lpb,
                        id_lpb: item.id_lpb,
                        kode_sp: item.kode_sp,
                        id_sp: item.id_sp,
                        kode_pp: item.kode_pp,
                        id_pp: item.id_pp,
                        kode_item: item.kode_item,
                        diskripsi: item.diskripsi,
                        satuan: item.satuan,
                        qty: item.qty,
                        sat_std: item.sat_std,
                        qty_std: item.qty_std,
                        kode_mu: item.kode_mu,
                        kurs: item.kurs,
                        kurs_pajak: item.kurs_pajak,
                        harga_mu: item.harga_mu,
                        diskon: item.diskon,
                        diskon_mu: item.diskon_mu,
                        potongan_mu: item.potongan_mu,
                        kode_pajak: item.kode_pajak,
                        pajak: item.pajak,
                        include: item.include,
                        pajak_mu: item.pajak_mu,
                        jumlah_mu: item.jumlah_mu,
                        jumlah_rp: item.jumlah_rp,
                        ket: null,
                        kode_dept: sKodeDeptCabang[0].dept,
                        kode_kerja: null,
                        berat: item.berat,
                    };
                })
            );

            return dataDetail;
        };
        // console.log('masuk pa eko 2');

        const FBCabangBeliJson = async () => {
            let sDetailFbCabangBeli = await vDetailFbCabangBeli();
            sNoFBKontrakPusat = await generateNofakturFB(apiUrl, kode_entitas, noPB);

            const objectFbCabangBeli = {
                fb: {
                    kode_fb: 'oto',
                    no_fb: sNoFBKontrakPusat,
                    tgl_fb: moment(jsonApprovePb.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    tgl_trxfb: moment(jsonApprovePb.tgl_trxlpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    tgl_buku: moment(jsonApprovePb.tgl_lpb).format('YYYY-MM-DD HH:mm:ss'), //Now,
                    kode_supp: jsonApprovePb.kode_supp,
                    kode_termin: jsonApprovePb.kode_termin,
                    kode_mu: 'IDR',
                    kurs: kurs,
                    kurs_pajak: kursPajak,
                    kena_pajak: selectedOptionPajak,
                    no_faktur_pajak: null,
                    total_mu: subTotal * kurs,
                    diskon_dok: persenDiskon === null ? 0 : persenDiskon,
                    diskon_dok_mu: nominalDiskon === null ? 0 : nominalDiskon * kurs,
                    total_diskon_mu: totalDiskonRP * kurs,
                    total_pajak_mu: totalPajakSet * kurs,
                    kirim_mu: kirimMU,
                    netto_mu: sTotalNetto, //totalNettoRPSet * kurs,
                    memo_mu: 0,
                    lunas_mu: 0,
                    memo_pajak: 0,
                    lunas_pajak: 0,
                    total_rp: subTotal,
                    diskon_dok_rp: nominalDiskon === null ? 0 : nominalDiskon,
                    total_diskon_rp: totalDiskonRP + totalPotonganRP,
                    total_pajak_rp: totalPajakSet,
                    kirim_rp: kurs * kirimMU,
                    netto_rp: sTotalNetto, //totalNettoRPSet,
                    total_berat: totalBeratHeader,
                    kode_akun_kirim: kodeAkun[0]?.kode_akun_pengiriman,
                    kode_akun_diskon_termin: kodeAkun[0]?.kode_akun_diskon_item,
                    kode_akun_diskon_dok: kodeAkun[0]?.kode_akun_diskon_beli,
                    keterangan: Keterangan,
                    status: 'Terbuka',
                    userid: userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_lpb: kodePB,
                    fdo: null,
                    ppn: selectedOptionPajak,
                    detail: [...sDetailFbCabangBeli],
                    audit: {
                        entitas: kode_entitas,
                        kode_audit: 'oto',
                        dokumen: 'FB',
                        kode_dokumen: 'oto',
                        no_dokumen: sNoFBKontrakPusat,
                        tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                        proses: 'NEW',
                        diskripsi: `Auto FB Approval disetujui item =  ${itemFbCabangBeli}  nilai transaksi ${totalNettoRPSetRef.current.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        userid: userid, // userid login web
                        system_user: '', //username login
                        system_ip: '', //ip address
                        system_mac: '', //mac address
                    },
                },
            };
            let returnObjekFbCabangBeli = { ...objectFbCabangBeli };

            return returnObjekFbCabangBeli;
        };
        // console.log('masuk pa eko 3');

        //MB CABANG BELI
        let nilaiHasil = 0;
        let kodeEntitasFpb = '';
        let vkodeAkun: any;

        const vDetailMBCabangBeli = async () => {
            const dataDetail = await Promise.all(
                jsonApprovePb.detail.map(async (item: any, sIdMb: any) => {
                    if (item.kode_fpb !== null && item.kode_fpb !== '' && item.qty !== 0) {
                        const GetEntitasFPB: any = await GetEntitasFromFPB(kode_entitas, item.kode_fpb);

                        kodeEntitasFpb = GetEntitasFPB.master[0].kode_entitas;

                        const quCustMapping = await FetchCustomerMapping(kode_entitas, kodeEntitasFpb, token);
                        const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');
                        const responseKodeAkun = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                            params: {
                                entitas: kode_entitas,
                                param1: item.no_item,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        // console.log('responseKodeAkun ', responseKodeAkun);
                        // console.log('responseKodeAkun ', responseKodeAkun.data);
                        // console.log('responseKodeAkun ', responseKodeAkun.data.data);

                        vkodeAkun = responseKodeAkun.data.data;

                        const responseHpp = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                            params: {
                                entitas: kodeEntitasFpb,
                                param1: item.kode_item,
                                param2: vTgl,
                                param3: quCustMapping[0].kode_gudang, //item.kode_booking,
                            },
                        });

                        const responseDataHpp = responseHpp.data.data;
                        nilaiHasil = await qty2QtyStd(kodeEntitasFpb, item.kode_item, item.satuan, item.sat_std, item.qty);
                        sTotalMUMb = sTotalMUMb + nilaiHasil + responseDataHpp.hpp;
                        sTotalBeratMb = sTotalBeratMb + item.qty_std * item.brt;

                        itemMbCabangBeli++;

                        return {
                            kode_mb: 'oto',
                            id_mb: sIdMb + 1,
                            kode_pmb: null,
                            id_pmb: 0,
                            kode_item: item.kode_item,
                            satuan: item.satuan,
                            qty: item.qty,
                            sat_std: item.sat_std,
                            qty_std: nilaiHasil,
                            harga_rp: responseDataHpp.hpp,
                            hpp: responseDataHpp.hpp,
                            jumlah_rp: sTotalMUMb,
                            berat: item.berat,
                            no_kontrak: NoReff,
                            kode_fpb: item.kode_fpb,
                            id_fpb: item.id_fpb,
                        };
                    } else {
                        return null;
                    }
                })
            );

            return dataDetail;
        };
        // console.log('masuk pa eko 4');
        const MBCabangBeliJson = async () => {
            let sDetailMBCabangBeli = await vDetailMBCabangBeli();
            sNoMBKontrakPusat = await generateNU(kode_entitas, '', '23', moment().format('YYYYMM'));
            const quCustMapping = await FetchCustomerMapping(kode_entitas, kodeEntitasFpb, token);
            // console.log('sDetailMBCabangBeli ', sDetailMBCabangBeli);
            // console.log('quCustMapping ', quCustMapping);
            // console.log('sDetailMBCabangBeli.length ', sDetailMBCabangBeli.length);

            if (sDetailMBCabangBeli[0] !== null && sDetailMBCabangBeli.length > 0) {
                // console.log('xxxxxx');
                const formatTgl = moment(TglPB).format('YYYY-MM-DD');
                tglBackTimeDokumen = await ResetTime2(kode_entitas, formatTgl);

                const objectMBCabangBeli = {
                    mb: {
                        kode_mb: 'oto',
                        no_mb: sNoMBKontrakPusat,
                        tgl_mb: tglBackTimeDokumen, //quMLpbtgl_lpb.AsDateTime,//now,
                        tgl_valuta: null,
                        kode_gudang: kodeGudang,
                        kode_tujuan: quCustMapping[0]?.kode_gudang,
                        netto_rp: sTotalMUMb,
                        total_berat: sTotalBeratMb,
                        keterangan: '[No LPB  : ' + noPB + ']',
                        status: 'Terbuka',
                        userid: userid,
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        persediaan: 'Persediaan',
                        no_reff: NoReff,
                        kode_supp: null, //quDFpbkode_booking.AsString,
                        kode_cust: quCustMapping[0].kode_cust,
                        nopol: '-',
                        via: null,
                        alamat_kirim: quCustMapping[0].alamat_kirim1,
                        kontrak: 'Y',
                        status_export: 'Baru',
                        detail: [...sDetailMBCabangBeli],
                        jurnal: [
                            {
                                kode_dokumen: 'oto',
                                id_dokumen: 1,
                                dokumen: 'MB',
                                tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                kode_akun: vkodeAkun[0].kode_akun_persediaan,
                                kode_subledger: null,
                                kurs: 1,
                                debet_rp: sTotalMUMb,
                                kredit_rp: 0,
                                jumlah_rp: sTotalMUMb,
                                jumlah_mu: sTotalMUMb / 1,
                                catatan: 'Mutasi barang dari gudang ' + GetNamaGudang(kode_entitas, kodeGudang),
                                no_warkat: null,
                                tgl_valuta: null,
                                persen: 0,
                                kode_dept: null,
                                kode_kerja: null,
                                approval: 'N',
                                posting: 'N',
                                rekonsiliasi: 'N',
                                tgl_rekonsil: null,
                                userid: userid,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            },
                            {
                                kode_dokumen: 'oto',
                                id_dokumen: 2,
                                dokumen: 'MB',
                                tgl_dokumen: moment(TglPB).format('YYYY-MM-DD HH:mm:ss'), //now,
                                kode_akun: vkodeAkun[0].kode_akun_persediaan,
                                kode_subledger: null,
                                kurs: 1,
                                debet_rp: 0,
                                kredit_rp: sTotalMUMb,
                                jumlah_rp: -1 * sTotalMUMb,
                                jumlah_mu: -1 * (sTotalMUMb / 1),
                                catatan: 'Mutasi barang ke gudang ' + GetNamaGudang(kode_entitas, quCustMapping[0].kode_gudang),
                                no_warkat: null,
                                tgl_valuta: null,
                                persen: 0,
                                kode_dept: null,
                                kode_kerja: null,
                                approval: 'N',
                                posting: 'N',
                                rekonsiliasi: 'N',
                                tgl_rekonsil: null,
                                userid: userid,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            },
                        ],
                        audit: {
                            entitas: kode_entitas,
                            kode_audit: 'oto',
                            dokumen: 'MB',
                            kode_dokumen: 'oto',
                            no_dokumen: sNoMBKontrakPusat,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'NEW',
                            diskripsi: `Auto MB item =  ${itemMbCabangBeli} nilai transaksi ${sTotalMUMb.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            userid: userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        },
                    },
                };
                let returnObjekMBCabangBeli = { ...objectMBCabangBeli };
                // console.log('returnObjekMBCabangBeli ', returnObjekMBCabangBeli);

                return returnObjekMBCabangBeli;
            } else {
                // console.log('Master So Kosong');
                return null;
            }
            // console.log('ddddd');
        };
        // console.log('masuk pa eko 5');

        // const vPBCabangBeliJson = PBCabangBeliJson; //await PBCabangBeliJson();
        const vFBCabangBeliJson = await FBCabangBeliJson();
        // console.log('masuk pa eko 6');

        const vMBCabangBeliJson = await MBCabangBeliJson();
        // console.log('masuk pa eko 7');
        const jsonApprovalPbKontrak = {
            entitas_pembeli: kode_entitas, //cekPoDariFpb[0].kode_fpb !== '' || cekPoDariFpb[0].kode_fpb !== null ? kode_entitas : getEntPusat[0].kode_entitas,
            entitas_pusat: kode_entitas,
            pusat: {
                ...vFBCabangBeliJson,
                ...vMBCabangBeliJson,
            },
            kode_pb: kodePB,
        };
        // console.log('selesai jsonApprovalPbkontrak');
        // console.log('jsonApprovalPbkontrak ', jsonApprovalPbKontrak);
        // throw exitCode;

        return jsonApprovalPbKontrak;
    };

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

    const onFiltering = (args: any) => {
        let query = new Query();
        query = args.text !== '' ? query.where('ekspedisi', 'startswith', args.text, true) : query;
        args.updateData(listGudang, query);
    };

    return (
        <div id="approvalPB">
            {showLoader && contentLoader()}
            {/* HEADER */}
            <div className="table-responsive panel mb-3" style={{ background: '#dedede' }}>
                <div className="mb-5">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <div className={styles.titleText}>Penerimaan Barang</div>
                        </div>

                        <div className="flex">
                            {routeFilePendukungValue === 'true' ? (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: '10px' }}>
                                    UPDATE FILE PENDUKUNG
                                </div>
                            ) : null}
                            {routeStatusValue === 'terfaktur' ? (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: '10px' }}>
                                    TERFAKTUR
                                </div>
                            ) : (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: '10px' }}>
                                    APPROVAL
                                </div>
                            )}
                            {kontrak === 'N' ? (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                    NON KONTRAK
                                </div>
                            ) : (
                                <div className={styles.titleText} style={{ textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                                    KONTRAK
                                </div>
                            )}
                        </div>
                    </div>

                    <table className={styles.table}>
                        <tbody>
                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal Dokumen</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal Diterima</th>
                                <th style={{ textAlign: 'center', width: '30%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. PB</th>
                                <th style={{ textAlign: 'center', width: '30%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Supplier</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Termin</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Pajak</th>
                            </tr>
                            <tr>
                                <td style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                    {/* <Flatpickr
                                        value={dateTglDokumen}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => setDateTglDokumen(date)}
                                    /> */}
                                    <>{moment(dateTglDokumen).format('DD-MM-YYYY')}</>
                                </td>

                                <td style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                    {/* <Flatpickr
                                        value={dateTglDiterima}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => setDateTglDiterima(date)}
                                    /> */}
                                    <>{moment(dateTglDiterima).format('DD-MM-YYYY')}</>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex" style={{ justifyContent: 'center' }}>
                                        {noPB}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                        <>{selectedNamaSupp}</>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <input
                                            readOnly
                                            id="termin bayar"
                                            placeholder="Termin"
                                            value={terminSelected}
                                            type="text"
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
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
                                                    onClick={() => (routeFilePendukungValue === 'true' ? null : setModalTermin(true))}
                                                />
                                            </button>
                                            <TerminModal
                                                isOpen={modalTermin}
                                                onClose={() => setModalTermin(false)}
                                                onSelectData={(selectedData: any, selectedNamaTermin: any) => handleSelectedTermin(selectedData, selectedNamaTermin)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <select
                                        id="a"
                                        className={`form-select text-white-dark`}
                                        style={{ border: 'none', textAlign: 'center', color: 'black' }}
                                        onChange={(e) => handlePajakChange(e.target.value)}
                                        value={selectedOptionPajak}
                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                    >
                                        <option value={'N'}>Tanpa Pajak</option>
                                        <option value={'I'}>Include (I)</option>
                                        <option value={'E'}>Exclude (E)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. SJ / Kontrak</th>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tgl. SJ / Kontrak</th>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Gudang</th>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Via Pengiriman (Ekspedisi)</th>
                            </tr>

                            <tr>
                                <td>
                                    <div style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                        {/* <input
                                            style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            id="salesman"
                                            placeholder="No. SJ / Kontrak"
                                            type="text"
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            value={noSJ}
                                        /> */}
                                        <>{noSJ}</>
                                    </div>
                                </td>
                                <td style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                    {/* <Flatpickr
                                        value={dateTglSj}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => setDateTglSj(date)}
                                    /> */}
                                    <>{moment(dateTglSj).format('DD-MM-YYYY')}</>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <select
                                        id="a"
                                        className={`form-select text-white-dark`}
                                        style={{ border: 'none', textAlign: 'center', color: 'black' }}
                                        value={kodeGudang}
                                        onChange={(e) => handleSelectOnChange(e, 'kode_gudang')}
                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                    >
                                        {listGudang.map((option: any, index) => (
                                            <option key={index} value={option.kode_gudang}>
                                                {option.nama_gudang}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {/* <select
                                        id="b"
                                        className={`form-select text-white-dark`}
                                        style={{ border: 'none', textAlign: 'center', color: 'black' }}
                                        value={via}
                                        onChange={(e) => handleSelectOnChange(e, 'via')}
                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                    >
                                        {listEkspedisi.map((option: any, index) => (
                                            <option key={index} value={option.ekspedisi}>
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
                                            value={via}
                                            dataSource={listEkspedisi}
                                            placeholder="Pilih Pengiriman"
                                            onChange={(event: any) => setVia(event.value)}
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
                                <td style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                    {/* <input
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        id="salesman"
                                        placeholder="Nama Pengemudi"
                                        type="text"
                                        className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                        value={pengemudi}
                                    /> */}
                                    <>{pengemudi}</>
                                </td>
                                <td colSpan={2} style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}>
                                    {/* <input
                                        style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        id="salesman"
                                        placeholder="No. Kendaraan"
                                        type="text"
                                        className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                        value={nopol}
                                    /> */}
                                    <>{nopol}</>
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
                                            {/* {listCaraPengiriman.map((option: any, index) => (
                                                <option key={index} value={option.ekspedisi}>
                                                    {option.ekspedisi}
                                                </option>
                                            ))} */}
                                            <option value={'Ambil Sendiri'}>Ambil Sendiri</option>
                                            <option value={'Dikirim'}>Dikirim</option>
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
                    <Tab>Jurnal</Tab>
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
                                            // height: '150px',
                                        }
                                    }
                                >
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
                                                                // display: 'flex',
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
                                                                <div style={{ marginLeft: '25px', marginTop: '20px' }}>Satuan</div>
                                                                <div style={{ marginTop: '20px' }}>Kuantitas</div>
                                                                <div style={{ marginRight: '25px', marginTop: '20px' }}>Berat (Kg)</div>
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
                                                            MU
                                                        </HeaderCell>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Harga
                                                        </HeaderCell>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Diskon(%)
                                                        </HeaderCell>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Potongan
                                                        </HeaderCell>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Pajak
                                                        </HeaderCell>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            Jumlah (Def)
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
                                                    </HeaderRow>
                                                </Header>

                                                <Body>
                                                    {tableList.map((item: any) => (
                                                        <Row key={item.id_lpb} item={item}>
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
                                                                    value={item.no_sp}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'no_sp', '')}
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
                                                                    value={item.kodegrup}
                                                                    readOnly
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'kodegrup')}
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
                                                                    readOnly
                                                                />
                                                            </Cell>

                                                            <Cell style={{ textAlign: 'center' }}>
                                                                <input
                                                                    type="text"
                                                                    style={{
                                                                        width: '100%',
                                                                        border: 'none',
                                                                        fontSize: '14px',
                                                                        outline: 'none',
                                                                        background: '#dedede',
                                                                    }}
                                                                    value={item.no_item}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'no_item', '')}
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
                                                                    value={item.diskripsi}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'diskripsi', '')}
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
                                                                    value={item.sat_sp}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'sat_sp', '')}
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
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'qty_po', '')}
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
                                                                    value={item.sat_sj}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'sat_sj', '')}
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
                                                                    value={frmNumber(item.qty_sj)}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'qty_sj', '')}
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
                                                                    value={item.satuan}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'satuan', '')}
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
                                                                    value={frmNumber(item.qty)}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'qty', '')}
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
                                                                    // value={item.brt * item.qty}
                                                                    value={frmNumber(item.berat)}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'berat', '')}
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
                                                                    value={item.kode_mu}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'kode_mu', '')}
                                                                    readOnly
                                                                />
                                                            </Cell>
                                                            <Cell>
                                                                <input
                                                                    id={`harga_mu${item.id_lpb}`}
                                                                    type="text"
                                                                    style={{
                                                                        width: '100%',
                                                                        border: 'none',
                                                                        fontSize: '14px',
                                                                        outline: 'none',
                                                                        background: 'transparent',
                                                                        textAlign: 'right',
                                                                    }}
                                                                    defaultValue={frmNumber(item.harga_mu)}
                                                                    // defaultValue={item.harga_mu.toLocaleString()}
                                                                    onBlur={(event) => handleUpdate(event.target.value, item.id_lpb, 'harga_mu', '')}
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
                                                                />
                                                            </Cell>
                                                            <Cell>
                                                                <input
                                                                    id={`diskon_ui${item.id_lpb}`}
                                                                    type="text"
                                                                    style={{
                                                                        width: '100%',
                                                                        border: 'none',
                                                                        fontSize: '14px',
                                                                        outline: 'none',
                                                                        background: 'transparent',
                                                                        textAlign: 'right',
                                                                    }}
                                                                    defaultValue={item.diskon}
                                                                    onBlur={(event) => handleUpdate(event.target.value, item.id_lpb, 'diskon', '')}
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
                                                                />
                                                            </Cell>
                                                            <Cell>
                                                                <input
                                                                    id={`potongan_mu${item.id_lpb}`}
                                                                    type="text"
                                                                    style={{
                                                                        width: '100%',
                                                                        border: 'none',
                                                                        fontSize: '14px',
                                                                        outline: 'none',
                                                                        background: 'transparent',
                                                                        textAlign: 'right',
                                                                    }}
                                                                    // value={item.potongan_mu === 0 ? '' : item.potongan_mu}
                                                                    defaultValue={item.potongan_mu}
                                                                    onBlur={(event) => handleUpdate(event.target.value, item.id_lpb, 'potongan_mu', '')}
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
                                                                />
                                                            </Cell>
                                                            <Cell>
                                                                {/* <input
                                                                type="text"
                                                                style={{
                                                                    width: '100%',
                                                                    border: 'none',
                                                                    fontSize: '14px',
                                                                    outline: 'none',
                                                                    background: 'transparent',
                                                                }}
                                                                value={item.kode_pajak}
                                                                onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'diskon_mu')}
                                                            /> */}
                                                                <div className="flex">
                                                                    {/* <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.pajak}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'pajak')}
                                        /> */}
                                                                    <select
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.pajak}
                                                                        // defaultValue={valueDataPajakbyRow}
                                                                        onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'pajak', selectedOptionPajak)}
                                                                        disabled={routeFilePendukungValue === 'true' ? true : false}
                                                                    >
                                                                        {/* handleupdate pajak belum */}
                                                                        {selectNilaiPajak.map((option: any, index: number) => (
                                                                            <option key={index} value={option.nilai}>
                                                                                {option.kode_pajak} - {option.catatan}
                                                                            </option>
                                                                        ))}
                                                                    </select>
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
                                                                        textAlign: 'right',
                                                                    }}
                                                                    value={frmNumber(item.jumlah_mu)}
                                                                    // value={frmNumber(parseFloat(tanpaKoma(item.qty)) * parseFloat(tanpaKoma(item.harga_mu)))}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'jumlah_mu', '')}
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
                                                                    value={item.ket}
                                                                    // onChange={(event) => handleUpdate(event.target.value, item.id_lpb, 'ket', '')}
                                                                    readOnly
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
                                                {/* <TaskName isOpen={modaltable} onClose={() => setModalTable(false)} onSelectData={(selectedData: any) => handleSelectedData(selectedData)} /> */}
                                            </>
                                        )}
                                    </Table>
                                </div>
                                <div className="mt-4">
                                    {/* <Group position="right" mx={10}>
                                        <Pagination total={pagination.state.getTotalPages(data.nodes)} page={pagination.state.page + 1} onChange={(page) => pagination.fns.onSetPage(page - 1)} />
                                    </Group> */}
                                </div>
                            </div>
                        </div>

                        <div className=" flex justify-between">
                            <div className="flex" style={{ alignItems: 'center', fontWeight: 'bold' }}>
                                <span>Total Tonase : {''}</span>
                                <span style={{ margin: '0 30px' }}>{frmNumber(totalBeratHeader)} Kg</span>
                            </div>

                            <div className="flex" style={{ fontWeight: 'bold' }}>
                                <span>Sub Total : {''}</span>
                                <span style={{ margin: '0 15px' }}>{frmNumber(subTotal)}</span>{' '}
                            </div>
                        </div>
                        {/* </div> */}
                    </div>
                </TabPanel>
                {/* JURNAL */}
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
                                    <div className="mb-1.5 flex justify-end">
                                        {' '}
                                        {/* Mengubah posisi flex menjadi justify-end */}
                                        {/* // DISABLED 2024-07-05 */}
                                        {/* <button
                                            title="Tambah Akun"
                                            type="submit"
                                            onClick={() => (routeFilePendukungValue === 'true' ? null : handleSubmitJurnal())}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button>
                                        <button
                                            title="Hapus Akun"
                                            type="submit"
                                            onClick={() => (routeFilePendukungValue === 'true' ? null : handleRemoveJurnal())}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button> */}
                                        <button
                                            title="Auto Jurnal"
                                            type="submit"
                                            onClick={() => (routeFilePendukungValue === 'true' ? null : autojurnal())}
                                            className="btn btn-secondary mr-1"
                                            style={{ background: 'black', borderColor: '#5c5a5a' }}
                                        >
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
                                        routeFilePendukungValue={routeFilePendukungValue}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '50px', marginTop: '10px', marginRight: '10vh', fontWeight: 'bold' }}>
                            <div>Total Db/Kr</div>
                            <div>{frmNumber(totalDebet)}</div>
                            <div>{frmNumber(totalKredit)}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '50px', marginTop: '10px', marginRight: '10vh', fontWeight: 'bold' }}>
                            <div>Selisih</div>
                            <div>{frmNumber(totalDebet - totalKredit)}</div>
                            <div style={{ visibility: 'hidden' }}></div>
                            <div style={{ visibility: 'hidden' }}></div>
                        </div>
                    </div>
                </TabPanel>

                {/* File Pendukung */}
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
                                                        {selectedFiles.map((file: any, index: any) => (
                                                            <tr
                                                                key={index}
                                                                onClick={() => handleFileSelect(index, file.name, file.decodeBase64_string, 'PB', file.filegambar)}
                                                                style={{ cursor: 'pointer', backgroundColor: selectedRowsImage === index ? '#e2e8f0' : 'inherit' }}
                                                            >
                                                                <td>{index + 1}</td>
                                                                <td>{file.name === undefined ? file.fileoriginal : file.name}</td>
                                                            </tr>
                                                        ))}
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
            <div className="panel mt-3 bg-gray-300" style={{ background: '#dedede' }}>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 p-4" style={{ width: '120%' }}>
                        <label htmlFor="catatan" className="items-alignright flex">
                            <div className="mb-4 flex items-center">
                                <label style={{ fontWeight: 'bold' }} htmlFor="catatan">
                                    Catatan:
                                </label>
                            </div>
                            <div className="ml-auto">
                                <input
                                    checked={fdo === 'P'}
                                    type="checkbox"
                                    className="form-checkbox"
                                    onChange={(e) => (routeFilePendukungValue === 'true' ? null : setFDO(e.target.checked ? 'P' : ''))}
                                />
                                <span style={{ fontWeight: 'bold', backgroundColor: 'rgb(134, 249, 226)' }} className="ml-auto bg-green-200">
                                    Barang untuk realisasi ke cabang
                                </span>
                            </div>
                        </label>
                        <form>
                            <div className="mb-4 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-600">
                                <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                    <label className="sr-only">Publish post</label>
                                    <textarea
                                        id="keterangan"
                                        rows={6}
                                        className="form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                        placeholder=""
                                        required
                                        onChange={(event) => setKeterangan(event.target.value)}
                                        readOnly={routeFilePendukungValue === 'true' ? true : false}
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                        <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Terbilang :</div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <span style={{ fontSize: '15px', marginTop: '12px', color: 'green', textTransform: 'capitalize' }}>{terbilang}</span>
                        </div>
                    </div>
                    <div className="order-last col-span-1 justify-end self-end p-4" style={{ marginLeft: '40%' }}>
                        <div className="mb-4 flex justify-between">
                            <div className="flex items-center">
                                <label htmlFor="diskon" className="mr-7">
                                    Diskon (%)
                                </label>
                                <input
                                    placeholder="%"
                                    type="number"
                                    id="diskon"
                                    className="form-input ml-3 mr-1 w-20"
                                    value={persenDiskon === 0 ? '' : persenDiskon}
                                    onChange={(e) => handleDiskonSubtotal(e.target.value)}
                                    readOnly={routeFilePendukungValue === 'true' ? true : false}
                                />
                                =
                                <input
                                    placeholder="Diskon.."
                                    type="number"
                                    id="diskonResult"
                                    className="form-input ml-1 w-32"
                                    value={nominalDiskon === 0 ? '' : nominalDiskon}
                                    onChange={(e) => handleNominalDiskonSubtotal(e.target.value)}
                                    readOnly={routeFilePendukungValue === 'true' ? true : false}
                                />
                            </div>
                        </div>
                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>DPP</span>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginRight: '5vh' }}>
                                {frmNumber(valueNilaiDpp)}
                            </label>
                        </div>

                        <div className="mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Pajak</span>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginRight: '5vh' }}>
                                {frmNumber(totalNilaiPajakRP)}
                            </label>
                        </div>
                        <div className="mb-4 flex justify-between">
                            <div className="flex items-center">
                                <label htmlFor="diskon" className="mr-0">
                                    Biaya Kirim (%)
                                </label>
                                <input
                                    placeholder="%"
                                    type="number"
                                    id="diskon"
                                    className="form-input ml-3 mr-1 w-20"
                                    value={persenBiayaKirim}
                                    onChange={(e) => handleBiayaKirimPersen(e.target.value)}
                                    readOnly={routeFilePendukungValue === 'true' ? true : false}
                                />
                                =
                                <input
                                    placeholder="Biaya Kirim.."
                                    type="number"
                                    id="diskonResult"
                                    className="form-input ml-1 w-32"
                                    value={kirimMU}
                                    onChange={(e) => handleBiayaKirimNominal(e.target.value)}
                                    readOnly={routeFilePendukungValue === 'true' ? true : false}
                                />
                            </div>
                        </div>
                        <div className="mb-4 h-2 border-t-2 border-gray-300"></div>
                        <div className="flex items-center" style={{ fontWeight: 'bold' }}>
                            {selectedOptionPajak === 'N' ? (
                                <div className="mr-4">
                                    <span>Total Tanpa Pajak: </span>
                                    <label className="mt-1" style={{ width: '177px', fontWeight: 'bold', fontSize: '16px', textAlign: 'center', color: 'red' }}>
                                        {frmNumber(subTotal - nominalDiskon + kirimMU)}
                                    </label>
                                </div>
                            ) : selectedOptionPajak === 'I' ? (
                                <div className="mr-4">
                                    <span>Total Setelah Pajak include: </span>
                                    <label className="mt-1" style={{ width: '177px', fontWeight: 'bold', fontSize: '16px', textAlign: 'center', color: 'red' }}>
                                        {frmNumber(valueNilaiDpp + totalNilaiPajakRP + kirimMU)}
                                    </label>
                                </div>
                            ) : selectedOptionPajak === 'E' ? (
                                <div className="mr-4">
                                    <span>Total Setelah Pajak exclude: </span>
                                    <label className="mt-1" style={{ width: '177px', fontWeight: 'bold', fontSize: '16px', textAlign: 'center', color: 'red' }}>
                                        {frmNumber(valueNilaiDpp + totalNilaiPajakRP + kirimMU)}
                                        {/* {valueNilaiDpp + '#' + totalNilaiPajakRP + '#' + kirimMU} */}
                                    </label>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* BUTTON BAWAH */}
            <div className="my-5 flex justify-between">
                <div className="flex">
                    {routeStatusValue === 'terbuka' || routeStatusValue === 'app_pra_pb' || routeFilePendukungValue === 'true' ? (
                        <button
                            type="submit"
                            className="btn btn-secondary mr-1"
                            onClick={() => {
                                if (routeFilePendukungValue === 'true') {
                                    handleUpload(kodePB, 'update');
                                } else {
                                    //#DI KOMENTAR DULU UNTUK NYOBAEXPORT KONTRAK PUSAT
                                    // saveDoc('');
                                    const fromFirstDayInPeriod = async () => {
                                        try {
                                            // var daysDifferenceFutureDate = moment(dateTglDiterima).diff(moment(currentDateTime), 'days');
                                            // var daysDifferenceBackDate = moment(currentDateTime).diff(moment(dateTglDiterima), 'days');
                                            // // console.log(daysDifferenceFutureDate);
                                            // // console.log(daysDifferenceBackDate);
                                            // if (daysDifferenceFutureDate > 2) {
                                            //     // console.log('Tanggal terima future date lebih besar dari 3 hari.');
                                            //     Swal.fire({
                                            //         title: 'Warning',
                                            //         text: 'Tanggal terima future date lebih besar dari 3 hari.',
                                            //         icon: 'warning',
                                            //     });
                                            // } else if (daysDifferenceBackDate > 14) {
                                            //     // console.log('Tanggal terima back date lebih besar dari 14 hari.');
                                            //     Swal.fire({
                                            //         title: 'Warning',
                                            //         text: 'Tanggal terima back date lebih besar dari 14 hari.',
                                            //         icon: 'warning',
                                            //     });
                                            // } else {
                                            const periode = await FirstDayInPeriod(kode_entitas);
                                            const formatPeriode = moment(periode).format('YYYY-MM-DD');
                                            // BLOCKING: tgl_dokumen//lpb < tgl currentdate
                                            if (moment(dateTglDokumen).format('YYYY-MM-DD') < formatPeriode) {
                                                // blok periode
                                                Swal.fire({
                                                    title: 'Warning',
                                                    text: 'Tanggal tidak dalam periode akuntansi.',
                                                    icon: 'warning',
                                                    target: '#approvalPB'
                                                });
                                            } else {
                                                if (moment(dateTglDokumen).format('YYYY-MM-DD') < moment(currentDateTime).format('YYYY-MM-DD')) {
                                                    // blok < currentdate
                                                    Swal.fire({
                                                        title: 'Warning',
                                                        text: 'Tgl. Dokumen lebih kecil dari hari ini.',
                                                        icon: 'warning',
                                                        target: '#approvalPB',
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
                                                    prosesBloking('');
                                                    // saveDoc('');
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
                    ) : null}
                    <button
                        type="submit"
                        className="btn btn-secondary mr-1"
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                        onClick={() => {
                            // const encode = Buffer.from(`tglAwal=${routeTglAwal}&tglAkhir=${routeTglAkhir}&tglSjSuppAwal=${routeTglSjSuppAwal}&tglSjSuppAkhir=${routeTglSjSuppAkhir}`).toString(
                            //     'base64'
                            // );
                            // router.push({ pathname: './pblist', query: { str: encode } });
                            backPage();

                            // const result = oneToOneNumber(noPB, '03', moment().toDate());
                            // console.log(result); // Output: XYZPB.010001

                            // let noDokBaru: any;
                            // let sNoFBPusat1: any;
                            // let sNoFBPusat: any;
                            // noDokBaru = await generateNU('898', '', '03', moment().format('YYYYMM'));
                            // console.log('noDokBaru ', noDokBaru);

                            // const cekData = await cekDataDiDatabase('898', 'tb_m_fb', 'no_fb', noDokBaru, token);
                            // console.log('cekData ', cekData);
                            // if (cekData) {
                            //     // const cekNoDok = await cekDataDiDatabase(kode_entitas, 'tb_m_ttb_master', 'no_ttb', jsonData?.no_ttb, token);
                            //     // sNoFBPusat = await generateNUDivisi(kode_entitas, defaultNoTtb, divisiPenjualan, '08', moment(date1).format('YYYYMM'), moment(date1).format('YYMM') + `${divisiPenjualan}`);
                            //     sNoFBPusat1 = await generateNU('898', noDokBaru, '03', moment().format('YYYYMM'));
                            //     sNoFBPusat = await generateNU('898', '', '03', moment().format('YYYYMM'));

                            //     console.log('sNoFBPusat1 ', sNoFBPusat1);
                            //     console.log('sNoFBPusat ', sNoFBPusat);
                            // } else {
                            //     sNoFBPusat = noDokBaru;
                            // }
                            // console.log('sNoFBPusat ', sNoFBPusat);
                        }}
                        // onClick={async () => {
                        //     // const GetEntitasFPB: any = await GetEntitasFromFPB(kode_entitas, 'FP0000041165');
                        //     // console.log(GetEntitasFPB);
                        //     // const ambilEntitasFpb = GetEntitasFPB.master[0].kode_entitas;
                        //     // console.log('ambilEntitasFpb', ambilEntitasFpb);
                        //     let sDetailMBCabangBeli = await vDetailMBCabangBeli();
                        //     console.log('sDetailMBCabangBeli', sDetailMBCabangBeli);
                        // }}
                    >
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Batal
                    </button>
                    {/* <button
                        type="submit"
                        className="btn btn-secondary mr-1"
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                        onClick={() => {
                            validasiApproval();
                        }}
                        // onClick={async () => {
                        //     // const GetEntitasFPB: any = await GetEntitasFromFPB(kode_entitas, 'FP0000041165');
                        //     // console.log(GetEntitasFPB);
                        //     // const ambilEntitasFpb = GetEntitasFPB.master[0].kode_entitas;
                        //     // console.log('ambilEntitasFpb', ambilEntitasFpb);
                        //     let sDetailMBCabangBeli = await vDetailMBCabangBeli();
                        //     console.log('sDetailMBCabangBeli', sDetailMBCabangBeli);
                        // }}
                    >
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        TESSSS
                    </button> */}
                </div>
            </div>
            <AkunDlg
                isOpen={modalAkunDlg}
                onClose={() => setModalAkunDlg(false)}
                onSelectData={(dataObject: any) => handleSelectedData(dataObject, 'akun_jurnal')}
                kode_entitas={kode_entitas}
                userid={userid}
                searchtype={modalTipeCari}
                cariNo={nilaiValueNoAkun}
                cariNama={nilaiValueNamaAkun}
                tipeValue={tipeValue}
            />
            <SupplierModal
                isOpen={modalSuppJurnal}
                onClose={() => setModalSuppJurnal(false)}
                userid={userid}
                kode_entitas={kode_entitas}
                onSelectData={(dataObject: any) => handleSelectedData(dataObject, 'supp_jurnal')}
                // handleNamaSupp={handleNamaSupp}
                // nilaiTotalId={changeNumber}
            />
            <SubledgerModal
                isOpen={modalSubledger}
                onClose={() => setModalSubledger(false)}
                userid={userid}
                kode_entitas={kode_entitas}
                onSelectData={(dataObject: any) => handleSelectedData(dataObject, 'subledger')}
                // handleNamaSupp={handleNamaSupp}
                // nilaiTotalId={changeNumber}
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

export default ApprovalPB;
