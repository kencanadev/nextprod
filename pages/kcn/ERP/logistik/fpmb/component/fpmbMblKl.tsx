import { Tab } from '@headlessui/react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

import React, { useState } from 'react';
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
import { ButtonPropsModel } from '@syncfusion/ej2/popups';

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

buttonInputData = [
    {
        buttonModel: {
            content: 'Simpan',
            cssClass: 'e-danger e-small',
            // isPrimary: true,
        },
        isFlat: false,
        // click: closeDialogMkForm,
    },
    {
        buttonModel: {
            content: 'Koreksi',
            cssClass: 'e-danger e-small',
            // isPrimary: true,
        },
        isFlat: false,
        // click: closeDialogMkForm,
    },
    {
        buttonModel: {
            content: 'Tutup',
            cssClass: 'e-danger e-small',
            // isPrimary: true,
        },
        isFlat: false,
        // click: closeDialogMkForm,
    },
];

const FrmFpmbMblKl: React.FC<FrmFpmbProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, isFilePendukung }) => {
    const dialogClose = async () => {
        // await stateBaru();
        // setImageState({
        //     preview: null,
        //     preview2: null,
        //     preview3: null,
        //     preview4: null,
        //     nameImage: null,
        //     nameImage2: null,
        //     nameImage3: null,
        //     nameImage4: null,
        //     selectedHead: '1',
        // });
        // onClose();
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
                showCloseIcon={true}
                target="#fpmbList"
                closeOnEscape={false}
                allowDragging={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                // style={{ maxHeight: '1800px' }}
                position={{ X: 'center', Y: 'top' }}
                resizeHandles={['All']}
                // enableResize={true}
                buttons={buttonInputData}
            >
                <div className="border border-gray-300 bg-white">
                    <div className="flex items-center justify-between bg-blue-900 p-2 text-white">
                        <div className="text-lg font-bold">&lt;FPMB Mobil Ekspedisi&gt;</div>
                        <div className="text-lg font-bold">Form Pengajuan Mutasi Barang (FPMB) - FBM Mobil Ekspedisi</div>
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm">Tanggal Pengajuan</label>
                            <input type="text" className="border border-gray-300 p-1" value="13-12-2024 14:48:05" readOnly />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm">No. Pengajuan</label>
                            <input type="text" className="border border-gray-300 p-1" value="1287.1217.00001" readOnly />
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
                                            {/*
                                            <div className="grid w-full grid-cols-12 gap-3 border-b p-1">
                                                <div className="col-span-6 flex flex-col"> */}
                                            <div className="flex items-center">
                                                <div className="mr-2 text-sm font-bold">No. Rencek</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">No. MB</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">Tanggal DO / SJ</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">Tanggal Barang Sampai ke Gudang</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">Tanggal Barang Selesai di Hitung</div>
                                                <input type="text" className="flex-1 border border-gray-300 bg-yellow-200 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">No. Polisi</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">Nama Ekspedisi</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="mr-2 text-sm font-bold">Pabrik Asal</div>
                                                <input type="text" className="flex-1 border border-gray-300 p-1" />
                                            </div>
                                            {/* </div>
                                            </div> */}
                                            <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                            <div className="flex-1">
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Nama barang</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Quantity di SJ</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">Batang</span>
                                                </div>
                                                <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>

                                                <div className="mt-4 text-sm font-bold">HASIL HITUNG</div>
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Barang Utuh</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">Batang</span>
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Barang Kurang (yang fisiknya tidak ada)</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">Batang</span>
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Barang Patah (yang fisiknya kurang dari 12m)</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">Batang</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <div className="mt-4 text-sm font-bold">Barang Patah (yang fisiknya kurang dari 12m) Terdiri dari :</div>
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
                                            <div className="flex-1">
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Total Panjang Patahan</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">m</span>
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    <div className="text-sm font-bold">Total Barang Patah</div>
                                                    <input type="text" className="ml-2 flex-1 border border-gray-300 p-1" />
                                                    <span className="self-center">Batang (total panjang dibagi 12)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex-1">
                                        <button className="border border-gray-300 bg-gray-200 p-2">Daftar Rencek</button>
                                        <div className="space-x-2">
                                            <button className="bg-green-500 p-2 text-white">Simpan</button>
                                            <button className="bg-red-500 p-2 text-white">Koreksi</button>
                                            <button className="bg-gray-500 p-2 text-white">Tutup</button>
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* TAB FILE PENDUKUNG */}
                                <Tab.Panel>
                                    <div className="mt-4">File Pendukung Content</div>
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

export default FrmFpmbMblKl;
