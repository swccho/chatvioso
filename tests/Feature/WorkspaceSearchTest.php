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

class WorkspaceSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function createWorkspaceWithMember(User $user, string $role = WorkspaceMember::ROLE_OWNER): Workspace
    {
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);
        return $workspace;
    }

    public function test_unauthorized_user_cannot_access_workspace_search(): void
    {
        $owner = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($owner);

        $other = User::factory()->create();
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/search?q=test');

        $response->assertStatus(403);
    }

    public function test_message_search_returns_only_messages_from_conversations_user_is_in(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);

        $convA = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'Channel A',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $convA->id, 'user_id' => $user->id]);
        Message::create([
            'conversation_id' => $convA->id,
            'user_id' => $user->id,
            'body' => 'secret word in A',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $convB = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'Channel B',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        // User is NOT a member of convB
        $otherUser = User::factory()->create();
        ConversationMember::create(['conversation_id' => $convB->id, 'user_id' => $otherUser->id]);
        Message::create([
            'conversation_id' => $convB->id,
            'user_id' => $otherUser->id,
            'body' => 'secret word in B',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/search?q=secret&type=messages');

        $response->assertStatus(200);
        $messages = $response->json('data.messages');
        $this->assertCount(1, $messages);
        $this->assertStringContainsString('in A', $messages[0]['body']);
    }

    public function test_search_respects_type_parameter(): void
    {
        $user = User::factory()->create(['name' => 'Alice', 'email' => 'alice@example.com']);
        $workspace = $this->createWorkspaceWithMember($user);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/search?q=alice&type=users');

        $response->assertStatus(200);
        $this->assertArrayHasKey('users', $response->json('data'));
        $this->assertArrayHasKey('conversations', $response->json('data'));
        $this->assertArrayHasKey('messages', $response->json('data'));
    }

    public function test_search_empty_query_returns_empty_results(): void
    {
        $user = User::factory()->create();
        $workspace = $this->createWorkspaceWithMember($user);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/search?q=');

        $response->assertStatus(200)
            ->assertJsonPath('data.users', [])
            ->assertJsonPath('data.conversations', [])
            ->assertJsonPath('data.messages', []);
    }
}
