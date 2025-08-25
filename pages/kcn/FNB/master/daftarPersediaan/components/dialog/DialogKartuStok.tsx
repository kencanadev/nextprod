import React, { useEffect, useState } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import { cetakKartuPersediaan } from '../../utils/cetakKartu';
import { fetchDetailPersediaan } from '../../api/api';
import { formatDate } from '../../utils/formatDate';
import { validateAlert } from '../../utils/sweetalert';
import moment from 'moment';
import { FirstDayInPeriod } from '@/utils/routines';
import { CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

interface dialogAkunProps {
  isOpen: boolean;
  onClose: any;
  entitas: any;
  token: any;
  itemId: string;
}

const DialogKartuStok = ({ isOpen, onClose, entitas, itemId, token }: dialogAkunProps) => {
  const [data, setData] = useState<any>([]);
  const [tglAwal, setTglAwal] = useState(moment());
  const [tglAkhir, setTglAkhir] = useState(moment());
  const [checkbox, setCheclkbox] = useState(false);

  const getPeriod = async () => {
    const period = await FirstDayInPeriod(entitas);
    const awalPeriod = moment(period);
    const akhirPeriod = moment(period).add(1, 'month').subtract(1, 'day');
    setTglAwal(awalPeriod);
    setTglAkhir(akhirPeriod);
  };

  const fetchData = async () => {
    const detailData = await fetchDetailPersediaan(entitas, token, itemId);
    setData(detailData);
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      getPeriod();
    }
  }, [isOpen]);

  const paramObj = {
    kode_entitas: entitas,
    tgl_awal: moment(tglAwal).format('YYYY-MM-DD'),
    tgl_akhir: moment(tglAkhir).format('DD-MM-YYYY'),
    checkbox_barang: checkbox ? 'Y' : 'N',
    kode_gudang: '',
    kode_item: itemId,
    token: token,
  };

  let buttonsInputData: ButtonPropsModel[] = [
    {
      buttonModel: {
        content: 'Simpan',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: () => {
        if (!tglAwal || !tglAkhir) {
          validateAlert('error', 'Data periode harus diisi!', '#dialogKartuStok');
          return;
        }
        cetakKartuPersediaan(paramObj);
      },
    },
    {
      buttonModel: {
        content: 'Tutup',
        cssClass: 'e-danger e-small',
      },
      isFlat: false,
      click: onClose,
    },
  ];

  return (
    <DialogComponent
      id="dialogKartuStok"
      name="dialogKartuStok"
      target={'#main-target'}
      header={() => 'Kartu Persediaan'}
      visible={isOpen}
      animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
      width="350px"
      height="50%"
      position={{ X: 'center', Y: 'center' }}
      style={{ position: 'fixed' }}
      buttons={buttonsInputData}
      allowDragging
      closeOnEscape
      open={(args: any) => {
        args.preventFocus = true;
      }}
      isModal
      zIndex={999}
    >
      <p className="w-full bg-blue-800 py-1 text-center text-white">Periode Tanggal</p>
      <div className="my-3 flex items-center justify-between gap-2">
        <div className="w-fit rounded-sm border border-gray-300 px-2 py-1">
          <DatePickerComponent
            placeholder="Select a date"
            value={tglAwal.toDate()}
            change={(args: ChangeEventArgsCalendar) => {
              setTglAwal(moment(args.value));
            }}
            format="dd-MM-yyyy"
            enableMask={true}
            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
            showClearButton={false}
          >
            <Inject services={[MaskedDateTime]} />
          </DatePickerComponent>
        </div>
        <span>s/d</span>
        <div className="w-fit rounded-sm border border-gray-300 px-2 py-1">
          <DatePickerComponent
            placeholder="Select a date"
            value={tglAkhir.toDate()}
            change={(args: ChangeEventArgsCalendar) => {
              setTglAkhir(moment(args.value));
            }}
            format="dd-MM-yyyy"
            enableMask={true}
            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
            showClearButton={false}
          >
            <Inject services={[MaskedDateTime]} />
          </DatePickerComponent>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-2 text-black">
        <div className="flex flex-col gap-1">
          <span>No. Barang :</span>
          <span>{data.master?.[0]?.no_item}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>Nama Barang :</span>
          <span>{data.master?.[0]?.nama_item}</span>
        </div>
      </div>

      <div className="ml-1 mt-8 flex">
        <CheckBoxComponent
          label="Nama Barang = Cetak SJ/Faktur"
          checked={checkbox}
          change={(args: ChangeEventArgsButton) => {
            const value: any = args.checked;
            setCheclkbox(value);
          }}
          style={{ borderRadius: 3, borderColor: 'gray' }}
        />
      </div>
    </DialogComponent>
  );
};

export default DialogKartuStok;
