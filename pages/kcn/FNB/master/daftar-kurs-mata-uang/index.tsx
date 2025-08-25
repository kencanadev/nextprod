import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import moment, { now } from 'moment';
import axios from 'axios';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport, Toolbar } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { myAlertGlobal, myAlertGlobal2, usersMenu } from '@/utils/routines';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import styles from './kurs.module.css';

import { DataEdit, DataListView } from './model/api';
import { myAlertGlobal3 } from '@/utils/global/fungsi';

L10n.load(idIDLocalization);

const DaftarKursMataUang = () => {
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
            entitas: '',
            kode_mu: '',
            kurs: '',
            kurs_pajak: '',
            negara: '',
            simbol: '',
            userid: '',
            tgl_update: '',
            Old_kode_mu: '',
        },
    ]);
    const [kodeMu, setKodeMu] = useState('');

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
    };

    const handleFormEdit = async (data: any) => {
        const paramList = {
            entitas: stateDokumen.kode_entitas,
            param1: data,
        };
        await DataEdit(paramList, token).then((result: any) => {
            setDataEdit(result[0]);
            setKodeMu(result[0]?.kode_mu);
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
        if (dlgBaru && stateDokumen.masterDataState === 'BARU') {
            setDataEdit({
                entitas: '',
                kode_mu: '',
                kurs: '',
                kurs_pajak: '',
                negara: '',
                simbol: '',
                userid: '',
                tgl_update: '',
                Old_kode_mu: '',
            });
        }
    }, [dlgBaru, stateDokumen.masterDataState]);

    const handleOnChangeFormEdit = (e: any, name: any) => {
        const value = e?.value ?? e?.target?.value ?? '';
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
        let responseAPI: any;

        if (!data || Object.keys(data).length === 0) {
            myAlertGlobal2('Belum ada data yang di input', 'dlgKurs');
            return;
        }
        if (data?.kode_mu === '') {
            myAlertGlobal2('Mata Uang belum diisi', 'dlgKurs');
            return;
        }
        if (data?.negara === '') {
            myAlertGlobal2('Negara belum diisi', 'dlgKurs');
            return;
        }
        if (data?.kurs === '') {
            myAlertGlobal2('Kurs belum diisi', 'dlgKurs');
            return;
        }
        if (data?.kurs_pajak === '') {
            myAlertGlobal2('Kurs Pajak belum diisi', 'dlgKurs');
            return;
        }

        const reqBody = {
            entitas: kode_entitas,
            kode_mu: data?.kode_mu,
            kurs: data?.kurs,
            kurs_pajak: data?.kurs_pajak,
            negara: data?.negara,
            simbol: data?.simbol,
            userid: stateDokumen.userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), //data.tgl_update, //moment().format('YYYY-MM-DD HH:mm:ss'),
            Old_kode_mu: kodeMu,
        };

        if (stateDokumen.masterDataState === 'BARU') {
            setLoadingMessage('Menyimpan dokumen baru...');
            await axios
                .post(`${apiUrl}/erp/master/daftar-lainnya/simpan_kurs_mata_uang`, reqBody, {
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
                .post(`${apiUrl}/erp/master/daftar-lainnya/update_kurs_mata_uang`, reqBody, {
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
            if (stateDokumen.masterDataState === 'BARU') {
                pesan = `Simpan data berhasil ${responseAPI.status}`;
            } else {
                pesan = `Update / edit data berhasil ${responseAPI.status}`;
            }
            setProgressValue(97);
            setLoadingMessage('Memproses Simpan...');

            myAlertGlobal2(pesan, 'dlgKurs').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        setDlgBaru(false);
                        handleRefreshData();
                    }, 0);
                }
            });
        } else {
            myAlertGlobal2(`Simpan gagal - ErrorSaveDoc ${responseAPI.error}`, 'dlgKurs');
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
                    myAlertGlobal3('Lanjut simpan data ? ', 'dlgKurs').then((result) => {
                        if (result.isConfirmed) {
                            setTimeout(async () => {
                                saveDoc(dataEdit);
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
        <div className="main min-h-screen" id="kursList">
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
                                    setStateDokumen((prevState: any) => ({
                                        ...prevState,
                                        masterDataState: 'BARU',
                                    }));

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
                                    width={'100%'}
                                    gridLines={'Both'}
                                    recordDoubleClick={async (args: any) => {
                                        if (dgDataList) {
                                            const rowIndex: number = args.row.rowIndex;
                                            dgDataList.current.selectRow(rowIndex);

                                            setStateDokumen((prevState: any) => ({
                                                ...prevState,
                                                masterKodeDokumen: args.rowData.kode_mu,
                                                masterDataState: 'EDIT',
                                            }));
                                            await handleFormEdit(args.rowData.kode_mu);
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
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="kode_mu"
                                            headerText="Mata Uang"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="20"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="negara"
                                            headerText="Negara"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="30"
                                            clipMode="EllipsisWithTooltip"
                                            // type="date"
                                            // format={formatDate}
                                        />
                                        <ColumnDirective
                                            field="simbol"
                                            headerText="Simbol"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="20"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />

                                        <ColumnDirective
                                            field="kurs"
                                            headerText="Kurs"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            //autoFit
                                            width="20"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                            format="N2"
                                        />
                                        <ColumnDirective
                                            field="kurs_pajak"
                                            headerText="Kurs Pajak"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            //autoFit
                                            width="20"
                                            clipMode="EllipsisWithTooltip"
                                            format="N2"
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
                    id="dlgKurs"
                    header={stateDokumen.masterDataState === 'BARU' ? 'Mata Uang Baru' : 'Edit Mata Uang'}
                    target="#kursList"
                    visible={dlgBaru}
                    // showCloseIcon={true}
                    width="400px"
                    close={() => {
                        setDlgBaru(false);
                    }}
                    footerTemplate={footerButtons}
                    allowDragging={true}
                    position={{ X: 'center', Y: 20 }}
                    animationSettings={{ effect: 'None', duration: 0 }}
                    isModal={true}
                >
                    <form className="currency-form">
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold' }}>Mata Uang</label>
                            <TextBoxComponent
                                value={dataEdit?.kode_mu}
                                cssClass={`e-outline`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                onChange={(e: any) => {
                                    handleOnChangeFormEdit(e, 'kode_mu');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold' }}>Negara</label>
                            <TextBoxComponent
                                value={dataEdit?.negara}
                                cssClass={`e-outline`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                onChange={(e: any) => {
                                    handleOnChangeFormEdit(e, 'negara');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold' }}>Simbol</label>
                            <TextBoxComponent
                                value={dataEdit?.simbol}
                                cssClass={`e-outline`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                                onChange={(e: any) => {
                                    handleOnChangeFormEdit(e, 'simbol');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold' }}>Kurs</label>
                            <NumericTextBoxComponent
                                value={
                                    Number(
                                        (dataEdit?.kurs || '').toString().replace(/,/g, '') // 🔧 hapus koma ribuan
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
                                    setDataEdit((prev: any) => ({
                                        ...prev,
                                        kurs: e.value?.toString() ?? '',
                                    }));
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold' }}>Kurs Pajak</label>
                            <NumericTextBoxComponent
                                value={
                                    Number(
                                        (dataEdit?.kurs_pajak || '').toString().replace(/,/g, '') // 🔧 hapus koma ribuan
                                    ) || 0
                                }
                                format="n2" // format 2 desimal: 1,000.00
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
                                    setDataEdit((prev: any) => ({
                                        ...prev,
                                        kurs_pajak: e.value?.toString() ?? '',
                                    }));
                                }}
                            />
                        </div>
                    </form>
                </DialogComponent>
            )}
        </div>
    );
};

export default DaftarKursMataUang;
