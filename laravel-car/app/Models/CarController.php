<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarController extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'price',
        'year',
        'description',
        'image',
        'stock',
        'status',
    ];
}
