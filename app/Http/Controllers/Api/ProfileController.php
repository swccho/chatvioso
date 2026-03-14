<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UpdateNotificationPreferencesRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends ApiController
{
    private const AVATAR_MAX_SIZE_KB = 2048;
    private const AVATAR_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public function show(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        if (! empty($data)) {
            $user->update($data);
        }
        return $this->success(new UserResource($user->fresh()), 'Profile updated.');
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:'.self::AVATAR_MAX_SIZE_KB],
        ], [
            'avatar.required' => 'Please select an image.',
            'avatar.image' => 'The file must be an image.',
            'avatar.mimes' => 'Allowed formats: JPEG, PNG, GIF, WebP.',
            'avatar.max' => 'The image may not be greater than '.self::AVATAR_MAX_SIZE_KB.' KB.',
        ]);

        $user = $request->user();
        $file = $request->file('avatar');

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $file->store('avatars/'.$user->id, 'public');
        $user->update(['avatar_path' => $path]);

        return $this->success([
            'avatar_url' => Storage::disk('public')->url($path),
        ], 'Avatar updated.');
    }

    public function avatar(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $user = $request->user();
        if (! $user->avatar_path) {
            return $this->notFound('No avatar set.');
        }
        $path = storage_path('app/public/'.$user->avatar_path);
        if (! is_file($path)) {
            return $this->notFound('Avatar file not found.');
        }
        return response()->file($path, [
            'Content-Type' => File::mimeType($path),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->validated('password')),
        ]);
        return $this->success(null, 'Password updated.');
    }

    public function getNotificationPreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        $settings = $user->settings ?? [];
        $defaults = [
            'email_on_mention' => true,
            'in_app_notifications' => true,
        ];
        return $this->success(array_merge($defaults, $settings));
    }

    public function updateNotificationPreferences(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $current = $user->settings ?? [];
        $user->update([
            'settings' => array_merge($current, $request->validated()),
        ]);
        return $this->success(array_merge(
            ['email_on_mention' => true, 'in_app_notifications' => true],
            $user->fresh()->settings ?? []
        ), 'Preferences updated.');
    }
}
