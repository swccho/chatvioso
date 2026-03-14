<?php

namespace Tests\Unit;

use App\Actions\SendMessageAction;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SendMessageActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_execute_creates_message(): void
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
            'name' => 'Test',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);

        $action = new SendMessageAction();
        $message = $action->execute($conversation, $user, 'Hello world');

        $this->assertInstanceOf(Message::class, $message);
        $this->assertSame('Hello world', $message->body);
        $this->assertSame($conversation->id, $message->conversation_id);
        $this->assertSame($user->id, $message->user_id);
        $this->assertNull($message->parent_id);
    }

    public function test_execute_throws_when_not_member(): void
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
            'name' => 'Test',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);

        $otherUser = User::factory()->create();
        $action = new SendMessageAction();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('You are not a member of this conversation.');
        $action->execute($conversation, $otherUser, 'Hello');
    }

    public function test_execute_throws_when_reply_target_not_in_conversation(): void
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
            'name' => 'Test',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);

        $otherConv = Conversation::create([
            'workspace_id' => $workspace->id,
            'type' => Conversation::TYPE_CHANNEL,
            'name' => 'Other',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $otherConv->id, 'user_id' => $user->id]);
        $messageInOther = Message::create([
            'conversation_id' => $otherConv->id,
            'user_id' => $user->id,
            'body' => 'In other',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $action = new SendMessageAction();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Reply target message not found in this conversation.');
        $action->execute($conversation, $user, 'Reply', $messageInOther->id);
    }

    public function test_execute_with_valid_reply(): void
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
            'name' => 'Test',
            'created_by' => $user->id,
            'is_private' => false,
        ]);
        ConversationMember::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);
        $parent = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => 'Parent',
            'type' => Message::TYPE_MESSAGE,
        ]);

        $action = new SendMessageAction();
        $message = $action->execute($conversation, $user, 'Reply', $parent->id);

        $this->assertSame($parent->id, $message->parent_id);
        $this->assertSame('Reply', $message->body);
    }
}
