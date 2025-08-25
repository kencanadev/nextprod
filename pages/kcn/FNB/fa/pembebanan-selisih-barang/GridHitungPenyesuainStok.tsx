import React, { useEffect, useRef, useState } from 'react';
import {
    Grid,
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
    QueryCellInfoEventArgs,
    rowSelected,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useProgress } from '@/context/ProgressContext';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const headerTemplate = () => {
    return(<div>Pilih</div>);
}

const selectionSettings : any= { type: 'Multiple', checkboxOnly: true };
const pageSeting = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
}

const GridHitungPenyesuainStok = ({
    GridHitungPenyesuainStokReff,
    apiUrl,
    kode_entitas,
    token,
    terpilih,
    setTerpilih,
    setMasterState,
    setVisibleDialog,
    swalCOnfirm,
    userid,
    getRps,
    filterTabJenis
}: {
    GridHitungPenyesuainStokReff: any;
    apiUrl: string;
    kode_entitas: string;
    token: string;
    terpilih: any;
    setTerpilih: any;
    setMasterState: any;
    setVisibleDialog: any;
    swalCOnfirm: any;
    userid: string;
    getRps: any;
    filterTabJenis: any
}) => {
    const [selectedRow, setSelectedRow] = useState({});
    const [modalBatal, setModalBatal] = useState(false);
    const [alasanBatal, setAlasanBatal] = useState('');
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };
    const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };

    const prosesBatal = () => {
        const dataDiBatal = GridHitungPenyesuainStokReff.current.dataSource.filter((item: any) => item.pilih === 'Y');
        if (dataDiBatal.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Batal PS : Pilih PS Terlebih Dahulu`,
            });
            return false;
        }

        withReactContent(swalCOnfirm)
            .fire({
                icon: 'warning',
                title: `Apakah Anda Ingin Melakukan Pembatalan
                `,
                width: '100%',
                target: '#dialogJenisTransaksiMB',
                showConfirmButton: true,
                confirmButtonText: 'Yakin',
                timer: 100000,
                showDenyButton: true,
                denyButtonText: 'Tidak',
            })
            .then(async (e) => {
                if (e.isConfirmed) {
                    setModalBatal(true);
                }
                if (e.dismiss || e.isDenied || e.isDismissed) {
                    return console.log('cancel');
                }
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const pilihTemplate = (args: any) => {
        return (
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id={`hitung_kpi`}
                    className="mx-auto"
                    checked={args.pilih === 'Y'}
                    readOnly
                    onChange={(event) => {
                        const isCheck = event.target.checked;

        const dataSource = GridHitungPenyesuainStokReff.current?.dataSource;

        if (Array.isArray(dataSource)) {
            // Cari indeks elemen berdasarkan `no_fj`
            const index = dataSource.findIndex((item) => item.id_rps === args.id_rps);

            if (index !== -1) {
                console.log('Target ditemukan:', dataSource[index]);

                // Siapkan variabel untuk data yang telah diedit
                let jumlahPembayaran = dataSource[index].jumlah_pembayaran;
                let editedData: any;
                let sisaPembayaran: any;

                if (isCheck) {
                    // Logika saat checkbox dicentang
                    sisaPembayaran = dataSource[index].sisa_hutang - dataSource[index].sisa_hutang;
                    editedData = {
                        ...dataSource[index],
                        pilih: "Y",
                    };
                } else {
                    editedData = {
                        ...dataSource[index],
                        pilih: "N",
                    };
                }

                // Perbarui elemen dalam array di indeks yang ditemukan
                dataSource[index] = editedData;

                // Debugging tambahan
                console.log('Data yang diperbarui:', editedData);
                console.log('DataSource setelah diupdate:', dataSource);

                let totPenerimaan: any;
                let totPiutang: any;
                GridHitungPenyesuainStokReff.current!.dataSource = [...dataSource]; // Salinan baru

                
            } 
        }
                        // const temp = args.pilih === 'Y' ? 'N' : 'Y';
                        // const tempArray = {
                        //     ...GridHitungPenyesuainStokReff.current!.dataSource[args.index],
                        //     pilih: args.pilih === 'Y' ? 'N' : 'Y',
                        // };
                        // GridHitungPenyesuainStokReff.current!.dataSource[args.index] = tempArray;
                        // if (temp === 'Y') {
                        //     setTerpilih((oldData: any) => [...oldData, tempArray]);
                        // } else {
                        //     const tempDelete = terpilih.filter((item: any) => item.id_rps !== args.id_rps);
                        //     setTerpilih(tempDelete);
                        // }
                        // GridHitungPenyesuainStokReff.current!.refresh();
                    }}
                />
            </div>
        );
    };

    const formatNumber = (num: string) => {
        if (!num) return ''; // Jika kosong, kembalikan string kosong
        const parsedNumber = parseFloat(num.replace(/,/g, ''));
        if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
        return parsedNumber.toLocaleString('en-US');
    };
    const minusValueAccessor = (field: string, data: any, column: any) => {
        return data[field] < 0 ? `(${formatNumber(String(data[field] * -1))})` : formatNumber(String(data[field])); // If the value is 0, return empty string
    };

    const customizeCell = (args: any) => {
        if (args.column.field === 'qty_std') {
            if (args.data.qty_std < 0) {
                args.cell.classList.add('bg-red-400');
            }
        } else if (args!.column.field === 'nominal') {
            if (args.data.nominal < 0) {
                args.cell.classList.add('bg-red-400');
            }
        }
    };

    const buttons: any = [
        {
            buttonModel: {
                content: 'OK',
                cssClass: 'e-flat',
                isPrimary: true,
            },
            click: async () => {
                const dataDiBatal = GridHitungPenyesuainStokReff.current.dataSource.filter((item: any) => item.pilih === 'Y');
                startProgress();

                try {
                    await dataDiBatal.map(async (item: any) => {
                        const json = {
                            entitas: kode_entitas,
                            batal_alasan: alasanBatal,
                            batal_userid: userid.toUpperCase(),
                            kode_ps: item.kode_ps,
                            id_ps: item.id_ps,
                        };

                        const response: any = await axios.post(`${apiUrl}/erp/pembatalan_ps_rps?`, json, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                    });

                    await getRps();
                    endProgress();
                    setModalBatal(false);
                    Swal.fire({
                        title: 'Berhasil Batal',
                        target: '#forPembatalan',
                        icon: 'success',
                    });
                    console.log('dataDiBatal', dataDiBatal);
                } catch (error) {}
            },
        },
        {
            buttonModel: {
                content: 'Cancel',
                cssClass: 'e-flat',
            },
            click: () => {
                setModalBatal(false);
            },
        },
    ];

    const selectedRowIndex = useRef<number | null>(null);

    const onSelectedRows = (args: any) => {
        selectedRowIndex.current = args.rowIndex;
    };

    const handleDataBound = () => {
        if (GridHitungPenyesuainStokReff.current && selectedRowIndex.current !== null) {
            (GridHitungPenyesuainStokReff.current as any).selectRow(selectedRowIndex.current, false);
        }
    };

    useEffect(() => {

        
        if(filterTabJenis === "Hitung Penyesuaian Stok"){
            setTimeout(() =>{
                console.log('ke tringer');
                
                GridHitungPenyesuainStokReff.current.refresh();
            },300)
        }
    },[filterTabJenis])

    return (
        <div className="flex h-full w-full flex-col overflow-x-auto" id="forPembatalan">
            {modalBatal && (
                <DialogComponent width="250px" target="#forPembatalan" close={() => setModalBatal(false)} header="Pembatalan" visible={modalBatal} showCloseIcon={true} buttons={buttons}>
                    <textarea
                        id="simple-textarea"
                        className="m-0 h-full w-full rounded-sm border border-gray-300 bg-gray-50 p-1 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tuliskan Alasan Batal"
                        name="keterangan"
                        rows={3}
                        value={alasanBatal}
                        onChange={(e) => setAlasanBatal(e.target.value)}
                    ></textarea>
                </DialogComponent>
            )}
            <div className="h-[80%]">
                <GridComponent
                    id="gridListCashCount"
                    locale="id"
                    // dataSource={list_kas_opname}
                    height={"36vh"} 
                    pageSettings={pageSeting}
                    // rowSelected={selectedRowHandle}
                    // recordDoubleClick={recordDoubleClick}
                    rowSelected={onSelectedRows}
                    dataBound={handleDataBound}
                    allowPaging={true}
                    width={'100%'}
                    gridLines="Both"
                    allowResizing={true}
                    allowReordering={true}
                    allowSorting={true}
                    autoFit={true}
                    rowHeight={23}
                    queryCellInfo={customizeCell}
                    ref={GridHitungPenyesuainStokReff}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="id_rps" width="135" visible={false} isPrimaryKey={true} headerText="No. PS" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="dok" width="80" headerText="Dok. Sumber" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="no_ps" width="135" headerText="No. PS" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="tgl_ps" type="date" width="100" headerText="Tanggal" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" format={formatDateYM} />
                        <ColumnDirective field="nama_gudang" width="150" headerText="Gudang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="nama_item" width="200" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="qty_std" width="50" headerText="Qty" valueAccessor={minusValueAccessor} headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective
                            field="nominal"
                            width="100"
                            headerText="Nilai (Rp)"
                            valueAccessor={minusValueAccessor}
                            headerTextAlign="Center"
                            textAlign="Right"
                            clipMode="EllipsisWithTooltip"
                        />
                        <ColumnDirective field="pilih"  width="30" headerText="Pilih" template={pilihTemplate} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        {/* <ColumnDirective type='checkbox' field="pilih" width="30"   /> */}
                        <ColumnDirective field="alasan" width="200" headerText="Alasan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                        <ColumnDirective field="keterangan" width="300" headerText="Keterangan Tambahan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                    </ColumnsDirective>
                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                </GridComponent>
            </div>
            <div className="flex flex-grow w-full items-center gap-2 py-2">
                <ButtonComponent type="submit" onClick={getRps}>
                    🔃 Refresh
                </ButtonComponent>
                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if(e.target.checked) {
                                                const dataSource = GridHitungPenyesuainStokReff.current?.dataSource;
                                                const temp = dataSource.map((item: any) => ({
                                                    ...item,
                                                    pilih: 'Y'
                                                }))
                                                GridHitungPenyesuainStokReff.current!.dataSource = temp
                                            } else {
                                                const dataSource = GridHitungPenyesuainStokReff.current?.dataSource;
                                                const temp = dataSource.map((item: any) => ({
                                                    ...item,
                                                    pilih: 'N'
                                                }))
                                                GridHitungPenyesuainStokReff.current!.dataSource = temp
                                            }
                                        }}
                                    />
                                    Pilih semua data 
                                </label>
                <ButtonComponent
                    type="submit"
                    onClick={() => {
                        setMasterState('HITUNG');
                        setVisibleDialog(true);
                    }}
                >
                    ➡️ Hitung Pembebanan
                </ButtonComponent>
                <ButtonComponent type="submit" onClick={prosesBatal}>
                    ➡️ Pembatalan Pembebanan
                </ButtonComponent>
            </div>
        </div>
    );
};

export default GridHitungPenyesuainStok;
