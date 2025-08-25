import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, Filter, FilterSettingsModel, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { HandleSearchNamakaryawan, HandleSearchNokaryawan } from '../function/function';

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

export default function DialogKaryawanBeban({
    gridPembebanan,
    visible,
    onClose,
    setHeaderDialogState,
    list_kry,
    selectedRowIndexBebanKaryawan,
    setList_karyawan,
list_karyawanOri
}: {
    gridPembebanan: any;
    visible: boolean;
    onClose: Function;
    setHeaderDialogState: any;
    list_kry: any;
    selectedRowIndexBebanKaryawan: any;
    setList_karyawan: any;
list_karyawanOri: any;
}) {
    const header = 'List Karyawan';
    const gridPengemudi = useRef<any>(null);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [searchNoKendaraan, setSearchNoKendaraan] = useState('');
    const filterSettings: FilterSettingsModel = { type: 'FilterBar', mode: 'Immediate' };
    const [headerState, setHeaderState] = useState({
        nip: '',
        nama_karyawan: '' 
    })

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)?.toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const handleSelect = (args: any) => {
        setSelectedRow(args.data);
    };
    const hanldeRecordDoubleClick = (args: any) => {
        gridPembebanan.current!.endEdit();
        const isNotEmptyNip = gridPembebanan.current.dataSource?.filter((item: any) => item.nip === args.rowData.emp_no);
        console.log('isNotEmptyNip', isNotEmptyNip);

        if (isNotEmptyNip.length !== 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#dialogListPengemudi',
                text: `Karyawan sudah ada!`,
            });
            return;
        }
        if (gridPembebanan.current!.dataSource && Array.isArray(gridPembebanan.current!.dataSource)) {
            gridPembebanan.current!.dataSource[selectedRowIndexBebanKaryawan] = {
                ...gridPembebanan.current!.dataSource[selectedRowIndexBebanKaryawan],
                nip: args.rowData.emp_no,
                nama_kry: args.rowData.Full_Name,
                kode_subledger: args.rowData.emp_id,
                jabatan: args.rowData.pos_name_th,
                emp_no: args.rowData.emp_no,
                emp_id: args.rowData.emp_id,
            };
            // gridPembebanan.dataSource[0].gd_utama = "hengdasss";
            gridPembebanan.current!.refresh();
            onClose();
        }
    };

    return (
        <DialogComponent
            id="dialogListPengemudi"
            isModal={true}
            width="60%"
            height={450}
            visible={visible}
            close={() => onClose()}
            header={header}
            showCloseIcon={true}
            target="#forDialogAndSwall"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="flex h-full w-full flex-col">
                <div className='flex gap-2 w-full h-[40px]'>

                <div className="flex  w-[30%] flex-col justify-items-start">
                    <input
                        type="text"
                        id="number-input"
                        className={`h-[full] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                        placeholder={formatString('search_NIP_Karyawan')}
                        name="jenis_perbaikan"
                        value={headerState.nip} // Format hanya saat blur
                        onChange={(e) => {
                            HandleSearchNokaryawan(e.target.value,setHeaderState,setList_karyawan,list_karyawanOri)
                        }}
                        autoComplete="off"
                    />
                </div>
                <div className="flex  w-[70%] flex-col justify-items-start">
                    <input
                        type="text"
                        id="number-input"
                        className={`h-[full] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                        placeholder={formatString('search_Nama_Karyawan')}
                        name="jenis_perbaikan"
                        value={headerState.nama_karyawan} // Format hanya saat blur
                        onChange={(e) => {
                            HandleSearchNamakaryawan(e.target.value,setHeaderState,setList_karyawan,list_karyawanOri)
                        }}
                        autoComplete="off"
                    />
                </div>
                </div>
                <GridComponent
                    // filterSettings={filterSettings}
                    // allowFiltering={true}
                    id="gridAkun"
                    name="gridAkun"
                    className="gridAkun"
                    locale="id"
                    dataSource={list_kry}
                    rowSelecting={handleSelect}
                    recordDoubleClick={hanldeRecordDoubleClick}
                    ref={gridPengemudi}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    rowHeight={22}
                    gridLines={'Both'}
                    height={'280'} // Tinggi grid dalam piksel /
                >
                    <ColumnsDirective>
                        <ColumnDirective field="emp_no" headerText="NIP" headerTextAlign="Center" textAlign="Left" width={80} isPrimaryKey />
                        <ColumnDirective field="Full_Name" headerText="Nama Karyawan" headerTextAlign="Center" textAlign="Left" width={80} />
                        <ColumnDirective field="pos_name_th" headerText="Jabatan" headerTextAlign="Center" textAlign="Left" width={80} allowFiltering={false} />
                        <ColumnDirective field="worklocation_name" headerText="Dept" headerTextAlign="Center" textAlign="Left" width={80} allowFiltering={false} />
                    </ColumnsDirective>

                    <Inject services={[Selection, CommandColumn, Toolbar, Resize, Filter]} />
                </GridComponent>
                <div className="flex h-[10%] w-full justify-end gap-3 py-2">
                    <button
                        onClick={hanldeRecordDoubleClick}
                        className={` flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        OK
                    </button>

                    <button
                        onClick={() => onClose()}
                        className={`} flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
