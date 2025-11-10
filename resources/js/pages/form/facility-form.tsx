import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFormStore } from '@/stores/form-store';
import { Head } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Facility {
    id: number | null;
    name: string;
    limit: number;
    outstanding: number;
    interestRate: number;
    principalArrears: number;
    interestArrears: number;
    pdo: number;
    maturityDate: string;
}

export default function FormFacility() {
    const { informationBorrower, facilitiesBorrower, updateFacilitiesBorrower } = useFormStore();

    const purpose = informationBorrower.purpose;
    const showKieTable = purpose !== 2;
    const showKmkeTable = purpose !== 1;

    const [kieRows, setKieRows] = useState<Facility[]>(() => {
        const kie = facilitiesBorrower.filter((facility, index) => {
            return facility.name?.toLowerCase().includes('kie') || (index < Math.ceil(facilitiesBorrower.length / 2) && showKieTable);
        });

        return kie.length > 0
            ? kie
            : [
                  {
                      id: null,
                      name: 'KIE 1',
                      limit: 0,
                      outstanding: 0,
                      interestRate: 0,
                      principalArrears: 0,
                      interestArrears: 0,
                      pdo: 0,
                      maturityDate: new Date().toISOString().split('T')[0],
                  },
              ];
    });

    const [kmkeRows, setKmkeRows] = useState<Facility[]>(() => {
        const kmke = facilitiesBorrower.filter((facility) => facility.name?.toLowerCase().includes('kmke'));
        return kmke.length > 0
            ? kmke.map((facility, index) => ({ ...facility, name: `KMKE ${index + 1}` }))
            : [
                  {
                      id: null,
                      name: 'KMKE 1',
                      limit: 0,
                      outstanding: 0,
                      interestRate: 0,
                      principalArrears: 0,
                      interestArrears: 0,
                      pdo: 0,
                      maturityDate: new Date().toISOString().split('T')[0],
                  },
              ];
    });

    useEffect(() => {
        const allFacilities: Facility[] = [];
        if (showKieTable) allFacilities.push(...kieRows);
        if (showKmkeTable) allFacilities.push(...kmkeRows);
        updateFacilitiesBorrower(allFacilities);
    }, [kieRows, kmkeRows, showKieTable, showKmkeTable, updateFacilitiesBorrower]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    const totalKieLimit = useMemo(() => kieRows.reduce((sum, row) => sum + Number(row.limit || 0), 0), [kieRows]);
    const totalKieOutstanding = useMemo(() => kieRows.reduce((sum, row) => sum + Number(row.outstanding || 0), 0), [kieRows]);
    const avgKieInterestRate = useMemo(
        () => (kieRows.length === 0 ? '0.00' : (kieRows.reduce((sum, row) => sum + Number(row.interestRate || 0), 0) / kieRows.length).toFixed(2)),
        [kieRows],
    );
    const totalKiePrincipalArrears = useMemo(() => kieRows.reduce((sum, row) => sum + Number(row.principalArrears || 0), 0), [kieRows]);
    const totalKieInterestArrears = useMemo(() => kieRows.reduce((sum, row) => sum + Number(row.interestArrears || 0), 0), [kieRows]);
    const avgKiePdo = useMemo(
        () => (kieRows.length === 0 ? 0 : Math.round(kieRows.reduce((sum, row) => sum + Number(row.pdo || 0), 0) / kieRows.length)),
        [kieRows],
    );

    const totalKmkeLimit = useMemo(() => kmkeRows.reduce((sum, row) => sum + Number(row.limit || 0), 0), [kmkeRows]);
    const totalKmkeOutstanding = useMemo(() => kmkeRows.reduce((sum, row) => sum + Number(row.outstanding || 0), 0), [kmkeRows]);
    const avgKmkeInterestRate = useMemo(
        () => (kmkeRows.length === 0 ? '0.00' : (kmkeRows.reduce((sum, row) => sum + Number(row.interestRate || 0), 0) / kmkeRows.length).toFixed(2)),
        [kmkeRows],
    );
    const totalKmkePrincipalArrears = useMemo(() => kmkeRows.reduce((sum, row) => sum + Number(row.principalArrears || 0), 0), [kmkeRows]);
    const totalKmkeInterestArrears = useMemo(() => kmkeRows.reduce((sum, row) => sum + Number(row.interestArrears || 0), 0), [kmkeRows]);
    const avgKmkePdo = useMemo(
        () => (kmkeRows.length === 0 ? 0 : Math.round(kmkeRows.reduce((sum, row) => sum + Number(row.pdo || 0), 0) / kmkeRows.length)),
        [kmkeRows],
    );

    const addKieRow = () =>
        setKieRows((rows) => [
            ...rows,
            {
                id: null,
                name: `KIE ${rows.length + 1}`,
                limit: 0,
                outstanding: 0,
                interestRate: 0,
                principalArrears: 0,
                interestArrears: 0,
                pdo: 0,
                maturityDate: new Date().toISOString().split('T')[0],
            },
        ]);
    const removeKieRow = (index: number) => {
        if (kieRows.length > 1) {
            const newRows = kieRows
                .filter((_, i) => i !== index)
                .map((row, idx) => ({
                    ...row,
                    name: `KIE ${idx + 1}`,
                }));
            setKieRows(newRows);
        }
    };
    const addKmkeRow = () =>
        setKmkeRows((rows) => [
            ...rows,
            {
                id: null,
                name: `KMKE ${rows.length + 1}`,
                limit: 0,
                outstanding: 0,
                interestRate: 0,
                principalArrears: 0,
                interestArrears: 0,
                pdo: 0,
                maturityDate: new Date().toISOString().split('T')[0],
            },
        ]);
    const removeKmkeRow = (index: number) => {
        if (kmkeRows.length > 1) {
            const newRows = kmkeRows
                .filter((_, i) => i !== index)
                .map((row, idx) => ({
                    ...row,
                    name: `KMKE ${idx + 1}`,
                }));
            setKmkeRows(newRows);
        }
    };

    const handleRowChange = (
        rows: Facility[],
        setRows: React.Dispatch<React.SetStateAction<Facility[]>>,
        index: number,
        field: keyof Facility,
        value: string | number,
    ) => {
        const updated = [...rows];
        if (['limit', 'outstanding', 'interestRate', 'principalArrears', 'interestArrears', 'pdo'].includes(field)) {
            updated[index][field] = value === '' ? 0 : Number(value);
        } else {
            updated[index][field] = value as any;
        }
        setRows(updated);
    };

    return (
        <>
            <Head title="Fasilitas Debitur" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">Fasilitas Debitur</CardTitle>
                        <p className="text-sm text-gray-600">Isi fasilitas debitur sesuai dengan tujuan dari pinjaman debitur</p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Tujuan Kredit</h3>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Dipilih:</span>{' '}
                                <span className="capitalize">{purpose === 1 ? 'KIE' : purpose === 2 ? 'KMKE' : 'KIE dan KMKE'}</span>
                            </p>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <Table className="min-w-full border border-gray-200">
                                    <TableHeader className="bg-mutes">
                                        <TableRow className="border-b border-gray-200">
                                            <TableHead rowSpan={2}>Rincian Fasilitas</TableHead>
                                            <TableHead rowSpan={2}>Limit (Juta)</TableHead>
                                            <TableHead rowSpan={2}>Outstanding (Juta)</TableHead>
                                            <TableHead rowSpan={2}>Suku Bunga Efektif (%)</TableHead>
                                            <TableHead colSpan={2}>Tunggakan (Juta)</TableHead>
                                            <TableHead rowSpan={2}>PDO (Hari)</TableHead>
                                            <TableHead rowSpan={2}>Jatuh Tempo</TableHead>
                                            <TableHead rowSpan={2}>Aksi</TableHead>
                                        </TableRow>
                                        <TableRow className="border-b border-gray-200">
                                            <TableHead>Pokok</TableHead>
                                            <TableHead>Bunga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showKieTable && (
                                            <>
                                                <TableRow className="bg-blue-50">
                                                    <TableCell>KIE (IDR Juta)</TableCell>
                                                    <TableCell>{formatCurrency(totalKieLimit)}</TableCell>
                                                    <TableCell>{formatCurrency(totalKieOutstanding)}</TableCell>
                                                    <TableCell>{avgKieInterestRate}%</TableCell>
                                                    <TableCell>{formatCurrency(totalKiePrincipalArrears)}</TableCell>
                                                    <TableCell>{formatCurrency(totalKieInterestArrears)}</TableCell>
                                                    <TableCell>{avgKiePdo}</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-green-600 px-2 py-1 text-white shadow-none transition-colors hover:bg-green-700"
                                                            title="Tambah KIE"
                                                            onClick={addKieRow}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                                {kieRows.map((row, index) => (
                                                    <TableRow key={`kie-${index}`}>
                                                        <TableCell>
                                                            <Input
                                                                type="text"
                                                                value={row.name}
                                                                onChange={(e) => handleRowChange(kieRows, setKieRows, index, 'name', e.target.value)}
                                                                className="w-full"
                                                                placeholder="Nama fasilitas"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.limit}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) => handleRowChange(kieRows, setKieRows, index, 'limit', e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.outstanding}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kieRows, setKieRows, index, 'outstanding', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.interestRate}
                                                                min={0}
                                                                max={100}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kieRows, setKieRows, index, 'interestRate', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.principalArrears}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kieRows, setKieRows, index, 'principalArrears', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.interestArrears}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kieRows, setKieRows, index, 'interestArrears', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.pdo}
                                                                min={0}
                                                                onChange={(e) => handleRowChange(kieRows, setKieRows, index, 'pdo', e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="date"
                                                                value={row.maturityDate}
                                                                onChange={(e) =>
                                                                    handleRowChange(kieRows, setKieRows, index, 'maturityDate', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <button
                                                                type="button"
                                                                className="rounded-md bg-red-600 px-2 py-1 text-white shadow-none transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                                                title="Hapus KIE"
                                                                onClick={() => removeKieRow(index)}
                                                                disabled={kieRows.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        )}
                                        {showKmkeTable && (
                                            <>
                                                <TableRow className="bg-green-50">
                                                    <TableCell>KMKE (IDR Juta)</TableCell>
                                                    <TableCell>{formatCurrency(totalKmkeLimit)}</TableCell>
                                                    <TableCell>{formatCurrency(totalKmkeOutstanding)}</TableCell>
                                                    <TableCell>{avgKmkeInterestRate}%</TableCell>
                                                    <TableCell>{formatCurrency(totalKmkePrincipalArrears)}</TableCell>
                                                    <TableCell>{formatCurrency(totalKmkeInterestArrears)}</TableCell>
                                                    <TableCell>{avgKmkePdo}</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-green-600 px-2 py-1 text-white shadow-none transition-colors hover:bg-green-700"
                                                            title="Tambah KMKE"
                                                            onClick={addKmkeRow}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                                {kmkeRows.map((row, index) => (
                                                    <TableRow key={`kmke-${index}`}>
                                                        <TableCell>
                                                            <Input
                                                                type="text"
                                                                value={row.name}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'name', e.target.value)
                                                                }
                                                                className="w-full"
                                                                placeholder="Nama fasilitas"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.limit}
                                                                min={0}
                                                                step={1}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'limit', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.outstanding}
                                                                min={0}
                                                                step={1}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'outstanding', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.interestRate}
                                                                min={0}
                                                                max={100}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'interestRate', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.principalArrears}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'principalArrears', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.interestArrears}
                                                                min={0}
                                                                step={0.01}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'interestArrears', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={row.pdo}
                                                                min={0}
                                                                onChange={(e) => handleRowChange(kmkeRows, setKmkeRows, index, 'pdo', e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="date"
                                                                value={row.maturityDate}
                                                                onChange={(e) =>
                                                                    handleRowChange(kmkeRows, setKmkeRows, index, 'maturityDate', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <button
                                                                type="button"
                                                                className="rounded-md bg-red-600 px-2 py-1 text-white shadow-none transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                                                title="Hapus KMKE"
                                                                onClick={() => removeKmkeRow(index)}
                                                                disabled={kmkeRows.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className={`mt-6 grid grid-cols-1 gap-4 ${showKieTable && showKmkeTable ? 'md:grid-cols-2' : ''}`}>
                            {showKieTable && (
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Ringkasan KIE</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Limit:</span>
                                            <span className="font-medium">Rp {formatCurrency(totalKieLimit)} Juta</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Outstanding:</span>
                                            <span className="font-medium">Rp {formatCurrency(totalKieOutstanding)} Juta</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rata-rata Suku Bunga:</span>
                                            <span className="font-medium">{avgKieInterestRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {showKmkeTable && (
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Ringkasan KMKE</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Limit:</span>
                                            <span className="font-medium">Rp {formatCurrency(totalKmkeLimit)} Juta</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Outstanding:</span>
                                            <span className="font-medium">Rp {formatCurrency(totalKmkeOutstanding)} Juta</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rata-rata Suku Bunga:</span>
                                            <span className="font-medium">{avgKmkeInterestRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
