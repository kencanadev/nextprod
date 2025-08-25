import Swal from 'sweetalert2';

export const validateAlert = (icon: string, text: string, target: string) => {
  return Swal.fire({
    icon: icon === 'success' ? 'success' : 'error',
    text,
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'center',
    target,
    customClass: {
      popup: 'colored-toast',
    },
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
};
