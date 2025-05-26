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
    Schema::create('demande_devis', function (Blueprint $table) {
        $table->id('id_demandedevis');
        $table->date('date_demande')->default(now());
        $table->text('description');
        $table->float('surface');
        $table->string('type_projet');
        $table->enum('urgence_projet', ['urgent', 'normal', 'flexible']);
        $table->foreignId('id_client')->nullable()->constrained('clients', 'id_client')->onDelete('cascade');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demande_devis');
    }
};
