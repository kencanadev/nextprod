import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useEffect, useRef, useState } from 'react';
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Sort } from '@syncfusion/ej2-react-grids';
import { fetchDataKry } from '../api';

interface Props {
    isOpen: boolean;
    onClose: (nip: string) => void;
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
const DialogNIPPengemudi = ({ isOpen, onClose }: Props) => {
    const gridKaryawan = useRef<GridComponent>(null);

    const [loading, setLoading] = useState(false);
    const [selectedKry, setSelectedKry] = useState('');
    const [dataKaryawan, setDataKaryawan] = useState([]);
    const buttonInputData: ButtonPropsModel[] = [
        {
            buttonModel: {
                content: 'OK',
                cssClass: 'e-danger e-small',
            },
            isFlat: false,
            click: () => {
                closeDialog();
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                closeDialog();
            },
        },
    ];
    const closeDialog = () => {
        onClose(selectedKry);
        setSelectedKry('');
    };

    useEffect(() => {
        setLoading(true);
        const fetchKaryawan = async () => {
            try {
                const data = await fetchDataKry();
                setDataKaryawan(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data karyawan:', error);
                setLoading(false);
            }
        };
        fetchKaryawan();
    }, []);

    return (
        <DialogComponent
            id="DialogNIP"
            name="DialogNIP"
            target="#master-layout"
            header={'Daftar Karyawan'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="40%"
            height="55%"
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
        >
            <div className="relative block  rounded-lg border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-800">
                <div className={`${loading && 'opacity-20'}`}>
                    <div className="mb-1 grid grid-cols-12">
                        <div className="col-span-3">
                            <div className="container form-input">
                                <TextBoxComponent
                                    placeholder="NIP"
                                    name="nip"
                                    id="nip"
                                    onChange={(args: any) => {
                                        if (gridKaryawan.current) {
                                            gridKaryawan.current.search(args.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-span-9">
                            <div className="container form-input">
                                <TextBoxComponent
                                    placeholder="Nama Karyawan"
                                    name="nama_kry"
                                    id="nama_kry"
                                    onChange={(args: any) => {
                                        if (gridKaryawan.current) {
                                            gridKaryawan.current.search(args.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <GridComponent
                        id="gridKaryawan"
                        ref={gridKaryawan}
                        searchSettings={{
                            fields: ['nip', 'nama_kry'],
                        }}
                        name="gridKaryawan"
                        dataSource={dataKaryawan}
                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                        allowSorting={true}
                        allowFiltering={true}
                        gridLines={'Both'}
                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                        height={300}
                        autoFit={true}
                        rowHeight={22}
                        rowSelected={(args: any) => {
                            setSelectedKry(args.data.nip);
                        }}
                        recordDoubleClick={(args: any) => {
                            setSelectedKry(args.rowData.nip);
                            closeDialog();
                        }}
                    >
                        <ColumnsDirective>
                            <ColumnDirective field="nip" headerText="NIP" headerTextAlign="Center" />
                            <ColumnDirective field="nama_kry" headerText="Nama Karyawan" headerTextAlign="Center" />
                            <ColumnDirective field="jabatan" headerText="Jabatan" headerTextAlign="Center" />
                            <ColumnDirective field="nama_divisi" headerText="Divisi" headerTextAlign="Center" />
                        </ColumnsDirective>
                        <Inject services={[Sort]} />
                    </GridComponent>
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

export default DialogNIPPengemudi;
{
}
