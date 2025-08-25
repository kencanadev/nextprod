import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import moment, { now } from 'moment';
import axios from 'axios';
import {
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    ExcelExport,
    PdfExport,
    Toolbar,
    Grid,
    IEditCell,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ChangeEventArgs } from '@syncfusion/ej2-react-dropdowns';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { FillFromSQL, myAlertGlobal, myAlertGlobal2, usersMenu } from '@/utils/routines';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import styles from './alasan.module.css';

import { DataListView } from './model/api';
import { checkboxEditTemplate2, getCurrentRowDOMValues } from './handler/fungsi';
import { DataManager, Query } from '@syncfusion/ej2/data';
import { myAlertGlobal3 } from '@/utils/global/fungsi';
import { exitCode } from 'process';

L10n.load(idIDLocalization);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}

const DaftarAlasan = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    const dgDataList = useRef<Grid | any>(null); //useRef<any>(null);
    let selectDataGrid: any[] = [];

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [dlgBaru, setDlgBaru] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');

    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: entitas ?? '',
        userid: userid ?? '',
        // kode_user: sessionData?.kode_user ?? '',
        token: token ?? '',
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

    const fetchDataUseEffect = async () => {
        let hasil = false;
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
                hasil = true;
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        return hasil;
    };

    useEffect(() => {
        if (isOpen && entitas && userid && token) {
            // console.log('useEffect');
            fetchDataUseEffect().then(async (result: any) => {
                if (result) {
                    await handleRefreshData();
                }
            });
        }
    }, [isOpen, entitas, userid]);

    const handleSearch = (value: any) => {
        // console.log('value ', value);
        if (dgDataList.current) {
            dgDataList.current.search(value);
        }
    };

    const saveDoc = async (data: any) => {
        let responseAPI: any;

        // console.log('data ', data);
        const detail = data.map((item: any) => ({
            // entitas: entitas,
            alasan: item.alasan,
            alasan_lama: item.alasan_lama ?? undefined,
            dok: item.dok,
            hitung_kpi: item.hitung_kpi,
            userid: item.userid,
            tgl_update: moment(item.tgl_update).format('YYYY-MM-DD HH:mm:ss'), //item.tgl_update,
        }));

        const reqBody = {
            entitas: entitas,
            alasan: [...detail],
        };
        // console.log('reqBody ', reqBody);
        // setIsLoadingProgress(false);
        // setProgressValue(0);
        // setDisplayedProgress(0);
        // throw exitCode;

        setLoadingMessage('Menyimpan dokumen baru...');
        await axios
            .post(`${apiUrl}/erp/master/daftar-lainnya/simpan_alasan`, reqBody, {
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

        if (responseAPI.status === true) {
            let pesan = '';

            pesan = `Simpan data berhasil ${responseAPI.status}`;

            setProgressValue(97);
            setLoadingMessage('Memproses Simpan...');

            myAlertGlobal2(pesan, 'dlgForm').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        // setDlgBaru(false);
                        setProgressValue(100);
                        setDisplayedProgress(100);
                        setLoadingMessage('Complete!');

                        setTimeout(() => {
                            setIsLoadingProgress(false);
                            setProgressValue(0);
                            setDisplayedProgress(0);
                        }, 500);
                        handleRefreshData();
                        onClose();
                    }, 0);
                }
            });
        } else {
            // `Error saving data: Error: Duplicate entry ${nama_termin} for key 2
            if (responseAPI.error.includes('Duplicate')) {
                myAlertGlobal2(`Nama alasan sudah ada `, 'dlgForm').then((result) => {
                    if (result.isConfirmed) {
                        setProgressValue(100);
                        setDisplayedProgress(100);
                        setLoadingMessage('Complete!');

                        setTimeout(() => {
                            setIsLoadingProgress(false);
                            setProgressValue(0);
                            setDisplayedProgress(0);
                            onClose();
                        }, 500);
                    }
                });
            } else {
                myAlertGlobal2(`Simpan gagal - ErrorSaveDoc ${responseAPI.error}`, 'dlgForm').then((result) => {
                    if (result.isConfirmed) {
                        setProgressValue(100);
                        setDisplayedProgress(100);
                        setLoadingMessage('Complete!');

                        setTimeout(() => {
                            setIsLoadingProgress(false);
                            setProgressValue(0);
                            setDisplayedProgress(0);
                            onClose();
                        }, 500);
                    }
                });
            }
        }
    };

    const handleRefreshData = async () => {
        try {
            setIsLoadingProgress(true);
            setProgressValue(0);
            setDisplayedProgress(0);
            setLoadingMessage('Fetching data...');
            const paramList = {
                entitas: entitas,
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

    const [dots, setDots] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleCheckboxChange = (e: any, index: any) => {
        if (!dgDataList.current || !dgDataList.current.dataSource) {
            console.error('Grid or dataSource is not initialized');
            return;
        }

        const dataSource = [...dgDataList.current.dataSource];
        if (index >= 0 && index < dataSource.length) {
            dataSource[index].aktif = e.target.checked ? 'Y' : 'N';
            setDataList(dataSource);
            dgDataList.current.dataSource = dataSource;
        }
    };

    const textInput: IEditCell = {
        params: {
            actionComplete: () => false,

            change: (args: any) => {
                const grid = dgDataList.current;
                const batchChanges = grid.getBatchChanges();
                const selectedRecords = grid.getSelectedRecords();
                if (!selectedRecords || selectedRecords.length === 0) return;
                const selectedRow = selectedRecords[0];
                let idReferensi;
                if (batchChanges?.addedRecords?.length > 0) {
                    // Get the last added record
                    const lastAddedRecord = batchChanges.addedRecords[batchChanges.addedRecords.length - 1];
                    idReferensi = lastAddedRecord.id_daftar;
                } else {
                    // If no added records, get from selected row
                    idReferensi = selectedRow.id_daftar;
                }
                // console.log('idReferensi', idReferensi);

                if (!idReferensi) return;

                const isNewRecord = batchChanges?.addedRecords?.some((record: any) => record.id_daftar === idReferensi);
                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
                const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                const columns = grid.getColumns();
                const activeColumn = columns[colIndex - 1];

                if (isNewRecord) {
                    // console.log('isNewRecord');

                    const addedRecords = batchChanges.addedRecords;
                    const newRecordIndex = addedRecords.findIndex((record: any) => record.id_daftar === idReferensi);

                    if (newRecordIndex >= 0) {
                        // Update the record in addedRecords
                        addedRecords[newRecordIndex] = {
                            ...addedRecords[newRecordIndex],
                            [activeColumn.field]: args.value,
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        };

                        // Update the grid's dataSource by combining existing dataSource with addedRecords
                        const dataSource = [...grid.dataSource];
                        const updatedDataSource = [...dataSource, ...addedRecords];

                        // Update state and grid
                        setDataList(updatedDataSource);
                        grid.dataSource = updatedDataSource;
                        grid.refresh();
                        saveBatch();
                    }
                } else {
                    // console.log('else');
                    // Handle existing record
                    const matchedRecord = grid.contentModule.rows;
                    // console.log('matchedRecord ', matchedRecord);
                    // console.log('[activeColumn.field] ', [activeColumn.field]);
                    matchedRecord.map((item: any, index: number) => {
                        if (item?.changes) {
                            grid.updateCell(index, [activeColumn.field], args.value);
                            grid.updateCell(index, 'userid', userid);
                            grid.updateCell(index, 'tgl_update', moment().format('YYYY-MM-DD HH:mm:ss'));
                        }
                    });

                    // Update the dataSource
                    const dataSource = [...grid.dataSource];
                    const sourceIndex = dataSource.findIndex((row: any) => row.id_daftar === idReferensi);

                    if (sourceIndex >= 0) {
                        dataSource[sourceIndex] = {
                            ...dataSource[sourceIndex],
                            [activeColumn.field]: args.value,
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        };
                    }

                    // Update state and grid
                    setDataList(dataSource);
                    grid.dataSource = dataSource;
                    grid.refresh();
                    saveBatch();
                }
            },
            close: () => {
                const grid = dgDataList.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                        grid.refresh();
                    }, 50);
                }
            },
        },
    };

    const aktifEdit: IEditCell = {
        create: () => {
            const element = document.createElement('input');
            element.type = 'checkbox';
            element.classList.add('e-checkbox');
            element.style.cursor = 'pointer';
            return element;
        },
        read: (element: HTMLInputElement) => {
            return element.checked ? 'Y' : 'N';
        },
        write: (args: any) => {
            const inputElement = args.element as HTMLInputElement;
            inputElement.checked = args.rowData[args.column.field] === 'Y'; // Set nilai awal

            inputElement.onchange = (event: Event) => {
                const grid = dgDataList.current;
                const dataSource = grid.dataSource as any[];
                const rowIndex = dataSource.findIndex((row: any) => row.id_daftar === args.rowData.id_daftar);
                const checkbox = event.target as HTMLInputElement;

                if (rowIndex >= 0 && dataSource[rowIndex]) {
                    dataSource[rowIndex]['hitung_kpi'] = checkbox.checked ? 'Y' : 'N';
                    dataSource[rowIndex]['tgl_update'] = moment().format('YYYY-MM-DD HH:mm:ss');
                }
                saveBatch();
            };
        },
        params: {
            disabled: false,
        },
    };

    const checkboxTemplate = (props: any) => {
        const index = dataList.findIndex((d) => d.id_daftar === props.id_daftar);

        const handleCheckboxChangeView = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (index === -1) return;

            const updated = [...dataList];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    hitung_kpi: e.target.checked ? 'Y' : 'N',
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };

                setDataList(updated);
                if (dgDataList.current) {
                    dgDataList.current.dataSource = updated;
                    dgDataList.current.refresh();
                    saveBatch();
                }
            }
        };

        return <input type="checkbox" name={`hitung_kpi-${index}`} checked={props.hitung_kpi === 'Y'} onChange={handleCheckboxChangeView} style={{ cursor: 'pointer' }} />;
    };

    const saveBatch = async () => {
        (dgDataList.current as GridComponent).editModule.batchSave();
    };

    const [selectedIdTransaksi, setSelectedIdTransaksi] = useState(0);

    const rowSelectingGridDetail = (args: any, jenis: any) => {
        // console.log('fff', args.data);
        setSelectedIdTransaksi(args.data.id_daftar);
    };
    const containerRef = useRef(null);

    const handleAddClick = () => {
        const grid = dgDataList.current;
        const rowsx = grid.getBatchChanges();
        const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { alasan: string }) => row.alasan === '') : false;
        const hasEmptyFieldsGrid = dgDataList.current.dataSource.some((row: { alasan: string }) => row.alasan === '');
        const changed = rowsx.changedRecords.length >= 1;

        if (hasEmptyFields) {
            myAlertGlobal2('Alasan belum diisi.', 'dlgForm');
        } else {
            const lastRowGrid = grid.dataSource.length;
            const lastRowBatch = rowsx.addedRecords.length + 1;
            const newId = lastRowGrid + lastRowBatch;
            const existingData = Array.isArray(dgDataList.current.dataSource) ? dgDataList.current.dataSource : [];

            const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_daftar > max ? item.id_daftar : max), 0);
            let newIdTransaksi = maxIdTransaksi + lastRowBatch;

            const newRecord = {
                id_daftar: newId,
                alasan: '',
                dok: null,
                hitung_kpi: 'N',
                userid: userid,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            (grid as GridComponent).addRecord(newRecord);
        }
    };

    const handleActionBegin = (args: any) => {
        // console.log('args.requestType ', args.requestType);
        if (args.requestType === 'add') {
            const maxId = dataList.length > 0 ? Math.max(...dataList.map((item) => item.id_daftar)) : 0;
            args.data.id_daftar = maxId + 1;
        }

        if (args.requestType === 'save' && args.form) {
            const activeElement = document.activeElement as HTMLElement;
            // console.log('activeElement', activeElement);

            if (activeElement) {
                activeElement.blur();
            }
            const formElements = args?.form?.elements;
            if (formElements) {
                // Jangan overwrite args.data langsung, buat objek baru untuk simpan di state
                const updatedData = { ...args.data };
                // console.log('cccxcxc', updatedData);
                for (let i = 0; i < formElements.length; i++) {
                    const input = formElements[i] as HTMLInputElement;
                    const name = input.name;
                    if (name) {
                        if (input.type === 'checkbox') {
                            updatedData[name] = input.checked ? 'Y' : 'N';
                        } else {
                            updatedData[name] = input.value;
                        }
                    }
                }

                if (args.action === 'add') {
                    setDataList((prev) => [...prev, args.data]);
                } else if (args.action === 'edit') {
                    setDataList((prev) => prev.map((item) => (item.id_daftar === args.data.id_daftar ? args.data : item)));
                }
            }
        }
    };

    const handleActionComplete = (args: any) => {
        if (args.requestType === 'save') {
            let updated = [];

            if (args.action === 'add') {
                updated = [...dataList, args.data];
            } else if (args.action === 'edit') {
                updated = dataList.map((item) => (item.id_daftar === args.data.id_daftar ? args.data : item));
            }

            setDataList(updated);

            // 🔁 Refresh grid secara visual
            setTimeout(() => {
                if (dgDataList.current) {
                    dgDataList.current.dataSource = [...updated];
                    dgDataList.current.refresh();
                }
            }, 0);
        }
    };

    return (
        <DialogComponent
            id="dlgForm"
            header={'Daftar Alasan'}
            target="#master-layout"
            visible={isOpen}
            // showCloseIcon={true}
            width="45%"
            height="75%"
            close={() => {
                onClose();
            }}
            // footerTemplate={footerButtons}
            allowDragging={true}
            position={{ X: 'center', Y: 0 }}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            style={{ position: 'fixed' }}
            open={(args: any) => {
                args.preventFocus = true;
            }}
        >
            <>
                <div className="flex h-full flex-col overflow-hidden rounded border font-sans shadow">
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

                    {/* Header search */}
                    <div className="border-b bg-white p-2">
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
                    </div>
                    {/* Main content scrollable */}
                    <div className="flex-1 overflow-auto bg-gray-50 p-2">
                        {dataList.length > 0 && (
                            <GridComponent
                                key={dataList.length}
                                // key={JSON.stringify(dataList)}
                                id="gridListData"
                                name="gridListData"
                                locale="id"
                                ref={dgDataList}
                                // ref={(g: any) => {
                                //     dgDataList.current = g;
                                // }}
                                dataSource={dataList}
                                textWrapSettings={{ wrapMode: 'Header' }}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                allowTextWrap={true}
                                allowSorting={true}
                                frozenRows={0}
                                rowHeight={20}
                                width="100%"
                                gridLines="Both"
                                allowResizing={true}
                                // actionComplete={(args: any) => {
                                //     actionCompleteGridDetail(args, 'quDtrxBank');
                                // }}
                                enableHover={false}
                                rowSelecting={rowSelectingGridDetail}
                                editSettings={{
                                    allowAdding: true,
                                    allowEditing: true,
                                    allowDeleting: true,
                                    newRowPosition: 'Bottom',
                                    // mode: 'Normal',
                                    mode: 'Batch',
                                    showConfirmDialog: false,
                                }}
                                autoFit={true}
                                // dataBound={() => {
                                //     if (dgDataList.current) {
                                //         const gridInstance = dgDataList.current;
                                //         gridInstance.autoFitColumns(); // auto-fit semua kolom
                                //     }
                                // }}
                                // dataBound={() => {
                                //     if (dgDataList.current) {
                                //         const gridInstance = dgDataList.current;

                                //         // Dapatkan semua field kolom
                                //         const allColumns = gridInstance.getColumns();

                                //         // Filter kolom yang ingin di-autoFit (kecuali 'ekspedisi')
                                //         const columnsToFit = allColumns.filter((col: any) => col.field !== 'kode_pajak').map((col: any) => col.field);

                                //         // Auto-fit hanya kolom yang disaring
                                //         gridInstance.autoFitColumns(columnsToFit);
                                //     }
                                // }}
                                actionBegin={handleActionBegin}
                                actionComplete={handleActionComplete}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective
                                        field="id_daftar"
                                        headerText="No."
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        // autoFit
                                        // width="200"
                                        width="50"
                                        allowEditing={false}
                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                    />
                                    <ColumnDirective
                                        field="alasan"
                                        headerText="Keterangan"
                                        headerTextAlign="Center"
                                        textAlign="Left"
                                        // autoFit
                                        // width="200"
                                        width="400"
                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        edit={textInput}
                                    />

                                    <ColumnDirective field="hitung_kpi" headerText="Hitung KPI" headerTextAlign="Center" textAlign="Center" width="80" template={checkboxTemplate} edit={aktifEdit} />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                            </GridComponent>
                        )}

                        {/* Toolbar bawah grid */}
                        <div className="panel-pager p-2">
                            <div className="flex gap-14">
                                <div className="mt-1 flex">
                                    <ButtonComponent
                                        id="buAdd1"
                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-plus"
                                        style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                        onClick={
                                            () => {
                                                handleAddClick();
                                            }
                                            // addDefaultRowIfEmpty('new')
                                        }
                                    />

                                    {/* <ButtonComponent
                                                id="buDelete1"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-warning e-small"
                                                iconCss="e-icons e-small e-trash"
                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                // onClick={() => DetailBarangDelete()}
                                            />
                                            <ButtonComponent
                                                id="buDeleteAll1"
                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                cssClass="e-danger e-small"
                                                iconCss="e-icons e-small e-erase"
                                                style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                // onClick={() => DetailBarangDeleteAll()}
                                            /> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-2 border-t bg-white p-3">
                        <div className="w-full">
                            <ButtonComponent
                                id="buBatal"
                                content="BATAL"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => onClose()}
                                // disabled={disabledSimpan}
                            />

                            <ButtonComponent
                                id="buSimpan"
                                content="Simpan"
                                cssClass="e-primary e-small"
                                iconCss="e-icons e-small e-save"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={async () => {
                                    // console.log('dataList ', dataList);
                                    try {
                                        await saveBatch();
                                    } finally {
                                        // console.log('dgDataList ', dgDataList.current.dataSource);
                                        myAlertGlobal3('Lanjut simpan data ? ', 'dlgForm').then((result) => {
                                            if (result.isConfirmed) {
                                                setTimeout(async () => {
                                                    setIsLoadingProgress(true);
                                                    setProgressValue(0);
                                                    setDisplayedProgress(0);
                                                    setLoadingMessage('Proses simpan data...');
                                                    await saveDoc(dgDataList.current.dataSource);
                                                    handleRefreshData();
                                                }, 0);
                                            }
                                        });
                                    }
                                }}
                                // disabled={disabledSimpan}
                            />
                        </div>
                    </div>
                </div>
            </>
        </DialogComponent>
    );
};

export default DaftarAlasan;
