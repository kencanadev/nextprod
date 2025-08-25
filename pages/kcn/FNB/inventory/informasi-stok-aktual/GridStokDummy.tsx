import React, { useEffect } from 'react';
import {
    Grid,
    AggregatesDirective,
    AggregateDirective,
    AggregateColumnsDirective,
    AggregateColumnDirective,
    Aggregate,
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
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';

const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const pageSettings = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
};

const formatNumber = (num: string) => {
    if (!num) return ''; // Jika kosong, kembalikan string kosong
    const parsedNumber = parseFloat(num.replace(/,/g, ''));
    if (isNaN(parsedNumber)) return ''; // Jika tidak valid, kembalikan string kosong
    if (num == '0') return '';
    return parsedNumber.toLocaleString('en-US');
};
const minusValueAccessor = (field: string, data: any, column: any) => {
    return data[field] < 0 ? `(${formatNumber(String(data[field] * -1))})` : formatNumber(String(data[field])); // If the value is 0, return empty string
};

const CustomSumFlex = (props: any) => {
    return <span style={{ fontWeight: 'bold' }}>{formatNumber(String(props.Custom))}</span>;
};

const totJumlahPabrik = (args: any) => {
    const jumlahMu = args?.result?.reduce((total: number, item: any) => {
        return total + item?.jumlah_stok_tersedia;
    }, 0);
    return jumlahMu;
};

const GridStokDumy = ({
    gridStokReff,
    gudangTerpilihData = [],
    listStok,
    setSelectedRow,
    toggleGrid,
    setToggleGrid,
    recordDoubleClick,
}: {
    gridStokReff: any;
    gudangTerpilihData: any;
    listStok: any;
    setSelectedRow: any;
    toggleGrid: any;
    setToggleGrid: any;
    recordDoubleClick: any;
}) => {
    console.log('gudangTerpilihData', gudangTerpilihData);

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)?.toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }

    const getSelectedRow = (args: any) => {
        setSelectedRow(args.data);
    };

    const footerSum = (props: any) => {
        return <span>{props.Sum}</span>;
    };

    const CustomSumJumlahpabrik = (props: any) => {
        return <span style={{ fontWeight: 'bold' }}>{formatNumber(String(props.Custom))}</span>;
    };

    const formatKey = (key: string) => key.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    console.log('toggleGrid', toggleGrid);

    const aggregateColumns = gudangTerpilihData.map((item: any) => (
        <AggregateColumnDirective
            key={item.nama_gudang}
            field={formatKey(item.nama_gudang)}
            type="Custom"
            customAggregate={(args: any) => {
                if (args.aggregates !== undefined) {
                    const namaSum = Object?.keys(args?.aggregates)[0]?.split(' - ')[0];
                    console.log(namaSum);

                    const jumlahMu = args?.result?.reduce((total: number, item: any) => {
                        return total + item[namaSum];
                    }, 0);
                    return jumlahMu;
                }
                return 0;
            }}
            footerTemplate={(props: any) => {
                return <span style={{ fontWeight: 'bold' }}>{formatNumber(String(props.Custom))}</span>;
            }}
        />
    ));

    useEffect(() => {
        gridStokReff.current.refresh();
    }, [toggleGrid?.jumlah_qty]);
    return (
        <GridComponent
            id="GridStok"
            locale="id"
            // dataSource={dsTab1}
            height={'100%'}
            pageSettings={pageSettings}
            dataSource={listStok}
            ref={gridStokReff}
            // rowSelected={selectedRowHandle}
            // recordDoubleClick={recordDoubleClick}
            allowPaging={true}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowReordering={true}
            allowSorting={true}
            rowHeight={23}
            recordDoubleClick={recordDoubleClick}
            rowSelected={getSelectedRow}
            // rowDataBound={handleRowDataBound}
            // ref={gridCashCount}
        >
            <ColumnsDirective>
                <ColumnDirective
                    field="kode_barang"
                    isPrimaryKey={true}
                    visible={false}
                    width="115"
                    headerText={formatString('kode_barang')}
                    headerTextAlign="Center"
                    textAlign="Left"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective field="no_item" width="115" headerText={formatString('no_item')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_item" width="180" headerText={formatString('nama_item')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                {gudangTerpilihData.map((item: any) => (
                    <ColumnDirective
                        field={formatKey(item.nama_gudang)}
                        width={60 + (item.nama_gudang.length + 5) * 3.5}
                        headerText={item.nama_gudang}
                        headerTextAlign="Center"
                        textAlign="Right"
                        valueAccessor={minusValueAccessor}
                        clipMode="EllipsisWithTooltip"
                    />
                ))}
                <ColumnDirective
                    field="order_penjualan"
                    width="115"
                    headerText={formatString('order_penjualan')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="jumlah_stok_tersedia"
                    width="115"
                    headerText={formatString('jumlah_stok_tersedia')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="order_pembelian"
                    width="115"
                    headerText={formatString('order_pembelian')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="harga1"
                    width="115"
                    headerText={formatString('harga1')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="harga2"
                    width="115"
                    headerText={formatString('harga2')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="harga3"
                    width="115"
                    headerText={formatString('harga3')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    field="berat"
                    width="115"
                    headerText={formatString('berat')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    valueAccessor={minusValueAccessor}
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective field="satuan_std" width="90" headerText={formatString('satuan_std')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="kondisi" width="90" headerText={formatString('kondisi')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="minimal" width="80" headerText={formatString('minimal')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="status" width="80" headerText={formatString('status')} headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>

            <AggregatesDirective>
                <AggregateDirective>
                    <AggregateColumnsDirective>
                        {aggregateColumns}
                        {/* <AggregateColumnDirective field="jumlah_stok_tersedia" type="Sum" footerTemplate={footerSum} /> */}
                        <AggregateColumnDirective field="jumlah_stok_tersedia" type="Custom" customAggregate={totJumlahPabrik} footerTemplate={CustomSumJumlahpabrik} />
                    </AggregateColumnsDirective>
                </AggregateDirective>
            </AggregatesDirective>

            <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
        </GridComponent>
    );
};

export default GridStokDumy;
