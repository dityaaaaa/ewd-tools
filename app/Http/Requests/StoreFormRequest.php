<?php

namespace App\Http\Requests;

use App\Enums\FacilityType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user ? $user->can('submit report') : false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'informationBorrower.borrowerId' => 'required|integer|exists:borrowers,id',
            'informationBorrower.borrowerGroup' => 'nullable|string',
            'informationBorrower.purpose' => ['required', Rule::in(FacilityType::values())],
            'informationBorrower.economicSector' => 'required|string',
            'informationBorrower.businessField' => 'required|string',
            'informationBorrower.borrowerBusiness' => 'required|string',
            'informationBorrower.collectibility' => 'required|integer|min:1|max:5',
            'informationBorrower.restructuring' => 'required|boolean',

            'facilitiesBorrower' => 'required|array|min:1',
            'facilitiesBorrower.*.name' => 'required|string',
            'facilitiesBorrower.*.limit' => 'required|numeric|min:0',
            'facilitiesBorrower.*.outstanding' => 'required|numeric|min:0',
            'facilitiesBorrower.*.interestRate' => 'required|numeric|min:0',
            'facilitiesBorrower.*.principalArrears' => 'required|numeric|min:0',
            'facilitiesBorrower.*.interestArrears' => 'required|numeric|min:0',
            'facilitiesBorrower.*.pdo' => 'required|integer|min:0',
            'facilitiesBorrower.*.maturityDate' => 'required|date',

            'aspectsBorrower' => 'required|array|min:1',
            'aspectsBorrower.*.questionId' => 'required|exists:question_versions,id',
            'aspectsBorrower.*.selectedOptionId' => 'required|exists:question_options,id',

            'reportMeta.template_id' => 'required|exists:templates,id',
            'reportMeta.period_id' => 'required|exists:periods,id',
        ];
    }
}
