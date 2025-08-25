import React, { useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Sort, Filter, Toolbar, Edit } from '@syncfusion/ej2-react-grids';
import DialogAturanPersediaan from './components/dialog/DialogAturanPersediaan';

export interface AdditionalButtonProps {
  id: string;
  text: string;
  onClick: () => void;
  color?: string;
}

const AdditionalButton = ({ id, text, onClick, color }: AdditionalButtonProps) => (
  <ButtonComponent
    id={id}
    cssClass="e-primary e-small"
    style={{
      width: 'auto',
      marginBottom: '0.5em',
      marginTop: '0.5em',
      marginRight: '0.8em',
      backgroundColor: '#e6e6e6',
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5em',
    }}
    onClick={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-arrow-badge-right">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 6l-.112 .006a1 1 0 0 0 -.669 1.619l3.501 4.375l-3.5 4.375a1 1 0 0 0 .78 1.625h6a1 1 0 0 0 .78 -.375l4 -5a1 1 0 0 0 0 -1.25l-4 -5a1 1 0 0 0 -.78 -.375h-6z" />
    </svg>
    {text}
  </ButtonComponent>
);

const statusPersediaan = () => {
  const [showDialogAturan, setShowDialogAturan] = useState(false);

  return (
    <div className="Main h-[90vh] w-full" id="main-target">
      <div className="mb-5 flex items-center gap-7">
        <div className="flex items-center gap-1">
          <button className="rounded bg-black px-2 py-1 text-sm text-white hover:bg-gray-700" onClick={() => setShowDialogAturan(true)}>
            Tambah
          </button>
          <button className="rounded bg-black px-2 py-1 text-sm text-white hover:bg-gray-700" onClick={() => setShowDialogAturan(true)}>
            Ubah
          </button>
          <button className="rounded bg-black px-2 py-1 text-sm text-white hover:bg-gray-700">Hapus</button>
          <button className="rounded bg-black px-2 py-1 text-sm text-white hover:bg-gray-700">Refresh</button>
        </div>
        <div className="flex items-center gap-1">
          <AdditionalButton id="btnApproval" text="Approval" color="green" onClick={() => {}} />
          <AdditionalButton id="btnApproval" text="Jalankan Aturan" color="red" onClick={() => {}} />
          <AdditionalButton id="btnApproval" text="Jalankan Semua Aturan" color="green" onClick={() => {}} />
        </div>
      </div>
      {/* Grid Component */}
      <GridComponent
        dataSource={[]}
        allowPaging={true}
        pageSettings={{ pageSize: 10 }}
        toolbar={['Edit', 'Update', 'Cancel']}
        editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' }}
      >
        <ColumnsDirective>
          <ColumnDirective field="no_item" headerText="Nama Aturan" headerTextAlign="Center" textAlign="Center" width="100" allowEditing={false} />
          <ColumnDirective field="nama_item" headerText="Status" headerTextAlign="Center" textAlign="Center" width="200" allowEditing={false} />
          <ColumnDirective field="satuan" headerText="Non Aktif" headerTextAlign="Center" textAlign="Center" width="150" allowEditing={false} />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Edit, Toolbar]} />
      </GridComponent>
      {/* Dialog Aturan Status */}
      {showDialogAturan && <DialogAturanPersediaan isOpen={showDialogAturan} onClose={() => setShowDialogAturan(false)} />}
    </div>
  );
};

export default statusPersediaan;
