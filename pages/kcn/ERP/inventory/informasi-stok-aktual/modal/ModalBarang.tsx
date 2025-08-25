import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    CommandColumn,
    Inject,
    Page,
    Edit,
    Filter,
    Toolbar,
    Resize,
    Selection,
    PageSettingsModel,
    FilterSettingsModel,
} from '@syncfusion/ej2-react-grids';
import axios from 'axios';
// import { HandleSearchNamaAkun, HandleSearchNoItem } from '../function/function';

export default function ModalBarang({
    visible,
    onClose,
    setHeaderDialogState,
    setCheckboxState,
    listBarang,
    handleSearchItem,
}: {
    visible: boolean;
    onClose: Function;
    setHeaderDialogState: any;
    setCheckboxState: any;
    listBarang: any;
    handleSearchItem: any;
}) {
    const header = 'Daftar Barang';
    const pageSettings: PageSettingsModel = { pageSize: 9 };
    const filterSettings: FilterSettingsModel = { type: 'FilterBar', mode: 'Immediate' };
    const [originalDataSource, setOriginalDataSource] = useState([]);
    const gridKendaraan = useRef<any>(null);
    const [dialogListKendaraan, setDialogListAkun] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [filterBarangKeyword, setFilterBarangKeyword] = useState({
        no_item: '',
        nama_item: '',
    });
    const [searchNoItem, setSearchNoItem] = useState('');
    const [searchNamaAkun, setSearchNamaAkun] = useState('');

    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const handleSelect = (args: any) => {
        setSelectedRow(args.data);
    };
    const hanldeRecordDoubleClick = async (args: any) => {
        try {
            // console.log("get akun balance",response.data.data);

            setHeaderDialogState((oldData: any) => ({
                ...oldData,
                no_item: selectedRow.no_item,
                nama_item: selectedRow.nama_item,
                kode_barang: selectedRow.kode_item,
            }));
            setCheckboxState((oldData: any) => ({
                ...oldData,
                no_item: true,
                nama_item: true,
            }));
            // // document.getElementById('km_sebelumnya')!.focus();
            // // document.getElementById('km_sebelumnya')!.value = String(SpreadNumber(selectedRow.kmawal));
            // // document.getElementById('km_sebelumnya')!.blur();
            onClose();
        } catch (error) {}
    };

    return (
        <DialogComponent
            id="dialogListKendaraan"
            isModal={true}
            width="50%"
            height={350}
            visible={visible}
            close={() => onClose()}
            header={header}
            showCloseIcon={true}
            target="#main-target"
            closeOnEscape={false}
            allowDragging={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            position={{ X: 'center', Y: 'center' }} // Dialog berada di tengah
            style={{ position: 'fixed' }}
        >
            <div className="flex h-full w-full flex-col">
                <div className="flex gap-2">
                    <div className="mb-1 flex w-[110px] flex-col items-start">
                        <input
                            type="text"
                            id="no_item"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder={formatString('no_barang')}
                            name="no_item"
                            value={filterBarangKeyword.no_item}
                            onChange={(e) => handleSearchItem(e.target.value, 'no_item', setFilterBarangKeyword, filterBarangKeyword)}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                    </div>
                    <div className="mb-1 flex w-full flex-col items-start">
                        <input
                            type="text"
                            id="nama_item"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder={formatString('nama_barang')}
                            name="nama_item"
                            value={filterBarangKeyword.nama_item}
                            onChange={(e) => handleSearchItem(e.target.value, 'nama_item', setFilterBarangKeyword, filterBarangKeyword)}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <GridComponent
                    id="gridAkun"
                    name="gridAkun"
                    className="gridAkun"
                    locale="id"
                    dataSource={listBarang}
                    rowSelecting={handleSelect}
                    recordDoubleClick={hanldeRecordDoubleClick}
                    ref={gridKendaraan}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    rowHeight={22}
                    gridLines={'Both'}
                    height={'180'} // Tinggi grid dalam piksel /
                >
                    <ColumnsDirective>
                        <ColumnDirective field="no_item" headerText="No Barang" headerTextAlign="Center" textAlign="Center" width={80} />
                        <ColumnDirective
                            field="nama_item"
                            headerText="Nama Barang"
                            headerTextAlign="Center"
                            textAlign="Left"
                            clipMode="EllipsisWithTooltip"
                            width={'auto'}
                            // allowEditing={false}
                            // editTemplate={editTemplateNoItem}
                        />
                    </ColumnsDirective>

                    <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                </GridComponent>
                <div className="flex h-[15%] w-full justify-end gap-3 py-2">
                    <button
                        onClick={hanldeRecordDoubleClick}
                        className={` flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        OK
                    </button>

                    <button
                        onClick={() => onClose()}
                        className={`flex cursor-pointer items-center rounded-md bg-[#3a3f5c]
                        p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#787a87] `}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
