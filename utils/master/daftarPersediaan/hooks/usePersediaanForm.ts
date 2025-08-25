import { useState, useEffect } from 'react';
import { initialFormState } from '../../../../pages/kcn/ERP/master/daftarPersediaan/constants';
import { createPersediaan, fetchDetailPersediaan, saveAudit, updatePersediaan } from '../../../../pages/kcn/ERP/master/daftarPersediaan/api/api';
import { AlternatifSelectedItem, SelectedItem } from '../../../../pages/kcn/ERP/master/daftarPersediaan/components/types';
import { validateAlert } from '../../../../pages/kcn/ERP/master/daftarPersediaan/utils/sweetalert';
import { parsePrice, parsePriceNum } from '../../../../pages/kcn/ERP/master/daftarPersediaan/utils/formatCurrency';
import moment from 'moment';
import { fetchPreferensi } from '@/utils/routines';

export const usePersediaanForm = ({ entitas, token, itemId, masterState, userid, onClose }: any) => {
    const [formState, setFormState] = useState(initialFormState);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [selectedAlternatifItem, setSelectedAlternatifItem] = useState<AlternatifSelectedItem[]>([]);
    const [catatanList, setCatatanList] = useState([]);

    const resetForm = () => setFormState(initialFormState);

    const updateFormState = (key: string, value: any) => {
        setFormState((prevState) => ({ ...prevState, [key]: value }));
    };

    const handleSave = async () => {
        const data = await fetchPreferensi(entitas, '');

        if (!formState.no_item) {
            validateAlert('error', 'Nomor item harus diisi!', '#DialogBaruEditPersediaan');
            return;
        } else if (!formState.nama_item) {
            validateAlert('error', 'Nama item harus diisi!', '#DialogBaruEditPersediaan');
            return;
        } else if (!formState.grp) {
            validateAlert('error', 'Kategori harus diisi!', '#DialogBaruEditPersediaan');
            return;
        } else if (!formState.kustom10) {
            validateAlert('error', 'Kelompok harus diisi!', '#DialogBaruEditPersediaan');
            return;
        } else if (!formState.kustom4) {
            validateAlert('error', 'Merk harus diisi!', '#DialogBaruEditPersediaan');
            return;
        } else if (!formState.satuan) {
            validateAlert('error', 'Satuan harus diisi!', '#DialogBaruEditPersediaan');
            return;
        }

        const payload = {
            entitas: entitas,
            no_item: formState.no_item || null,
            kustom2: formState.kustom2 || null,
            kode_item: masterState === 'EDIT' ? formState.kode_item : null,
            nama_item: formState.nama_item || null,
            nama_cetak: formState.nama_cetak || null,
            konsinyasi: formState.konsinyasi || null,
            kode_supp: formState.kode_supp || null,
            tipe: formState.tipe || null,
            satuan: formState.satuan || null,
            satuan2: formState.satuan2 || null,
            std2: formState.std2,
            konversi2: formState.konversi2,
            satuan3: formState.satuan3 || null,
            std3: formState.std3,
            konversi3: formState.konversi3,
            harga1: Number(formState.harga1),
            harga2: formState.harga2 || null,
            harga4: Number(formState.harga4),
            diskon: formState.diskon || null,
            potongan: Number(formState.potongan),
            kode_pajak: formState.kode_pajak || null,
            grp: formState.grp || null,
            tebal: formState.tebal || null,
            panjang: formState.panjang || null,
            berat: formState.berat || null,
            minimal: Number(formState.minimal),
            maksimal: Number(formState.maksimal),
            reorder: Number(formState.reorder),
            hpp: Number(formState.hpp),
            rumus_berat: String(formState.rumus) || null,
            kode_akun_persediaan: formState.kode_akun_persediaan,
            kode_akun_jual: formState.kode_akun_jual,
            kode_akun_returjual: formState.kode_akun_returjual,
            kode_akun_diskonitem: formState.kode_akun_diskonitem,
            kode_akun_hpp: formState.kode_akun_hpp,
            kode_akun_returbeli: formState.kode_akun_returbeli,
            kode_akun_biaya: data[0].kode_akun_biaya,
            kustom1: Number(formState.kustom1),
            kustom3: formState.kustom3,
            kustom4: formState.kustom4,
            kustom5: formState.kustom5,
            kustom6: formState.kustom6,
            kustom7: formState.kustom7,
            kustom8: formState.kustom8,
            kustom9: formState.kustom9,
            kustom10: formState.kustom10,
            status: formState.status || null,
            userid: userid.toUpperCase(),
            rating: formState.rating || null,
            estimasipo: formState.estimasipo || null,
            nama_grp: formState.nama_grp,
            ppn_kontrak: formState.ppn_kontrak,
            berat_tabel: formState.berat_tabel || null,
            berat_kontrak: formState.berat_kontrak || null,
            berat_01: formState.berat1 || null,
            berat_02: formState.berat2 || null,
            status_item: formState.status_item || null,
            bonus_barang: formState.bonus_barang,
            kali_harga: formState.kali_harga === 'Berat' ? 'B' : formState.kali_harga === 'Panjang' ? 'P' : 'N',
            gambar: null,
            franco: 'N',
            catatan: catatanList,
            paket: selectedItems.map((item: any) => ({
                kode_item: masterState === 'EDIT' ? formState.kode_item : null,
                kode_itempak: item.kode_itempak,
                id_item: item.id_item,
                satuan: item.satuan,
                qty: item.qty,
            })),
            alternatif: selectedAlternatifItem.map((item: any) => ({
                kode_item: masterState === 'EDIT' ? formState.kode_item : null,
                kode_itemalt: item.kode_itemalt,
                id_item: item.id_item,
            })),
            diskonPos: formState?.bonus_barang,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        };

        const requiredFields = [
            'harga3',
            'harga5',
            'lebar',
            'liter',
            'kode_akun_biaya',
            'keterangan',
            'margin',
            'ambil1',
            'ambil2',
            'min_qty',
            'pot_qty',
            'potkg_qty',
            'bunga',
            'min_tunai',
            'min_kredit',
            'franco',
            'tempo_supp',
            'buffer_in',
            'buffer_out',
            'buffer_pab',
            'minimal_out',
            'minimal_pab',
            'bufmax_in',
            'bufmax_out',
            'bufmax_pab',
            'maksimal_out',
            'maksimal_pab',
            'min_qty2',
            'pot_qty2',
            'potkg_qty2',
            'berlaku_ms',
            'marginonly',
            'nama_cetak',
            'hari_kirim',
            'stokstd_in',
            'stokstd_pab',
            'harga_kontrak',
            'minto1',
            'mami1',
            'minto2',
            'mami2',
            'minto3',
            'mami3',
            'tgl_hms',
            'userid_hms',
        ];

        requiredFields.forEach((field) => {
            if (!payload.hasOwnProperty(field)) {
                (payload as any)[field] = null;
            }
        });

        try {
            let response;
            // payload
            /**
       * {
          "entitas": "111",
          "kode_audit": null,
          "dokumen": "IT",
          "kode_dokumen": "IT0000000080",
          "no_dokumen": "",
          "proses": "NEW", // Update
          "deskripsi": "Update Persediaan: ",
          "userid": "USER LOGIN",
          "system_user": "",
          "system_ip": "",
          "system_mac": ""
        }
      */
            let paramsObj = {
                entitas,
                kode_audit: null,
                dokumen: 'IT',
                kode_dokumen: '', // response
                no_dokumen: formState.no_item, // no_item
                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                proses: '', // Update / New
                deskripsi: '', // 'Update Persediaan: no_item + nama_item'
                userid,
                system_user: '',
                system_ip: '',
                system_mac: '',
            };

            // console.log(payload);

            if (masterState === 'EDIT') {
                response = await updatePersediaan(payload, token);
                // await saveAudit({ ...paramsObj, kode_dokumen: response, proses: 'UPDATE', deskripsi: `Update Persediaan: ${formState.no_item} ${formState.nama_item}` }, token);
                validateAlert('success', 'Data berhasil diupdate', '#main-target');
                onClose();
            } else {
                response = await createPersediaan(payload, token);
                // await saveAudit({ ...paramsObj, kode_dokumen: response, proses: 'NEW', deskripsi: `Baru Persediaan: ${formState.no_item} ${formState.nama_item}` }, token);
                // console.log(payload);
                // console.log({ ...paramsObj, kode_dokumen: 'ini kode dokumen', proses: 'NEW', deskripsi: `Baru Persediaan: ${formState.no_item} ${formState.nama_item}` });

                validateAlert('success', 'Data berhasil disimpan', '#main-target');
                onClose();
            }
        } catch (error) {
            console.error('Error:', error);
            validateAlert('error', 'Gagal menyimpan data', '#main-target');
        }
    };

    const fetchData = async () => {
        if (masterState === 'EDIT' && itemId) {
            try {
                const detailData = await fetchDetailPersediaan(entitas, token, itemId);

                const mod = detailData.catatan.map((item: any, index: number) => ({
                    ...item,
                    id: index + 1,
                }));
                setCatatanList(mod);

                setFormState({
                    ...detailData.master[0],
                    catatan: detailData.catatan[0]?.catatan,
                    tgl: detailData.catatan[0]?.tgl,
                    berat1: detailData.master[0].berat_01,
                    text_pajak: detailData.master[0].kode_pajak === 'N' ? 'N - Tanpa Pajak' : detailData.master[0].potongan,
                    potongan: detailData.master[0].potongan === null ? 0 : detailData.master[0].potongan,
                    harga1: parsePriceNum(detailData.master[0].harga1),
                    hpp: parsePriceNum(detailData.master[0].hpp),
                    harga2: parsePriceNum(detailData.master[0].harga2),
                    harga4: parsePriceNum(detailData.master[0].harga4),
                    rumus: parseFloat(detailData.master[0].rumus_berat),
                    bonus_barang: detailData.diskon,
                });
                setSelectedItems(detailData.paket);
                setSelectedAlternatifItem(detailData.alternatif);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            resetForm();
        }
    };

    useEffect(() => {
        fetchData();
    }, [masterState, itemId]);

    return {
        formState,
        selectedItems,
        selectedAlternatifItem,
        setSelectedItems,
        setSelectedAlternatifItem,
        updateFormState,
        resetForm,
        handleSave,
        setCatatanList,
        catatanList,
    };
};
