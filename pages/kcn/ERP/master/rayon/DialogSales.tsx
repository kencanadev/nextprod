import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import axios from 'axios';
import { HandleSearchPengemudi } from './function/function';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';

export default function DialogSales({
    apiUrl,
    kode_entitas,
    visible,
    onClose,
    token,
    setHeaderDialogState,
    selectedRowIndexRekeningbarang,
}: {
    apiUrl: string;
    kode_entitas: string;
    visible: boolean;
    onClose: Function;
    token: string;
    setHeaderDialogState: any;
    selectedRowIndexRekeningbarang: any;
}) {
    const header = 'List Salesman';
    const { sessionData } = useSession();
    const userid = sessionData?.userid ?? '';
    const gridPengemudi = useRef<any>(null);
    const [dialogListPengemudi, setDialogListPengemudi] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [searchPengemudi, setSearchPengemudi] = useState('');
    const [originalDataSource, setOriginalDataSource] = useState([]);

    const refreshData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/salesman?entitas=${kode_entitas}&param1=Y&param2=all&param3=N&param4&param5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDialogListPengemudi(response.data.data);
            setOriginalDataSource(response.data.data);
            setSelectedRow(response.data.data[0]);
        } catch (error) {}
    };
    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        const dialogElement = document.getElementById('dialogListPengemudi');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);
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
    const hanldeRecordDoubleClick = (args: any) => {
        console.log('selectedRow', selectedRow);

        setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang] = {
            ...setHeaderDialogState.current.dataSource[selectedRowIndexRekeningbarang],
            kode_sub_area: selectedRow.kode_sales,
            nama_sales: selectedRow.nama_sales,
            subarea: null,
            sublokasi: null,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            userid: userid.toUpperCase(),
        };
        setHeaderDialogState.current.refresh();

        onClose();
    };
    return (
        <DialogComponent
            id="dialogListPengemudi"
            isModal={true}
            width="80%"
            height={400}
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
                <div className="flex h-[70%] w-full flex-col justify-items-start">
                    <input
                        type="text"
                        id="number-input"
                        className={`w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 `}
                        placeholder={formatString('search_Pengemudi')}
                        name="jenis_perbaikan"
                        value={searchPengemudi} // Format hanya saat blur
                        onChange={(e) => {
                            HandleSearchPengemudi(e.target.value, setSearchPengemudi, setDialogListPengemudi, originalDataSource);
                        }}
                        autoComplete="off"
                    />
                </div>
                <GridComponent
                    id="gridAkun"
                    name="gridAkun"
                    className="gridAkun"
                    locale="id"
                    dataSource={dialogListPengemudi}
                    rowSelecting={handleSelect}
                    recordDoubleClick={hanldeRecordDoubleClick}
                    ref={gridPengemudi}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    rowHeight={22}
                    gridLines={'Both'}
                    height={'240'} // Tinggi grid dalam piksel /
                >
                    <ColumnsDirective>
                        <ColumnDirective field="nama_sales" headerText="nama_sales" headerTextAlign="Center" textAlign="Left" width={80} />
                    </ColumnsDirective>

                    <Inject services={[Selection, CommandColumn, Toolbar, Resize]} />
                </GridComponent>
                <div className="flex h-[30%] w-full justify-end gap-3 py-2">
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
