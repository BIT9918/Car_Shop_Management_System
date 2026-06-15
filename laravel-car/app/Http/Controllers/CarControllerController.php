<?php

namespace App\Http\Controllers;

use App\Models\CarController;
use App\Models\CarHistory;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CarControllerController extends Controller
{
    public function index(){
        try {
            $cars = CarController::all();
            return response()->json([
                'success' => true,
                'data' => $cars,
                'message' => 'Cars Get successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function GetCarByID($id){
        try{
            $cars = CarController::find($id);
            if(!$cars){
                return response()->json([
                    'message' => 'Car not found',
                    'status'  => false,
                ],404);
            }

            return response()->json([
                'success' => true,
                'data' => $cars,
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request){
    try{
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'year' => 'required|integer|min:0',
            'description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'status' => 'required|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
        ]);

        if ($validator->fails()) { 
            return response()->json([
                'success' => false,
                'message' => 'You miss some Validater required',
                'errors'  => $validator->errors()
            ], 422);
        }

            $data = $request->all();

            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('cars', 'public');
                $data['image'] = basename($path);
            }

            $car = CarController::where('name', $request->name)
                ->where('brand', $request->brand)
                ->where('price', $request->price)
                ->where('year', $request->year)
                ->where('description', $request->description)
                ->first();

            if ($car) {
                $oldData = $car->toArray();
                $car->stock += $request->stock;

                // If new image uploaded for existing car, replace old one
                if (isset($data['image'])) {
                    if ($car->image) {
                        Storage::disk('public')->delete('cars/' . $car->image);
                    }
                    $car->image = $data['image'];
                }

                $car->save();

                // Log history for stock update
                CarHistory::create([
                    'car_id'   => $car->id,
                    'user_id'  => $request->user()?->id,
                    'action'   => 'update',
                    'old_data' => $oldData,
                    'new_data' => $car->fresh()->toArray(),
                ]);

                return response()->json([
                    'success' => true,
                    'data' => $car,
                    'message' => 'Stock updated (existing car)',
                ], 200);
            }

            $newCar = CarController::create($data);

            // Log history for create
            CarHistory::create([
                'car_id'   => $newCar->id,
                'user_id'  => $request->user()?->id,
                'action'   => 'create',
                'old_data' => null,
                'new_data' => $newCar->toArray(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $newCar,
                'message' => 'Car added successfully',
            ], 201);

        }catch(Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destory(Request $request, $id){
        $cars = CarController::find($id);
        if(!$cars){
            return response()->json([
                'message' => 'Car not found',
                'status'  => false,
            ],404);
        }

        $oldData = $cars->toArray();

        // Delete image file when deleting car
        if ($cars->image) {
            Storage::disk('public')->delete('cars/' . $cars->image);
        }

        $cars->delete();

        // Log history for delete
        CarHistory::create([
            'car_id'   => $id,
            'user_id'  => $request->user()?->id,
            'action'   => 'delete',
            'old_data' => $oldData,
            'new_data' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Car deleted successfully',
        ],200);
    }

    public function update(Request $request, $id){
        try {
            $cars = CarController::find($id);
            
            if(!$cars){
                return response()->json([
                    'message' => 'Car not found',
                    'status'  => false,
                ],404);
            }
             $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'brand' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'year' => 'required|integer|min:0',
                'description' => 'required|string',
                'stock' => 'required|integer|min:0',
                'status' => 'required|boolean',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            if ($validator->fails()) { 
                return response()->json([
                    'success' => false,
                    'message' => 'You miss some Validater required',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $oldData = $cars->toArray();
            $data = $request->all();

            // Handle image upload on update
            if ($request->hasFile('image')) {
                // Delete old image before saving new one
                if ($cars->image) {
                    Storage::disk('public')->delete('cars/' . $cars->image);
                }
                $path = $request->file('image')->store('cars', 'public');
                $data['image'] = basename($path);
            }

            $cars->update($data);

            // Log history for update
            CarHistory::create([
                'car_id'   => $cars->id,
                'user_id'  => $request->user()?->id,
                'action'   => 'update',
                'old_data' => $oldData,
                'new_data' => $cars->fresh()->toArray(),
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $cars,
                'message' => 'Car updated successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // after payment success full decrease the qty follow user buy
    public function purchase(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|integer|exists:car_controllers,id',
                'items.*.quantity' => 'required|integer|min:1',
                'customer.name' => 'nullable|string|max:255',
                'customer.email' => 'nullable|email|max:255',
                'customer.phone' => 'required|string|max:50',
                'customer.address' => 'required|string|max:1000',
                'customer.location' => 'nullable|string|max:255',
                'customer.delivery_method' => 'required|string|in:pickup,delivery',
                'customer.note' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $user = $request->user();
            $customer = $request->input('customer', []);
            $order = Order::create([
                'user_id' => $user?->id,
                'user_name' => $customer['name'] ?? $user?->name ?? 'Guest',
                'user_email' => $customer['email'] ?? $user?->email ?? 'guest@example.com',
                'customer_phone' => $customer['phone'] ?? null,
                'customer_address' => $customer['address'] ?? null,
                'customer_location' => $customer['location'] ?? null,
                'delivery_method' => $customer['delivery_method'] ?? 'pickup',
                'customer_note' => $customer['note'] ?? null,
                'order_number' => 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999),
                'total_quantity' => 0,
                'total_price' => 0,
                'payment_method' => 'ABA QR',
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $totalQuantity = 0;
            $totalPrice = 0;

            foreach ($request->items as $item) {
                $cars = CarController::lockForUpdate()->find($item['id']);

                if (!$cars) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Car with ID {$item['id']} not found",
                    ], 404);
                }

                if ($cars->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Not enough stock for \"{$cars->name}\". Available: {$cars->stock}, Requested: {$item['quantity']}",
                        'cars_id' => $cars->id,
                        'available_stock' => $cars->stock,
                        
                    ], 400);
                }

                $stockBefore = $cars->stock;
                $stockAfter = $stockBefore - $item['quantity'];
                $price = $cars->price;
                $subtotal = $price * $item['quantity'];

                $cars->stock -= $item['quantity'];
                $cars->save();

                OrderItem::create([
                    'order_id' => $order->id,
                    'car_id' => $cars->id,
                    'car_name' => $cars->name,
                    'car_brand' => $cars->brand,
                    'car_image' => $cars->image,
                    'price' => $price,
                    'quantity' => $item['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'subtotal' => $subtotal,
                ]);

                $totalQuantity += $item['quantity'];
                $totalPrice += $subtotal;
            }

            $order->update([
                'total_quantity' => $totalQuantity,
                'total_price' => $totalPrice,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Car Purchase successful! Stock updated.',
                'data' => $order->fresh('items'),
            ]);

        } catch (Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            return response()->json([
                'success' => false,
                'message' => 'Error processing Car purchase',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
