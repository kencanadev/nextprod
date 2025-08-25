'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
export default function GridRekeningTemp({
    userId,
    bankState,
    setBankState,
    masterState,
    gridRekeningSupplier,
}: {
    bankState: any;
    userId: any;
    setBankState: any;
    masterState: any;
    gridRekeningSupplier: any;
}) {
    const [selectedRowIndexRekeningBank, setSelectedRowIndexRekeningBank] = useState(0);
    const [dsRekening, setDsRekening] = useState([
        {
            nama_bank: '',
            no_rekening: '',
            nama_rekening: '',
            aktif: 'Y',
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            userid: userId,
            pkp: 'N',
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
    const rowSelectingRekeningBank = (args: any) => {
        setSelectedRowIndexRekeningBank(args.rowIndex);
    };

    const editTemplateNamaAkunBank = (args: any) => {
        return (
            <div>
                <TextBoxComponent
                    id="nama_bank"
                    name="nama_bank"
                    className="nama_bank"
                    onChange={(e: any) => {
                        if (gridRekeningSupplier.current!.dataSource && Array.isArray(gridRekeningSupplier.current!.dataSource)) {
                            gridRekeningSupplier.current!.dataSource[args.index] = {
                                ...gridRekeningSupplier.current!.dataSource[args.index],
                                nama_bank: e.value,
                            };
                        }
                    }}
                    value={args.nama_bank}
                />
            </div>
        );
    };
    const editTemplateNoRekeningBank = (args: any) => {
        return (
            <input
                name="no_rekening"
                id="no_rekening"
                className="e-field"
                onBlur={(e: any) => {
                    if (gridRekeningSupplier.current!.dataSource && Array.isArray(gridRekeningSupplier.current!.dataSource)) {
                        gridRekeningSupplier.current!.dataSource[args.index] = {
                            ...gridRekeningSupplier.current!.dataSource[args.index],
                            no_rekening: e.value,
                        };
                    }
                }}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                            }}
                defaultValue={args.no_rekening}

            />
        );
    };
    const editTemplateNamaRekeningBank = (args: any) => {
        return (
            <div>
                <TextBoxComponent
                    id="nama_rekening"
                    name="nama_rekening"
                    className="nama_rekening"
                    onChange={(e: any) => {
                        if (gridRekeningSupplier.current!.dataSource && Array.isArray(gridRekeningSupplier.current!.dataSource)) {
                            gridRekeningSupplier.current!.dataSource[args.index] = {
                                ...gridRekeningSupplier.current!.dataSource[args.index],
                                nama_rekening: e.value,
                            };
                        }
                    }}
                    value={args.nama_rekening}
                />
            </div>
        );
    };
    const editTemplateAktifRekening = (args: any) => {
        return (
            <DropDownListComponent
                id="aktif"
                name="aktif"
                dataSource={[
                    {
                        aktif: 'Y',
                    },
                    {
                        aktif: 'N',
                    },
                ]}
                fields={{ value: 'aktif', text: 'aktif' }}
                floatLabelType="Never"
                placeholder={args.aktif}
                onChange={(e: any) => {
                    if (gridRekeningSupplier.current!.dataSource && Array.isArray(gridRekeningSupplier.current!.dataSource)) {
                        gridRekeningSupplier.current!.dataSource[args.index] = {
                            ...gridRekeningSupplier.current!.dataSource[args.index],
                            aktif: e.value,
                        };
                    }
                }}
                value={args.aktif}
            />
        );
    };
    const editTemplatePkpRekening = (args: any) => {
        return (
            <DropDownListComponent
                id="pkp"
                name="pkp"
                dataSource={[
                    {
                        pkp: 'Y',
                    },
                    {
                        pkp: 'N',
                    },
                ]}
                fields={{ value: 'pkp', text: 'pkp' }}
                floatLabelType="Never"
                placeholder={args.pkp}
                onChange={(e: any) => {
                    if (gridRekeningSupplier.current!.dataSource && Array.isArray(gridRekeningSupplier.current!.dataSource)) {
                        gridRekeningSupplier.current!.dataSource[args.index] = {
                            ...gridRekeningSupplier.current!.dataSource[args.index],
                            pkp: e.value,
                        };
                    }
                }}
                value={args.pkp}
            />
        );
    };
    const handleRekening_EndEdit = async () => {
        gridRekeningSupplier.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = dsRekening?.length;
        const isNotEmptyNamaBank = dsRekening?.every((item: any) => item.nama_bank !== '');
        const isNotEmptyNoRekening = dsRekening?.every((item: any) => item.no_rekening !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamaBank && isNotEmptyNoRekening)) {
                const newObject = {
                    nama_bank: '',
                    no_rekening: '',
                    nama_rekening: '',
                    aktif: 'Y',
                    pkp: 'N',
                    tgl_update: moment().format('YYYY-MM-DD'),
                    userid: userId,
                };
                gridRekeningSupplier.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridRekeningSupplier.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridRekeningSupplier')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data rekening sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#DialogBaruEdit',
                });
            }
        }
    };
    const deleteRekeningBank = async () => {
        const selectedListData: any = gridRekeningSupplier.current!.getSelectedRecords();
        if (selectedListData.length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Produk ${selectedRowIndexRekeningBank + 1}</p>`,
                    target: '#DialogBaruEdit',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridRekeningSupplier.current!.deleteRecord(selectedListData);
                        setDsRekening((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningBank));
                        setTimeout(() => {
                            gridRekeningSupplier.current!.refresh();
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
    const deleteAllRekeningBank = () => {
        if (Array.isArray(gridRekeningSupplier.current!.dataSource)) {
            if ((gridRekeningSupplier.current!.dataSource as any[]).length > 0) {
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
                            (gridRekeningSupplier.current!.dataSource as any[]).splice(0, (gridRekeningSupplier.current!.dataSource as any[]).length);

                            gridRekeningSupplier.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };
    return (
        <>
            <GridComponent
                id="gridRekeningSupplier"
                name="gridRekeningSupplier"
                className="gridRekeningSupplier"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                dataSource={dsRekening}
                ref={gridRekeningSupplier}
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
                rowSelecting={rowSelectingRekeningBank}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="nama_bank"
                        isPrimaryKey={true}
                        headerText="Nama Bank"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        editTemplate={editTemplateNamaAkunBank}
                        width={150}
                    />

                    <ColumnDirective
                        width={150}
                        field="no_rekening"
                        headerText="No. Rekening"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        editTemplate={editTemplateNoRekeningBank}
                    />
                    <ColumnDirective
                        field="nama_rekening"
                        width={150}
                        headerText="Nama Pemilik"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        editTemplate={editTemplateNamaRekeningBank}
                    />

                    <ColumnDirective width={150} field="aktif" headerText="Aktif" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" editTemplate={editTemplateAktifRekening} />
                    <ColumnDirective width={150} field="pkp" headerText="Pkp" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" editTemplate={editTemplatePkpRekening} />
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
                    onClick={() => deleteRekeningBank()}
                />
                <ButtonComponent
                    id="buDeleteAllRekening"
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-danger e-small"
                    iconCss="e-icons e-small e-erase"
                    onClick={() => deleteAllRekeningBank()}
                />
            </div>
        </>
    );
}
