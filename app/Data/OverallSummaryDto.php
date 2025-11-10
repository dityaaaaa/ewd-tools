<?php

namespace App\Data;

use App\Enums\Classification; //

/**
 * Objek data internal untuk menyimpan hasil kalkulasi akhir.
 */
readonly class OverallSummaryDto
{
    public function __construct(
        public float $totalScore,
        public Classification $finalClassification,
        public ?string $collectibility = null
    ) {
    }
}