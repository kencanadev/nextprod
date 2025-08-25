import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { frmNumber } from '@/utils/routines';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { faCamera, faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';


import React from 'react'

const TemplateBuktiTTP = () => {
  return (
    <div>TemplateBuktiTTP</div>
  )
}

export default TemplateBuktiTTP

// judul Grid Header Bukti Ttp Spesimen
export const headerBuktiTtpSalesman = () => {
  const bgcolor = 'tranparent';
  const fcolor = '#5d676e';
  return (
    <TooltipComponent content="Bukti TTP Salesman" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
        <span style={{ width: '100px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Bukti TTP
          <br />
          Salesman
        </span>
      </div>
    </TooltipComponent>
  );
};
// End

// judul Grid Header Spesimen Ttd Customer
export const headerSpesimenTtdCustomer = () => {
  const bgcolor = 'tranparent';
  const fcolor = '#5d676e';
  return (
    <TooltipComponent content="Spesimen TTD Customer" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
        <span style={{ width: '100px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Spesimen
          <br />
          TTD Customer
        </span>
      </div>
    </TooltipComponent>
  );
};
// End

// judul Grid Header Spesimen Ttd Customer
export const headerSpesimenTtdStaf = () => {
  const bgcolor = 'tranparent';
  const fcolor = '#5d676e';
  return (
    <TooltipComponent content="Spesimen TTD Customer" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
        <span style={{ width: '100px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Bukti TTP
          <br />
          Staff Keuangan
        </span>
      </div>
    </TooltipComponent>
  );
};
// End

// judul Grid Header Spesimen Sesuai
export const headerSpesimenSesuai = () => {
  const bgcolor = 'tranparent';
  const fcolor = '#5d676e';
  return (
    <TooltipComponent content="Spesimen Sesuai" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
        <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Spesimen
          <br />
          Sesuai
        </span>
      </div>
    </TooltipComponent>
  );
};
// End

export const headerNominalPembayaran = () => {
  const bgcolor = 'tranparent';
  const fcolor = '#5d676e';
  return (
    <TooltipComponent content="Nominal Total Pembayaran" opensOn="Hover" openDelay={1000} position="BottomCenter">
      <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3, padding: '10px 0px' }}>
        <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
          Nominal
          <br />
          Total Pembayaran
        </span>
      </div>
    </TooltipComponent>
  );
};
// End
