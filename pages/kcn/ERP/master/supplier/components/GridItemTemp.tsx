'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { toUpper } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
export default function GridItemTemp({
    userId,
    barangState,
    setBarangState,
    masterState,
    gridBarangSupplier,
    dsJenisVendor,
    onEditItem,
}: {
    barangState: any;
    userId: any;
    setBarangState: any;
    masterState: any;
    gridBarangSupplier: any;
    dsJenisVendor: any;
    onEditItem: boolean;
}) {
    const [selectedRowIndexRekeningbarang, setSelectedRowIndexRekeningbarang] = useState(0);
    const [dsBarang, setDsBarang] = useState([
        {
            id_supp: 1,
            nama_jenis_supp: '',
            nama_item: '',
            ukuran: '',
            merk: '',
            harga: '',
            userid: userId?.toUpperCase(),
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
    ]);

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
    const rowSelectingRekeningbarang = (args: any) => {
        setSelectedRowIndexRekeningbarang(args.rowIndex);
    };

    useEffect(() => {
        console.log('MASUK SINI barangState');
        if (onEditItem) {
            console.log('MASUK SINI barangState : ..', barangState);

            gridBarangSupplier.current!.dataSource = [...barangState];
        }
    }, [onEditItem, barangState]);

    const editTemplateKodeJenis = (args: any) => {
        return (
            <div>
                <TextBoxComponent
                    id="kode_jenis"
                    name="kode_jenis"
                    type="number"
                    className="kode_jenis"
                    onChange={(e: any) => {
                        if (gridBarangSupplier.current!.dataSource && Array.isArray(gridBarangSupplier.current!.dataSource)) {
                            gridBarangSupplier.current!.dataSource[args.index] = {
                                ...gridBarangSupplier.current!.dataSource[args.index],
                                kode_jenis: e.value,
                            };
                        }
                    }}
                    value={args.kode_jenis}
                />
            </div>
        );
    };
    const editNamaJenisSuppTemplate = (args: any) => {
        return (
            <div className="container form-input" style={{ border: 'none' }}>
                <DropDownListComponent
                    id="nama_jenis_supp"
                    className="form-select"
                    dataSource={dsJenisVendor}
                    fields={{ text: 'nama_jenis_supp', value: 'nama_jenis_supp' }}
                    placeholder="-"
                    value={args.nama_jenis_supp}
                    onChange={(e: any) => {
                        let temp = dsJenisVendor.filter((item: any) => item.nama_jenis_supp === e.value);
                        console.log('event data barang', temp);
                        if (gridBarangSupplier.current!.dataSource && Array.isArray(gridBarangSupplier.current!.dataSource)) {
                            gridBarangSupplier.current!.dataSource[args.index] = {
                                ...gridBarangSupplier.current!.dataSource[args.index],
                                nama_jenis_supp: e.value,
                            };
                        }
                        gridBarangSupplier.current!.dataSource[args.index].kode_jenis = temp[0].kode_jenis;
                    }}
                />
            </div>
        );
    };

    const handleRekening_EndEdit = async () => {
        gridBarangSupplier.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = dsBarang?.length;
        const isNotEmptyNamabarang = dsBarang?.every((item: any) => item.id_supp !== '');
        const isNotEmptyNoRekening = dsBarang?.every((item: any) => item.kode_jenis !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoRekening)) {
                const newObject = {
                    id_supp: gridBarangSupplier.current!.dataSource.length + 1,
                    nama_jenis_supp: '',
                    nama_item: '',
                    ukuran: '',
                    merk: '',
                    harga: '',
                    userid: toUpper(userId),
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                };
                gridBarangSupplier.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridBarangSupplier.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridBarangSupplier')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data rekening sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#DialogBaruEdit',
                });
            }
        }
    };
    const deleteRekeningbarang = async () => {
        const selectedListData: any = gridBarangSupplier.current!.getSelectedRecords();
        if (selectedListData.length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Produk ${selectedRowIndexRekeningbarang + 1}</p>`,
                    target: '#DialogBaruEdit',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridBarangSupplier.current!.deleteRecord(selectedListData);
                        setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        setTimeout(() => {
                            gridBarangSupplier.current!.refresh();
                        }, 200);
                    }
                });
        } else {
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">Pilih Data Rekening Terlebih Dulu</p>`,
                target: '#DialogBaruEdit',
            });
        }
    };
    const deleteAllRekeningbarang = () => {
        if (Array.isArray(gridBarangSupplier.current!.dataSource)) {
            if ((gridBarangSupplier.current!.dataSource as any[]).length > 0) {
                withReactContent(Swal)
                    .fire({
                        html: 'Hapus semua data?',
                        width: '15%',
                        target: '#DialogBaruEdit',
                        showCancelButton: true,
                        confirmButtonText: '<p style="font-size:10px">Ya</p>',
                        cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                    })
                    .then((result) => {
                        if (result.isConfirmed) {
                            (gridBarangSupplier.current!.dataSource as any[]).splice(0, (gridBarangSupplier.current!.dataSource as any[]).length);

                            gridBarangSupplier.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };

    const hargaTemplate = (args: any) => {
        return (
            <NumericTextBoxComponent
                name="harga"
                id="harga"
                min={0} // Prevent values below 0
                // Format to show 2 decimal places
                step={1} // Step for increasing/decreasing the value
                className="e-field"
                onChange={(e: any) => {
                    if (gridBarangSupplier.current!.dataSource && Array.isArray(gridBarangSupplier.current!.dataSource)) {
                        gridBarangSupplier.current!.dataSource[args.index] = {
                            ...gridBarangSupplier.current!.dataSource[args.index],
                            harga: e.value,
                        };
                    }
                }}
                value={args.harga}
            />
        );
    };
    return (
        <>
            <GridComponent
                id="gridBarangSupplier"
                name="gridBarangSupplier"
                className="gridBarangSupplier"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                dataSource={dsBarang}
                ref={gridBarangSupplier}
                height={450} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    // allowDeleting: status_edit == true ? false : true,
                    newRowPosition: 'Bottom',
                }}
                allowKeyboard={false}
                rowSelecting={rowSelectingRekeningbarang}
            >
                <ColumnsDirective>
                    <ColumnDirective field="id_supp" isPrimaryKey={true} headerText="No" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" allowEditing={false} width={40} />

                    <ColumnDirective
                        width={150}
                        field="nama_jenis_supp"
                        headerText="Jenis Vendor"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        editTemplate={editNamaJenisSuppTemplate}
                    />

                    <ColumnDirective width={150} field="ukuran" headerText="Ukuran" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />

                    <ColumnDirective width={150} field="merk" headerText="Merek" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />

                    <ColumnDirective field="harga" width={150} headerText="Harga" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" editTemplate={hargaTemplate} />

                    <ColumnDirective width={150} field="tgl_update" headerText="Tgl Update" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" allowEditing={false} />
                </ColumnsDirective>

                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
            </GridComponent>
            <div className="mt-3 flex items-center justify-start gap-3">
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
                    onClick={() => deleteRekeningbarang()}
                />
                <ButtonComponent
                    id="buDeleteAllRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-danger e-small"
                    iconCss="e-icons e-small e-erase"
                    onClick={() => deleteAllRekeningbarang()}
                />
            </div>
        </>
    );
}
