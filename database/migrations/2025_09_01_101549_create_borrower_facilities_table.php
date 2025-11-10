<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('borrower_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers')->cascadeOnDelete();
            $table->string('facility_name', 100);
            $table->decimal('limit', 15, 2);
            $table->decimal('outstanding', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('principal_arrears', 15, 2);
            $table->decimal('interest_arrears', 15, 2);
            $table->smallInteger('pdo_days')->default(0);
            $table->date('maturity_date');
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['borrower_id', 'maturity_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrower_facilities');
    }
};
