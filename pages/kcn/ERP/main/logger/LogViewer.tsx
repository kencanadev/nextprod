import moment from 'moment';
import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiEye, FiFilter, FiSearch, FiCalendar, FiClock, FiGlobe, FiSmartphone, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

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
    filteredLogs: Log[];
    search: string;
    methodFilter: string;
    statusFilter: string;
    currentPage: number;
    totalPages: number;
    onSearchChange: (search: string) => void;
    onMethodFilterChange: (method: string) => void;
    onStatusFilterChange: (status: string) => void;
    onPageChange: (page: number) => void;
    selectedDate?: string;
    isLoading?: boolean;
}

export default function LogViewer({
    logs,
    filteredLogs = [],
    search,
    methodFilter,
    statusFilter,
    currentPage,
    totalPages,
    onSearchChange,
    onMethodFilterChange,
    onStatusFilterChange,
    onPageChange,
    selectedDate,
    isLoading = false,
}: LogViewerProps) {
    const [sortField, setSortField] = useState<keyof Log>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const logsPerPage = 25;
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;

    // Sort logs
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedLogs = sortedLogs.slice(start, end);

    const handleSort = (field: keyof Log) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

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
                    <p className="mb-2 text-lg font-medium">No Date Selected</p>
                    <p className="text-sm">Select a log file from the tree to view its contents</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Logs for {selectedDate}</h2>
                        <p className="text-sm text-gray-600">
                            {filteredLogs.length} of {logs.length} entries
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                            showFilters ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <FiFilter className="h-4 w-4" />
                        Filters
                        {showFilters ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={methodFilter}
                            onChange={(e) => onMethodFilterChange(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Methods</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status Codes</option>
                            <option value="200">200 - OK</option>
                            <option value="201">201 - Created</option>
                            <option value="400">400 - Bad Request</option>
                            <option value="401">401 - Unauthorized</option>
                            <option value="404">404 - Not Found</option>
                            <option value="500">500 - Server Error</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading logs...</span>
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <div className="text-center">
                            <FiSearch className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm">No logs match your search criteria</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="sticky top-0 bg-gray-50">
                            <tr>
                                <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('timestamp')}>
                                    <div className="flex items-center gap-1">
                                        <FiClock className="h-4 w-4" />
                                        Time
                                        {sortField === 'timestamp' && (sortDirection === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />)}
                                    </div>
                                </th>
                                <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('method')}>
                                    <div className="flex items-center gap-1">
                                        Method
                                        {sortField === 'method' && (sortDirection === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Path</th>
                                <th className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">
                                        Status
                                        {sortField === 'status' && (sortDirection === 'asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <FiGlobe className="mr-1 inline h-4 w-4" />
                                    IP
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedLogs.map((log, index) => (
                                <tr key={log.requestId || index} className="transition-colors hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-900">{formatTimestamp(log.timestamp)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getMethodColor(log.method)}`}>{log.method}</span>
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-3 font-mono text-sm text-gray-900">{log.path}</td>
                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{log.ip}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDuration(log.duration)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatSize(log.responseSize)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => setSelectedLog(log)} className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100">
                                            <FiEye className="h-3 w-3" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {start + 1} to {Math.min(end, filteredLogs.length)} of {filteredLogs.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => onPageChange(page)}
                                            className={`rounded-lg px-3 py-2 text-sm ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button> */}
                            <button
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                ⏮ First
                            </button>

                            {/* Previous */}
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => onPageChange(page)}
                                            className={`rounded-lg px-3 py-2 text-sm ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next */}
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>

                            {/* Last */}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Last ⏭
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
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
