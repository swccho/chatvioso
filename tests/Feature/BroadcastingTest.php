<?php

namespace Tests\Feature;

use App\Events\ConversationUpdated;
use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Tests\TestCase;

class BroadcastingTest extends TestCase
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

    public function test_message_sent_is_broadcast_on_conversation_channel(): void
    {
        Broadcast::fake();

        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Hello',
            'type' => Message::TYPE_MESSAGE,
        ]);
        $message->load(['user', 'parent']);

        broadcast(new MessageSent($message))->toOthers();

        Broadcast::assertBroadcastOn('conversation.' . $conversation->id, MessageSent::class);
    }

    public function test_message_updated_is_broadcast_on_conversation_channel(): void
    {
        Broadcast::fake();

        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Original',
            'type' => Message::TYPE_MESSAGE,
        ]);

        broadcast(new MessageUpdated($message))->toOthers();

        Broadcast::assertBroadcastOn('conversation.' . $conversation->id, MessageUpdated::class);
    }

    public function test_message_deleted_is_broadcast_on_conversation_channel(): void
    {
        Broadcast::fake();

        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $messageId = 999;
        $conversationId = $conversation->id;

        broadcast(new MessageDeleted($messageId, $conversationId))->toOthers();

        Broadcast::assertBroadcastOn('conversation.' . $conversationId, MessageDeleted::class);
    }

    public function test_conversation_updated_is_broadcast_on_conversation_channel(): void
    {
        Broadcast::fake();

        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);

        broadcast(new ConversationUpdated($conversation, 'Preview'))->toOthers();

        Broadcast::assertBroadcastOn('conversation.' . $conversation->id, ConversationUpdated::class);
    }

    public function test_unauthorized_user_cannot_access_conversation_channel(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'private',
            'created_by' => $user->id,
            'is_private' => true,
        ]);
        $conversation->members()->create(['user_id' => $user->id]);

        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);

        $token = $other->createToken('auth')->plainTextToken;
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/broadcasting/auth', [
                'channel_name' => 'private-conversation.' . $conversation->id,
                'socket_id' => 'test.1',
            ]);

        $response->assertStatus(403);
    }

    public function test_workspace_member_can_join_presence_channel(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $token = $user->createToken('auth')->plainTextToken;
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/broadcasting/auth', [
                'channel_name' => 'presence-workspace.' . $workspace->id,
                'socket_id' => 'test.1',
            ]);

        $response->assertStatus(200);
    }

    public function test_non_member_cannot_join_workspace_presence_channel(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);

        $other = User::factory()->create();
        $token = $other->createToken('auth')->plainTextToken;
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/broadcasting/auth', [
                'channel_name' => 'presence-workspace.' . $workspace->id,
                'socket_id' => 'test.1',
            ]);

        $response->assertStatus(403);
    }
}
