import React, { useState } from 'react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { FaInfo } from 'react-icons/fa';
import RadioInputGroup from '../RadioInputGroup';
import { AccordionComponent, AccordionItemDirective, AccordionItemsDirective } from '@syncfusion/ej2-react-navigations';

const TabelRumus = ({ rumus, setRumus }: any) => (
  <div>
    <table className="mt-3 text-xs">
      <thead>
        <tr>
          <th className="text-xs">Nama Berat</th>
          <th className="text-xs">Rumus Kontrak</th>
          <th className="text-xs">Rumus Toleransi 0.1</th>
          <th className="text-xs">Rumus Toleransi 0.2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-xs">Berat Non Besi (Toleransi 0.1)</td>
          <td className="text-xs">-</td>
          <td className="text-xs">Tidak melalui perhitungan rumus, langsung berat toleransi baku dari pabrik</td>
          <td className="text-xs">-</td>
        </tr>
        <tr>
          <td className="text-xs">Berat Kontrak Besi Beton dan Besi Tarikan</td>
          <td className="text-xs">D x D x 0.006165 x P</td>
          <td className="text-xs">(D-0.1) x (D-0.1) x 0.006165 x P</td>
          <td className="text-xs">(D-0.2) x (D-0.2) x 0.006165 x P</td>
        </tr>
        <tr>
          <td className="text-xs">Berat Wiremesh</td>
          <td className="text-xs">D x D x 0.006165 x 156.6</td>
          <td className="text-xs">(D-0.1) x (D-0.1) x 0.006165 x 156.6</td>
          <td className="text-xs">(D-0.2) x (D-0.2) x 0.006165 x 156.6</td>
        </tr>
        <tr>
          <td className="text-xs">Berat Kawat</td>
          <td className="text-xs">Massa</td>
          <td className="text-xs">Massa - (0.1 x 5)</td>
          <td className="text-xs">Massa - (0.2 x 5)</td>
        </tr>
        <tr>
          <td className="text-xs">Berat Paku</td>
          <td className="text-xs">Massa</td>
          <td className="text-xs">Massa - (0.1 x 3)</td>
          <td className="text-xs">Massa - (0.2 x 3)</td>
        </tr>
      </tbody>
    </table>

    {/* Options Pilih Rumus */}
    <div className="mt-3">
      <label htmlFor="rumus" className="block text-xs font-medium text-gray-900 dark:text-white">
        Rumus
      </label>
      <div className="w-full rounded border border-gray-300 px-2">
        <ComboBoxComponent
          cssClass="e-custom-style"
          name="rumus"
          dataSource={[
            {
              id: 1,
              text: 'Rumus 1',
              value: 'rumus-1',
            },
            {
              id: 2,
              text: 'Rumus 2',
              value: 'rumus-2',
            },
            {
              id: 3,
              text: 'Rumus 3',
              value: 'rumus-3',
            },
            {
              id: 4,
              text: 'Rumus 4',
              value: 'rumus-4',
            },
            {
              id: 5,
              text: 'Rumus 5',
              value: 'rumus-5',
            },
          ]}
          fields={{ text: 'text', value: 'value' }}
          placeholder="Pilih Rumus"
          value={rumus}
          onChange={(e: any) => setRumus(e.value)}
        />
      </div>
    </div>
  </div>
);

const PerhitunganRumusPersediaan = ({ formState, updateState }: { formState: any; updateState: any }) => {
  const [rumus, setRumus] = useState('rumus-1');
  const item = formState?.grp ? formState?.grp : '-';

  return (
    <div className="p-2 text-xs">
      <div>
        <span className="mb-3 mt-1">Dimensi / Sket Barang</span>
        <div className="mt-3 grid grid-cols-3 gap-7">
          <div className="flex items-center gap-x-0">
            <label htmlFor="grup-barang" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Diameter (Mm)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 px-2">
                <TextBoxComponent name="grup-barang" placeholder="Diameter (Mm)" floatLabelType="Never" value={formState?.tebal} onChange={(e: any) => updateState('tebal', e.target.value)} />
              </div>
              <TooltipComponent content="Dipakai untuk besi & besi tarikan & wiremesh" target="#diameter">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="diameter" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="grup-barang" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Massa (Kg)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 px-2">
                <TextBoxComponent name="grup-barang" placeholder="Massa (Kg)" floatLabelType="Never" value={formState?.berat} onChange={(e: any) => updateState('berat', e.target.value)} />
              </div>
              <TooltipComponent content="Dipakai untuk paku & kawat beton" target="#massa">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="massa" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="grup-barang" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Panjang (M)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 px-2">
                <TextBoxComponent name="grup-barang" placeholder="Panjang (M)" floatLabelType="Never" value={formState?.panjang} onChange={(e: any) => updateState('panjang', e.target.value)} />
              </div>
              <TooltipComponent content="Dipakai untuk besi & besi tarikan" target="#panjang">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="panjang" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
        </div>
        {/* Separator */}
        <div className="my-3 flex items-center gap-5">
          <hr className="h-[1.5px] w-full border-t-0 bg-neutral-400" />
        </div>
        {/* End Separator */}
        <AccordionComponent expandMode="Single">
          <AccordionItemsDirective>
            <AccordionItemDirective expanded={false} header={`Rumus Perhitungan Berat : ${item}`} content={() => <TabelRumus rumus={rumus} setRumus={setRumus} />} />
          </AccordionItemsDirective>
        </AccordionComponent>

        {/* Inputs Berat */}
        <div className="mt-3 grid grid-cols-4 gap-x-6">
          <div className="flex items-center gap-x-0">
            <label htmlFor="berat" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Berat Tabel (Kg)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 px-2">
                <TextBoxComponent name="berat" placeholder="Berat Tabel (Kg)" floatLabelType="Never" value={formState?.berat_tabel} onChange={(e: any) => updateState('berat_tabel', e.target.value)} />
              </div>
              <TooltipComponent content="Dipakai untuk besi beton" target="#berat">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="berat" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <label htmlFor="berat-kontrak" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Berat Kontrak (Kg)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 bg-[#DCDCDC] px-2">
                <TextBoxComponent
                  name="berat-kontrak"
                  placeholder="Berat Kontrak (Kg)"
                  floatLabelType="Never"
                  value={formState?.berat_kontrak}
                  onChange={(e: any) => updateState('berat_kontrak', e.target.value)}
                  style={{
                    cursor: 'not-allowed',
                  }}
                  disabled
                />
              </div>
              <TooltipComponent content="Dipakai untuk besi beton" target="#berat-kontrak">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="berat-kontrak" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="berat-toleransi-1" className={`dark:text-white'}  block text-xs font-medium text-gray-900`}>
              Berat Standar / Toleransi 0.1 (Kg)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className={`${rumus === 'rumus-1' ? '' : 'bg-[#DCDCDC]'} w-full rounded border border-gray-300 px-2`}>
                <TextBoxComponent
                  name="berat-toleransi-1"
                  placeholder="Berat Standar / Toleransi 0.1 (Kg)"
                  floatLabelType="Never"
                  value={formState?.berat1}
                  onChange={(e: any) => updateState('berat1', e.target.value)}
                  style={{
                    cursor: rumus === 'rumus-1' ? 'text' : 'not-allowed',
                  }}
                  disabled={rumus !== 'rumus-1'}
                />
              </div>
              <TooltipComponent content="Dipakai untuk semua kategori" target="#berat-toleransi1">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="berat-toleransi1" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex items-center gap-x-0">
            <label htmlFor="berat-toleransi-2" className="block  text-xs font-medium text-gray-900 dark:text-white">
              Berat Toleransi 0.2 (Kg)
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="w-full rounded border border-gray-300 bg-[#DCDCDC] px-2">
                <TextBoxComponent
                  name="berat-toleransi-2"
                  placeholder="Berat Toleransi 0.2 (Kg)"
                  floatLabelType="Never"
                  value={formState?.berat2}
                  onChange={(e: any) => updateState('berat2', e.target.value)}
                  style={{
                    cursor: 'not-allowed',
                  }}
                  disabled
                />
              </div>
              <TooltipComponent content="Dipakai untuk besi beton, besi tarikan, wiremesh, paku & kawat" target="#berat-toleransi-2">
                <div className="flex items-center justify-center rounded-full bg-slate-800 p-1 text-white">
                  <FaInfo id="berat-toleransi-2" size={12} />
                </div>
              </TooltipComponent>
            </div>
          </div>
        </div>
        {/* Separator */}
        <div className="my-3 flex items-center gap-5">
          <hr className="h-[1.5px] w-full border-t-0 bg-neutral-400" />
        </div>
        {/* End Separator */}
        <div>
          <span>Pengkali Harga Kontrak</span>
          <RadioInputGroup
            name="multiplier-contract"
            options={[
              {
                label: 'Berat',
                value: 'Berat',
              },
              {
                label: 'Panjang',
                value: 'Panjang',
              },
              {
                label: 'Harga Langsung',
                value: 'Harga Langsung',
              },
            ]}
            checkedValue={formState?.kali_harga}
            onChange={(value) => updateState('kali_harga', value)}
          />
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              name="barang-kontrak-ppn"
              checked={formState?.ppn_kontrak === 'Y'}
              onChange={(e) => {
                const newValue = e.target.checked ? 'Y' : 'N';
                updateState('ppn_kontrak', newValue);
              }}
            />
            <span>Barang Kontrak PPN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerhitunganRumusPersediaan;
