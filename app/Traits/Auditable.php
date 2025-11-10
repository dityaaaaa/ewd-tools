<?php

namespace App\Traits;

use App\Models\Report;
use App\Models\ReportAudit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            DB::afterCommit(fn() => $model->createAuditEntry('created'));
        });

        static::updated(function ($model) {
            $dirty = $model->getDirty();
            if (empty($dirty)) {
                return;
            }
            $original = $model->getOriginal();
            // Simpan hanya nilai original untuk kunci yang berubah
            $before = array_intersect_key($original, $dirty);
            DB::afterCommit(fn() => $model->createAuditEntry('updated', $before, $dirty));
        });

        static::deleted(function ($model) {
            DB::afterCommit(fn() => $model->createAuditEntry('deleted'));
        });
    }

    protected function createAuditEntry(string $action, ?array $before = null, ?array $after = null): void
    {
        try {
            if ($this instanceof ReportAudit) {
                return;
            }

            $reportId = $this->resolveReportId();

            if (!$reportId) {
                throw new RuntimeException("report_id not detected for ".get_class($this)."#".$this->id);
            }

            ReportAudit::create([
                'auditable_id'   => $this->id,
                'auditable_type' => get_class($this),
                'report_id'      => $reportId,
                'user_id'        => Auth::id(),
                'action'         => $action,
                'before'         => $before ? json_encode($before) : null,
                'after'          => $after ? json_encode($after) : null,
                'source'         => $this->detectSource(),
            ]);
        } catch (Throwable $e) {
            logger()->warning('Audit failed: '.$e->getMessage());
        }
    }

    protected function detectSource(): string
    {
        if (app()->runningInConsole()) return 'CLI';
        if (Request::expectsJson()) return 'API';
        if (Str::contains(url()->current(), ['dashboard', 'inertia'])) return 'UI';
        return 'System';
    }

    protected function resolveReportId(): ?int
    {
        if (isset($this->attributes['report_id']) && $this->attributes['report_id']) {
            return $this->attributes['report_id'];
        }

        if (method_exists($this, 'report')) {
            $id = $this->report()->value('id');
            if ($id) return $id;
        }

        if (method_exists($this, 'watchlist')) {
            $id = $this->watchlist()->value('report_id');
            if ($id) return $id;
        }

        if ($this instanceof Report) {
            return $this->id;
        }

        return null;
    }
}
