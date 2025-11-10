<?php

namespace App\Traits;

use Illuminate\Support\Collection;

trait HasVisibilityRules
{
    public function checkVisibility(array $borrowerData, array $facilityData): bool
    {
        $visibilityRule = $this->visibilityRules ?? collect();

        if ($visibilityRule->isEmpty()) {
            return true;
        }

        return $this->evaluateVisibilityRule($visibilityRule, $borrowerData, $facilityData);
    }

    protected function evaluateVisibilityRule(Collection $visibilityRules, array $borrowerData, array $facilityData): bool
    {
        foreach ($visibilityRules as $rule) {
            $sourceValue = null;

            switch ($rule->source_type) {
                case 'borrower_detail':
                    $sourceValue = data_get($borrowerData, $rule->source_field);
                    break;
                case 'borrower_facility':
                    if (isset($facilityData[0]) && is_array($facilityData[0])) {
                        $sourceValue = collect($facilityData)->sum(function ($facility) use ($rule) {
                            return $this->extractFacilityValue($rule->source_field, $facility);
                        });
                    } else {
                        $sourceValue = $this->extractFacilityValue($rule->source_field, $facilityData);
                    }
                    break;
            }

            if (!$this->compareValues($sourceValue, $rule->operator, $rule->value)) {
                return false;
            }
        }

        return true;
    }

    protected function extractFacilityValue(string $field, array $facilityData)
    {
        if (str_starts_with($field, 'total_') || str_starts_with($field, 'sum_')) {
            $actualField = str_starts_with($field, 'total_') ? substr($field, 6) : substr($field, 4);

            return $facilityData[$actualField] ?? 0;
        }

        if (str_starts_with($field, 'avg_')) {
            $actualField = substr($field, 4);

            return $facilityData[$actualField] ?? 0;
        }

        if (str_starts_with($field, 'max_') || str_starts_with($field, 'min_')) {
            $actualField = str_starts_with($field, 'max_') ? substr($field, 4) : substr($field, 4);

            return $facilityData[$actualField] ?? 0;
        }

        if (str_starts_with($field, 'count_')) {
            $actualField = substr($field, 6);
            $value = $facilityData[$actualField] ?? null;

            return ! empty($value) ? 1 : 0;
        }

        if (str_contains($field, '.')) {
            return data_get($facilityData, $field);
        }

        return $facilityData[$field] ?? null;
    }

    protected function compareValues($sourceValue, string $operator, $targetValue): bool
    {
        if ($sourceValue === null) {
            return $operator === '!=' ? $targetValue !== null : false;
        }

        switch ($operator) {
            case '=': return $sourceValue == $targetValue;
            case '!=': return $sourceValue != $targetValue;
            case '>': return is_numeric($sourceValue) && is_numeric($targetValue) && $sourceValue > $targetValue;
            case '<': return is_numeric($sourceValue) && is_numeric($targetValue) && $sourceValue < $targetValue;
            case '>=': return is_numeric($sourceValue) && is_numeric($targetValue) && $sourceValue >= $targetValue;
            case '<=': return is_numeric($sourceValue) && is_numeric($targetValue) && $sourceValue <= $targetValue;
            case 'in':
                $targetArray = is_array($targetValue) ? $targetValue : explode(',', $targetValue);

                return in_array($sourceValue, array_map('trim', $targetArray));
            case 'not_in':
                $targetArray = is_array($targetValue) ? $targetValue : explode(',', $targetValue);

                return ! in_array($sourceValue, array_map('trim', $targetArray));
            case 'contains':
                return is_string($sourceValue) && is_string($targetValue) && strpos(strtolower($sourceValue), strtolower($targetValue)) !== false;
            case 'not_contains':
                return is_string($sourceValue) && is_string($targetValue) && strpos(strtolower($sourceValue), strtolower($targetValue)) === false;
            default: return false;
        }
    }
}
