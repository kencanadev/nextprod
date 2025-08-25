import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { GridComponent, ColumnsDirective, ColumnDirective, Selection, Inject } from '@syncfusion/ej2-react-grids';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid } from '@syncfusion/ej2-react-grids';
// import { swalToast } from '.';
import { HandleSearchNamaSupplier } from '../../../fa/buku-subledger/functional/fungsiForm';
import axios from 'axios';
import moment from 'moment';
import { swalToast } from '@/utils/inventory/realisasi-berita-acara/interface/fungsi';
import { GetDetailFbm, GetHargaKontrak, GetSettingAC } from '@/lib/inventory/realisasi-berita-acara/api/api';
// import { GetDetailFbm } from '@/lib/fa/konsolidasi-phe/api/api';
// import { DetailNoFakturPhu } from '../model/apiPhu';

interface DialogDaftarFbmProps {
    kode_entitas: any;
    token: any;
    visible: boolean;
    stateDataDaftarFbm: any;
    stateDataDaftarFbmOriginal: any;
    vRefreshData: any;
    setDialogDaftarFbmVisible: Function;
    setStateDataHeader: Function;
    stateDataHeader: any;
    gridRbaListRef: any;
    setStateDataFooter: Function;
    stateDataFooter: any;
    // dataDaftarSupplier: any;
    // stateDataFilter: any;
    // setDataDaftarSupplier: Function;
    // setStateDataFilter: Function;
    // setDataDaftarNoLpb: Function;
    // setListDataDaftarNoLpb: Function;
}

const DialogDaftarFbm: React.FC<DialogDaftarFbmProps> = ({
    kode_entitas,
    token,
    visible,
    stateDataDaftarFbm,
    stateDataDaftarFbmOriginal,
    vRefreshData,
    setDialogDaftarFbmVisible,
    setStateDataHeader,
    stateDataHeader,
    gridRbaListRef,
    setStateDataFooter,
    stateDataFooter,
    // dataDaftarSupplier,
    // stateDataFilter,
    // setDataDaftarSupplier,
    // setStateDataFilter,
    // setDataDaftarNoLpb,
    // setListDataDaftarNoLpb,
}) => {
    const gridDaftarFbm = useRef<GridComponent>(null);
    let buttonDaftarFbm: ButtonPropsModel[];
    let currentDaftarFbm: any[] = [];
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const [originalData, setOriginalData] = useState<any[]>([]);
    useEffect(() => {
        gridDaftarFbm.current?.setProperties({ dataSource: stateDataDaftarFbm });
        gridDaftarFbm.current?.refresh();
        setOriginalData(stateDataDaftarFbmOriginal);
    }, [vRefreshData]);

    buttonDaftarFbm = [
        {
            buttonModel: {
                content: 'Pilih',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                currentDaftarFbm = gridDaftarFbm.current?.getSelectedRecords() || [];
                if (currentDaftarFbm.length > 0) {
                    console.log('test = ', currentDaftarFbm[0].kode_fbm);

                    handleDaftarFbm(currentDaftarFbm[0]);
                } else {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px">Silahkan pilih data supplier</p>',
                        width: '100%',
                        target: '#dialogDaftarFbm',
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
                setDialogDaftarFbmVisible(false);
            },
        },
    ];

    const handleSearchDialog = (value: any) => {
        if (gridDaftarFbm.current && Array.isArray(originalData)) {
            let filteredData = originalData;
            console.log(' coba masuk sini = ', value, filteredData);

            if (value.trim() !== '') {
                filteredData = originalData.filter((item) => item.via.toLowerCase().startsWith(value.toLowerCase()));
            }

            gridDaftarFbm.current.dataSource = filteredData;
            gridDaftarFbm.current.refresh();
        }
    };

    const handleDaftarFbm = async (data: any) => {
        const respDataFbm = await GetDetailFbm(kode_entitas, data.kode_fbm, '1', token);
        const respSettingAc = await GetSettingAC(kode_entitas, token);

        const responseDataFbmFix = respDataFbm.map((data: any) => ({
            ...data,
            nama_supp: data.nama_relasi,
            qty: parseFloat(data.qty_pabrik_split),
            qty_pabrik_real: parseFloat(data.qty_pabrik_real),
            harga_mu: parseFloat(data.harga_mu),
            jumlah_mu: parseFloat(data.qty_pabrik_split) * parseFloat(data.harga_mu),
        }));

        console.log('responseDataFbmFix = ', responseDataFbmFix, data, respSettingAc);

        // perubahaan untuk pengambilan harga pusat
        // 2025-05-26
        // Gabungkan harga kontrak ke data Fbm
        const responseDataFbmWithHargaKontrak = await Promise.all(
            responseDataFbmFix.map(async (item: any) => {
                // Ambil harga kontrak untuk item ini

                const respHargaKontrakPusat = respSettingAc.length > 0 ? await GetHargaKontrak(respSettingAc[0].fbm_kodepusat, item.kode_item, item.no_kontrak, token) : 0;

                // Ambil harga kontrak, fallback ke harga_mu jika tidak tersedia
                const harga_kontrak = respHargaKontrakPusat && respHargaKontrakPusat[0]?.harga_kontrak > 0 ? respHargaKontrakPusat[0].harga_kontrak : item.harga_mu;

                const harga_pusat = harga_kontrak;

                return {
                    ...item,
                    harga_pusat: parseFloat(harga_pusat),
                };
            })
        );

        const totalFj = responseDataFbmFix.reduce((sum: any, item: any) => sum + (item.jumlah_mu || 0), 0);

        // const responseDataDetailFbm = responseDataFbmFix.map((Data: any) => ({
        //     ...Data,
        //     qty_pabrik_acc: 0,
        //     // harga_pusat: 0,
        //     harga_pph: 0,
        //     jumlah_pusat: 0,
        //     jumlah_pph: 0,
        // }));

        const responseDataDetailFbm = responseDataFbmWithHargaKontrak.map((Data: any) => ({
            ...Data,
            qty_pabrik_acc: 0,
            // harga_pusat: 0,
            harga_pph: 0,
            jumlah_pusat: 0,
            jumlah_pph: 0,
        }));

        console.log('responseDataDetailFbm = ', responseDataDetailFbm, data);
        gridRbaListRef?.setProperties({ dataSource: responseDataDetailFbm });
        gridRbaListRef?.refresh();
        // =========

        setStateDataHeader((prevState: any) => ({
            ...prevState,
            noFbm: data.no_fbm,
            kode_fbm: data.kode_fbm,
            via: data.via,
            pph23: data.pph23,
            noReff: data.no_reff,
        }));

        setStateDataFooter((prevState: any) => ({
            ...prevState,
            totalFj: totalFj,
            bebanCabang: totalFj,
        }));

        const pph22 = document.getElementById('pph22') as HTMLInputElement;
        if (pph22) {
            pph22.value = data.pph22 === 'N' ? 'Tanpa Pajak' : data.pph22 === 'T' ? 'PPN' : data.pph22 === 'P' ? 'PPN - PPH22' : '';
        }

        setDialogDaftarFbmVisible(false);
    };

    // const getNoLpbBySupp = async (currentDaftarSupplier: any, kodeSupp: any) => {
    //     const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    //     const response = await axios.get(`${apiUrl}/erp/laporan/huds/daftar_pengakuan_hutang_supplier?`, {
    //         params: {
    //             entitas: kode_entitas,
    //             param1: moment(stateDataFilter.tglAwal).format('YYYY-MM-DD'),
    //             param2: moment(stateDataFilter.tglAkhir).format('YYYY-MM-DD'),
    //             param3: kodeSupp,
    //             param4: 'all',
    //         },
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });

    //     const listNoLpb = response.data.data;
    //     setDataDaftarNoLpb(listNoLpb);
    //     // setListDataDaftarNoLpb(listNoLpb);
    //     // Langsung centang semua no_lpb
    //     setListDataDaftarNoLpb([]); // Kosongkan pilihan awal

    //     setStateDataFilter((prevState: any) => ({
    //         ...prevState,
    //         dialogSupplierVisible: false,
    //         noSupplierValue: currentDaftarSupplier.no_supp,
    //         namaSupplierValue: currentDaftarSupplier.nama_relasi,
    //         kodeSupplierValue: currentDaftarSupplier.kode_supp,
    //         isNamaSuppChecked: true,
    //         plagNamaPenerimaan: true,
    //     }));

    //     console.log('listNoLpb = ', listNoLpb);
    // };

    return (
        <DialogComponent
            id="dialogDaftarFbm"
            target="#dialogRbeList"
            style={{ position: 'fixed' }}
            header={() => {
                return (
                    <div>
                        <div className="header-title" style={{ width: '93%' }}>
                            Daftar FBM
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
            buttons={buttonDaftarFbm}
            position={{ X: 'center', Y: 'center' }}
            close={() => {
                setDialogDaftarFbmVisible(false);
            }}
            closeOnEscape={true}
            open={(args: any) => {
                if (stateDataHeader?.tipeFilterOpen === 'Input') {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        searchNamaViaDaftarFbm: stateDataHeader?.searchNamaViaDaftarFbm,
                    }));
                } else {
                    setStateDataHeader((prevState: any) => ({
                        ...prevState,
                        searchNamaViaDaftarFbm: '',
                    }));
                }

                if (stateDataHeader?.tipeFocusOpen === 'namaVia') {
                    setTimeout(function () {
                        document.getElementById('searchVia')?.focus();
                    }, 100);
                }
            }}
        >
            <div className="form-input mb-1" style={{ width: '100%', display: 'inline-block' }}>
                <TextBoxComponent
                    id="searchVia"
                    name="searchVia"
                    className="searchVia"
                    placeholder="<Nama Ekspedisi>"
                    showClearButton={true}
                    value={stateDataHeader?.searchNamaViaDaftarFbm}
                    input={(args: any) => {
                        const value: any = args.value;
                        handleSearchDialog(value);
                    }}
                />
            </div>
            <GridComponent
                id="gridDaftarFbm"
                locale="id"
                ref={gridDaftarFbm}
                // dataSource={stateDataHeader?.searchKeywordNoSupplier !== '' || stateDataHeader?.searchKeywordNamaSupplier !== '' ? filteredDataSupplier : dataDaftarSupplier}
                selectionSettings={{ mode: 'Row', type: 'Single' }}
                rowHeight={22}
                width={'100%'}
                height={'320'}
                gridLines={'Both'}
                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                recordDoubleClick={(args: any) => {
                    if (gridDaftarFbm.current) {
                        const rowIndex: number = args.row.rowIndex;
                        gridDaftarFbm.current?.selectRow(rowIndex);
                        currentDaftarFbm = gridDaftarFbm.current?.getSelectedRecords() || [];
                        if (currentDaftarFbm.length > 0) {
                            handleDaftarFbm(currentDaftarFbm[0]);
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
                    <ColumnDirective field="tgl_fbm" headerText="Tgl FBM" headerTextAlign="Center" textAlign="Left" width="30" type="date" format={formatDate} />
                    <ColumnDirective field="no_fbm" headerText="No. FBM" headerTextAlign="Center" textAlign="Left" width="50" />
                    <ColumnDirective field="via" headerText="Ekspedisi" headerTextAlign="Center" textAlign="Left" width="130" />
                </ColumnsDirective>
                <Inject services={[Selection]} />
            </GridComponent>
        </DialogComponent>
    );
};

export default DialogDaftarFbm;
