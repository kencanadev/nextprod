import { useEffect, useRef, useState } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, RadioButtonComponent, ChangeEventArgs as ChangeEventArgsButton, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { Filter, Search, Sort } from '@syncfusion/ej2/grids';
import axios from 'axios';
import { myAlertGlobal } from '@/utils/routines';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';

interface FrmItemDlgProps {
    isOpen: boolean;
    onClose: any;
    onBatal: any;
    selectedData: any;
    target: any;
    stateDokumen: any;
}

const ItemDlgForm = ({ isOpen, onClose, onBatal, selectedData, target, stateDokumen }: FrmItemDlgProps) => {
    // console.log('stateDokumen item dialog', stateDokumen);
    const [searchText, setSearchText] = useState('');
    const gridRef = useRef<GridComponent | null>(null);
    let dgDlgBarang: Grid | any;

    let resultFetchDataBarang: any;

    const [search, setSearch] = useState('');
    // const [listItem, setListItem] = useState([]);
    const [selectedItem, setSelectedItem] = useState<any>('');

    const onPilih = () => {
        // console.log('selectedItem', selectedItem);
        if (selectedItem) {
            selectedData(selectedItem);
            onClose();
        } else {
            myAlertGlobal('Silahkan pilih data terlebih dulu.', 'frmItemDlg');
        }
    };

    const fetchDataBarang = async () => {
        try {
            const response = await axios.get(`${stateDokumen.apiUrl}/erp/item_dlg_pre_order_cabang`, {
                params: {
                    entitas: stateDokumen.kode_entitas,
                },
                headers: { Authorization: `Bearer ${stateDokumen.token}` },
            });

            resultFetchDataBarang = response.data.data;
            // console.log('resultFetchDataBarang', resultFetchDataBarang);
            dgDlgBarang.dataSource = resultFetchDataBarang;
            // setListItem(resultFetchDataBarang);
        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    };

    const doubleClickGrid = async (args: any) => {
        if (dgDlgBarang) {
            const rowIndex: number = args.row.rowIndex;
            const selectedItems = args.rowData;
            dgDlgBarang.selectRow(rowIndex);
            setSelectedItem(selectedItems);
            selectedData(selectedItems);
            onClose();
        }
    };

    useEffect(() => {
        fetchDataBarang();
    }, [isOpen]);

    return (
        <DialogComponent
            id="frmItemDlg"
            name="frmItemDlg"
            className="frmItemDlg"
            width="400px"
            header="Daftar Barang"
            visible={isOpen}
            showCloseIcon={true}
            close={() => {
                const cari = document.getElementById('search') as HTMLInputElement;
                if (cari) {
                    cari.value = '';
                }
                setSearch('');
                setSearchText('');
                onClose();
            }}
            buttons={[
                {
                    click: () => {
                        onPilih();
                        onClose();
                    },
                    buttonModel: { content: 'OK', isPrimary: true },
                },
                { click: () => onClose(), buttonModel: { content: 'Batal' } },
            ]}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
        >
            <div className="p-2">
                <div className="mb-2 w-full rounded border border-gray-400 px-1">
                    <TextBoxComponent
                        id="search"
                        name="search"
                        className="searchtext"
                        placeholder="Cari..."
                        showClearButton={true}
                        value={searchText}
                        input={(args: ChangeEventArgsInput) => {
                            const value: any = args.value;
                            setSearchText(value);
                        }}
                        floatLabelType="Never"
                    />
                </div>
                <GridComponent
                    id="dgItemDlg"
                    ref={(g: any) => (dgDlgBarang = g)}
                    dataSource={search}
                    // ref={gridRef}
                    // dataSource={dgDlgBarang}
                    height={300}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    searchSettings={{ fields: ['no_item', 'diskripsi'], key: searchText }}
                    pageSettings={{
                        pageSize: 25,
                    }}
                    allowPaging={true}
                    allowSorting={true}
                    rowSelecting={(args: any) => {
                        setSelectedItem(args.data);
                    }}
                    recordDoubleClick={(args: any) => doubleClickGrid(args)}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="no_item" headerText="No. Barang" width="150" textAlign="Left" />
                        <ColumnDirective field="diskripsi" headerText="Nama Barang" width="250" textAlign="Left" />
                    </ColumnsDirective>
                </GridComponent>
            </div>
        </DialogComponent>
    );
};

export default ItemDlgForm;
