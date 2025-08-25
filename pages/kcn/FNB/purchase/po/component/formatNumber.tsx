import React from 'react';

interface NumberProps {
    number: number;
}

const FormatNumber: React.FC<NumberProps> = ({ number }) => {
    return <>{Number(number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
};

export default FormatNumber;
