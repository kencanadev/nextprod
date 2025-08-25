import React from 'react';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

const CatatanPersediaan = ({ formState, updateState }: { formState: any; updateState: any }) => {
  return (
    <div className="p-2">
      <div className="mb-3 flex flex-col gap-2">
        <label className="mr-1 text-xs" style={{ marginBottom: -2 }}>
          Tgl Berlaku
        </label>
        <div className="w-fit rounded-sm border border-gray-300 px-2">
          <DatePickerComponent placeholder="Select a date" value={formState?.tgl} onChange={(e: any) => updateState('tgl', e.value)} format="dd-MM-yyyy" width={300} />
        </div>
      </div>
      <textarea
        id="simple-textarea"
        className="h-full w-full resize-none rounded-sm border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-slate-600 focus:ring-slate-600"
        placeholder="Tuliskan Catatan"
        rows={9}
        value={formState?.catatan}
        onChange={(e: any) => updateState('catatan', e.target.value)}
      ></textarea>
    </div>
  );
};

export default CatatanPersediaan;
