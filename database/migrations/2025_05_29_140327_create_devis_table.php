<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devis', function (Blueprint $table) {
            $table->id('id_devis');
            $table->string('numero_devis')->nullable();
            $table->date('date_creation')->default(now());
            $table->decimal('prix_total', 10, 2);
            $table->text('description_travaux')->nullable();
            $table->string('delai_execution')->nullable();
            $table->integer('validite_devis')->nullable();
            $table->text('notes_supplementaires')->nullable();
            $table->enum('statut', ['en_attente', 'accepte', 'refuse'])->default('en_attente');
            $table->foreignId('id_demandedevis')->constrained('demande_devis', 'id_demandedevis')->onDelete('cascade');
            $table->foreignId('id_client')->constrained('clients', 'id_client')->onDelete('cascade');
            $table->timestamp('date_acceptation')->nullable();
            $table->timestamp('date_refus')->nullable();
            $table->text('motif_refus')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
