<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CarController;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Admin User (Secure Production Account)
        User::updateOrCreate(
            ['email' => 'mengrithychey@gmail.com'],
            [
                'name' => 'Meng Rithy Chey',
                'password' => Hash::make('Bitpromaxplus123'),
                'role' => 'admin',
            ]
        );

        // Remove legacy insecure test admin
        User::where('email', 'admin@gmail.com')->delete();

        // 2. Seed Standard Demo User
        User::firstOrCreate(
            ['email' => 'bit@gmail.com'],
            [
                'name' => 'BIT',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // 3. Seed Showroom Vehicles
        $cars = [
            [
                'name' => 'Camry 2022',
                'brand' => 'Toyota',
                'price' => 25000.00,
                'year' => 2022,
                'description' => 'Good condition, low mileage',
                'image' => '64IiO7T1QRS8mewERi1n74LLkdziTYDav7g2pCjK.jpg',
                'stock' => 5,
                'status' => true,
            ],
            [
                'name' => 'Model S',
                'brand' => 'Tesla',
                'price' => 79999.99,
                'year' => 2023,
                'description' => 'Electric luxury sedan with autopilot features.',
                'image' => 'cSsqd8PKsQxS3Ed1e7t40Eto48EM5GAG7zWhRoNG.jpg',
                'stock' => 3,
                'status' => true,
            ],
            [
                'name' => 'Civic',
                'brand' => 'Honda',
                'price' => 24999.50,
                'year' => 2022,
                'description' => 'Reliable compact car with great fuel efficiency.',
                'image' => 'wefPpIR9YA2j4DPEsd4f8VDmHxSU2m05AQCpRTG1.jpg',
                'stock' => 4,
                'status' => true,
            ],
            [
                'name' => 'Mustang GT',
                'brand' => 'Ford',
                'price' => 55999.00,
                'year' => 2021,
                'description' => 'High-performance sports car with V8 engine.',
                'image' => '2UOK5yLiU4Tf10Vm5wbwqNHjViDqeNCcRVq9B95o.jpg',
                'stock' => 3,
                'status' => true,
            ],
            [
                'name' => 'Corolla',
                'brand' => 'Toyota',
                'price' => 21999.99,
                'year' => 2023,
                'description' => 'Affordable and durable daily driving car.',
                'image' => '40eIBtGmbkpGaQFA3SJc1QXa5sZ4CefmfGSsRGtK.jpg',
                'stock' => 5,
                'status' => true,
            ],
            [
                'name' => 'X5',
                'brand' => 'BMW',
                'price' => 68999.99,
                'year' => 2022,
                'description' => 'Luxury SUV with advanced tech and comfort.',
                'image' => 'qie1JKsI6TaXKv6G3FpgVuCgIQRqJwxiOoFztiFq.jpg',
                'stock' => 3,
                'status' => true,
            ],
            [
                'name' => 'A4',
                'brand' => 'Audi',
                'price' => 45999.75,
                'year' => 2021,
                'description' => 'Premium sedan with smooth performance.',
                'image' => 'W5Kr9R3zGsp60EvViefVMz1nmM8aMGTZMv4SFHrv.jpg',
                'stock' => 3,
                'status' => true,
            ],
            [
                'name' => 'Sportage',
                'brand' => 'Kia',
                'price' => 27999.99,
                'year' => 2023,
                'description' => 'Compact SUV with modern design.',
                'image' => 'KxbzY8KvJoyzg5UmUPqHpxyvKeH9AxptV301kXqR.jpg',
                'stock' => 4,
                'status' => true,
            ],
            [
                'name' => 'CX-5',
                'brand' => 'Mazda',
                'price' => 30999.49,
                'year' => 2022,
                'description' => 'Stylish SUV with sporty handling.',
                'image' => '1CZjTL2BdqqISol7g9470PHrjP3coDn8BMyGVBfY.jpg',
                'stock' => 3,
                'status' => true,
            ],
            [
                'name' => 'Hilux',
                'brand' => 'Toyota',
                'price' => 39999.00,
                'year' => 2020,
                'description' => 'Strong pickup truck for heavy duty work.',
                'image' => 'LAx4hqpazYQLRlIE1UG8SLJTdUIUjO8Zzv4eZXn9.jpg',
                'stock' => 4,
                'status' => true,
            ],
        ];

        foreach ($cars as $carData) {
            CarController::firstOrCreate(
                [
                    'name' => $carData['name'],
                    'brand' => $carData['brand'],
                ],
                $carData
            );
        }
    }
}
