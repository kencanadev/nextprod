import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';

const bgcolor = 'tranparent';
const fcolor = '#5d676e';

import React from 'react'

const index = () => {
  return (
    <div>index</div>
  )
}

export default index

export const headerUmurStok = () => {
  return (
    <TooltipComponent content="Umur Stok" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3, padding: '10px 0px' }}>
        <span style={{ width: '100px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Umur Stok Setelah
          <br />
          Sampai Dari Pabrik (hari)
        </span>
      </div>
    </TooltipComponent>
  );
};

export const headerRataHari = () => {
  return (
    <TooltipComponent content="Rata-rata hari" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3, padding: '10px 0px' }}>
        <span style={{ width: '100px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Rata-rata hari
          <br />
          dari perhitungan
        </span>
      </div>
    </TooltipComponent>
  );
};
