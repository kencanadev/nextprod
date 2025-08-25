// // Handle untuk Grid Data List

const noFB = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>No FB</span>
        </div>
    );
};

const tanggalFB = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Tanggal</span>
        </div>
    );
};

const noPB = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>No. PB</span>
        </div>
    );
};

const namaSupplier = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Nama Supplier</span>
        </div>
    );
};

const nilaiFaktur = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Nilai Faktur</span>
        </div>
    );
};

const termin = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Termin</span>
        </div>
    );
};

const lunas = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Lunas</span>
        </div>
    );
};

const status = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>Status</span>
        </div>
    );
};

const noVoucher = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>No. Voucher</span>
        </div>
    );
};

const noInvoice = (tipe: any) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 14, textAlign: 'center' }}>No. Invoice</span>
        </div>
    );
};

const pageSettings = { pageSize: 25 };
const sortSettings = { columns: [{ field: 'OrderID', direction: 'Ascending' }] };
// END

export { noFB, tanggalFB, noPB, namaSupplier, nilaiFaktur, termin, lunas, status, noVoucher, noInvoice, pageSettings };
