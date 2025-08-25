import { DialogComponent } from '@syncfusion/ej2-react-popups';
import * as React from 'react';
import { ButtonComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import { Filter, FilterSettingsModel, Grid, Group, Page, PageSettingsModel, Search, Sort } from '@syncfusion/ej2/grids';
import { ColumnDirective, ColumnsDirective, GridComponent, Inject } from '@syncfusion/ej2-react-grids';
import { RelasiInterface } from './interfaceSupplier';

function DialogSupplierForDetail({
    visibilityForDialogRelasiSupplierForDetail,
    setDialogVisibilityForDialogRelasiSupplierForDetail,
    setSelectedSupplier,
    dataFromSuppHandle,
    originalDataSource
}: {
    visibilityForDialogRelasiSupplierForDetail: any;
    setDialogVisibilityForDialogRelasiSupplierForDetail: any;
    setSelectedSupplier: any;
    dataFromSuppHandle: Function;
    originalDataSource: any
}) {
    const { sessionData, isLoading } = useSession();
    function onOverlayClickForHeader() {
        setDialogVisibilityForDialogRelasiSupplierForDetail(false);
    }

    function dialogCloseForHeader() {
        setDialogVisibilityForDialogRelasiSupplierForDetail(false);
    }

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const userid = sessionData?.userid ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [dsListData, setDSListData] = React.useState<[]>([]);
    const [selectedListData, setSelectedListData] = React.useState<RelasiInterface[]>([]);
    let gridListData: Grid | any;
    let firstRender: Boolean = true;

    

    const showSelectedRow = async() => {
        setSelectedListData(gridListData.getSelectedRecords());
        console.log("SELECTED DETAIL : ",gridListData.getSelectedRecords());
        // const response = await axios.get(`${apiUrl}/erp/detaill_supplier?`, {
        //     params: {
        //         entitas: kode_entitas,
        //         param1: gridListData.getSelectedRecords()[0].kode_supp,
        //         // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
        //     },
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //     },
        // });
        // const responseData = response.data.data;
        
        // setSelectedSupplier(responseData);
        await  dataFromSuppHandle(gridListData.getSelectedRecords()[0].kode_supp);
        setDialogVisibilityForDialogRelasiSupplierForDetail(false);
        
    };

    // const refreshListData = async () => {
    //     if (kode_entitas !== null || kode_entitas !== '') {
    //         try {
    //             let paramKelas = 'all';
    //             let paramAktif = 'Y';
    //             let paramKelasBarang = 'all';
    //             let paramNoSupp = 'all';
    //             let paramNamaRelasi = 'all';
    //             let paramPersonal = 'all';

    //             const response = await axios.get(`${apiUrl}/erp/list_supplier?`, {
    //                 params: {
    //                     entitas: kode_entitas,
    //                     param1: paramAktif,
    //                     param2: paramKelas,
    //                     param3: paramKelasBarang,
    //                     param4: paramNoSupp,
    //                     param5: paramNamaRelasi,
    //                     param6: paramPersonal,
    //                     // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
    //                 },
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             const responseData = response.data.data;
    //             console.log('response supplier : ', { responseData });

    //             setTimeout(() => {
    //                 setDSListData(responseData);
    //             }, 300);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     }
    // };

    // React.useEffect(() => {
    //     refreshListData();
    // }, []);

    const rowIdxListData = React.useRef(0);
    const styleButton = {
        width: 58 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };
    const styleButtonRelasiBaru = {
        width: 100 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const pageSettings: PageSettingsModel = { pageSize: 6 };
    const filterSettings: FilterSettingsModel = { type: 'FilterBar' };
    return (
        <div className="App" id="dialog-target-supplier-detail">
            <DialogComponent
                width="650px"
                isModal={true}
                target="#dialog-target-supplier-detail"
                visible={visibilityForDialogRelasiSupplierForDetail}
                close={dialogCloseForHeader}
                overlayClick={onOverlayClickForHeader}
            >
                <div className="h-full w-full">
                    <div className=" w-full">
                        <GridComponent
                            dataSource={originalDataSource}
                            allowSorting={true}
                            allowFiltering={true}
                            allowPaging={true}
                            pageSettings={pageSettings}
                            filterSettings={filterSettings}
                            ref={(g) => (gridListData = g)}
                            height={180}
                            dataBound={() => {
                                //Selecting row after the refresh Complete
                                if (gridListData) {
                                    gridListData.selectRow(rowIdxListData.current);
                                }
                            }}
                            recordDoubleClick={(args: any) => {
                                if (gridListData) {
                                    const rowIndex: number = args.row.rowIndex;
                                    gridListData.selectRow(rowIndex);
                                    showSelectedRow();
                                }
                            }}
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="no_supp" width="50" textAlign="Left" />
                                <ColumnDirective field="kode_mu" width="100" visible={false} />
                                <ColumnDirective field="nama_relasi" width="100" />
                            </ColumnsDirective>
                            <Inject services={[Page, Sort, Filter, Group]} />
                        </GridComponent>
                    </div>
                 
                    <div className="flex w-full justify-between">
                        <div className="flex">
                            <ButtonComponent
                                onClick={() => {
                                    setSelectedSupplier(selectedListData);
                                    setDialogVisibilityForDialogRelasiSupplierForDetail(false);
                                }}
                                id="btnHapus"
                                type="submit"
                                cssClass="e-primary e-small"
                                style={styleButton}
                            >
                                Ok
                            </ButtonComponent>
                            <ButtonComponent id="btnHapus" type="submit" cssClass="e-primary e-small" style={styleButton} onClick={() => setDialogVisibilityForDialogRelasiSupplierForDetail(false)}>
                                Batal
                            </ButtonComponent>
                        </div>
                    </div>
                </div>
            </DialogComponent>
        </div>
    );
}

export default DialogSupplierForDetail;
