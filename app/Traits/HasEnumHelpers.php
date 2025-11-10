<?php

namespace App\Traits;

trait HasEnumHelpers
{
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function labels(): array
    {
        $result = [];
        foreach (self::cases() as $case) {
            if (method_exists($case, 'label')) {
                $result[$case->value] = $case->label();
            } else {
                $result[$case->value] = ucfirst(strtolower($case->name));
            }
        }
        return $result;
    }

    public static function toSelectOptions(): array
    {
        return collect(self::cases())->map(fn($case) => [
            'value' => $case->value,
            'label' => method_exists($case,'label') ? $case->label() : ucfirst(strtolower($case->name)),
        ])->values()->all();
    }
}
