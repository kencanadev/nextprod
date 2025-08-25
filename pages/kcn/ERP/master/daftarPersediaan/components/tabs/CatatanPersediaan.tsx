'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
const formatDateWaktu: Object = { type: 'date', format: 'dd-MM-yyyy' };
export default function GridTambahSales({ formState, updateState, selectedTabAktif, catatanList, setCatatanList,gridCatatan }: {  formState : any, updateState : any; selectedTabAktif: number; catatanList: any; setCatatanList: any; gridCatatan: any}) {
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
        gridCatatan.current!.endEdit();
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = gridCatatan.current.dataSource?.length;
        const isNotEmptyNamabarang = gridCatatan.current.dataSource?.every((item: any) => item.id_supp !== '');
        const isNotEmptyNoRekening = gridCatatan.current.dataSource?.every((item: any) => item.kode_jenis !== '');
        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoRekening)) {
                const newObject = {
                    id: gridCatatan.current!.dataSource.length + 1,
                    kode_item: formState.kode_item ?? '',
                    catatan: '',
                    tgl: moment().toDate()
                };
                gridCatatan.current!.addRecord(newObject, sourceLength);
                setTimeout(() => {
                    gridCatatan.current!.startEdit();
                }, 200);
            } else {
                document.getElementById('gridCatatan')?.focus();
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
        const selectedListData: any = gridCatatan.current!.getSelectedRecords();
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
                        gridCatatan.current!.deleteRecord(selectedListData);
                        setDsBarang((prevData) => prevData.filter((_, i) => i !== selectedRowIndexRekeningbarang));
                        setTimeout(() => {
                            gridCatatan.current!.refresh();
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
        if (Array.isArray(gridCatatan.current!.dataSource)) {
            if ((gridCatatan.current!.dataSource as any[]).length > 0) {
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
                            (gridCatatan.current!.dataSource as any[]).splice(0, (gridCatatan.current!.dataSource as any[]).length);

                            gridCatatan.current!.refresh();
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

    const actionComplete = (args: any) => {
        // console.log('args', args)
        if(args.requestType = "save") {
            const temp = gridCatatan.current.dataSource;
            // console.log('temp',temp, catatanList);
            setCatatanList(temp)
        }
        
    }

    // useEffect(() => {
    //   if(selectedTabAktif == 4) {
    //     gridCatatan.current.setProperties({dataSource : catatanList});
    //     gridCatatan.current.refresh();
    //   } else {
    //     setCatatanList(gridCatatan.current.dataSource);
    //   }
    // },[selectedTabAktif])

    return (
        <div className='p-2 w-[50%]'>

            <GridComponent
                id="gridCatatan"
                name="gridCatatan"
                className="gridCatatan"
                locale="id"
                selectionSettings={{
                    mode: 'Row',
                    type: 'Single',
                }}
                allowResizing={true}
                autoFit={true}
                dataSource={catatanList}
                ref={gridCatatan}
                height={150} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                rowHeight={23}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    newRowPosition: 'Bottom',
                }}
                allowKeyboard={false}
                rowSelecting={rowSelectingRekeningbarang}
                actionComplete={actionComplete}
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
                    <ColumnDirective field="tgl" headerText="Tgl" type='date' format={formatDateWaktu} edit={{params: {
                      showClearButton: false,
                      enableMask: true
                    }}} editType='datepickeredit'  headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={120} />
                    <ColumnDirective field="catatan" headerText="Catatan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={400} />
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
        </div>
    );
}
