<?php

namespace App\Services;

use App\Models\ReportAudit;
use App\Models\User;
use Closure;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BaseService
{
    /**
     * Menjalankan sebuah closure di dalam database transaction.
     * 
     * @param Closure $callback Logika yang akan dijalankan.
     * @param int $attempts Jumlah retry jika terjadi deadlock.
     * @return mixed
     * @throws Throwable
     */
    protected function tx(Closure $callback, int $attempts = 1)
    {
        return DB::transaction($callback, $attempts);
    }

    /**
     * Otorisasi dengan dukungan overloading untuk fleksibilitas pemanggilan.
     * 
     * @param User|string|null $actorOrPermission Pengguna yang melakukan aksi atau permission string.
     * @param string|null $permission Izin yang dibutuhkan (jika parameter pertama adalah User).
     * @throws AuthorizationException Jika otorisasi gagal.
     */
    protected function authorize($actorOrPermission, ?string $permission = null): void
    {
        // Jika hanya satu parameter (permission string), gunakan Auth::user()
        if (is_string($actorOrPermission) && $permission === null) {
            $actor = Auth::user();
            $permission = $actorOrPermission;
        }
        // Jika dua parameter (user, permission)
        elseif ($actorOrPermission instanceof User && is_string($permission)) {
            $actor = $actorOrPermission;
        }
        // Parameter tidak valid
        else {
            throw new AuthorizationException('Parameter authorize tidak valid.');
        }

        if (!$actor) {
            throw new AuthorizationException('Aksi ini membutuhkan pengguna yang terautentikasi.');
        }

        if (!$actor->can($permission)) {
            $message = "Akses ditolak. Dibutuhkan izin: ${permission}";
            throw new AuthorizationException($message);
        }
    }

    /**
     * Mencatat audit log.
     * 
     * @param User|null $actor Pengguna yang melakukan aksi.
     * @param array $data Data audit yang akan dicatat.
     */
    protected function audit(?User $actor, array $data): void
    {
        try {
            // Normalisasi before/after agar hanya menyimpan perubahan yang nyata
            if (array_key_exists('before', $data) || array_key_exists('after', $data)) {
                [$normalizedBefore, $normalizedAfter] = $this->normalizeAuditChanges($data['before'] ?? null, $data['after'] ?? null);
                $data['before'] = $normalizedBefore;
                $data['after'] = $normalizedAfter;
            }

            $auditData = array_merge([
                'user_id' => $actor?->id,
                'source' => app()->runningInConsole() ? 'CLI' : 'HTTP',
            ], $data);

            ReportAudit::create($auditData);
        } catch (Exception $e) {
            Log::error('Gagal mencatat audit: ' . $e->getMessage(), [
                'data' => $data,
                'user_id' => $actor?->id,
            ]);
        }
    }

    /**
     * Normalisasi perubahan: hanya simpan kunci yang nilai before != after.
     * Mendukung input array atau string JSON.
     */
    private function normalizeAuditChanges($beforeRaw, $afterRaw): array
    {
        $before = is_array($beforeRaw)
            ? $beforeRaw
            : (is_string($beforeRaw) ? json_decode($beforeRaw, true) : null);
        $after = is_array($afterRaw)
            ? $afterRaw
            : (is_string($afterRaw) ? json_decode($afterRaw, true) : null);

        if ((!$before || !is_array($before)) && (!$after || !is_array($after))) {
            return [null, null];
        }

        if (!$after || !is_array($after)) {
            // Tanpa nilai after, tidak ada diff yang dapat ditampilkan
            return [null, null];
        }

        $keys = array_unique(array_merge(array_keys($after), is_array($before) ? array_keys($before) : []));
        $filteredBefore = [];
        $filteredAfter = [];
        foreach ($keys as $k) {
            $b = $before[$k] ?? null;
            $a = $after[$k] ?? null;
            if (!$this->valuesEqual($b, $a)) {
                $filteredBefore[$k] = $b;
                $filteredAfter[$k] = $a;
            }
        }

        if (empty($filteredAfter)) {
            return [null, null];
        }

        return [$filteredBefore, $filteredAfter];
    }

    private function valuesEqual($v1, $v2): bool
    {
        if (is_array($v1) || is_array($v2)) {
            return json_encode($v1) === json_encode($v2);
        }
        return $v1 === $v2;
    }
}