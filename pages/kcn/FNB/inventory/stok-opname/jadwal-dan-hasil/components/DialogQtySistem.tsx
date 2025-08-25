import React, { useEffect, useRef, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Filter, Resize, Selection, CommandColumn } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, Inject } from '@syncfusion/ej2-react-calendars';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import moment from 'moment';

type DialogQtySistemProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  setMasterData: any;
};

const DialogQtySistem: React.FC<DialogQtySistemProps> = ({ data, isOpen, onClose, setMasterData }) => {
  const [qtySistem, setQtySistem] = useState(data?.jml_sistem);
  const [ketSistem, setKetSistem] = useState(data?.ket_sistem);

  const handleSimpan = () => {
    setMasterData({
      ...data,
      jml_sistem: qtySistem,
      ket_sistem: ketSistem,
    });

    onClose();
  };

  const buttons: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Ok',
        cssClass: 'e-primary e-small',
      },
      isFlat: false,
      click: handleSimpan,
    },
    {
      buttonModel: {
        content: 'Batal',
        cssClass: 'e-primary e-small',
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent
      id="dialogQtySistem"
      target="#dialogHasilOpname"
      header="Update kuantitas sistem"
      isModal
      allowDragging
      showCloseIcon
      width={'50%'}
      height={'40%'}
      close={onClose}
      visible={isOpen}
      buttons={buttons}
    >
      <div className="flex flex-col space-y-3 text-sm">
        <span className="font-bold">Perubahan kuantitas sistem GU</span>
        <div className="flex gap-2">
          <span className="min-w-28 text-right">Hasil Generate</span>
          <input type="text" value={data?.jml_sistem} className="rounded border border-gray-400 text-right" readOnly />
        </div>
        <div className="flex gap-2">
          <span className="min-w-28 text-right">Kuantitas</span>
          <input type="text" value={qtySistem} onChange={(e) => setQtySistem(Number(e.target.value))} className="rounded border border-gray-400 text-right" />
        </div>
        <div className="flex gap-2">
          <span className="min-w-28 text-right">Keterangan</span>
          <input type="text" value={ketSistem} onChange={(e) => setKetSistem(e.target.value)} className="rounded border border-gray-400" />
        </div>
      </div>
    </DialogComponent>
  );
};

export default DialogQtySistem;
