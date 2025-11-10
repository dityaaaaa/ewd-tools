<?php

namespace App\Http\Requests;

use App\Enums\PeriodStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePeriodRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'start_time' => 'nullable|string|date_format:H:i',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'end_time' => 'nullable|string|date_format:H:i',
            'status' => ['required', 'integer', Rule::in(PeriodStatus::values())]
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'start_time' => $this->start_time ?? '00:00',
            'end_time' => $this->end_time ?? '23:59'
        ]);
    }
}
