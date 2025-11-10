<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTemplateRequest extends FormRequest
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
            'description' => 'nullable|string',
            'selected_aspects' => 'required|array|min:1',
            'selected_aspects.*.id' => 'required|exists:aspects,id',
            'selected_aspects.*.weight' => 'required|numeric|min:0|max:100',
            'visibility_rules' => 'nullable|array',
            'visibility_rules.*.description' => 'nullable|string|max:255',
            'visibility_rules.*.source_type' => 'required|string',
            'visibility_rules.*.source_field' => 'required|string',
            'visibility_rules.*.operator' => 'required|string',
            'visibility_rules.*.value' => 'required|string',
        ];
    }
}
