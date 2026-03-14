<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function createInvitation(User $inviter): WorkspaceInvitation
    {
        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);
        return WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'email' => 'invited@example.com',
            'role' => 'member',
            'token' => str_repeat('a', 64),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function test_list_notifications_returns_only_current_user(): void
    {
        $user = User::factory()->create();
        $invitation = $this->createInvitation(User::factory()->create());
        $invitation->load(['workspace', 'inviter']);
        $user->notify(new WorkspaceInvitationNotification($invitation));
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['data', 'meta']]);
        $this->assertGreaterThanOrEqual(1, count($response->json('data.data')));
    }

    public function test_mark_notification_read(): void
    {
        $user = User::factory()->create();
        $invitation = $this->createInvitation(User::factory()->create());
        $invitation->load(['workspace', 'inviter']);
        $user->notify(new WorkspaceInvitationNotification($invitation));
        $notification = $user->notifications()->first();
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/notifications/'.$notification->id.'/read');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Marked as read.');
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_mark_all_read(): void
    {
        $user = User::factory()->create();
        $invitation = $this->createInvitation(User::factory()->create());
        $invitation->load(['workspace', 'inviter']);
        $user->notify(new WorkspaceInvitationNotification($invitation));
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/notifications/read-all');

        $response->assertStatus(200);
        $this->assertEquals(0, $user->unreadNotifications()->count());
    }

    public function test_unread_count(): void
    {
        $user = User::factory()->create();
        $invitation = $this->createInvitation(User::factory()->create());
        $invitation->load(['workspace', 'inviter']);
        $user->notify(new WorkspaceInvitationNotification($invitation));
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 1);
    }
}
