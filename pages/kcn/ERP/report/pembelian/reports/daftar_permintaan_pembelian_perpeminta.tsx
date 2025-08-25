import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';

// use the dynamic import to load the report viewer wrapper: https://nextjs.org/docs/advanced-features/dynamic-import
import dynamic from 'next/dynamic';
const Viewer = dynamic<ViewerWrapperProps | any>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    const [entitas, setEntitas] = useState('');
    const [token, setToken] = useState('');
    const [param1, setIdPemintaPilihan] = useState('');
    const [param2, setDataPemintaPilihan] = useState('');
    const [param3, setDataPemintaUser] = useState('');

    const [param4, setIdKategoriPilihan] = useState('');
    const [param5, setDataKategoriPilihan] = useState('');
    const [param6, setDataKategori] = useState('');

    const [param7, setIdKelompokPilihan] = useState('');
    const [param8, setDataKelompokPilihan] = useState('');
    const [param9, setDataKelompok] = useState('');

    const [param10, setIdNoItemPilihan] = useState('');
    const [param11, setDataNoItemPilihan] = useState('');
    const [param12, setDataNoItem] = useState('');

    const [param13, setIdNamaItemPilihan] = useState('');
    const [param14, setDataNamaItemPilihan] = useState('');
    const [param15, setDataNamaItem] = useState('');
    // const [param16, setSelectedOd] = useState('');

    const [param16, setTglAwal] = useState('');
    const [param17, setTglAkhir] = useState('');
    const [allowPrint, setaAllowPrint] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const token = params.get('token');
        const idPemintaPilihan = params.get('idPemintaPilihan');
        const dataPemintaPilihan = params.get('dataPemintaPilihan');
        const dataPemintaUser = params.get('dataPemintaUser');
        const idKategoriPilihan = params.get('idKategoriPilihan');
        const dataKategoriPilihan = params.get('dataKategoriPilihan');
        const dataKategori = params.get('dataKategori');
        const idKelompokPilihan = params.get('idKelompokPilihan');
        const dataKelompokPilihan = params.get('dataKelompokPilihan');
        const dataKelompok = params.get('dataKelompok');
        const idNoItemPilihan = params.get('idNoItemPilihan');
        const dataNoItemPilihan = params.get('dataNoItemPilihan');
        const dataNoItem = params.get('dataNoItem');
        const idNamaItemPilihan = params.get('idNamaItemPilihan');
        const dataNamaItemPilihan = params.get('dataNamaItemPilihan');
        const dataNamaItem = params.get('dataNamaItem');
        // const selectedOd = params.get('selectedOd');
        const tglAwal = params.get('tglAwal');
        const tglAkhir = params.get('tglAkhir');
        const visiblePrint = params.get('visiblePrint');

        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (token !== null) {
            setToken(token);
        }
        if (idPemintaPilihan !== null) {
            setIdPemintaPilihan(idPemintaPilihan);
        }
        if (dataPemintaPilihan !== null) {
            setDataPemintaPilihan(dataPemintaPilihan);
        }
        if (dataPemintaUser !== null) {
            setDataPemintaUser(dataPemintaUser);
        }
        if (idKategoriPilihan !== null) {
            setIdKategoriPilihan(idKategoriPilihan);
        }
        if (dataKategoriPilihan !== null) {
            setDataKategoriPilihan(dataKategoriPilihan);
        }
        if (dataKategori !== null) {
            setDataKategori(dataKategori);
        }
        if (idKelompokPilihan !== null) {
            setIdKelompokPilihan(idKelompokPilihan);
        }
        if (dataKelompokPilihan !== null) {
            setDataKelompokPilihan(dataKelompokPilihan);
        }
        if (dataKelompok !== null) {
            setDataKelompok(dataKelompok);
        }
        if (idNoItemPilihan !== null) {
            setIdNoItemPilihan(idNoItemPilihan);
        }
        if (dataNoItemPilihan !== null) {
            setDataNoItemPilihan(dataNoItemPilihan);
        }
        if (dataNoItem !== null) {
            setDataNoItem(dataNoItem);
        }
        if (idNamaItemPilihan !== null) {
            setIdNamaItemPilihan(idNamaItemPilihan);
        }
        if (dataNamaItemPilihan !== null) {
            setDataNamaItemPilihan(dataNamaItemPilihan);
        }
        if (dataNamaItem !== null) {
            setDataNamaItem(dataNamaItem);
        }
        // if (selectedOd !== null) {
        //     setSelectedOd(selectedOd);
        // }
        if (tglAwal !== null) {
            setTglAwal(tglAwal);
        }
        if (tglAkhir !== null) {
            setTglAkhir(tglAkhir);
        }
        if (visiblePrint !== null) {
            setaAllowPrint(visiblePrint);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Rincian Permintaan Pembelian Per Peminta'));
    });

    // Setting lisensi untuk Grapecity ActiveReportsJS
    // if (typeof window !== 'undefined') {
    //     import('../../../../../../components/ARJS-License');
    // }

    const parameter = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'token',
                Value: [token],
            },
            {
                Name: 'param1',
                Value: [param1],
            },
            {
                Name: 'param2',
                Value: [param2],
            },
            {
                Name: 'param3',
                Value: [param3],
            },
            {
                Name: 'param4',
                Value: [param4],
            },
            {
                Name: 'param5',
                Value: [param5],
            },
            {
                Name: 'param6',
                Value: [param6],
            },
            {
                Name: 'param7',
                Value: [param7],
            },
            {
                Name: 'param8',
                Value: [param8],
            },
            {
                Name: 'param9',
                Value: [param9],
            },
            {
                Name: 'param10',
                Value: [param10],
            },
            {
                Name: 'param11',
                Value: [param11],
            },
            {
                Name: 'param12',
                Value: [param12],
            },
            {
                Name: 'param13',
                Value: [param13],
            },
            {
                Name: 'param14',
                Value: [param14],
            },
            {
                Name: 'param15',
                Value: [param15],
            },
            {
                Name: 'param16',
                Value: [param16],
            },
            {
                Name: 'param17',
                Value: [param17],
            },
            // {
            //     Name: 'param18',
            //     Value: [param18],
            // },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/laporan//pembelian/daftar_permintaan_pembelian_per_peminta.rdlx-json" reportParam={parameter} hiddenPrint={allowPrint} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
