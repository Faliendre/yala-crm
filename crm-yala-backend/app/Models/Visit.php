<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Visit extends Model
{
    use HasFactory;

    protected $table = 'visits';

    protected $fillable = [
        'captacion_id',
        'seller_id',
        'visit_date',
        'result',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'datetime',
    ];

    public function captacion()
    {
        return $this->belongsTo(Captacion::class, 'captacion_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Mutators para guardar en Mayúsculas automáticamente
    public function setResultAttribute($value)
    {
        $this->attributes['result'] = mb_strtoupper($value, 'UTF-8');
    }

    public function setNotesAttribute($value)
    {
        $this->attributes['notes'] = $value ? mb_strtoupper($value, 'UTF-8') : null;
    }
}
