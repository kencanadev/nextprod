import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { GridComponent, ColumnsDirective, ColumnDirective, Selection, Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid } from '@syncfusion/ej2-react-grids';
import { swalToast } from '../../ppi/interface/template';

interface DialogSubledgerProps {
    visible: boolean;
    dataDaftarSubledger: any;
    stateDataHeader: any;
    setStateDataHeader: Function;
    gridPheJurnalListRef: any;
}

const DialogSubledger: React.FC<DialogSubledgerProps> = ({ visible, dataDaftarSubledger, stateDataHeader, setStateDataHeader, gridPheJurnalListRef }) => {
    let buttonDaftarSubledger: ButtonPropsModel[];
    let currentDaftarSubledger: any[] = [];
    let gridDaftarSubledger: Grid | any;
    let dialogDaftarSubledger: Dialog | any;

    buttonDaftarSubledger = [
        {
            buttonModel: {
                content: 'Pilih',
                //iconCss: 'e-icons e-save',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                currentDaftarSubledger = gridDaftarSubledger.getSelectedRecords();
                if (currentDaftarSubledger.length > 0) {
                    handleClickDaftarSubledger(currentDaftarSubledger);
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        dialogDaftarSubledgerVisible: false,
                    }));
                } else {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px">Silahkan pilih data akun</p>',
                        width: '100%',
                        target: '#dialogDaftarSubledger',
                    });
                }
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                //iconCss: 'e-icons e-close',
                cssClass: 'e-primary e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: () => {
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    dialogDaftarSubledgerVisible: false,
                }));
            },
        },
    ];

    const handleClickDaftarSubledger = async (data: any) => {
        if (gridPheJurnalListRef && Array.isArray(gridPheJurnalListRef.dataSource)) {
            const dataSource = [...gridPheJurnalListRef.dataSource]; // Salin array
            const updatedData = dataSource.map((node: any) => {
                if (node.id === stateDataHeader?.rowsIdJurnal) {
                    return {
                        ...node,
                        subledger: data[0].subledger,
                        kode_subledger: data[0].kode_subledger,
                        no_subledger: data[0].no_subledger,
                        nama_subledger: data[0].nama_subledger,
                    };
                } else {
                    return node;
                }
            });

            gridPheJurnalListRef.dataSource = updatedData;
            gridPheJurnalListRef.refresh();
        } else {
            console.error('DataSource is undefined or not an array.');
        }
    };

    return (
        <DialogComponent
            id="dialogDaftarSubledger"
            target="#dialogTtbList"
            style={{ position: 'fixed' }}
            header={() => {
                return (
                    <div>
                        <div className="header-title" style={{ width: '93%' }}>
                            Subledger
                        </div>
                    </div>
                );
            }}
            visible={visible}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            allowDragging={true}
            showCloseIcon={true}
            width="40%"
            height="65%"
            buttons={buttonDaftarSubledger}
            position={{ X: 'center', Y: 'center' }}
            close={() => {
                gridDaftarSubledger.clearSelection();
                setStateDataHeader((prevState: any) => ({
                    ...prevState,
                    dialogDaftarSubledgerVisible: false,
                }));
            }}
            closeOnEscape={true}
        >
            <GridComponent
                id="gridDaftarSubledger"
                locale="id"
                ref={(g: any) => (gridDaftarSubledger = g)}
                dataSource={dataDaftarSubledger}
                selectionSettings={{ mode: 'Row', type: 'Single' }}
                rowHeight={22}
                width={'100%'}
                height={'286'}
                gridLines={'Both'}
                loadingIndicator={{ indicatorType: 'Shimmer' }}
                recordDoubleClick={(args: any) => {
                    if (gridDaftarSubledger) {
                        const rowIndex: number = args.row.rowIndex;
                        gridDaftarSubledger.selectRow(rowIndex);
                        const currentDaftarSubledger = gridDaftarSubledger.getSelectedRecords();
                        if (currentDaftarSubledger.length > 0) {
                            handleClickDaftarSubledger(currentDaftarSubledger);
                            setStateDataHeader((prevState: any) => ({
                                ...prevState,
                                dialogDaftarSubledgerVisible: false,
                            }));
                        } else {
                            withReactContent(swalToast).fire({
                                icon: 'warning',
                                title: '<p style="font-size:12px">Silahkan pilih data barang</p>',
                                width: '100%',
                                target: '#dialogDaftarSubledger',
                            });
                        }
                    }
                }}
            >
                <ColumnsDirective>
                    <ColumnDirective field="no_subledger" headerText="No. Subledger" headerTextAlign="Center" textAlign="Left" width="30" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="nama_subledger" headerText="Keterangan" headerTextAlign="Center" textAlign="Left" width="60" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>
                <Inject services={[Selection]} />
            </GridComponent>
        </DialogComponent>
    );
};

export default DialogSubledger;
