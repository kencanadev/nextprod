import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { GridComponent, ColumnsDirective, ColumnDirective, Selection, Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid } from '@syncfusion/ej2-react-grids';
import { swalToast } from '.';
import { HandleSearchNamaSupplier } from '../../../fa/buku-subledger/functional/fungsiForm';
import axios from 'axios';
import moment from 'moment';
// import { DetailNoFakturPhu } from '../model/apiPhu';

interface DialogDaftarSupplierProps {
    kode_entitas: any;
    token: any;
    visible: boolean;
    dataDaftarSupplier: any;
    stateDataFilter: any;
    setDataDaftarSupplier: Function;
    setStateDataFilter: Function;
    vRefreshData: any;
    setDataDaftarNoLpb: Function;
    setListDataDaftarNoLpb: Function;
}

const DialogSupplier: React.FC<DialogDaftarSupplierProps> = ({
    kode_entitas,
    token,
    visible,
    dataDaftarSupplier,
    stateDataFilter,
    setDataDaftarSupplier,
    setStateDataFilter,
    vRefreshData,
    setDataDaftarNoLpb,
    setListDataDaftarNoLpb,
}) => {
    const gridDaftarSupplier = useRef<GridComponent>(null);
    let buttonDaftarSupplier: ButtonPropsModel[];
    let currentDaftarSupplier: any[] = [];
    const [originalData, setOriginalData] = useState<any[]>([]);
    useEffect(() => {
        gridDaftarSupplier.current?.setProperties({ dataSource: dataDaftarSupplier });
        gridDaftarSupplier.current?.refresh();
        setOriginalData(dataDaftarSupplier);
    }, [vRefreshData]);

    buttonDaftarSupplier = [
        {
            buttonModel: {
                content: 'Pilih',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                currentDaftarSupplier = gridDaftarSupplier.current?.getSelectedRecords() || [];
                if (currentDaftarSupplier.length > 0) {
                    // setStateDataFilter((prevState: any) => ({
                    //     ...prevState,
                    //     dialogSupplierVisible: false,
                    //     noSupplierValue: currentDaftarSupplier[0].no_supp,
                    //     namaSupplierValue: currentDaftarSupplier[0].nama_relasi,
                    //     kodeSupplierValue: currentDaftarSupplier[0].kode_supp,
                    //     isNamaSuppChecked: true,
                    //     plagNamaPenerimaan: true,
                    // }));
                    getNoLpbBySupp(currentDaftarSupplier[0], currentDaftarSupplier[0].kode_supp);
                } else {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px">Silahkan pilih data supplier</p>',
                        width: '100%',
                        target: '#dialogDaftarSupplier',
                    });
                }
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                setStateDataFilter((prevState: any) => ({
                    ...prevState,
                    dialogSupplierVisible: false,
                }));
            },
        },
    ];

    const handleSearchDialog = (tipe: any, value: any) => {
        if (tipe === 'noSupp') {
            if (gridDaftarSupplier.current && Array.isArray(originalData)) {
                let filteredData = originalData;

                if (value.trim() !== '') {
                    filteredData = originalData.filter((item) => item.no_supp.toLowerCase().startsWith(value.toLowerCase()));
                }

                const searchNamaSupplier = document.getElementById('searchNamaSupplier') as HTMLInputElement;
                if (searchNamaSupplier) {
                    searchNamaSupplier.value = '';
                }

                gridDaftarSupplier.current.dataSource = filteredData;
                gridDaftarSupplier.current.refresh();
            }
        } else {
            if (gridDaftarSupplier.current && Array.isArray(originalData)) {
                let filteredData = originalData;

                if (value.trim() !== '') {
                    filteredData = originalData.filter((item) => item.nama_relasi.toLowerCase().startsWith(value.toLowerCase()));
                }

                const searchNoSupplier = document.getElementById('searchNoSupplier') as HTMLInputElement;
                if (searchNoSupplier) {
                    searchNoSupplier.value = '';
                }

                gridDaftarSupplier.current.dataSource = filteredData;
                gridDaftarSupplier.current.refresh();
            }
        }
    };

    const getNoLpbBySupp = async (currentDaftarSupplier: any, kodeSupp: any) => {
        const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
        const response = await axios.get(`${apiUrl}/erp/laporan/huds/daftar_pengakuan_hutang_supplier?`, {
            params: {
                entitas: kode_entitas,
                param1: moment(stateDataFilter.tglAwal).format('YYYY-MM-DD'),
                param2: moment(stateDataFilter.tglAkhir).format('YYYY-MM-DD'),
                param3: kodeSupp,
                param4: 'all',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const listNoLpb = response.data.data;
        setDataDaftarNoLpb(listNoLpb);
        // setListDataDaftarNoLpb(listNoLpb);
        // Langsung centang semua no_lpb
        setListDataDaftarNoLpb([]); // Kosongkan pilihan awal

        setStateDataFilter((prevState: any) => ({
            ...prevState,
            dialogSupplierVisible: false,
            noSupplierValue: currentDaftarSupplier.no_supp,
            namaSupplierValue: currentDaftarSupplier.nama_relasi,
            kodeSupplierValue: currentDaftarSupplier.kode_supp,
            isNamaSuppChecked: true,
            plagNamaPenerimaan: true,
        }));

        console.log('listNoLpb = ', listNoLpb);
    };

    return (
        <DialogComponent
            id="dialogDaftarSupplier"
            target="#main-target"
            style={{ position: 'fixed' }}
            header={() => {
                return (
                    <div>
                        <div className="header-title" style={{ width: '93%' }}>
                            Daftar Supplier
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
            buttons={buttonDaftarSupplier}
            position={{ X: 'center', Y: 'center' }}
            close={() => {
                setStateDataFilter((prevState: any) => ({
                    ...prevState,
                    dialogSupplierVisible: false,
                }));
            }}
            closeOnEscape={true}
            open={(args: any) => {
                if (stateDataFilter?.tipeFilterOpen === 'Input') {
                    setStateDataFilter((prevState: any) => ({
                        ...prevState,
                        searchNoSupplier: stateDataFilter?.searchNoSupplier,
                        searchNamaSupplier: stateDataFilter?.searchNamaSupplier,
                    }));
                } else {
                    setStateDataFilter((prevState: any) => ({
                        ...prevState,
                        searchNoSupplier: '',
                        searchNamaSupplier: '',
                    }));
                    const searchNoSupplier = document.getElementById('searchNoSupplier') as HTMLInputElement;
                    if (searchNoSupplier) {
                        searchNoSupplier.value = '';
                    }
                    const searchNamaSupplier = document.getElementById('searchNamaSupplier') as HTMLInputElement;
                    if (searchNamaSupplier) {
                        searchNamaSupplier.value = '';
                    }
                }

                if (stateDataFilter?.tipeFocusOpen === 'namaSupp') {
                    setTimeout(function () {
                        document.getElementById('searchNamaSupplier')?.focus();
                    }, 100);
                }
            }}
        >
            <div className="form-input mb-1 mr-1" style={{ width: '150px', display: 'inline-block' }}>
                <TextBoxComponent
                    id="searchNoSupplier"
                    name="searchNoSupplier"
                    className="searchNoSupplier"
                    placeholder="<No. Supplier>"
                    showClearButton={true}
                    value={stateDataFilter?.searchNoSupplier}
                    input={(args: any) => {
                        const value: any = args.value;
                        handleSearchDialog('noSupp', value);
                    }}
                />
            </div>
            <div className="form-input mb-1" style={{ width: '250px', display: 'inline-block' }}>
                <TextBoxComponent
                    id="searchNamaSupplier"
                    name="searchNamaSupplier"
                    className="searchNamaSupplier"
                    placeholder="<Nama Supplier>"
                    showClearButton={true}
                    value={stateDataFilter?.searchNamaSupplier}
                    input={(args: any) => {
                        const value: any = args.value;
                        handleSearchDialog('namaSupp', value);
                    }}
                />
            </div>
            <GridComponent
                id="gridDaftarSupplier"
                locale="id"
                ref={gridDaftarSupplier}
                // dataSource={stateDataHeader?.searchKeywordNoSupplier !== '' || stateDataHeader?.searchKeywordNamaSupplier !== '' ? filteredDataSupplier : dataDaftarSupplier}
                selectionSettings={{ mode: 'Row', type: 'Single' }}
                rowHeight={22}
                width={'100%'}
                height={'456'}
                gridLines={'Both'}
                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                recordDoubleClick={(args: any) => {
                    if (gridDaftarSupplier.current) {
                        const rowIndex: number = args.row.rowIndex;
                        gridDaftarSupplier.current?.selectRow(rowIndex);
                        currentDaftarSupplier = gridDaftarSupplier.current?.getSelectedRecords() || [];
                        if (currentDaftarSupplier.length > 0) {
                            // setStateDataFilter((prevState: any) => ({
                            //     ...prevState,
                            //     dialogSupplierVisible: false,
                            //     noSupplierValue: currentDaftarSupplier[0].no_supp,
                            //     namaSupplierValue: currentDaftarSupplier[0].nama_relasi,
                            //     kodeSupplierValue: currentDaftarSupplier[0].kode_supp,
                            //     isNamaSuppChecked: true,
                            //     plagNamaPenerimaan: true,
                            // }));
                            getNoLpbBySupp(currentDaftarSupplier[0], currentDaftarSupplier[0].kode_supp);
                        } else {
                            withReactContent(swalToast).fire({
                                icon: 'warning',
                                title: '<p style="font-size:12px">Silahkan pilih data supplier</p>',
                                width: '100%',
                                target: '#dialogDaftarSupplier',
                            });
                        }
                    }
                }}
            >
                <ColumnsDirective>
                    <ColumnDirective field="no_supp" headerText="No. Supplier" headerTextAlign="Center" textAlign="Left" width="50" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="kode_mu" headerText="MU" headerTextAlign="Center" textAlign="Center" width="20" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="nama_relasi" headerText="Nama" headerTextAlign="Center" textAlign="Left" width="130" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>
                <Inject services={[Selection]} />
            </GridComponent>
        </DialogComponent>
    );
};

export default DialogSupplier;
