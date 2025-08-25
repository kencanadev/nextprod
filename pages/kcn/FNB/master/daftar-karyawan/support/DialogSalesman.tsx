import { ColumnDirective, ColumnsDirective, GridComponent, Inject, QueryCellInfoEventArgs, Resize, Selection, Sort } from '@syncfusion/ej2-react-grids';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonPropsModel } from '@syncfusion/ej2/popups';
import React, { useEffect, useRef, useState } from 'react';
import { fetchSales } from '.';
interface Props {
    isOpen: boolean;
    onClose: (selectedSales: any) => void;
    entitas: string;
    token: string;
    KodeSales: string;
}
const FrmSalesDlg = ({ isOpen, onClose, entitas, token, KodeSales }: Props) => {
    // Definition
    const gridSales = useRef<GridComponent>(null);
    const [selectedSales, setSelectedSales] = useState<any>(null);
    const [dsSales, setDsSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const buttonsInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'OK',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => closeForm(),
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
    const refreshData = async () => {
        setLoading(true);
        const salesmanRes = await fetchSales(entitas, token, KodeSales);
        setDsSales(salesmanRes);
    };
    const closeForm = () => {
        onClose(selectedSales);
    };
    // useEffect
    useEffect(() => {
        refreshData().then(() => {
            setLoading(false);
        });
    }, []);
    return (
        <DialogComponent
            id="FrmSalesDlg"
            name="FrmSalesDlg"
            target="#daftarKaryawan"
            header={'Daftar Salesman'}
            visible={isOpen}
            // isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="30%"
            height="70%"
            position={{ X: 'center', Y: 'center' }}
            style={{ position: 'fixed' }}
            buttons={buttonsInputData}
            // footerTemplate={footerTemplate}
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
                        <div>
                            <div className="mb-1 grid grid-cols-12">
                                <div className="col-span-4">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder="No. Sales"
                                            name="no_sales"
                                            id="no_sales"
                                            onChange={(args: any) => {
                                                if (gridSales.current) {
                                                    gridSales.current.search(args.value);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-8">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder="Nama Sales"
                                            name="nama_sales"
                                            id="nama_sales"
                                            onChange={(args: any) => {
                                                if (gridSales.current) {
                                                    gridSales.current.search(args.value);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <GridComponent
                                    id="gridSales"
                                    ref={gridSales}
                                    name="gridSales"
                                    allowSorting={true}
                                    allowResizing={true}
                                    dataSource={dsSales}
                                    allowSelection={true}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    gridLines={'Both'}
                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    height={500}
                                    autoFit={true}
                                    rowHeight={22}
                                    rowSelected={(args: any) => {
                                        setSelectedSales(args.data);
                                    }}
                                    recordDoubleClick={(args: any) => {
                                        onClose(args.rowData);
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="no_sales" headerText="No. Sales" headerTextAlign="Center" width={185} />
                                        <ColumnDirective field="nama_sales" headerText="Nama Sales" headerTextAlign="Center" width={360} />
                                    </ColumnsDirective>
                                    <Inject services={[Selection, Sort, Resize]} />
                                </GridComponent>
                            </div>
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

export default FrmSalesDlg;
