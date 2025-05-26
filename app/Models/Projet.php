<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 


class Projet extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_projet';
    protected $fillable = ['titre', 'image', 'type_projet', 'date_d', 'date_f', 'status', 'id_devis', 'favoris'];
    
    protected $casts = [
        'favoris' => 'boolean',
    ];

    public function devis()
    {
        return $this->belongsTo(Devis::class, 'id_devis');
    }
}
