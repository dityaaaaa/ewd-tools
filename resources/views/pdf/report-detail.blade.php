<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Report Detail</title>
    <style>
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            color: #111;
        }

        h1 {
            font-size: 18px;
            margin: 0 0 8px;
        }

        h2 {
            font-size: 16px;
            margin: 16px 0 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }

        .section {
            page-break-after: always;
        }

        .no-break {
            page-break-inside: avoid;
        }

        .meta td {
            border: none;
            padding: 2px 0;
        }
    </style>
</head>

<body>
    <div class="section">
        @php
            $start = \Carbon\Carbon::parse($report->period->start_date ?? now());
            $qNum = (int) $start->quarter;
            $roman = ['I','II','III','IV'][$qNum ? $qNum-1 : 0];
            $year = $start->year;
            $isWatchlist = ($report->summary->final_classification ?? 1) == 0;
            $approverName = function($level) use ($report) {
                $appr = $report->approvals?->firstWhere('level', $level);
                return $appr?->reviewer?->name ?? '-';
            };
        @endphp
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
                <div style="font-weight:bold; font-size:16px;">Indonesia ❖ Eximbank</div>
                <div style="font-size:11px; color:#555;">Lembaga Pembiayaan Ekspor Indonesia (LPEI)</div>
            </div>
            <div style="background:#f6d32d; padding:8px 12px; font-weight:bold; border-radius:2px;">
                Periode : {{ $roman }} {{ $year }}
            </div>
        </div>
        <div style="background:#2b3b8c; color:#fff; padding:8px 12px; font-weight:bold; margin-bottom:8px;">SUMMARY EARLY WARNING</div>
        <table class="meta" style="width:100%;">
            <tr>
                <td style="width:20%;">Nama Debitur</td>
                <td style="width:2%;">:</td>
                <td style="background:#2b3b8c; color:#fff; font-weight:bold;">{{ strtoupper($report->borrower->name ?? '') }}</td>
            </tr>
        </table>
        <table style="margin-top:8px;">
            <thead>
                <tr>
                    <th style="width:5%">No</th>
                    <th style="width:65%">Aspek</th>
                    <th style="width:30%">Klasifikasi</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($report->aspects ?? []) as $idx => $aspect)
                <tr>
                    <td>{{ chr(65 + $idx) }}</td>
                    <td>{{ $aspect->aspectVersion->name ?? '-' }}</td>
                    <td>{{ ($aspect->classification ?? 1) == 0 ? 'Warning' : 'Safe' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <div style="background:#444; color:#fff; padding:6px 10px; font-weight:bold; margin:10px 0; display:flex; justify-content:space-between;">
            <div>KATEGORI DEBITUR</div>
            <div style="background:#222; padding:2px 8px; border-radius:2px;">{{ $isWatchlist ? 'WATCHLIST' : 'SAFE' }}</div>
        </div>
        <div style="margin-top:8px;">
            <div style="font-weight:bold;">Catatan Unit Bisnis:</div>
            <div style="border:1px solid #ccc; min-height:60px; padding:8px;">{{ $report->summary->business_notes ?? '' }}</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:8px;">
            <div style="flex:1;">
                <div style="background:#2b3b8c; color:#fff; padding:6px 10px; font-weight:bold;">OVERRIDE</div>
                <table style="width:100%;">
                    <tr>
                        <td style="width:60%">Indikatif Kolektibilitas</td>
                        <td style="width:40%">{{ $report->summary->indicative_collectibility ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Tidak</td>
                        <td>{{ ($report->summary->is_override ?? false) ? 'Tidak' : 'Ya' }}</td>
                    </tr>
                </table>
            </div>
            <div style="flex:1;">
                <div style="font-weight:bold;">Catatan Unit Reviewer:</div>
                <div style="border:1px solid #ccc; min-height:60px; padding:8px;">{{ $report->summary->reviewer_notes ?? '' }}</div>
            </div>
        </div>
        <div style="margin-top:12px;">
            <div style="font-weight:bold;">Tanggal</div>
            <div>{{ optional($report->submitted_at)->format('d F Y') ?? '-' }}</div>
            <div style="font-weight:bold;">Divisi {{ $report->borrower->division->name ?? '-' }}</div>
        </div>
        <table style="margin-top:12px;">
            <thead>
                <tr>
                    <th>Relationship Manager</th>
                    <th>Kepala Departemen</th>
                    <th>Kepala Divisi</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="height:40px;">&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td>{{ $approverName(1) }}</td>
                    <td>{{ $approverName(3) }}</td>
                    <td>{{ $approverName(4) }}</td>
                </tr>
            </tbody>
        </table>
        <table style="margin-top:8px;">
            <thead>
                <tr>
                    <th>Analis</th>
                    <th>Kepala Departemen</th>
                    <th>Kepala Divisi</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="height:40px;">&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td>{{ $approverName(2) }}</td>
                    <td>{{ $approverName(3) }}</td>
                    <td>{{ $approverName(4) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        @php
            $start = \Carbon\Carbon::parse($report->period->start_date ?? now());
            $qNum = (int) $start->quarter;
            $roman = ['I','II','III','IV'][$qNum ? $qNum-1 : 0];
            $year = $start->year;
        @endphp
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
                <div style="font-weight:bold; font-size:16px;">Indonesia ❖ Eximbank</div>
                <div style="font-size:11px; color:#555;">Lembaga Pembiayaan Ekspor Indonesia (LPEI)</div>
            </div>
            <div style="background:#f6d32d; padding:8px 12px; font-weight:bold; border-radius:2px;">
                Triwulan : {{ $roman }} {{ $year }}
            </div>
        </div>
        <div style="background:#2b3b8c; color:#fff; padding:8px 12px; font-weight:bold; margin-bottom:8px;">NOTA MONITORING</div>
        <table class="meta" style="width:100%;">
            <tr>
                <td style="width:20%;">Nama Debitur</td>
                <td style="width:2%;">:</td>
                <td style="background:#eee; font-weight:bold;">{{ strtoupper($report->borrower->name ?? '') }}</td>
            </tr>
        </table>
        <h2>Penjelasan Mengenai Penyebab Debitur Watchlist (Masuk/Keluar)</h2>
        <div style="border:1px solid #ccc; min-height:80px; padding:8px;">{{ $monitoring_note->watchlist_reason ?? '' }}</div>
        <h2>Account Strategy</h2>
        <div style="border:1px solid #ccc; min-height:80px; padding:8px;">{{ $monitoring_note->account_strategy ?? '' }}</div>
        <h2>Progress Pemenuhan Tindak Lanjut Periode Sebelumnya</h2>
        <table>
            <thead>
                <tr>
                    <th style="width:5%">No</th>
                    <th style="width:35%">Tindak Lanjut</th>
                    <th style="width:15%">Due Date</th>
                    <th style="width:15%">Progress</th>
                    <th style="width:15%">PIC</th>
                    <th style="width:15%">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($action_items['previous_period'] ?? []) as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['title'] ?? '' }}</td>
                    <td>{{ $item['due_date'] ?? '' }}</td>
                    <td>{{ $item['progress_notes'] ?? '' }}</td>
                    <td>{{ $item['pic'] ?? '' }}</td>
                    <td>{{ $item['notes'] ?? '' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <h2>Rencana Tindak Lanjut Berikutnya</h2>
        <table>
            <thead>
                <tr>
                    <th style="width:5%">No</th>
                    <th style="width:40%">Tindak Lanjut</th>
                    <th style="width:15%">Due Date</th>
                    <th style="width:15%">PIC</th>
                    <th style="width:25%">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @foreach(($action_items['next_period'] ?? []) as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['title'] ?? '' }}</td>
                    <td>{{ $item['due_date'] ?? '' }}</td>
                    <td>{{ $item['pic'] ?? '' }}</td>
                    <td>{{ $item['notes'] ?? '' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section no-break">
        <h1>Aspek & Penilaian</h1>
        <table>
            <thead>
                <tr>
                    <th style="width:5%">No</th>
                    <th style="width:30%">Aspek</th>
                    <th style="width:15%">Nilai</th>
                    <th style="width:50%">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @php $currentAspect = null; $idx = 0; @endphp
                @foreach($answers as $row)
                    @if($currentAspect !== $row['aspect_code'])
                        @php $currentAspect = $row['aspect_code']; $idx = 0; @endphp
                        <tr>
                            <td>{{ $row['aspect_code'] }}</td>
                            <td colspan="3"><strong>{{ $row['aspect_name'] }}</strong></td>
                        </tr>
                    @endif
                    @php $idx++; @endphp
                    <tr>
                        <td>{{ $row['aspect_code'] }}.{{ $idx }}</td>
                        <td>{{ $row['question'] }}</td>
                        <td>{{ $row['option'] }}</td>
                        <td>{{ $row['notes'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>

</html>