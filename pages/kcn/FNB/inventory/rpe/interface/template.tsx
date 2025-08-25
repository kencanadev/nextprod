import Swal from 'sweetalert2';
import { frmNumber, tanpaKoma } from '@/utils/routines';
import { getValue } from '@syncfusion/ej2-base';
import React from 'react'

const template = () => {
  return (
    <div>template</div>
  )
}

export default template

const swalToast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3000,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});

const swalDialog = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-primary btn-sm',
        cancelButton: 'btn btn-dark btn-sm ltr:mr-3 rtl:ml-3',
        popup: 'sweet-alerts',
    },
    buttonsStyling: false,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});

const TemplateNettoMu = (args: any) => {
    return frmNumber(args.netto_mu);
};
const TemplateTotalBerat = (args: any) => {
    return frmNumber(args.total_berat);
};
const TemplateTotalKlaimEkspedisi = (args: any) => {
    return frmNumber(args.total_klaim_ekspedisi);
};
const TemplateBayarMu = (args: any) => {
    return frmNumber(args.total_klaim);
};

const SumBayarMu = (args: any) => {
    const kredit = args.result.reduce((total: number, item: any) => {
        return total + parseFloat(tanpaKoma(item.total_klaim) === '' ? '0' : tanpaKoma(item.total_klaim));
    }, 0);
    return frmNumber(kredit);
};
const CustomBayarMu = (props: any) => {
    return <span style={{ fontWeight: 'bold' }}>{props.Custom}</span>;
};

//============== Format baris pada grid List Data  =============
const RowDataBoundListData = (args: any) => {
    if (args.row) {
        if (getValue('status', args.data) == 'Tertutup') {
            args.row.style.background = '#f5f4f4';
        } else if (getValue('status', args.data) == 'Proses') {
            args.row.style.background = '#fbffc8';
        } else {
            args.row.style.background = '#ffffff';
        }
    }
};

//============== Format cell pada grid List Data ===============
const QueryCellInfoListData = (args: any) => {
    if (args.column?.field === 'status') {
        if (getValue('status', args.data) == 'Tertutup') {
            args.cell.style.color = 'red';
        } else if (getValue('status', args.data) == 'Proses') {
            args.cell.style.color = 'maroon';
        }
    }
    if (args.column?.field === 'status_app') {
        if (getValue('status_app', args.data) == 'Disetujui') {
            args.cell.style.color = 'green';
        } else if (getValue('status_app', args.data) == 'Koreksi') {
            args.cell.style.color = 'maroon';
        } else if (getValue('status_app', args.data) == 'Ditolak') {
            args.cell.style.color = 'red';
        } else {
            args.cell.style.color = 'blue';
        }
    }
};

const nilaiStyles: React.CSSProperties = {
    marginLeft: '10px',
    marginRight: '17px',
};
const divNilaiStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'right',
    fontWeight: 'bold',
};

const lableStyle: React.CSSProperties = {
    textAlign: 'right',
    fontWeight: 'bold',
};

export {
    swalDialog,
    lableStyle,
    divNilaiStyle,
    nilaiStyles,
    QueryCellInfoListData,
    RowDataBoundListData,
    CustomBayarMu,
    SumBayarMu,
    swalToast,
    TemplateBayarMu,
    TemplateTotalKlaimEkspedisi,
    TemplateTotalBerat,
    TemplateNettoMu,
};
