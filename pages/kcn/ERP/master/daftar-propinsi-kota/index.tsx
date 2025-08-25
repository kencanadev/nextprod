'use client';

import * as React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Page, IEditCell, Grid } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs, NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2/data';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown, ChangeEventArgs, ComboBox } from '@syncfusion/ej2-react-dropdowns';
import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import moment, { now } from 'moment';
import axios from 'axios';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';


import FrmDlgAkunJurnal from '../../fa/bkk/component/frmDlgAkunJurnal';
import styles from './daftarbank.module.css';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { loadDataKotaByPropinsi } from './model/api';
import { resourceLimits } from 'worker_threads';
import { myAlertGlobal2 } from '@/utils/routines';
import { exitCode } from 'process';
import { myAlertGlobal3 } from '@/utils/global/fungsi';

L10n.load(idIDLocalization);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}

const DaftaPropinsiKota = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const dgDataList = useRef<Grid | any>(null); //useRef<any>(null);

    const [selectedPropinsi, setSelectedPropinsi] = useState('');
    const [dataList, setDataList] = useState<any[]>([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');

    const [dots, setDots] = useState('');
    const [daftarAkun, setDaftarAkun] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [allPropinsi, setAllPropinsi] = useState<any[]>([]);
    const [allKota, setAllKota] = useState<any[]>([]);

    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isAdding, setIsAdding] = useState(false);
    const [newPropinsi, setNewPropinsi] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredKota, setFilteredKota] = useState<any[]>(allKota); // ganti KotaType dengan tipe kamu
    const pilihPropinsi = useRef<string>('');

    const saveBatch = async () => {
        (dgDataList.current as GridComponent).editModule.batchSave();
    };

    const mergeKotaToAllKota = (updatedRecord: any) => {
        // console.log('updatedRecord ', updatedRecord);
        setAllKota((prev) => {
            // console.log('prev ', prev);
            const index = prev.findIndex((k) => k.id_referensi_kota === updatedRecord.id_referensi_kota);
            if (index >= 0) {
                // update existing
                const updated = [...prev];
                updated[index] = updatedRecord;
                return updated;
            } else {
                // new record
                return [...prev, updatedRecord];
            }
        });
    };

    const textInput: IEditCell = {
        params: {
            actionComplete: () => false,

            change: (args: any) => {
                const grid = dgDataList.current;
                const batchChanges = grid.getBatchChanges();
                const selectedRecords = grid.getSelectedRecords();
                // console.log('batchChanges ', batchChanges);
                // console.log('selectedRecords ', selectedRecords);

                if (!selectedRecords || selectedRecords.length === 0) return;
                const selectedRow = selectedRecords[0];
                let idReferensi;
                if (batchChanges?.addedRecords?.length > 0) {
                    // Get the last added record
                    const lastAddedRecord = batchChanges.addedRecords[batchChanges.addedRecords.length - 1];
                    idReferensi = lastAddedRecord.id_ref_kota;
                } else {
                    // If no added records, get from selected row
                    idReferensi = selectedRow.id_referensi_kota;
                }
                // console.log('idReferensi', idReferensi);

                if (!idReferensi) return;

                const isNewRecord = batchChanges?.addedRecords?.some((record: any) => record.id_ref_kota === idReferensi);
                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
                const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                const columns = grid.getColumns();
                const activeColumn = columns[colIndex - 1];

                // console.log('isNewRecord', isNewRecord);
                if (isNewRecord) {
                    const addedRecords = batchChanges.addedRecords;
                    const newRecordIndex = addedRecords.findIndex((record: any) => record.id_ref_kota === idReferensi);

                    if (newRecordIndex >= 0) {
                        // Update the record in addedRecords
                        addedRecords[newRecordIndex] = {
                            ...addedRecords[newRecordIndex],
                            [activeColumn.field]: args.value,
                            nama_propinsi: pilihPropinsi.current,
                        };

                        // Update the grid's dataSource by combining existing dataSource with addedRecords
                        const dataSource = [...grid.dataSource];
                        const updatedDataSource = [...dataSource, ...addedRecords];
                        // console.log('updatedDataSource ', updatedDataSource);
                        // Update state and grid
                        setDataList(updatedDataSource);
                        // setAllKota(result.Kota);
                        const updatedRecord = {
                            ...addedRecords[newRecordIndex],
                            [activeColumn.field]: args.value,
                            nama_propinsi: pilihPropinsi.current,
                        };
                        mergeKotaToAllKota(updatedRecord);

                        grid.dataSource = updatedDataSource;
                        grid.refresh();
                        saveBatch();
                    }
                } else {
                    // Handle existing record
                    const matchedRecord = grid.contentModule.rows;

                    matchedRecord.map((item: any, index: number) => {
                        if (item?.changes) {
                            grid.updateCell(index, [activeColumn.field], args.value);
                            grid.updateCell(index, 'nama_propinsi', pilihPropinsi.current);
                        }
                    });

                    // Update the dataSource
                    const dataSource = [...grid.dataSource];
                    const sourceIndex = dataSource.findIndex((row: any) => row.id_referensi_kota === idReferensi);
                    // console.log('dataSource awal', dataSource);

                    if (sourceIndex >= 0) {
                        dataSource[sourceIndex] = {
                            ...dataSource[sourceIndex],
                            [activeColumn.field]: args.value,
                            nama_propinsi: pilihPropinsi.current,
                        };
                        const updatedRecord = {
                            ...dataSource[sourceIndex],
                            [activeColumn.field]: args.value,
                            nama_propinsi: pilihPropinsi.current,
                        };
                        mergeKotaToAllKota(updatedRecord);
                    }

                    // Update state and grid
                    // console.log('dataSource akhir', dataSource);
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
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const handleAddClick = () => {
        const grid = dgDataList.current;
        const rowsx = grid.getBatchChanges();
        const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { ekspedisi: string }) => row.ekspedisi === '') : false;
        const hasEmptyFieldsGrid = dgDataList.current.dataSource.some((row: { nama_kota: string }) => row.nama_kota === '');
        const changed = rowsx.changedRecords.length >= 1;

        if (hasEmptyFields) {
            myAlertGlobal2('Nama Kota belum diisi.', 'dlgForm');
        } else {
            const lastRowGrid = grid.dataSource.length;
            const lastRowBatch = rowsx.addedRecords.length + 1;
            const newId = lastRowGrid + lastRowBatch;
            // const existingData = Array.isArray(dgDataList.current.dataSource) ? dgDataList.current.dataSource : [];
            const existingData = Array.isArray(allKota) ? allKota : [];

            const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_referensi_kota > max ? item.id_referensi_kota : max), 0);
            let newIdTransaksi = maxIdTransaksi + lastRowBatch;
            const newRecord = {
                id_referensi_kota: newIdTransaksi,
                id_ref_kota: newId,
                nama_propinsi: '',
                nama_kota: '',
            };
            (grid as GridComponent).addRecord(newRecord);
        }
    };

    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: entitas ?? '',
        userid: userid ?? '',
        // kode_user: sessionData?.kode_user ?? '',
        token: token ?? '',
        masterKodeDokumen: '',
        masterDataState: '',
    });

    const handleAddPropinsi = () => {
        const trimmed = newPropinsi.trim();
        if (trimmed !== '' && !allPropinsi.includes(trimmed)) {
            setAllPropinsi([...allPropinsi, trimmed]);
            setNewPropinsi('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault(); // agar tidak scroll
            handleAddPropinsi();
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            const modifiedFiltered = allKota.map((item: any, index: any) => {
                return {
                    ...item,
                    id_reff_kota: index + 1,
                };
            });
            setFilteredKota(modifiedFiltered); // Tampilkan semua jika pencarian kosong
        } else {
            const lower = searchTerm.toLowerCase();
            const matchingProps = allPropinsi.filter((p) => p.nama_propinsi.toLowerCase().includes(lower)).map((p) => p.nama_propinsi);

            const filtered = allKota.filter((kota) => matchingProps.includes(kota.nama_propinsi));

            const modifiedFiltered = filtered.map((item: any, index: any) => {
                return {
                    ...item,
                    id_reff_kota: index + 1,
                };
            });
            setFilteredKota(modifiedFiltered);
        }
    }, [searchTerm, allKota, allPropinsi]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const matchingProps = allPropinsi.filter((p) => p.nama_propinsi.toLowerCase().includes(lower)).map((p) => p.nama_propinsi);
        const kotaFiltered = searchTerm.trim() !== '' ? allKota.filter((kota) => matchingProps.includes(kota.nama_propinsi)) : allKota.filter((kota) => kota.nama_propinsi === selectedPropinsi);
        pilihPropinsi.current = selectedPropinsi;
        const modifiedFiltered = kotaFiltered.map((item: any, index: number) => ({
            ...item,
            id_reff_kota: index + 1,
        }));

        setFilteredKota(modifiedFiltered);
    }, [searchTerm, allKota, allPropinsi, selectedPropinsi]);

    useEffect(() => {
        const paramList = {
            entitas: entitas,
        };
        loadDataKotaByPropinsi(paramList, token).then((result: any) => {
            if (result) {
                // console.log('result ', result.Provinsi);
                setAllPropinsi(result.Provinsi);
                setAllKota(result.Kota);
            }
        });
    }, [isOpen, userid, entitas]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Focus ke input baru saat mode add aktif
    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        const handleAddPropinsi = async () => {
            const trimmed = newPropinsi.trim();
            if (trimmed !== '') {
                const exists = allPropinsi.some((p) => p.nama_propinsi.toLowerCase() === trimmed.toLowerCase());
                if (exists) {
                    await myAlertGlobal2(`Propinsi ${trimmed} sudah ada, tidak bisa ditambahkan`, 'dlgForm');
                    return; // jangan lanjut tambah
                } else {
                    setAllPropinsi([...allPropinsi, { nama_propinsi: trimmed }]);
                    setNewPropinsi('');
                    setIsAdding(false);
                    setSelectedIndex(allPropinsi.length); // ke row baru
                }
            }
        };

        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                // kode navigasi
                e.preventDefault();
                if (selectedIndex < allPropinsi.length - 1) {
                    setSelectedIndex((prev) => prev + 1);
                } else if (!isAdding) {
                    setIsAdding(true);
                }
            } else if (e.key === 'ArrowUp') {
                // kode navigasi
                e.preventDefault();
                if (selectedIndex > 0) {
                    setSelectedIndex((prev) => prev - 1);
                }
            } else if (e.key === 'Enter' && isAdding) {
                e.preventDefault();
                handleAddPropinsi();
            } else if (e.key === 'Escape' && isAdding) {
                // batal tambah
                setNewPropinsi('');
                setIsAdding(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, allPropinsi, newPropinsi, isAdding]);

    useEffect(() => {
        if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', // scroll agar item terlihat tapi jangan langsung ke atas kalau bisa
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < allPropinsi.length) {
            setSelectedPropinsi(allPropinsi[selectedIndex].nama_propinsi);
        }
    }, [selectedIndex, allPropinsi]);

    const handleSearch = (value: any) => {
        if (dgDataList.current) {
            dgDataList.current.search(value);
        }
    };

    // Filter propinsi sebelum render list
    const filteredPropinsi = allPropinsi.filter((p) => p.nama_propinsi.toLowerCase().includes(searchTerm.toLowerCase()));

    function cekPropinsiTanpaKota(allKota: any[], allPropinsi: any[]): string[] {
        // Buat map dari propinsi ke list kota yang punya nama_kota tidak kosong
        const propinsiMap: Record<string, string[]> = {};

        allKota.forEach((item) => {
            const prop = item.nama_propinsi;
            const kota = item.nama_kota?.trim() || '';
            if (!propinsiMap[prop]) propinsiMap[prop] = [];
            if (kota !== '') {
                propinsiMap[prop].push(kota);
            }
        });

        // Filter propinsi yang di allPropinsi tapi tidak punya kota sama sekali
        const propinsiTanpaKota = allPropinsi
            .map((p) => p.nama_propinsi)
            .filter((prop) => {
                return !propinsiMap[prop] || propinsiMap[prop].length === 0;
            });

        return propinsiTanpaKota;
    }

    const saveDoc = async (dataKota: any, dataPropinsi: any) => {
        let responseAPI: any;
        if (isAdding) {
            await myAlertGlobal2(`Anda sedang menambah data propinsi. Silahkan batalkan terlebih dahulu`, 'dlgForm');
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
            inputRef.current?.focus();
            return;
        }
        // const kosong = cekPropinsiTanpaKota(allKota, allPropinsi);
        // if (kosong.length > 0) {
        //     // alert('Propinsi tanpa kota:\n' + kosong.join(', '));
        //     await myAlertGlobal2(`Masih ada Propinsi tanpa kota di propinsi ${kosong.join(', ')}`, 'dlgForm');
        //     setIsLoadingProgress(false);
        //     setProgressValue(0);
        //     setDisplayedProgress(0);
        //     return;
        // }

        // alert('lanjut');
        // setIsLoadingProgress(false);
        // setProgressValue(0);
        // setDisplayedProgress(0);
        // throw exitCode;

        const kota = dataKota.map((item: any) => ({
            nama_propinsi: item.nama_propinsi,
            nama_kota: item.nama_kota,
            old_nama_kota: item.old_nama_kota,
        }));

        const provinsi = dataPropinsi.map((item: any) => ({
            nama_propinsi: item.nama_propinsi,
            old_nama_propinsi: item.old_nama_propinsi,
        }));

        const reqBody = {
            entitas: entitas,
            kota: [...kota],
            provinsi: [...provinsi],
        };

        // console.log('reqBody ', reqBody);
        // throw exitCode;

        setLoadingMessage('Menyimpan dokumen baru...');
        await axios
            .post(`${apiUrl}/erp/master/daftar-lainnya/simpan_provinsi`, reqBody, {
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
                        //  handleRefreshData();
                        // onClose();
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
    return (
        <>
            <DialogComponent
                id="dlgForm"
                header={'Daftar Propinsi dan Kota'}
                target="#master-layout"
                visible={isOpen}
                // showCloseIcon={true}
                width="50%"
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
                    <div className="flex h-[85vh] overflow-hidden rounded border font-sans shadow">
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
                        {/* Sidebar */}
                        <div className="w-64 overflow-y-auto border-r bg-gray-50">
                            <div className="mb-2  w-full items-center border border-black bg-white" style={{ display: 'inline-block' }}>
                                <TextBoxComponent
                                    id="cariDataProp"
                                    name="edCariProp"
                                    placeholder="Search..."
                                    cssClass="e-outline"
                                    showClearButton={true}
                                    input={(args: FocusInEventArgs) => {
                                        setSearchTerm(args.value || '');
                                        setSelectedIndex(0); // Reset selectedIndex jika perlu
                                    }}
                                />
                            </div>

                            <div className="sticky top-0 bg-gray-200 p-2 text-center font-bold">Nama Propinsi</div>

                            {filteredPropinsi.map((propinsi, index) => (
                                <div
                                    key={index}
                                    ref={(el) => (itemRefs.current[index] = el)}
                                    onClick={async () => {
                                        // setSelectedPropinsi(propinsi.nama_propinsi);
                                        // setSelectedIndex(index);
                                        if (!propinsi.nama_propinsi || propinsi.nama_propinsi.trim() === '') {
                                            // Validasi jika nama propinsi kosong
                                            myAlertGlobal2('Nama propinsi tidak boleh kosong', 'dlgForm');
                                            return;
                                        }

                                        if (isAdding) {
                                            myAlertGlobal3('Batal input propinsi?', 'dlgForm').then((result: any) => {
                                                if (result.isConfirmed) {
                                                    setNewPropinsi('');
                                                    setIsAdding(false);
                                                    setSelectedPropinsi(propinsi.nama_propinsi);
                                                    setSelectedIndex(index);
                                                }

                                                inputRef.current?.focus(); // Fokuskan ke input pencarian
                                                // Jika tidak dikonfirmasi, tidak melakukan apa-apa
                                            });
                                        } else {
                                            setSelectedPropinsi(propinsi.nama_propinsi);
                                            setSelectedIndex(index);
                                        }
                                    }}
                                    className={`cursor-pointer border-b px-4 py-2 hover:bg-blue-100 ${selectedIndex === index ? 'bg-yellow-300 font-bold' : ''}`}
                                >
                                    {propinsi.nama_propinsi}
                                </div>
                            ))}
                            {isAdding && (
                                <div className="border-b bg-white px-4 py-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newPropinsi}
                                        onChange={(e) => setNewPropinsi(e.target.value)}
                                        placeholder="Nama propinsi baru"
                                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <div className="mt-1 text-xs text-gray-500">Enter untuk simpan, Esc untuk batal</div>
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="flex flex-1 flex-col">
                            <div className="flex-1 overflow-auto p-2">
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

                                <GridComponent
                                    key={dataList.length}
                                    // key={JSON.stringify(dataList)}
                                    id="gridListData"
                                    name="gridListData"
                                    locale="id"
                                    ref={dgDataList}
                                    dataSource={filteredKota}
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
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="id_reff_kota" headerTextAlign="Center" textAlign="Left" headerText="No." width="50" isPrimaryKey={true} />
                                        <ColumnDirective field="nama_kota" headerTextAlign="Center" textAlign="Left" headerText="Nama Kota" width="250" edit={textInput} />
                                    </ColumnsDirective>
                                    <Inject services={[Edit, Toolbar, Page]} />
                                </GridComponent>
                                <div style={{ padding: 5 }} className="panel-pager">
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

                            {/* Footer Buttons */}

                            <div className="flex items-center justify-end border-t bg-white p-2">
                                {/* Tombol kanan */}
                                <div className="flex gap-2">
                                    <ButtonComponent
                                        id="buSimpan"
                                        content="Simpan"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-save"
                                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                        onClick={async () => {
                                            // console.log('allKota', allKota);
                                            // console.log('allPropinsi', allPropinsi);

                                            myAlertGlobal3('Lanjut simpan data propinsi dan kota ? ', 'dlgForm').then((result) => {
                                                if (result.isConfirmed) {
                                                    setTimeout(async () => {
                                                        setIsLoadingProgress(true);
                                                        setProgressValue(0);
                                                        setDisplayedProgress(0);
                                                        setLoadingMessage('Proses simpan data...');
                                                        await saveDoc(allKota, allPropinsi);
                                                    }, 0);
                                                }
                                            });
                                        }}
                                        // disabled={disabledSimpan}
                                    />
                                    <ButtonComponent
                                        id="buBatal"
                                        content="Tutup"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-close"
                                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                        onClick={() => onClose()}
                                        // disabled={disabledSimpan}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            </DialogComponent>
        </>
    );
};

export default DaftaPropinsiKota;
