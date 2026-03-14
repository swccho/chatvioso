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

class MessageTest extends TestCase
{
    use RefreshDatabase;

    protected function createConversationWithMember(User $user, Workspace $workspace): Conversation
    {
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'test',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);
        return $conversation;
    }

    public function test_send_message_successfully(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages', [
                'body' => 'Hello world',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.body', 'Hello world');
        $this->assertDatabaseHas('messages', ['body' => 'Hello world', 'conversation_id' => $conversation->id]);
    }

    public function test_unauthorized_user_cannot_send_message(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);

        $other = User::factory()->create();
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages', [
                'body' => 'Hello',
            ]);

        $response->assertStatus(403);
    }

    public function test_list_messages_for_authorized_member(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'First message',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages');

        $response->assertStatus(200);
        $this->assertArrayHasKey('messages', $response->json('data'));
    }

    public function test_edit_own_message(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Original',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages/' . $message->id, [
                'body' => 'Updated',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.body', 'Updated');
    }

    public function test_delete_own_message(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'To delete',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages/' . $message->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_reply_to_message(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $parent = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Parent',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages', [
                'body' => 'Reply',
                'parent_id' => $parent->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.body', 'Reply')
            ->assertJsonPath('data.parent_id', $parent->id);
    }

    public function test_unauthorized_user_cannot_read_messages(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Private',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages');

        $response->assertStatus(403);
    }

    public function test_invalid_reply_target_returns_422(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);

        $otherConversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'other',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        $otherConversation->members()->create(['user_id' => $user->id]);
        $messageInOtherConv = Message::create([
            'conversation_id' => $otherConversation->id,
            'user_id' => $user->id,
            'body' => 'In other conv',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages', [
                'body' => 'Reply with wrong parent',
                'parent_id' => $messageInOtherConv->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_non_member_cannot_pin_message(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'To pin',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $other = User::factory()->create();
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $other->id, 'role' => WorkspaceMember::ROLE_MEMBER]);
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages/' . $message->id . '/pin');

        $response->assertStatus(403);
    }

    public function test_non_member_cannot_add_reaction(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'React to this',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $other = User::factory()->create();
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $other->id, 'role' => WorkspaceMember::ROLE_MEMBER]);
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/messages/' . $message->id . '/reactions', [
                'emoji' => '👍',
            ]);

        $response->assertStatus(403);
    }

    public function test_list_pinned_returns_only_this_conversation_pins(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create(['workspace_id' => $workspace->id, 'user_id' => $user->id, 'role' => WorkspaceMember::ROLE_OWNER]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $pinnedMsg = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Pinned here',
            'type' => Message::TYPE_MESSAGE,
            'pinned_at' => now(),
        ]);

        $otherConv = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'other',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $otherConv->id, 'user_id' => $user->id]);
        Message::create([
            'conversation_id' => $otherConv->id,
            'user_id' => $user->id,
            'body' => 'Pinned elsewhere',
            'type' => Message::TYPE_MESSAGE,
            'pinned_at' => now(),
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/workspaces/' . $workspace->id . '/conversations/' . $conversation->id . '/pinned');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertIsArray($data);
        $ids = array_column($data, 'id');
        $this->assertContains($pinnedMsg->id, $ids);
        $this->assertCount(1, $data);
    }
}
