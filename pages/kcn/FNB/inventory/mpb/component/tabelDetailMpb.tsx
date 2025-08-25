import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faCirclePlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getServerSideProps } from '@/pages/api/getServerSide';
// import ItemDlg from '.././modal/itemdlg';
import { useState, useRef, useEffect } from 'react';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { Dialog, Transition } from '@headlessui/react';
import Flatpickr from 'react-flatpickr';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import 'react-tabs/style/react-tabs.css';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from '../mpblist.module.css';
// import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
// import React from 'react';
import ModalDlgLpb from '../modal/modalLpbDlg';
import MpbList from '../mpblist';
import swal from 'sweetalert2';
import { frmNumber, overQTYAll, tanpaKoma } from '@/utils/routines';
import { MpbEditApi } from '../model/api';
import moment from 'moment';
import { isArray } from 'lodash';
import { DataObject } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { SpreadNumber } from '../../../fa/fpp/utils';

// import { Toolbar } from '@mui/material';

interface TabelDetailMpbProps {
    userid: any;
    kode_entitas: any;
    kode_user: any;
    kodeSupp: any;
    kodeGudang: any;
    dataApi: any;
    kode_mpb: any;
    detailBaru: any;
    kondisiTombolSimpan: boolean;
    gridDetailMPB: any;
}

// export default function TabelDetailMpb({ userid, kode_entitas, kode_user, dataApi, kodeSupp, kodeGudang }: TabelDetailMpbProps) {
export default function TabelDetailMpb({ userid, kode_entitas, kode_user, kodeSupp, kodeGudang, dataApi, kode_mpb, detailBaru, kondisiTombolSimpan, gridDetailMPB }: TabelDetailMpbProps) {
    // useEffect(() => {
    //     gridDetailMPB.current!.setProperties({dataSource :  dataApi.nodes});
    //     gridDetailMPB.current!.refresh();
    // }, [dataApi.nodes, kode_entitas]);

    const theme = useTheme({
        Header: `
            .th {
                border-bottom: 1px solid #a0a8ae;
                text-align: center; /* Center align header text */
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
            text-align: center; /* Center align cell content */
        `,
        Table: `
        --data-table-library_grid-template-columns: repeat(9, 1fr); /* Default layout */
        /* Media query for smaller screens */
        @media screen and (max-width: 768px) {
        }
    `,
    });

    const [dlgLpb, setDlgLpb] = useState(false);
    const [dataDetailDlg, setDataDetailDlg] = useState<any>({ nodes: [] });
    const [selectedRowIndexBarangbarang, setSelectedRowIndexBarangbarang] = useState(0);
    const [dsBarang, setDsBarang] = useState([]);
    const [rowid, setRowId] = useState<any>(0);
    const [dlgSupplier, setdlgSupplier] = useState(false);

    const swalToast = Swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 2000,
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

    const kondisiDlgLpb = () => {
        if (kodeSupp === '') {
            swal.fire({
                title: 'Warning',
                text: 'Supplier belum diisi',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok',
                customClass: {
                    popup: 'custom-popup-class',
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await setdlgSupplier(true);
                }
            });
        } else if (kodeGudang === '') {
            swal.fire({
                title: 'Warning',
                text: 'Gudang belum diisi',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok',
                customClass: {
                    popup: 'custom-popup-class',
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await setdlgSupplier(true);
                }
            });
        } else {
            setDlgLpb(true);
        }
    };

    const ambilDariLpbDlgBatch = async (dataObjectDariLpbDlgArray: any) => {
        let indexLoop = 0;
        Promise.all(
            dataObjectDariLpbDlgArray.map((item: any, index: number) => {
                const temp: any = gridDetailMPB.current.dataSource;
                console.log('lengdata', temp.length, index);

                const {
                    kode_lpb,
                    no_lpb,
                    id_lpb,
                    kode_sp,
                    id_sp,
                    kode_pp,
                    id_pp,
                    kode_item,
                    no_item,
                    diskripsi,
                    qty,
                    satuan,
                    sat_std,
                    kode_mu,
                    kurs,
                    kurs_pajak,
                    harga_mu,
                    diskon,
                    diskon_mu,
                    potongan_mu,
                    kode_pajak,
                    include,
                    pajak,
                    pajak_mu,
                    ket,
                    kode_dept,
                    kode_kerja,
                    kode_akun_persediaan,
                    brt,
                    qty_std,
                    qty_sisa,
                    berat,
                    no_dok,
                    no_sj,
                    tgl_sj,
                    jumlah_rp,
                    jumlah_mu,
                    kena_pajak,
                } = item;

                const Temp = {
                    id_mpb: temp.length,
                    kode_lpb: kode_lpb,
                    no_lpb: no_lpb,
                    id_lpb: id_lpb,
                    kode_sp: kode_sp,
                    id_sp: id_sp,
                    kode_pp: kode_pp,
                    id_pp: id_pp,
                    kode_item: kode_item,
                    no_item: no_item,
                    diskripsi: diskripsi,
                    qty: SpreadNumber(qty),
                    satuan: satuan,
                    sat_std: sat_std,
                    kode_mu: kode_mu,
                    kurs: kurs,
                    kurs_pajak: kurs_pajak,
                    harga_mu: harga_mu, //frmNumber(harga_mu),
                    diskon: diskon, //frmNumber(diskon),
                    diskon_mu: diskon_mu, //frmNumber(diskon_mu),
                    potongan_mu: potongan_mu, //frmNumber(potongan_mu),
                    kode_pajak: kode_pajak,
                    include: include,
                    pajak: pajak,
                    pajak_mu: pajak_mu, //frmNumber(pajak_mu),
                    ket: ket,
                    kode_dept: kode_dept,
                    kode_kerja: kode_kerja,
                    kode_akun_persediaan: kode_akun_persediaan,
                    brt: brt, // frmNumber(brt),
                    qty_std: qty_std, //frmNumber(qty_std),
                    qty_sisa: qty_sisa, //frmNumber(qty_sisa),
                    berat: berat, //frmNumber(berat),
                    no_dok: no_dok,
                    no_sj: no_sj,
                    tgl_sj: moment(tgl_sj).format('DD-MM-YYYY'),
                    jumlah_rp: jumlah_rp, //frmNumber(jumlah_rp),
                    jumlah_mu: jumlah_mu, //frmNumber(jumlah_mu),
                    kena_pajak: kena_pajak,
                };

                const isEmptyNoItem = temp?.filter((items: any) => items.no_item == '');
                const indexxx = temp.findIndex((items: any) => items.no_item !== '');
                console.log('isEmptyNoItem', isEmptyNoItem.length > 0, indexxx, temp);

                if (isEmptyNoItem.length > 0) {
                    const index = temp.findIndex((items: any) => items.no_item === '');
                    gridDetailMPB.current!.updateRow(index, Temp);
                } else {
                    gridDetailMPB.current!.addRecord(Temp, temp.length);
                }
            })
        );
        const tempForID = gridDetailMPB.current!.dataSource;
        const modData = tempForID.map((item: any, index: number) => ({
            ...item,
            id_mpb: index + 1,
        }));
        gridDetailMPB.current!.dataSource = modData;
        gridDetailMPB.current!.refresh();

        // console.log(dataObjectDariLpbDlg);
    };

    const rowSelectingBarangbarang = (args: any) => {
        setSelectedRowIndexBarangbarang(args.rowIndex);
    };

    const handleBarang_EndEdit = async () => {
        gridDetailMPB.current!.endEdit();
    };
    const addBarangCustomer = async (jenis: any) => {
        await handleBarang_EndEdit();
        const sourceLength = gridDetailMPB.current.dataSource?.length;
        const isNotEmptyNamabarang = gridDetailMPB.current.dataSource?.every((item: any) => item.id_mpb !== '');
        const isNotEmptyNoBarang = gridDetailMPB.current.dataSource?.every((item: any) => item.no_item !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoBarang)) {
                const newObject = {
                    id_mpb: gridDetailMPB.current!.dataSource.length + 1,
                    kode_lpb: '',
                    no_lpb: '',
                    id_lpb: '',
                    kode_sp: '',
                    id_sp: '',
                    kode_pp: '',
                    id_pp: '',
                    kode_item: '',
                    no_item: '',
                    diskripsi: '',
                    qty: 0,
                    satuan: '',
                    sat_std: '',
                    kode_mu: '',
                    kurs: '',
                    kurs_pajak: '',
                    harga_mu: 0,
                    diskon: '',
                    diskon_mu: '',
                    potongan_mu: '',
                    kode_pajak: '',
                    include: '',
                    pajak: '',
                    pajak_mu: 0,
                    ket: '',
                    kode_dept: '',
                    kode_kerja: '',
                    kode_akun_persediaan: '',
                    brt: 0,
                    qty_std: '',
                    qty_sisa: '',
                    berat: 0,
                    no_dok: '',
                    no_sj: '',
                    tgl_sj: '',
                    jumlah_rp: 0,
                    jumlah_mu: 0,
                    kena_pajak: '',
                };
                gridDetailMPB.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridDetailMPB.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridSales')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data Barang sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#forDialogAndSwall',
                });
            }
        }
    };
    const deleteBarangbarang = async () => {
        const selectedListData: any = gridDetailMPB.current!.getSelectedRecords();
        console.log('selectedListData', selectedListData);

        if (selectedListData.length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Produk ${selectedRowIndexBarangbarang + 1}</p>`,
                    target: '#forDialogAndSwall',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridDetailMPB.current!.deleteRecord(selectedListData);
                        setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexBarangbarang));
                        setTimeout(() => {
                            gridDetailMPB.current!.refresh();
                        }, 200);
                    }
                });
        } else {
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Pilih Data Barang Terlebih Dulu</p>`,
                target: '#forDialogAndSwall',
            });
        }
    };
    const deleteAllBarangbarang = () => {
        if (Array.isArray(gridDetailMPB.current!.dataSource)) {
            if ((gridDetailMPB.current!.dataSource as any[]).length > 0) {
                withReactContent(Swal)
                    .fire({
                        html: 'Hapus semua data?',
                        width: '15%',
                        target: '#forDialogAndSwall',
                        showCancelButton: true,
                        confirmButtonText: '<p style="font-size:10px">Ya</p>',
                        cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                    })
                    .then((result) => {
                        if (result.isConfirmed) {
                            (gridDetailMPB.current!.dataSource as any[]).splice(0, (gridDetailMPB.current!.dataSource as any[]).length);

                            gridDetailMPB.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };

    // type MPBDetailGrid = {
    //     kode_lpb: any;
    //     no_lpb: any;
    //     id_lpb: any;
    //     kode_sp: any;
    //     id_sp: any;
    //     kode_pp: any;
    //     id_pp: any;
    //     kode_item: any;
    //     no_item: any;
    //     diskripsi: any;
    //     qty: any;
    //     satuan: any;
    //     sat_std: any;
    //     kode_mu: any;
    //     kurs: any;
    //     kurs_pajak: any;
    //     harga_mu: any;
    //     diskon: any;
    //     diskon_mu: any;
    //     potongan_mu: any;
    //     kode_pajak: any;
    //     include: any;
    //     pajak: any;
    //     pajak_mu: any;
    //     ket: any;
    //     kode_dept: any;
    //     kode_kerja: any;
    //     kode_akun_persediaan: any;
    //     brt: any;
    //     qty_std: any;
    //     qty_sisa: any;
    //     berat: any;
    //     no_dok: any;
    //     no_sj: any;
    //     tgl_sj: any;
    //     jumlah_rp: any;
    //     jumlah_mu: any;
    //     kena_pajak: any;
    //     index: number;
    // };

    // useEffect(() => {
    //     // console.log('dataDetailDlg', dataDetailDlg);
    //     const cekDetail: any = dataDetailDlg;
    //     overQTYAll(kode_entitas, kodeGudang, dataDetailDlg.nodes[0].kode_item, moment().format('YYYY-MM-DD'), kode_mpb, parseFloat(dataDetailDlg.nodes[0].qty), 'mpb', 'Kuantitas Standar MPB');
    // }, [dataDetailDlg]);

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
        }
    }, [kode_mpb]);

    const tombolBaruGrid = () => {
        const cekDetail: any = dataDetailDlg;
        // console.log('dataDetailDlg', dataDetailDlg);
        // function handleSubmit(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {

        function handleSubmit(): void {
            // if (cekDetail.nodes[0].no_item !== '') {
            // overQTYAll(kode_entitas, kodeGudang, cekDetail.nodes[0].kode_item, moment().format('YYYY-MM-DD'), kode_mpb, parseFloat(cekDetail.nodes[0].qty), 'mpb', 'Kuantitas Standar MPB');
            // } else {
            const id = dataDetailDlg.nodes.length + 1;

            const gridMpbBaru = {
                id: id,
                id_mpb: id,
                no_item: '',
                diskripsi: '',
                satuan: '',
                ket: '',
                berat: 0,
                no_dok: '',
                no_sj: '',
                tgl_sj: '',
                // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
            };

            const fieldKosong = dataDetailDlg.nodes.some((row: { diskripsi: string }) => row.diskripsi === '');

            if (!fieldKosong) {
                setDataDetailDlg((state: any) => ({
                    ...state,
                    nodes: state.nodes.concat(gridMpbBaru),
                }));
            } else {
                alert('Harap isi detail sebelum tambah data');
            }
            // }
            // throw new Error('Function not implemented.');
        }

        return (
            <div className="mb-1 flex" style={{ marginLeft: '55%' }}>
                <button title="Tambah Barang" type="submit" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <button title="Tambah Barang" type="submit" onClick={ onEditMpb()} style={{ display: 'flex', alignItems: 'center' }}> */}
                    <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                </button>
            </div>
        );
    };
    const [idRowRemove, setIdRowRemove] = useState(0);

    const handleKirimIdRemove = (idRow: any) => {
        setIdRowRemove(idRow);
    };

    const EditTemplateNoItem = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.no_item} readonly />
                    <button style={{ position: 'absolute', top: '35%', right: '1px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setDlgLpb(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    const EditTemplateNamaItem = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }} className="flex w-full">
                    <TextBoxComponent style={{ fontSize: '12px', width: '140px' }} value={args.diskripsi} readonly />
                    <button style={{ position: 'absolute', top: '35%', right: '0px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setDlgLpb(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };
    const actionCompleteHandle = (args: any) => {
        // console.log('1100259', args);
        if (args.action === 'edit') {
            const temp = {
                ...args.data,
                jumlah_mu: args.data.qty * args.data.harga_mu,
                jumlah_rp: args.data.qty * args.data.harga_mu,
            };
            gridDetailMPB.current.dataSource[selectedRowIndexBarangbarang] =  temp;
            gridDetailMPB.current.refresh();
        }
    };

    const tombolHapusGrid = () => {
        // function handleSubmit(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
        function handleHapus(): void {
            if (dataDetailDlg.nodes.length > 0) {
                const hasEmptyFields = dataDetailDlg.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');
                if (hasEmptyFields === true && dataDetailDlg.nodes.length === 1) {
                    // console.log(hasEmptyFields);
                    swal.fire({
                        html: "<span style='color: gray; font-weight: bold;'>Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.</span>",
                        icon: 'error',
                    });
                } else if (idRowRemove > 0) {
                    swal.fire({
                        title: `Hapus Data Barang Rows Id ${idRowRemove} ?`,
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        // cancelButtonText: 'Batal',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let a = dataDetailDlg.nodes.filter((node: any) => node.id_mpb !== idRowRemove);
                            setDataDetailDlg((state: any) => ({
                                ...state,
                                nodes: state.nodes.filter((node: any) => node.id_mpb !== idRowRemove),
                            }));

                            detailBaru(a);
                            //console.log(a.length);

                            if (a.length === 0) {
                                const id = dataDetailDlg.nodes.length + 1;

                                const gridMpbBaru = {
                                    id: id,
                                    id_mpb: id,
                                    no_item: '',
                                    diskripsi: '',
                                    satuan: '',
                                    ket: '',
                                    berat: 0,
                                    no_dok: '',
                                    no_sj: '',
                                    tgl_sj: '',
                                    // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
                                };

                                if (a.length === 0) {
                                    let a = [gridMpbBaru];
                                    detailBaru(a);
                                } else {
                                    alert('Harap isi detail sebelum tambah data');
                                }
                            }

                            // if (dataDetailDlg.nodes.length <= 1) {
                            //     // console.log('masuk');
                            //     const id = dataDetailDlg.nodes.length + 1;

                            //     const gridMpbBaru = {
                            //         id: id,
                            //         id_mpb: id,
                            //         no_item: '',
                            //         diskripsi: '',
                            //         satuan: '',
                            //         ket: '',
                            //         berat: 0,
                            //         no_dok: '',
                            //         no_sj: '',
                            //         tgl_sj: '',
                            //         // moment().format('DD-MM-YYYY'), //moment().format('DD-MM-YYYY HH:mm:ss'),
                            //     };

                            //     if (a.length === 0) {
                            //         setDataDetailDlg((state: any) => ({
                            //             ...state,
                            //             nodes: state.nodes.concat(gridMpbBaru),
                            //         }));
                            //     } else {
                            //         alert('Harap isi detail sebelum tambah data');
                            //     }

                            //     // const fieldKosong = dataDetailDlg.nodes.some((row: { diskripsi: string }) => row.diskripsi === '');
                            //     //  const fieldKosong = a.some((row: { diskripsi: string }) => row.diskripsi === '');

                            //     // if (!fieldKosong) {
                            //     //     setDataDetailDlg((state: any) => ({
                            //     //         ...state,
                            //     //         nodes: state.nodes.concat(gridMpbBaru),
                            //     //     }));
                            //     // } else {
                            //     //     alert('Harap isi detail sebelum tambah data');
                            //     // }
                            // }
                        }
                    });
                } else {
                    swal.fire({
                        title: `Hapus Semua Data Barang ?`,
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        // cancelButtonText: 'Batal',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setDataDetailDlg((state: any) => ({
                                ...state,
                                nodes: [],
                            }));
                            tombolBaruGrid();
                            // setButtonDisabled(false);
                        }
                    });
                }
            }
        }
        // console.log('idRowRemove ' + idRowRemove);
        return (
            <div className="mb-1 flex" style={{ marginLeft: '55%' }}>
                {/* buton klik tambah baru */}
                <button title="Hapus Barang" type="submit" onClick={handleHapus} style={{ display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                </button>
                {/* <button title="Hapus Barang" type="submit" style={{ display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                </button> */}
            </div>
            // <div className="flex flex-wrap gap-2">
            //     <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            //     {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
            // </div>
        );
    };
    // console.log('dataDetailDlg');
    // console.log(dataDetailDlg);
    const handleFocus = (event: any) => event.target.select();
    return (
        <div>
            {/* <div className="mb-1 flex" style={{ marginLeft: '95%' }}> */}

            <GridComponent
                id="gridDetailMPB"
                name="gridDetailMPB"
                className="gridDetailMPB"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                rowHeight={23}
                ref={gridDetailMPB}
                height={200} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    newRowPosition: 'Bottom',
                }}
                actionComplete={actionCompleteHandle}
                allowKeyboard={false}
                rowSelecting={rowSelectingBarangbarang}
            >
                <ColumnsDirective>
                    <ColumnDirective field="id_mpb" isPrimaryKey={true} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" allowEditing={false} width={80} visible={false} />
                    <ColumnDirective field="no_item" editTemplate={EditTemplateNoItem} headerText="No. Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={110} />
                    <ColumnDirective
                        field="diskripsi"
                        editTemplate={EditTemplateNamaItem}
                        headerText="Nama Barang"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        width={170}
                    />
                    <ColumnDirective field="satuan" headerText="Satuan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    <ColumnDirective field="qty" format={'N2'} headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" width={80} />
                    <ColumnDirective field="ket" headerText="Keterangan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={140} />
                    <ColumnDirective field="berat" headerText="berat (KG)" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={100} />
                    <ColumnDirective field="no_dok" headerText="No Ref" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={130} />
                    <ColumnDirective field="no_sj" headerText="No. SJ Supplier" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={130} />
                    <ColumnDirective field="tgl_sj" headerText="Tgl. SJ Supplier" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={100} />
                </ColumnsDirective>

                <Inject services={[Page, Selection, Edit, CommandColumn, Resize]} />
            </GridComponent>
            <div className="mt-3 flex items-center justify-start gap-3">
                <ButtonComponent
                    id="buAddBarang"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-primary e-small"
                    iconCss="e-icons e-small e-plus"
                    onClick={() => addBarangCustomer('new')}
                />
                <ButtonComponent
                    id="buSingleDeleteBarang"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-warning e-small"
                    iconCss="e-icons e-small e-trash"
                    onClick={() => deleteBarangbarang()}
                />
                <ButtonComponent
                    id="buDeleteAllBarang"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-danger e-small"
                    iconCss="e-icons e-small e-erase"
                    onClick={() => deleteAllBarangbarang()}
                />
            </div>
            <ModalDlgLpb
                isOpen={dlgLpb}
                onClose={() => setDlgLpb(false)}
                onSelectData={(dataObject: any) => {
                    ambilDariLpbDlgBatch(dataObject);
                }}
                onSelectBatch={(dataObject: any) => {
                    ambilDariLpbDlgBatch(dataObject);
                }}
                kode_entitas={kode_entitas}
                kodeSupp={kodeSupp}
                kodeGudang={kodeGudang}
                kodeMpb={kode_mpb}
            />
        </div>
    );
}

export { getServerSideProps };
