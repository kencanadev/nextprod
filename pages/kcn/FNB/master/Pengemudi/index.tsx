import React, { useEffect, useState, useRef } from 'react';
import { ButtonComponent, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent, ButtonPropsModel, TooltipComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject, Resize, Sort, Toolbar, Edit, Selection, Grid, Reorder, RowSelectingEventArgs, Filter } from '@syncfusion/ej2-react-grids';
import { fetchListPengemudi, postSimpanPengemudi } from './api';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import DialogNIPPengemudi from './Support/DialogKaryawan';
import moment from 'moment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}

interface PengemudiType {
    id: number;
    pengemudi: string;
    hp_wa: string;
    aktif: string;
    sopir_kirim: string;
    userid: string;
    tgl_update: string;
    nip: string;
    from: string;
}
const PengemudiDialog = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    const [loading, setLoading] = useState(false);
    const gridPengemudiRef = useRef<GridComponent>(null);
    const [searchNIPDialogState, setSearchNIPDialogState] = useState(false);
    const [indexSelected, setIndexSelected] = useState(0);
    const buttonInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'Simpan',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => {
                simpanData();
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                onClose();
            },
        },
    ];
    const closeDialog = () => {
        onClose();
    };
    function actionBegin(args: any): void {
        if (args.requestType === 'add') {
            if (gridPengemudiRef.current) {
                const newPengemudi: PengemudiType = {
                    pengemudi: '',
                    hp_wa: '',
                    aktif: 'Y',
                    sopir_kirim: 'N',
                    userid: userid.toUpperCase(),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    nip: '',
                    id: gridPengemudiRef.current.getCurrentViewRecords().length + 1,
                    from: 'MANUAL',
                };
                gridPengemudiRef.current.addRecord(newPengemudi, gridPengemudiRef.current.getCurrentViewRecords().length);
            }
        }
    }
    function actionComplete(args: any): void {
        if (args.requestType === 'save') {
            if (gridPengemudiRef.current) {
                const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                if (args.action === 'add') {
                    gridPengemudiRef.current.refresh();
                } else if (args.action === 'edit') {
                    dataSource[args.rowIndex] = {
                        ...dataSource[args.rowIndex],
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    };
                    gridPengemudiRef.current.refresh();
                }
            }
        }
    }
    const checkboxAktifTemplate = (args: any) => {
        return (
            <label className="flex cursor-pointer items-center justify-center">
                <input
                    name={'aktif-' + args.index}
                    id={'aktif-' + args.index}
                    type="checkbox"
                    className="form-checkbox"
                    checked={args.aktif === 'N'}
                    onChange={(e: any) => {
                        if (gridPengemudiRef.current) {
                            const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                            dataSource[args.index] = {
                                ...dataSource[args.index],
                                aktif: e.target.checked ? 'N' : 'Y',
                            };
                            gridPengemudiRef.current.updateRow(args.index, dataSource[args.index]);
                        }
                    }}
                />
            </label>
        );
    };
    const checkboxKirimBarangTemplate = (args: any) => {
        return (
            <label className="flex cursor-pointer items-center justify-center">
                <input
                    name={'sopirKirim-' + args.index}
                    id={'sopirKirim-' + args.index}
                    type="checkbox"
                    className="form-checkbox"
                    checked={args.aktif === 'Y'}
                    onChange={(e: any) => {
                        if (gridPengemudiRef.current) {
                            const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                            dataSource[args.index] = {
                                ...dataSource[args.index],
                                sopir_kirim: e.target.checked ? 'Y' : 'N',
                            };
                            gridPengemudiRef.current.updateRow(args.index, dataSource[args.index]);
                        }
                    }}
                />
            </label>
        );
    };
    const editTemplate = (props: any, field: string) => {
        return (
            <TextBoxComponent
                name={field + props.index}
                id={field + props.index}
                value={props[field]}
                change={(args: any) => {
                    if (gridPengemudiRef.current) {
                        const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                        dataSource[props.index] = {
                            ...dataSource[props.index],
                            [field]: args.value,
                        };
                    }
                }}
            />
        );
    };
    const nipTempalate = (props: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                <TextBoxComponent id={props.nip} name={props.nip} value={props.nip} readOnly={true} showClearButton={false} />

                <ButtonComponent
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        setIndexSelected(props.index);
                        setSearchNIPDialogState(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </div>
        );
    };
    const simpanData = async () => {
        setLoading(true);
        try {
            if (gridPengemudiRef.current) {
                const pengemudiData = {
                    entitas: entitas,
                    pengemudi: gridPengemudiRef.current.dataSource,
                };
                await postSimpanPengemudi(entitas, token, pengemudiData);
                setLoading(false);
                onClose();
            }
        } catch (error) {
            setLoading(false);
            console.error('Error Simpan data Pengemudi:', error);
        }
    };
    useEffect(() => {
        setLoading(true);
        const fetchPengemudi = async () => {
            try {
                const data = await fetchListPengemudi(entitas, token);
                if (gridPengemudiRef.current) {
                    gridPengemudiRef.current.dataSource = data;
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching data Pengemudi:', error);
            }
        };

        fetchPengemudi();
    }, []);

    return (
        <>
            <DialogComponent
                id="DialogPengemudi(Sopir)"
                name="DialogPengemudi(Sopir)"
                target="#master-layout"
                header={'Pengemudi'}
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="70%"
                height="80%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                buttons={buttonInputData}
                // footerTemplate={footerTemplate}
                close={closeDialog}
                closeOnEscape={true}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                showCloseIcon={true}
                allowDragging={true}
                enableResize={true}
            >
                <div className="relative block  rounded-lg border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-800">
                    <div className={`${loading && 'opacity-20'}`}>
                        <div className="flex items-center justify-between border border-l-[#c4c7c5] border-r-[#c4c7c5] border-t-[#c4c7c5] bg-[#EEEEEE] p-[0.4em] px-2 text-[#5d676e]">
                            <h2 className="text-[11px] font-bold text-[#5d676e]">Daftar Pengemudi</h2>
                        </div>
                        <GridComponent
                            id="PengemudiGrid"
                            name="PengemudiGrid"
                            ref={gridPengemudiRef}
                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                            toolbar={['Add', 'Edit', 'Delete', 'Cancel']}
                            allowSorting={true}
                            allowFiltering={true}
                            filterSettings={{ type: 'Menu' }}
                            editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' }}
                            actionBegin={actionBegin}
                            actionComplete={actionComplete}
                            gridLines={'Both'}
                            loadingIndicator={{ indicatorType: 'Shimmer' }}
                            height={470}
                            allowResizing
                            allowReordering
                            autoFit={true}
                            rowHeight={22}
                        >
                            <ColumnsDirective>
                                <ColumnDirective width={350} field="pengemudi" headerText="Pengemudi" headerTextAlign="Center" editTemplate={(args: any) => editTemplate(args, 'pengemudi')} />
                                <ColumnDirective field="hp_wa" width={250} headerText="No. HP/WA" headerTextAlign="Center" editTemplate={(args: any) => editTemplate(args, 'hp_wa')} />
                                <ColumnDirective field="nip" width={250} headerText="NIP di Modul HRM" headerTextAlign="Center" editTemplate={nipTempalate} />
                                <ColumnDirective
                                    field="aktif"
                                    headerText="Non Aktif"
                                    headerTextAlign="Center"
                                    textAlign="Center"
                                    editTemplate={checkboxAktifTemplate}
                                    template={(args: any) => {
                                        return (
                                            <label className="flex cursor-pointer items-center justify-center">
                                                <input
                                                    name={'aktif-' + args.index}
                                                    id={'aktif-' + args.index}
                                                    type="checkbox"
                                                    className="form-checkbox"
                                                    checked={args.aktif === 'N'}
                                                    onChange={(e: any) => {
                                                        if (gridPengemudiRef.current) {
                                                            const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                                                            dataSource[args.index] = {
                                                                ...dataSource[args.index],
                                                                aktif: e.target.checked ? 'N' : 'Y',
                                                            };
                                                            gridPengemudiRef.current.updateRow(args.index, dataSource[args.index]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        );
                                    }}
                                    width={150}
                                />
                                <ColumnDirective
                                    field="sopir_kirim"
                                    headerText="Kirim Barang"
                                    headerTextAlign="Center"
                                    textAlign="Center"
                                    editTemplate={checkboxKirimBarangTemplate}
                                    // template={checkboxKirimBarangTemplate}
                                    template={(args: any) => {
                                        return (
                                            <label className="flex cursor-pointer items-center justify-center">
                                                <input
                                                    name={'sopirKirim-' + args.index}
                                                    id={'sopirKirim-' + args.index}
                                                    type="checkbox"
                                                    className="form-checkbox"
                                                    checked={args.sopir_kirim === 'Y'}
                                                    onChange={(e: any) => {
                                                        if (gridPengemudiRef.current) {
                                                            const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                                                            dataSource[args.index] = {
                                                                ...dataSource[args.index],
                                                                sopir_kirim: e.target.checked ? 'Y' : 'N',
                                                            };
                                                            gridPengemudiRef.current.updateRow(args.index, dataSource[args.index]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        );
                                    }}
                                    width={150}
                                />
                            </ColumnsDirective>
                            <Inject services={[Toolbar, Edit, Sort, Resize, Reorder]} />
                        </GridComponent>
                        {loading && (
                            <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
                                <svg
                                    aria-hidden="true"
                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogComponent>
            {searchNIPDialogState && (
                <DialogNIPPengemudi
                    isOpen={searchNIPDialogState}
                    onClose={(nip: string) => {
                        setSearchNIPDialogState(false);
                        if (nip !== '') {
                            if (gridPengemudiRef.current) {
                                const dataSource = gridPengemudiRef.current.dataSource as PengemudiType[];
                                dataSource[indexSelected] = {
                                    ...dataSource[indexSelected],
                                    nip: nip,
                                };
                                gridPengemudiRef.current.updateRow(indexSelected, dataSource[indexSelected]);
                            }
                        }
                    }}
                    entitas={entitas}
                    token={token}
                    userid={userid}
                />
            )}
        </>
    );
};

export default PengemudiDialog;
