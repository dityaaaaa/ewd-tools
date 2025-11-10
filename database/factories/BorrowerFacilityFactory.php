<?php

namespace Database\Factories;

use App\Models\BorrowerFacility;
use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowerFacilityFactory extends Factory
{
    protected $model = BorrowerFacility::class;

    public function definition(): array
    {
        $facilityNames = ['KMK', 'KPR', 'KPM', 'Invoice Financing', 'Term Loan'];

        $limit = $this->faker->randomFloat(2, 50000000, 5000000000); // 50 juta - 5 milyar
        $outstanding = $this->faker->randomFloat(2, 0, $limit);
        $arrearsPrincipal = $this->faker->boolean(30) ? $this->faker->randomFloat(2, 0, $limit * 0.1) : 0.0;
        $arrearsInterest = $this->faker->boolean(30) ? $this->faker->randomFloat(2, 0, $limit * 0.05) : 0.0;

        return [
            'facility_name'     => $this->faker->randomElement($facilityNames),
            'limit'             => $limit,
            'outstanding'       => $outstanding,
            'interest_rate'     => $this->faker->randomFloat(2, 6, 16),
            'principal_arrears' => $arrearsPrincipal,
            'interest_arrears'  => $arrearsInterest,
            'pdo_days'          => $this->faker->boolean(25) ? $this->faker->numberBetween(1, 120) : 0,
            'maturity_date'     => $this->faker->dateTimeBetween('+6 months', '+5 years'),
        ];
    }
}