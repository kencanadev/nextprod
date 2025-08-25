import Swal from 'sweetalert2';

import React from 'react'

const TemplateHutang = () => {
  return (
    <div>TemplateHutang</div>
  )
}

export default TemplateHutang

export const klasifikasiSupp = [
    {
        id: 'A',
        value: 'A',
    },
    {
        id: 'B',
        value: 'B',
    },
    {
        id: 'C',
        value: 'C',
    },
    {
        id: 'D',
        value: 'D',
    },
    {
        id: 'E',
        value: 'E',
    },
    {
        id: 'Semua',
        value: 'Semua',
    },
];

//======= Setting tampilan sweet alert  =========
export const swalDialog = Swal.mixin({
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

export const swalToast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3500,
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

export const swalPopUp = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
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
