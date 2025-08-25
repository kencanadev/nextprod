import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
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
    Search,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';

import { useState, useCallback, memo, useEffect } from 'react';
import { handleDaftarBank } from '../handler/fungsi';
import { AnyTxtRecord } from 'dns';
import { myAlertGlobal } from '@/utils/global/fungsi';

interface DlgDaftarBankProps {
    isOpenModal: boolean;
    visible: boolean;
    stateDokumen: any;
    onHide: () => void;
    onClose: () => void;
    activeField: string;
    // onSelect: (bankData: any, fieldName: string) => void;
    selectedData: any;
    namaVendor: any;
    uniqId: any;
    namaBankState: any;
}

let dgListBank: Grid | any;
// const DlgDaftarBank: React.FC<DlgDaftarBankProps> = memo(({ isOpen, visible, onHide, activeField, onSelect, objekData }) => {
const DlgDaftarBank: React.FC<DlgDaftarBankProps> = ({ isOpenModal, visible, stateDokumen, onHide, onClose, activeField, selectedData, namaVendor, uniqId, namaBankState }) => {
    // console.log('namaVendor ', namaVendor);
    // const handleSelect = useCallback(
    //     (bankData: any) => {
    //         onSelect(bankData, activeField);
    //         onHide();
    //     },
    //     [activeField, onSelect, onHide]
    // );
    const [daftarbank, setDaftarBank] = useState([]);

    const [selectedDataX, setSelectedDataX] = useState<any>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                await handleDaftarBank(stateDokumen.kode_entitas, namaVendor, setDaftarBank, stateDokumen.token).then((result) => {
                    // console.log('result ', result);
                    dgListBank.dataSource = result;
                });
            } catch (error) {
                console.error('Terjadi kesalahan saat memuat data:', error);
            }
        };

        fetchData();
    }, [isOpenModal]);

    return (
        <div>
            <DialogComponent
                id="dlgDaftarBank"
                isModal={true}
                visible={isOpenModal}
                width="800px"
                height="400px"
                // target="body"
                target="#transaksiBank"
                // close={onHide}
                close={() => {
                    onClose();
                }}
                style={{
                    position: 'fixed',
                    zIndex: 9999,
                }}
                header="Daftar Bank Supplier"
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                allowDragging={true}
                closeOnEscape={true}
                showCloseIcon={true}
            >
                <div className="mb-2 w-full rounded border border-gray-400 px-1">
                    <TextBoxComponent
                        id="search"
                        name="search"
                        className="searchtext"
                        placeholder="Pencarian Data..."
                        showClearButton={true}
                        input={(args: any) => {
                            if (dgListBank) {
                                dgListBank.search(args.value);
                            }
                        }}
                        floatLabelType="Never"
                    />
                </div>

                <GridComponent
                    id="gridDlgListFj"
                    ref={(g) => (dgListBank = g)}
                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                    rowHeight={22}
                    height={200}
                    gridLines={'Both'}
                    rowSelecting={(args: any) => {
                        const modifiedData = {
                            ...args.data,
                            uniqId: uniqId,
                            namaBankState: namaBankState,
                        };
                        // console.log(modifiedData);

                        setSelectedDataX(modifiedData);
                    }}
                    recordDoubleClick={(args: any) => {
                        if (dgListBank) {
                            const rowIndex: number = args.row.rowIndex;
                            const selectedItems = args.rowData;
                            const modifiedData = {
                                ...args.rowData,
                                uniqId: uniqId,
                                namaBankState: namaBankState,
                            };
                            dgListBank.selectRow(rowIndex);
                            // console.log(modifiedData);
                            setSelectedDataX(modifiedData);
                            selectedData(modifiedData);

                            // onHide();
                            onClose();
                        }
                    }}
                    searchSettings={{
                        fields: ['nama_relasi', 'nama_bank', 'nama_rekening', 'no_rekening', 'tgl_update'],
                        operator: 'contains',
                        // key: '',
                        ignoreCase: true,
                        // immediate: true,
                    }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="nama_relasi" headerText="Nama Supplier" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="nama_bank" headerText="Nama Bank" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="nama_rekening" headerText="Nama Rekening" headerTextAlign="Center" textAlign="Left" width="150" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="no_rekening" headerText="No. Rekening" headerTextAlign="Center" textAlign="Left" width="110" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="tgl_update" headerText="Tgl. Update" headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                    </ColumnsDirective>
                    <Inject services={[Page, Toolbar, Filter, Sort, Search]} />
                </GridComponent>
                <ButtonComponent
                    id="buBatalDokumen1"
                    content="Batal"
                    cssClass="e-primary e-small"
                    style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                    onClick={() => {
                        console.log('Button clicked  onHide();');
                        onClose();
                        // onHide();
                    }}
                />
                <ButtonComponent
                    id="buPilih1"
                    content="Pilih"
                    cssClass="e-primary e-small"
                    style={{ float: 'right', width: '90px', marginTop: 20, marginRight: 10, backgroundColor: '#3b3f5c' }}
                    onClick={() => {
                        // console.log('Button clicked');
                        // console.log('selectedDataX:', selectedDataX);
                        if (selectedDataX) {
                            selectedData(selectedDataX);
                            onHide();
                        } else {
                            myAlertGlobal(`Silahkan pilih No. rekening terlebih dulu.`, 'dlgDaftarBank');
                        }
                    }}
                />
            </DialogComponent>
        </div>
    );
};

// DlgDaftarBank.displayName = 'DlgDaftarBank';

export default DlgDaftarBank;
