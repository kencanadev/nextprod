import Swal from 'sweetalert2';

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

const swalToast = Swal.mixin({
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

const swalPopUp = Swal.mixin({
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

// Template Pabrik
const headerTemplatePabrik = () => {
    const bgcolor = 'blue';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Pabrik</span>
        </div>
    );
};

const headerTemplatePabrikQtyFJ = () => {
    const bgcolor = 'blue';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Qty FJ</span>
        </div>
    );
};

const headerTemplatePabrikQtyKlaim = () => {
    const bgcolor = 'blue';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Qty Klaim</span>
        </div>
    );
};
const headerTemplatePabrikQtyAcc = () => {
    const bgcolor = 'blue';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Qty Acc</span>
        </div>
    );
};

// Template Harga
const headerTemplateHarga = () => {
    const bgcolor = '#b70e0e';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Harga</span>
        </div>
    );
};

const headerTemplateHargaPph = () => {
    const bgcolor = '#b70e0e';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>PPH</span>
        </div>
    );
};

const headerTemplateHargaCabang = () => {
    const bgcolor = '#b70e0e';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Cabang</span>
        </div>
    );
};
const headerTemplateHargaPusat = () => {
    const bgcolor = '#b70e0e';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Pusat</span>
        </div>
    );
};

// Template JUMLAH
const headerTemplateJumlah = () => {
    const bgcolor = '#008000';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Jumlah</span>
        </div>
    );
};

const headerTemplateJumlahPph = () => {
    const bgcolor = '#008000';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>PPH</span>
        </div>
    );
};

const headerTemplateJumlahCabang = () => {
    const bgcolor = '#008000';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Cabang</span>
        </div>
    );
};
const headerTemplateJumlahPabrik = () => {
    const bgcolor = '#008000';
    const fcolor = 'white';
    return (
        <div style={{ background: bgcolor, width: '100%', lineHeight: 2.3 }}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>Pabrik</span>
        </div>
    );
};

// const checkboxTemplateProsesDokumen = (props: any) => {
//     // Jika nilai kolom "gagal" adalah "Y", centang checkbox, jika tidak, kosongkan
//     const checkboxStyle = {
//         backgroundColor: props.kirim_pabrik === 'Y' ? '#f2f2f2' : 'transparent', // Menyesuaikan latar belakang berdasarkan nilai "gagal"
//     };
//     return <input type="checkbox" checked={props.kirim_pabrik === 'Y'} onChange={handleChangeProsesDok} style={checkboxStyle} />;
// };

const checkValueAccessorLevel1 = (field: string, data: any, column: any) => {
    return data[field] === 'Y' ? `✔️` : ''; // If the value is 0, return empty string
};

const checkValueAccessorLevel2 = (field: string, data: any, column: any) => {
    return data[field] === 'Y' ? `✔️` : ''; // If the value is 0, return empty string
};

// const handleChangeProsesDok = (event: React.ChangeEvent<HTMLInputElement>) => {
//     console.log('Checkbox diubah:', event.target.checked);
// };

const checkValueAccessorAccPabrik = (field: string, data: any, column: any) => {
    return data[field] > 0 ? data[field] : ''; // If the value is 0, return empty string
};

const checkValueAccessorBebanCabang = (field: string, data: any, column: any) => {
    return data[field] > 0 ? data[field] : ''; // If the value is 0, return empty string
};

const checkValueAccessorGlobal = (field: string, data: any, column: any) => {
    return data[field] > 0 ? data[field] : ''; // If the value is 0, return empty string
};

// Komponen Modal
const Modal = ({ isOpen, progress, isError, message }: { isOpen: boolean; progress: number; isError: boolean; message: string }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    width: '300px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    textAlign: 'center',
                }}
            >
                <h2>{isError ? 'Gagal Load Data' : 'Load Data...'}</h2>
                <ProgressBar progress={progress} isError={isError} />
                <p>{progress}%</p>
                <p>{message}</p>
            </div>
        </div>
    );
};

// Komponen ProgressBar
const ProgressBar = ({ progress, isError }: { progress: number; isError: boolean }) => {
    return (
        <div style={{ width: '100%', backgroundColor: '#f3f3f3', height: '4px', marginBottom: '10px' }}>
            <div
                style={{
                    width: `${progress}%`,
                    backgroundColor: isError ? '#ff4d4f' : '#29d', // Warna merah saat error
                    height: '100%',
                    transition: 'width 0.2s ease-in-out',
                }}
            />
        </div>
    );
};

export {
    Modal,
    checkValueAccessorGlobal,
    swalDialog,
    swalPopUp,
    swalToast,
    checkValueAccessorAccPabrik,
    checkValueAccessorBebanCabang,
    checkValueAccessorLevel1,
    checkValueAccessorLevel2,
    // checkboxTemplateProsesDokumen,
    headerTemplatePabrik,
    headerTemplatePabrikQtyFJ,
    headerTemplatePabrikQtyKlaim,
    headerTemplatePabrikQtyAcc,
    headerTemplateHarga,
    headerTemplateHargaCabang,
    headerTemplateHargaPusat,
    headerTemplateHargaPph,
    headerTemplateJumlah,
    headerTemplateJumlahPabrik,
    headerTemplateJumlahCabang,
    headerTemplateJumlahPph,
};
