<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Client extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'clients';
    protected $primaryKey = 'id_client';

    protected $fillable = [
        'nom',
        'prenom',
        'adresse',
        'email',
        'password',
        'telephone',
       'date_inscription',
       'block',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relations
    public function devis()
    {
        return $this->hasMany(Devis::class, 'id_client', 'id_client');
    }

    public function demandesDevis()
    {
        return $this->hasMany(DemandeDevis::class, 'id_client', 'id_client');
    }

    public function projets()
    {
        return $this->hasMany(Projet::class, 'id_client', 'id_client');
    }
}