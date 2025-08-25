import moment from 'moment';
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactFragment } from 'react';
import { FiChevronDown, FiChevronUp, FiEye, FiFilter, FiSearch, FiCalendar, FiClock, FiGlobe, FiSmartphone, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Filter, Page, IFilter, VirtualScroll, Sort } from '@syncfusion/ej2-react-grids';

interface Log {
    timestamp: string;
    requestId: string;
    method: string;
    path: string;
    ip: string;
    headers: { userAgent?: string; contentType?: string; authorization?: string };
    userAgent: { browser?: string; version?: string; os?: string; osVersion?: string; device?: string };
    env: string;
    body?: any;
    query?: any;
    status: number;
    duration: string;
    responseSize: string;
    error?: string;
    errorStack?: string;
}

interface LogViewerProps {
    logs: Log[];
    selectedDate?: string;
    isLoading?: boolean;
}

export default function LogViewer({ logs, selectedDate, isLoading = false }: LogViewerProps) {
    let gridInstance: GridComponent | null = null;
    const [sortField, setSortField] = useState<keyof Log>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
        if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50';
        if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
        if (status >= 500) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getStatusIcon = (status: number) => {
        if (status >= 200 && status < 300) return <FiCheckCircle className="h-4 w-4" />;
        if (status >= 300 && status < 400) return <FiInfo className="h-4 w-4" />;
        if (status >= 400 && status < 500) return <FiAlertTriangle className="h-4 w-4" />;
        if (status >= 500) return <FiXCircle className="h-4 w-4" />;
        return <FiInfo className="h-4 w-4" />;
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET':
                return 'bg-blue-100 text-blue-800';
            case 'POST':
                return 'bg-green-100 text-green-800';
            case 'PUT':
                return 'bg-yellow-100 text-yellow-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            case 'PATCH':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return moment(timestamp).format('DD-MM-YYYY HH:mm:ss');
    };

    const formatDuration = (duration: string) => {
        const ms = parseFloat(duration);
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatSize = (size: string) => {
        const bytes = parseInt(size);
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    if (!selectedDate) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                    <FiCalendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="mb-2 text-lg font-medium">Tidak ada log yang dipilih</p>
                    <p className="text-sm">Pilih log dari tree untuk melihat isi log</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col p-1">
            {isLoading ? (
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading logs...</span>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                    <div className="text-center">
                        <FiSearch className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-sm">Tidak ada log yang ditemukan</p>
                    </div>
                </div>
            ) : (
                <GridComponent
                    id="overviewgrid"
                    dataSource={logs}
                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                    enableHover={false}
                    gridLines={'Both'}
                    rowHeight={22}
                    height="480"
                    ref={(g) => {
                        gridInstance = g;
                    }}
                    filterSettings={{ type: 'Excel' }}
                    allowFiltering={true}
                    allowSorting={true}
                    allowSelection={true}
                    selectionSettings={{
                        persistSelection: true,
                        type: 'Multiple',
                    }}
                    allowPaging={true}
                    pageSettings={{
                        pageSize: 25,
                        pageCount: 5,
                        pageSizes: ['25', '50', '100', 'All'],
                    }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field="timestamp" headerText="Waktu" headerTextAlign="Center" clipMode="EllipsisWithTooltip" allowFiltering={false} />
                        <ColumnDirective
                            field="method"
                            headerText="Method"
                            headerTextAlign="Center"
                            clipMode="EllipsisWithTooltip"
                            template={(args: { method: string }) => <span className={`rounded px-2 py-1 text-xs ${getMethodColor(args.method)}`}>{args.method}</span>}
                            allowFiltering={true}
                        />
                        <ColumnDirective field="path" headerText="Path" headerTextAlign="Center" clipMode="EllipsisWithTooltip" allowFiltering={false} />
                        <ColumnDirective
                            field="status"
                            headerText="Status"
                            headerTextAlign="Center"
                            clipMode="EllipsisWithTooltip"
                            template={(args: { status: number }) => (
                                <div className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${getStatusColor(args.status)}`}>
                                    {getStatusIcon(args.status)}
                                    {args.status}
                                </div>
                            )}
                            allowFiltering={true}
                        />
                        <ColumnDirective field="ip" headerText="IP" headerTextAlign="Center" clipMode="EllipsisWithTooltip" allowFiltering={false} />
                        <ColumnDirective
                            field="duration"
                            headerText="Duration"
                            headerTextAlign="Center"
                            clipMode="EllipsisWithTooltip"
                            template={(args: { duration: string }) => <span>{formatDuration(args.duration)}</span>}
                            allowFiltering={false}
                        />
                        <ColumnDirective
                            field="responseSize"
                            headerText="Size"
                            headerTextAlign="Center"
                            clipMode="EllipsisWithTooltip"
                            template={(args: { responseSize: string }) => <span>{formatSize(args.responseSize)}</span>}
                            allowFiltering={false}
                        />
                    </ColumnsDirective>
                    <Inject services={[Page, Filter, Sort]} />
                </GridComponent>
            )}

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Log Details - {selectedLog.requestId}</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="border-b pb-2 font-semibold text-gray-900">Request Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Timestamp:</span>
                                            <span className="font-mono">{formatTimestamp(selectedLog.timestamp)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Method:</span>
                                            <span className={`rounded px-2 py-1 text-xs ${getMethodColor(selectedLog.method)}`}>{selectedLog.method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <div className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${getStatusColor(selectedLog.status)}`}>
                                                {getStatusIcon(selectedLog.status)}
                                                {selectedLog.status}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span>{formatDuration(selectedLog.duration)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Response Size:</span>
                                            <span>{formatSize(selectedLog.responseSize)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IP Address:</span>
                                            <span className="font-mono">{selectedLog.ip}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Environment:</span>
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs">{selectedLog.env}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Agent */}
                                {selectedLog.userAgent && (
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 border-b pb-2 font-semibold text-gray-900">
                                            <FiSmartphone className="h-4 w-4" />
                                            User Agent Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            {selectedLog.userAgent.browser && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Browser:</span>
                                                    <span>
                                                        {selectedLog.userAgent.browser} {selectedLog.userAgent.version}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedLog.userAgent.os && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">OS:</span>
                                                    <span>
                                                        {selectedLog.userAgent.os} {selectedLog.userAgent.osVersion}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedLog.userAgent.device && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Device:</span>
                                                    <span>{selectedLog.userAgent.device}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Path and Query */}
                            <div className="mt-6 space-y-4">
                                <h4 className="border-b pb-2 font-semibold text-gray-900">Request Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Path:</label>
                                        <div className="mt-1 break-all rounded bg-gray-50 p-3 font-mono text-sm">{selectedLog.path}</div>
                                    </div>

                                    {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Query Parameters:</label>
                                            <div className="mt-1 rounded bg-gray-50 p-3">
                                                <pre className="overflow-x-auto text-sm">{JSON.stringify(selectedLog.query, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.body && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Request Body:</label>
                                            <div className="mt-1 rounded bg-gray-50 p-3">
                                                <pre className="overflow-x-auto text-sm">{typeof selectedLog.body === 'string' ? selectedLog.body : JSON.stringify(selectedLog.body, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.headers && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Headers:</label>
                                            <div className="mt-1 rounded bg-gray-50 p-3">
                                                <pre className="overflow-x-auto text-sm">{JSON.stringify(selectedLog.headers, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.error && (
                                        <div>
                                            <label className="flex items-center gap-1 text-sm font-medium text-red-600">
                                                <FiAlertTriangle className="h-4 w-4" />
                                                Error:
                                            </label>
                                            <div className="mt-1 rounded border border-red-200 bg-red-50 p-3">
                                                <div className="mb-2 text-sm text-red-800">{selectedLog.error}</div>
                                                {selectedLog.errorStack && <pre className="overflow-x-auto text-xs text-red-700">{selectedLog.errorStack}</pre>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
