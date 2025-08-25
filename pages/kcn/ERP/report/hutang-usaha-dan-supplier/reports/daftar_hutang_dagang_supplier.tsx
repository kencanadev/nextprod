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
    const [antara, setantara] = useState('');
    const [TglAwal, setTglAwal] = useState('');
    const [TglAkhir, setTglAkhir] = useState('');
    const [klasifikasiSupp, setKlasifikasiSupp] = useState('');
    const [namaSupp, setNamaSupp] = useState('');
    const [jatuhTempo, setjatuhTempo] = useState('');
    const [token, setToken] = useState('');
    const [allowPrint, setaAllowPrint] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const token = params.get('token');
        const param1 = params.get('antara');
        const param2 = params.get('tgl_awal');
        const param3 = params.get('tgl_akhir');
        const param4 = params.get('klasifikasiSupp');
        const param5 = params.get('namaSupp');
        const param6 = params.get('jatuhTempo');

        const allowPrint = params.get('visiblePrint');

        if (allowPrint !== null) {
            setaAllowPrint(allowPrint);
        }

        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setantara(param1);
        }
        if (param2 !== null) {
            setTglAwal(param2);
        }
        if (param3 !== null) {
            setTglAkhir(param3);
        }
        if (param4 !== null) {
            setKlasifikasiSupp(param4);
        }
        if (param5 !== null) {
            setNamaSupp(param5);
        }
        if (param6 !== null) {
            setjatuhTempo(param6);
        }
        if (token !== null) {
            setToken(token);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Laporan Daftar Hutang'));
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
                Name: 'param1',
                Value: [antara],
            },
            {
                Name: 'param2',
                Value: [TglAwal],
            },
            {
                Name: 'param3',
                Value: [TglAkhir],
            },
            {
                Name: 'param4',
                Value: [klasifikasiSupp],
            },
            {
                Name: 'param5',
                Value: [namaSupp],
            },
            {
                Name: 'param6',
                Value: [jatuhTempo],
            },
            {
                Name: 'token',
                Value: [token],
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/laporan//hutang-usaha-dan-supplier/daftar_hutang_dagang_supplier.rdlx-json" reportParam={parameter} hiddenPrint={allowPrint} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
