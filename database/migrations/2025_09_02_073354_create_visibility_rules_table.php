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
        Schema::create('visibility_rules', function (Blueprint $table) {
            $table->id();
            $table->morphs('entity');
            $table->text('description')->nullable();
            $table->enum('source_type', ['borrower_detail', 'borrower_facility', 'answer']);
            $table->string('source_field');
            $table->string('operator');
            $table->text('value');
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visibility_rules');
    }
};
