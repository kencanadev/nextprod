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
    const [param1, setTglAwal] = useState('');
    const [param2, setTglAkhir] = useState('');
    const [allowPrint, setaAllowPrint] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const token = params.get('token');

        const tglAwal = params.get('tglAwal');
        const tglAkhir = params.get('tglAkhir');
        const visiblePrint = params.get('visiblePrint');

        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (token !== null) {
            setToken(token);
        }
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
        dispatch(setPageTitle('Daftar Memo Pengembalian Barang'));
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
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/laporan//pembelian/daftar_memo_pengembalian_barang.rdlx-json" reportParam={parameter} hiddenPrint={allowPrint} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
