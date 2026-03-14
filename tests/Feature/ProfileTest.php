<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_fetch_profile_returns_current_user_with_avatar_and_settings(): void
    {
        $user = User::factory()->create([
            'name' => 'Profile User',
            'email' => 'profile@example.com',
            'avatar_path' => null,
            'settings' => null,
        ]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Profile User')
            ->assertJsonPath('data.email', 'profile@example.com')
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'email', 'avatar_url', 'settings',
                ],
            ]);
        $data = $response->json('data');
        $this->assertArrayHasKey('avatar_url', $data);
        $this->assertArrayHasKey('settings', $data);
    }

    public function test_update_profile_updates_name_and_email(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/profile', [
                'name' => 'Updated Name',
                'email' => 'new@example.com',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.email', 'new@example.com')
            ->assertJsonPath('message', 'Profile updated.');
        $user->refresh();
        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('new@example.com', $user->email);
    }

    public function test_update_profile_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create(['email' => 'me@example.com']);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/profile', ['email' => 'taken@example.com']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_avatar_upload_stores_file_and_returns_avatar_url(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/profile/avatar', [
                'avatar' => $file,
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['avatar_url']])
            ->assertJsonPath('message', 'Avatar updated.');
        $user->refresh();
        $this->assertNotNull($user->avatar_path);
        Storage::disk('public')->assertExists($user->avatar_path);
    }

    public function test_avatar_upload_rejects_invalid_type(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/profile/avatar', [
                'avatar' => $file,
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    public function test_update_password_succeeds_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpass'),
        ]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/profile/password', [
                'current_password' => 'oldpass',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Password updated.');
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_update_password_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/profile/password', [
                'current_password' => 'wrong',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_get_notification_preferences_returns_defaults(): void
    {
        $user = User::factory()->create(['settings' => null]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/profile/notification-preferences');

        $response->assertStatus(200)
            ->assertJsonPath('data.email_on_mention', true)
            ->assertJsonPath('data.in_app_notifications', true);
    }

    public function test_update_notification_preferences(): void
    {
        $user = User::factory()->create(['settings' => null]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/profile/notification-preferences', [
                'email_on_mention' => false,
                'in_app_notifications' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.email_on_mention', false)
            ->assertJsonPath('data.in_app_notifications', true)
            ->assertJsonPath('message', 'Preferences updated.');
    }

    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $this->getJson('/api/profile')->assertStatus(401);
        $this->putJson('/api/profile', ['name' => 'X'])->assertStatus(401);
        $this->putJson('/api/profile/password', [
            'current_password' => 'x',
            'password' => 'new',
            'password_confirmation' => 'new',
        ])->assertStatus(401);
    }
}
