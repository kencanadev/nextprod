import React from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';

const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em', padding: 5 }}>
        {value1}
        <div>{value2}</div>
    </div>
);
const GridSJ = ({ gridSJ }: { gridSJ: any }) => {
    return (
        <GridComponent
            id="gridSJ"
            locale="id"
            // dataSource={listHistory}
            // height={'120px'}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowSorting={true}
            enableAdaptiveUI={false}
            ref={gridSJ}
            rowHeight={23}
            autoFit={true}
            enableHover={false}
            queryCellInfo={(args) => {
                if(parseInt(args.data.od) < 2) {
                    args.cell.style.color = 'green';
                } else if (parseInt(args.data.od) >= 2 && parseInt(args.data.od) <= 7) {
                    args.cell.style.color = 'red';
                } else {
                    args.cell.style.color = 'maroon';
                }
                if(parseInt(args.data.tempo) == 0) {
                    args.cell.style.backgroundColor = 'red'; //merah
                    args.cell.style.color = 'yellow';
                }
            }}
        >
            <ColumnsDirective>
                <ColumnDirective allowEditing={false} field="no_dokumen" headerText="No. Dokumen" headerTextAlign="Center" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    field="tanggal"
                    type="date"
                    format={formatDateYM}
                    headerText="Tanggal"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_kirim"
                    type="date"
                    format={formatDateYM}
                    headerText="Tgl. Kirim"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="od"
                    headerText="Overdue (Hari)"
                    headerTemplate={() => headerNewLine('Overdue', '(Hari)')}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="60"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective allowEditing={false} field="nama_relasi" headerText="Customer" headerTextAlign="Center" textAlign="Left" width="250" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="status_app" headerText="Status" headerTextAlign="Center" textAlign="Center" width="70" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    field="proses"
                    headerText=" "
                    headerTemplate={() => headerNewLine('Berkas asli SJ', 'dari Customer')}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="100"
                    clipMode="EllipsisWithTooltip"
                />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Resize]} />
        </GridComponent>
    );
};

export default GridSJ;
