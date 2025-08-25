export const handleSortData = (fieldName: string, direction: string, originalData: any[]) => {
    const sortedRemindData = originalData
        .filter((item: any) => item.remind <= 1)
        .sort((a: any, b: any) => {
            if (a.remind !== b.remind) {
                return a.remind - b.remind;
            }

            const aVal = a[fieldName];
            const bVal = b[fieldName];

            if (aVal < bVal) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const sortedOtherData = originalData
        .filter((item: any) => item.remind > 1)
        .sort((a: any, b: any) => {
            const aVal = a[fieldName];
            const bVal = b[fieldName];

            if (aVal < bVal) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    return [...sortedRemindData, ...sortedOtherData];
};
