import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { Inject, Page } from '@syncfusion/ej2-react-grids';
import '@syncfusion/ej2-react-grids/styles/material.css';

interface SupplierRekening {
  kode_supp: string;
  nama_bank: string;
  no_rekening: string;
  nama_rekening: string;
  pkp: string;
  aktif: string;
  tgl_update: string;
  userid: string;
}

interface GridDetailRekeningProps {
  data: SupplierRekening[];
}

const GridDetailRekening: React.FC<GridDetailRekeningProps> = ({ data }) => {
  return (
    <div className="p-4">
      <GridComponent dataSource={data} allowPaging={true} pageSettings={{ pageSize: 5 }}>
        <ColumnsDirective>
          <ColumnDirective field="nama_bank" headerText="Nama Bank" width="150" textAlign="Left" />
          <ColumnDirective field="no_rekening" headerText="No Rekening" width="150" textAlign="Left" />
          <ColumnDirective field="nama_rekening" headerText="Nama Rekening" width="200" textAlign="Left" />
          <ColumnDirective field="pkp" headerText="PKP" width="100" textAlign="Center" />
          <ColumnDirective field="aktif" headerText="Aktif" width="100" textAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page]} />
      </GridComponent>
    </div>
  );
};

export default GridDetailRekening;
