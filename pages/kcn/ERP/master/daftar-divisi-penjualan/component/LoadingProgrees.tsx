// components/LoadingProgress.tsx (misalnya)
import React, { useEffect, useRef, useState } from 'react';
import { ProgressBarComponent, Inject, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const LoadingProgrees = () => {
  return (
    <div>LoadingProgrees</div>
  )
}

export default LoadingProgrees

interface LoadingProgressProps {
    target: string;
    isLoading: boolean;
    message: string;
    value: number;
    displayed: number;
    onClose: () => void; // NEW
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ target, isLoading, message, value, displayed, onClose }) => {
    const circularProgressRef = useRef<ProgressBarComponent | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [dots, setDots] = useState('');
    const [readyToRefresh, setReadyToRefresh] = useState(false);

    useEffect(() => {
        if (isLoading) {
            intervalRef.current = setInterval(() => {
                setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
            }, 500);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setDots('');
        };
    }, [isLoading]);

    const handleRef = (el: ProgressBarComponent | null) => {
        circularProgressRef.current = el;
        if (el) setReadyToRefresh(true);
    };

    useEffect(() => {
        if (isLoading && readyToRefresh && circularProgressRef.current) {
            circularProgressRef.current.refresh();
        }
    }, [isLoading, readyToRefresh]);

    // const handleRef = (el: ProgressBarComponent | null) => {
    //     circularProgressRef.current = el;

    //     // Jika sudah ter-mount dan loading masih true, refresh langsung
    //     if (el && isLoading) {
    //         setTimeout(() => {
    //             el.refresh();
    //         }, 0);
    //     }
    // };

    useEffect(() => {
        if (value >= 100 && isLoading) {
            const timeout = setTimeout(() => {
                onClose(); // memanggil fungsi dari parent untuk menutup dialog
            }, 600); // biar user sempat lihat 100% Complete

            return () => clearTimeout(timeout); // cleanup kalau komponen unmount
        }
    }, [value, isLoading, onClose]);

    useEffect(() => {
        if (!isLoading) {
            onClose(); // ✅ auto-close kalau loading dihentikan
        }
    }, [isLoading, onClose]);

    if (!isLoading) return null;

    return (
        <div>
            <DialogComponent
                id="frmLoadingProgress"
                isModal={true}
                visible={isLoading}
                showCloseIcon={false}
                closeOnEscape={false}
                allowDragging={false}
                target={`#${target}`} //</div>"#frmBatalDlg" // Pastikan ini container utama
                animationSettings={{ effect: 'None', duration: 0 }}
                width="10%"
                position={{ X: 'center', Y: 'center' }}
                zIndex={20000} // lebih tinggi dari dialog biasa
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-center space-x-2 text-center text-lg font-semibold">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
                            <div className="animate-pulse align-middle">
                                {message}
                                {dots}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {value > 0 ? (
                                <div className="relative">
                                    <ProgressBarComponent
                                        key={isLoading ? 'progress-on' : 'progress-off'}
                                        ref={handleRef}
                                        id="circular-progress"
                                        type="Circular"
                                        height="160px"
                                        width="160px"
                                        trackThickness={15}
                                        progressThickness={15}
                                        cornerRadius="Round"
                                        trackColor="#f3f3f3"
                                        progressColor="#3b3f5c"
                                        animation={{
                                            enable: true,
                                            duration: 2000,
                                            delay: 0,
                                        }}
                                        value={value}
                                    >
                                        <Inject services={[ProgressAnnotation]} />
                                    </ProgressBarComponent>
                                    <div className="absolute left-0 right-0 top-0 flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold">{`${displayed}%`}</span>
                                            <div className="text-sm text-gray-500">Complete</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-blue-500"></div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogComponent>
        </div>
    );
};
