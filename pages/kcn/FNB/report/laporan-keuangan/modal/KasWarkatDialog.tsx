import React, { useState } from 'react';

import { ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';

interface KasWarkatDialogProps {
  tipe: number;
  title: string;
  isOpen: boolean;
  kode_entitas: string;
  token: string;
  onClose: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const divisiData = [
  { kode: 'AC', nama: 'Antar Cabang' },
  { kode: 'BS', nama: 'Besi' },
  { kode: 'KA', nama: 'Kantor' },
  { kode: 'NB', nama: 'Non Besi' },
];

const KasWarkatDialog: React.FC<KasWarkatDialogProps> = ({ tipe, title, isOpen, kode_entitas, token, onClose }) => {
  const [date, setDate] = useState(moment());
  const [isWarkatBaru, setIsWarkatBaru] = useState(false);

  // Button
  const buttonsBaseDialog: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Ok',
        cssClass: 'e-primary e-small',
      },
      isFlat: false,
      click: () => {},
    },
    {
      buttonModel: {
        content: 'Batal',
        cssClass: 'e-primary e-small',
      },
      isFlat: false,
      click: () => {
        onClose();
      },
    },
  ];
  return (
    <DialogComponent
      id="baseDialog"
      isModal
      width="600px"
      height="300px"
      position={{ X: 'center', Y: 'center' }}
      visible={isOpen}
      close={() => {
        onClose();
      }}
      header={title}
      showCloseIcon
      target={'#main-target'}
      closeOnEscape
      allowDragging
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      buttons={buttonsBaseDialog}
    >
      <div className="px-3 py-1">
        {/* Periode Tgl. */}
        <div className="flex items-center gap-2">
          <label>Tanggal</label>
          <div className="flex items-center gap-2">
            <div className="form-input mt-1 flex justify-between">
              <DatePickerComponent
                locale="id"
                style={{ fontSize: '12px' }}
                cssClass="e-custom-style"
                enableMask={true}
                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                showClearButton={false}
                format="dd-MM-yyyy"
                value={date.toDate()}
                change={(args: ChangeEventArgsCalendar) => {
                  setDate(moment(args.value));
                }}
              >
                <Inject services={[MaskedDateTime]} />
              </DatePickerComponent>
            </div>
          </div>
        </div>

        {/* Akun Kas */}
        <div className="mt-2 flex flex-col gap-1">
          <label>Akun Kas</label>
          <select className="rounded border border-black/50 p-2" name="" id="">
            <option className="bg-gray-400 text-white" value="" disabled selected>
              Pilih Akun Kas
            </option>
            {divisiData.map((item) => (
              <option key={item.kode} value={item.kode}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox  */}
        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="checkbox" name="checkbox" checked={isWarkatBaru} onChange={(e) => setIsWarkatBaru(e.target.checked)} />
          <label htmlFor="checkbox" className="m-0">
            Tampilkan Warkat Baru
          </label>
        </div>
      </div>
    </DialogComponent>
  );
};

export default KasWarkatDialog;
