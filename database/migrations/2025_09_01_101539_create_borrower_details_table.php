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
        Schema::create('borrower_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_id')->constrained('borrowers')->cascadeOnDelete();
            $table->string('borrower_group', 100)->nullable();
            $table->unsignedTinyInteger('purpose')->default(1);
            $table->string('economic_sector', 100);
            $table->string('business_field', 100);
            $table->string('borrower_business', 100);
            $table->unsignedTinyInteger('collectibility')->default(1);
            $table->boolean('restructuring')->default(false);
            $table->timestampsTz();
            $table->softDeletesTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrower_details');
    }
};
