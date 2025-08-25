import { Tab } from '@headlessui/react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

import React, { useRef, useState } from 'react';
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
} from '@syncfusion/ej2-react-grids';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, UploaderComponent } from '@syncfusion/ej2-react-inputs';
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

import { ButtonPropsModel } from '@syncfusion/ej2/popups';
import moment from 'moment';
import { generateNU } from '@/utils/routines';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { faSearchMinus, faSearchPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TabComponent } from '@syncfusion/ej2-react-navigations';

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

let dgHasilTimbang: Grid | any;
let dgPatah: Grid | any;
let buttonInputData: ButtonPropsModel[];

const FrmFpmb: React.FC<FrmFpmbProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, isFilePendukung }) => {
    // console.log('stateDokumen', stateDokumen);
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

    const [rencekState, setRencekState] = useState({
        kode_rencek: '',
        dokumen: '',
        kode_dokumen_reff: '',
        no_dokumen_reff: '',
        id_dokumen: '',
        tgl_do: moment().format('YYYY-MM-DD HH:mm:ss'),
        tgl_sampai_gudang: moment().format('YYYY-MM-DD HH:mm:ss'),
        tgl_selesai_hitung: moment().format('YYYY-MM-DD HH:mm:ss'),
        nopol: '',
        nama_ekspedisi: '',
        pabrik_asal: '',
        kode_item: '',
        nama_barang: '',
        qty_sj: '',
        qty_utuh: '',
        qty_kurang: '',
        qty_patah: '',
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
    });
    const [fpmbState, setFpmbState] = useState({
        kode_fpm: '',
        no_fpmb: noDok,
        kode_mb: '',
        no_mb: '',
        tgl_fpmb: moment().format('YYYY-MM-DD HH:mm:ss'),
        entitas: stateDokumen?.kode_entitas,
        pengajuan: stateDokumen?.tipePengajuan,
        tgl_pengajuan: moment().format('YYYY-MM-DD HH:mm:ss'),
        user_pengajuan: stateDokumen?.userid,
        approval: '',
        tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
        user_approval: stateDokumen?.userid,
        jenis_pengajuan: stateDokumen?.jenisPengajuan,
        jenis_fpmb: stateDokumen?.jenisFpmb,
        tgl_do_sj: moment().format('YYYY-MM-DD HH:mm:ss'),
    });

    // console.log('stateDokumen?.jenisPengajuan ', stateDokumen?.jenisPengajuan);
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
    };

    const [modalPreview, setModalPreview] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0.5);
    const [modalSource, setModalSource] = useState('');
    const [jsonImageEdit, setJsonImageEdit] = useState([]);

    const [objekImage, setObjekImage] = useState<any>({
        preview: null,
        preview2: null,
        preview3: null,
        preview4: null,
        nameImage: null,
        nameImage2: null,
        nameImage3: null,
        nameImage4: null,
        selectedHead: '1',
    });

    const dialogClose = async () => {
        // await stateBaru();
        setObjekImage({
            preview: null,
            preview2: null,
            preview3: null,
            preview4: null,
            nameImage: null,
            nameImage2: null,
            nameImage3: null,
            nameImage4: null,
            selectedHead: '1',
        });
        onClose();
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
                        <div className="text-lg font-bold">&lt;FPMB Mobil Ekspedisi&gt;</div>
                        {/* <div className="text-lg font-bold">Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Ekspedisi</div> */}
                        {stateDokumen?.jenisPengajuan === '0'
                            ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Ekspedisi (KG)'
                            : stateDokumen?.jenisPengajuan === '1'
                            ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Sendiri / Customer Kirim Gudang (MKG)'
                            : stateDokumen?.jenisPengajuan === '2'
                            ? 'Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Sendiri / Customer Kirim Langsung (MKL)'
                            : ''}
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                                <label className="mr-2 text-sm">Tanggal Pengajuan</label>
                                <DatePickerComponent
                                    locale="tglDo"
                                    cssClass="e-custom-style flex-1 border border-gray-300"
                                    style={{ border: '1px solid #D1D5DB' }}
                                    showClearButton={false}
                                    format="dd-MM-yyyy"
                                    value={moment(rencekState.tgl_do).toDate()}
                                    disabled={true}
                                ></DatePickerComponent>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                                <label className="mr-2 text-sm">No. Pengajuan</label>
                                <input type="text" className="border border-gray-300 p-1" value="1287.1217.00001" readOnly />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Tab.Group>
                            <Tab.List className="flex border-b">
                                <Tab as={React.Fragment}>
                                    {({ selected }) => (
                                        <button className={`mr-1 px-4 py-2 font-semibold ${selected ? 'bg-gray-200 text-blue-700' : 'bg-white text-blue-700 hover:text-blue-800'}`}>
                                            Hasil Rencek
                                        </button>
                                    )}
                                </Tab>
                                <Tab as={React.Fragment}>
                                    {({ selected }) => (
                                        <button className={`mr-1 px-4 py-2 font-semibold ${selected ? 'bg-gray-200 text-blue-700' : 'bg-white text-blue-700 hover:text-blue-800'}`}>
                                            File Pendukung
                                        </button>
                                    )}
                                </Tab>
                                <Tab as={React.Fragment}>
                                    {({ selected }) => (
                                        <button className={`mr-1 px-4 py-2 font-semibold ${selected ? 'bg-gray-200 text-blue-700' : 'bg-white text-blue-700 hover:text-blue-800'}`}>
                                            Hasil Timbang
                                        </button>
                                    )}
                                </Tab>
                            </Tab.List>
                            <Tab.Panels>
                                {/* TAB HASIL RENCEK */}
                                <Tab.Panel>
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1 overflow-auto">
                                            <div className="grid w-full grid-cols-12 gap-3 border-b p-1">
                                                <div className="col-span-4 flex flex-col">
                                                    <div className="text-sm font-bold">DATA HASIL TIMBANG</div>
                                                    <div id="grid">
                                                        <GridComponent
                                                            id="gridListData"
                                                            locale="id"
                                                            ref={(g: any) => (dgHasilTimbang = g)}
                                                            allowExcelExport={true}
                                                            loadingIndicator={{ indicatorType: 'Spinner' }}
                                                            allowPdfExport={true}
                                                            editSettings={{ allowDeleting: true }}
                                                            selectionSettings={{
                                                                mode: 'Row',
                                                                type: 'Single',
                                                            }}
                                                            allowPaging={true}
                                                            allowSorting={true}
                                                            allowFiltering={false}
                                                            allowResizing={true}
                                                            autoFit={true}
                                                            allowReordering={true}
                                                            pageSettings={{
                                                                pageSize: 25,
                                                                pageCount: 5,
                                                                pageSizes: ['25', '50', '100', 'All'],
                                                            }}
                                                            rowHeight={22}
                                                            width={'100%'}
                                                            height={245}
                                                            gridLines={'Both'}
                                                            // queryCellInfo={queryCellInfoListData}
                                                            // rowDataBound={rowDataBoundListData}

                                                            // recordDoubleClick={async (args: any) => {
                                                            //     if (dgHasilTimbang) {
                                                            //         // console.log('masuk sini');
                                                            //         const rowIndex: number = args.row.rowIndex;
                                                            //         dgHasilTimbang.selectRow(rowIndex);
                                                            //         showEditRecord('Edit Biasa');
                                                            //     }
                                                            // }}
                                                            // rowSelected={async (args: any) => {
                                                            //     // await HandleRowSelected(args, setSelectedRowKodeDok);
                                                            //     setDetailListPraBkk({
                                                            //         ...detailListPraBkk,
                                                            //         no_dokumen: args.data?.no_dokumen,
                                                            //         tgl_dokumen: moment(args.data?.tgl_dokumen).format('YYYY-MM-DD'),
                                                            //     });
                                                            //     HandleRowSelected(args, setSelectedRowKodeDok);
                                                            //     ListDetailDok(args.data?.kode_dokumen, stateDokumen?.jenisTab, stateDokumen?.kode_entitas, setDetailDok, stateDokumen?.token);
                                                            // }}
                                                        >
                                                            <ColumnsDirective>
                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="no_item"
                                                                    headerText="No. Barang"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip" /*freeze="Left"*/
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
                                                                    textAlign="Center"
                                                                    //autoFit
                                                                    width="50"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    field="total_berat"
                                                                    allowEditing={false}
                                                                    headerText="Berat (Kg)"
                                                                    // format={formatFloat}
                                                                    headerTextAlign="Center"
                                                                    textAlign="Right"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="hasil"
                                                                    headerText="Proses Timbang"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="timbang"
                                                                    headerText="Hasil Timbang (Kg)"
                                                                    // format={formatFloat}
                                                                    headerTextAlign="Center"
                                                                    textAlign="Right"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="finalisasi"
                                                                    headerText="Final Timbang"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                                />

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="rencek"
                                                                    headerText="Hasil Rencek"
                                                                    // format={formatFloat}
                                                                    headerTextAlign="Center"
                                                                    textAlign="Right"
                                                                    //autoFit
                                                                    width="110"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                            </ColumnsDirective>
                                                            {/* <Inject services={[Page, Toolbar]} /> */}
                                                            <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, /*Freeze,*/ ExcelExport, PdfExport]} />
                                                        </GridComponent>
                                                    </div>

                                                    <div className="text-sm font-bold">KETERANGAN KOREKSI</div>
                                                    <textarea className="h-24 w-full border border-gray-300 p-2"></textarea>
                                                </div>
                                                <div className="col-span-4 flex flex-col">
                                                    <form className="space-y-1">
                                                        <div className="flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">No. Rencek</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">No. MB</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Tanggal DO / SJ</div>
                                                            <DatePickerComponent
                                                                locale="tglDo"
                                                                cssClass="e-custom-style flex-1 border border-gray-300"
                                                                style={{ border: '1px solid #D1D5DB' }}
                                                                // renderDayCell={onRenderDayCell}
                                                                // enableMask={true}
                                                                // maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                showClearButton={true}
                                                                format="dd-MM-yyyy"
                                                                value={moment(rencekState.tgl_do).toDate()}
                                                                // change={(args: ChangeEventArgsCalendar) => {
                                                                //     HandleTgl(moment(args.value), 'tanggalAwal', settglAwal, settglAkhir, setIsTanggalChecked);
                                                                // }}
                                                            >
                                                                <Inject services={[MaskedDateTime]} />
                                                            </DatePickerComponent>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Tanggal Barang Sampai ke Gudang</div>
                                                            <DatePickerComponent
                                                                locale="tglSampaiGudang"
                                                                cssClass="e-custom-style flex-1 border border-gray-300"
                                                                style={{ border: '1px solid #D1D5DB' }}
                                                                // renderDayCell={onRenderDayCell}
                                                                // enableMask={true}
                                                                // maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                // showClearButton={false}
                                                                format="dd-MM-yyyy"
                                                                value={moment(rencekState.tgl_sampai_gudang).toDate()}
                                                                // change={(args: ChangeEventArgsCalendar) => {
                                                                //     HandleTgl(moment(args.value), 'tanggalAwal', settglAwal, settglAkhir, setIsTanggalChecked);
                                                                // }}
                                                            >
                                                                <Inject services={[MaskedDateTime]} />
                                                            </DatePickerComponent>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Tanggal Barang Selesai di Hitung</div>
                                                            <DatePickerComponent
                                                                locale="tglSelesaiHitung"
                                                                cssClass="e-custom-style flex-1 border border-gray-300"
                                                                style={{ border: '1px solid #D1D5DB' }}
                                                                // renderDayCell={onRenderDayCell}
                                                                // enableMask={true}
                                                                // maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                // showClearButton={false}
                                                                format="dd-MM-yyyy"
                                                                value={moment(rencekState.tgl_selesai_hitung).toDate()}
                                                                // change={(args: ChangeEventArgsCalendar) => {
                                                                //     HandleTgl(moment(args.value), 'tanggalAwal', settglAwal, settglAkhir, setIsTanggalChecked);
                                                                // }}
                                                            >
                                                                <Inject services={[MaskedDateTime]} />
                                                            </DatePickerComponent>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">No. Polisi</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Nama Ekspedisi</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Pabrik Asal</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                    </form>

                                                    <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                                    <form className="space-y-1">
                                                        <div className="flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">No. Rencek</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Nama barang</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Quantity di SJ</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                        <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                                        <div className="mt-4 text-sm font-bold">HASIL HITUNG</div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Barang Utuh</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Barang Kurang (yang fisiknya tidak ada)</div>
                                                            <input type="text" className="flex-1 border border-gray-300 bg-yellow-200 p-2" />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Barang Patah (yang fisiknya kurang dari 12m)</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                            <span className="ml-1 self-center">Batang</span>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="text-sm font-bold">Barang Patah (yang fisiknya kurang dari 12m) Terdiri dari :</div>
                                                    <div className="text-xs italic">(Isi kolom dibawah dalam satuan meter)</div>
                                                    <div id="brokenGrid">
                                                        <GridComponent
                                                            id="gridListData"
                                                            locale="id"
                                                            ref={(g: any) => (dgHasilTimbang = g)}
                                                            allowExcelExport={true}
                                                            loadingIndicator={{ indicatorType: 'Spinner' }}
                                                            allowPdfExport={true}
                                                            editSettings={{ allowDeleting: true }}
                                                            selectionSettings={{
                                                                mode: 'Row',
                                                                type: 'Single',
                                                            }}
                                                            allowPaging={true}
                                                            allowSorting={true}
                                                            allowFiltering={false}
                                                            allowResizing={true}
                                                            autoFit={true}
                                                            allowReordering={true}
                                                            pageSettings={{
                                                                pageSize: 25,
                                                                pageCount: 5,
                                                                pageSizes: ['25', '50', '100', 'All'],
                                                            }}
                                                            rowHeight={22}
                                                            width={'100%'}
                                                            height={245}
                                                            gridLines={'Both'}
                                                            // queryCellInfo={queryCellInfoListData}
                                                            // rowDataBound={rowDataBoundListData}

                                                            // recordDoubleClick={async (args: any) => {
                                                            //     if (dgHasilTimbang) {
                                                            //         // console.log('masuk sini');
                                                            //         const rowIndex: number = args.row.rowIndex;
                                                            //         dgHasilTimbang.selectRow(rowIndex);
                                                            //         showEditRecord('Edit Biasa');
                                                            //     }
                                                            // }}
                                                            // rowSelected={async (args: any) => {
                                                            //     // await HandleRowSelected(args, setSelectedRowKodeDok);
                                                            //     setDetailListPraBkk({
                                                            //         ...detailListPraBkk,
                                                            //         no_dokumen: args.data?.no_dokumen,
                                                            //         tgl_dokumen: moment(args.data?.tgl_dokumen).format('YYYY-MM-DD'),
                                                            //     });
                                                            //     HandleRowSelected(args, setSelectedRowKodeDok);
                                                            //     ListDetailDok(args.data?.kode_dokumen, stateDokumen?.jenisTab, stateDokumen?.kode_entitas, setDetailDok, stateDokumen?.token);
                                                            // }}
                                                        >
                                                            <ColumnsDirective>
                                                                {/* <ColumnDirective
                                                            allowEditing={false}
                                                            field="kode_rencek"
                                                            headerText="No. Barang"
                                                            headerTextAlign="Center"
                                                            textAlign="Center"
                                                            width="110"
                                                            clipMode="EllipsisWithTooltip"
                                                        /> */}

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="id_patah"
                                                                    headerText="ID Patah"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    width="200"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    allowEditing={false}
                                                                    field="panjang_patah"
                                                                    headerText="Panajang Patah (m)"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    width="50"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                            </ColumnsDirective>

                                                            <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                                        </GridComponent>
                                                    </div>
                                                    <form className="mt-2 space-y-1">
                                                        <div className="flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Total Panjang Patahan</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                            <span className="ml-1 self-center">m</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center">
                                                            <div className="mr-2 w-1/3 text-xs font-bold">Total Barang Patah</div>
                                                            <input type="text" className="flex-1 border border-gray-300 p-2" />
                                                            <span className="ml-1 self-center">Batang (total panjang dibagi 12)</span>
                                                        </div>
                                                    </form>
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
                                                <ButtonComponent
                                                    id="buKoreksi"
                                                    content="Koreksi"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-edit"
                                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                                    onClick={() => dialogClose()}
                                                />
                                                <ButtonComponent
                                                    id="buSimpan"
                                                    content="Simpan"
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-save"
                                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                                    onClick={() => onClose()}
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
                                                    onClick={() => onClose()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* TAB FILE PENDUKUNG */}
                                <Tab.Panel>
                                    <div className="flex h-full flex-col">
                                        <div className="mb-2 flex-1 overflow-auto">
                                            <div className="mt-4">
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
                                                            // handleRemove(objekImage?.selectedHead, objekImage, stateObjekImage);
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
                                                            // handleRemove('all', objekImage, stateObjekImage);
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
                                                            // console.log('objekImage?.selectedHead ', objekImage?.selectedHead);
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
                                                                <Image
                                                                    src={
                                                                        objekImage?.selectedHead === '1'
                                                                            ? objekImage?.preview
                                                                            : objekImage?.selectedHead === '2'
                                                                            ? objekImage?.preview2
                                                                            : objekImage?.selectedHead === '3'
                                                                            ? objekImage?.preview3
                                                                            : objekImage?.selectedHead === '4'
                                                                            ? objekImage?.preview4
                                                                            : null
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
                                                                setObjekImage({
                                                                    ...objekImage,
                                                                    selectedHead: '2',
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
                                                                        // selected={(e) => handleFileSelect(e, '1', imageState, setImageState)}
                                                                        // removing={() => handleRemove('1', imageState, setImageState)}
                                                                        selected={async (e: any) => {
                                                                            // await handleFileSelect(e, '1', objekImage, stateObjekImage);
                                                                        }}
                                                                        // removing={() => handleRemove('1', objekImage, stateObjekImage)}
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
                                                                            // await handleFileSelect(e, '2', objekImage, stateObjekImage);
                                                                        }}
                                                                        // removing={() => handleRemove('2', objekImage, stateObjekImage)}
                                                                    />
                                                                </div>
                                                                {/* {imageState.preview2 && (
                                            <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                <Image src={imageState.preview2} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} />
                                            </div>
                                        )} */}
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
                                                                            // await handleFileSelect(e, '3', objekImage, stateObjekImage);
                                                                        }}
                                                                        // removing={() => handleRemove('3', objekImage, stateObjekImage)}
                                                                    />
                                                                </div>
                                                                {/* {imageState.preview3 && (
                                            <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                <Image src={imageState.preview3} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} />
                                            </div>
                                        )} */}
                                                                {objekImage?.preview3 && (
                                                                    <div style={{ marginTop: 0, marginLeft: 20, border: '3px solid #dedede', borderRadius: 5 }} className="preview">
                                                                        <Image src={objekImage?.preview3} alt="Large Image" width={300} height={300} style={{ width: '100%', height: '300px' }} />
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
                                    <div className="mt-2 flex-1" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 10 }}>
                                        <div className="space-x-2">
                                            <ButtonComponent
                                                id="buBatal"
                                                // className="p-2 text-white"
                                                content="Tutup"
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-close"
                                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                                onClick={() => onClose()}
                                            />
                                            <ButtonComponent
                                                id="buKoreksi"
                                                content="Koreksi"
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-edit"
                                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                                onClick={() => onClose()}
                                            />
                                            <ButtonComponent
                                                id="buSimpan"
                                                content="Simpan"
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-save"
                                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                                onClick={() => onClose()}
                                            />
                                            <ButtonComponent
                                                id="buDlg"
                                                content={konten} //"Daftar Rencek"
                                                cssClass="e-primary e-small"
                                                iconCss="e-icons e-small e-table-of-content"
                                                style={buttonStyleDlg}
                                                onClick={() => onClose()}
                                            />
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* TAB HASIL HASIL TIMBANG */}
                                <Tab.Panel>
                                    <div className="mt-4">Hasil Timbang Content</div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </DialogComponent>
        </div>
    );
};

export default FrmFpmb;
