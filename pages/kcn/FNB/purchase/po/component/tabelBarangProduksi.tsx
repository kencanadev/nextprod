import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getServerSideProps } from '@/pages/api/getServerSide';
import { FaMinusCircle, FaPlay, FaPlusCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import PoGrup from '../modal/poGrup';
import PpnAtasNama from '../modal/ppnAtasNama';
import axios from 'axios';
import { formatCurrency, formatBerat, frmNumber } from '@/utils/routines';

interface TableBarangProduksiDlgProps {
    userid: any;
    kode_entitas: any;
    dataApi: any;
    handleUpdate: any;
    handleModalItem: any;
    handleModalItemChange: any;
    valueDataPajakbyRow: any;
    disabledIconNoSpp: any;
    disabledIconNoBarang: any;
    disabledIconNamaBarang: any;
    onHandleKirimId: any;
    dataReadOnly: boolean;
    // Recalc: any;
}

const TableBarangProduksi = ({
    dataApi,
    handleUpdate,
    kode_entitas,
    userid,
    handleModalItem,
    handleModalItemChange,
    valueDataPajakbyRow,
    disabledIconNoSpp,
    disabledIconNoBarang,
    disabledIconNamaBarang,
    onHandleKirimId,
    dataReadOnly,
}: TableBarangProduksiDlgProps) => {
    const [modalPoGrup, setModelPoGrup] = useState(false);
    const [modalPpnAtasNama, setModelPpnAtasNama] = useState(false);
    const [modalNoSpp, setModelNoSpp] = useState(false);
    const [selectedKodePoGrup, setSelectedKodePoGrup] = useState<any>('');
    const [selectedKodePpnAtasNama, setSelectedKodePpnAtasNama] = useState<any>('');
    const [selectedNamaCabangPpnAtasNama, setSelectedNamaCabangPpnAtasNama] = useState<any>('');
    const [BarangbrtSelected, setBarangbrtSelected] = useState();
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

    const themeProduksi = useTheme({
        Header: `
        .th {
          border-bottom: 1px solid #a0a8ae;
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
    --data-table-library_grid-template-columns: 4% 13% 8% 6% 14% 6% 6% 6% 6% 6% 6% 6% 4% 4% 5% 5% 5% 6% 8% 5% minmax(250px, 1fr);
    position:sticky;
    `,
    });
    //--data-table-library_grid-template-columns: 6% 14% 8% 6% 18% 6% 7% 7% 7% 7% 7% 7% 5% 5% 7% 6% 6% 7% 10% 6% minmax(300px, 1fr);

    const handleSelectedPoGrup = (selectedData: any) => {
        setSelectedKodePoGrup(selectedData);
    };

    const handleSelectedPpnAtasNama = (selectedData: any, nama_cabang: any) => {
        setSelectedKodePpnAtasNama(selectedData);
        setSelectedNamaCabangPpnAtasNama(nama_cabang);
    };

    const handleKirimId = (id: any) => {
        onHandleKirimId(id);
    };

    return (
        <Table data={dataApi} theme={themeProduksi} layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}>
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
                                gridColumnStart={6}
                                gridColumnEnd={13}
                                style={{
                                    textAlign: 'center',
                                    userSelect: 'none',
                                    backgroundColor: '#0c0c0c',
                                    color: 'white',
                                }}
                            >
                                Estimasi Produksi <br />
                                <hr />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ userSelect: 'none', width: 58, fontSize: 12 }} className="flex">
                                        Kuantitas (Kg)
                                    </div>
                                    <div style={{ userSelect: 'none', width: 23, fontSize: 12 }} className="flex">
                                        Diameter
                                    </div>
                                    <div style={{ userSelect: 'none', fontSize: 12 }} className="flex">
                                        Jarak/Cm
                                    </div>
                                    <div style={{ userSelect: 'none', fontSize: 12 }} className="flex">
                                        Kg/Btg
                                    </div>
                                    <div style={{ userSelect: 'none', fontSize: 12 }} className="flex">
                                        Harga/Kg
                                    </div>
                                    <div style={{ userSelect: 'none', fontSize: 12 }} className="flex">
                                        Kuantitas/Btg
                                    </div>
                                    <div style={{ userSelect: 'none', fontSize: 12 }} className="flex">
                                        Harga/Btg
                                    </div>
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
                                            onChange={(event) => handleModalItemChange(event.target.value, 'po_grup', item.id)}
                                            // onChange={(event) => handleUpdate(event.target.value, item.id, 'po_grup')}
                                            onKeyDown={(event) => {
                                                if (event.keyCode === 46) {
                                                    // Tombol delete ditekan
                                                    handleModalItemChange('', 'po_grup', item.id, 'delete');
                                                } else {
                                                }
                                            }}
                                            onFocus={(event) => event.target.select()}
                                            disabled={dataReadOnly}
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
                                            // onChange={(event) => handleUpdate(event.target.value, item.id, 'ppn_atas_nama')}
                                            onKeyDown={(event) => {
                                                if (event.keyCode === 46) {
                                                    // Tombol delete ditekan
                                                    handleModalItemChange('', 'ppn_atas_nama', item.id, 'delete');
                                                } else {
                                                }
                                            }}
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

                                <>
                                    <Cell>
                                        <div className="flex">
                                            <input
                                                id={`kuantitas_kg${item.id}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                defaultValue={item.kuantitas_kg}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id, 'kuantitas_kg')}
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
                                                }}
                                                value={item.diameter}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id, 'diameter')}
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
                                                id={`jarak_cm${item.id}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                }}
                                                defaultValue={item.jarak_cm}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id, 'jarak_cm')}
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
                                                id={`kg_btg${item.id}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                defaultValue={item.kg_btg}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id, 'kg_btg')}
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
                                                id={`harga_kg${item.id}`}
                                                type="text"
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'right',
                                                }}
                                                defaultValue={item.harga_kg}
                                                onBlur={(event) => handleUpdate(event.target.value, item.id, 'harga_kg')}
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
                                        <div className="flex" style={{ backgroundColor: '#dedede' }}>
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
                                                value={item.kuantitas_btg}
                                                onChange={(event) => handleUpdate(event.target.value, item.id, 'kuantitas_btg')}
                                            />
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <div className="flex" style={{ background: '#dedede' }}>
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
                                                value={item.harga_btg}
                                                onChange={(event) => handleUpdate(event.target.value, item.id, 'harga_btg')}
                                            />
                                        </div>
                                    </Cell>
                                </>

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
                                                background: '#dedede',
                                                textAlign: 'right',
                                            }}
                                            disabled
                                            value={item.harga}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'harga')}
                                        />
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
                                            disabled={dataReadOnly}
                                            value={item.pajak}
                                            // defaultValue={valueDataPajakbyRow}
                                            onChange={(event) => handleUpdate(event.target.value, item.id, 'pajak')}
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
export default TableBarangProduksi;
function setDataDetail(arg0: (state: any) => any) {
    throw new Error('Function not implemented.');
}
