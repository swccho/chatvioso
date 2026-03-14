<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_list_returns_only_for_members(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $memberUser = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $memberUser->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $owner->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/members');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_update_member_role(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $memberUser = User::factory()->create();
        $member = WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $memberUser->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $owner->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/workspaces/' . $workspace->id . '/members/' . $member->id, [
                'role' => WorkspaceMember::ROLE_ADMIN,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'admin');
        $this->assertDatabaseHas('workspace_members', [
            'id' => $member->id,
            'role' => WorkspaceMember::ROLE_ADMIN,
        ]);
    }

    public function test_owner_can_remove_member(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $memberUser = User::factory()->create();
        $member = WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $memberUser->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $owner->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/members/' . $member->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('workspace_members', ['id' => $member->id]);
    }

    public function test_member_can_leave_workspace(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $memberUser = User::factory()->create();
        $member = WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $memberUser->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $memberUser->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/members/' . $member->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('workspace_members', ['id' => $member->id]);
    }

    public function test_last_owner_cannot_leave_workspace(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        $ownerMember = WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $token = $owner->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/members/' . $ownerMember->id);

        $response->assertStatus(422);
        $this->assertDatabaseHas('workspace_members', ['id' => $ownerMember->id]);
    }
}
