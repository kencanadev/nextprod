import Swal from 'sweetalert2';



// #SWAL ALERT# //
const SweetAlerts = {
    showAlertBlockingPeriodeAkuntansi: async (type: number) => {
        if (type === 13) {
            Swal.fire({
                icon: 'error',
                title: 'Tanggal Transaksi lebih kecil dari periode yang sekarang, tidak bisa dikoreksi.',
                padding: '2em',
                customClass: 'sweet-alerts',
            });
        }
    },

    showAlertStatusDokumen: async (type: number, statusDok: string) => {
        if (type === 2) {
            Swal.fire({
                icon: 'error',
                title: 'Status dukumen ' + statusDok + '. Tidak boleh dikoreksi !',
                padding: '2em',
                customClass: 'sweet-alerts',
            });
        }
    },

    // showAlertSupplier: async (type: number, setModalSupplier: Function) => {
    //     if (type === 11) {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-primary',
    //                 popup: 'sweet-alerts',
    //             },
    //             buttonsStyling: false,
    //         });
    //         swalWithBootstrapButtons
    //             .fire({
    //                 icon: 'warning',
    //                 title: 'Silahkan Pilih Supplier..',
    //                 confirmButtonText: ' OK ',
    //                 padding: '2em',
    //             })
    //             .then((result) => {
    //                 if (result.value) {
    //                     setModalSupplier(true);
    //                 }
    //             });
    //     }
    // },

    // showAlertBlockingTanggalDokumenLebihKecilDariHariIni: async (type: number, saveDoc: Function) => {
    //     if (type === 11) {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-primary',
    //                 cancelButton: 'btn btn-danger ltr:ml-3',
    //                 popup: 'sweet-alerts',
    //             },
    //             buttonsStyling: false,
    //         });
    //         swalWithBootstrapButtons
    //             .fire({
    //                 icon: 'question',
    //                 title: 'Tanggal Dokumen Lebih Kecil Dari Hari Ini, Transaksi Faktur Pembelian Dilanjutkan?',
    //                 confirmButtonText: ' Simpan ',
    //                 showCancelButton: true,
    //                 padding: '2em',
    //             })
    //             .then((result) => {
    //                 if (result.value) {
    //                     saveDoc();
    //                 }
    //             });
    //     }
    // },

    // showAlertSimpan: async (type: number, saveDoc: Function) => {
    //     if (type === 11) {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-primary',
    //                 cancelButton: 'btn btn-danger ltr:ml-3',
    //                 popup: 'sweet-alerts',
    //             },
    //             buttonsStyling: false,
    //         });
    //         swalWithBootstrapButtons
    //             .fire({
    //                 icon: 'question',
    //                 title: 'Apakah kamu yakin ingin menyimpan Data?',
    //                 confirmButtonText: ' Simpan ',
    //                 showCancelButton: true,
    //                 padding: '2em',
    //             })
    //             .then((result) => {
    //                 if (result.value) {
    //                     saveDoc();
    //                 }
    //             });
    //     }
    // },

    // showAlertSuccess: async (type: number, router: any) => {
    //     if (type === 11) {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-primary',
    //                 popup: 'sweet-alerts',
    //             },
    //             buttonsStyling: false,
    //         });
    //         swalWithBootstrapButtons
    //             .fire({
    //                 icon: 'success',
    //                 title: 'Data Berhasil Disimpan!',
    //                 confirmButtonText: ' OK ',
    //                 padding: '2em',
    //             })
    //             .then((result) => {
    //                 if (result.value) {
    //                     router.push({ pathname: './fblist' });
    //                 }
    //             });
    //     }
    // },

    // showAlertFailed: async (type: number) => {
    //     if (type === 13) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Data Gagal Disimpan!',
    //             padding: '2em',
    //             customClass: 'sweet-alerts',
    //         });
    //     }
    // },

    // showAlertWarning: async (type: number) => {
    //     if (type === 11) {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-primary',
    //                 popup: 'sweet-alerts',
    //             },
    //             buttonsStyling: false,
    //         });
    //         swalWithBootstrapButtons.fire({
    //             icon: 'warning',
    //             title: 'Silahkan Pilih Penerimaan Barang..',
    //             confirmButtonText: ' CONFIRM ',
    //             padding: '2em',
    //         });
    //     }
    // },
};

export default SweetAlerts;
