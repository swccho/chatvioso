<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends ApiController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Registration successful', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::guard('web')->attempt($request->only('email', 'password'))) {
            return $this->unauthorized('Invalid credentials.');
        }

        $user = User::where('email', $request->validated('email'))->firstOrFail();
        $user->tokens()->delete();
        $token = $user->createToken('auth')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(): JsonResponse
    {
        $request = request();
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        return $this->success(null, 'Logged out successfully.');
    }

    public function user(): JsonResponse
    {
        $user = request()->user();
        if (! $user) {
            return $this->unauthorized();
        }
        return $this->success(new UserResource($user));
    }
}
