import { useState, useEffect } from 'react';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import { HiDatabase, HiRefresh } from 'react-icons/hi';
import { HiOutlineDocumentText } from 'react-icons/hi';
// import LogViewer from './LogViewer'; // Import LogViewer component
import '@syncfusion/ej2-base/styles/material3.css';
import '@syncfusion/ej2-react-navigations/styles/material3.css';
import LogViewer from './LogViewer';
import { FiSearch } from 'react-icons/fi';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import moment from 'moment';

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

interface LogFile {
    name: string;
    date: string;
}

interface MonthGroup {
    month: string;
    dates: LogFile[];
}

interface YearGroup {
    year: string;
    months: MonthGroup[];
}

type LogEntry = LogFile | YearGroup;

interface TreeNode {
    id: string;
    name: string;
    date?: string;
    child?: TreeNode[];
    [key: string]: any;
}

export default function Index() {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const { sessionData } = useSession();
    const token = sessionData?.token ?? '';
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [search, setSearch] = useState<string>('');
    const [methodFilter, setMethodFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [modalLog, setModalLog] = useState<Log | null>(null);
    const [selectedNode, setSelectedNode] = useState<string>('');
    const [isTreeLoading, setIsTreeLoading] = useState<boolean>(false);
    const [isLogLoading, setIsLogLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const logsPerPage = 10;

    useEffect(() => {
        fetchLogFiles();
    }, [token]);
    function normalizeLog(raw: any, index: number = 0): Log {
        const isOldFormat = typeof raw === 'string' && raw.includes('/erp');

        if (isOldFormat) {
            const [timestampAndPath, jsonPart] = raw.split(/ (\/erp.*) /);
            const [timestampStr, path] = timestampAndPath.split(/(?=\/erp)/);

            let parsedBody = {};
            try {
                parsedBody = JSON.parse(jsonPart);
            } catch {}

            return {
                timestamp: moment(timestampStr.trim(), 'DD-MM-YYYY HH:mm:ss').toISOString(),
                requestId: `legacy-${index}`,
                method: 'POST',
                path: path.trim(),
                ip: '-',
                headers: {},
                userAgent: {},
                env: 'unknown',
                body: parsedBody,
                query: {},
                status: 200,
                duration: '0',
                responseSize: '0',
            };
        }

        return {
            timestamp: moment(raw.timestamp, 'DD-MM-YYYY HH:mm:ss').toISOString(),
            requestId: raw.requestId || `generated-${index}`,
            method: raw.method || 'GET',
            path: raw.path || '',
            ip: raw.ip || '-',
            headers: raw.headers || {},
            userAgent: raw.userAgent || {},
            env: raw.env || 'development',
            body: raw.body || {},
            query: raw.query || {},
            status: raw.status || 0,
            duration: raw.duration || '0',
            responseSize: raw.responseSize || '0',
            error: raw.error,
            errorStack: raw.errorStack,
        };
    }

    const fetchLogFiles = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/logs/files`, {
                headers: { Authorization: 'Bearer ' + token },
            });

            if (response.data.status) {
                const files: LogEntry[] = response.data.files;
                const treeNodes: TreeNode[] = [];

                files.forEach((entry) => {
                    if ('year' in entry) {
                        const yearNode: TreeNode = {
                            id: entry.year,
                            name: entry.year,
                            child: entry.months.map((month) => ({
                                id: `${entry.year}-${month.month}`,
                                name: month.month.replace(/^\d{2}_/, ''),
                                child: month.dates.map((date) => ({
                                    id: date.date,
                                    name: date.date,
                                    date: date.date,
                                })),
                            })),
                        };
                        treeNodes.push(yearNode);
                    } else {
                        treeNodes.push({
                            id: entry.date,
                            name: entry.date,
                            date: entry.date,
                        });
                    }
                });

                setTreeData(treeNodes);
            }
        } catch (error) {
            console.error('Error fetching dates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNodeSelected = async (args: any) => {
        console.log(args);
        const selectedNodeData = args.nodeData;
        const selectedDate = selectedNodeData.id;
        setSelectedNode(selectedDate);

        if (/^\d{2}-\d{2}-\d{4}$/.test(selectedDate)) {
            setIsLogLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/logs/${selectedDate}`, {
                    headers: { Authorization: 'Bearer ' + token },
                });

                if (response.data.status) {
                    const rawLogs: any[] = response.data.logs;

                    const normalizedLogs: Log[] = rawLogs.map((log, i) => normalizeLog(log, i)).filter(Boolean);

                    setLogs(normalizedLogs);
                    setFilteredLogs(normalizedLogs);
                    setCurrentPage(1);
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setIsLogLoading(false);
            }
        }
    };

    useEffect(() => {
        const filtered = logs.filter((log) => {
            const matchSearch = JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
            const matchMethod = !methodFilter || log.method === methodFilter;
            const matchStatus = !statusFilter || log.status.toString() === statusFilter;
            return matchSearch && matchMethod && matchStatus;
        });
        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [search, methodFilter, statusFilter, logs]);

    // Pagination
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;
    const paginatedLogs = filteredLogs.slice(start, end);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const fields = {
        dataSource: treeData,
        id: 'id',
        text: 'name',
        child: 'child',
        iconCss: 'iconCss',
    };

    return (
        <div className="Main" id="daftarAkunSubledger">
            <div className="flex h-[calc(100vh-200px)] gap-4">
                {/* Tree View Panel */}
                <div className="w-80 flex-shrink-0">
                    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <HiDatabase className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-800">Log Files</h3>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Pilih tanggal untuk melihat log</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => fetchLogFiles()}
                                    disabled={isTreeLoading || isLogLoading}
                                    className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                                >
                                    <HiRefresh className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tree Content */}
                        <div className="h-[calc(100%-4rem)] overflow-auto p-3">
                            {isTreeLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
                                </div>
                            ) : treeData.length > 0 ? (
                                <TreeViewComponent fields={fields} nodeSelected={handleNodeSelected} cssClass="custom-tree-improved" allowTextWrap={true} expandOn="Click" showCheckBox={false} />
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <HiOutlineDocumentText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-sm">Tidak ada log files yang ditemukan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Panel */}
                <div className="min-w-0 flex-1">
                    <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        {/* Content Header */}
                        <div className="border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">{selectedNode ? `Logs - ${selectedNode}` : 'Log Viewer'}</h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {isLogLoading ? 'Loading logs...' : logs.length > 0 ? `${logs.length} log entries loaded` : 'Select a log file to view contents'}
                                    </p>
                                </div>
                                {selectedNode && (
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search logs..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-[calc(100%-4rem)]">
                            <LogViewer
                                logs={logs}
                                search={search}
                                methodFilter={methodFilter}
                                filteredLogs={filteredLogs}
                                statusFilter={statusFilter}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onSearchChange={setSearch}
                                onMethodFilterChange={setMethodFilter}
                                onStatusFilterChange={setStatusFilter}
                                onPageChange={setCurrentPage}
                                selectedDate={selectedNode}
                                isLoading={isLogLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
