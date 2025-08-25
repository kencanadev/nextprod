import React from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';

const pageSettings = {
    pageSize: 25,
    pageCount: 5,
    pageSizes: ['25', '50', '100', 'All'],
};
export default function GridRayonList({ rowselectHandle, recordDoubleClickHandle, gridRayon }: { rowselectHandle: any; recordDoubleClickHandle: any; gridRayon: any }) {
    return (
        <GridComponent
            id="GridList"
            locale="id"
            ref={gridRayon}
            // dataSource={list_kendaraan}
            height={'60vh'}
            pageSettings={pageSettings}
            rowSelected={rowselectHandle}
            recordDoubleClick={recordDoubleClickHandle}
            allowPaging={true}
            width={'100%'}
            gridLines="Both"
            autoFit={true}
            allowResizing={true}
            allowReordering={true}
            allowSorting={true}
            rowHeight={23}
        >
            <ColumnsDirective>
                <ColumnDirective field="area" headerText="Kode" autoFit={false} headerTextAlign="Center" textAlign="Left" width="80" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="lokasi" width="280" autoFit={false} headerText="Wilayah Penjualan" headerTextAlign="Center" textAlign="Left" clipMode="EllipsisWithTooltip" />
                <ColumnDirective field="nama_sales" autoFit={false} headerText="Salesman utama" headerTextAlign="Center" textAlign="Left" width="165" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
        </GridComponent>
    );
}
