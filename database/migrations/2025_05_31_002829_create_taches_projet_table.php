<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_xxxxxx_create_taches_projet_table.php

public function up()
{
    Schema::create('taches_projet', function (Blueprint $table) {
        $table->id();
        $table->string('nom_tache');
        $table->text('description')->nullable();
        $table->date('date_debut');
        $table->date('date_fin');
        $table->enum('statut', ['a_faire', 'en_cours', 'termine'])->default('a_faire');
        $table->text('notes')->nullable();
        $table->string('type_projet')->nullable(); // 'grand' ou 'petit' - temporaire avant les FK mais ca not foreign key 
        $table->unsignedBigInteger('projet_id')->nullable(); // doit etre foreign key 
        $table->unsignedBigInteger('assignee_id')->nullable(); // Devient FK plus tard  mais ca not foreign key  
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taches_projet');
    }
};
