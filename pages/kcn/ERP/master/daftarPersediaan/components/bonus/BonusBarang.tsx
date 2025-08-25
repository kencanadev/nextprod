'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Inject, Page, Edit, Resize, Selection, CommandColumn, Toolbar, Grid, GridComponent, ColumnDirective, ColumnsDirective, Filter, FilterSettingsModel } from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextBoxComponent, NumericTextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import axios from 'axios';
import ModalBarangGrid from './ModalBarangGrid';
import { useSession } from '@/pages/api/sessionContext';
const sumber: object[] = [
        { value: 'Antara', text: 'Antara' },
        { value: '>', text: '>' },
        { value: '<', text: '<' },
        { value: '>=', text: '>=' },
        { value: '=', text: '=' },
    ];

    const sumberParams : any = {
            params: {
                dataSource: sumber ,
                fields: { text: 'text', value: 'value' },
            },
        };
        const formatDateWaktu: Object = { type: 'date', format: 'dd-MM-yyyy' };
export default function BonusBarangDialog({ formState, tabAktif }: { formState: any; tabAktif: any }) {
    const { sessionData, isLoading } = useSession();
  
    
      const kode_entitas = sessionData?.kode_entitas ?? '';
      const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [selectedRowIndexRekeningbarang, setSelectedRowIndexRekeningbarang] = useState(0);
        const [listBarang, setlistBarang] = useState([]);
    const gridSales = useRef<GridComponent>(null);
    const [dsBarang, setDsBarang] = useState([]);
    const [visibleSales, setVisibleSales] = useState(false);
    const [modalBarangVisible, setModalBarangVisible] = useState(false);

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
    const dataItem = async (filter: any = {}) => {
        if (Object.keys(filter).length !== 0) {
            const kelompokResponse = await axios.get(`${apiUrl}/erp/list_barang?`, {
                params: {
                    entitas: kode_entitas,
                    kode: filter.no_item,
                    nama: filter.nama_item,
                    limit: 25,
                },
            });
            const temp: any = kelompokResponse.data.data
            setlistBarang(temp);
        } else {
            const kelompokResponse = await axios.get(`${apiUrl}/erp/list_barang?`, {
                params: {
                    entitas: kode_entitas,
                    kode: 'all',
                    nama: 'all',
                    limit: 25,
                },
            });
            const temp: any = kelompokResponse.data.data
            setlistBarang(temp);
        }
    };
    const addRekeningCustomer = async (jenis: any) => {
        await handleRekening_EndEdit();
        const sourceLength = (gridSales.current?.dataSource as any).length;
        const isNotEmptyNamabarang = (gridSales.current?.dataSource as any).every((item: any) => item.id_supp !== '');
        const isNotEmptyNoRekening = (gridSales.current?.dataSource as any).every((item: any) => item.kode_jenis !== '');

        if (jenis !== 'selected') {
            if ((sourceLength === 0 && jenis === 'new') || (jenis === 'new' && isNotEmptyNamabarang && isNotEmptyNoRekening)) {
                const newObject = {
                    kode_item: formState?.kode_item ?? '',
                    id_item: formState?.bonus_barang.length + 1,
                    prioritas: tabAktif === 'bonus_barang' ? 1 : tabAktif === 'diskon_kuantitas' ? 2 : tabAktif === 'diskon_tanggal' ? 3 : tabAktif === 'diskon_jam' ? 4 : 5,
                    operator: '',
                    jml1: 0,
                    jml2: 0,
                    tgl1: '',
                    tgl2: '',
                    jam1: '',
                    jam2: '',
                    jenis: '',
                    nilai: '',
                    diskon: '',
                    jml_bonus: '',
                    kode_bonus: '',
                };
                gridSales.current!.addRecord(newObject, sourceLength);
                // setTimeout(() => {
                //     gridSales.current!.startEdit();
                // }, 200);
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

    const EditTemplateNoItem = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.no_item} readonly />
                    <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setModalBarangVisible(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    const EditTemplateNamaItem = (args: any) => {
        return (
            <>
                <div style={{ position: 'relative' }}>
                    <TextBoxComponent style={{ fontSize: '12px' }} value={args.nama_item} readonly />
                    <button style={{ position: 'absolute', top: '15px', right: '5px', background: 'none', border: 'none' }} type="button">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="ml-2"
                            width="15"
                            height="15"
                            onClick={() => {
                                setModalBarangVisible(true);
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    const filterOptions: FilterSettingsModel = {
        columns: [
            {
                field: 'prioritas',
                matchCase: false,
                operator: 'startswith',
                predicate: 'and',
                value: tabAktif === 'bonus_barang' ? 1 : tabAktif === 'diskon_kuantitas' ? 2 : tabAktif === 'diskon_tanggal' ? 3 : tabAktif === 'diskon_jam' ? 4 : 5,
            },
        ],
        type: 'Menu',
    };

    const editTemplateAktifRekening = (args: any) => {
            return (
                <DropDownListComponent
                    id="operator"
                    name="operator"
                    dataSource={[
                        {
                            operator: 'Antara',
                        },
                        {
                            operator: '>',
                        },
                        {
                            operator: '<',
                        },
                        {
                            operator: '>=',
                        },
                        {
                            operator: '<=',
                        },
                    ]}
                    fields={{ value: 'operator', text: 'operator' }}
                    floatLabelType="Never"
                    placeholder={args.operator}
                    onChange={(e: any) => {
                        if (gridSales.current!.dataSource && Array.isArray(gridSales.current!.dataSource)) {
                            gridSales.current!.dataSource[args.index] = {
                                ...gridSales.current!.dataSource[args.index],
                                operator: e.value,
                            };
                        }
                    }}
                    value={args.operator}
                />
            );
        };

        useEffect(() => {
          dataItem();
        
          
        }, [])
        

    // useEffect(() => {
    //  console.log('masuk tab', tabAktif);

    //                 if (tabAktif === 'bonus_barang') {
    //                     gridSales.current?.filterByColumn('prioritas', 'equal', 1);
    //                 } else if (tabAktif === 'diskon_kuantitas') {
    //                      gridSales.current?.filterByColumn('prioritas', 'equal', 2);
    //                 } else if (tabAktif === 'diskon_tanggal') {
    //                      gridSales.current?.filterByColumn('prioritas', 'equal', 3);
    //                 } else if (tabAktif === 'diskon_jam') {
    //                      gridSales.current?.filterByColumn('prioritas', 'equal', 4);
    //                 } else {
    //                      gridSales.current?.filterByColumn('prioritas', 'equal', 5);
    //                 }

    // },[tabAktif])

    return (
        <>
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
                dataSource={formState?.bonus_barang}
                ref={gridSales}
                height={200} //170 barang jadi 150 barang produksi
                gridLines={'Both'}
                loadingIndicator={{
                    indicatorType: 'Shimmer',
                }}
                allowFiltering={true}
                editSettings={{
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    newRowPosition: 'Bottom',
                }}
                allowKeyboard={false}
                filterSettings={filterOptions}
                rowSelecting={rowSelectingRekeningbarang}
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="id_item"
                        isPrimaryKey={true}
                        headerText="Nama Sales"
                        headerTextAlign="Center"
                        textAlign="Left"
                        clipMode="EllipsisWithTooltip"
                        allowEditing={false}
                        width={320}
                        visible={false}
                    />

                    <ColumnDirective field="operator" editTemplate={editTemplateAktifRekening}  headerText="Operator" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    {tabAktif === 'bonus_barang' || tabAktif === 'diskon_kuantitas' ? (
                        <ColumnDirective field="jml1" headerText="Jumlah 1" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif === 'diskon_tanggal' || tabAktif === 'diskon_tanggal_dan_jam' ? (
                    <ColumnDirective field="tgl1" headerText="Tanggal 1" type='date' format={formatDateWaktu} editType='datepickeredit' headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif === 'diskon_jam' || tabAktif === 'diskon_tanggal_dan_jam' ? (
                    <ColumnDirective field="jam1" headerText="Jam 1" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif === 'diskon_tanggal' || tabAktif === 'diskon_tanggal_dan_jam' ? (
                    <ColumnDirective field="tgl2" headerText="Tanggal 2" type='date' format={formatDateWaktu} editType='datepickeredit' headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif === 'diskon_jam' || tabAktif === 'diskon_tanggal_dan_jam' ? (
                    <ColumnDirective field="jam2" headerText="Jam 2" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif === 'bonus_barang' || tabAktif === 'diskon_kuantitas' ? (
                        <ColumnDirective field="jml2" headerText="Jumlah 2" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    ) : null}
                    {tabAktif !== 'bonus_barang' && (
                        
                            <ColumnDirective field="jenis" headerText="Jenis" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                     
                    )}
                    {tabAktif !== 'bonus_barang' && <ColumnDirective field="nilai" headerText="Nominal" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />}

                    {tabAktif === 'bonus_barang' && <ColumnDirective field="no_item" editTemplate={EditTemplateNoItem} headerText="No. Item" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />}
                    {tabAktif === 'bonus_barang' && (
                        <ColumnDirective field="nama_item" headerText="Nama Barang" editTemplate={EditTemplateNamaItem} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={200} />
                    )}
                    {tabAktif !== 'bonus_barang' ? (
                                         <ColumnDirective field="diskon" headerText="Diskon" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />

                    ) : null}
                    <ColumnDirective allowEditing={false} field="prioritas" headerText="Prioritas" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={80} />
                    {/* <ColumnDirective field="nama_sales" editTemplate={EditTemplateSales} headerText="Nama Sales" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" width={400} /> */}
                </ColumnsDirective>

                <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize, Filter]} />
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
                    {modalBarangVisible && (
                        <ModalBarangGrid
                            visible={modalBarangVisible}
                            onClose={() => setModalBarangVisible(false)}
                            gridDetailBarang={gridSales}
                            itemList={listBarang}
                            filterState={() => {}}
                            setFilterState={() => {}}
                            selectedRowIndexRekeningbarang={selectedRowIndexRekeningbarang}
                            marginList={[]}
                        />
                    )}
        </>
    );
}
