import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';
import dynamic from 'next/dynamic';

const Viewer = dynamic<ViewerWrapperProps>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    const [entitas, setEntitas] = useState('');
    const [param1, setParam1] = useState('');

    useEffect(() => {
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const entitas = params.get('entitas');
        const param1 = params.get('param1');
        if (entitas !== null) {
            setEntitas(entitas);
        }
        if (param1 !== null) {
            setParam1(param1);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Form Mutasi Barang'));
    });

    const parameters = {
        ReportParams: [
            {
                Name: 'entitas',
                Value: [entitas],
            },
            {
                Name: 'param1',
                Value: [param1],
            },
        ],
    };
    console.log(parameters);
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi/inventory/mb/form_surat_pengambilan_barang_MBEkspedisi.rdlx-json" reportParam={parameters} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
