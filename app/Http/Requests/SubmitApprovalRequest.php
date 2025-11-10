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

            'final_classification' => Auth::user()?->hasRole('risk_analyst')
                ? ['nullable', new Enum(Classification::class)]
                : ['prohibited'],

            'override_reason' => Auth::user()?->hasRole('risk_analyst')
                ? ['nullable', 'string', 'max:1000', 'required_with:final_classification']
                : ['prohibited'],
        ];

        if ($this->routeIs('approvals.reject')) {
            $rules['notes'] = ['required', 'string', 'min:10', 'max:1000'];
        } else if ($this->routeIs('approvals.approve')) {
            // Catatan saat approve boleh kosong atau pendek
            $rules['notes'] = ['nullable', 'string', 'max:1000'];
        }

        return $rules;
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
