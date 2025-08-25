import React, { useEffect, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Grid } from '@syncfusion/ej2-react-grids';
import useLokalState from './hooks/lokalStateHooks';
import { loadDataDivisi, simpanDataDivisi } from './handler/fungsi';
import moment from 'moment';
import axios from 'axios';
import { myAlertGlobal2, myAlertGlobal3 } from '@/utils/global/fungsi';
import { exitCode } from 'process';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}

const DaftarDivisiPenjualanPage = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    // const { dataDivisi, setDataDivisi } = useLokalState();
    const gridRef = useRef<GridComponent | null>(null);
    const lokalState = useLokalState();
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    // const handleSimpan = async () => {
    //     try {
    //         await simpanDataDivisi(lokalState.dataDivisi, token, userid);
    //         alert('✅ Data berhasil disimpan');
    //     } catch (err) {
    //         alert('❌ Gagal menyimpan data divisi');
    //     }
    // };

    const handleBatal = () => {
        loadDataDivisi(lokalState.stateDokumen.kode_entitas, lokalState.stateDokumen.token).then((data) => lokalState.setDataDivisi(data));
        // onClose();
    };

    const saveDoc = async (data: any) => {
        for (const item of lokalState.dataDivisi) {
            if (!item.kode_jual || item.kode_jual.trim() === '') {
                // alert('⚠️ Kode Divisi belum diisi.');
                myAlertGlobal2('⚠️ Kode Divisi belum diisi.', 'dlgForm');
                return;
            }
            if (!item.nama_jual || item.nama_jual.trim() === '') {
                // alert('⚠️ Nama Divisi belum diisi.');
                myAlertGlobal2('⚠️ Nama Divisi belum diisi.', 'dlgForm');
                return;
            }
        }

        let responseAPI: any;
        lokalState.setIsLoadingProgress(true);
        lokalState.setProgressValue(0);
        lokalState.setDisplayedProgress(0);
        lokalState.setLoadingMessage('Proses simpan data...');
        const detail = data.map((item: any) => ({
            entitas: lokalState.stateDokumen.kode_entitas,
            kode_jual: item.kode_jual,
            nama_jual: item.nama_jual,
            aktif: item.aktif ? 'N' : 'Y',
            kode_jual_lama: item.kode_jual_lama ?? undefined,
        }));

        const reqBody = {
            entitas: entitas,
            divisJual: [...detail],
        };

        // console.log('reqBody ', reqBody);
        // lokalState.setIsLoadingProgress(false);
        // lokalState.setProgressValue(0);
        // lokalState.setDisplayedProgress(0);
        // throw exitCode;

        lokalState.setLoadingMessage('Menyimpan dokumen...');
        await axios
            .post(`${apiUrl}/erp/master/divisi-penjualan/simpan_divisi_penjualan`, reqBody, {
                headers: {
                    Authorization: `Bearer ${lokalState.stateDokumen.token}`,
                },
            })
            .then((result) => {
                responseAPI = result.data;
                lokalState.setProgressValue(50);
            })
            .catch((e: any) => {
                responseAPI = e.response.data;
            });

        if (responseAPI.status === true) {
            let pesan = '';

            pesan = `Simpan data berhasil ${responseAPI.status}`;

            lokalState.setProgressValue(97);
            lokalState.setLoadingMessage('Memproses Simpan...');

            myAlertGlobal2(pesan, 'dlgForm').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        lokalState.setProgressValue(100);
                        lokalState.setDisplayedProgress(100);
                        lokalState.setLoadingMessage('Complete!');

                        setTimeout(() => {
                            lokalState.setIsLoadingProgress(false);
                            lokalState.setProgressValue(0);
                            lokalState.setDisplayedProgress(0);
                        }, 500);
                        // handleRefreshData();
                        onClose();
                    }, 0);
                }
            });
        } else {
            if (responseAPI.error.includes('Duplicate')) {
                myAlertGlobal2(`Data sudah ada `, 'dlgForm').then((result) => {
                    if (result) {
                        lokalState.setProgressValue(100);
                        lokalState.setDisplayedProgress(100);
                        lokalState.setLoadingMessage('Complete!');

                        setTimeout(() => {
                            lokalState.setIsLoadingProgress(false);
                            lokalState.setProgressValue(0);
                            lokalState.setDisplayedProgress(0);
                            onClose();
                        }, 500);
                    }
                });
            } else {
                myAlertGlobal2(`Simpan gagal - ErrorSaveDoc ${responseAPI.error}`, 'dlgForm').then((result) => {
                    if (result.isConfirmed) {
                        lokalState.setProgressValue(100);
                        lokalState.setDisplayedProgress(100);
                        lokalState.setLoadingMessage('Complete!');

                        setTimeout(() => {
                            lokalState.setIsLoadingProgress(false);
                            lokalState.setProgressValue(0);
                            lokalState.setDisplayedProgress(0);
                            onClose();
                        }, 500);
                    }
                });
            }
        }
    };

    const handleKeyDownOnCell = (e: KeyboardEvent) => {
        if (!gridRef.current) return;
        const grid = gridRef.current;

        const activeElement = document.activeElement as HTMLElement;
        const isInsideGrid = grid.element.contains(activeElement);

        if (!isInsideGrid) return;

        // ESC untuk keluar dari edit
        if (e.key === 'Escape') {
            if (grid.isEdit) {
                e.preventDefault();
                e.stopPropagation();
                grid.closeEdit();
                return;
            } else {
                // Setelah bukan edit, boleh close dialog manual
                e.preventDefault();
                onClose();
            }
        }

        // ENTER untuk pindah atau tambah
        if (e.key === 'Enter') {
            if (grid.isEdit) {
                e.preventDefault();
                const rowIndex = grid.getSelectedRowIndexes()[0];
                const currentField = (grid as any).editModule?.editCell?.columnName;
                const currentColumnIndex = grid.getColumnIndexByField(currentField);
                const nextColumn = grid.columns[currentColumnIndex + 1];

                grid.endEdit();

                if (nextColumn) {
                    const nextField = (nextColumn as any).field;
                    setTimeout(() => {
                        grid.selectRow(rowIndex);
                        grid.startEdit();
                        setTimeout(() => {
                            const input = grid.element.querySelector(`input[name="${nextField}"]`) as HTMLInputElement;
                            if (input) input.focus();
                        }, 50);
                    }, 50);
                } else {
                    const isLastRow = rowIndex === lokalState.dataDivisi.length - 1;
                    if (isLastRow) {
                        setTimeout(() => {
                            grid.addRecord({});
                            setTimeout(() => {
                                const newRowIndex = grid.getRows().length - 1;
                                grid.selectRow(newRowIndex);
                                grid.startEdit();
                            }, 100);
                        }, 100);
                    }
                }
                return;
            }
        }

        // Panah bawah -> tambah baris baru
        if (e.key === 'ArrowDown') {
            const selectedIndex = grid.getSelectedRowIndexes()?.[0] ?? -1;
            const isLastRow = selectedIndex === lokalState.dataDivisi.length - 1;
            if (isLastRow) {
                e.preventDefault();
                grid.addRecord();
                const newRowIndex = lokalState.dataDivisi.length;
                setTimeout(() => {
                    grid.selectRow(newRowIndex);
                    grid.startEdit();
                }, 100);
            }
        }
    };

    const handleGridCreated = () => {
        const gridElement = gridRef.current?.element;
        if (gridElement) {
            gridElement.addEventListener('keydown', handleKeyDownOnCell);
        }
    };

    const handleActionComplete = (args: any) => {
        if (args.requestType === 'save') {
            const newData = args.data;

            lokalState.setDataDivisi((prev: any) => {
                const index = prev.findIndex((item: any) => item.kode_jual === newData.kode_jual);
                if (index !== -1) {
                    // ✅ Update data yang sudah ada
                    const copy = [...prev];
                    copy[index] = newData;
                    return copy;
                }

                // 🔁 Cek apakah data sudah ditambahkan otomatis oleh grid
                // Cegah double insert: jika grid.addRecord sudah memicu setState via binding
                if (prev.some((item: any) => JSON.stringify(item) === JSON.stringify(newData))) {
                    return prev; // sudah ada
                }

                // ✅ Tambahkan di akhir array
                return [...prev, newData];
            });
        }
    };

    // const handleActionComplete = (args: any) => {
    //     if (args.requestType === 'save') {
    //         const newData = { ...args.data, _isNew: args.action === 'add' };

    //         lokalState.setDataDivisi((prev: any) => {
    //             const index = prev.findIndex((item: any) => item.kode_jual === newData.kode_jual);
    //             if (index !== -1) {
    //                 const updated = { ...newData, _edited: true };
    //                 const copy = [...prev];
    //                 copy[index] = updated;
    //                 return copy;
    //             }
    //             return [...prev, newData];
    //         });
    //     }
    // };

    const handleBeforeClose = (args: any) => {
        if (gridRef.current?.isEdit) {
            args.cancel = true; // ⛔ Cancel close!
            gridRef.current.closeEdit(); // Optional: keluar edit
        }
    };

    useEffect(() => {
        // console.log('lokalState.stateDokumen ', lokalState.stateDokumen);
        // console.log('lokalState  ', lokalState);

        if (lokalState.stateDokumen.token && lokalState.stateDokumen.kode_entitas) {
            // console.log('✅ Data siap:', lokalState.stateDokumen);
            loadDataDivisi(lokalState.stateDokumen.kode_entitas, lokalState.stateDokumen.token).then((list) => {
                // setGridData(list); // atau simpan ke lokalState
                lokalState.setDataDivisi(list);

                // console.log('list ', list);
            });

            // contoh: load data divisi
            // loadDataDivisi(stateDokumen.kode_entitas, stateDokumen.token).then(setDataDivisi);
        }
    }, [isOpen, lokalState.stateDokumen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDownWrapper = (e: KeyboardEvent) => {
            if (!gridRef.current) return;
            const grid = gridRef.current;

            const activeElement = document.activeElement as HTMLElement;
            const isInsideGrid = grid.element.contains(activeElement);

            // ⛔ Cegah ESC close dialog jika sedang edit grid
            if (e.key === 'Escape' && isInsideGrid && grid.isEdit) {
                e.preventDefault();
                e.stopPropagation(); // ⛔ penting: cegah close dari dialog Syncfusion
                grid.closeEdit(); // keluar dari edit mode
                return;
            }

            handleKeyDownOnCell(e); // Navigasi biasa: Enter, ArrowDown
        };

        document.addEventListener('keydown', handleKeyDownWrapper);
        return () => {
            document.removeEventListener('keydown', handleKeyDownWrapper);
        };
    }, [isOpen, lokalState.dataDivisi]);

    return (
        <DialogComponent
            id="dlgForm"
            target="#master-layout"
            visible={isOpen}
            allowDragging={true}
            header="Daftar Divisi Penjualan"
            width="600px"
            // showCloseIcon={true}
            isModal={true}
            height="75%"
            close={() => {
                // if (gridRef.current?.isEdit) return; // ❌ jangan close jika masih edit
                // handleBatal();
                onClose();
            }}
            beforeClose={handleBeforeClose}
            closeOnEscape={false}
            position={{ X: 'center', Y: 20 }}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
        >
            <GridComponent
                ref={gridRef}
                dataSource={lokalState.dataDivisi}
                allowPaging={false}
                editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Bottom' }}
                height={300}
                created={handleGridCreated}
                gridLines="Both"
                autoFit={true}
                actionComplete={handleActionComplete}
            >
                <ColumnsDirective>
                    <ColumnDirective field="kode_jual" headerTextAlign="Center" headerText="Kode" width="100" textAlign="Left" isPrimaryKey={true} validationRules={{ required: true }} />
                    <ColumnDirective field="nama_jual" headerTextAlign="Center" headerText="Nama Divisi" width="300" validationRules={{ required: true }} />
                    <ColumnDirective field="aktif" headerTextAlign="Center" headerText="Non Aktif" width="100" textAlign="Center" displayAsCheckBox={true} type="boolean" editType="booleanedit" />
                </ColumnsDirective>
                <Inject services={[Edit, Toolbar]} />
            </GridComponent>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={async () => {
                        // console.log('dataList ', dataList);
                        myAlertGlobal3('Lanjut simpan data ? ', 'dlgForm').then((result) => {
                            if (result.isConfirmed) {
                                setTimeout(async () => {
                                    await saveDoc(lokalState.dataDivisi);
                                }, 0);
                            }
                        });
                    }}
                    className="rounded bg-blue-600 px-4 py-1 text-white"
                >
                    Simpan
                </button>
                <button
                    onClick={() => {
                        // console.log('BATAL');
                        onClose();
                    }}
                    className="rounded bg-blue-600 px-4 py-1 text-white"
                >
                    Batal
                </button>
            </div>
        </DialogComponent>
    );
};

export default DaftarDivisiPenjualanPage;
