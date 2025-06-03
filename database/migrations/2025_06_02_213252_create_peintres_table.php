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
        Schema::create('peintre', function (Blueprint $table) {
            $table->id('num_peintre');
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('tele');
            $table->boolean('disponibilite')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       
        Schema::dropIfExists('peintres-tableau');
    }
};