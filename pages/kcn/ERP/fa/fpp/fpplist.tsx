import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';

import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ContextMenuComponent, MenuEventArgs, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { FocusInEventArgs, TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Draggable from 'react-draggable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCamera, faFolder, faStop, faTimes } from '@fortawesome/free-solid-svg-icons';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';

// import styles from './historyJurnal.module.css';
import moment from 'moment';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { Tab } from '@headlessui/react';
import DialogFrmFpp from './components/DialogFrmFpp';
import axios from 'axios';
import styles from './fpplist.module.css';
import { usersMenu } from '@/utils/routines';
import { useFppHandlerContext } from '@/context/fpp/FppHandlerProvider';
import { resPdf } from '@/pages/kcn/ERP/fa/fpp/utils/resource';
L10n.load(idIDLocalization);
enableRipple(true);

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const swalToast = swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3000,
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

const NotaAsliCheckbox = (args: any) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    const { setTriggerData } = useFppHandlerContext();

    const updatefpp = async () => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: args.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master, detail } = response.data.data;

        const modifiedBody = {
            ...master,
            entitas: kode_entitas,
            tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
            tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
            tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_cek_nota_coret: master.tgl_cek_nota_coret === null ? null : moment(master.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
            tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
            tgl_scan: master.tgl_scan === null ? null : moment(master.tgl_scan).format('YYYY-MM-DD HH:mm:ss'),
            cek_nota_asli: 'Y',
            user_cek_nota_asli: userid.toUpperCase(),
            tgl_cek_nota_asli: moment().format('YYYY-MM-DD HH:mm:ss'),
            detail,
        };
        try {
            const responseApi = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (responseApi.data.status) {
                setTriggerData(true);
            }
        } catch (error) {
            console.error('Error:', error);
            swal.fire({
                icon: 'error',
                title: 'Gagal Update Data Realisasi Nota Asli!',
                timer: 3000,
                showConfirmButton: false,
                target: '#main-target',
            });
        }
    };

    return (
        <input
            type="checkbox"
            checked={args.cek_nota_asli === 'Y' ? true : false}
            onChange={(event) => {
                if (args.cek_nota_asli === 'Y') {
                    swal.fire({
                        title: 'Data sudah divalidasi.',
                        timer: 2000,
                        showConfirmButton: false,
                        target: '#main-target',
                    });
                } else {
                    updatefpp();
                }
            }}
        />
    );
};

const NotaCoretCheckbox = (args: any) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    const { setTriggerData } = useFppHandlerContext();

    const updatefpp = async () => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: args.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master, detail } = response.data.data;

        const modifiedBody = {
            ...master,
            entitas: kode_entitas,
            tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
            tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
            tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
            tgl_cek_nota_asli: master.tgl_cek_nota_asli === null ? null : moment(master.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
            tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
            tgl_scan: master.tgl_scan === null ? null : moment(master.tgl_scan).format('YYYY-MM-DD HH:mm:ss'),
            cek_nota_coret: 'Y',
            user_cek_nota_coret: userid.toUpperCase(),
            tgl_cek_nota_coret: moment().format('YYYY-MM-DD HH:mm:ss'),
            detail,
        };
        try {
            const responseApi = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (responseApi.data.status) {
                setTriggerData(true);
            }
        } catch (error) {
            console.error('Error:', error);
            swal.fire({
                icon: 'error',
                title: 'Gagal Update Data Realisasi Nota Asli!',
                timer: 3000,
                showConfirmButton: false,
                target: '#main-target',
            });
        }
    };

    return (
        <input
            type="checkbox"
            checked={args.cek_nota_coret === 'Y' ? true : false}
            onChange={(event) => {
                if (args.cek_nota_coret === 'Y') {
                    swal.fire({
                        title: 'Data sudah divalidasi.',
                        timer: 2000,
                        showConfirmButton: false,
                        target: '#main-target',
                    });
                } else {
                    updatefpp();
                }
            }}
        />
    );
};

const TemplateTombol = (args: any) => {
    const { sessionData, isLoading } = useSession();

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    let uploaderRef1: any = useRef(null);

    const { loadImage, deleteImage, handleFileSelect, setShowDialogUpload, setImageFile, setMasterData } = useFppHandlerContext();
    const alertDelete = () => {
        swal.fire({
            icon: 'question',
            html: `
    <div className="flex flex-col gap-2 !pr-0">
    <strong class="text-lg mb-4">Hapus dokumen pendukung?</strong>
      <p>No. FPP : ${args.no_fpp}</p>
      <p>Tanggal : ${args.tgl_fpp}</p>
    </div>
    `,
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            backdrop: true,
            target: '#main-target',
        }).then((res) => {
            if (res.isConfirmed) {
                deleteImage(args, kode_entitas, token, userid);
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
                            borderRadius: '5px',
                            fontSize: '16px',
                        }}
                        value={'✔'}
                    />
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                {args.filegambar !== '' ? (
                    <>
                        <div onClick={alertDelete} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {args.filegambar !== '' ? <FontAwesomeIcon icon={faStop} width="18" height="18" /> : null}
                        </div>
                        <div
                            onClick={() => {
                                loadImage(args, kode_entitas, 'SJ');
                            }}
                            style={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {args.gambar !== '' ? <FontAwesomeIcon icon={faCamera} width="18" height="18" /> : null}
                        </div>
                    </>
                ) : (
                    <>
                        {/* <input type="file" accept="image/*" id="file" hidden /> */}
                        {/* <input id={`${args.kode_fpp}_1`} type="file" accept="image/*" ref={uploaderRef1} onChange={(e) => handleFileSelect(e, args, kode_entitas, token, userid)} className="hidden" /> */}
                        <label
                            onClick={() => {
                                setMasterData(args);
                                setShowDialogUpload(true);
                                setImageFile({
                                    nameImage: '',
                                    nameZip: '',
                                    previewImg: '',
                                });
                            }}
                            style={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {args.filegambar === '' || args.filegambar === null ? <FontAwesomeIcon icon={faFolder} width="18" height="18" /> : null}
                        </label>
                    </>
                )}
            </div>
        </div>
    );
};

const FppList = () => {
    const { sessionData, isLoading } = useSession();

    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    // State Baru Untuk FPP
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const [userApp, setUserApp] = useState('');
    const kode_menu = '60204'; // kode menu FPP

    const templateNotaAsli = (field: string, data: any, column: any) => {
        return data[field] === 'Y' ? '✅' : '⬜';
    };
    const templateNotaCoret = (field: string, data: any, column: any) => {
        return data[field] === 'Y' ? '✅' : '⬜';
    };

    // Styling
    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonApproval = { width: 110 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonPembatalan = { width: 130 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonUpdate = { width: 150 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonDisabled = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#ece7f5' };
    const styleButtonApprovalDisabled = { width: 110 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#ece7f5' };

    // Global State Management
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);
    const [searchNoFpp, setSearchNoFpp] = useState('');
    const [searchKeterangan, setSearchKeterangan] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [statusPage, setStatusPage] = useState('');
    const [showModalFpp, setShowModalFpp] = useState(false);
    const [statusFpp, setstatusFpp] = useState('');
    const [approval, setApproval] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedItems, setSelectedItems] = useState<any>(null);

    // Date State Management
    const [masterDate, setMasterDate] = useState({
        tglAwal: moment(),
        tglAkhir: moment().endOf('month'),
        tglAwalBayar: moment(),
        tglAkhirBayar: moment().endOf('month'),
        tglAwalPembayaran: moment(),
        tglAkhirPembayaran: moment().endOf('month'),
        isTglChecked: true,
        isTglBayarChecked: false,
        isTglPembayaranChecked: false,
    });

    const updateStateDate = (field: any, value: any) => {
        setMasterDate((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const {
        triggerData,
        setTriggerData,
        imageUrl,
        setOpenPreview,
        openPreview,
        isDragging,
        offset,
        zoomScale,
        HandleZoomIn,
        HandleZoomOut,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        position,
        rotationAngle,
        handleRotateRight,
        handleRotateLeft,
        setZoomScale,
        showDialogUpload,
        setShowDialogUpload,
        handleFileSelect2,
        imageFile,
        setImageFile,
        updateStateImg,
        uploaderRef,
        handleUpload2,
        handleWheel,
    } = useFppHandlerContext();

    // Filter State Management
    const [masterFilter, setMasterFilter] = useState({
        noFppValue: '',
        isNoFppChecked: false,
        keteranganValue: '',
        isKeteranganChecked: false,
        pemilikRekeningValue: '',
        isPemilikRekeningChecked: false,
        noRekeningValue: '',
        isNoRekeningChecked: false,
        entitasValue: '',
        isEntitasChecked: false,
        jenisPembayaranValue: '',
        isJenisPembayaranChecked: false,
        cekNotaAsli: 'Semua',
        cekNotaCoret: 'Semua',
        cekRealisasi: 'Semua',
        isPembatalanChecked: false,
    });

    const updateStateFilter = (field: any, value: any) => {
        setMasterFilter((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Refs
    const noFppRef = useRef<HTMLInputElement>(null);
    const keteranganRef = useRef<HTMLInputElement>(null);
    const gridListData = useRef<GridComponent>(null);
    const gridListData2 = useRef<GridComponent>(null);

    // Handle Filter
    //============ Handle Filter ===========
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    // Fetching Data
    const fetchData = async () => {
        // console.log('FETCH DATA TEREKSEKUSI');

        const params: any = {
            entitas: kode_entitas,
            param1: selectedTab,
            param2: masterFilter.isNoFppChecked ? masterFilter.noFppValue : 'all',
            param3: masterDate.isTglChecked ? moment(masterDate.tglAwal).format('YYYY-MM-DD') : 'all',
            param4: masterDate.isTglChecked ? moment(masterDate.tglAkhir).format('YYYY-MM-DD') : 'all',
            param5: masterDate.isTglBayarChecked ? moment(masterDate.tglAwalBayar).format('YYYY-MM-DD') : 'all',
            param6: masterDate.isTglBayarChecked ? moment(masterDate.tglAkhirBayar).format('YYYY-MM-DD') : 'all',
            param7: masterDate.isTglPembayaranChecked ? moment(masterDate.tglAwalPembayaran).format('YYYY-MM-DD') : 'all',
            param8: masterDate.isTglPembayaranChecked ? moment(masterDate.tglAkhirPembayaran).format('YYYY-MM-DD') : 'all',
            param9: masterFilter.isKeteranganChecked ? masterFilter.keteranganValue : 'all',
            param10: masterFilter.isPemilikRekeningChecked ? masterFilter.pemilikRekeningValue : 'all',
            param11: masterFilter.isNoRekeningChecked ? masterFilter.noRekeningValue : 'all',
            param12: masterFilter.isEntitasChecked ? masterFilter.entitasValue : 'all',
            param13:
                masterFilter.isJenisPembayaranChecked && masterFilter.jenisPembayaranValue === 'Transfer dari Rekening PT.'
                    ? 'Transfer PT'
                    : masterFilter.isJenisPembayaranChecked && masterFilter.jenisPembayaranValue !== 'Transfer dari Rekening PT.'
                    ? masterFilter.jenisPembayaranValue
                    : 'all',
            param14: masterFilter.cekNotaAsli === 'Ya' ? 'Y' : masterFilter.cekNotaAsli === 'Tidak' ? 'N' : 'all',
            param15: masterFilter.cekNotaCoret === 'Ya' ? 'Y' : masterFilter.cekNotaCoret === 'Tidak' ? 'N' : 'all',
            param16: masterFilter.cekRealisasi === 'Ya' ? 'Y' : masterFilter.cekRealisasi === 'Tidak' ? 'N' : 'all',
            param17: masterFilter.isPembatalanChecked ? 'Y' : 'N',
        };

        // trycatch disini
        try {
            const response = await axios.get(`${apiUrl}/erp/list_fpp`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const transformedData = response.data.data.map((item: any) => ({
                ...item,
                netto_rp: Number(Number(item.netto_rp).toFixed(2)),
                tgl_fpp: moment(item.tgl_fpp).format('DD-MM-YYYY'),
                tgl_harus_bayar: moment(item.tgl_harus_bayar).format('DD-MM-YYYY'),
                tgl_scan: item.tgl_scan !== null ? moment(item.tgl_scan).format('DD-MM-YYYY') : '',
                tgl_cek_nota_asli: item.tgl_cek_nota_asli !== null ? moment(item.tgl_cek_nota_asli).format('DD-MM-YYYY') : '',
                tgl_cek_nota_coret: item.tgl_cek_nota_coret !== null ? moment(item.tgl_cek_nota_coret).format('DD-MM-YYYY') : '',
            }));

            const modifiedData =
                userid === 'administrator' || entitas_user === '898'
                    ? transformedData // Return all data for administrator
                    : transformedData.filter((item: any) => item.kode_entitas === entitas_user);

            setData(modifiedData);
            gridListData.current?.setProperties({ dataSource: modifiedData });
            gridListData.current?.refresh();

            setTimeout(() => {
                setTriggerData(false);
            }, 500);
        } catch (error) {
            console.log('Error while fetching data: ', error);
        }
    };

    const handleRecordClick = (args: any) => {
        const updateFpp = async () => {
            const response = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
                params: {
                    entitas: kode_entitas,
                    param1: args.rowData.kode_fpp,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { master, detail } = response.data.data;

            let modifiedBody;
            if (args.cellIndex === 14) {
                modifiedBody = {
                    ...master,
                    entitas: kode_entitas,
                    tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_coret: master.tgl_cek_nota_coret === null ? null : moment(master.tgl_cek_nota_coret).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_scan: master.tgl_scan === null ? null : moment(master.tgl_scan).format('YYYY-MM-DD HH:mm:ss'),
                    cek_nota_asli: 'Y',
                    user_cek_nota_asli: userid.toUpperCase(),
                    tgl_cek_nota_asli: moment().format('YYYY-MM-DD HH:mm:ss'),
                    detail,
                };
            } else if (args.cellIndex === 17) {
                modifiedBody = {
                    ...master,
                    entitas: kode_entitas,
                    tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_cek_nota_asli: master.tgl_cek_nota_asli === null ? null : moment(master.tgl_cek_nota_asli).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_scan: master.tgl_scan === null ? null : moment(master.tgl_scan).format('YYYY-MM-DD HH:mm:ss'),
                    cek_nota_coret: 'Y',
                    user_cek_nota_coret: userid.toUpperCase(),
                    tgl_cek_nota_coret: moment().format('YYYY-MM-DD HH:mm:ss'),
                    detail,
                };
            }
            try {
                const responseApi = await axios.patch(`${apiUrl}/erp/update_fpp`, modifiedBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (responseApi.data.status) {
                    // setTriggerData(true);
                    fetchData();
                }
            } catch (error) {
                console.error('Error:', error);
                swal.fire({
                    icon: 'error',
                    title: 'Gagal Update Data Realisasi Nota Asli!',
                    timer: 3000,
                    showConfirmButton: false,
                    target: '#main-target',
                });
            }
        };

        if (args.cellIndex === 14 || args.cellIndex === 17) {
            updateFpp();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedTab]);

    useEffect(() => {
        if (triggerData) {
            fetchData();
        }
    }, [triggerData]);

    // Handle Search
    const handleSearchNoFpp = (e: any) => {
        setSearchNoFpp(e.target.value);

        let temp: any = data.filter((item: any) => item.no_fpp.toLowerCase().includes(e.target.value.toLowerCase()));
        setFilteredData(temp);

        return noFppRef?.current?.focus();
    };

    const handleChangeSearchKeterangan = (e: any) => {
        setSearchKeterangan(e.target.value);
        let temp = data.filter((item: any) => item.keterangan.toLowerCase().includes(e.target.value.toLowerCase()));
        setFilteredData(temp);
        console.log('temp: ', temp);

        return keteranganRef?.current?.focus();
    };

    const handleClearSearchNoFpp = () => {
        setSearchNoFpp('');
        fetchData();
    };

    const handleClearSearchKeterangan = () => {
        setSearchKeterangan('');
        fetchData();
    };

    /// DETAIL DOK ///
    const [state, setState] = useState({
        content: 'Detail Dok',
        iconCss: 'e-icons e-medium e-chevron-down',
    });

    const [detailDok, setDetailDok] = useState<any[]>([]);

    const DataDetailDok = async (): Promise<any[]> => {
        const response = await axios.get(`${apiUrl}/erp/detail_dok_fpp?`, {
            params: {
                entitas: kode_entitas,
                param1: selectedItems?.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const listDetailDok = response.data.data;
        gridListData2.current?.setProperties({ dataSource: listDetailDok });
        gridListData2.current?.refresh();
        return listDetailDok;
    };

    const ListDetailDok = async (selectedRow: any, setDetailDok: Function) => {
        try {
            const result: any[] = await DataDetailDok();
            setDetailDok(result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const ButtonDetailDok = (selectedRow: any) => {
        return selectedRow;
    };

    const SetDataDokumen = async (tipe: string, selectedRow: string, setSelectedItem: Function, setDetailDok: Function) => {
        if (selectedRow !== '') {
            if (tipe === 'detailDok') {
                const result = ButtonDetailDok(selectedRow);
                setSelectedItem(result);
                ListDetailDok(result, setDetailDok);
            }
        } else {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'],
                },
            });
        }
    };

    useEffect(() => {
        if (selectedItems) {
            DataDetailDok();
        }
    }, [selectedRow]);

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
        // autoFit: true,
        allowReordering: true,
        rowHeight: 22,
        height: '100%',
        gridLines: 'Both',
        // loadingIndicator: { indicatorType: 'Shimmer' },
    };

    const handleRowSelected = (args: any) => {
        setSelectedRow(args?.data?.no_fpp);
        setstatusFpp(args?.data?.status);
        setApproval(args?.data?.approval);
        setSelectedItems(args?.data);
    };

    const handleNavigateLink = (jenis: any) => {
        setShowModalFpp(false);
        if (jenis === 'edit') {
            if (selectedRow) {
                setStatusPage('EDIT');
                setShowModalFpp(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else if (jenis === 'create') {
            setStatusPage('CREATE');
            setstatusFpp('');
            setShowModalFpp(true);
        } else if (jenis === 'approval') {
            if (selectedRow) {
                setStatusPage('APPROVAL');
                setShowModalFpp(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else if (jenis === 'pembayaran') {
            if (selectedRow) {
                setStatusPage('PEMBAYARAN');
                setShowModalFpp(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else if (jenis === 'update-file') {
            if (selectedRow) {
                setStatusPage('UPDATE-FILE');
                setShowModalFpp(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else {
            swal.fire({
                title: 'Warning',
                text: 'Silahkan pilih data terlebih dahulu.',
                icon: 'warning',
            });
        }
    };

    // APPROVAL
    const handleApproval = async () => {
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

        const condition = Number(user_app_fpp) === Number(selectedItems.approval) + 1 && selectedItems.status !== 'Tertutup' && selectedItems.status !== 'Batal' && selectedItems.status !== 'Tolak';
        // || userid.toLowerCase() === 'administrator'
        if (condition) {
            handleNavigateLink('approval');
        } else {
            swal.fire({
                icon: 'warning',
                text: 'Data tidak dapat di Approve, pastikan status dokumen dan hak akses approval sesuai levelnya.',
            });
        }
    };

    // Pembayaran
    const handlePembayaran = async () => {
        // console.log(selectedItems);

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

        const condition = Number(user_app_fpp) === 1 && selectedItems.status !== 'Lunas' && selectedItems.status !== 'Batal' && selectedItems.status !== 'Tolak' && selectedItems.approval == '2';

        // || userid.toLowerCase() === 'administrator'
        if (condition) {
            handleNavigateLink('pembayaran');
        } else {
            swal.fire({
                icon: 'warning',
                text: 'Pembayaran tidak dapat dilakukan, pastikan status dokumen dan hak akses approval sesuai levelnya.',
            });
        }
    };

    // Pembatalan
    const handlePembatalan = async () => {
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

        const masterData = await axios.get(`${apiUrl}/erp/master_detail_fpp`, {
            params: {
                entitas: kode_entitas,
                param1: selectedItems.kode_fpp,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { master, detail } = masterData.data.data;

        if (user_app_fpp != 2) {
            swal.fire({
                icon: 'warning',
                text: 'Hak akses pembatalan hanya dapat dilakukan oleh level 2.',
                timer: 1500,
                showConfirmButton: false,
                backdrop: true,
            });

            return;
        }

        if (selectedItems.status === 'Batal') {
            swal.fire({
                icon: 'error',
                text: 'Status dokumen telah dibatalkan.',
                timer: 2500,
                showConfirmButton: false,
                backdrop: true,
            });
            return;
        }

        swal.fire({
            icon: 'question',
            html: `
      <div className="flex flex-col gap-2 !pr-0">
      <strong class="text-lg mb-4">Batal Pengajuan Pembayaran</strong>
        <p>No. FPP : ${selectedItems.no_fpp}</p>
        <p>Tanggal : ${selectedItems.tgl_fpp}</p>
      </div>
      `,
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            backdrop: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                // console.log('Header: ', selectedItems);
                // console.log('Detail:', detailDok);
                const reqBody = {
                    ...master,
                    tgl_fpp: master.tgl_fpp === null ? null : moment(master.tgl_fpp).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_update: master.tgl_update === null ? null : moment(master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_approval: master.tgl_approval === null ? null : moment(master.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_bayar: master.tgl_bayar === null ? null : moment(master.tgl_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_harus_bayar: master.tgl_harus_bayar === null ? null : moment(master.tgl_harus_bayar).format('YYYY-MM-DD HH:mm:ss'),
                    entitas: kode_entitas,
                    detail: detail,
                    status: 'Batal',
                    lunas_rp: 0,
                };

                // console.log(reqBody);

                const responseAPI = await axios.patch(`${apiUrl}/erp/update_fpp`, reqBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (responseAPI && responseAPI.data.status) {
                    swal.fire({
                        icon: 'success',
                        text: 'Data berhasil dibatalkan.',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } else {
                    swal.fire({
                        icon: 'error',
                        text: 'Data gagal dibatalkan.',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
                fetchData();
            }
        });
    };

    // Fetch Akses User
    useEffect(() => {
        const fetchUserMenu = async () => {
            await usersMenu(kode_entitas, userid, kode_menu)
                .then((res) => {
                    const { baru, edit, hapus, cetak } = res;
                    setUserMenu((prevState) => ({
                        ...prevState,
                        baru,
                        edit,
                        hapus,
                        cetak,
                    }));
                })
                .catch((err) => {
                    console.error('Error: ', err);
                });
        };

        const fetchUserApp = async () => {
            await axios
                .get(`${apiUrl}/erp/users_app`, {
                    params: { entitas: kode_entitas, param1: userid },
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setUserApp(res.data.data[0].app_fpp);
                })
                .catch((err) => {
                    console.log('Error fetching user app: ', err);
                });
        };

        fetchUserMenu();
        fetchUserApp();
    }, []);

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

    return (
        <div className="Main h-[75vh]" id="main-target">
            {/* === Search Group & Button Group === */}
            <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col md:flex-row">
                {/*=== Button Group ===*/}
                <div className="gap-2 sm:flex">
                    <div className="flex flex-col pr-1 sm:border-r md:flex-row">
                        <ButtonComponent
                            id="btnDataBaru"
                            cssClass="e-primary e-small"
                            disabled={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            style={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            onClick={() => handleNavigateLink('create')}
                            content="Baru"
                        />
                        <ButtonComponent
                            id="btnDataUbah"
                            cssClass="e-primary e-small"
                            disabled={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            style={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            onClick={() => handleNavigateLink('edit')}
                            content="Ubah"
                        />
                        <ButtonComponent
                            id="btnFilter"
                            type="submit"
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
                        <ButtonComponent
                            id="btnDetail"
                            cssClass="e-primary e-small"
                            style={{ width: 100 + 'px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#e6e6e6', color: 'black' }}
                            disabled={false}
                            onClick={() => SetDataDokumen('detailDok', selectedRow, setSelectedItem, setDetailDok)}
                            iconCss={state.iconCss}
                            content={state.content}
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnUpdateFile"
                            cssClass="e-primary e-small"
                            style={styleButtonUpdate}
                            // disabled={disabledEdit}
                            content="Update File Pendukung"
                            onClick={() => handleNavigateLink('update-file')}
                            // onClick={handleApproval}
                        />

                        <ButtonComponent
                            id="btnApprovalPust"
                            cssClass="e-primary e-small"
                            // style={styleButtonApproval}
                            style={userid.toLowerCase() === 'administrator' || Number(userApp) >= 1 ? styleButtonApproval : styleButtonApprovalDisabled}
                            disabled={userid.toLowerCase() === 'administrator' || Number(userApp) >= 1 ? false : true}
                            content="Approval"
                            // onClick={() => handleNavigateLink('approvalPusat')}
                            onClick={handleApproval}
                        />

                        <ButtonComponent
                            id="btnPembatalanFpac"
                            cssClass="e-primary e-small"
                            style={styleButtonPembatalan}
                            // disabled={disabledEdit}
                            content="Pembatalan"
                            onClick={handlePembatalan}
                        />

                        <ButtonComponent
                            id="btnPembayaran"
                            cssClass="e-primary e-small"
                            // style={styleButtonApproval}
                            style={userid.toLowerCase() === 'administrator' || Number(userApp) >= 1 ? styleButtonApproval : styleButtonApprovalDisabled}
                            disabled={userid.toLowerCase() === 'administrator' || Number(userApp) >= 1 ? false : true}
                            content="Pembayaran"
                            onClick={handlePembayaran}
                        />
                    </div>

                    {/*=== Search Group ===*/}
                    <div className="ml-1 flex max-w-xl items-center gap-3">
                        <div className="relative w-48">
                            <input
                                type="text"
                                id="searchNoFpp"
                                name="searchNoFpp"
                                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                placeholder="< No FPP >"
                                style={{ height: '4vh' }}
                                value={searchNoFpp}
                                ref={noFppRef}
                                onChange={handleSearchNoFpp}
                            />
                            {searchNoFpp && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                    onClick={handleClearSearchNoFpp}
                                >
                                    &times;
                                </button>
                            )}
                        </div>

                        <div className="relative w-48">
                            <input
                                type="text"
                                id="searchKeterangan"
                                name="searchKeterangan"
                                className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                placeholder="< Keterangan >"
                                style={{ height: '4vh' }}
                                value={searchKeterangan}
                                ref={keteranganRef}
                                onChange={handleChangeSearchKeterangan}
                            />
                            {searchKeterangan && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                    onClick={handleClearSearchKeterangan}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                        Form Pengajuan Pembayaran
                    </span>
                </div>
            </div>
            {/* === Filter & Table === */}
            <div className="sm:h[calc(80vh-100px)] relative flex h-full gap-3">
                {/* Filter */}
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[330px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
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
                                    <div>
                                        {/* No FPP */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="No. FPP"
                                                checked={masterFilter.isNoFppChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isNoFppChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={masterFilter.noFppValue}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('noFppValue', value);
                                                        updateStateFilter('isNoFppChecked', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* // TANGGAL DOKUMEN // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tanggal"
                                                checked={masterDate.isTglChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateDate('isTglChecked', value);
                                                }}
                                            />
                                        </div>

                                        <div className={`grid grid-cols-1 justify-between gap-2 sm:flex `}>
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
                                                    value={masterDate.tglAwal.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                                                        updateStateDate('tglAwal', moment(args.value));
                                                        updateStateDate('isTglChecked', true);
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
                                                    value={masterDate.tglAkhir.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateDate('tglAkhir', moment(args.value));
                                                        updateStateDate('isTglChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>

                                        {/* // TANGGAL HARUS BAYAR // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tanggal Harus Bayar"
                                                checked={masterDate.isTglBayarChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateDate('isTglBayarChecked', value);
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
                                                    value={masterDate.tglAwalBayar.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                                                        updateStateDate('tglAwalBayar', moment(args.value));
                                                        updateStateDate('isTglBayarChecked', true);
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
                                                    value={masterDate.tglAkhirBayar.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateDate('tglAkhirBayar', moment(args.value));
                                                        updateStateDate('isTglBayarChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>

                                        {/* // TANGGAL PEMBAYARAN // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tanggal Pembayaran"
                                                checked={masterDate.isTglPembayaranChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateDate('isTglPembayaranChecked', value);
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
                                                    value={masterDate.tglAwalPembayaran.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                                                        updateStateDate('tglAwalPembayaran', moment(args.value));
                                                        updateStateDate('isTglPembayaranChecked', true);
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
                                                    value={masterDate.tglAkhirPembayaran.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        updateStateDate('tglAkhirPembayaran', moment(args.value));
                                                        updateStateDate('isTglPembayaranChecked', true);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>

                                        {/* Keterangan */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Keterangan"
                                                checked={masterFilter.isKeteranganChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isKeteranganChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={masterFilter.keteranganValue}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('keteranganValue', value);
                                                        updateStateFilter('isKeteranganChecked', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Pemilik Rekening */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Pemilik Rekening"
                                                checked={masterFilter.isPemilikRekeningChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isPemilikRekeningChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={masterFilter.pemilikRekeningValue}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('pemilikRekeningValue', value);
                                                        updateStateFilter('isPemilikRekeningChecked', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* No Rekening */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="No. Rekening"
                                                checked={masterFilter.isNoRekeningChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isNoRekeningChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={masterFilter.noRekeningValue}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('noRekeningValue', value);
                                                        updateStateFilter('isNoRekeningChecked', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Entitas */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Entitas"
                                                checked={masterFilter.isEntitasChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isEntitasChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <TextBoxComponent
                                                    placeholder=""
                                                    value={masterFilter.entitasValue}
                                                    input={(args: FocusInEventArgs) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('entitasValue', value);
                                                        updateStateFilter('isEntitasChecked', value.length > 0);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Jenis Pembayaran */}
                                        <div className="mt-2 flex">
                                            <CheckBoxComponent
                                                label="Jenis Pembayaran"
                                                checked={masterFilter.isJenisPembayaranChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    updateStateFilter('isJenisPembayaranChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between">
                                            <div className="container form-input">
                                                <DropDownListComponent
                                                    id="jenispembayaran"
                                                    className="form-select"
                                                    dataSource={['Semua', 'Tunai', 'Setor Tunai', 'Transfer', 'Transfer dari Rekening PT.', 'Kartu Kredit', 'Flip']}
                                                    placeholder="--Silahkan Pilih--"
                                                    change={(args: ChangeEventArgsDropDown) => {
                                                        const value: any = args.value;
                                                        updateStateFilter('jenisPembayaranValue', value);
                                                        updateStateFilter('isJenisPembayaranChecked', value.length > 0);
                                                    }}
                                                    value={masterFilter.jenisPembayaranValue}
                                                />
                                            </div>
                                        </div>

                                        {/* Cek Nota Asli */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Cek Nota Asli</span>
                                            </div>
                                            <div className="mt-2 flex justify-around gap-1">
                                                {['Semua', 'Ya', 'Tidak'].map((option) => (
                                                    <label key={option} className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="cekNotaAsli"
                                                            value={option}
                                                            checked={masterFilter.cekNotaAsli === option}
                                                            onChange={(e) => updateStateFilter('cekNotaAsli', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-2">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cek Nota Coret */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Cek Nota Coret</span>
                                            </div>
                                            <div className="mt-2 flex justify-around gap-1">
                                                {['Semua', 'Ya', 'Tidak'].map((option) => (
                                                    <label key={option} className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="cekNotaCoret"
                                                            value={option}
                                                            checked={masterFilter.cekNotaCoret === option}
                                                            onChange={(e) => updateStateFilter('cekNotaCoret', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-2">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cek Realisasi */}
                                        <div>
                                            <div className="mt-3 font-bold">
                                                <span>Cek Realisasi</span>
                                            </div>
                                            <div className="mt-2 flex justify-around gap-1">
                                                {['Semua', 'Ya', 'Tidak'].map((option) => (
                                                    <label key={option} className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="cekRealisasi"
                                                            value={option}
                                                            checked={masterFilter.cekRealisasi === option}
                                                            onChange={(e) => updateStateFilter('cekRealisasi', e.currentTarget.value)}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-2">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Transaksi Selisih */}
                                        <div className="mt-5 flex">
                                            <CheckBoxComponent
                                                label="Pembatalan Pengajuan"
                                                checked={masterFilter.isPembatalanChecked}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;

                                                    updateStateFilter('isPembatalanChecked', value);
                                                }}
                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                            />
                                        </div>
                                    </div>
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
                                        FPP BARU
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
                                        Approval (1)
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
                                        Approval (2)
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => setSelectedTab(3)}
                                        className={`${
                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                    >
                                        Selesai Bayar
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="h-[calc(100%_-_40px)]">
                            {selectedTab === 0 && (
                                <GridComponent
                                    {...gridOptions}
                                    ref={gridListData}
                                    dataSource={searchKeterangan !== '' || searchNoFpp !== '' ? filteredData : data}
                                    rowSelected={handleRowSelected}
                                    recordDoubleClick={() => {
                                        if (!selectedRow) {
                                            swal.fire({
                                                text: 'Silakan pilih data terlebih dahulu.',
                                                showConfirmButton: false,
                                                backdrop: true,
                                                timer: 1500,
                                            });

                                            return;
                                        }

                                        if (userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR') {
                                            handleNavigateLink('edit');
                                        }
                                    }}
                                    locale="id"
                                    queryCellInfo={(args) => {
                                        if (args.data.status.toLowerCase() === 'tolak') {
                                            args.cell.style.backgroundColor = '#DB1E1F'; //merah
                                        } else if (args.data.status.toLowerCase() === 'batal') {
                                            args.cell.style.backgroundColor = '#FEDD00'; // kuning
                                            args.cell.style.color = '#CC0700'; // merah
                                        } else if (args.data.status.toLowerCase() === 'lunas') {
                                            args.cell.style.backgroundColor = '#25F300'; // hijau
                                            args.cell.style.color = '#000000';
                                        } else {
                                            args.cell.style.backgroundColor = ''; // default
                                        }
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="no_fpp"
                                            headerText="No. FPP"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_fpp"
                                            headerText="Tgl. Buat"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="kode_entitas"
                                            headerText="Entitas"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_harus_bayar"
                                            headerText="Tgl. Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="jenis_bayar"
                                            headerText="Jenis Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="150"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_bank"
                                            headerText="Nama Bank"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="no_rekening"
                                            headerText="No. Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_rekening"
                                            headerText="Nama Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="netto_rp"
                                            headerText="Netto Rp"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            width="120"
                                            // format="N2"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                            template={(props: any) => {
                                                return <span>{props.netto_rp ? parseFloat(props.netto_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                            }}
                                        />
                                        <ColumnDirective field="keterangan" headerText="Keterangan" headerTextAlign="Center" width="250" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective
                                            field="status"
                                            headerText="Status"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="90"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="approval"
                                            headerText="Approval"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="80"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="user_input"
                                            headerText="User Input"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="130"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder]} />
                                </GridComponent>
                            )}
                            {selectedTab === 1 && (
                                <GridComponent
                                    {...gridOptions}
                                    ref={gridListData}
                                    dataSource={filteredData.length > 0 ? filteredData : data}
                                    rowSelected={handleRowSelected}
                                    recordDoubleClick={() => {
                                        if (!selectedRow) {
                                            swal.fire({
                                                text: 'Silakan pilih data terlebih dahulu.',
                                                showConfirmButton: false,
                                                backdrop: true,
                                                timer: 1500,
                                            });

                                            return;
                                        }

                                        if (userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR') {
                                            handleNavigateLink('edit');
                                        }
                                    }}
                                    locale="id"
                                    queryCellInfo={(args) => {
                                        if (args.data.status.toLowerCase() === 'tolak') {
                                            args.cell.style.backgroundColor = '#DB1E1F'; //merah
                                        } else if (args.data.status.toLowerCase() === 'batal') {
                                            args.cell.style.backgroundColor = '#FEDD00'; // kuning
                                            args.cell.style.color = '#CC0700'; // merah
                                        } else if (args.data.status.toLowerCase() === 'lunas') {
                                            args.cell.style.backgroundColor = '#25F300'; // hijau
                                            args.cell.style.color = '#000000';
                                        } else {
                                            args.cell.style.backgroundColor = ''; // default
                                        }
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="no_fpp"
                                            headerText="No. FPP"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_fpp"
                                            headerText="Tgl. Buat"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="kode_entitas"
                                            headerText="Entitas"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_harus_bayar"
                                            headerText="Tgl. Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="jenis_bayar"
                                            headerText="Jenis Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="150"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_bank"
                                            headerText="Nama Bank"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="no_rekening"
                                            headerText="No. Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_rekening"
                                            headerText="Nama Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="netto_rp"
                                            headerText="Netto Rp"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                            template={(props: any) => {
                                                return <span>{props.netto_rp ? parseFloat(props.netto_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                            }}
                                        />
                                        <ColumnDirective field="keterangan" headerText="Keterangan" headerTextAlign="Center" width="250" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective
                                            field="status"
                                            headerText="Status"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="90"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="approval"
                                            headerText="Approval"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="80"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="user_input"
                                            headerText="User Input"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="130"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder]} />
                                </GridComponent>
                            )}
                            {selectedTab === 2 && (
                                <GridComponent
                                    {...gridOptions}
                                    ref={gridListData}
                                    dataSource={filteredData.length > 0 ? filteredData : data}
                                    rowSelected={handleRowSelected}
                                    recordDoubleClick={() => {
                                        if (!selectedRow) {
                                            swal.fire({
                                                text: 'Silakan pilih data terlebih dahulu.',
                                                showConfirmButton: false,
                                                backdrop: true,
                                                timer: 1500,
                                            });

                                            return;
                                        }

                                        if (userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR') {
                                            handleNavigateLink('edit');
                                        }
                                    }}
                                    locale="id"
                                    queryCellInfo={(args) => {
                                        if (args.data.status.toLowerCase() === 'tolak') {
                                            args.cell.style.backgroundColor = '#DB1E1F'; //merah
                                        } else if (args.data.status.toLowerCase() === 'batal') {
                                            args.cell.style.backgroundColor = '#FEDD00'; // kuning
                                            args.cell.style.color = '#CC0700'; // merah
                                        } else if (args.data.status.toLowerCase() === 'lunas') {
                                            args.cell.style.backgroundColor = '#25F300'; // hijau
                                            args.cell.style.color = '#000000';
                                        } else {
                                            args.cell.style.backgroundColor = ''; // default
                                        }
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="no_fpp"
                                            headerText="No. FPP"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_fpp"
                                            headerText="Tgl. Buat"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="kode_entitas"
                                            headerText="Entitas"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_harus_bayar"
                                            headerText="Tgl. Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="jenis_bayar"
                                            headerText="Jenis Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="150"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_bank"
                                            headerText="Nama Bank"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="no_rekening"
                                            headerText="No. Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_rekening"
                                            headerText="Nama Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="netto_rp"
                                            headerText="Netto Rp"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                            template={(props: any) => {
                                                return <span>{props.netto_rp ? parseFloat(props.netto_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                            }}
                                        />
                                        <ColumnDirective field="keterangan" headerText="Keterangan" headerTextAlign="Center" width="250" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective
                                            field="status"
                                            headerText="Status"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="90"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="approval"
                                            headerText="Approval"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="80"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="user_input"
                                            headerText="User Input"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="130"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder]} />
                                </GridComponent>
                            )}
                            {selectedTab === 3 && (
                                <GridComponent
                                    {...gridOptions}
                                    ref={gridListData}
                                    dataSource={filteredData.length > 0 ? filteredData : data}
                                    rowSelected={handleRowSelected}
                                    recordDoubleClick={() => {
                                        if (!selectedRow) {
                                            swal.fire({
                                                text: 'Silakan pilih data terlebih dahulu.',
                                                showConfirmButton: false,
                                                backdrop: true,
                                                timer: 1500,
                                            });

                                            return;
                                        }

                                        if (userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR') {
                                            handleNavigateLink('edit');
                                        }
                                    }}
                                    locale="id"
                                    queryCellInfo={(args) => {
                                        if (args.data.status.toLowerCase() === 'tolak') {
                                            args.cell.style.backgroundColor = '#DB1E1F'; //merah
                                        } else if (args.data.status.toLowerCase() === 'batal') {
                                            args.cell.style.backgroundColor = '#FEDD00'; // kuning
                                            args.cell.style.color = '#CC0700'; // merah
                                        } else if (args.data.status.toLowerCase() === 'lunas') {
                                            args.cell.style.backgroundColor = '#25F300'; // hijau
                                            args.cell.style.color = '#000000';
                                        } else {
                                            args.cell.style.backgroundColor = ''; // default
                                        }
                                    }}
                                    recordClick={handleRecordClick}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="no_fpp"
                                            headerText="No. FPP"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_fpp"
                                            headerText="Tgl. Buat"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="kode_entitas"
                                            headerText="Entitas"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="230"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="tgl_harus_bayar"
                                            headerText="Tgl. Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="100"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="jenis_bayar"
                                            headerText="Jenis Pembayaran"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            // width="150"
                                            autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_bank"
                                            headerText="Nama Bank"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="no_rekening"
                                            headerText="No. Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="nama_rekening"
                                            headerText="Nama Rekening"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="150"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="netto_rp"
                                            headerText="Netto Rp"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            width="120"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                            template={(props: any) => {
                                                return <span>{props.netto_rp ? parseFloat(props.netto_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                            }}
                                        />
                                        <ColumnDirective field="keterangan" headerText="Keterangan" headerTextAlign="Center" width="250" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective
                                            field="status"
                                            headerText="Status"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="90"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="approval"
                                            headerText="Approval"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="80"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="user_input"
                                            headerText="User Input"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="130"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            field="no_reff"
                                            headerText="No. Reff"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            width="130"
                                            // autoFit
                                            clipMode="EllipsisWithTooltip"
                                        />
                                        <ColumnDirective
                                            columns={[
                                                // { field: 'cek_nota_asli', headerText: 'Cek', headerTextAlign: 'Center', textAlign: 'Left', width: 50, minWidth: 30, template: NotaAsliCheckbox },
                                                { field: 'cek_nota_asli', headerText: 'Cek', headerTextAlign: 'Center', textAlign: 'Left', width: 50, minWidth: 30, valueAccessor: templateNotaAsli },
                                                { field: 'user_cek_nota_asli', headerText: 'User', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                                { field: 'tgl_cek_nota_asli', headerText: 'Tanggal', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                            ]}
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            headerText="Realisasi Nota Asli"
                                        />
                                        <ColumnDirective
                                            columns={[
                                                // { field: 'cek_nota_coret', headerText: 'Cek', headerTextAlign: 'Center', textAlign: 'Left', width: 50, minWidth: 30, template: NotaCoretCheckbox },
                                                { field: 'cek_nota_coret', headerText: 'Cek', headerTextAlign: 'Center', textAlign: 'Left', width: 50, minWidth: 30, valueAccessor: templateNotaCoret },
                                                { field: 'user_cek_nota_coret', headerText: 'User', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                                { field: 'tgl_cek_nota_coret', headerText: 'Tanggal', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                            ]}
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            headerText="Realisasi Nota Coret"
                                        />
                                        <ColumnDirective
                                            columns={[
                                                {
                                                    field: 'tombol',
                                                    headerText: 'Status',
                                                    headerTextAlign: 'Center',
                                                    textAlign: 'Center',
                                                    width: 90,
                                                    minWidth: 30,
                                                    template: TemplateTombol,
                                                },
                                                { field: 'user_scan', headerText: 'User', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                                { field: 'tgl_scan', headerText: 'Tgl. Upload', headerTextAlign: 'Center', textAlign: 'Left', width: 100, minWidth: 50 },
                                            ]}
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            headerText="Realisasi Barang"
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder]} />
                                </GridComponent>
                            )}
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>

            {showModalFpp && (
                <DialogFrmFpp
                    isOpen={showModalFpp}
                    onClose={() => setShowModalFpp(false)}
                    statusPage={statusPage}
                    token={token}
                    kode_entitas={kode_entitas}
                    userid={userid}
                    kode_dokumen={selectedItems?.kode_fpp}
                    kode_user={kode_user}
                    onRefresh={fetchData}
                    statusFpp={statusFpp}
                    approval={approval}
                    entitas_user={entitas_user}
                />
            )}

            {selectedItem && (
                <Draggable>
                    <div className={`${styles.modalDetailDragable}`} style={{ top: '3%', right: '2%', width: '100%', background: '#dedede' }}>
                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                            <div style={{ marginBottom: 21 }}>
                                <span style={{ fontSize: 18, fontWeight: 500 }}>
                                    Detail Form Pengajuan Pembayaran - {selectedRow} - {selectedItems.tgl_fpp}
                                </span>
                            </div>
                            <GridComponent dataSource={detailDok} ref={gridListData2} width={'100%'} rowHeight={30} gridLines={'Both'} allowSorting={true}>
                                <ColumnsDirective>
                                    <ColumnDirective field="diskripsi" headerText="Deskripsi" width="150" textAlign="Left" headerTextAlign="Center" />
                                    <ColumnDirective field="satuan" headerText="Satuan" width="100" textAlign="Left" headerTextAlign="Center" />
                                    <ColumnDirective field="qty" headerText="Kuantitas" width="100" textAlign="Right" headerTextAlign="Center" />
                                    <ColumnDirective
                                        field="harga_mu"
                                        headerText="Harga"
                                        width="100"
                                        textAlign="Right"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.harga_mu ? parseFloat(props.harga_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="diskon_mu"
                                        headerText="Diskon"
                                        width="100"
                                        textAlign="Right"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.diskon_mu ? parseFloat(props.diskon_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="potongan_mu"
                                        headerText="Potongan"
                                        width="100"
                                        textAlign="Right"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.potongan_mu ? parseFloat(props.potongan_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="jumlah_rp"
                                        headerText="Jumlah Rp"
                                        width="100"
                                        textAlign="Right"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.jumlah_rp ? parseFloat(props.jumlah_rp).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective field="catatan" headerText="Catatan" width="100" textAlign="Left" headerTextAlign="Center" />
                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" width="100" textAlign="Left" headerTextAlign="Center" />
                                    <ColumnDirective field="noranka" headerText="No. Rangka" width="100" textAlign="Left" headerTextAlign="Center" />
                                </ColumnsDirective>
                                <Inject services={[Page, Sort, Filter, Group]} />
                            </GridComponent>
                        </div>
                        <button
                            className={`${styles.closeButtonDetailDragable}`}
                            onClick={() => {
                                setSelectedItem(null);
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                        </button>
                    </div>
                </Draggable>
            )}

            {/* {openPreview ? (
        <Draggable>
          <div className={`${styles.modalDetailDragable}`} style={{ top: '3%', right: '2%', width: '100%', background: '#dedede' }}>
            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
              <div style={{ marginBottom: 21 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  FPPA : {selectedItems.no_fpp} {selectedItems.tgl_fpp}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <img src={imageUrl} alt="previewImg" style={{ width: '350px', height: 'auto' }} />
              </div>
            </div>
            <button className={`${styles.closeButtonDetailDragable}`} onClick={() => setOpenPreview(false)}>
              <FontAwesomeIcon icon={faTimes} width="18" height="18" />
            </button>
          </div>
        </Draggable>
      ) : null} */}

            {openPreview ? (
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
                            src={imageUrl}
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
                            <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => setOpenPreview(false)}></span>
                        </ButtonComponent>
                    </div>
                </div>
            ) : null}

            {showDialogUpload ? (
                <Draggable>
                    <div className={`${styles.modalDetailDragable2} e-content`} style={{ top: '3%', right: '2%', width: '500px', background: '#dedede' }}>
                        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                            <div style={{ marginBottom: 21 }}>
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>Upload File</span>
                            </div>
                            <hr style={{ border: '1px solid gray' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '300px', marginTop: '5px' }} tabIndex={1}>
                                {imageFile.previewImg ? (
                                    <div className="h-full w-[75%]">
                                        <img src={imageFile.previewImg.startsWith('data:application/pdf') ? resPdf : imageFile.previewImg} alt="" />
                                    </div>
                                ) : (
                                    <div className="flex h-full w-[75%] flex-col items-center justify-center border-2 border-dotted border-black">
                                        <div className="h-full w-full opacity-0">
                                            <UploaderComponent
                                                type="file"
                                                multiple={false}
                                                id="upload-files2"
                                                className="opacity-0"
                                                ref={uploaderRef}
                                                selected={(args: any) => handleFileSelect2(args, selectedItems)}
                                            />
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
                                                nameZip: '',
                                                previewImg: '',
                                            });
                                        }}
                                    >
                                        Hapus File
                                    </button>
                                    <button
                                        disabled={imageFile.previewImg === '' || imageFile.previewImg === null}
                                        className="mt-2 cursor-pointer rounded bg-gray-400 px-2 py-1 text-sm text-white hover:bg-gray-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                                        onClick={() => {
                                            handleUpload2(kode_entitas, token, userid, selectedItems);
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
                                        nameZip: '',
                                        previewImg: '',
                                    });
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </div>
                </Draggable>
            ) : null}
        </div>
    );
};

export default FppList;
