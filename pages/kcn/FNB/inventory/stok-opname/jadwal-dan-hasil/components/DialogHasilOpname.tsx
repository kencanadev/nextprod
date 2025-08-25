import React, { Fragment, useEffect, useRef, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Filter, Resize, Selection, CommandColumn, Toolbar, Edit } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, Inject, TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import moment from 'moment';
import { AlasanMinusList, AlasanPlusList, jenisOpnameList, tabFilePendukung } from '../constants';
import { Tab } from '@headlessui/react';
import DialogKaryawan from './DialogKaryawan';
import { approveOpnameData, fetchDetailOpname, fetchHasilTimbang, generateStokOpname, simpanOpnameData } from '../api';
import { EditTemplatePsMinus, EditTemplatePsPlus, TemplateGudangAsal, TemplateGudangStok, TemplateGudangTujuan, TemplateHeaderBerat, TemplateHeaderPanjang, TemplateTombol } from '../template';
import {
    cekGudang,
    frmNumber,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleRotateLeft,
    handleRotateRight,
    handleWheel,
    HandleZoomIn,
    HandleZoomOut,
    showConfirmPopup,
    showErrorPopup,
} from '../functions';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import useUploadFiles from '../../../../../../../utils/inventory/opname/jadwal-dan-hasil/hooks/useUploadFiles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFile, faMagnifyingGlass, faPaperclip, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import axios from 'axios';
import Swal from 'sweetalert2';
import DialogGdUtama from './DialogGdUtama';
import DialogQtySistem from './DialogQtySistem';
import DialogQtyTtb from './DialogQtyTtb';
import withReactContent from 'sweetalert2-react-content';
import { swalToast } from '@/pages/kcn/ERP/fa/fpp/utils';
import { swalDialog } from '@/utils/global/fungsi';
import Draggable from 'react-draggable';
import styles from '@styles/index.module.css';
import { Document, Page as PagePDF, pdfjs } from 'react-pdf';
// Configure worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type DialogHasilOpnameProps = {
    isOpen: boolean;
    onClose: () => void;
    approved: boolean;
    kode_entitas: string;
    entitas_zip: string;
    token: string;
    selectedItem: any;
    onRefresh: any;
    userid: string;
    statusPage: string;
    selectedAppLevel: any;
};

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const DialogHasilOpname: React.FC<DialogHasilOpnameProps> = ({ isOpen, onClose, approved, selectedItem, onRefresh, kode_entitas, entitas_zip, token, statusPage, userid, selectedAppLevel }) => {
    // console.log('selectedItem = ', selectedItem, selectedItem?.hasil.toLowerCase(), selectedItem?.status_app.toLowerCase());

    const [activeTab, setActiveTab] = useState('Pelaksanaan Opname');
    const [activeSubTab, setActiveSubTab] = useState('kartu-stok-gudang');
    const [showDialogKry, setShowDialogKry] = useState(false);
    const [showDialogGd, setShowDialgGd] = useState(false);
    const [showDialogQtySistem, setShowDialogQtySistem] = useState(false);
    const [showDialogQtyTtb, setShowDialogQtyTtb] = useState(false);
    const [showDlgKoreksi, setShowDlgKoreksi] = useState(false);
    const [tanggal, setTanggal] = useState(moment(selectedItem?.jam_mulai));
    const [tglSistem, setTglSistem] = useState(moment().format('YYYY-MM-DD'));
    const [jamMulai, setJamMulai] = useState(moment(selectedItem?.jam_mulai));
    const [jamSelesai, setJamSelesai] = useState(moment(selectedItem?.jam_selesai));
    const [checklistJenis, setChecklistJenis] = useState<any>([]);
    const [catatan, setCatatan] = useState(selectedItem?.catatan);
    const [selectedRowIdx, setSelectedRowIdx] = useState(0);
    const [selectedRowIdx2, setSelectedRowIdx2] = useState(0);
    const [gdField, setGdField] = useState('');
    const [alasanKoreksi, setAlasanKoreksi] = useState('');
    const [dataKoreksi, setDataKoreksi] = useState<any>([]);

    const [teamPl, setTeamPl] = useState<any[]>([]);
    const [hasilTimbang, setHasilTimbang] = useState<any>([]);
    const [selectedKaryawan, setSelectedKaryawan] = useState<any>(null);
    const [masterData, setMasterData] = useState<any>([]);
    const [psData, setPsData] = useState<any>([]);
    const [mbData, setMbData] = useState<any>([]);

    // Preview Image
    const [isDragging, setIsDragging] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [zoomScale, setZoomScale] = useState(0.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [showPreviewImg, setShowPreviewImg] = useState(false);
    const [previewImg, setPreviewImg] = useState('');
    const [previewType, setPreviewType] = useState('');

    const gridRef = useRef<GridComponent | any>(null);

    const disabledCondition = selectedItem?.status_app.toLowerCase() !== 'baru';
    const hideGrid = selectedItem?.klasifikasi.toLowerCase() !== 'besi';

    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });

    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };

    const cancelPreviewPdf = () => {
        setPreviewPdf(false);
        // setSelectedImages([]);
    };

    // Hooks Upload Files
    const {
        handleFileSelect,
        handleDelete,
        handleDeleteAllFiles,
        handleUpload,
        downloadFile,
        uploaderRefKsg,
        uploaderRefFb,
        uploaderRefVb,
        uploaderRefForm,
        uploaderRefKss,
        dataKsg,
        setDataKsg,
        dataFb,
        setDataFb,
        dataVb,
        setDataVb,
        dataForm,
        setDataForm,
        dataKss,
        setDataKss,
    } = useUploadFiles({
        kode_opname: selectedItem?.kode_opname,
        kode_entitas: entitas_zip,
        activeSubTab,
    });

    const deleteKry = () => {
        if (selectedKaryawan) {
            setTeamPl(teamPl.filter((item: any) => item.name !== selectedKaryawan));
            setSelectedKaryawan('');
        }
    };

    const deleteOpname = () => {
        setHasilTimbang([]);
    };

    const gridMutasiBarang = useRef<GridComponent | any>(null);
    const handleAddMutasi = async () => {
        gridMutasiBarang.current.endEdit();
        const totalLine = gridMutasiBarang.current!.dataSource.length;
        const isGuAsalNull = gridMutasiBarang.current.dataSource.some((item: any) => item.nama_asal === null);
        const isGuTujuanNull = gridMutasiBarang.current.dataSource.some((item: any) => item.nama_tujuan === null);
        const isQtyNull = gridMutasiBarang.current.dataSource.some((item: any) => item.qty === 0);

        if (isGuAsalNull) {
            // alert('Gudang asal harus diisi');
            if (await showErrorPopup('Gudang asal harus diisi.', 350, '#dialogHasilOpname')) return;
        } else if (isGuTujuanNull) {
            // alert('Gudang tujuan harus diisi');
            if (await showErrorPopup('Gudang tujuan harus diisi.', 350, '#dialogHasilOpname')) return;
        } else if (isQtyNull) {
            // alert('Kuantitas harus diisi');
            if (await showErrorPopup('Kuantitas harus diisi.', 350, '#dialogHasilOpname')) return;
        }
        const newMutasiRow = {
            id_opname: totalLine + 1,
            nama_asal: null,
            nama_tujuan: null,
            qty: 0,
        };

        gridMutasiBarang.current.addRecord(newMutasiRow, totalLine);
        gridMutasiBarang.current.refresh();
    };
    const addDefaultRowMutasi = () => {
        const defaultRow = {
            id_opname: 1,
            nama_asal: null,
            nama_tujuan: null,
            qty: 0,
        };
        gridMutasiBarang.current.addRecord(defaultRow, 0);
        gridMutasiBarang.current.refresh();
    };

    const handleDeleteMutasi = async () => {
        // Swal.fire({
        //     text: `Hapus data di baris ${selectedRowIdx + 1}?`,
        //     target: '#dialogHasilOpname',
        //     showCancelButton: true,
        //     confirmButtonText: 'Yes',
        //     cancelButtonText: 'No',
        // }).then((res) => {
        //     if (res.isConfirmed) {
        //         gridMutasiBarang.current.dataSource.splice(selectedRowIdx, 1);
        //         gridMutasiBarang.current!.dataSource.forEach((item: any, index: any) => {
        //             item.id_mutasi = index + 1;
        //         });
        //     }
        //     gridMutasiBarang.current.refresh();
        // });
        if (await showConfirmPopup(`Hapus data di baris ${selectedRowIdx + 1}?`)) {
            gridMutasiBarang.current.dataSource.splice(selectedRowIdx, 1);

            gridMutasiBarang.current.dataSource.forEach((item: any, index: number) => {
                item.id_mutasi = index + 1;
            });

            gridMutasiBarang.current.refresh();
        }
    };

    const handleDeleteAllMutasi = async () => {
        if (await showConfirmPopup(`Hapus semua data?`)) {
            gridMutasiBarang.current!.dataSource.splice(0, gridMutasiBarang.current!.dataSource.length);
            gridMutasiBarang.current!.refresh();
        }

        // Swal.fire({
        //     text: 'Hapus semua data?',
        //     target: '#dialogHasilOpname',
        //     showCancelButton: true,
        //     confirmButtonText: 'Yes',
        //     cancelButtonText: 'No',
        // }).then((res) => {
        //     if (res.isConfirmed) {
        //         gridMutasiBarang.current!.dataSource.splice(0, gridMutasiBarang.current!.dataSource.length);
        //         gridMutasiBarang.current!.refresh();
        //     }
        // });
    };

    const handleActionCompleteMutasiBarang = (args: any) => {
        if (args.requestType === 'save') {
            const editedData = args.data;
            gridMutasiBarang.current.dataSource[args.rowIndex] = editedData;
            gridMutasiBarang.current.refresh();
        }
    };

    const gridStokBarang = useRef<GridComponent | any>(null);
    const handleAddStok = () => {
        gridStokBarang.current.endEdit();
        const totalLine = gridStokBarang.current!.dataSource.length;
        const isGuNull = gridStokBarang.current.dataSource.some((item: any) => item.nama_gudang === null);
        const isQtyNull = gridStokBarang.current.dataSource.some((item: any) => item.qty === 0);
        const isAlasanPlusNull = gridStokBarang.current.dataSource.some((item: any) => item.alasanPlus === null);
        const isKeteranganNull = gridStokBarang.current.dataSource.some((item: any) => item.keterangan === null);

        if (isGuNull) {
            // alert('Gudang harus diisi');
            Swal.fire({
                text: 'Gudang harus diisi.',
                icon: 'warning',
                timer: 2000,
                target: '#dialogHasilOpname',
                backdrop: true,
                showConfirmButton: false,
            });
            return;
        } else if (isQtyNull) {
            // alert('Kuantitas harus diisi');
            Swal.fire({
                text: 'Kuantitas harus diisi.',
                icon: 'warning',
                timer: 2000,
                target: '#dialogHasilOpname',
                backdrop: true,
                showConfirmButton: false,
            });
            return;
        } else if (isAlasanPlusNull) {
            // alert('Alasan PS (+) harus diisi');
            Swal.fire({
                text: 'Alasan PS (+) harus diisi.',
                icon: 'warning',
                timer: 2000,
                target: '#dialogHasilOpname',
                backdrop: true,
                showConfirmButton: false,
            });
            return;
        } else if (isKeteranganNull) {
            // alert('Keterangan harus diisi');
            Swal.fire({
                text: 'Keterangan harus diisi.',
                icon: 'warning',
                timer: 2000,
                target: '#dialogHasilOpname',
                backdrop: true,
                showConfirmButton: false,
            });
            return;
        }

        const newStokRow = {
            id_opname: totalLine + 1,
            nama_gudang: null,
            qty: 0,
            alasanPlus: null,
            alasanMin: null,
            keterangan: null,
        };

        gridStokBarang.current.addRecord(newStokRow, totalLine);
        gridStokBarang.current.refresh();
    };

    const addDefaultRowStok = () => {
        const defaultRow = {
            id_stok: 1,
            nama_gudang: null,
            qty: 0,
            alasanPlus: null,
            keterangan: null,
        };
        gridStokBarang.current.addRecord(defaultRow, 0);
        gridStokBarang.current.refresh();
    };

    const handleDeleteStok = () => {
        Swal.fire({
            text: `Hapus data di baris ${selectedRowIdx2 + 1}?`,
            target: '#dialogHasilOpname',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((res) => {
            if (res.isConfirmed) {
                gridStokBarang.current.dataSource.splice(selectedRowIdx2, 1);
                gridStokBarang.current!.dataSource.forEach((item: any, index: any) => {
                    item.id_stok = index + 1;
                });
            }
            gridStokBarang.current.refresh();
        });
    };

    const handleDeleteAllStok = () => {
        Swal.fire({
            text: 'Hapus semua data?',
            target: '#dialogHasilOpname',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((res) => {
            if (res.isConfirmed) {
                gridStokBarang.current!.dataSource.splice(0, gridStokBarang.current!.dataSource.length);
                gridStokBarang.current!.refresh();
            }
        });
    };

    const handleActionCompleteStokBarang = (args: any) => {
        if (args.requestType === 'save') {
            const editedData = args.data;
            gridStokBarang.current.dataSource[args.rowIndex] = editedData;
            gridStokBarang.current.refresh();
        }
    };

    const getEditData = async () => {
        try {
            const params = {
                entitas: entitas_zip,
                param1: selectedItem?.kode_opname,
                param2: 'MD',
            };
            const response = await fetchDetailOpname({ params, token });
            const { master, detail, ps, mb } = response;

            setDataKoreksi(master.alasan_koreksi);
            const jml_berat = parseFloat(master.jml_berat);
            const jml_qty = parseFloat(master.jml_qty);
            const timbangan_harus = master.berat_item * jml_qty;
            const timbangan_selisih = jml_berat - timbangan_harus;
            const patah_rusak = parseFloat(master.jml_patah) + parseFloat(master.jml_rusak);
            let timbangan_qty;
            if (timbangan_selisih > 0) {
                timbangan_qty = Math.ceil(timbangan_selisih / master.berat_item);
            } else {
                timbangan_qty = Math.ceil((timbangan_selisih / master.berat_item) * -1) * -1;
            }

            setJamMulai(moment(master.jam_mulai));
            setJamSelesai(moment(master.jam_selesai));

            // Generate untuk Tag: 'GU'
            const bodyGU = {
                ...master,
                entitas: kode_entitas,
                Tag: 'GU',
                request: 'GET',
                tgl_awal: moment(master.jam_mulai).format('YYYY-MM-DD'),
                jam_akhir: moment(master.jam_selesai).format('HH:mm'),
                detail: detail,
            };

            // Generate untuk Tag: 'TTB'
            const bodyTTB = {
                ...master,
                entitas: kode_entitas,
                Tag: 'TTB',
                request: 'GET',
                tgl_awal: moment(master.jam_mulai).format('YYYY-MM-DD'),
                jam_akhir: moment(master.jam_selesai).format('HH:mm'),
                detail: detail,
            };

            const dataGU = await generateStokOpname({ body: bodyGU, token });
            const dataTTB = await generateStokOpname({ body: bodyTTB, token });
            let jml_sistem;
            let jml_ttb;

            if (master.jml_sistem !== null && master.jml_sistem !== '' && parseFloat(master.jml_sistem) !== 0) {
                jml_sistem = parseFloat(master.jml_sistem);
            } else {
                jml_sistem = dataGU.stok;
            }

            if (master.jml_ttb !== null && master.jml_ttb !== '' && parseFloat(master.jml_ttb) !== 0) {
                jml_ttb = parseFloat(master.jml_ttb);
            } else {
                jml_ttb = dataTTB.stok;
            }

            const modifiedMaster = {
                ...master,
                jml_berat,
                jml_qty,
                timbangan_harus: timbangan_harus.toFixed(2),
                timbangan_selisih: timbangan_selisih.toFixed(1),
                timbangan_qty,
                jml_utuh: parseFloat(master.jml_utuh),
                jml_sistem,
                jml_ttb,
                tgl_sistem: master.tgl_sistem === null ? null : moment(master.tgl_sistem).format('YYYY-MM-DD'),
                patah_rusak,
                jml_patah: parseFloat(master.jml_patah),
                jml_rusak: parseFloat(master.jml_rusak),
                berat_item: master.berat_item.toFixed(2),
            };

            const modifiedDetail = detail.map((item: any) => ({
                ...item,
                berat: parseFloat(item.berat),
                qty: parseFloat(item.qty),
                panjang: parseFloat(item.panjang),
                tgl_sistem: item.tgl_sistem === null ? null : moment(item.tgl_sistem).format('DD-MM-YYYY HH:mm'),
            }));

            const modifiedPs = ps.map((item: any, index: any) => ({
                ...item,
                nama_gudang: item.nama_gudang,
                alasanPlus: item.alasanPlus,
                alasanMin: item.alasanMin,
                qty: parseFloat(item.qty),
                keterangan: item.keterangan,
                kode_gudang: item.kode_gudang,
                kode_tujuan: item.kode_tujuan,
            }));

            const modifiedMb = mb.map((item: any, index: any) => ({
                ...item,
                nama_asal: item.nama_asal,
                nama_tujuan: item.nama_tujuan,
                kode_gudang: item.kode_gudang,
                kode_tujuan: item.kode_tujuan,
                qty: parseFloat(item.qty),
            }));

            setTanggal(moment(master.jam_mulai));
            setMasterData(modifiedMaster);
            console.log('modifiedMaster = ', modifiedMaster);

            setHasilTimbang(modifiedDetail);
            gridRef.current.setProperties({ dataSource: modifiedDetail });
            gridRef.current.refresh();
            setPsData(modifiedPs);
            // gridMutasiBarang.current.setProperties({ dataSource: modifiedPs });
            setMbData(modifiedMb);
            // gridStokBarang.current.setProperties({ dataSource: modifiedMb });
            return { modifiedMaster, master, detail };
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getHasilStokOpname = async (tipe: string) => {
        let dataGU;
        let dataTTB;

        if (tipe === 'GU') {
            // Generate untuk Tag: 'GU'
            const bodyGU = {
                ...masterData,
                entitas: kode_entitas,
                Tag: 'GU',
                request: 'GET',
                tgl_awal: moment(masterData.jam_mulai).format('YYYY-MM-DD'),
                jam_akhir: moment(masterData.jam_selesai).format('HH:mm'),
                detail: hasilTimbang,
            };

            dataGU = await generateStokOpname({ body: bodyGU, token });
        } else if (tipe === 'TTB') {
            // Generate untuk Tag: 'TTB'
            const bodyTTB = {
                ...masterData,
                entitas: kode_entitas,
                Tag: 'TTB',
                request: 'GET',
                tgl_awal: moment(masterData.jam_mulai).format('YYYY-MM-DD'),
                jam_akhir: moment(masterData.jam_selesai).format('HH:mm'),
                detail: hasilTimbang,
            };

            dataTTB = await generateStokOpname({ body: bodyTTB, token });
        }

        setMasterData({
            ...masterData,
            jml_sistem: dataGU?.stok > 0 ? dataGU?.stok : masterData.jml_sistem, // TAG = GU
            ket_sistem: tipe === 'GU' ? '' : masterData.ket_sistem,
            jml_ttb: dataTTB?.stok > 0 ? dataTTB?.stok : masterData.jml_ttb, // TAG = TTB
            ket_ttb: tipe === 'TTB' ? '' : masterData.ket_ttb,
        });
    };

    const handleKoreksiSubmit = async () => {
        const detail = hasilTimbang.map((item: any) => ({
            ...item,
            tgl_hitung: moment(item.tgl_hitung).format('YYYY-MM-DD'),
        }));

        const mb = mbData.map((item: any) => ({
            ...item,
        }));

        const ps = psData.map((item: any) => ({
            ...item,
        }));

        let alasan_koreksi_array = [
            alasanKoreksi,
            'Koreksi hasil stock opname',
            `Tgl Generate : ${moment(tanggal).format('DD-MM-YYYY')}`,
            `Tgl. Opname : ${moment(selectedItem?.tgl_opname, 'dddd, DD-MM-YYYY').format('DD-MM-YYYY')}`,
            `Nama Barang : ${selectedItem?.nama_item}`,
        ];

        if (dataKoreksi !== '') {
            // tambah 1 datu alasan_koreksi di awal
            alasan_koreksi_array.unshift(`${dataKoreksi}\r`);
        }

        // Hilangkan null, undefined, string kosong, "null", dan "undefined"
        const alasan_koreksi = alasan_koreksi_array
            .filter((item) => item && item.toString().trim() !== '' && item.toString().trim().toLowerCase() !== 'null' && item.toString().trim().toLowerCase() !== 'undefined')
            .join('\r');

        try {
            const body = {
                entitas: kode_entitas,
                tgl_generate: moment(tanggal).format('YYYY-MM-DD'),
                tgl_opname: moment(selectedItem?.tgl_opname, 'dddd, DD-MM-YYYY').format('YYYY-MM-DD'),
                kode_item: selectedItem?.kode_item,
                jenis: selectedItem?.jenis,
                hasil: hasilTimbang.length > 0 ? 'Y' : 'N',
                jml_berat: selectedItem?.jml_berat,
                jml_qty: selectedItem?.jml_qty,
                jml_utuh: selectedItem?.jml_utuh,
                jml_patah: selectedItem?.jml_patah,
                jml_rusak: selectedItem?.jml_rusak,
                jml_panjang: selectedItem?.jml_panjang,
                tgl_sistem: null,
                // jml_sistem: selectedItem?.jml_panjang,
                // ket_sistem: null,
                // jml_ttb: selectedItem?.jml_panjang,
                // ket_ttb: null,
                jml_sistem: masterData.jml_sistem,
                ket_sistem: masterData.ket_sistem,
                jml_ttb: masterData.jml_ttb,
                ket_ttb: masterData.ket_ttb,
                user_app1: Number(selectedItem?.applevel) < 2 ? null : selectedItem?.user_app1,
                tgl_app1: Number(selectedItem?.applevel) < 2 ? null : moment(selectedItem?.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                user_app2: null,
                tgl_app2: null,
                user_app3: null,
                tgl_app3: null,
                user_app4: null,
                tgl_app4: null,
                applevel: selectedAppLevel?.applevel >= '2' ? '1' : '9',
                komplit: 'N',
                team: teamPl
                    .map((item: any) => item.name)
                    .filter((name: any) => name)
                    .join('\r\n'),
                catatan,
                nota: selectedItem?.nota,
                userid: selectedItem?.userid,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                jam_mulai: moment(jamMulai).format('YYYY-MM-DD HH:mm:ss'),
                jam_selesai: moment(jamSelesai).format('YYYY-MM-DD HH:mm:ss'),
                jenis_mb: selectedItem?.jenis_mb,
                jenis_ps: selectedItem?.jenis_ps,
                jenis_sesuai: selectedItem?.jenis_sesuai,
                alasan_koreksi,
                // temp_status: selectedItem?.applevel,
                temp_status: selectedAppLevel?.applevel >= '2' ? '1' : '9',
                kode_opname: selectedItem?.kode_opname,
                detail,
                mb,
                ps,
            };

            // console.log('body: ', body);

            const res = await approveOpnameData({ body, token });

            if (res.status) {
                setShowDlgKoreksi(false);
                setTimeout(() => {
                    onClose();
                    onRefresh();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getEditData();
        setTeamPl(selectedItem?.team?.split('\r\n').map((item: any) => ({ name: item })));
        setChecklistJenis(selectedItem?.jenis?.split(''));
    }, []);

    useEffect(() => {
        const Async = async () => {
            const loadTbImages = await axios.get(`${apiUrl}/erp/load_images`, {
                params: {
                    entitas: entitas_zip,
                    param1: selectedItem.kode_opname,
                },
            });

            const result = loadTbImages.data.data;

            function base64ToUint8Array(base64: any) {
                const binaryString = atob(base64.split(',')[1]); // ambil bagian setelah koma
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes;
            }

            const dataKsg = await Promise.all(
                result
                    .filter((item: any) => item.dokumen === 'OP1')
                    .map(async (item: any) => {
                        try {
                            const loadImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                                params: {
                                    entitas: entitas_zip,
                                    nama_zip: item.filegambar.split('.')[0] + '.zip',
                                },
                            });

                            const imageUrls = loadImg.data.images.map((img: any) => ({
                                imgUrl: img?.imageUrl,
                            }));

                            const file = item.filegambar;
                            const lastDotIndex = file.lastIndexOf('.');
                            const fileExtension = file.substring(lastDotIndex + 1).toLowerCase();
                            const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: imageUrls?.[0]?.imgUrl,
                                // modifiedName: item.filegambar,
                                modifiedName: modifiedName,
                                type: fileExtension,
                                rawFile: base64ToUint8Array(imageUrls?.[0]?.imgUrl),
                            };
                        } catch (error) {
                            console.error(`Error extracting zip for ${item.filegambar}: `, error);
                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: null,
                                modifiedName: item.filegambar,
                                error: true,
                            };
                        }
                    })
            );
            const dataFb = await Promise.all(
                result
                    .filter((item: any) => item.dokumen === 'OP2')
                    .map(async (item: any) => {
                        try {
                            const loadImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                                params: {
                                    entitas: entitas_zip,
                                    nama_zip: item.filegambar.split('.')[0] + '.zip',
                                },
                            });

                            const imageUrls = loadImg.data.images.map((img: any) => ({
                                imgUrl: img?.imageUrl,
                            }));

                            const file = item.filegambar;
                            const lastDotIndex = file.lastIndexOf('.');
                            const fileExtension = file.substring(lastDotIndex + 1).toLowerCase();
                            const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

                            return {
                                ...item,
                                name: item?.fileoriginal,
                                preview: imageUrls?.[0]?.imgUrl,
                                // modifiedName: item.filegambar,
                                modifiedName: modifiedName,
                                type: fileExtension,
                                rawFile: base64ToUint8Array(imageUrls?.[0]?.imgUrl),
                            };
                        } catch (error) {}
                    })
            );
            const dataVb = await Promise.all(
                result
                    .filter((item: any) => item.dokumen === 'OP3')
                    .map(async (item: any) => {
                        try {
                            const loadImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                                params: {
                                    entitas: entitas_zip,
                                    nama_zip: item.filegambar.split('.')[0] + '.zip',
                                },
                            });

                            const imageUrls = loadImg.data.images.map((img: any) => ({
                                imgUrl: img?.imageUrl,
                            }));

                            const file = item.filegambar;
                            const lastDotIndex = file.lastIndexOf('.');
                            const fileExtension = file.substring(lastDotIndex + 1).toLowerCase();
                            const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

                            return {
                                ...item,
                                name: item?.fileoriginal,
                                preview: imageUrls?.[0]?.imgUrl,
                                // modifiedName: item.filegambar,
                                modifiedName: modifiedName,
                                type: fileExtension,
                                rawFile: base64ToUint8Array(imageUrls?.[0]?.imgUrl),
                            };
                        } catch (error) {
                            console.error(`Error extracting zip for ${item.filegambar}: `, error);
                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: null,
                                modifiedName: item.filegambar,
                                error: true,
                            };
                        }
                    })
            );
            const dataForm = await Promise.all(
                result
                    .filter((item: any) => item.dokumen === 'OP4')
                    .map(async (item: any) => {
                        try {
                            const loadImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                                params: {
                                    entitas: entitas_zip,
                                    nama_zip: item.filegambar.split('.')[0] + '.zip',
                                },
                            });

                            const imageUrls = loadImg.data.images.map((img: any) => ({
                                imgUrl: img.imageUrl,
                            }));

                            const file = item.filegambar;
                            const lastDotIndex = file.lastIndexOf('.');
                            const fileExtension = file.substring(lastDotIndex + 1).toLowerCase();
                            const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: imageUrls[0].imgUrl,
                                // modifiedName: item.filegambar,
                                modifiedName: modifiedName,
                                type: fileExtension,
                                rawFile: base64ToUint8Array(imageUrls?.[0]?.imgUrl),
                            };
                        } catch (error) {
                            console.error(`Error extracting zip for ${item.filegambar}: `, error);
                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: null,
                                modifiedName: item.filegambar,
                                error: true,
                            };
                        }
                    })
            );
            const dataKss = await Promise.all(
                result
                    .filter((item: any) => item.dokumen === 'OP5')
                    .map(async (item: any) => {
                        try {
                            const loadImg = await axios.get(`${apiUrl}/erp/extrak_zip`, {
                                params: {
                                    entitas: entitas_zip,
                                    nama_zip: item.filegambar.split('.')[0] + '.zip',
                                },
                            });

                            const imageUrls = loadImg.data.images.map((img: any) => ({
                                imgUrl: img.imageUrl,
                            }));

                            const file = item.filegambar;
                            const lastDotIndex = file.lastIndexOf('.');
                            const fileExtension = file.substring(lastDotIndex + 1).toLowerCase();
                            const modifiedName = `OP_${kode_entitas}_${moment().format('YYMMDDHHmmssSSS')}.${fileExtension}`;

                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: imageUrls[0].imgUrl,
                                // modifiedName: item.filegambar,
                                modifiedName: modifiedName,
                                type: fileExtension,
                                rawFile: base64ToUint8Array(imageUrls?.[0]?.imgUrl),
                            };
                        } catch (error) {
                            console.error(`Error extracting zip for ${item.filegambar}: `, error);
                            return {
                                ...item,
                                name: item.fileoriginal,
                                preview: null,
                                modifiedName: item.filegambar,
                                error: true,
                            };
                        }
                    })
            );

            setDataKsg(dataKsg);
            setDataFb(dataFb);
            setDataVb(dataVb);
            setDataForm(dataForm);
            setDataKss(dataKss);
        };

        Async();
    }, []);

    useEffect(() => {
        if (showPreviewImg) {
            window.addEventListener('wheel', (e) => handleWheel(e, setZoomScale), { passive: false });
            window.addEventListener('mousemove', (e) => handleMouseMove(e, isDragging, offset, setPosition));
            window.addEventListener('mouseup', () => handleMouseUp(setIsDragging));
        } else {
            window.removeEventListener('wheel', (e) => handleWheel(e, setZoomScale));
            window.removeEventListener('mousemove', (e) => handleMouseMove(e, isDragging, offset, setPosition));
            window.removeEventListener('mouseup', () => handleMouseUp(setIsDragging));
        }
        return () => {
            window.removeEventListener('wheel', (e) => handleWheel(e, setZoomScale));
            window.removeEventListener('mousemove', (e) => handleMouseMove(e, isDragging, offset, setPosition));
            window.removeEventListener('mouseup', () => handleMouseUp(setIsDragging));
        };
    }, [showPreviewImg, handleMouseMove, handleMouseUp, handleWheel]);

    const getHasilTimbang = async () => {
        const askGetTimbang = await Swal.fire({
            icon: 'question',
            html: `
        <style>
          div .swal2-actions {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 15px;
          }
          #swal2-html-container {
            padding: 0px !important;
          }

          p {
            font-size: 13px;
          }
        </style>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <p>
            Ambil data hasil timbang stok opname, proses ini akan menghapus semua data hasil opname yang sudah dimasukan.
          </p>
          <p>
            Apakah proses akan dijalankan?
          </p>
        </div>
      `,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            target: '#dialogHasilOpname',
        });

        if (!askGetTimbang.isConfirmed) return;

        try {
            const params = {
                entitas: kode_entitas,
                param1: selectedItem?.kode_opname,
            };
            const response = await fetchHasilTimbang({ params, token });
            console.log('response: ', response);
            if (response.length === 0) {
                withReactContent(swalToast).fire({
                    icon: 'info',
                    title: 'Belum ada data hasil timbang atau hitung untuk jadwal stok opname ini.',
                    timer: 2000,
                    target: '#dialogHasilOpname',
                });
            }
            const modifiedData = response.map((item: any) => ({
                ...item,
                berat: parseFloat(item.berat),
                qty: parseFloat(item.qty),
                panjang: parseFloat(item.panjang),
                tgl_sistem: item.tgl_sistem === null ? null : moment(item.tgl_sistem).format('DD-MM-YYYY HH:mm'),
            }));
            setHasilTimbang(modifiedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const simpanOpname = async () => {
        const detail = hasilTimbang.map((item: any) => ({
            ...item,
            tgl_hitung: moment(item.tgl_hitung).format('YYYY-MM-DD'),
        }));

        const reqBody = {
            entitas: kode_entitas,
            tgl_generate: moment(tanggal).format('YYYY-MM-DD'),
            tgl_opname: moment(selectedItem?.tgl_opname, 'dddd, DD-MM-YYYY').format('YYYY-MM-DD'),
            kode_item: selectedItem?.kode_item,
            jenis: selectedItem?.jenis,
            hasil: hasilTimbang.length > 0 ? 'Y' : 'N',
            jml_berat: selectedItem?.jml_berat,
            jml_qty: selectedItem?.jml_qty,
            jml_utuh: selectedItem?.jml_utuh,
            jml_patah: selectedItem?.jml_patah,
            jml_rusak: selectedItem?.jml_rusak,
            jml_panjang: selectedItem?.jml_panjang,
            tgl_sistem: selectedItem?.tgl_sistem,
            jml_sistem: selectedItem?.jml_sistem,
            ket_sistem: selectedItem?.ket_sistem,
            jml_ttb: selectedItem?.jml_ttb,
            ket_ttb: selectedItem?.ket_ttb,
            user_app1: null,
            tgl_app1: null,
            user_app2: null,
            tgl_app2: null,
            user_app3: null,
            tgl_app3: null,
            user_app4: null,
            tgl_app4: null,
            applevel: selectedItem?.applevel == 9 ? '8' : selectedItem?.applevel,
            komplit: selectedItem?.komplit,
            team: teamPl
                .map((item: any) => item.name)
                .filter((name: any) => name)
                .join('\r\n'),
            catatan,
            nota: selectedItem?.nota,
            userid: selectedItem?.userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            jam_mulai: moment(jamMulai).format('YYYY-MM-DD HH:mm:ss'),
            jam_selesai: moment(jamSelesai).format('YYYY-MM-DD HH:mm:ss'),
            jenis_mb: selectedItem?.jenis_mb,
            jenis_ps: selectedItem?.jenis_ps,
            jenis_sesuai: selectedItem?.jenis_sesuai,
            alasan_koreksi: selectedItem?.alasan_koreksi,
            temp_status: selectedItem?.temp_status,
            kode_opname: selectedItem?.kode_opname,
            detail,
        };

        try {
            console.log('reqBody = ', reqBody);
            // handleUpload();

            const response = await simpanOpnameData({ body: reqBody, token });

            if (response.status) {
                handleUpload();
                onClose();
                setTimeout(() => {
                    onRefresh();
                }, 500);
            }
        } catch (error) {
            console.error('Error save data:', error);
        }
    };

    const handleJenisCheckbox = (value: string, isChecked: boolean) => {
        setChecklistJenis((prev: any) => {
            const updateJenisData = isChecked ? [...prev, value] : prev.filter((item: any) => item !== value);

            return updateJenisData;
        });
    };

    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    const handlePreviewImg = async (img: string, type: string) => {
        console.log('img = ', entitas_zip, kode_entitas);

        if (type === 'pdf') {
            // Create a Blob from the base64 data
            const byteCharacters = atob(img.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create a URL for the blob and open it in a new tab
            const blobUrl = URL.createObjectURL(blob);
            setPdfUrl(blobUrl);
            setPreviewPdf(true);
            // window.open(blobUrl, '_blank');

            // // Clean up the URL object after the tab is opened
            // setTimeout(() => {
            //     URL.revokeObjectURL(blobUrl);
            // }, 100);

            return;

            //   window.open(img, '_blank');
            //   return;
        }
        setPreviewType(type);
        setShowPreviewImg(true);
        setPreviewImg(img);
    };

    const handleKoreksi = () => {
        Swal.fire({
            text: 'Apakah data hasil stok opname ini harus dikoreksi',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            backdrop: true,
            target: '#dialogHasilOpname',
        }).then((res) => {
            if (res.isConfirmed) {
                setShowDlgKoreksi(true);
            }
        });
    };

    const handleChangePsPlus = (e: any, index: number) => {
        gridStokBarang.current.dataSource[index] = {
            ...gridStokBarang.current.dataSource[index],
            alasanPlus: e.value,
        };
        gridStokBarang.current.refresh();
    };
    const handleChangePsMinus = (e: any, index: number) => {
        gridStokBarang.current.dataSource[index] = {
            ...gridStokBarang.current.dataSource[index],
            alasanMin: e.value,
        };
        gridStokBarang.current.refresh();
    };

    const handleApproval = async () => {
        const jam_awal = moment(jamMulai).format('HH:mm');
        const jam_akhir = moment(jamSelesai).format('HH:mm');

        console.log('selectedItem?.applevel = ', selectedItem?.applevel, statusPage, dataKsg.length);

        // Pengecekan validasi
        if (teamPl.length === 0) {
            if (await showErrorPopup('Team pelaksana opname belum diisi.', 350, '#dialogHasilOpname')) return;
        }

        if (tanggal === null) {
            if (await showErrorPopup('Tanggal pelaksana opname belum diisi.', 350, '#dialogHasilOpname')) return;
        }

        if (jam_awal === '' || jam_awal === '00:00') {
            if (await showErrorPopup('Jam mulai pelaksana opname belum diisi.', 350, '#dialogHasilOpname')) return;
        }

        if (jam_akhir === '' || jam_akhir === '00:00') {
            if (await showErrorPopup('Jam selesai pelaksana opname belum diisi.', 350, '#dialogHasilOpname')) return;
        }

        if (hasilTimbang.length === 0) {
            if (await showErrorPopup('Data pelaksanaan opname belum diisi.', 350, '#dialogHasilOpname')) return;
        }

        if (selectedAppLevel?.applevel === '1' && statusPage === 'APPROVAL' && dataKsg.length === 0) {
            if (await showErrorPopup('File pendukung kartu stok gudang belum diisi.', 450, '#dialogHasilOpname')) return;
        }

        // if ((selectedAppLevel?.applevel === '2' || selectedItem?.applevel === '8') && statusPage === 'APPROVAL' && dataKss.length === 0) {
        //     if (await showErrorPopup('File pendukung kartu stok sistem belum diisi.', 450, '#dialogHasilOpname')) return;
        // }

        if (selectedAppLevel?.applevel === '2' && statusPage === 'APPROVAL' && dataKss.length === 0) {
            if (await showErrorPopup('File pendukung kartu stok sistem belum diisi.', 450, '#dialogHasilOpname')) return;
        }

        const validateGd = cekGudang(hasilTimbang, masterData);
        if (!validateGd) {
            if (await showErrorPopup('Gudang opname GU atau TTB belum semua dimasukkan.', 450, '#dialogHasilOpname')) return;
        }

        const res = await Swal.fire({
            icon: 'question',
            text: 'Apakah data hasil stok opname ini disetujui?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            backdrop: true,
            target: '#dialogHasilOpname',
        });

        if (res.isConfirmed) {
            // Save data here
            const detail = hasilTimbang.map((item: any) => ({
                ...item,
                tgl_hitung: moment(item.tgl_hitung).format('YYYY-MM-DD'),
            }));

            // const mb = gridMutasiBarang.current?.dataSource;
            // console.log('mb: ', mb);

            // let mb;
            // let ps;
            // if (gridMutasiBarang.current.dataSource.length > 0) {
            const mb = gridMutasiBarang.current?.dataSource.map((item: any, index: any) => ({
                // ...item,
                id_opname: index + 1,
                kode_opname: selectedItem?.kode_opname,
                dokumen: 'MB',
                kode_gudang: item.kode_gudang,
                kode_tujuan: item.kode_tujuan,
                kode_item: null,
                qty: item.qty,
                kode_ref: null,
                no_ref: null,
            }));
            // } else {
            //   mb = [];
            // }

            // if (gridStokBarang.current.dataSource.length > 0) {
            const ps = gridStokBarang.current?.dataSource.map((item: any, index: any) => ({
                // ...item,
                id_opname: index + 1,
                kode_opname: selectedItem?.kode_opname,
                dokumen: 'PS',
                kode_gudang: item.kode_gudang,
                kode_tujuan: null,
                kode_item: null,
                qty: item.qty,
                kode_ref: null,
                alasanMin: item.alasanMin ? item.alasanMin : null,
                alasanPlus: item.alasanPlus,
                keterangan: item.keterangan,
                no_ref: null,
            }));
            // } else {
            //   ps = [];
            // }

            const body = {
                entitas: entitas_zip,
                tgl_generate: moment(tanggal).format('YYYY-MM-DD'),
                tgl_opname: moment(selectedItem?.tgl_opname, 'dddd, DD-MM-YYYY').format('YYYY-MM-DD'),
                kode_item: selectedItem?.kode_item,
                jenis: selectedItem?.jenis,
                hasil: hasilTimbang.length > 0 ? 'Y' : 'N',
                jml_berat: selectedItem?.jml_berat,
                jml_qty: selectedItem?.jml_qty,
                jml_utuh: selectedItem?.jml_utuh,
                jml_patah: selectedItem?.jml_patah,
                jml_rusak: selectedItem?.jml_rusak,
                jml_panjang: selectedItem?.jml_panjang,
                tgl_sistem: selectedItem?.tgl_sistem === null && selectedItem?.applevel === '1' ? tglSistem : selectedItem?.tgl_sistem,
                // jml_sistem: 0,
                // ket_sistem: null,
                jml_sistem: masterData.jml_sistem,
                ket_sistem: masterData.ket_sistem,
                // jml_ttb: 0,
                // ket_ttb: null,
                jml_ttb: masterData.jml_ttb,
                ket_ttb: masterData.ket_ttb,
                user_app1: selectedItem?.user_app1 === null && selectedItem?.applevel === '0' ? userid.toUpperCase() : selectedItem?.user_app1,
                tgl_app1: selectedItem?.user_app1 === null && selectedItem?.applevel === '0' ? moment().format('YYYY-MM-DD HH:mm:ss') : selectedItem?.tgl_app1,
                user_app2: selectedItem?.user_app2 === null && selectedItem?.applevel === '1' ? userid.toUpperCase() : selectedItem?.user_app2,
                tgl_app2: selectedItem?.tgl_app2 === null && selectedItem?.applevel === '1' ? moment().format('YYYY-MM-DD HH:mm:ss') : selectedItem?.tgl_app2,
                user_app3: selectedItem?.user_app3 === null && selectedItem?.applevel === '2' ? userid.toUpperCase() : selectedItem?.user_app3,
                tgl_app3: selectedItem?.tgl_app3 === null && selectedItem?.applevel === '2' ? moment().format('YYYY-MM-DD HH:mm:ss') : selectedItem?.tgl_app3,
                user_app4: selectedItem?.user_app4 === null && selectedItem?.applevel === '3' ? userid.toUpperCase() : selectedItem?.user_app4,
                tgl_app4: selectedItem?.tgl_app4 === null && selectedItem?.applevel === '3' ? moment().format('YYYY-MM-DD HH:mm:ss') : selectedItem?.tgl_app4,
                applevel: (Number(selectedItem?.applevel) + 1).toString(),
                komplit: selectedItem?.applevel === '3' ? 'Y' : 'N',
                team: teamPl
                    .map((item: any) => item.name)
                    .filter((name: any) => name)
                    .join('\r\n'),
                catatan,
                nota: selectedItem?.nota,
                userid: selectedItem?.userid,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                jam_mulai: moment(jamMulai).format('YYYY-MM-DD HH:mm:ss'),
                jam_selesai: moment(jamSelesai).format('YYYY-MM-DD HH:mm:ss'),
                jenis_mb: selectedItem?.jenis_mb,
                jenis_ps: selectedItem?.jenis_ps,
                jenis_sesuai: selectedItem?.jenis_sesuai,
                alasan_koreksi: dataKoreksi,
                temp_status: selectedItem?.applevel,
                kode_opname: selectedItem?.kode_opname,
                detail,
                mb: !mb ? [] : mb,
                ps: !ps ? [] : ps,
            };

            console.log('body: ', body);
            // handleUpload();

            try {
                // console.log('body: ', body);
                const res = await approveOpnameData({ body, token });
                if (res.status) {
                    handleUpload();
                    setShowDlgKoreksi(false);
                    setTimeout(() => {
                        onClose();
                        onRefresh();
                    }, 1000);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const buttonHasilOpname: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: statusPage === 'APPROVAL' ? 'Approval' : 'Simpan',
                cssClass: 'e-primary e-small',
                disabled: (selectedItem?.applevel !== '0' && selectedItem?.applevel !== '9' && statusPage !== 'APPROVAL') || statusPage === 'PREVIEW',
            },
            isFlat: false,
            click: () => {
                if (statusPage === 'APPROVAL') {
                    handleApproval();
                } else {
                    // alert('BUKAN APPROVAL');
                    simpanOpname();
                }
                // console.log(statusPage);
            },
        },
        ...(statusPage === 'APPROVAL'
            ? [
                  {
                      buttonModel: {
                          content: 'Koreksi',
                          cssClass: 'e-primary e-small',
                      },
                      isFlat: false,
                      click: handleKoreksi,
                  },
              ]
            : []),
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: onClose,
        },
    ];

    let title;
    if (statusPage === 'APPROVAL') {
        if (selectedItem?.applevel === '0') {
            title = 'APPROVAL CABANG #1 - Data Stok Opname';
        }
        if (selectedItem?.applevel === '1') {
            title = 'APPROVAL PUSAT #2 - Data Stok Opname';
        }
    } else if (statusPage === 'PREVIEW') {
        title = 'PREVIEW - Data Stok Opname';
    } else {
        title = 'Data Stok Opname';
    }

    return (
        <DialogComponent
            id="dialogHasilOpname"
            target="#main-target"
            header="Hasil Stok Opname"
            isModal
            allowDragging
            showCloseIcon
            close={onClose}
            visible={isOpen}
            enableResize
            width={'90%'}
            height={'75%'}
            buttons={buttonHasilOpname}
        >
            <div className="p-2">
                {/* === |Header| === */}
                <div className="flex items-start justify-between gap-7">
                    {/* === TITLE - Data Stok Opname === */}
                    <div className="flex flex-col text-black">
                        <span className="text-lg font-bold text-red-700 underline">{title}</span>
                        {/* === Tgl. Batas Waktu === */}
                        <div className="flex items-center text-xs">
                            <span className="min-w-28 text-right">Tgl. Batas Waktu :</span>
                            <span className="pl-2 font-bold">{moment(masterData?.tgl_opname).format('dddd, DD-MM-YYYY')}</span>
                        </div>
                        {/* === Klasifikasi === */}
                        <div className="flex items-center text-xs">
                            <span className="min-w-28 text-right">Klasifikasi :</span>
                            <span className="pl-2 font-bold">{masterData?.klasifikasi}</span>
                        </div>
                        {/* === Nama Barang === */}
                        <div className="flex items-center text-xs">
                            <span className="min-w-28 text-right">Nama Barang :</span>
                            <span className="pl-2 font-bold">
                                {masterData?.no_item} - {masterData?.nama_item}
                            </span>
                        </div>
                        {/* === Jenis Opname === */}
                        <div className="flex items-center text-xs">
                            <span className="min-w-28 text-right">Jenis Opname :</span>
                            <div className="flex items-center gap-3 pl-2">
                                {jenisOpnameList.map((item: any) => (
                                    <div key={item.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${item.value}-1`}
                                            className="cursor-pointer bg-black !text-black disabled:cursor-not-allowed"
                                            checked={checklistJenis.includes(item.value)}
                                            onChange={(e: any) => handleJenisCheckbox(item.value, e.target.checked)}
                                            disabled={!(Number(selectedItem?.applevel) === 0 || (Number(selectedItem?.applevel) === 1 && statusPage === 'APPROVAL'))}
                                            // onChange={(e) => handleJenisCheckbox(item.value, e.target.checked, setFilterData)}
                                        />
                                        <label htmlFor={`${item.value}-1`} className="m-0 cursor-pointer pl-1 text-xs text-black">
                                            {item.text.split(') ')[1]}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* === Jenis Transaksi Opname ==== */}
                        <div className="flex items-center text-xs">
                            <span className="min-w-28 text-right">Jenis Transaksi Opname :</span>
                            <div className="flex items-center gap-3 pl-2">
                                {['MB', 'PS'].map((item: any) => (
                                    <div key={item} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${item}`}
                                            className="cursor-pointer bg-black !text-black disabled:cursor-not-allowed"
                                            // disabled={disabledCondition}
                                            readOnly
                                            checked={item === 'PS' ? psData.length !== 0 : mbData.length !== 0}
                                            // onChange={(e) => handleJenisCheckbox(item.value, e.target.checked, setFilterData)}
                                        />
                                        <label htmlFor={`${item}`} className="m-0 cursor-pointer pl-1 text-xs text-black">
                                            {item}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* === Tim Pelaksana === */}
                    <div className="flex gap-2 text-black">
                        <div className="w-52">
                            <span className="font-bold">Tim Pelaksana :</span>
                            <ul className="max-h-20 min-h-10 list-none overflow-y-scroll rounded border border-black bg-white p-1">
                                {teamPl?.map((item: any) => (
                                    <li key={item.id} className={`my-1 cursor-pointer text-xs ${selectedKaryawan === item.name ? 'bg-gray-200' : ''}`} onClick={() => setSelectedKaryawan(item.name)}>
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col">
                                <div className="mt-1 flex gap-1">
                                    <button
                                        disabled={disabledCondition}
                                        onClick={() => setShowDialogKry(true)}
                                        className="flex h-6 w-6 items-center justify-center rounded-sm border border-black bg-gray-200 p-1 text-base hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                    >
                                        +
                                    </button>
                                    <button
                                        disabled={disabledCondition}
                                        className="flex h-6 w-6 items-center justify-center rounded-sm border border-black bg-gray-200 p-1 text-xs hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                        onClick={deleteKry}
                                    >
                                        H
                                    </button>
                                    <button
                                        disabled={disabledCondition}
                                        className="flex h-6 w-6 items-center justify-center rounded-sm border border-black bg-gray-200 p-1 text-xs hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                                        onClick={() => setTeamPl([])}
                                    >
                                        A
                                    </button>
                                </div>
                                {!disabledCondition && (
                                    <div className="mt-1 flex gap-1">
                                        <button className="flex items-center justify-center rounded-sm border border-black bg-gray-200 p-1 text-xs hover:bg-gray-300" onClick={getHasilTimbang}>
                                            Data Hasil Timbang
                                        </button>
                                        <button className="flex items-center justify-center rounded-sm border border-black bg-gray-200 p-1 text-xs hover:bg-gray-300" onClick={deleteOpname}>
                                            Hapus Detail Opname
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-1">
                            {/* === Tanggal === */}
                            <div className="flex items-center">
                                <span className="min-w-16 text-right">Tanggal :</span>
                                <div className="form-input ml-1 mt-1 flex w-36 justify-between">
                                    <DatePickerComponent
                                        locale="id"
                                        style={{ fontSize: '12px' }}
                                        cssClass="e-custom-style"
                                        strictMode
                                        enableMask={true}
                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        value={tanggal.toDate()}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            setTanggal(moment(args.value));
                                        }}
                                        disabled={disabledCondition}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </div>
                            </div>
                            {/* === Jam Mulai === */}
                            <div className="flex items-center">
                                <span className="min-w-16 text-right">Jam Mulai :</span>
                                <div className="form-input ml-1 w-36">
                                    <TimePickerComponent
                                        locale="id"
                                        value={jamMulai.toDate()}
                                        format={'HH:mm'}
                                        change={(args: ChangeEventArgsCalendar) => setJamMulai(moment(args.value))}
                                        step={60}
                                        strictMode
                                        showClearButton={false}
                                        disabled={disabledCondition}
                                    />
                                </div>
                            </div>
                            {/* === Jam Selesai === */}
                            <div className="flex items-center">
                                <span className="min-w-16 text-right">Jam Selesai :</span>
                                <div className="form-input ml-1 w-36">
                                    <TimePickerComponent
                                        locale="id"
                                        value={jamSelesai.toDate()}
                                        strictMode
                                        format={'HH:mm'}
                                        change={(args: ChangeEventArgsCalendar) => setJamSelesai(moment(args.value))}
                                        step={60}
                                        showClearButton={false}
                                        disabled={disabledCondition}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* === Nama Item & Generate Date === */}
                    <div className="flex flex-col text-right">
                        <span className="text-base font-bold text-black underline">Generate Data : {moment(masterData?.tgl_generate).format('dddd, DD-MM-YYYY')}</span>
                        <span className="text-xl font-bold text-red-700 underline">
                            {masterData?.no_item} - {masterData?.nama_item}
                        </span>
                    </div>
                </div>
                {/* === |Grid & Alasan Koreksi| === */}
                <div className="mt-2 flex gap-2">
                    {/* Grid */}
                    <div className="flex flex-col overflow-auto">
                        <Tab.Group defaultIndex={0}>
                            <Tab.List className="flex gap-2">
                                {['Pelaksanaan Opname', 'File Pendukung'].map((item) => (
                                    <Tab as={Fragment} key={item}>
                                        {({ selected }) => (
                                            <button
                                                onClick={() => setActiveTab(item)}
                                                className={`${
                                                    selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                            >
                                                {item}
                                            </button>
                                        )}
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels>
                                {activeTab === 'Pelaksanaan Opname' && (
                                    <>
                                        <GridComponent ref={gridRef} locale="id" autoFit dataSource={hasilTimbang} gridLines="Both" height={150}>
                                            <ColumnsDirective>
                                                <ColumnDirective field="id_opname" headerText="No" headerTextAlign="Center" width={40} />
                                                <ColumnDirective field="nama_gudang" headerText="Gudang" headerTextAlign="Center" width={170} />
                                                <ColumnDirective
                                                    field="berat"
                                                    format={'N'}
                                                    headerTemplate={TemplateHeaderBerat}
                                                    headerText="Hasil Timbang (Kg)"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    width={80}
                                                    visible={!hideGrid}
                                                />
                                                <ColumnDirective
                                                    field="tombol1"
                                                    headerText="Foto Timbangan"
                                                    headerTextAlign="Center"
                                                    width={100}
                                                    visible={!hideGrid}
                                                    template={(args: any) => TemplateTombol(args, setHasilTimbang, setPreviewImg, setShowPreviewImg, gridRef)}
                                                />
                                                <ColumnDirective
                                                    headerText="Hasil Fisik Opname"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    columns={[
                                                        { field: 'qty', format: 'N', headerText: 'Kuantitas', headerTextAlign: 'Center', textAlign: 'Right', width: 60 },
                                                        {
                                                            field: 'panjang',
                                                            format: 'N',
                                                            headerTemplate: TemplateHeaderPanjang,
                                                            headerText: 'Total Panjang Barang yang Patah',
                                                            headerTextAlign: 'Center',
                                                            textAlign: 'Right',
                                                            width: 130,
                                                            visible: !hideGrid,
                                                        },
                                                        { field: 'kondisi', headerText: 'Kondisi Barang', headerTextAlign: 'Center', width: 90 },
                                                    ]}
                                                />
                                                <ColumnDirective field="keterangan" headerText="Keterangan" headerTextAlign="Center" width={200} clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective field="tgl_sistem" headerText="Tanggal dan Jam Timbang" headerTextAlign="Center" width={140} clipMode="EllipsisWithTooltip" />
                                            </ColumnsDirective>
                                        </GridComponent>
                                    </>
                                )}
                                {activeTab === 'File Pendukung' && (
                                    <div className="mt-2">
                                        <span className="text-xs font-bold">Daftar file dokumen pendukung stok opname :</span>
                                        <Tab.Group defaultIndex={0}>
                                            <div className="flex flex-col overflow-y-hidden">
                                                <Tab.List className={'flex gap-2'}>
                                                    {tabFilePendukung.map((item: any) => (
                                                        <Tab as={Fragment} key={item.key}>
                                                            {({ selected }) => (
                                                                <button
                                                                    onClick={() => setActiveSubTab(item.key)}
                                                                    className={`${
                                                                        selected
                                                                            ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black'
                                                                            : 'text-gray-400'
                                                                    } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                                >
                                                                    {item.text}
                                                                </button>
                                                            )}
                                                        </Tab>
                                                    ))}
                                                    {approved && (
                                                        <Tab as={Fragment}>
                                                            {({ selected }) => (
                                                                <button
                                                                    onClick={() => setActiveSubTab('kartu-stok-sistem')}
                                                                    className={`${
                                                                        selected
                                                                            ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black'
                                                                            : 'text-gray-400'
                                                                    } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                                >
                                                                    Kartu Stok Sistem
                                                                </button>
                                                            )}
                                                        </Tab>
                                                    )}
                                                </Tab.List>
                                                <Tab.Panels>
                                                    {activeSubTab === 'kartu-stok-gudang' && (
                                                        <div className="flex items-start gap-2">
                                                            {/* Table File */}
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>No.</th>
                                                                        <th>Nama File</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dataKsg?.map((item: any, index: number) => (
                                                                        <tr key={item.id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => handlePreviewImg(item.preview, item.type)}>
                                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                                                    </button>
                                                                                    <button
                                                                                        className={`${statusPage === 'UPDATE' ? 'block' : 'hidden'}`}
                                                                                        onClick={() => handleDelete(item.id, activeSubTab)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                                                                    </button>
                                                                                    <button onClick={() => downloadFile(item.preview, item.name)}>
                                                                                        <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="hidden">
                                                                <UploaderComponent
                                                                    id="fileksg"
                                                                    type="file"
                                                                    ref={uploaderRefKsg}
                                                                    multiple={false}
                                                                    selected={(e) => handleFileSelect(e, 'kartu-stok-gudang')}
                                                                    removing={() => {}}
                                                                />
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col gap-1">
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    htmlFor="fileksg"
                                                                >
                                                                    Ambil File
                                                                </label>
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    onClick={() => handleDeleteAllFiles(activeSubTab)}
                                                                >
                                                                    Hapus Semua File
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeSubTab === 'foto-barang' && (
                                                        <div className="flex items-start gap-2">
                                                            {/* Table File */}
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>No.</th>
                                                                        <th>Nama File</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dataFb?.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.id}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => handlePreviewImg(item.preview, item.type)}>
                                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                                                    </button>
                                                                                    <button
                                                                                        className={`${statusPage === 'UPDATE' ? 'block' : 'hidden'}`}
                                                                                        onClick={() => handleDelete(item.id, activeSubTab)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                                                                    </button>
                                                                                    <button onClick={() => downloadFile(item.preview, item.name)}>
                                                                                        <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="hidden">
                                                                <UploaderComponent
                                                                    id="filefb"
                                                                    type="file"
                                                                    ref={uploaderRefFb}
                                                                    multiple={false}
                                                                    selected={(e) => handleFileSelect(e, 'foto-barang')}
                                                                    removing={() => {}}
                                                                />
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col gap-1">
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    htmlFor="filefb"
                                                                >
                                                                    Ambil File
                                                                </label>
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    onClick={() => handleDeleteAllFiles(activeSubTab)}
                                                                >
                                                                    Hapus Semua File
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeSubTab === 'vidio-barang' && (
                                                        <div className="flex items-start gap-2">
                                                            {/* Table File */}
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>No.</th>
                                                                        <th>Nama File</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dataVb?.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.id}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => handlePreviewImg(item.preview, item.type)}>
                                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                                                    </button>
                                                                                    <button
                                                                                        className={`${statusPage === 'UPDATE' ? 'block' : 'hidden'}`}
                                                                                        onClick={() => handleDelete(item.id, activeSubTab)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                                                                    </button>
                                                                                    <button onClick={() => downloadFile(item.preview, item.name)}>
                                                                                        <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="hidden">
                                                                <UploaderComponent
                                                                    id="filevb"
                                                                    type="file"
                                                                    ref={uploaderRefVb}
                                                                    multiple={false}
                                                                    selected={(e) => handleFileSelect(e, 'vidio-barang')}
                                                                    removing={() => {}}
                                                                />
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col gap-1">
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    htmlFor="filevb"
                                                                >
                                                                    Ambil File
                                                                </label>
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    onClick={() => handleDeleteAllFiles(activeSubTab)}
                                                                >
                                                                    Hapus Semua File
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeSubTab === 'form-ttb' && (
                                                        <div className="flex items-start gap-2">
                                                            {/* Table File */}
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>No.</th>
                                                                        <th>Nama File</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dataForm?.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.id}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => handlePreviewImg(item.preview, item.type)}>
                                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                                                    </button>
                                                                                    <button
                                                                                        className={`${statusPage === 'UPDATE' ? 'block' : 'hidden'}`}
                                                                                        onClick={() => handleDelete(item.id, activeSubTab)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                                                                    </button>
                                                                                    <button onClick={() => downloadFile(item.preview, item.name)}>
                                                                                        <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="hidden">
                                                                <UploaderComponent
                                                                    id="fileform"
                                                                    type="file"
                                                                    ref={uploaderRefForm}
                                                                    multiple={false}
                                                                    selected={(e) => handleFileSelect(e, 'form-ttb')}
                                                                    removing={() => {}}
                                                                />
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col gap-1">
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    htmlFor="fileform"
                                                                >
                                                                    Ambil File
                                                                </label>
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'UPDATE' ? 'block' : 'hidden'
                                                                    }`}
                                                                    onClick={() => handleDeleteAllFiles(activeSubTab)}
                                                                >
                                                                    Hapus Semua File
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeSubTab === 'kartu-stok-sistem' && approved ? (
                                                        <div className="flex items-start gap-2">
                                                            {/* Table File */}
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>No.</th>
                                                                        <th>Nama File</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dataKss?.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.id}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => handlePreviewImg(item.preview, item.type)}>
                                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} width="15" height="15" />
                                                                                    </button>
                                                                                    <button
                                                                                        className={`${statusPage === 'UPDATE' ? 'block' : 'hidden'}`}
                                                                                        onClick={() => handleDelete(item.id, activeSubTab)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} width="15" height="15" />
                                                                                    </button>
                                                                                    <button onClick={() => downloadFile(item.preview, item.name)}>
                                                                                        <FontAwesomeIcon icon={faDownload} width="15" height="15" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="hidden">
                                                                <UploaderComponent
                                                                    id="fileform"
                                                                    type="file"
                                                                    ref={uploaderRefKss}
                                                                    multiple={false}
                                                                    selected={(e) => handleFileSelect(e, 'kartu-stok-sistem')}
                                                                    removing={() => {}}
                                                                />
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex flex-col gap-1">
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'APPROVAL' && selectedItem?.applevel >= '1' && selectedItem?.applevel <= '2' ? 'block' : 'hidden'
                                                                    }`}
                                                                    htmlFor="fileform"
                                                                >
                                                                    Ambil File
                                                                </label>
                                                                <label
                                                                    className={`w-24 rounded border border-black bg-gray-200 px-2 py-1 text-center text-black ${
                                                                        statusPage === 'APPROVAL' && selectedItem?.applevel >= '1' ? 'block' : 'hidden'
                                                                    }`}
                                                                    onClick={() => handleDeleteAllFiles(activeSubTab)}
                                                                >
                                                                    Hapus Semua File
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </Tab.Panels>
                                            </div>
                                        </Tab.Group>
                                    </div>
                                )}
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                    {/* Alasan Koreksi */}
                    {activeTab === 'Pelaksanaan Opname' && (
                        <div className="mt-4 flex flex-col text-black">
                            <span className="font-bold">Alasan Koreksi :</span>
                            <textarea className="rounded border border-black" value={masterData.alasan_koreksi} rows={8} cols={50} readOnly />
                        </div>
                    )}
                </div>
                {activeTab === 'Pelaksanaan Opname' && (
                    <>
                        {/* === |Catatan| === */}
                        <div className="mt-2 flex flex-col text-black">
                            <span className="font-bold">Catatan :</span>
                            <textarea className="w-full rounded border border-black" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                        </div>
                    </>
                )}
                {activeTab === 'Pelaksanaan Opname' && disabledCondition && (
                    <>
                        {/* === |Summary - IF Approved| === */}
                        <div className="mt-2 flex gap-5">
                            {/* === Summary === */}
                            <div className="flex w-[30%] flex-col">
                                {/* === Title & Berat === */}
                                <div className="flex w-full items-end justify-between">
                                    <span className="text-lg font-bold text-red-700 underline">Summary</span>
                                    <span className="font-bold text-black underline">Berat 0.1</span>
                                </div>
                                {/* === List Item === */}
                                <div className="mt-2 flex flex-col space-y-0.5 text-black">
                                    <div className={`flex ${hideGrid ? 'hidden' : ''}`}>
                                        <span className="min-w-[157px] text-right text-xs font-bold">Total Hasil Timbangan</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" value={masterData.jml_berat} readOnly />
                                        <input className="ml-3 w-24 border border-black text-right" type="text" value={masterData.berat_item} readOnly />
                                    </div>
                                    <div className={`flex ${hideGrid ? 'hidden' : ''}`}>
                                        <span className="min-w-[157px] text-right text-xs font-bold">Timbangan Seharusnya</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.timbangan_harus} />
                                    </div>
                                    <div className={`flex ${hideGrid ? 'hidden' : ''}`}>
                                        <span className="min-w-[157px] text-right text-xs font-bold">Selisih Timbangan</span>
                                        <input
                                            className="ml-1 w-48 border border-black text-right"
                                            type="text"
                                            readOnly
                                            value={
                                                masterData.klasifikasi === 'BESI'
                                                    ? Number(masterData.timbangan_selisih).toFixed(2) // dua digit di belakang koma
                                                    : masterData.timbangan_selisih // tampilkan apa adanya
                                            }
                                        />
                                    </div>
                                    <div className={`flex ${hideGrid ? 'hidden' : ''}`}>
                                        <span className="min-w-[157px] text-right text-xs font-bold">Selisih Qty dari Timbangan</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.timbangan_qty} />
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Total Utuh</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.jml_utuh} />
                                        <input className={`ml-3 w-24 border border-black text-right ${!hideGrid ? 'hidden' : ''}`} type="text" value={masterData.berat_item} readOnly />
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Total Qty Patah/Rusak</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.jml_patah} />
                                        {/* <input
                                            className="ml-1 w-12 border border-black text-right"
                                            type="text"
                                            readOnly
                                            value={
                                                masterData.klasifikasi === 'BESI'
                                                    ? Number(masterData.jml_rusak).toFixed(2) // dua digit di belakang koma
                                                    : masterData.jml_rusak // tampilkan apa adanya
                                            }
                                        />
                                        <input
                                            className="ml-1 w-12 border border-black text-right"
                                            type="text"
                                            readOnly
                                            value={
                                                masterData.klasifikasi === 'BESI'
                                                    ? Number(masterData.patah_rusak).toFixed(2) // dua digit di belakang koma
                                                    : masterData.patah_rusak // tampilkan apa adanya
                                            }
                                        /> */}
                                        <input
                                            className="ml-1 w-12 border border-black text-right"
                                            type="text"
                                            readOnly
                                            value={
                                                masterData.klasifikasi === 'BESI'
                                                    ? Number(masterData.edTotal9).toFixed(2) // dua digit di belakang koma
                                                    : masterData.edTotal9 // tampilkan apa adanya
                                            }
                                        />
                                        <input
                                            className="ml-1 w-12 border border-black text-right"
                                            type="text"
                                            readOnly
                                            value={
                                                masterData.klasifikasi === 'BESI'
                                                    ? Number(masterData.edTotal10).toFixed(2) // dua digit di belakang koma
                                                    : masterData.edTotal10 // tampilkan apa adanya
                                            }
                                        />
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Qty Sistem GU</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.jml_sistem} />
                                        <div className={`flex ${Number(selectedItem?.applevel) === 1 && statusPage === 'APPROVAL' ? '' : 'hidden'}`}>
                                            <button className="ml-1 rounded border border-gray-400 bg-gray-300 px-2 text-sm hover:bg-gray-400" onClick={() => getHasilStokOpname('GU')}>
                                                Σ
                                            </button>
                                            <button className="ml-1 rounded border border-gray-400 bg-gray-300 px-2 text-sm hover:bg-gray-400" onClick={() => setShowDialogQtySistem(true)}>
                                                <FontAwesomeIcon icon={faFile} width={15} height={15} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Keterangan Perubahan GU</span>
                                        <input className="ml-1 w-full border border-black text-right" type="text" readOnly value={masterData.ket_sistem} />
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Qty Sistem TTB</span>
                                        <input className="ml-1 w-48 border border-black text-right" type="text" readOnly value={masterData.jml_ttb} />
                                        <div className={`flex ${Number(selectedItem?.applevel) === 1 && statusPage === 'APPROVAL' ? '' : 'hidden'}`}>
                                            <button className="ml-1 rounded border border-gray-400 bg-gray-300 px-2 text-sm hover:bg-gray-400" onClick={() => getHasilStokOpname('TTB')}>
                                                Σ
                                            </button>
                                            <button className="ml-1 rounded border border-gray-400 bg-gray-300 px-2 text-sm hover:bg-gray-400" onClick={() => setShowDialogQtyTtb(true)}>
                                                <FontAwesomeIcon icon={faFile} width={15} height={15} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <span className="min-w-[157px] text-right text-xs font-bold">Keterangan Perubahan TTB</span>
                                        <input className="ml-1 w-full border border-black text-right" type="text" readOnly value={masterData.ket_ttb} />
                                    </div>
                                </div>
                            </div>
                            {/* === Grid Mutasi Barang & Penyesuaian Stok === */}
                            <div className={`flex flex-col gap-5 text-black ${Number(selectedItem?.applevel) >= 1 ? '' : 'hidden'}`}>
                                {/* === Grid Mutasi Barang === */}
                                <div className="flex flex-col">
                                    {/* === Title & Date === */}
                                    <div className="flex items-center gap-10">
                                        <span className="font-bold">Mutasi Barang :</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Tanggal Proses / Transaksi :</span>
                                            <input type="date" name="" id="" value={tglSistem} onChange={(e: any) => setTglSistem(e.target.value)} />
                                        </div>
                                    </div>
                                    {/* === Grid === */}
                                    <GridComponent
                                        autoFit
                                        locale="id"
                                        id="gridMutasiBarang"
                                        name="gridMutasiBarang"
                                        ref={gridMutasiBarang}
                                        dataSource={mbData}
                                        gridLines="Both"
                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                        // editSettings={
                                        //     selectedAppLevel?.applevel === 3
                                        //         ? { allowAdding: false, allowEditing: false, allowDeleting: false, newRowPosition: 'Bottom' }
                                        //         : { allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }
                                        // }
                                        {...(selectedAppLevel?.applevel === '2' && {
                                            editSettings: {
                                                allowAdding: true,
                                                allowEditing: true,
                                                allowDeleting: true,
                                                newRowPosition: 'Bottom',
                                            },
                                        })}
                                        rowSelected={(args: any) => setSelectedRowIdx(args.rowIndex)}
                                        actionComplete={handleActionCompleteMutasiBarang}
                                        height={80}
                                        // created={selectedItem?.applevel <= '2' ? addDefaultRowMutasi : undefined}
                                    >
                                        <ColumnsDirective>
                                            <ColumnDirective
                                                field="nama_asal"
                                                headerText="Gudang Asal"
                                                headerTextAlign="Center"
                                                width={150}
                                                editTemplate={(args: any) => TemplateGudangAsal(args, { setShowDialgGd, setGdField })}
                                            />
                                            <ColumnDirective
                                                field="nama_tujuan"
                                                headerText="Gudang Tujuan"
                                                headerTextAlign="Center"
                                                width={150}
                                                editTemplate={(args: any) => TemplateGudangTujuan(args, { setShowDialgGd, setGdField })}
                                            />
                                            <ColumnDirective field="qty" headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width={80} />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                    </GridComponent>
                                    <div className={`panel-pager !p-0 ${Number(selectedItem?.applevel) === 1 && statusPage === 'APPROVAL' ? '' : 'hidden'}`}>
                                        <div className="mt-1 flex">
                                            <ButtonComponent
                                                id="buAddMutasi"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-plus"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                onClick={() => handleAddMutasi()}
                                            />
                                            <ButtonComponent
                                                id="buDeleteMutasi"
                                                // content="Hapus"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-warning e-small"
                                                iconCss="e-icons e-small e-trash"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                onClick={() => {
                                                    handleDeleteMutasi();
                                                }}
                                            />
                                            <ButtonComponent
                                                id="buDeleteAllMutasi"
                                                // content="Bersihkan"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-danger e-small"
                                                iconCss="e-icons e-small e-erase"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                onClick={() => {
                                                    handleDeleteAllMutasi();
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* === Grid Penyesuaian Stok === */}
                                <div className="flex flex-col">
                                    {/* === Title & Date === */}
                                    <div className="flex items-center gap-10">
                                        <span className="font-bold">Penyesuaian Stok :</span>
                                        {/* <div className="flex items-center gap-2">
                  <span className="font-bold">Tanggal Proses / Transaksi :</span>
                  <input type="date" readOnly name="" id="" />
                </div> */}
                                    </div>
                                    {/* === Grid === */}

                                    <GridComponent
                                        autoFit
                                        locale="id"
                                        ref={gridStokBarang}
                                        dataSource={psData}
                                        gridLines="Both"
                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                        // editSettings={
                                        //     selectedAppLevel?.applevel === 3
                                        //         ? { allowAdding: false, allowEditing: false, allowDeleting: false, newRowPosition: 'Bottom' }
                                        //         : { allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }
                                        // }
                                        {...(selectedAppLevel?.applevel === '2' && {
                                            editSettings: {
                                                allowAdding: true,
                                                allowEditing: true,
                                                allowDeleting: true,
                                                newRowPosition: 'Bottom',
                                            },
                                        })}
                                        rowSelected={(args: any) => setSelectedRowIdx2(args.rowIndex)}
                                        actionComplete={handleActionCompleteStokBarang}
                                        height={80}
                                        // created={selectedItem?.applevel <= '2' ? addDefaultRowStok : undefined}
                                    >
                                        <ColumnsDirective>
                                            <ColumnDirective
                                                field="nama_gudang"
                                                headerText="Gudang"
                                                headerTextAlign="Center"
                                                width={150}
                                                editTemplate={(args: any) => TemplateGudangStok(args, { setShowDialgGd, setGdField })}
                                            />
                                            <ColumnDirective field="qty" headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width={80} />
                                            <ColumnDirective
                                                field="alasanMin"
                                                headerText="Alasan PS (-)"
                                                headerTextAlign="Center"
                                                width={100}
                                                clipMode="EllipsisWithTooltip"
                                                editTemplate={(args: any) => {
                                                    const props = {
                                                        dataSource: AlasanMinusList,
                                                        onChange: handleChangePsMinus,
                                                    };
                                                    return EditTemplatePsMinus(args, props);
                                                }}
                                            />
                                            <ColumnDirective
                                                field="alasanPlus"
                                                headerText="Alasan PS (+)"
                                                headerTextAlign="Center"
                                                width={100}
                                                clipMode="EllipsisWithTooltip"
                                                editTemplate={(args: any) => {
                                                    const props = {
                                                        dataSource: AlasanPlusList,
                                                        onChange: handleChangePsPlus,
                                                    };
                                                    return EditTemplatePsPlus(args, props);
                                                }}
                                            />
                                            <ColumnDirective clipMode="EllipsisWithTooltip" field="keterangan" headerText="Keterangan Tambahan" headerTextAlign="Center" width={200} />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                    </GridComponent>

                                    <div className={`panel-pager !p-0 ${Number(selectedItem?.applevel) === 1 && statusPage === 'APPROVAL' ? '' : 'hidden'}`}>
                                        <div className="mb-3 mt-1 flex">
                                            <ButtonComponent
                                                id="buAddStok"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-plus"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                onClick={() => handleAddStok()}
                                            />
                                            <ButtonComponent
                                                id="buDeleteStok"
                                                // content="Hapus"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-warning e-small"
                                                iconCss="e-icons e-small e-trash"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                onClick={() => {
                                                    handleDeleteStok();
                                                }}
                                            />
                                            <ButtonComponent
                                                id="buDeleteAllStok"
                                                // content="Bersihkan"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-danger e-small"
                                                iconCss="e-icons e-small e-erase"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                onClick={() => {
                                                    handleDeleteAllStok();
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Dialog Karyawan */}
            {showDialogKry && <DialogKaryawan isOpen={showDialogKry} onClose={() => setShowDialogKry(false)} kode_entitas={kode_entitas} token={token} setTeamPl={setTeamPl} />}

            {/* Dialog Gudang */}
            {showDialogGd && (
                <DialogGdUtama
                    isOpen={showDialogGd}
                    onClose={() => setShowDialgGd(false)}
                    tipe={gdField}
                    gridRefMutasi={gridMutasiBarang}
                    gridRefStok={gridStokBarang}
                    selectedRowIdx={selectedRowIdx}
                    selectedRowIdx2={selectedRowIdx2}
                    kode_entitas={entitas_zip}
                    token={token}
                />
            )}

            {/* Dialog Qty Sistem */}
            {showDialogQtySistem && <DialogQtySistem isOpen={showDialogQtySistem} onClose={() => setShowDialogQtySistem(false)} data={masterData} setMasterData={setMasterData} />}

            {/* Dialog Qty Ttb */}
            {showDialogQtyTtb && <DialogQtyTtb isOpen={showDialogQtyTtb} onClose={() => setShowDialogQtyTtb(false)} data={masterData} setMasterData={setMasterData} />}

            {/* Dialog Koreksi */}
            {showDlgKoreksi && (
                <DialogComponent
                    id="dialogAlasanKoreksi"
                    target="#dialogHasilOpname"
                    header="Form Keterangan Koreksi"
                    isModal
                    allowDragging
                    showCloseIcon
                    width="30%"
                    close={() => setShowDlgKoreksi(false)}
                    visible={isOpen}
                >
                    <div className="flex flex-col p-2 text-black">
                        <span className="text-sm font-bold">Keterangan Koreksi Hasil Stok Opname</span>
                        <textarea className="h-full w-full rounded border border-black p-2" rows={15} value={alasanKoreksi} onChange={(e) => setAlasanKoreksi(e.target.value)} />
                        <div className="mt-2 flex justify-end gap-2">
                            <button className="rounded border border-gray-300 bg-black/90 px-4 py-2 text-white hover:bg-black" onClick={handleKoreksiSubmit}>
                                Ok
                            </button>
                            <button className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100" onClick={() => setShowDlgKoreksi(false)}>
                                Batal
                            </button>
                        </div>
                    </div>
                </DialogComponent>
            )}

            {/* Preview Image */}
            {showPreviewImg && (
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
                        {previewType === 'mp4' ? (
                            <video width="640" height="360" controls>
                                <source src={previewImg} type="video/mp4" />
                                Browser kamu tidak mendukung tag video.
                            </video>
                        ) : (
                            <img
                                src={previewImg}
                                alt="previewImg"
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px) rotate(${rotationAngle}deg)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={(e) => handleMouseDown(e, setIsDragging, setOffset, position)}
                                onMouseUp={handleMouseUp}
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
                            <span className="e-icons e-undo" style={{ fontSize: '32px' }} onClick={() => handleRotateLeft(setRotationAngle, rotationAngle)}></span>
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
                            <span className="e-icons e-redo" style={{ fontSize: '32px' }} onClick={() => handleRotateRight(setRotationAngle, rotationAngle)}></span>
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
                                    setShowPreviewImg(false);
                                    setPreviewImg('');
                                }}
                            ></span>
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
        </DialogComponent>
    );
};

export default DialogHasilOpname;
