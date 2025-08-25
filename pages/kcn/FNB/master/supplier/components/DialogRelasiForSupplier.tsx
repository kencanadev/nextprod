import { DialogComponent } from '@syncfusion/ej2-react-popups';
import * as React from 'react';
import { ButtonComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import { Filter, FilterSettingsModel, Grid, Group, Page, PageSettingsModel, Search, Sort } from '@syncfusion/ej2/grids';
import { ColumnDirective, ColumnsDirective, GridComponent, Inject } from '@syncfusion/ej2-react-grids';
import { RelasiInterface } from './interfaceSupplier';
import { useRouter } from 'next/router';
import { HandleSearchNamaRelasi, HandleSearchNoRelasi } from '../function/functionSupp';

function DialogRelasiForSupplier({
    visibilityForDialogRelasiSupplier,
    setDialogVisibilityForDialogRelasiSupplier,
    setSetselectedRelasi,
    originalDataSource,
    masterState,
    setKodeSuppEdit,
    setKode_supplier,
}: {
    visibilityForDialogRelasiSupplier: boolean;
    setDialogVisibilityForDialogRelasiSupplier: Function;
    setSetselectedRelasi: Function;
    originalDataSource: any;
    masterState: string;
    setKodeSuppEdit: Function;
    setKode_supplier: Function;
}) {
    const { sessionData, isLoading } = useSession();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();
    function onOverlayClickForHeader() {
        setDialogVisibilityForDialogRelasiSupplier(false);
    }

    function dialogCloseForHeader() {
        setDialogVisibilityForDialogRelasiSupplier(false);
    }

    const [searchQuery, setSearchQuery] = React.useState({
        no_relasi: '',
        nama_relasi: '',
    });

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const userid = sessionData?.userid ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [dsListData, setDSListData] = React.useState<[]>([]);
    const [dsListDataNonFIlter, setDSListDataNonFIlter] = React.useState<[]>([]);
    const [selectedListData, setSelectedListData] = React.useState<RelasiInterface[]>([]);
    let gridListData: Grid | any;
    let firstRender: Boolean = true;

    const showSelectedRow = () => {
        setSelectedListData(gridListData.getSelectedRecords());
    };

    const refreshListData = async () => {
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vKodeRelasi = 'all';
                let vNamaRelasi = 'all';
                let vTipe = 'all';
                let vLimit = '10000';

                const response = await axios.get(`${apiUrl}/erp/master_daftar_relasi?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vKodeRelasi,
                        param2: vNamaRelasi,
                        param3: vTipe,
                        paramLimit: vLimit,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const responseData = response.data.data;

                // console.log('Response : ', responseData);

                setDSListData(responseData);
                setDSListDataNonFIlter(responseData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    React.useEffect(() => {
        if (masterState === 'BARU') {
            refreshListData();
        } else {
            setDSListData(originalDataSource);
        }
    }, [masterState]);

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

    const pageSettings: PageSettingsModel = { pageSize: 9 };
    const filterSettings: FilterSettingsModel = { type: 'FilterBar' };
    return (
        <div className="App" id="dialog-target-relasi">
            <DialogComponent
                width="650px"
                isModal={true}
                target="#dialog-target-relasi"
                visible={visibilityForDialogRelasiSupplier}
                close={dialogCloseForHeader}
                overlayClick={onOverlayClickForHeader}
            >
                <div className="h-full w-full">
                    <div className="flex h-[58px] w-full gap-2">
                        <div className="flex  w-[30%] flex-col justify-items-start">
                            <input
                                type="text"
                                id="number-input"
                                ref={inputRef} // Simpan referensi input
                                className={`h-[full] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                                placeholder={'No relasi'}
                                name="jenis_perbaikan"
                                value={searchQuery.no_relasi} // Format hanya saat blur
                                onChange={(e) => {
                                    HandleSearchNoRelasi(e.target.value, setSearchQuery, setDSListData, masterState !== 'BARU' ? originalDataSource : dsListDataNonFIlter);
                                    setTimeout(() => {
                                        inputRef.current?.focus();
                                    }, 0);
                                }}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex  w-[70%] flex-col justify-items-start">
                            <input
                                type="text"
                                id="number-input"
                                className={`h-[full] w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 `}
                                placeholder={'Nama Relasi'}
                                name="jenis_perbaikan"
                                value={searchQuery.nama_relasi} // Format hanya saat blur
                                onChange={(e) => {
                                    HandleSearchNamaRelasi(e.target.value, setSearchQuery, setDSListData, masterState !== 'BARU' ? originalDataSource : dsListDataNonFIlter);
                                }}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="small-grid text-xs">
                        <GridComponent
                            dataSource={dsListData}
                            allowSorting={true}
                            // allowFiltering={true}
                            allowPaging={true}
                            pageSettings={pageSettings}
                            // filterSettings={filterSettings}
                            ref={(g) => (gridListData = g)}
                            height={180}
                            rowHeight={20}
                            recordClick={(args: any) => {
                                if (gridListData) {
                                    const rowIndex: number = args.row.rowIndex;
                                    gridListData.selectRow(rowIndex);
                                    showSelectedRow();
                                }
                            }}
                            recordDoubleClick={() => {
                                if (masterState === 'BARU') {
                                    setSetselectedRelasi(selectedListData);
                                } else {
                                    setKodeSuppEdit(selectedListData[0].kode_supp);
                                    setKode_supplier(selectedListData[0].kode_supp);
                                    console.log('SELECTED LIST DATA EDIT : ', selectedListData[0].kode_supp);
                                }
                                setDialogVisibilityForDialogRelasiSupplier(false);
                            }}
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="kode_relasi" headerText="No. Relasi" width="50" textAlign="Left" />
                                <ColumnDirective field="nama_relasi" headerText="Nama Relasi" width="100" />
                            </ColumnsDirective>
                            <Inject services={[Page, Sort, Filter, Group]} />
                        </GridComponent>
                    </div>
                    <div className="h-full w-full bg-slate-100">
                        <table>
                            <tr>
                                <td className="pe-2 text-right">Alamat</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="cnth: JL. xxxx xxxxx"
                                        value={selectedListData[0]?.alamat}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right"></td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="cnth: desa xxxx kec xxxxx"
                                        value={selectedListData[0]?.alamat2}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Kota</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Kota"
                                        value={selectedListData[0]?.kota}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>Kode Pos</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Kode Pos"
                                            value={selectedListData[0]?.kodepos}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Kecamatan</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Kecamatan"
                                        value={selectedListData[0]?.kecamatan}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>Provinsi</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Propinsi"
                                            value={selectedListData[0]?.propinsi}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Kelurahan</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Kelurahan"
                                        value={selectedListData[0]?.kelurahan}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>Negara</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Negara"
                                            value={selectedListData[0]?.negara}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">No. NPWP</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="No. NPWP"
                                        value={selectedListData[0]?.npwp}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">No. SIUP</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="No. SIUP"
                                        value={selectedListData[0]?.siup}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Personal</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Personal"
                                        value={selectedListData[0]?.personal}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">No. KTP</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="No. KTP"
                                        value={selectedListData[0]?.ktp}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>No. Sim</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="No. Sim"
                                            value={selectedListData[0]?.sim}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Telepon 1</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Telepon 1"
                                        value={selectedListData[0]?.telp}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>Telepon 2</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="Telepon 2"
                                            value={selectedListData[0]?.telp2}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Handphone</td>
                                <td className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Handphone"
                                        value={selectedListData[0]?.hp}
                                        style={{ height: '3vh' }}
                                    />

                                    <div className="grid grid-cols-2">
                                        <span>No. Whatsapp</span>
                                        <input
                                            type="text"
                                            id="namaUserMobile"
                                            className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            placeholder="No. Whatsapp"
                                            value={selectedListData[0]?.hp2}
                                            style={{ height: '3vh' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Email</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Email"
                                        value={selectedListData[0]?.email}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="pe-2 text-right">Website</td>
                                <td>
                                    <input
                                        type="text"
                                        readOnly
                                        id="namaUserMobile"
                                        className="w-full rounded-md border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Website"
                                        value={selectedListData[0]?.website}
                                        style={{ height: '3vh' }}
                                    />
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div className="flex w-full justify-between">
                        <div>
                            <ButtonComponent
                                id="btnHapus"
                                type="submit"
                                onClick={() => {
                                    const targetUrl = '/kcn/ERP/master/daftarRelasi/daftarRelasi';
                                    const queryParams = {
                                        tabId: 'tab_b75h4smsh',
                                        isRedirectFromSupp: true,
                                    };
                                    // Redirect ke URL dengan parameter
                                    router.push({
                                        pathname: targetUrl,
                                        query: queryParams,
                                    });
                                }}
                                cssClass="e-primary e-small"
                                style={styleButtonRelasiBaru}
                            >
                                Relasi Baru
                            </ButtonComponent>
                        </div>
                        <div className="flex">
                            <ButtonComponent
                                onClick={() => {
                                    setSetselectedRelasi(selectedListData);
                                    setDialogVisibilityForDialogRelasiSupplier(false);
                                }}
                                id="btnHapus"
                                type="submit"
                                cssClass="e-primary e-small"
                                style={styleButton}
                            >
                                Ok
                            </ButtonComponent>
                            <ButtonComponent id="btnHapus" type="submit" cssClass="e-primary e-small" style={styleButton} onClick={() => setDialogVisibilityForDialogRelasiSupplier(false)}>
                                Batal
                            </ButtonComponent>
                        </div>
                    </div>
                </div>
            </DialogComponent>
        </div>
    );
}

export default DialogRelasiForSupplier;
