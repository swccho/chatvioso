<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    protected function createWorkspaceWithMember(User $user): Workspace
    {
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        return $workspace;
    }

    public function test_create_direct_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user1);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user2->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $user1->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/direct', [
                'other_user_id' => $user2->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'direct');
        $this->assertDatabaseCount('conversation_members', 2);
    }

    public function test_create_group_conversation(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/group', [
                'name' => 'My Group',
                'member_ids' => [$other->id],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'group')
            ->assertJsonPath('data.name', 'My Group');
        $this->assertDatabaseCount('conversation_members', 2);
    }

    public function test_create_channel(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/channel', [
                'name' => 'general',
                'is_private' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'channel')
            ->assertJsonPath('data.name', 'general');
    }

    public function test_list_conversations_for_authorized_user(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'general',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $user->id]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_unauthorized_user_cannot_access_conversation(): void
    {
        $owner = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($owner);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'private',
            'created_by' => $owner->id,
            'is_private' => true,
        ]);
        $conversation->members()->create(['user_id' => $owner->id]);

        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id);

        $response->assertStatus(403);
    }

    public function test_member_can_add_workspace_member_to_group(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => 'My Group',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $user->id]);

        $third = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $third->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/members', [
                'user_id' => $third->id,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('conversation_members', [
            'conversation_id' => $conversation->id,
            'user_id' => $third->id,
        ]);
    }

    public function test_cannot_add_member_to_direct_conversation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user1);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user2->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_DIRECT,
            'name' => null,
            'created_by' => $user1->id,
            'is_private' => true,
        ]);
        $conversation->members()->create(['user_id' => $user1->id]);
        $conversation->members()->create(['user_id' => $user2->id]);

        $third = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $third->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $user1->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/members', [
                'user_id' => $third->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_creator_can_remove_other_member(): void
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($creator);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => 'Group',
            'created_by' => $creator->id,
            'is_private' => false,
        ]);
        $creatorMembership = $conversation->members()->create(['user_id' => $creator->id]);
        $memberMembership = $conversation->members()->create(['user_id' => $member->id]);

        $token = $creator->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/members/' . $memberMembership->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('conversation_members', ['id' => $memberMembership->id]);
    }

    public function test_member_can_remove_themselves(): void
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($creator);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => 'Group',
            'created_by' => $creator->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $creator->id]);
        $memberMembership = $conversation->members()->create(['user_id' => $member->id]);

        $token = $member->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/members/' . $memberMembership->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('conversation_members', ['id' => $memberMembership->id]);
    }

    public function test_non_creator_cannot_remove_other_member(): void
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();
        $other = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($creator);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => 'Group',
            'created_by' => $creator->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $creator->id]);
        $conversation->members()->create(['user_id' => $member->id]);
        $otherMembership = $conversation->members()->create(['user_id' => $other->id]);

        $token = $member->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/members/' . $otherMembership->id);

        $response->assertStatus(422);
    }

    public function test_member_can_update_group_conversation_name(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_GROUP,
            'name' => 'Old Name',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $user->id]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id, [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name');
        $this->assertDatabaseHas('conversations', ['id' => $conversation->id, 'name' => 'New Name']);
    }

    public function test_direct_conversation_update_forbidden(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user1);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user2->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_DIRECT,
            'name' => null,
            'created_by' => $user1->id,
            'is_private' => true,
        ]);
        $conversation->members()->create(['user_id' => $user1->id]);
        $conversation->members()->create(['user_id' => $user2->id]);

        $token = $user1->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id, [
                'name' => 'DM',
            ]);

        $response->assertStatus(403);
    }

    public function test_member_can_mark_conversation_read(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'general',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $member = $conversation->members()->create(['user_id' => $user->id]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/read');

        $response->assertStatus(200);
        $member->refresh();
        $this->assertNotNull($member->last_read_at);
    }

    public function test_unauthorized_user_cannot_mark_conversation_read(): void
    {
        $owner = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($owner);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'private',
            'created_by' => $owner->id,
            'is_private' => true,
        ]);
        $conversation->members()->create(['user_id' => $owner->id]);

        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/read');

        $response->assertStatus(403);
    }

    public function test_conversation_list_includes_unread_count(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'general',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $conversation->members()->create(['user_id' => $user->id]);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Hello',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $conv = collect($data)->firstWhere('id', $conversation->id);
        $this->assertNotNull($conv);
        $this->assertArrayHasKey('unread_count', $conv);
        $this->assertGreaterThanOrEqual(1, $conv['unread_count']);
    }
}
