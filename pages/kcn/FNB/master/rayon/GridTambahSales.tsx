'use client';
import React, { useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import DialogSales from './DialogSales';
export default function GridTambahSales({ gridSales, apiUrl, kode_entitas, token }: { gridSales: any; apiUrl: any; kode_entitas: any; token: any }) {
    const [selectedRowIndexRekeningbarang, setSelectedRowIndexRekeningbarang] = useState(0);
    const [dsBarang, setDsBarang] = useState([]);
    const [visibleSales, setVisibleSales] = useState(false);

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

    const handleRekening_EndEdit = async () => {
        gridSales.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = gridSales.current.dataSource?.length;
        const isNotEmptyNamabarang = gridSales.current.dataSource?.every((item: any) => item.id_supp !== '');
        const isNotEmptyNoRekening = gridSales.current.dataSource?.every((item: any) => item.kode_jenis !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoRekening)) {
                const newObject = {
                    id: gridSales.current!.dataSource.length + 1,
                    nama_sales: '',
                };
                gridSales.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridSales.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridSales')?.focus();
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">Silahkan melengkapi data rekening sebelum menambah data baru.</p>',
                    width: '100%',
                    target: '#forDialogAndSwall',
                });
            }
        }
    };
    const deleteRekeningbarang = async () => {
        const selectedListData: any = gridSales.current!.getSelectedRecords();
        console.log('selectedListData', selectedListData);

        if (selectedListData.length > 0) {
            withReactContent(Swal)
                .fire({
                    icon: 'question',
                    title: `<p style="font-size:12px">Yakin Ingin Menghapus Produk ${selectedRowIndexRekeningbarang + 1}</p>`,
                    target: '#forDialogAndSwall',
                    showCancelButton: true,
                    confirmButtonText: 'Ya',
                    cancelButtonText: 'Tidak',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        gridSales.current!.deleteRecord(selectedListData);
                        setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        setTimeout(() => {
                            gridSales.current!.refresh();
                        }, 200);
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
    const deleteAllRekeningbarang = () => {
        if (Array.isArray(gridSales.current!.dataSource)) {
            if ((gridSales.current!.dataSource as any[]).length > 0) {
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
                            (gridSales.current!.dataSource as any[]).splice(0, (gridSales.current!.dataSource as any[]).length);

                            gridSales.current!.refresh();
                        } else {
                            console.log('cancel');
                        }
                    });
            }
        }
    };

    const EditTemplateSales = (args: any) => {
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
                                setVisibleSales(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    return (
        <>
            <DialogSales
                apiUrl={apiUrl}
                kode_entitas={kode_entitas}
                visible={visibleSales}
                onClose={() => setVisibleSales(false)}
                token={token}
                setHeaderDialogState={gridSales}
                selectedRowIndexRekeningbarang={selectedRowIndexRekeningbarang}
            />

            <GridComponent
                id="gridSales"
                name="gridSales"
                className="gridSales"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                dataSource={dsBarang}
                ref={gridSales}
                height={150} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    newRowPosition: 'Bottom',
                }}
                allowKeyboard={false}
                rowSelecting={rowSelectingRekeningbarang}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="id"
                        isPrimaryKey={true}
                        headerText="Nama Sales"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        allowEditing={false}
                        width={400}
                        visible={false}
                    />
                    <ColumnDirective field="nama_sales" editTemplate={EditTemplateSales} headerText="Nama Sales" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={400} />
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
