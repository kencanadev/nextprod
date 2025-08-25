import React from 'react';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';

const formatDateYM: Object = { type: 'date', format: 'dd-MM-yyyy' };
const headerNewLine = (value1: any, value2: any) => (
    <div style={{ textAlign: 'center', lineHeight: '1.5em' }}>
        {value1}
        <div>{value2}</div>
    </div>
);
const GridAR = ({ gridAR }: { gridAR: any }) => {
    return (
        <GridComponent
            id="gridAR"
            locale="id"
            // dataSource={listHistory}
            height={'200px'}
            width={'100%'}
            gridLines="Both"
            allowResizing={true}
            allowSorting={true}
            enableAdaptiveUI={false}
            ref={gridAR}
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
                <ColumnDirective allowEditing={false} field="nama_cust" headerText="Nama Cust" headerTextAlign="Center" textAlign="Left" width="215" clipMode="EllipsisWithTooltip" />
                <ColumnDirective allowEditing={false} field="no_fj" headerText="No. Faktur" headerTextAlign="Center" textAlign="Left" width="115" clipMode="EllipsisWithTooltip" />
                <ColumnDirective
                    allowEditing={false}
                    field="tgl_fj"
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
                    field="jatuh_tempo"
                    type="date"
                    format={formatDateYM}
                    headerText="Jatuh Tempo"
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="80"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective
                    allowEditing={false}
                    field="umur"
                    headerText="Overdue (Hari)"
                    headerTemplate={() => headerNewLine('Umur', '(Hari)')}
                    headerTextAlign="Center"
                    textAlign="Center"
                    width="60"
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
                <ColumnDirective
                    allowEditing={false}
                    field="sisa_piutang"
                    format={'N2'}
                    headerText="sisa_piutang"
                    headerTemplate={() => headerNewLine('Sisa', 'Piutang')}
                    headerTextAlign="Center"
                    textAlign="Right"
                    width="120"
                    clipMode="EllipsisWithTooltip"
                />
                <ColumnDirective allowEditing={false} field="nama_sales" headerText="Salesman" headerTextAlign="Center" textAlign="Left" width="70" clipMode="EllipsisWithTooltip" />
            </ColumnsDirective>
            <Inject services={[Page, Selection, Edit, Resize]} />
        </GridComponent>
    );
};

export default GridAR;
