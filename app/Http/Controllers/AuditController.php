<?php

namespace App\Http\Controllers;

use App\Models\ReportAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = ReportAudit::query()->with(['user', 'report']);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('auditable_type', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%");
            });
        }

        if ($reportId = $request->integer('report_id')) {
            $query->where('report_id', $reportId);
        }

        if ($userId = $request->integer('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($action = $request->string('action')->toString()) {
            $query->where('action', $action);
        }

        if ($source = $request->string('source')->toString()) {
            $query->where('source', $source);
        }

        if ($from = $request->date('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->date('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $audits = $query->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('audit/index', [
            'audits' => $audits,
            'filters' => [
                'q' => $search ?? '',
                'report_id' => $reportId ?? null,
                'user_id' => $userId ?? null,
                'action' => $action ?? null,
                'source' => $source ?? null,
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ],
        ]);
    }
}