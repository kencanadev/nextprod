import React from 'react';
import { handleSortData } from '../helpers';
import { useDataHandlerContext } from '@/context/dashboard-pengadaan/DataHandlerProvider';

export const TemplateSorting = (args: any) => {
    const { data, setData, plag, setPlag } = useDataHandlerContext();

    const handleClickSort = () => {
        if (plag === 'asc') {
            setPlag('desc');
        } else {
            setPlag('asc');
        }

        const sortedData = handleSortData(args.field, plag, data);
        setData(sortedData);
    };

    return (
        <div style={{ width: '100%' }} onClick={() => handleClickSort()}>
            <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px' }}>{args.headerText}</span>
        </div>
    );
};

const TemplateAnalisaStok = () => {
    return <div>TemplateAnalisaStok</div>;
};

export default TemplateAnalisaStok;
