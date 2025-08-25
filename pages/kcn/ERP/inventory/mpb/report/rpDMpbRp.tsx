import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { ViewerWrapperProps } from '../../../../../../components/ReportViewer';

// use the dynamic import to load the report viewer wrapper: https://nextjs.org/docs/advanced-features/dynamic-import
import dynamic from 'next/dynamic';
// const Viewer = dynamic<ViewerWrapperProps>(
//     async () => {
//         return (await import('../../../../../../components/ReportViewer')).default;
//     },
//     { ssr: false }
// );
const Viewer = dynamic<ViewerWrapperProps>(
    async () => {
        return (await import('../../../../../../components/grapecity-viewer')).default;
    },
    { ssr: false }
);

const ReportPage = () => {
    // const [entitas, setEntitas] = useState('');
    // const [param1, setParam1] = useState('');
    const [cmd, setcmd] = useState('');

    useEffect(() => {
        //   const urlSearchString = window.location.search;
        //   const params = new URLSearchParams(urlSearchString);
        //   const entitas = params.get('entitas');
        //   const param1 = params.get('param1');
        const urlSearchString = window.location.search;
        const params = new URLSearchParams(urlSearchString);
        const cmdParam = params.get('cmd');

        // if (entitas !== null) {
        //     setEntitas(entitas);
        // }
        // if (param1 !== null) {
        //     setParam1(param1);
        // }
        if (cmdParam !== null) {
            setcmd(cmdParam);
        }
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Form Memo Debet'));
    });

    // Setting lisensi untuk Grapecity ActiveReportsJS
    // if (typeof window !== 'undefined') {
    //     import('../../../../../../components/ARJS-License');
    // }

    const parameter = {
        ReportParams: [
            // {
            //     Name: 'entitas',
            //     Value: [entitas],
            // },
            // {
            //     Name: 'param1',
            //     Value: [param1],
            // },
            {
                Name: 'cmd',
                Value: [cmd],
            },
        ],
    };

    // return (
    //     <div style={{ width: '100%', height: '100vh' }}>
    //         <Viewer reportUri="/report/transaksi//purchase/pp/form_pp.rdlx-json" reportParam={parameter} />
    //     </div>
    // );
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Viewer reportUri="/report/transaksi/inventory/mpb/rpDMpbRp.rdlx-json" reportParam={parameter} />
        </div>
    );
};

ReportPage.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ReportPage;
