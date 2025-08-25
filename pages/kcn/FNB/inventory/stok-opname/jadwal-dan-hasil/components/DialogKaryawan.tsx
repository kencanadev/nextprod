import React, { useEffect } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Filter, Resize, Selection, CommandColumn } from '@syncfusion/ej2-react-grids';
import { getDataKaryawan } from '../api';

type DialogKaryawanProps = {
  isOpen: boolean;
  onClose: () => void;
  kode_entitas: string;
  token: string;
  setTeamPl: any;
};

const DialogKaryawan: React.FC<DialogKaryawanProps> = ({ isOpen, onClose, kode_entitas, token, setTeamPl }) => {
  const [listKaryawan, setListKaryawan] = React.useState([]);
  const [selectedKry, setSelectedKry] = React.useState<any>({});
  const fetchKaryawanData = async () => {
    const params = {
      param1: 'all',
      param2: '100',
      param3: 'all',
      param4: 'all',
    };
    const response = await getDataKaryawan({ params, token });
    setListKaryawan(response);
  };

  const handleSimpanKry = () => {
    setTeamPl((prevState: any) => {
      const kry = {
        name: selectedKry['Full_Name'],
      };

      const safePrevState = Array.isArray(prevState) ? prevState : [];
      return [...safePrevState, kry];
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      fetchKaryawanData();
    }
  }, [isOpen]);

  return (
    <DialogComponent id="dialogKaryawan" target="#dialogHasilOpname" header="Daftar Karyawan" isModal allowDragging showCloseIcon visible={isOpen} close={onClose} width="40%" height="60%">
      <div className="p-2">
        <GridComponent locale="id" autoFit recordDoubleClick={handleSimpanKry} rowSelected={(args: any) => setSelectedKry(args.data)} dataSource={listKaryawan} gridLines="Both" height={300}>
          <ColumnsDirective>
            <ColumnDirective field="emp_id" headerText="NIP" headerTextAlign="Center" width={100} />
            <ColumnDirective field="Full_Name" headerText="Nama Karyawan" headerTextAlign="Center" width={150} />
            <ColumnDirective field="pos_name_en" headerText="Jabatan" headerTextAlign="Center" width={100} />
            {/* <ColumnDirective headerText="Divisi" headerTextAlign="Center" width={80} /> */}
          </ColumnsDirective>
        </GridComponent>
      </div>
    </DialogComponent>
  );
};

export default DialogKaryawan;
