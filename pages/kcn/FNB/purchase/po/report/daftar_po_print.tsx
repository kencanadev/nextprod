import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';

// use the dynamic import to load the report viewer wrapper: https://nextjs.org/docs/advanced-features/dynamic-import
import dynamic from 'next/dynamic';
const Viewer = dynamic<ViewerWrapperProps>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewerpo')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    // const [cmd, setcmd] = useState('');
    const [entitas, setEntitas] = useState('');
    const [tglAwal, setTglAwal] = useState('');
    const [tglAkhir, setTglAkhir] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const param1 = params.get('tgl_awal');
        const param2 = params.get('tgl_akhir');
        //setcmd(params.get('cmd'));
        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setTglAwal(param1);
        }
        if (param2 !== null) {
            setTglAkhir(param2);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Daftar Permintaan Pembelian'));
    });

    const parameters = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'tgl_awal',
                Value: [tglAwal],
            },
            {
                Name: 'tgl_akhir',
                Value: [tglAkhir],
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi/purchase/po/daftar_po.rdlx-json" reportParam={parameters} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
