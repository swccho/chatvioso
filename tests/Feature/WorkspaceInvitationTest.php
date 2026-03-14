<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_invite_user(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $token = $owner->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/invitations', [
                'email' => 'newuser@example.com',
                'role' => WorkspaceMember::ROLE_MEMBER,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'newuser@example.com')
            ->assertJsonPath('data.role', 'member');

        $this->assertDatabaseHas('workspace_invitations', [
            'workspace_id' => $workspace->id,
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_invited_user_can_accept(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $invitation = WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'email' => 'invitee@example.com',
            'role' => WorkspaceMember::ROLE_MEMBER,
            'token' => 'valid-token-123',
            'invited_by' => $owner->id,
            'expires_at' => now()->addDays(7),
        ]);

        $invitee = User::factory()->create(['email' => 'invitee@example.com']);
        $token = $invitee->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/invitations/accept', [
                'token' => 'valid-token-123',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'member');

        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $invitee->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $this->assertNotNull($invitation->fresh()->accepted_at);
    }
}
