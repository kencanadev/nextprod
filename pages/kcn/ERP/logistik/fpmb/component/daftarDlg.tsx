import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
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
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { fetchFilterItems, selectFilterItems } from '../api/api';
import { myAlertGlobal } from '@/utils/global/fungsi';

interface DaftarDlgProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: any;
    onRefreshTipe: any;
    selectedData: any;
}

const DaftarDlg: React.FC<DaftarDlgProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, selectedData }) => {
    let dgDialog: Grid | any;

    const [selectedItem, setSelectedItem] = useState([]);
    const [filterItems, setFilterItems] = useState<string[]>([]);
    const data: any = [{ id: 1, noBarang: '1080144', deskripsi: '8 STD SNI TP280', jumlahBatang: 200, berat: 4.27, timbang: 'N', hasil: 'N', rencek: 'N', finalisasi: 'N' }];
    const jenisDialog = stateDokumen?.jenisPengajuan == 0 ? 'FPMBKG' : stateDokumen?.jenisPengajuan == 1 ? 'FPMBLKG' : 'FPMBLKL';
    const [selectedDataDlg, setSelectedDataDlg] = useState<any>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleViewItem = async () => {
        setIsLoading(true);
        try {
            await fetchFilterItems(setFilterItems, stateDokumen?.kode_entitas, jenisDialog, stateDokumen?.token);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleViewItem(); // Fetch data when dialog opens
        }
    }, [isOpen]);

    const renderFilterItems = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-4">
                    <div className="w-full max-w-sm">
                        <div className="h-2.5 rounded-full bg-gray-200">
                            <div className="h-2.5 animate-[loading_1s_ease-in-out_infinite] rounded-full bg-blue-600" style={{ width: '100%' }}></div>
                        </div>
                        <p className="mt-2 text-center text-sm text-gray-600">Loading data...</p>
                    </div>
                </div>
            );
        }

        return filterItems.map((item: any) => (
            <li key={item.no_mb} className="cursor-pointer border-b border-gray-400 p-1" onClick={() => handleFilterClick(item)}>
                {item.no_mb}
            </li>
        ));
    };

    const handleFilterClick = async (item: any) => {
        const data = await selectFilterItems(stateDokumen?.kode_entitas, item.no_mb, stateDokumen?.token).then((result) => {
            // console.log('data dari dialog', result);
            setSelectedItem(result);
        });
    };

    const sampleContainer = {
        maxHeight: '500px',
    };

    const handlePilih = async () => {
        if (selectedItem.length > 0) {
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            // Your existing search logic
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <DialogComponent
                id="frmFpmb"
                isModal={true}
                width="50%"
                height="45%"
                visible={isOpen}
                close={() => {
                    // dialogClose();
                }}
                target="#frmFpmb"
                closeOnEscape={false}
                allowDragging={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                position={{ X: 'center', Y: 'top' }}
                resizeHandles={['All']}

                // enableResize={true}
                // buttons={buttonInputData}
            >
                <div>
                    {/* <div className="mx-auto mt-auto max-w-5xl rounded border border-gray-400 bg-gray-100"> */}
                    <div className="border-b border-gray-400 bg-gray-300 p-2">
                        <h1 className="text-lg font-bold">Daftar Hasil Timbang & Rencek</h1>
                    </div>

                    <div className="flex">
                        <div className="w-1/4 border-r border-gray-400">
                            <div className="border-b border-gray-400 bg-gray-300 p-2">
                                <input type="text" placeholder="Filter" className="w-full rounded border border-gray-400 p-1" />
                            </div>

                            <div id="inputFilter" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <ul className="p-2">{renderFilterItems()}</ul>
                            </div>
                        </div>
                        <div className="w-3/4">
                            <div className="p-2">
                                {selectedItem && (
                                    <GridComponent
                                        id="dgDialog"
                                        ref={(g) => (dgDialog = g)}
                                        gridLines={'Both'}
                                        // dataSource={[selectedItem]}
                                        dataSource={selectedItem}
                                        allowPaging={false}
                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                        rowSelecting={(args: any) => {
                                            setSelectedDataDlg(args.data);
                                        }}
                                        recordDoubleClick={(args: any) => {
                                            if (dgDialog) {
                                                const rowIndex: number = args.row.rowIndex;
                                                const selectedItems = args.rowData;
                                                dgDialog.selectRow(rowIndex);
                                                setSelectedDataDlg(selectedItems);
                                                selectedData(selectedItems);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <ColumnsDirective>
                                            <ColumnDirective field="id_mb" headerText="ID. MB" width="100" textAlign="Center" />
                                            <ColumnDirective field="no_item" headerText="No. Barang" width="100" textAlign="Center" />
                                            <ColumnDirective field="nama_item" headerText="Deskripsi" width="200" textAlign="Center" />
                                            <ColumnDirective field="qty_std" headerText="Jumlah Batang" width="100" textAlign="Center" />
                                            <ColumnDirective field="berat" headerText="Berat (kg)" width="100" textAlign="Center" />
                                            <ColumnDirective field="timbang" headerText="timbang" width="100" textAlign="Center" />
                                            <ColumnDirective field="hasil" headerText="hasil" width="100" textAlign="Center" />
                                            <ColumnDirective field="rencek" headerText="rencek" width="100" textAlign="Center" />
                                            <ColumnDirective field="finalisasi" headerText="finalisasi" width="100" textAlign="Center" />
                                        </ColumnsDirective>
                                    </GridComponent>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-400 p-2">
                        <ButtonComponent
                            id="buPilih"
                            content="Pilih"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                if (selectedDataDlg) {
                                    selectedData(selectedDataDlg);
                                    onClose();
                                } else {
                                    myAlertGlobal(`Silahkan pilih akun terlebih dulu.`, 'frmBOKDlg');
                                }
                            }}
                        />
                        <ButtonComponent
                            id="buClose"
                            content="Batal"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => onClose()}
                        />
                    </div>
                </div>
            </DialogComponent>
        </div>
    );
};

export default DaftarDlg;
