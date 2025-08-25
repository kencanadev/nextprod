import React from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnsDirective, ColumnDirective, Selection, Inject } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Grid } from '@syncfusion/ej2-react-grids';
import { swalToast } from '../interface/template';

interface DialogHargaEkspedisiProps {
    dialogDaftarHargaEkspedisiVisible: boolean;
    stateDataHeader: any;
    setStateDataHeader: Function;
    setStateDataArray: Function;
    stateDataArray: any;
    setDataBarang: Function;
    setStateDataFooter: Function;
    stateDataFooter: any;
}

const DialogHargaEkspedisi: React.FC<DialogHargaEkspedisiProps> = ({
    dialogDaftarHargaEkspedisiVisible,
    stateDataHeader,
    setStateDataHeader,
    setStateDataArray,
    stateDataArray,
    setDataBarang,
    setStateDataFooter,
    stateDataFooter,
}) => {
    let buttonHargaEkspedisi: ButtonPropsModel[];
    let currentDaftarBarang: any[] = [];
    let gridDaftarHargaEks: Grid | any;
    //console.log('dataHargaEkspedisi = ', stateDataArray?.dataHargaEkspedisi);
    buttonHargaEkspedisi = [
        {
            buttonModel: {
                content: 'Pilih',
                //iconCss: 'e-icons e-save',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                currentDaftarBarang = gridDaftarHargaEks.getSelectedRecords();
                if (currentDaftarBarang.length > 0) {
                    handleClickDaftarHargaEks(currentDaftarBarang);
                } else {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px">Silahkan pilih data barang</p>',
                        width: '100%',
                        target: '#dialogDaftarSj',
                    });
                }
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                //iconCss: 'e-icons e-close',
                cssClass: 'e-primary e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: () => {
                handleBatal();
            },
        },
    ];

    const handleBatal = async () => {
        await setStateDataHeader((prevState: any) => ({
            ...prevState,
            dialogDaftarHargaEkspedisiVisible: false,
        }));
    };

    const handleClickDaftarHargaEks = async (data: any) => {
        console.log('sdassdasdasd clik= ', data);
        await setDataBarang((state: any) => {
            // Membuat objek baru dengan data baru
            const newItem = {
                harga_eks: data[0].harga,
                tambahan_jarak: data[0].harga_tambahan,
            };

            // Menemukan indeks item yang perlu diupdate
            const index = state.nodes.findIndex((item: any) => item.id === stateDataHeader?.indexId);
            const newNodes = state.nodes.map((node: any) => {
                if (node.id === stateDataHeader?.indexId) {
                    return {
                        ...node,
                        tambahan_jarak: data[0].harga_tambahan,
                    };
                } else {
                    return node;
                }
            });

            let totNettoRp: any;
            let beratTotal: any;
            let beratKlaim: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);
            beratKlaim = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat_ekspedisi);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            // Jika item ditemukan, update item tersebut, jika tidak, tambahkan item baru
            const updatedNodes =
                index !== -1
                    ? state.nodes.map((item: any, idx: number) => (idx === index ? { ...item, ...newItem, total_rp: parseFloat(newItem.harga_eks) * parseFloat(item.total_berat) } : item))
                    : [...state.nodes, newItem];

            totNettoRp = updatedNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    // return acc + parseFloat(node.netto_rp);
                    return acc + parseFloat(node.total_rp);
                }
                return acc;
            }, 0);
            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);
            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter.potonganEkspedisiLain) : 0;

            setStateDataHeader((prevState: any) => ({
                ...prevState,
                dialogDaftarHargaEkspedisiVisible: false,
            }));
            setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                // totalTagihan: total_tagihan,
                totalTagihan: total_tagihan > 0 ? total_tagihan : 0,
                // totalBayar: total_bayar,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                beratKlaim: beratKlaim,
                tambahanJarak: tambahanJarak,
            }));

            // Menambahkan item baru ke dalam array nodes
            return {
                nodes: updatedNodes,
            };
        });
    };

    const handleClickDaftarHargaEkspedisi = async (args: any) => {
        console.log('sdassdasdasd = ', args);
        await setDataBarang((state: any) => {
            // Membuat objek baru dengan data baru
            const newItem = {
                harga_eks: args.harga,
                tambahan_jarak: args.harga_tambahan,
            };

            // Menemukan indeks item yang perlu diupdate
            const index = state.nodes.findIndex((item: any) => item.id === stateDataHeader?.indexId);
            const newNodes = state.nodes.map((node: any) => {
                if (node.id === stateDataHeader?.indexId) {
                    return {
                        ...node,
                        tambahan_jarak: args.harga_tambahan,
                    };
                } else {
                    return node;
                }
            });

            let totNettoRp: any;
            let beratTotal: any;
            let beratKlaim: any;
            let tambahanJarak: any;
            let totalKlaimEkspedisi: any;

            beratTotal = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat);
                }
                return acc;
            }, 0);
            beratKlaim = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_berat_ekspedisi);
                }
                return acc;
            }, 0);

            tambahanJarak = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.tambahan_jarak);
                }
                return acc;
            }, 0);

            // Jika item ditemukan, update item tersebut, jika tidak, tambahkan item baru
            const updatedNodes =
                index !== -1
                    ? state.nodes.map((item: any, idx: number) => (idx === index ? { ...item, ...newItem, total_rp: parseFloat(newItem.harga_eks) * parseFloat(item.total_berat) } : item))
                    : [...state.nodes, newItem];

            totNettoRp = updatedNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    // return acc + parseFloat(node.netto_rp);
                    return acc + parseFloat(node.total_rp);
                }
                return acc;
            }, 0);
            totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
                if (node.idChecked > 0) {
                    return acc + parseFloat(node.total_klaim_ekspedisi);
                }
                return acc;
            }, 0);
            const total_tagihan = totNettoRp + tambahanJarak + parseFloat(stateDataFooter.biayaLainLain);
            const total_bayar = stateDataHeader?.nominalInvoice > 0 ? (total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan) : 0;
            const nilai_pph23 = total_bayar > 0 ? (total_bayar * stateDataHeader?.nilaiPph23) / 100 : 0;
            const potongan_ekspedisi = stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(stateDataFooter.potonganEkspedisiLain) : 0;

            setStateDataHeader((prevState: any) => ({
                ...prevState,
                dialogDaftarHargaEkspedisiVisible: false,
            }));
            setStateDataFooter((prevState: any) => ({
                ...prevState,
                subTotal: totNettoRp,
                // totalTagihan: total_tagihan,
                totalTagihan: total_tagihan > 0 ? total_tagihan : 0,
                // totalBayar: total_bayar,
                totalBayar: total_tagihan > stateDataHeader?.nominalInvoice ? stateDataHeader?.nominalInvoice : total_tagihan,
                totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
                potonganEkspedisiLain: potongan_ekspedisi,
                nilaiPph23: nilai_pph23,
                totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
                beratTotal: beratTotal,
                beratKlaim: beratKlaim,
                tambahanJarak: tambahanJarak,
            }));

            // Menambahkan item baru ke dalam array nodes
            return {
                nodes: updatedNodes,
            };
        });
    };

    return (
        <DialogComponent
            // ref={(d) => (dialogDaftarSj = d)}
            id="dialogHargaEkspedisi"
            target="#dialogFormRpe"
            style={{ position: 'fixed' }}
            header={`Daftar Harga Ekspedisi - ${stateDataHeader?.namaEkspedisi}`}
            visible={dialogDaftarHargaEkspedisiVisible}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            allowDragging={true}
            showCloseIcon={true}
            width="84%"
            height="65%"
            buttons={buttonHargaEkspedisi}
            position={{ X: 'center', Y: 'center' }}
            close={() => {
                handleBatal();
            }}
            closeOnEscape={true}
            // open={(args: any) => {
            //     setTimeout(function () {
            //     }, 100);
            // }}
        >
            <GridComponent
                id="gridHargaEkspedisi"
                locale="id"
                //style={{ width: '100%', height: '100%' }}
                // ref={(g) => (gridDaftarSj = g)}
                ref={(g: any) => (gridDaftarHargaEks = g)}
                dataSource={stateDataArray?.dataHargaEkspedisi}
                selectionSettings={{ mode: 'Row', type: 'Single' }}
                rowHeight={22}
                width={'100%'}
                height={'355'}
                gridLines={'Both'}
                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                recordDoubleClick={(args: any) => {
                    console.log('args = ', args);
                    if (args) {
                        handleClickDaftarHargaEkspedisi(args.rowData);
                    }
                }}
            >
                <ColumnsDirective>
                    <ColumnDirective field="nama_jarak" headerText="Nama Jarak" headerTextAlign="Center" textAlign="Left" width="280" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="jenis_mobil" headerText="Jenis Mobil" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="jenis_kirim" headerText="Jenis Kirim" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="harga" headerText="Harga" headerTextAlign="Center" textAlign="Right" format="N2" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="harga_tambahan" headerText="Harga Tambahan" headerTextAlign="Center" textAlign="Right" format="N2" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="max_tonase" headerText="Max Tonase[Kg]" headerTextAlign="Center" textAlign="Right" format="N2" width="100" clipMode="EllipsisWithTooltip" />
                    <ColumnDirective field="min_tonase" headerText="Min Tonase[Kg]" headerTextAlign="Center" textAlign="Right" format="N2" width="100" clipMode="EllipsisWithTooltip" />
                </ColumnsDirective>
                <Inject services={[Selection]} />
            </GridComponent>
        </DialogComponent>
    );
};

export default DialogHargaEkspedisi;
