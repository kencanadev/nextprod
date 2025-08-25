import withReactContent from 'sweetalert2-react-content';
import { frmNumber, GetEntitasPusat, GetEntitasUser, GetSuppMapping } from '@/utils/routines';
import { FetchDetailDok } from '../model/api';
import Swal from 'sweetalert2';
import styles from '../fpblist.module.css';

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

// const HandleRowSelected = async (args: any, setSelectedRowKodeDokumen: Function) => {
//     setSelectedRowKodeDokumen(args.data?.kode_dokumen);
// };

const ButtonDetailDok = (kode_dok: any) => {
    console.log(kode_dok);
    return kode_dok;
};

const SetDataDokumen = async (
    tipe: string,
    selectedRowKodeDok: any,
    kode_entitas: string,
    dataDetailDok: any,
    router: any,
    setSelectedItem: Function,
    setDetailDok: Function,
    token: any,
    jenistab: any
) => {
    if (selectedRowKodeDok !== '' && selectedRowKodeDok !== 'BARU') {
        if (tipe === 'ubah') {
        } else if (tipe === 'detailDok') {
            // const result = ButtonDetailDok(selectedRowKodeDok);
            setSelectedItem(selectedRowKodeDok);
            ListDetailDok(selectedRowKodeDok, jenistab, kode_entitas, setDetailDok, token);
        } else if (tipe === 'cetak') {
            // OnClick_CetakForm(selectedRowKodeDok, kode_entitas);
        }
    } else {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
            width: '100%',
            customClass: {
                popup: styles['colored-popup'], // Custom class untuk sweetalert
            },
        });
    }
};

const ListDetailDok = async (kodeDok: any, jenisTab: any, kode_entitas: any, setDetailDok: Function, token: any) => {
    try {
        const result: any[] = await FetchDetailDok(kodeDok, jenisTab, kode_entitas, token);

        const modifiedDetailDok: any = result.map((item: any) => ({
            ...item,
            harga_mu: item.harga_mu === '0.0000' ? '' : frmNumber(parseFloat(item.harga_mu)),
            potongan_mu: item.potongan_mu === '0.0000' ? '' : frmNumber(parseFloat(item.potongan_mu)),
            pajak_mu: item.pajak_mu === '0.0000' ? '' : frmNumber(parseFloat(item.pajak_mu)),
            jumlah_mu: item.jumlah_mu === '0.0000' ? '' : frmNumber(parseFloat(item.jumlah_mu)),
        }));

        await setDetailDok(modifiedDetailDok);
    } catch (error) {
        console.error('Error:', error);
    }
};

export { ListDetailDok, SetDataDokumen, swalToast };
