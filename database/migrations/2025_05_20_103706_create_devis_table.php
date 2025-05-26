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
    Schema::create('devis', function (Blueprint $table) {
        $table->id('id_devis');
        $table->decimal('montant', 10, 2);
        $table->date('date_creation')->default(now());
        $table->foreignId('id_demandedevis')->constrained('demande_devis', 'id_demandedevis')->onDelete('cascade');
        $table->enum('status', ['valide', 'refuse'])->default('valide');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
