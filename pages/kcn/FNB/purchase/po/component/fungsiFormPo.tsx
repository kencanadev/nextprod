import swal from 'sweetalert2';
import { frmNumber } from '@/utils/routines';
import { useRouter } from 'next/router';

import React from 'react';

const fungsiFormPo = () => {
    return <div>fungsiFormPo</div>;
};

export default fungsiFormPo;

export const HandleSelectedData = (
    dataObject: any,
    tipe: string,
    setSuppSelected: Function,
    setterminSelected: Function,
    setSuppSelectedKode: Function,
    setSelectedKodeTermin: Function,
    setKodePajak: Function,
    setNilaiPajak: Function,
    setSelectedKodeRelasi: Function,
    setModal6: Function,
    setModal5: Function,
    setSelectedOptionPajak: Function
) => {
    const { selectedData, selectedNamaTermin, selectedKodeSupp, selectedKodeTermin, selectedKodePajak, selectedNilaiPajak, selectedKodeRelasi } = dataObject;
    setSuppSelected(selectedData);
    setterminSelected(selectedNamaTermin);
    setSuppSelectedKode(selectedKodeSupp);
    setSelectedKodeTermin(selectedKodeTermin);
    setKodePajak(selectedKodePajak);
    setNilaiPajak(selectedNilaiPajak);
    setSelectedKodeRelasi(selectedKodeRelasi);
    if (tipe === 'row') {
        setModal6(true);
    } else if (tipe === 'daftarPP') {
        setModal5(true);
    }

    if (selectedKodePajak !== 'N') {
        setSelectedOptionPajak('I');
    } else {
        setSelectedOptionPajak('N');
    }
};

export const HandleSelectedTermin = (selectedData: any, selectedNamaTermin: any, setSelectedKodeTermin: Function, setterminSelected: Function) => {
    setSelectedKodeTermin(selectedData);
    setterminSelected(selectedNamaTermin);
};

export const HandleSelectedPoGrup = (selectedData: any, setSelectedKodePoGrup: Function) => {
    setSelectedKodePoGrup(selectedData);
};

export const HandleSelectedPpnAtasNama = (selectedData: any, nama_cabang: any, setSelectedKodePpnAtasNama: Function, setSelectedNamaCabangPpnAtasNama: Function) => {
    setSelectedKodePpnAtasNama(selectedData);
    setSelectedNamaCabangPpnAtasNama(nama_cabang);
};

export const HandlePpnAtasNama = async (selectedData: any, nama_cabang: any, setSelectedKodePpnAtasNama: Function, setDataDetail: Function, rowid: any) => {
    // setSelectedKodePpnAtasNama(selectedData);
    let detailupdate = await setDataDetail((state: any) => ({
        ...state,
        nodes: state.nodes.map((node: any) => {
            if (node.id === rowid) {
                return {
                    ...node,
                    ppn_atas_nama: nama_cabang,
                    kodecabang: selectedData,
                };
            } else {
                return node;
            }
        }),
    }));
};

export const HandlePoGrup = async (selectedData: any, setSelectedKodePoGrup: Function, setDataDetail: Function, rowid: any) => {
    // setSelectedKodePoGrup(selectedData);
    let detailupdate = await setDataDetail((state: any) => ({
        ...state,
        nodes: state.nodes.map((node: any) => {
            if (node.id === rowid) {
                return {
                    ...node,
                    po_grup: selectedData,
                };
            } else {
                return node;
            }
        }),
    }));
};

// Fungsi Untuk Mencari Harga Item pada Modal Grid Barang Jadi
export const HandleHargaItemBarangJadi = async (
    dataObject: any,
    setDataDetail: Function,
    setTotalJumlahVariabel: Function,
    setTotalJumlahSetelahPajakVariabel: Function,
    setTotalJumlahSetelahPajakFilter: Function,
    setTotalJumlahSetelahPajakKirim: Function,
    selectedOptionPajak: string,
    setValueNilaiDpp: Function,
    setValueNilaiDppFilter: Function,
    setValueStringPajak: Function,
    valueNilaiDpp: number
) => {
    const { id, harga_mu } = dataObject;
    let totalJumlah, valueDpp, totalCalNilaiDpp;
    await setDataDetail((state: any) => {
        const newNodes = state.nodes.map((node: any) => {
            console.log('tetetete' + node.id, id);
            if (node.id === id) {
                return {
                    ...node,
                    // id: node.id,
                    harga: frmNumber(harga_mu),
                    jumlah: frmNumber(harga_mu * node.kuantitas),
                };
            } else {
                return node;
            }
        });

        totalJumlah = newNodes.reduce((acc: number, node: any) => {
            return acc + parseFloat(node.jumlah.replace(/[^0-9.-]+/g, ''));
        }, 0);

        setTotalJumlahVariabel(totalJumlah);
        setTotalJumlahSetelahPajakVariabel(totalJumlah);
        setTotalJumlahSetelahPajakFilter(totalJumlah);
        setTotalJumlahSetelahPajakKirim(totalJumlah);
        if (selectedOptionPajak === 'N') {
            setValueNilaiDpp(0);
            setValueNilaiDppFilter(0);
        } else if (selectedOptionPajak === 'E') {
            setValueNilaiDpp(totalJumlah);
            setValueNilaiDppFilter(totalJumlah);
        } else if (selectedOptionPajak === 'I') {
            console.log(valueNilaiDpp);
            if (isNaN(valueNilaiDpp)) {
                valueDpp = 0;
            } else {
                valueDpp = valueNilaiDpp;
            }
            totalCalNilaiDpp = valueDpp + totalJumlah;
            setValueStringPajak('Sudah termasuk pajak.');
            setValueNilaiDpp(totalCalNilaiDpp);
            setValueNilaiDppFilter(totalCalNilaiDpp);
        }

        return {
            nodes: newNodes,
        };
    });
};

export const HandleDaftarPpFilter = (suppSelected: string, setModal5: Function, setModSuppDaftarPp: Function, vRefreshData: any) => {
    console.log('vRefreshData = ', vRefreshData);

    vRefreshData.current += 1;
    if (suppSelected === '') {
        swal.fire({
            title: 'Supplier belum diisi',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Ok',
            customClass: {
                popup: 'custom-popup-class',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                await setModSuppDaftarPp(true);
            }
        });
    } else {
        setModal5(true);
    }
};

export const HandleModalItem = async (
    tipe: string,
    id: any,
    setRowId: Function,
    setModalPoGrup: Function,
    setModalPpnAtasNama: Function,
    setModSuppRow: Function,
    suppSelected: string,
    setModal6: Function,
    vRefreshData: any
) => {
    setRowId(id);
    vRefreshData.current += 1;
    // Pengkondisian ini dapat dilakukan setelah development selesai
    if (tipe === 'po_grup') {
        setModalPoGrup(true);
    } else if (tipe === 'ppn_atas_nama') {
        setModalPpnAtasNama(true);
    } else {
        if (suppSelected === '') {
            swal.fire({
                title: 'Supplier belum diisi',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Ok',
                customClass: {
                    popup: 'custom-popup-class',
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await setModSuppRow(true);
                    // if (suppSelected !== '') {
                    //     await setModal6(true);
                    // }
                }
            });
        } else if (tipe === 'no_spp' || tipe === 'no_barang' || tipe === 'nama_barang') {
            setModal6(true);
        }
    }
};

export const HandleRemoveAllRows = (
    dataDetail: any,
    setDisabledIconNoSpp: Function,
    setDisabledIconNoBarang: Function,
    setDisabledIconNamaBarang: Function,
    setTotalBeratVariabel: Function,
    setTotalJumlahVariabel: Function,
    setTotalJumlahSetelahPajakVariabel: Function,
    setTotalJumlahSetelahPajakFilter: Function,
    setValueNilaiDpp: Function,
    setValueNilaiDppFilter: Function,
    setTotalNilaiPajakVariabel: Function,
    setDataDetail: Function,
    handleSubmit: Function,
    setButtonDisabled: Function
) => {
    if (dataDetail.nodes.length > 0) {
        const hasEmptyFields = dataDetail.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');

        if (!hasEmptyFields) {
            setDisabledIconNoSpp(false);
            setDisabledIconNoBarang(false);
            setDisabledIconNamaBarang(false);
            setTotalBeratVariabel(0);
            setTotalJumlahVariabel(0);
            setTotalJumlahSetelahPajakVariabel(0);
            setTotalJumlahSetelahPajakFilter(0);
            setValueNilaiDpp(0);
            setValueNilaiDppFilter(0);
            setTotalNilaiPajakVariabel(0);
            setDataDetail((state: any) => ({
                ...state,
                nodes: [],
            }));
            handleSubmit();
            setButtonDisabled(false);
        } else {
            // Jika ada field yang kosong, Anda dapat menangani kasus ini di sini
        }
    } else {
        alert('Tidak ada baris yang tersedia untuk dihapus.');
    }
};

export const HandleEstBiayaKirim = (
    event: any,
    dataDetail: any,
    totalJumlahSetelahPajakKirim: number,
    setTotalJumlahSetelahPajakVariabel: Function,
    setNilaiBiayaKirim: Function,
    totalJumlahSetelahPajakFilter: any,
    nilaiDiskonHeader: any
) => {
    let jumlahSetelahPajak = 0,
        nilai;

    if (dataDetail.nodes.length > 0) {
        const hasEmptyFields = dataDetail.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');
        if (hasEmptyFields === true) {
            const estBiayaKirim = document.getElementById('estimasiBiayaKirim') as HTMLInputElement;
            if (estBiayaKirim) {
                estBiayaKirim.value = '';
            }
            swal.fire({
                title: 'Isi terlebih dahulu data detail ...',
                icon: 'error',
            });
            return;
        }
        nilai = event === '' || event === '0' ? 0 : event;
        // jumlahSetelahPajak = parseFloat(nilai) + (isNaN(totalJumlahSetelahPajakKirim) ? 0 : totalJumlahSetelahPajakKirim);
        jumlahSetelahPajak = parseFloat(nilai) + (isNaN(totalJumlahSetelahPajakFilter) ? 0 : totalJumlahSetelahPajakFilter) - parseFloat(nilaiDiskonHeader);

        console.log(
            'totalJumlahSetelahPajakKirim = ' + totalJumlahSetelahPajakKirim + ' totalJumlahSetelahPajakFilter = ' + totalJumlahSetelahPajakFilter + ' nilaiDiskonHeader = ' + nilaiDiskonHeader
        );
        setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
        setNilaiBiayaKirim(event);
    }
};

export const HandleModalHargaItem = (id: any, kode_item: any, setFilterHargaId: Function, setFilterHargaKodeItem: Function, setModalHarga: Function) => {
    console.log(id, kode_item);
    setFilterHargaId(id);
    setFilterHargaKodeItem(kode_item);
    setModalHarga(true);
};

export const HandleModaliconChange = (
    tipe: string,
    setHandleNamaSupp: Function,
    setModal1: Function,
    setHandleNamaTermin: Function,
    setModal2: Function,
    setHandleKodeGrup: Function,
    setModal3: Function,
    setHandlePpnAtasNama: Function,
    setModal4: Function,
    vRefreshData: any
) => {
    if (tipe === 'supplier') {
        vRefreshData.current += 1;
        setHandleNamaSupp('');
        setModal1(true);
    } else if (tipe === 'termin') {
        setHandleNamaTermin('');
        setModal2(true);
    } else if (tipe === 'poGrup') {
        setHandleKodeGrup('');
        setModal3(true);
    } else if (tipe === 'ppnAtasNama') {
        setHandlePpnAtasNama('');
        setModal4(true);
    }
};

export const HandleModalChange = (
    event: any,
    tipe: string,
    setChangeNumber: Function,
    setHandleNamaSupp: Function,
    setModal1: Function,
    setHandleNamaTermin: Function,
    setModal2: Function,
    setHandleKodeGrup: Function,
    setModal3: Function,
    setHandlePpnAtasNama: Function,
    setModal4: Function
) => {
    setChangeNumber((prevTotal: number) => prevTotal + 1);
    if (tipe === 'supplier') {
        setHandleNamaSupp(event);
        setModal1(true);
    } else if (tipe === 'termin') {
        setHandleNamaTermin(event);
        setModal2(true);
    } else if (tipe === 'poGrup') {
        setHandleKodeGrup(event);
        setModal3(true);
    } else if (tipe === 'ppnAtasNama') {
        setHandlePpnAtasNama(event);
        setModal4(true);
    }
};

// export const HandleBatal = () => {
//     const router = useRouter();
//     router.push({ pathname: './polist' });
// };

export const HandleKurs = (event: any, tipe: string, setKurs: Function, setKursPajak: Function) => {
    if (tipe === 'kurs') {
        setKurs(event);
    } else {
        setKursPajak(event);
    }
};

export const HandleAlamatPengiriman = (event: any, setAlamatPengiriman: Function) => {
    setAlamatPengiriman(event);
};

export const HandleCatatan = (event: any, setCatatan: Function) => {
    setCatatan(event);
};

export const HandleKirimLangusng = (event: any, setKirimLangsung: Function) => {
    console.log(event);
    if (event === true) {
        setKirimLangsung('Y');
    }
};

export const HandleKirimIdRemove = (idRow: any, setIdRowRemove: Function) => {
    setIdRowRemove(idRow);
};

export const HandleRemoveRows = (dataDetail: any, idRowRemove: number, setDataDetail: Function, handleSubmit: Function, setButtonDisabled: Function) => {
    if (dataDetail.nodes.length > 0) {
        const hasEmptyFields = dataDetail.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');
        if (hasEmptyFields === true && dataDetail.nodes.length === 1) {
            swal.fire({
                html: "<span style='color: gray; font-weight: bold;'>Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.</span>",
                icon: 'error',
            });
        } else if (idRowRemove > 0) {
            swal.fire({
                title: `Hapus Data Barang Rows Id ${idRowRemove} ?`,
                showCancelButton: true,
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    setDataDetail((state: any) => ({
                        ...state,
                        nodes: state.nodes.filter((node: any) => node.id !== idRowRemove),
                    }));
                    if (dataDetail.nodes.length <= 1) {
                        handleSubmit();
                    }
                    setButtonDisabled(false);
                }
            });
        } else {
            swal.fire({
                title: `Hapus Semua Data Barang ?`,
                showCancelButton: true,
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    setDataDetail((state: any) => ({
                        ...state,
                        nodes: [],
                    }));
                    handleSubmit();
                    setButtonDisabled(false);
                }
            });
        }
    }
};
