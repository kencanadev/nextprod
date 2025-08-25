import { ColumnDirective, ColumnsDirective, GridComponent, Inject, QueryCellInfoEventArgs, Resize, Selection, Sort } from '@syncfusion/ej2-react-grids';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonPropsModel } from '@syncfusion/ej2/popups';
import React, { useEffect, useRef, useState } from 'react';
import { fetchCustomer } from '..';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { getValue } from '@syncfusion/ej2/base';
interface Props {
    isOpen: boolean;
    onClose: (selectedCustomer: any) => void;
    entitas: string;
    token: string;
}
const FrmCustomerDlg = ({ isOpen, onClose, entitas, token }: Props) => {
    // Definition
    const gridCustomerDlg = useRef<GridComponent>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [dsCustomer, setDsCustomer] = useState<any[]>([]);
    const [params, setParams] = useState({
        param1: '',
        param2: '',
        param3: '',
    });
    const [loading, setLoading] = useState(false);
    const buttonsInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'OK',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => {
                closeForm();
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => onClose(null),
        },
    ];
    // Function
    const handleQueryCellInfo = (args: QueryCellInfoEventArgs) => {
        const rowData: any = args.data as any;
        const cell: HTMLElement = args.cell as HTMLElement;
        let backgroundColor: string = '#FFFFFF';
        let color: string = '#000000';

        if (rowData) {
            if (rowData.aktif !== 'Y') {
                backgroundColor = '#C1CAD2';
                color = '#000000';
            }
            switch (rowData.kelas) {
                case 'G':
                    backgroundColor = '#FF0000';
                    color = '#FFFF00';
                    break;
                case 'N':
                    backgroundColor = '#B7FFB7';
                    color = '#000000';
                    break;
                case 'M':
                    backgroundColor = '#FF8080';
                    color = '#000000';
                    break;
                case 'L':
                    backgroundColor = '#FDC459';
                    color = '#000000';
                    break;
            }
        }
        cell.style.backgroundColor = backgroundColor;
        cell.style.color = color;
    };
    const footerTemplate = () => {
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center justify-center  gap-2">
                        <div className="h-3 w-3 border border-gray-950 "></div>
                        <div className="mt-1">Aktif</div>
                    </div>
                    <div className="flex items-center justify-center  gap-2">
                        <div className="h-3 w-3 border border-gray-950 bg-[#C1CAD2]"></div>
                        <div className="mt-1">Non-Aktif</div>
                    </div>
                    <div className="flex items-center justify-center  gap-2">
                        <div className="h-3 w-3 border border-gray-950 bg-[#FF0000]"></div>
                        <div className="mt-1">Blacklist-G</div>
                    </div>
                    <div className="flex items-center justify-center  gap-2">
                        <div className="h-3 w-3 border border-gray-950 bg-[#B7FFB7]"></div>
                        <div className="mt-1">New Open Outlet</div>
                        <div className="flex items-center justify-center  gap-2">
                            <div className="h-3 w-3 border border-gray-950 bg-[#FF8080]"></div>
                            <div className="mt-1">Batal NOO</div>
                        </div>
                        <div className="flex items-center justify-center  gap-2">
                            <div className="h-3 w-3 border border-gray-950 bg-[#FDC459]"></div>
                            <div className="mt-1">Tidak Digarap</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="e-btn e-danger e-small" onClick={() => closeForm()}>
                        OK
                    </div>
                    <div className="e-btn e-danger e-small" onClick={() => onClose(null)}>
                        Tutup
                    </div>
                </div>
            </div>
        );
    };
    const refreshData = async () => {
        setLoading(true);
        const karyawanRes = await fetchCustomer(entitas, token, params);
        setDsCustomer(karyawanRes);
    };
    const closeForm = () => {
        onClose(selectedCustomer);
    };
    // useEffect
    useEffect(() => {
        refreshData().then(() => {
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        refreshData().then(() => {
            setLoading(false);
        });
    }, [params]);
    return (
        <DialogComponent
            id="FrmCustomerDlg"
            name="FrmCustomerDlg"
            target="#daftarAkunSubledger"
            header={'Daftar Customer'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="70%"
            height="70%"
            position={{ X: 'center', Y: 'center' }}
            style={{ position: 'fixed' }}
            // buttons={buttonsInputData}
            footerTemplate={footerTemplate}
            close={() => {
                // closeForm();
                onClose(null);
            }}
            closeOnEscape={true}
            open={(args: any) => {
                args.preventFocus = true;
            }}
            showCloseIcon={true}
            allowDragging={true}
        >
            <div>
                <div className="relative block">
                    <div className={`${loading && 'opacity-20'}`}>
                        <div className="mb-1 grid grid-cols-12">
                            <div className="col-span-1">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="No. Customer"
                                        name="no_cust"
                                        id="no_cust"
                                        showClearButton={true}
                                        change={(args: any) => {
                                            setParams({
                                                ...params,
                                                param1: args.value,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-span-8">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="Nama Customer"
                                        name="nama_relasi"
                                        showClearButton={true}
                                        id="nama_relasi"
                                        value={params.param2}
                                        change={(args: any) => {
                                            setParams({
                                                ...params,
                                                param2: args.value,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="Nama Sales"
                                        showClearButton={true}
                                        name="nama_sales"
                                        id="nama_sales"
                                        value={params.param3}
                                        change={(args: any) => {
                                            setParams({
                                                ...params,
                                                param3: args.value,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <GridComponent
                                id="gridCustomerDlg"
                                ref={gridCustomerDlg}
                                name="gridCustomerDlg"
                                allowSorting={true}
                                allowResizing={true}
                                dataSource={dsCustomer}
                                allowSelection={true}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                gridLines={'Both'}
                                loadingIndicator={{ indicatorType: 'Shimmer' }}
                                height={500}
                                autoFit={true}
                                rowHeight={22}
                                rowSelected={(args: any) => {
                                    setSelectedCustomer(args.data);
                                }}
                                recordDoubleClick={(args: any) => {
                                    onClose(args.rowData);
                                }}
                                queryCellInfo={handleQueryCellInfo}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="no_cust" headerText="No. Customer" headerTextAlign="Center" width={110} />
                                    <ColumnDirective field="nama_relasi" headerText="Nama Customer" headerTextAlign="Center" width={450} />
                                    <ColumnDirective field="alamat" headerText="Alamat" headerTextAlign="Center" width={430} />
                                    <ColumnDirective field="nama_salesman" headerText="Salesman" headerTextAlign="Center" width={200} />
                                    <ColumnDirective field="status_warna" headerText="Info Detail" headerTextAlign="Center" width={130} />
                                </ColumnsDirective>
                                <Inject services={[Selection, Sort, Resize]} />
                            </GridComponent>
                        </div>
                    </div>
                </div>
                {loading && (
                    <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
                        <svg aria-hidden="true" className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </DialogComponent>
    );
};

export default FrmCustomerDlg;
