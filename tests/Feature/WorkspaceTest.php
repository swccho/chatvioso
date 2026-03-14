<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_workspace(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces', [
                'name' => 'My Workspace',
                'description' => 'A test workspace',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'My Workspace')
            ->assertJsonPath('data.description', 'A test workspace');

        $this->assertDatabaseHas('workspaces', ['name' => 'My Workspace', 'user_id' => $user->id]);
        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $response->json('data.id'),
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
    }

    public function test_unauthorized_user_cannot_access_workspace(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $otherUser = User::factory()->create();
        $token = $otherUser->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id);

        $response->assertStatus(403);
    }

    public function test_user_can_list_own_workspaces(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth')->plainTextToken;

        $w1 = Workspace::factory()->create(['name' => 'W1']);
        WorkspaceMember::create([
            'workspace_id' => $w1->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $w2 = Workspace::factory()->create(['name' => 'W2']);
        WorkspaceMember::create([
            'workspace_id' => $w2->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($w1->id, $ids);
        $this->assertContains($w2->id, $ids);
    }

    public function test_non_admin_cannot_update_workspace(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id, 'name' => 'Original']);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $member = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $member->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/workspaces/' . $workspace->id, [
                'name' => 'Hacked',
                'description' => $workspace->description,
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('workspaces', ['id' => $workspace->id, 'name' => 'Original']);
    }

    public function test_non_admin_cannot_upload_logo(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $member = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $member->createToken('auth')->plainTextToken;
        $file = \Illuminate\Http\UploadedFile::fake()->image('logo.png', 100, 100);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->post('/api/workspaces/' . $workspace->id . '/logo', [
                'logo' => $file,
            ]);

        $response->assertStatus(403);
    }
}
