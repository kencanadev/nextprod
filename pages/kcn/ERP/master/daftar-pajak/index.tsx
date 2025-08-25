import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import moment, { now } from 'moment';
import axios from 'axios';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport, Toolbar } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { FillFromSQL, usersMenu } from '@/utils/routines';
import { myAlertGlobal, myAlertGlobal2, myAlertGlobal3 } from '@/utils/global/fungsi';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import styles from './pajak.module.css';

import { DataEdit, DataListView } from './model/api';

L10n.load(idIDLocalization);

const DaftarPajak = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    const dgDataList = useRef<any>(null);
    let selectDataGrid: any[] = [];

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [dlgBaru, setDlgBaru] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');

    const [kodePajak, setKodePajak] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [nilai, setNilai] = useState('');
    const [akunJual, setAkunJual] = useState('');
    const [akunBeli, setAkunBeli] = useState('');

    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: sessionData?.kode_entitas ?? '',
        userid: sessionData?.userid ?? '',
        kode_user: sessionData?.kode_user ?? '',
        token: sessionData?.token ?? '',
        masterKodeDokumen: '',
        masterDataState: '',
    });

    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '31700';
    const styleButton = {
        clasname: 'rounded bg-blue-600 px-4 py-2 text-white',
        width: 62 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: '0.8em',
        backgroundColor: '#3b3f5c',
        fontWeight: 'bold',
    };

    const [dataList, setDataList] = useState<any[]>([]);
    const [dataEdit, setDataEdit] = useState<any>([
        {
            kode_pajak: '',
            nama_pajak: '',
            nilai: '',
            catatan: '',
            kode_akun_pajakjual: '',
            kode_akun_pajakbeli: '',
            userid: '',
            tgl_update: '',
            no_akun_jual: '',
            no_akun_beli: '',
            // nama_akun_jual: '',
            // nama_akun_beli: '',
        },
    ]);
    const [kodeOld, setKodeOld] = useState('');
    const [daftarAkun, setDaftarAkun] = useState<any>([]);

    const fetchDataUseEffect = async () => {
        await usersMenu(stateDokumen.kode_entitas, stateDokumen.userid, kode_menu)
            .then((result) => {
                const { baru, edit, hapus, cetak } = result;
                setUserMenu((prevState) => ({
                    ...prevState,
                    baru: baru,
                    edit: edit,
                    hapus: hapus,
                    cetak: cetak,
                }));
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        // const fetchSatuan = async () => {
        await FillFromSQL(kode_entitas, 'akun', '', stateDokumen.token)
            .then((result: any) => {
                // console.log('result ', result);
                setDaftarAkun(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        // };
    };

    const handleFormEdit = async (data: any) => {
        const paramList = {
            entitas: stateDokumen.kode_entitas,
            param1: data,
        };
        await DataEdit(paramList, token).then((result: any) => {
            setDataEdit(result[0]);
            setKodeOld(result[0]?.kode_pajak);
        });
    };

    useEffect(() => {
        if (!isLoading && sessionData) {
            setStateDokumen((prev) => ({
                ...prev,
                kode_entitas: sessionData.kode_entitas ?? '',
                userid: sessionData.userid ?? '',
                kode_user: sessionData.kode_user ?? '',
                token: sessionData.token ?? '',
            }));
        }
    }, [isLoading, sessionData]);

    useEffect(() => {
        if (stateDokumen.kode_entitas && stateDokumen.userid && stateDokumen.token) {
            fetchDataUseEffect();
            handleRefreshData();
        }
    }, [stateDokumen.kode_entitas, stateDokumen.userid, sessionData]);

    useEffect(() => {
        // console.log('useEffect ', stateDokumen.masterDataState);
        // console.log('useEffect dlgBaru', dlgBaru);

        if (dlgBaru && stateDokumen.masterDataState === 'BARU') {
            // console.log('eksekusi');
            setDataEdit({
                kode_pajak: '',
                nama_pajak: '',
                nilai: '',
                catatan: '',
                kode_akun_pajakjual: '',
                kode_akun_pajakbeli: '',
                userid: '',
                tgl_update: '',
                no_akun_jual: '',
                no_akun_beli: '',
            });
        }
    }, [dlgBaru, stateDokumen.masterDataState]);

    const handleOnChangeFormEdit = (e: any, name: any) => {
        const value = e?.value ?? e?.target?.value ?? '';
        // console.log('name ', name);
        // console.log('value ', value);

        setDataEdit((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = (value: any) => {
        // console.log('value ', value);
        if (dgDataList.current) {
            dgDataList.current.search(value);
        }
    };

    const saveDoc = async (data: any) => {
        // console.log('data ', data);
        let responseAPI: any;

        if (!data || Object.keys(data).length === 0) {
            myAlertGlobal2('Belum ada data yang di input', 'dlgPajak');
            return;
        }
        if (data?.kode_pajak === '') {
            myAlertGlobal2('Nama Pajak belum diisi.', 'dlgPajak');
            return;
        }
        if (data?.catatan === '') {
            myAlertGlobal2('Keterangan belum diisi.', 'dlgPajak');
            return;
        }
        if (data?.nilai === '') {
            myAlertGlobal2('Prosentase Pajak belum diisi.', 'dlgPajak');
            return;
        }
        if (data?.no_akun_jual === '') {
            myAlertGlobal2('Akun Pajak Penjualan belum diisi.', 'dlgPajak');
            return;
        }
        if (data?.no_akun_beli === '') {
            myAlertGlobal2('Akun Pajak Pembelian belum diisi.', 'dlgPajak');
            return;
        }

        const reqBody = {
            entitas: kode_entitas,
            kode_pajak: data?.kode_pajak,
            nama_pajak: data?.nama_pajak === '' ? null : data?.nama_pajak,
            nilai: data?.nilai,
            catatan: data?.catatan,
            kode_akun_pajakjual: data?.kode_akun_pajakjual,
            kode_akun_pajakbeli: data?.kode_akun_pajakbeli,
            userid: stateDokumen.userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), //data.tgl_update, //moment().format('YYYY-MM-DD HH:mm:ss'),
            no_akun_jual: data?.no_akun_jual,
            no_akun_beli: data?.no_akun_beli,
            Old_kode_pajak: kodeOld,
        };
        // console.log('reqBody ', reqBody);

        if (stateDokumen.masterDataState === 'BARU') {
            setLoadingMessage('Menyimpan dokumen baru...');
            await axios
                .post(`${apiUrl}/erp/master/daftar-lainnya/simpan_pajak`, reqBody, {
                    headers: {
                        Authorization: `Bearer ${stateDokumen.token}`,
                    },
                })
                .then((result) => {
                    responseAPI = result.data;
                    setProgressValue(50);
                })
                .catch((e: any) => {
                    responseAPI = e.response.data;
                });
        } else {
            await axios
                .post(`${apiUrl}/erp/master/daftar-lainnya/update_pajak`, reqBody, {
                    headers: {
                        Authorization: `Bearer ${stateDokumen.token}`,
                    },
                })
                .then((result) => {
                    responseAPI = result.data;
                    setProgressValue(50);
                })
                .catch((e: any) => {
                    responseAPI = e.response.data;
                });
        }

        if (responseAPI.status === true) {
            let pesan = '';
            setProgressValue(97);
            setLoadingMessage('Memproses Simpan...');
            if (stateDokumen.masterDataState === 'BARU') {
                pesan = `Simpan data berhasil ${responseAPI.status}`;
            } else {
                pesan = `Update / edit data berhasil ${responseAPI.status}`;
            }
            myAlertGlobal2(pesan, 'dlgPajak').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        setDlgBaru(false);
                        handleRefreshData();
                    }, 0);
                }
            });
        } else {
            // `Error saving data: Error: Duplicate entry ${nama_termin} for key 2
            // if (responseAPI.error.includes('Duplicate')) {
            //     myAlertGlobal2(`Nama termin atau metode pembayaran ${nama_termin} sudah ada `, 'dlgTermin');
            // } else {
            myAlertGlobal2(`Simpan gagal - ErrorSaveDoc ${responseAPI.error}`, 'dlgPajak');
            // }
        }
    };

    const handleRefreshData = async () => {
        try {
            setIsLoadingProgress(true);
            setProgressValue(0);
            setDisplayedProgress(0);
            setLoadingMessage('Fetching data...');
            const paramList = {
                entitas: kode_entitas,
            };
            await DataListView(paramList, token).then((result: any) => {
                // console.log('result ', result);
                setDataList(result);
                if (dgDataList.current) {
                    dgDataList.current.dataSource = result;
                }
            });

            setProgressValue(100);
            setDisplayedProgress(100);
            setLoadingMessage('Complete!');

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
            }, 500);
        } catch (error) {
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
            console.error(error);
        }
    };

    const footerButtons = () => (
        <div>
            <ButtonComponent
                type="button"
                cssClass="e-primary e-small"
                onClick={async () => {
                    myAlertGlobal3('Lanjut simpan data ? ', 'dlgPajak').then((result) => {
                        if (result.isConfirmed) {
                            setTimeout(async () => {
                                await saveDoc(dataEdit);
                                handleRefreshData();
                            }, 0);
                        }
                    });
                }}
            >
                Simpan
            </ButtonComponent>
            <ButtonComponent type="button" cssClass="e-primary e-small" onClick={() => setDlgBaru(false)}>
                Batal
            </ButtonComponent>
        </div>
    );

    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="main min-h-screen" id="pajakList">
            {isLoadingProgress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-center space-x-2 text-center text-lg font-semibold">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
                            <div className="animate-pulse align-middle">
                                {loadingMessage}
                                {dots}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {progressValue > 0 ? (
                                <div className="relative">
                                    <ProgressBarComponent
                                        id="circular-progress"
                                        type="Circular"
                                        height="160px"
                                        width="160px"
                                        trackThickness={15}
                                        progressThickness={15}
                                        cornerRadius="Round"
                                        trackColor="#f3f3f3"
                                        progressColor="#3b3f5c"
                                        animation={{
                                            enable: true,
                                            duration: 2000,
                                            delay: 0,
                                        }}
                                        value={progressValue}
                                    >
                                        <Inject services={[ProgressAnnotation]} />
                                    </ProgressBarComponent>
                                    <div className="absolute left-0 right-0 top-0 flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold">{`${displayedProgress}%`}</span>
                                            <div className="text-sm text-gray-500">Complete</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-blue-500"></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full rounded-md border-b bg-white p-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between px-1">
                    <div className={styles.button__container}>
                        <div className={styles.button__row}>
                            <ButtonComponent
                                className="btn"
                                id="btnBaru"
                                cssClass="e-primary e-small"
                                style={styleButton}
                                disabled={userMenu.baru === 'Y' || userid === 'administrator' ? false : true}
                                onClick={() => {
                                    setDataEdit({
                                        kode_pajak: '',
                                        nama_pajak: '',
                                        nilai: '',
                                        catatan: '',
                                        kode_akun_pajakjual: '',
                                        kode_akun_pajakbeli: '',
                                        userid: '',
                                        tgl_update: '',
                                        no_akun_jual: '',
                                        no_akun_beli: '',
                                    });
                                    setStateDokumen((prevState: any) => ({
                                        ...prevState,
                                        masterDataState: 'BARU',
                                    }));
                                    // console.log('mode BARU, kode_akun_pajakjual:', dataEdit);

                                    setDlgBaru(true);
                                }}
                                content="Baru"
                            ></ButtonComponent>
                            <ButtonComponent
                                className="btn"
                                id="btnEdit"
                                cssClass="e-primary e-small"
                                style={styleButton}
                                disabled={userMenu.edit === 'Y' || userid === 'administrator' ? false : true}
                                onClick={() => {
                                    selectDataGrid = dgDataList.current.getSelectedRecords();
                                    if (selectDataGrid.length > 0) {
                                        setStateDokumen((prevState: any) => ({
                                            ...prevState,
                                            masterKodeDokumen: selectDataGrid[0]?.kode_mu,
                                            masterDataState: 'EDIT',
                                        }));
                                        setDlgBaru(true);
                                    } else {
                                        myAlertGlobal('Silahkan Pilih data yang akan di edit', 'fpmbList');
                                        return;
                                    }
                                }}
                                content="Ubah"
                            ></ButtonComponent>
                            <ButtonComponent
                                id="btnRefresh"
                                className="btn"
                                cssClass="e-primary e-small"
                                style={styleButton}
                                content="Refresh"
                                onClick={() => {
                                    // console.log('dataList ', dataList);
                                    handleRefreshData();
                                }}
                            ></ButtonComponent>
                        </div>
                    </div>
                    <div className="mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                        <div className="text-right text-lg font-semibold">Daftar Kurs Mata Uang</div>
                    </div>
                </div>
            </div>
            <div className="flex h-auto  w-full">
                <div className="mt-2 w-full items-center justify-between rounded-md border-b bg-white p-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)] ">
                    <div
                        id="main-content"
                        style={{ position: 'sticky', height: 'calc(100vh - 130px)', overflow: 'hidden' }}
                        className="flex h-auto w-full "
                        // className="flex flex-col gap-1 overflow-auto"
                    >
                        <div
                            className="panel w-full border-l-[5px] border-white"
                            style={{
                                background: '#dedede',
                                height: 'auto',
                                overflow: 'auto',
                            }}
                        >
                            <div className="mb-2  w-full items-center border border-black bg-white" style={{ display: 'inline-block' }}>
                                <TextBoxComponent
                                    id="cariData"
                                    name="edCari"
                                    placeholder="Search..."
                                    cssClass="e-outline"
                                    showClearButton={true}
                                    input={(args: FocusInEventArgs) => {
                                        const value: any = args.value;
                                        handleSearch(args.value);
                                    }}
                                />
                            </div>

                            <div className="overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
                                <GridComponent
                                    id="gridListData"
                                    locale="id"
                                    ref={dgDataList}
                                    allowExcelExport={true}
                                    dataSource={dataList}
                                    selectionSettings={{
                                        mode: 'Row',
                                        type: 'Single',
                                    }}
                                    allowPaging={true}
                                    allowSorting={true}
                                    allowFiltering={false}
                                    allowResizing={true}
                                    allowReordering={true}
                                    pageSettings={{
                                        pageSize: 25,
                                        pageCount: 5,
                                        pageSizes: ['25', '50', '100', 'All'],
                                    }}
                                    rowHeight={22}
                                    // width={'100%'}
                                    gridLines={'Both'}
                                    recordDoubleClick={async (args: any) => {
                                        if (dgDataList) {
                                            const rowIndex: number = args.row.rowIndex;
                                            dgDataList.current.selectRow(rowIndex);

                                            setStateDokumen((prevState: any) => ({
                                                ...prevState,
                                                masterKodeDokumen: args.rowData.kode_pajak,
                                                masterDataState: 'EDIT',
                                            }));
                                            await handleFormEdit(args.rowData.kode_pajak);
                                            setDlgBaru(true);
                                        }
                                    }}
                                    rowSelecting={(args: any) => {
                                        if (dgDataList) {
                                            setStateDokumen((prevState: any) => ({
                                                ...prevState,
                                                masterKodeDokumen: args.data.mu,
                                            }));
                                        }
                                    }}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    // dataBound={() => {
                                    //     if (dgDataList.current) {
                                    //         const gridInstance = dgDataList.current;
                                    //         gridInstance.autoFitColumns(); // auto-fit semua kolom
                                    //     }
                                    // }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="kode_pajak"
                                            headerText="Kode Pajak"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="10"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="catatan"
                                            headerText="Keterangan"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="10"
                                            clipMode="EllipsisWithTooltip"
                                            // type="date"
                                            // format={formatDate}
                                        />
                                        <ColumnDirective
                                            field="nilai"
                                            headerText="Nilai (%)"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            //autoFit
                                            width="10"
                                            clipMode="EllipsisWithTooltip"
                                            // type="date"
                                            // format={formatDate}
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {dlgBaru && (
                <DialogComponent
                    id="dlgPajak"
                    header={stateDokumen.masterDataState === 'BARU' ? 'Pajak Baru' : 'Edit Pajak'}
                    target="#pajakList"
                    visible={dlgBaru}
                    // showCloseIcon={true}
                    width="600px"
                    close={() => {
                        setDataEdit({
                            kode_pajak: '',
                            nama_pajak: '',
                            nilai: '',
                            catatan: '',
                            kode_akun_pajakjual: '',
                            kode_akun_pajakbeli: '',
                            userid: '',
                            tgl_update: '',
                            no_akun_jual: '',
                            no_akun_beli: '',
                        });
                        setDlgBaru(false);
                    }}
                    footerTemplate={footerButtons}
                    allowDragging={true}
                    position={{ X: 'center', Y: 20 }}
                    animationSettings={{ effect: 'None', duration: 0 }}
                    isModal={true}
                >
                    <form className={styles.pajak_form}>
                        <div className={styles.form_group}>
                            <label style={{ fontWeight: 'bold' }}>Kode Pajak</label>
                            {/* <input type="text" className="e-input" value={kodePajak} onChange={(e) => setKodePajak(e.target.value)} /> */}
                            <TextBoxComponent
                                value={dataEdit?.kode_pajak}
                                // readOnly={true}
                                cssClass={`e-outline`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                // onChange={(e: any) => setKodePajak(e.target.value)}
                                // onChange={(e: any) => setKodePajak(e.target.value)}
                                onChange={(e: any) => {
                                    handleOnChangeFormEdit(e, 'kode_pajak');
                                }}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label style={{ fontWeight: 'bold' }}>Keterangan</label>
                            {/* <input type="text" className="e-input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} style={{ width: '100%' }} /> */}
                            <TextBoxComponent
                                value={dataEdit?.catatan}
                                // readOnly={true}
                                cssClass={`e-outline`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                // onChange={(e: any) => setKeterangan(e.target.value)}
                                onChange={(e: any) => {
                                    handleOnChangeFormEdit(e, 'catatan');
                                }}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label className={styles.label_bold}>Nilai (%)</label>

                            <NumericTextBoxComponent
                                value={
                                    Number(
                                        (dataEdit?.nilai || '').toString().replace(/,/g, '') // 🔧 hapus koma ribuan
                                    ) || 0
                                }
                                format="n2"
                                step={0.01}
                                min={0}
                                cssClass={`e-outline ${styles.no_spin}`}
                                showSpinButton={false}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                change={(e: any) => {
                                    // console.log('vvvvv ', e.value.toString());
                                    // handleOnChangeFormEdit(e.value?.toString(), 'nilai');
                                    setDataEdit((prev: any) => ({
                                        ...prev,
                                        nilai: e.value?.toString() ?? '',
                                    }));
                                }}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label style={{ fontWeight: 'bold' }}>Akun Pajak Penjualan</label>
                            <div className={styles.akun_row}>
                                <input
                                    type="text"
                                    // className="e-input kode_akun"
                                    className={styles.akun_kode}
                                    value={daftarAkun.find((item: any) => item.kode_akun === dataEdit?.kode_akun_pajakjual)?.no_akun || dataEdit?.no_akun_jual || ''}
                                    readOnly
                                />

                                <DropDownListComponent
                                    className={styles.dropdown_akun}
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px' }}
                                    fields={{ text: 'nama_akun', value: 'kode_akun' }}
                                    placeholder="Pilih Akun Penjualan"
                                    popupHeight="200px"
                                    dataSource={daftarAkun}
                                    value={dataEdit?.kode_akun_pajakjual || ''}
                                    change={(e: any) => {
                                        const selectedItem = e.itemData;
                                        // console.log('selectedItem ', selectedItem);
                                        // console.log('selectedItem eeeeeeeee', e);

                                        if (selectedItem) {
                                            // handleOnChangeFormEdit(selectedItem.kode_akun, 'kode_akun_pajakjual');
                                            setDataEdit((prev: any) => ({
                                                ...prev,
                                                kode_akun_pajakjual: selectedItem.kode_akun,
                                                no_akun_jual: selectedItem.no_akun,
                                            }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className={styles.form_group}>
                            <label style={{ fontWeight: 'bold' }}>Akun Pajak Pembelian</label>
                            <div className={styles.akun_row}>
                                <input
                                    type="text"
                                    // className="e-input kode_akun"
                                    className={styles.akun_kode}
                                    // value={daftarAkun.find((item: any) => item.kode_akun === dataEdit?.kode_akun_pajakbeli)?.no_akun || ''}
                                    value={daftarAkun.find((item: any) => item.kode_akun === dataEdit?.kode_akun_pajakbeli)?.no_akun || dataEdit?.no_akun_beli || ''}
                                    readOnly
                                />

                                <DropDownListComponent
                                    className={styles.dropdown_akun}
                                    style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px' }}
                                    dataSource={daftarAkun}
                                    fields={{ text: 'nama_akun', value: 'kode_akun' }}
                                    placeholder="Pilih Akun Pembelian"
                                    value={dataEdit?.kode_akun_pajakbeli || ''}
                                    change={(e: any) => {
                                        const selectedItem = e.itemData;
                                        // console.log('selectedItem ', selectedItem);
                                        // console.log('selectedItem eeeeeeeee', e);

                                        if (selectedItem) {
                                            // handleOnChangeFormEdit(selectedItem.kode_akun, 'kode_akun_pajakjual');
                                            setDataEdit((prev: any) => ({
                                                ...prev,
                                                kode_akun_pajakbeli: selectedItem.kode_akun,
                                                no_akun_beli: selectedItem.no_akun,
                                            }));
                                        }
                                    }}
                                    popupHeight="200px"
                                />
                            </div>
                        </div>
                    </form>
                </DialogComponent>
            )}
        </div>
    );
};

export default DaftarPajak;
