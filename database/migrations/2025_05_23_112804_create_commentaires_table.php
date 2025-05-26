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
       Schema::create('commentaires', function (Blueprint $table) {
    $table->id();
    $table->string('nom');
    $table->string('prenom');
    $table->enum('type_client', ['Particuliers', 'Professionnels', 'Collectivités']);
    $table->text('contenu');
    $table->boolean('favori')->default(false);
    $table->string('nation');
    $table->string('ville');
    $table->timestamps();

    
});

    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commentaires');
    }
};
