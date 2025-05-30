<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('type'); // 'demande_devis', 'devis_valide', 'projet_termine', etc.
            $table->string('titre');
            $table->text('message');
            $table->json('data')->nullable(); // Pour stocker des données supplémentaires
            $table->boolean('lu')->default(false);
            $table->unsignedBigInteger('id_gerant');
            $table->unsignedBigInteger('id_demande_devis')->nullable();
            $table->unsignedBigInteger('id_devis')->nullable();
            $table->unsignedBigInteger('id_projet')->nullable();
            $table->timestamps();

            $table->foreign('id_gerant')->references('id_gerant')->on('gerants')->onDelete('cascade');
            $table->foreign('id_demande_devis')->references('id_demandedevis')->on('demande_devis')->onDelete('cascade');
            $table->index(['id_gerant', 'lu']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};