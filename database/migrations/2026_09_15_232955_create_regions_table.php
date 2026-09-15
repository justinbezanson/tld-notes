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
        Schema::create('regions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('region_id', 255)->nullable()->default('GENERAL');
            $table->unsignedInteger('run_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->unique(['run_id', 'region_id']);
            $table->foreign('run_id')->references('id')->on('runs')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
