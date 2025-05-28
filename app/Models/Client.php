<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;



class Client extends Model
{
    use HasApiTokens,HasFactory, SoftDeletes;

    protected $primaryKey = 'id_client';

    protected $fillable = [
        'nom', 'prenom', 'adresse', 'email', 'password', 'telephone', 'date_inscription', 'block'
    ];

    protected $hidden = ['password'];
    
    protected $casts = [
        'block' => 'boolean',
        'date_inscription' => 'date',
    ];

    public function demandesDevis()
    {
        return $this->hasMany(DemandeDevis::class, 'id_client');
    }
}
