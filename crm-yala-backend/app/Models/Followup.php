<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Followup extends Model
{
    use HasFactory;

    protected $table = 'followups';

    protected $fillable = [
        'captacion_id',
        'date',
        'notes',
        'next_contact',
        'result',
        'status',
    ];

    protected $casts = [
        'date' => 'datetime',
        'next_contact' => 'datetime',
    ];

    public function captacion()
    {
        return $this->belongsTo(Captacion::class, 'captacion_id');
    }

    // Mutators para guardar en Mayúsculas automáticamente
    public function setNotesAttribute($value)
    {
        $this->attributes['notes'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setResultAttribute($value)
    {
        $this->attributes['result'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }
}
