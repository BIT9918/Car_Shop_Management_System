<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'car_id',
        'car_name',
        'car_brand',
        'car_image',
        'price',
        'quantity',
        'stock_before',
        'stock_after',
        'subtotal',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
