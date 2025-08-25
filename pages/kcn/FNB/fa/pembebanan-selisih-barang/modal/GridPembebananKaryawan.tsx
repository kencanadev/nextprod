'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import DialogKaryawanBeban from './DialogKaryawanBeban';

export default function GridPembebananKaryawan({
    gridPembebanan,
    list_karyawan,
    visibleDialogKry,
    setVisibleDialogKry,
    bodyState,
    setBodyState,
    isFocused,
    setIsFocused,
    masterState,
    setList_karyawan,
    list_karyawanOri,
}: {
    gridPembebanan: any;
    list_karyawan: any;
    visibleDialogKry: any;
    setVisibleDialogKry: Function;
    bodyState: any;
    setBodyState: any;
    isFocused: any;
    setIsFocused: any;
    masterState: any;
    setList_karyawan: any;
    list_karyawanOri: any;
}) {
    const [selectedRowIndexBebanKaryawan, setSelectedRowIndexBebanKaryawan] = useState(0);
    const [dsRekening, setDsRekening] = useState([]);
    const [indexRow, setIndexRow] = useState<any>(null);

    const swalToast = Swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 2000,
        showClass: {
            popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
        },
        hideClass: {
            popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
        },
    });
    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)?.toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }
    const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIsFocused((prev: any) => ({
            ...prev,
            [name]: true,
        }));
        e.target.select();
    };

    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIsFocused((prev: any) => ({
            ...prev,
            [name]: false,
        }));
        if (bodyState?.beban_karyawan === '') {
            setBodyState((oldData: any) => ({
                ...oldData,
                beban_perusahaan: String(parseFloat(oldData.total_nilai_beban.replace(/,/g, '')) - 0),
            }));
        } else {
            setBodyState((oldData: any) => ({
                ...oldData,
                beban_perusahaan: String(parseFloat(oldData.total_nilai_beban.replace(/,/g, '')) - parseFloat(oldData?.beban_karyawan.replace(/,/g, ''))),
            }));
        }
    };
    const formatNumber = (num: string) => {
        if (!num) return ''; // Jika kosong, kembalikan string kosong
        const parsedNumber = parseFloat(num.replace(/,/g, ''));
        if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
        return parsedNumber.toLocaleString('en-US');
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update filterState
        setBodyState((prev: any) => ({
            ...prev,
            [name]: value.replace(/,/g, ''),
        }));
    };
    const hiddenNol = (val: any) => {
        if (val == '0') {
            return String('');
        } else {
            return String(val);
        }
    };
    const rowSelectingRekeningBank = (args: any) => {
        setSelectedRowIndexBebanKaryawan(args.rowIndex);
        setIndexRow(args.rowIndex);
    };

    const handleRekening_EndEdit = async () => {
        gridPembebanan.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = gridPembebanan.current.dataSource?.length;
        const isNotEmptyNip = gridPembebanan.current.dataSource?.every((item: any) => item.nip !== '');
        const isNotEmptyNamaKar = gridPembebanan.current.dataSource?.every((item: any) => item.nama_kry !== '');
        console.log('testttt', parseFloat(bodyState?.beban_karyawan.replace(/,/g, '')));

        if (parseFloat(bodyState?.beban_karyawan.replace(/,/g, '')) <= 0) {
            withReactContent(swalToast).fire({
                icon: 'error',
                title: '<p style="font-size:12px">Beban Karyawan belum di isi.</p>',
                width: '100%',
                target: '#forDialogAndSwall',
            });
            return;
        }
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNip && isNotEmptyNamaKar)) {
                const newObject = {
                    nip: '',
                    nama_kry: '',
                    kode_subledger: '',
                    jabatan: '',
                    beban: 0,
                    nilai: 0,
                    emp_no: '',
                    keterangan: '',
                    emp_id: '',
                };
                gridPembebanan.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridPembebanan.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridPembebanan')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data rekening sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#forDialogAndSwall',
                });
            }
        }
    };
    const deleteRekeningBank = async () => {
        const selectedListData: any = gridPembebanan.current!.dataSource[indexRow];
        console.log(selectedListData);

        if (Object.keys(selectedListData).length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Karyawan ${selectedListData.nip}</p>`,
                    target: '#forDialogAndSwall',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        const data = gridPembebanan.current?.dataSource;
                        // const data = gridPembebanan.current?.dataSource[indexRow];

                        let updatedData = data.filter((item: any) => item.nip !== selectedListData.nip); // Filter data yang ingin dihapus
                        updatedData = updatedData.map((item: any) => {
                            if (item.nip > selectedListData.nip) {
                                return { ...item, nip: item.nip }; // Kurangi id dengan 1 untuk item setelah id yang dihapus
                            }
                            return item;
                        });
                        console.log('updatedData', updatedData);
                        gridPembebanan.current!.dataSource = updatedData;
                        gridPembebanan.current?.refresh();
                        // setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        setTimeout(() => {
                            gridPembebanan.current!.refresh();
                            // lanjut sini
                            const totalJumlah: any = gridPembebanan.current!.dataSource;
                            const temp = totalJumlah.reduce((total: any, item: any) => {
                                return total + parseInt(item.nilai);
                            }, 0);
                            setBodyState((oldData: any) => ({
                                ...oldData,
                                total_beban_karyawan: String(temp),
                            }));
                        }, 200);
                        // gridPembebanan.current!.deleteRecord(selectedListData);
                        // setDsRekening((prevData) => prevData.filter((_, i) => i !== selectedRowIndexBebanKaryawan));
                        // setTimeout(() => {
                        //     gridPembebanan.current!.refresh();
                        // }, 200);
                    }
                });
        } else {
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Pilih Data Rekening Terlebih Dulu</p>`,
                target: '#forDialogAndSwall',
            });
        }
    };
    const deleteAllRekeningBank = () => {
        if (Array.isArray(gridPembebanan.current!.dataSource)) {
            if ((gridPembebanan.current!.dataSource as any[]).length > 0) {
                withReactContent(Swal)
                    .fire({
                        html: 'Hapus semua data?',
                        width: '15%',
                        target: '#forDialogAndSwall',
                        showCancelButton: true,
                        confirmButtonText: '<p style="font-size:10px">Ya</p>',
                        cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                    })
                    .then((result) => {
                        if (result.isConfirmed) {
                            (gridPembebanan.current!.dataSource as any[]).splice(0, (gridPembebanan.current!.dataSource as any[]).length);

                            gridPembebanan.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };

    console.log('bodyState?.total_beban_karyawan',bodyState?.total_beban_karyawan);
    

    const EditTemplateNip = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.nip} readonly />
                    <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setVisibleDialogKry(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };
    const EditTemplateNamaKry = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.nama_kry} readonly />
                    <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setVisibleDialogKry(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };
    const EditTemplateJabatan = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.jabatan} readonly />
                    <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setVisibleDialogKry(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    const calculateTotalCost = (args: any) => {
        const formEle = (gridPembebanan.current as any).element.querySelector('form').ej2_instances[0];
        const test: any = document.getElementById('beban_karyawan');

        formEle.getInputElement('nilai').value = (Math.ceil(parseFloat(((parseFloat(formEle.getInputElement('beban').value) / 100) * parseFloat(test.value.replace(/,/g, ''))).toFixed(2))));
    };
    const calculateTotalCostPersen = (args: any) => {
        const formEle = (gridPembebanan.current as any).element.querySelector('form').ej2_instances[0];
        const test: any = document.getElementById('beban_karyawan');
        console.log('helo', (parseFloat(formEle.getInputElement('nilai').value) / parseFloat(test.value.replace(/,/g, ''))) * 100);

        formEle.getInputElement('beban').value = Math.ceil(parseFloat(((parseFloat(formEle.getInputElement('nilai').value) / parseFloat(test.value.replace(/,/g, ''))) * 100).toFixed(2)));
    };
    const filterInput = (args: any) => {
        const value = args.value;

        // Filter input untuk hanya mengizinkan angka
        if (!/^\d*$/.test(value)) {
            args.value = value.replace(/\D/g, ''); // Hapus karakter non-angka
        }
    };
    const bebanParams = { params: { change: calculateTotalCost, showSpinButton: false, min: 0, input: filterInput } };
    const nilaiParams = { params: { change: calculateTotalCostPersen, showSpinButton: false, min: 0, input: filterInput } };
    const numericParams = {
        params: {
            decimals: 0,
            format: 'N',
            showClearButton: true,
            showSpinButton: false,
        },
    };

    // const load = (): void => {
    //     let gridElement = document.getElementById('gridPembebanan');

    //     if (gridElement) {
    //         let instance = (gridElement as any)?.ej2_instances?.[0];

    //         if (instance) {
    //             instance.element.addEventListener('mouseup', function (e: any) {
    //                 if ((e.target as HTMLElement).classList.contains('e-rowcell')) {
    //                     if (instance.isEdit) instance.endEdit();
    //                     const test = (e.target as any).getAttribute('data-colindex');
    //                     let index: number = parseInt((e.target as any).getAttribute('Index'));
    //                     setIndexRow(index);
    //                     console.log('index', index);

    //                     if (!isNaN(index)) {
    //                         console.log('instance:', instance);

    //                         if (typeof instance.selectRow === 'function') {
    //                             instance.selectRow(index);
    //                         }

    //                         if (typeof instance.startEdit === 'function') {
    //                             instance.startEdit();
    //                         }

    //                         if (test == '3') {
    //                             document.getElementById('gridPembebananbeban')?.focus();
    //                             (document.getElementById('gridPembebananbeban') as any)?.select();
    //                         } else if (test == '4') {
    //                             document.getElementById('gridPembebanannilai')?.focus();
    //                             (document.getElementById('gridPembebanannilai') as any)?.select();
    //                         } else if (test == '5') {
    //                             document.getElementById('gridPembebananketerangan')?.focus();
    //                             (document.getElementById('gridPembebananketerangan') as any)?.select();
    //                         }
    //                     }
    //                 }
    //             });
    //         } else {
    //             console.error('Instance Syncfusion tidak ditemukan!');
    //         }
    //     } else {
    //         console.error("Element dengan ID 'gridPembebanan' tidak ditemukan di DOM!");
    //     }
    // };
    //
    const handleActionComplete = (args: any) => {
        if (args.requestType === 'save') {
            const totalJumlah: any = gridPembebanan.current!.dataSource;
            totalJumlah[args.rowIndex] = args.data;
            const temp = totalJumlah.reduce((total: any, item: any) => {
                return total + parseFloat(item.nilai);
            }, 0);
            setBodyState((oldData: any) => ({
                ...oldData,
                total_beban_karyawan: String(temp),
            }));
        }
    };
    return (
        <>
            {visibleDialogKry && (
                <DialogKaryawanBeban
                    visible={visibleDialogKry}
                    onClose={() => setVisibleDialogKry(false)}
                    list_kry={list_karyawan}
                    setList_karyawan={setList_karyawan}
list_karyawanOri={list_karyawanOri}
                    setHeaderDialogState={{}}
                    gridPembebanan={gridPembebanan}
                    selectedRowIndexBebanKaryawan={selectedRowIndexBebanKaryawan}
                />
            )}
            <GridComponent
                id="gridPembebanan"
                name="gridPembebanan"
                className="gridPembebanan"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                dataSource={dsRekening}
                ref={gridPembebanan}
                height={150} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                rowHeight={23}
                editSettings={{
                    allowAdding: masterState === 'HITUNG' || masterState === 'KOREKSI',
                    allowEditing: masterState === 'HITUNG' || masterState === 'KOREKSI',
                    newRowPosition: 'Bottom',
                }}
                // load={load}
                actionComplete={handleActionComplete}
                allowKeyboard={true}
                rowSelecting={rowSelectingRekeningBank}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="nip"
                        isPrimaryKey={true}
                        headerText="Nip"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        width={150}
                        editTemplate={EditTemplateNip}
                    />

                    <ColumnDirective
                        width={150}
                        field="nama_kry"
                        headerText="Nama Karyawan"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        editTemplate={EditTemplateNamaKry}
                    />
                    <ColumnDirective field="jabatan" width={140} headerText="Jabatan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" editTemplate={EditTemplateJabatan} />
                    <ColumnDirective
                        field="beban"
                        width="110"
                        edit={bebanParams}
                        headerTemplate={'Beban %'}
                        headerText="No. Akun"
                        headerTextAlign="Center"
                        textAlign="Right"
                        clipMode="EllipsisWithTooltip"
                    />

                    <ColumnDirective
                        field="nilai"
                        edit={nilaiParams}
                        format="N"
                        allowEditing={true}
                        headerText="Jumlah"
                        headerTextAlign="Center"
                        textAlign="Right"
                        width="110"
                        clipMode="EllipsisWithTooltip"
                    />
                    <ColumnDirective width={210} field="keterangan" headerText="Keterangan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>

                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
            </GridComponent>
            <div className="mt-3 flex items-center justify-start gap-3">
                {masterState === 'PREVIEW' || masterState?.toLowerCase().startsWith('approval') ? null : (
                    <>
                        <ButtonComponent
                            id="buAddRekening"
                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-plus"
                            onClick={() => addRekeningCustomer('new')}
                        />
                        <ButtonComponent
                            id="buSingleDeleteRekening"
                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                            cssClass="e-warning e-small"
                            iconCss="e-icons e-small e-trash"
                            onClick={() => deleteRekeningBank()}
                        />
                        <ButtonComponent
                            id="buDeleteAllRekening"
                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                            cssClass="e-danger e-small"
                            iconCss="e-icons e-small e-erase"
                            onClick={() => deleteAllRekeningBank()}
                        />{' '}
                    </>
                )}

                <div className="flex h-[80%] items-center">
                    <span className="w-[150px]">{formatString('total_beban_karyawan')} :</span>
                    <input
                        type="text"
                        id="total_beban_karyawan"
                        className={`w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                            isFocused?.total_beban_karyawan === true ? 'text-left' : 'text-right'
                        } ${Math.ceil(parseFloat(bodyState?.beban_karyawan.replace(/,/g, ''))) !== Math.ceil(parseFloat(bodyState?.total_beban_karyawan.replace(/,/g, ''))) && 'bg-red-400 placeholder:text-gray-600'}`}
                        placeholder={formatString('<isi_beban_karyawan>')}
                        name="total_beban_karyawan"
                        readOnly
                        value={isFocused?.total_beban_karyawan ? hiddenNol(bodyState?.total_beban_karyawan) : formatNumber(hiddenNol(Math.ceil(bodyState?.total_beban_karyawan)))} // Format hanya saat blur
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={{ height: '100%' }}
                    />
                </div>
            </div>
        </>
    );
}
