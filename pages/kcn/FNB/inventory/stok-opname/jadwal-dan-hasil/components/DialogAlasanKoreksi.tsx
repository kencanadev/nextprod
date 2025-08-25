import React, { useEffect, useRef, useState } from 'react';
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Filter, Resize, Selection, CommandColumn } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, Inject } from '@syncfusion/ej2-react-calendars';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import moment from 'moment';
import { cekGenBesi, fetchDetailOpname, getListGenerateData } from '../api';
import { TemplateCheckboxGenerate, TemplateCheckboxSimpan } from '../template';

type DialogAlasanKoreksiProps = {
  isOpen: boolean;
  onClose: () => void;
  kode_opname: string;
  kode_entitas: string;
  token: string;
};

const DialogAlasanKoreksi: React.FC<DialogAlasanKoreksiProps> = ({ isOpen, onClose, kode_opname, kode_entitas, token }) => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const getDetailData = async () => {
      try {
        const params = {
          entitas: kode_entitas,
          param1: kode_opname,
          param2: 'MD',
        };

        const response = await fetchDetailOpname({ params, token });
        const { master } = response;

        setData(master);
      } catch (error) {
        console.log(error);
      }
    };

    getDetailData();
  }, []);

  return (
    <DialogComponent id="dialogAlasanKoreksi" target="#main-target" header="Alasan Koreksi" isModal allowDragging showCloseIcon width="30%" height="85%" close={onClose} visible={isOpen}>
      <div className="p-2 text-black">
        <textarea className="h-full w-full rounded border border-black p-2" rows={25} readOnly value={data.alasan_koreksi}></textarea>
      </div>
    </DialogComponent>
  );
};

export default DialogAlasanKoreksi;
