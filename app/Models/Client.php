<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_client';

    protected $fillable = [
        'nom', 'prenom', 'adresse', 'email', 'password', 'telephone', 'date_inscription', 'block'
    ];

    protected $hidden = ['password'];

    public function demandesDevis()
    {
        return $this->hasMany(DemandeDevis::class, 'id_client');
    }
}
