<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_phone')->nullable()->after('user_email');
            $table->text('customer_address')->nullable()->after('customer_phone');
            $table->string('customer_location')->nullable()->after('customer_address');
            $table->string('delivery_method')->default('pickup')->after('customer_location');
            $table->text('customer_note')->nullable()->after('delivery_method');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_phone',
                'customer_address',
                'customer_location',
                'delivery_method',
                'customer_note',
            ]);
        });
    }
};
