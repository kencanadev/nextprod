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
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, NumericTextBoxComponent, NumericTextBox } from '@syncfusion/ej2-react-inputs';
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
import styles from './daftarLibur.module.css';
import { DataListView, fetchHariLibur } from './model/api';
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

type HariLibur = {
    Tanggal: string; // format: '2025-05-21'
    Keterangan: string;
};

const DaftarLibur = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    const dgDataList = useRef<Grid | any>(null); //useRef<any>(null);

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');

    const [listPph, setListPph] = useState<any>([]);

    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: entitas ?? '',
        userid: userid ?? '',

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
    const kode_menu = '21415';

    const [dataList, setDataList] = useState<any[]>([]);
    const [kalenderBaru, setKalenderBaru] = useState(false);
    const [selectDataGrid, setSelectDataGrid] = useState<any[]>([]);

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
        await FillFromSQL(entitas, 'pph23', '', token)
            .then((result: any) => {
                setListPph(result);
                hasil = true;
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        return hasil;
    };

    useEffect(() => {
        if (isOpen && entitas && userid && token) {
            setTimeout(async () => {
                fetchDataUseEffect().then(async (result: any) => {
                    if (result) {
                        await handleRefreshData();
                    }
                });
            }, 0);
            // myAlertGlobal2('Setting hari libur digenerate otomatis setiap tahun dibulan Januari sesuai SKB. ', 'dlgForm').then((result) => {
            //     if (result.isConfirmed) {
            //         setTimeout(async () => {
            //             fetchDataUseEffect().then(async (result: any) => {
            //                 if (result) {
            //                     await handleRefreshData();
            //                 }
            //             });
            //         }, 0);
            //     }
            // });
        }
    }, [isOpen, entitas, userid]);

    const handleSearch = (value: any) => {
        if (dgDataList.current) {
            dgDataList.current.search(value);
        }
    };

    const validateBeforeSave = () => {
        for (let i = 0; i < dgDataList.current.length; i++) {
            const row = dgDataList.current[i];
            const t1 = parseFloat(row.tonase1);
            const t2 = parseFloat(row.tonase2);

            if (isNaN(t1) || t1 < 0) {
                myAlertGlobal2(`Tonase 1 belum diisi atau kurang dari 0 di baris ${i + 1}`, 'dlgForm');
                return false;
            }

            if (isNaN(t2) || t2 < 0) {
                myAlertGlobal2(`Tonase 2 belum diisi atau kurang dari 0 di baris ${i + 1}`, 'dlgForm');
                return false;
            }

            if (t2 < t1) {
                myAlertGlobal2(`Tonase 1 lebih besar dari Tonase 2 di baris ${i + 1}`, 'dlgForm');
                return false;
            }
        }

        return true;
    };

    const saveDoc = async (data: any) => {
        if (!validateBeforeSave()) {
            return; // blok simpan kalau validasi gagal
        }
        let responseAPI: any;

        const detail = data.map((item: any) => ({
            tgl_libur: item.tgl_libur,
            tgl_libur_lama: item.tgl_libur_lama ?? undefined,
            keterangan: item.keterangan,
            userid: item.userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), //item.tgl_update, //moment().format('YYYY-MM-DD HH:mm:ss'),
        }));

        const reqBody = {
            entitas: entitas,
            libur: [...detail],
        };

        // console.log('reqBody ', reqBody);
        // throw exitCode;

        setLoadingMessage('Menyimpan dokumen baru...');
        await axios
            .post(`${apiUrl}/erp/master/daftar-lainnya/simpan_libur`, reqBody, {
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
            if (responseAPI.error.includes('Duplicate')) {
                myAlertGlobal2(`Data sudah ada `, 'dlgForm');
                setProgressValue(100);
                setDisplayedProgress(100);
                setLoadingMessage('Complete!');

                setTimeout(() => {
                    setIsLoadingProgress(false);
                    setProgressValue(0);
                    setDisplayedProgress(0);
                }, 500);
                onClose();
            } else {
                myAlertGlobal2(`Simpan gagal - ErrorSaveDoc ${responseAPI.error}`, 'dlgForm');
                setProgressValue(100);
                setDisplayedProgress(100);
                setLoadingMessage('Complete!');

                setTimeout(() => {
                    setIsLoadingProgress(false);
                    setProgressValue(0);
                    setDisplayedProgress(0);
                }, 500);
                onClose();
            }
        }
    };

    const handleDialogClose = async () => {
        if (kalenderBaru) {
            myAlertGlobal3('Kalender libur otomatis belum disimpan. Yakin keluar ? ', 'dlgForm').then((result) => {
                if (result.isConfirmed) {
                    onClose();
                }
            });
        } else {
            onClose();
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
                if (result.length > 0) {
                    setDataList(result);
                    if (dgDataList.current) {
                        dgDataList.current.dataSource = result;
                    }
                } else {
                    myAlertGlobal2(`Data tanggal libur belum tersedia. Generate Otomatis ?`, 'dlgForm').then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const tahunSekarang = new Date().getFullYear();
                                const response = await fetchHariLibur(tahunSekarang);
                                setKalenderBaru(true);
                                setDataList(response);
                                if (dgDataList.current) {
                                    dgDataList.current.dataSource = result;
                                }
                            } catch (error) {
                                console.error('Gagal mengambil data hari libur:', error);
                            }
                        }
                    });
                }
            });
            // const bulanSekarang = new Date().getMonth(); // Januari = 0
            // if (bulanSekarang === 0) {
            //     // Bulan Januari
            //     // console.log('Lakukan aksi A');
            //     try {
            //         const tahunSekarang = new Date().getFullYear();

            //         const response = await fetchHariLibur(tahunSekarang);
            //         setKalenderBaru(true);
            //         setDataList(response);
            //     } catch (error) {
            //         console.error('Gagal mengambil data hari libur:', error);
            //     }
            // } else {
            //     // Selain Januari
            //     // console.log('Lakukan aksi B');
            //     await DataListView(paramList, token).then((result: any) => {
            //         setDataList(result);
            //         if (dgDataList.current) {
            //             dgDataList.current.dataSource = result;
            //         }
            //     });
            // }

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

    const Pph23: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(listPph),
            fields: { text: 'catatan', value: 'kode_pajak' },
            query: new Query(),
            change: (args: any) => {
                const grid = dgDataList.current;
                const selectedRow = grid.getSelectedRecords()[0];

                const dataSource = grid.dataSource as any[];
                const rowIndex = dataSource.findIndex((row: any) => row.id_merek === selectedRow.id_merek);

                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');

                if (editCell) {
                    const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                    const columns = grid.getColumns();
                    const activeColumn = columns[colIndex - 1];
                    if (rowIndex >= 0 && dataSource[rowIndex] && activeColumn?.field) {
                        dataSource[rowIndex][activeColumn.field] = args.value;
                        saveBatch();
                    }
                } else {
                    console.log('No active column found');
                }
            },
            close: () => {
                const grid = dgDataList.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50);
                }
            },
        },
    };

    // const textInput: IEditCell = {
    //     params: {
    //         actionComplete: () => false,

    //         change: (args: any) => {
    //             const grid = dgDataList.current;
    //             const batchChanges = grid.getBatchChanges();
    //             const selectedRecords = grid.getSelectedRecords();
    //             if (!selectedRecords || selectedRecords.length === 0) return;
    //             const selectedRow = selectedRecords[0];
    //             let idReferensi;
    //             if (batchChanges?.addedRecords?.length > 0) {
    //                 // Get the last added record
    //                 const lastAddedRecord = batchChanges.addedRecords[batchChanges.addedRecords.length - 1];
    //                 idReferensi = lastAddedRecord.id_referensi;
    //             } else {
    //                 // If no added records, get from selected row
    //                 idReferensi = selectedRow.id_referensi;
    //             }
    //             // console.log('idReferensi', idReferensi);

    //             if (!idReferensi) return;

    //             const isNewRecord = batchChanges?.addedRecords?.some((record: any) => record.id_referensi === idReferensi);
    //             const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
    //             const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
    //             const columns = grid.getColumns();
    //             const activeColumn = columns[colIndex - 1];

    //             if (isNewRecord) {
    //                 // console.log('isNewRecord');

    //                 const addedRecords = batchChanges.addedRecords;
    //                 const newRecordIndex = addedRecords.findIndex((record: any) => record.id_referensi === idReferensi);

    //                 if (newRecordIndex >= 0) {
    //                     // Update the record in addedRecords
    //                     addedRecords[newRecordIndex] = {
    //                         ...addedRecords[newRecordIndex],
    //                         [activeColumn.field]: args.value,
    //                         userid: userid,
    //                         tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    //                     };

    //                     // Update the grid's dataSource by combining existing dataSource with addedRecords
    //                     const dataSource = [...grid.dataSource];
    //                     const updatedDataSource = [...dataSource, ...addedRecords];

    //                     // Update state and grid
    //                     setDataList(updatedDataSource);
    //                     grid.dataSource = updatedDataSource;
    //                     grid.refresh();
    //                     saveBatch();
    //                 }
    //             } else {
    //                 // Handle existing record
    //                 const matchedRecord = grid.contentModule.rows;

    //                 matchedRecord.map((item: any, index: number) => {
    //                     if (item?.changes) {
    //                         grid.updateCell(index, [activeColumn.field], args.value);
    //                         grid.updateCell(index, 'userid', userid);
    //                         grid.updateCell(index, 'tgl_update', moment().format('YYYY-MM-DD HH:mm:ss'));
    //                     }
    //                 });

    //                 // Update the dataSource
    //                 const dataSource = [...grid.dataSource];
    //                 const sourceIndex = dataSource.findIndex((row: any) => row.id_referensi === idReferensi);
    //                 console.log('dataSource awal', dataSource);

    //                 if (sourceIndex >= 0) {
    //                     dataSource[sourceIndex] = {
    //                         ...dataSource[sourceIndex],
    //                         [activeColumn.field]: args.value,
    //                         userid: userid,
    //                         tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    //                     };
    //                 }

    //                 // Update state and grid
    //                 // console.log('dataSource akhir', dataSource);
    //                 setDataList(dataSource);
    //                 grid.dataSource = dataSource;
    //                 grid.refresh();
    //                 saveBatch();
    //             }
    //         },
    //         close: () => {
    //             const grid = dgDataList.current;
    //             if (grid) {
    //                 setTimeout(() => {
    //                     grid.endEdit();
    //                 }, 50);
    //             }
    //         },
    //     },
    // };

    const textInput: IEditCell = {
        params: {
            blur: (args: any) => {
                const grid = dgDataList.current;
                const rowIndex = grid.getSelectedRowIndexes()[0]; // Simpan baris yang dipilih
                let scrollTop = 0;
                if (grid && grid.contentModule && typeof grid.contentModule.getScrollTop === 'function') {
                    scrollTop = grid.contentModule.getScrollTop();
                }
                const batchChanges = grid.getBatchChanges();
                const selectedRecords = grid.getSelectedRecords();
                if (!selectedRecords || selectedRecords.length === 0) return;
                const selectedRow = selectedRecords[0];
                let idReferensi;

                if (batchChanges?.addedRecords?.length > 0) {
                    const lastAddedRecord = batchChanges.addedRecords[batchChanges.addedRecords.length - 1];
                    idReferensi = lastAddedRecord.id_referensi;
                } else {
                    idReferensi = selectedRow.id_referensi;
                }

                if (!idReferensi) return;

                const isNewRecord = batchChanges?.addedRecords?.some((record: any) => record.id_referensi === idReferensi);
                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
                const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                const columns = grid.getColumns();
                const activeColumn = columns[colIndex - 1];

                const inputElement = editCell.querySelector('input') as HTMLInputElement;
                let inputValue = inputElement?.value;

                if (activeColumn.type === 'date' && inputValue) {
                    // Normalisasi: ganti semua / jadi - dan hilangkan spasi
                    inputValue = inputValue.replace(/\//g, '-').trim();

                    // Coba parse beberapa format yang umum
                    const parsedDate = moment(inputValue, ['DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'], true);

                    if (parsedDate.isValid()) {
                        inputValue = parsedDate.format('YYYY-MM-DD'); // Format ISO
                    } else {
                        myAlertGlobal2(`Format tanggal tidak valid: ${inputValue}`, 'dlgForm');
                        return;
                    }
                }

                if (isNewRecord) {
                    const addedRecords = batchChanges.addedRecords;
                    const newRecordIndex = addedRecords.findIndex((record: any) => record.id_referensi === idReferensi);

                    if (newRecordIndex >= 0) {
                        addedRecords[newRecordIndex] = {
                            ...addedRecords[newRecordIndex],
                            [activeColumn.field]: inputValue,
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        };

                        const dataSource = [...grid.dataSource];
                        const updatedDataSource = [...dataSource, ...addedRecords];

                        setDataList(updatedDataSource);
                        grid.dataSource = updatedDataSource;
                        grid.refresh();
                        setTimeout(() => {
                            if (rowIndex !== undefined && rowIndex >= 0) {
                                grid.selectRow(rowIndex);
                            }

                            const scrollContainer = grid.element.querySelector('.e-content') as HTMLElement;
                            if (scrollContainer) {
                                scrollContainer.scrollTop = scrollTop;
                            }
                        }, 150);

                        saveBatch();
                    }
                } else {
                    const matchedRecord = grid.contentModule.rows;
                    matchedRecord.map((item: any, index: number) => {
                        if (item?.changes) {
                            grid.updateCell(index, [activeColumn.field], inputValue);
                            grid.updateCell(index, 'userid', userid);
                            grid.updateCell(index, 'tgl_update', moment().format('YYYY-MM-DD HH:mm:ss'));
                        }
                    });

                    const dataSource = [...grid.dataSource];
                    const sourceIndex = dataSource.findIndex((row: any) => row.id_referensi === idReferensi);
                    if (sourceIndex >= 0) {
                        dataSource[sourceIndex] = {
                            ...dataSource[sourceIndex],
                            [activeColumn.field]: inputValue,
                            userid: userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        };
                    }

                    setDataList(dataSource);
                    grid.dataSource = dataSource;
                    grid.refresh();
                    setTimeout(() => {
                        if (rowIndex !== undefined && rowIndex >= 0) {
                            grid.selectRow(rowIndex);
                        }

                        const scrollContainer = grid.element.querySelector('.e-content') as HTMLElement;
                        if (scrollContainer) {
                            scrollContainer.scrollTop = scrollTop;
                        }
                    }, 150);

                    saveBatch();
                }
            },
            close: () => {
                const grid = dgDataList.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50);
                }
            },
        },
    };

    const saveBatch = async () => {
        (dgDataList.current as GridComponent).editModule.batchSave();
    };

    const handleAddClick = () => {
        const grid = dgDataList.current;
        const rowsx = grid.getBatchChanges();
        const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { tgl_libur: string }) => row.tgl_libur === '') : false;

        if (hasEmptyFields) {
            myAlertGlobal2('Tgl. Libur belum diisi', 'dlgForm');
        } else {
            const lastRowGrid = grid.dataSource.length;
            const lastRowBatch = rowsx.addedRecords.length + 1;
            const newId = lastRowGrid + lastRowBatch;
            const existingData = Array.isArray(dgDataList.current.dataSource) ? dgDataList.current.dataSource : [];

            const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_merek > max ? item.id_merek : max), 0);

            const newRecord = {
                entitas: entitas,
                id_referensi: newId,
                tgl_libur: '',
                keterangan: '',
                userid: userid,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            (grid as GridComponent).addRecord(newRecord);
        }
    };

    const handleDeleteAll = async () => {
        const grid = dgDataList.current as GridComponent;

        if (!grid || !Array.isArray(grid.dataSource)) return;

        // const confirmDelete = window.confirm('Yakin ingin menghapus semua data?');
        const confirmDelete = await myAlertGlobal3('Yakin ingin menghapus semua data?', 'dlgForm');
        if (!confirmDelete.isConfirmed) return;

        grid.dataSource.forEach((row: any) => {
            grid.deleteRecord('id_referensi', row);
        });

        // Atau, jika ingin langsung clear seluruh data batch:
        // grid.batchEditModule?.batchCancel(); // untuk cancel semua edit
        // grid.dataSource = []; // clear data manual
        // grid.refresh(); // refresh tampilannya
    };

    const handleDeleteRow = (idReferensi: any) => {
        if (idReferensi === undefined || idReferensi === null) {
            myAlertGlobal2('Data belum dipilih', 'dlgForm');
            return;
        }

        const grid = dgDataList.current as GridComponent;

        const dataSource = Array.isArray(grid.dataSource) ? grid.dataSource : [];

        const batch = grid.getBatchChanges() as {
            addedRecords?: any[];
            changedRecords?: any[];
            deletedRecords?: any[];
        };
        const added = Array.isArray(batch.addedRecords) ? batch.addedRecords : [];

        const allRecords = [...dataSource, ...added];
        console.log('allRecords ', allRecords);
        const recordToDelete = allRecords.find((item: any) => item && typeof item === 'object' && 'id_referensi' in item && item.id_referensi === idReferensi);

        if (recordToDelete) {
            grid.deleteRecord('id_referensi', recordToDelete);
        } else {
            myAlertGlobal2('Data tidak ditemukan', 'dlgForm');
        }
    };

    const handleActionBegin = (args: any) => {
        // console.log('args.requestType ', args.requestType);
        if (args.requestType === 'add') {
            const maxId = dataList.length > 0 ? Math.max(...dataList.map((item) => item.id_merek)) : 0;
            args.data.id_merek = maxId + 1;
        }

        if (args.requestType === 'save' && args.form) {
            const activeElement = document.activeElement as HTMLElement;

            if (activeElement) {
                activeElement.blur();
            }
            const formElements = args?.form?.elements;
            if (formElements) {
                const updatedData = { ...args.data };

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
                    setDataList((prev) => prev.map((item) => (item.id_merek === args.data.id_merek ? args.data : item)));
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
                updated = dataList.map((item) => (item.id_merek === args.data.id_merek ? args.data : item));
            }

            setDataList(updated);

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
            header={'Setting Hari Libur'}
            target="#master-layout"
            visible={isOpen}
            // showCloseIcon={true}
            width="35%"
            height="75%"
            close={() => {
                onClose();
            }}
            // footerTemplate={footerButtons}
            allowDragging={true}
            position={{ X: 'center', Y: 20 }}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            style={{ position: 'fixed' }}
            open={(args: any) => {
                args.preventFocus = true;
            }}
        >
            <>
                <div className="flex h-full flex-col overflow-hidden rounded border font-sans shadow">
                    {/* Loading overlay */}
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
                                // key={dataList.length}
                                // key={JSON.stringify(dataList)}
                                id="gridListData"
                                name="gridListData"
                                locale="id"
                                ref={dgDataList}
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
                                enableHover={false}
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
                                actionBegin={handleActionBegin}
                                actionComplete={handleActionComplete}
                                rowSelected={(args: any) => {
                                    const selected = dgDataList.current?.getSelectedRecords() ?? [];
                                    setSelectDataGrid(selected);
                                }}
                            >
                                <ColumnsDirective>
                                    {/* <ColumnDirective field="id_referensi" headerText="No." headerTextAlign="Center" textAlign="Left" width="50" allowEditing={false} clipMode="EllipsisWithTooltip" /> */}
                                    <ColumnDirective
                                        field="tgl_libur"
                                        headerText="Tgl. Libur"
                                        headerTextAlign="Center"
                                        width="100"
                                        type="date"
                                        format="dd-MM-yyyy"
                                        editType="datepickeredit"
                                        edit={textInput}
                                    />
                                    <ColumnDirective field="keterangan" headerTextAlign="Center" textAlign="Left" headerText="Keterangan" width="250" edit={textInput} />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                            </GridComponent>
                        )}

                        {/* Toolbar bawah grid */}
                        <div className="panel-pager p-2">
                            <div className="flex gap-14">
                                <div className="mt-1 flex">
                                    <TooltipComponent content="Tambah" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                        <ButtonComponent
                                            id="buAdd1"
                                            type="button"
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-small e-plus"
                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                            onClick={() => {
                                                handleAddClick();
                                            }}
                                        />
                                    </TooltipComponent>
                                    <TooltipComponent content="Hapus baris" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                        <ButtonComponent
                                            id="buDelete1"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-warning e-small"
                                            iconCss="e-icons e-small e-trash"
                                            style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                            onClick={() => {
                                                if (selectDataGrid[0]) {
                                                    handleDeleteRow(selectDataGrid[0].id_referensi);
                                                } else {
                                                    myAlertGlobal2('Data belum dipilih', 'dlgForm');
                                                    return;
                                                }
                                            }}
                                        />
                                    </TooltipComponent>
                                    <TooltipComponent content="Hapus semua" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                        <ButtonComponent
                                            id="buDeleteAll1"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-danger e-small"
                                            iconCss="e-icons e-small e-erase"
                                            style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                            onClick={() => {
                                                handleDeleteAll();
                                            }}
                                        />
                                    </TooltipComponent>
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
                                onClick={async () => {
                                    // onClose();
                                    await handleDialogClose();
                                }}
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
                                        myAlertGlobal3('Lanjut simpan data hari libur ? ', 'dlgForm').then((result) => {
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
                            />
                        </div>
                    </div>
                </div>
            </>
        </DialogComponent>
    );
};

export default DaftarLibur;
