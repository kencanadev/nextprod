import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';

// use the dynamic import to load the report viewer wrapper: https://nextjs.org/docs/advanced-features/dynamic-import
import dynamic from 'next/dynamic';
const Viewer = dynamic<ViewerWrapperProps>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    const [cmd, setcmd] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const cmdParam = params.get('cmd');

        if (cmdParam !== null) {
            setcmd(cmdParam);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Form Pra Penerimaan Barang (Dengan Harga)'));
    });

    const parameter = {
        ReportParams: [
            {
                Name: 'cmd',
                Value: [cmd],
            },
        ],
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi/inventory/pb/form_prapb_nominal.rdlx-json" reportParam={parameter} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
