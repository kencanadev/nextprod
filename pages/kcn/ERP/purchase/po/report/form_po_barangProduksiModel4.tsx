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
    const [entitas, setEntitas] = useState('');
    const [kodeSp, setKodeSp] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const param1 = params.get('kode_sp');

        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setKodeSp(param1);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Form Permintaan Pembelian'));
    });

    const parameter = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'kode_sp',
                Value: [kodeSp],
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi//purchase/po/form_po_barangProduksiModel4.rdlx-json" reportParam={parameter} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
