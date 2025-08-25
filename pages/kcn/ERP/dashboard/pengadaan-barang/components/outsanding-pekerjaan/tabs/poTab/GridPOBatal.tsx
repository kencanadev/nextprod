import React from 'react';
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
    rowSelected,
} from '@syncfusion/ej2-react-grids';

const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy HH:ss' };
const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const appTemplate = (args: any) => {
    return <div className="text-center">{args.app === 'Y' ? '✔️' : ''}</div>;
};
const postingTemplate = (args: any) => {
    return <div className="text-center">{args.posting === 'Y' ? '✔️' : ''}</div>;
};
const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em', padding: 5 }}>
        {value1}
        <div>{value2}</div>
    </div>
);
const GridPOBatal = ({
    GridPOBatalReff,
}: {
    GridPOBatalReff: any;
}) => {
  

    return (
        <GridComponent
            id="GridPOBatal"
            locale="id"
            // dataSource={dsTab1}
            height={'100%'}
            pageSettings={{
                pageSize: 25,
                pageCount: 5,
                pageSizes: ['25', '50', '100', 'All'],
            }}
            ref={GridPOBatalReff}
            // rowSelected={selectedRowHandle}
            // recordDoubleClick={recordDoubleClick}
            // dataSource={listBPBNon}
            // allowPaging={true}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowReordering={true}
            allowSorting={true}
            rowHeight={23}
            // rowDataBound={handleRowDataBound}
            // ref={gridCashCount}
        >
            <ColumnsDirective>
                <ColumnDirective field="kodegrup" headerTemplate={() =>  headerNewLine('PO', 'Grup')} width="60" headerText="No.Dokumen" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_cabang" headerTemplate={() =>  headerNewLine('PPN Atas Nama', '(Opsional)')} width="200" headerText="Nama Customer" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="no_sp" width="120" headerText="No. SPP" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="no_item" width="80" headerText="No. Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="diskripsi" width="180" headerText="Nama Barang" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="satuan" width="80" headerText="Satuan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="qty" width="80" headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" format={'N2'} clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="qty_sisa" width="80" headerText="Oustanding" headerTextAlign="Center" textAlign="Right" format={'N2'} clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="harga_mu" width="110" headerText="Harga" headerTextAlign="Center" format={'N2'} textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="diskon" width="80" headerText="Diskon (%)" headerTextAlign="Center" format={'N2'} textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="potongan_mu" width="80" headerText="Potongan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="kena_pajak" width="100" headerText="Pajak" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="jumlah_rp" width="100" headerText="Jumlah" headerTextAlign="Center" format={'N2'} textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="total_berat" width="80" headerTemplate={() =>  headerNewLine('Berat', '(KG)')}  headerText="Berat" format={'N2'} headerTextAlign="Center" textAlign="Right" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="catatan_cabang" width="200" headerText="Keterangan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[ Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
        </GridComponent>
    );
};

export default GridPOBatal;
