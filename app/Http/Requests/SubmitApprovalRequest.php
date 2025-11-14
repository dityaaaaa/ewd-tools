<?php

namespace App\Http\Requests;

use App\Enums\ApprovalStatus;
use App\Enums\Classification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Enum;

class SubmitApprovalRequest extends FormRequest
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
        $rules = [
            'business_notes' => 'nullable|string|max:2000',
            'reviewer_notes' => 'nullable|string|max:2000',
            'final_classification' => ['nullable', new Enum(Classification::class)],
            'override_reason' => ['nullable', 'string', 'max:1000', 'required_with:final_classification'],
        ];

        if ($this->routeIs('approvals.reject')) {
            $rules['notes'] = ['required', 'string', 'min:10', 'max:1000'];
        } else if ($this->routeIs('approvals.approve')) {
            // Catatan saat approve boleh kosong atau pendek
            $rules['notes'] = ['nullable', 'string', 'max:1000'];
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'final_classification' => $this->input('final_classification') ?? $this->input('finalClassification'),
            'override_reason' => $this->input('override_reason') ?? $this->input('overrideReason'),
            'business_notes' => $this->input('business_notes') ?? $this->input('businessNotes'),
            'reviewer_notes' => $this->input('reviewer_notes') ?? $this->input('reviewerNotes'),
            'is_override' => $this->input('is_override') ?? $this->input('isOverride'),
            'notes' => $this->input('notes') ?? $this->input('rejectNotes'),
        ]);
    }


    public function messages(): array
    {
        return [
            'notes.required' => 'Alasan penolakan (notes) wajib diisi.',
            'notes.min' => 'Alasan penolakan (notes) minimal 10 karakter.',
            'override_reason.required_with' => 'Alasan override wajib diisi jika Anda mengubah klasifikasi akhir.',
            'final_classification.prohibited' => 'Hanya Risk Analyst (ERO) yang dapat mengatur klasifikasi akhir.',
            'override_reason.prohibited' => 'Hanya Risk Analyst (ERO) yang dapat mengatur alasan override.',
        ];
    }
}
