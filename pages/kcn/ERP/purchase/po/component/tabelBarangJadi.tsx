import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getServerSideProps } from '@/pages/api/getServerSide';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DlgHargaItemTerakhir } from '../model/api';

interface TableBarangJadiDlgProps {
    userid: any;
    kode_entitas: any;
    dataApi: any;
    handleUpdate: any;
    handleModalItem: any;
    handleModalHargaItem: any;
    handleModalItemChange: any;
    valueDataPajakbyRow: any;
    disabledIconNoSpp: any;
    disabledIconNoBarang: any;
    disabledIconNamaBarang: any;
    onHandleKirimId: any;
    dataReadOnly: boolean;
    // Recalc: any;
}

const TableBarangJadi = ({
    dataApi,
    handleUpdate,
    kode_entitas,
    userid,
    handleModalItem,
    handleModalHargaItem,
    handleModalItemChange,
    valueDataPajakbyRow,
    disabledIconNoSpp,
    disabledIconNoBarang,
    disabledIconNamaBarang,
    onHandleKirimId,
    dataReadOnly,
}: TableBarangJadiDlgProps) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [apiResponseSelectNilaiPajak, setApiResponseSelectNilaiPajak] = useState({
        status: false,
        message: '',
        data: [],
    });

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            const response = await axios.get(`${apiUrl}/erp/nilai_pajak`, {
                params: {
                    entitas: kode_entitas,
                },
            });

            const responseListNilaiPajak = response.data;
            setApiResponseSelectNilaiPajak(responseListNilaiPajak);
        };
        fetchDataUseEffect();
    }, []);

    const selectNilaiPajak = apiResponseSelectNilaiPajak.data.map((item: any) => ({
        kode_pajak: item.kode_pajak,
        nilai: item.nilai,
        catatan: item.catatan,
    }));

    const themeJadi = useTheme({
        Header: `
        .th {
          border-bottom: 1px solid #a0a8ae;
          position:sticky;
        }
      `,
        Row: `
      &:nth-of-type(odd) {
        background-color: #f9fafb;
      }
      &:nth-of-type(even) {
        background-color: white;
      }
      &:not(:last-of-type) .td {
        border-bottom: 1px solid #a0a8ae;
      }
    `,
        BaseCell: `
        &:not(:last-of-type) {
          border-right: 1px solid #a0a8ae;
        }
      `,
        Table: `
    --data-table-library_grid-template-columns: 4% 13% 8% 6% 14% 3% 4% 4% 7% 5% 5% 6% 7% 5% minmax(230px, 1fr);
    position:sticky;
    `,
    });
    //--data-table-library_grid-template-columns: 6% 14% 8% 6% 16% 4% 4% 7% 6% 6% 7% 8% 6% minmax(300px, 1fr);

    const handleKirimId = (id: any) => {
        onHandleKirimId(id);
    };

    return (
        <Table data={dataApi} theme={themeJadi} layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}>
            {(tableList: any[]) => (
                <>
                    <Header>
                        <HeaderRow style={{ userSelect: 'none' }}>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    PO GRUP
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    PPN Atas Nama (Optional)
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    No. PP
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    No. Barang
                                </div>
                            </HeaderCell>

                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Nama Barang
                                </div>
                            </HeaderCell>

                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Satuan
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Kuantitas
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Outstanding
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Harga
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Diskon (%)
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Potongan
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Pajak
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Jumlah
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Berat (Kg)
                                </div>
                            </HeaderCell>
                            <HeaderCell
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'rgb(94, 98, 98)',
                                    color: 'white',
                                }}
                            >
                                <div className="flex" style={{ fontSize: 12 }}>
                                    Keterangan
                                </div>
                            </HeaderCell>
                        </HeaderRow>
                    </Header>

                    <Body>
                        {tableList.map((item: any) => (
                            <Row key={item.id} item={item}>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.po_grup}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'po_grup', item.id, '')}
                                            onKeyDown={(event) => {
                                                if (event.keyCode === 46) {
                                                    // Tombol delete ditekan
                                                    handleModalItemChange('', 'po_group', item.id, 'delete');
                                                } else {
                                                }
                                            }}
                                            disabled={dataReadOnly}
                                            // onChange={(event) => handleUpdate(event.target.value, item.id, 'po_grup')}
                                            onFocus={(event) => event.target.select()}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    // setModelPoGrup(true);
                                                    handleModalItem('po_grup', item.id);
                                                }}
                                                disabled={dataReadOnly === true ? true : false}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            // value={selectedNamaCabangPpnAtasNama}
                                            value={item.ppn_atas_nama}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'ppn_atas_nama', item.id)}
                                            onKeyDown={(event) => {
                                                if (event.keyCode === 46) {
                                                    // Tombol delete ditekan
                                                    handleModalItemChange('', 'ppn_atas_nama', item.id, 'delete');
                                                } else {
                                                }
                                            }}
                                            // onChange={(event) => handleUpdate(event.target.value, item.id, 'ppn_atas_nama')}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    // setModelPpnAtasNama(true);
                                                    handleModalItem('ppn_atas_nama', item.id);
                                                }}
                                                disabled={dataReadOnly === true ? true : false}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell onClick={() => handleKirimId(item.id)}>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.no_spp}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'no_spp', item.id)}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalItem('no_spp', item.id);
                                                }}
                                                disabled={dataReadOnly === true ? true : disabledIconNoSpp}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.no_barang}
                                            // onChange={(event) => handleUpdate(event.target.value, item.id, 'no_barang')}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'no_barang', item.id)}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalItem('no_barang', item.id);
                                                }}
                                                disabled={dataReadOnly === true ? true : disabledIconNoBarang}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.nama_barang}
                                            onChange={(event) => handleModalItemChange(event.target.value, 'nama_barang', item.id)}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalItem('nama_barang', item.id);
                                                }}
                                                disabled={dataReadOnly === true ? true : disabledIconNamaBarang}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>

                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: '#dedede',
                                            }}
                                            disabled
                                            value={item.satuan}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'satuan')}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            id={`kuantitas${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                                textAlign: 'right',
                                            }}
                                            defaultValue={item.kuantitas}
                                            onBlur={(event) => handleUpdate(event.target.value, item.id, 'kuantitas')}
                                            onFocus={(event) => event.target.select()}
                                            onKeyDown={(event) => {
                                                const char = event.key;
                                                const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                if (!isValidChar) {
                                                    event.preventDefault();
                                                }
                                                const inputValue = (event.target as HTMLInputElement).value;
                                                if (char === '.' && inputValue.includes('.')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            disabled={dataReadOnly}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                                textAlign: 'right',
                                            }}
                                            disabled
                                            value={item.qty_sisa}
                                            //   onChange={(event) => handleUpdate(event.target.value, item.id, 'satuan')}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            id={`harga${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                                textAlign: 'right',
                                            }}
                                            defaultValue={item.harga}
                                            onBlur={(event) => handleUpdate(event.target.value, item.id, 'harga')}
                                            onFocus={(event) => event.target.select()}
                                            onKeyDown={(event) => {
                                                const char = event.key;
                                                const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                if (!isValidChar) {
                                                    event.preventDefault();
                                                }
                                                const inputValue = (event.target as HTMLInputElement).value;
                                                if (char === '.' && inputValue.includes('.')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            disabled={dataReadOnly}
                                        />
                                        <div>
                                            <button
                                                onClick={() => {
                                                    handleModalHargaItem(item.id, item.kode_item);
                                                }}
                                                disabled={dataReadOnly === true ? true : false}
                                                // disabled={disabledIconNamaBarang}
                                            >
                                                <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" />
                                            </button>
                                        </div>
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            id={`diskon${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.diskon}
                                            onBlur={(event) => handleUpdate(event.target.value, item.id, 'diskon')}
                                            onFocus={(event) => event.target.select()}
                                            onKeyDown={(event) => {
                                                const char = event.key;
                                                const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                if (!isValidChar) {
                                                    event.preventDefault();
                                                }
                                                const inputValue = (event.target as HTMLInputElement).value;
                                                if (char === '.' && inputValue.includes('.')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            disabled={dataReadOnly}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            id={`potongan${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                                textAlign: 'right',
                                            }}
                                            defaultValue={item.potongan}
                                            onBlur={(event) => handleUpdate(event.target.value, item.id, 'potongan')}
                                            onFocus={(event) => event.target.select()}
                                            onKeyDown={(event) => {
                                                const char = event.key;
                                                const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                if (!isValidChar) {
                                                    event.preventDefault();
                                                }
                                                const inputValue = (event.target as HTMLInputElement).value;
                                                if (char === '.' && inputValue.includes('.')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            disabled={dataReadOnly}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        {/* <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.pajak}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'pajak')}
                                        /> */}
                                        <select
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            value={item.pajak}
                                            // defaultValue={valueDataPajakbyRow}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'pajak')}
                                            disabled={dataReadOnly}
                                        >
                                            {selectNilaiPajak.map((option: any, index: number) => (
                                                <option disabled key={index} value={option.nilai}>
                                                    {option.kode_pajak} - {option.catatan}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: '#dedede',
                                                textAlign: 'right',
                                            }}
                                            disabled
                                            value={item.jumlah}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'jumlah')}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: '#dedede',
                                                textAlign: 'right',
                                            }}
                                            disabled
                                            value={item.berat}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'berat')}
                                        />
                                    </div>
                                </Cell>
                                <Cell>
                                    <div className="flex">
                                        <input
                                            id={`keterangan${item.id}`}
                                            type="text"
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: 'transparent',
                                            }}
                                            defaultValue={item.keterangan}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'keterangan')}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
                                        />
                                    </div>
                                </Cell>
                            </Row>
                        ))}
                    </Body>
                </>
            )}
        </Table>
    );
};

export { getServerSideProps };
export default TableBarangJadi;
function setDataDetail(arg0: (state: any) => any) {
    throw new Error('Function not implemented.');
}
