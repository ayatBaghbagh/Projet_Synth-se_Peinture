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
    Schema::create('projets', function (Blueprint $table) {
        $table->id('id_projet');
        $table->string('titre');
        $table->date('date_d');
        $table->date('date_f')->nullable();
        $table->enum('status', ['encours', 'termine'])->default('encours');
        $table->foreignId('id_devis')->constrained('devis', 'id_devis')->onDelete('cascade');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projets');
    }
};
