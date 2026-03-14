<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

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

    public function test_send_message_with_attachment(): void
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
        $file = UploadedFile::fake()->image('photo.jpg', 100, 100)->size(100);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post(
                '/api/workspaces/'.$workspace->id.'/conversations/'.$conversation->id.'/messages',
                [
                    'body' => 'Check this image',
                    'attachments' => [$file],
                ],
                ['Accept' => 'application/json']
            );

        $response->assertStatus(201)
            ->assertJsonPath('data.body', 'Check this image')
            ->assertJsonStructure(['data' => ['attachments' => [['id', 'original_name', 'download_url']]]]);
        $this->assertDatabaseHas('attachments', ['original_name' => 'photo.jpg']);
    }

    public function test_attachment_upload_rejects_invalid_type(): void
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
        $file = UploadedFile::fake()->create('script.exe', 100, 'application/octet-stream');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post(
                '/api/workspaces/'.$workspace->id.'/conversations/'.$conversation->id.'/messages',
                [
                    'body' => 'Bad file',
                    'attachments' => [$file],
                ],
                ['Accept' => 'application/json']
            );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachments.0']);
    }

    public function test_non_member_cannot_upload_attachment(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => WorkspaceMember::ROLE_OWNER,
        ]);
        $conversation = $this->createConversationWithMember($user, $workspace);
        $other = User::factory()->create();
        $token = $other->createToken('auth')->plainTextToken;
        $file = UploadedFile::fake()->image('photo.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->post(
                '/api/workspaces/'.$workspace->id.'/conversations/'.$conversation->id.'/messages',
                [
                    'body' => 'Hello',
                    'attachments' => [$file],
                ],
                ['Accept' => 'application/json']
            );

        $response->assertStatus(403);
    }

    public function test_list_files_scoped_to_conversation(): void
    {
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
            'body' => 'With file',
            'type' => Message::TYPE_MESSAGE,
        ]);
        Attachment::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'storage_path' => 'attachments/1/test.pdf',
            'original_name' => 'doc.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);
        $token = $user->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/workspaces/'.$workspace->id.'/conversations/'.$conversation->id.'/files');

        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.original_name', 'doc.pdf');
    }

    public function test_non_member_cannot_download_attachment(): void
    {
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
            'body' => 'File',
            'type' => Message::TYPE_MESSAGE,
        ]);
        $attachment = Attachment::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'storage_path' => 'attachments/1/secret.pdf',
            'original_name' => 'secret.pdf',
            'mime_type' => 'application/pdf',
            'size' => 100,
        ]);
        Storage::disk('local')->put($attachment->storage_path, 'content');
        $other = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $other->id,
            'role' => WorkspaceMember::ROLE_MEMBER,
        ]);
        $token = $other->createToken('auth')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->get('/api/workspaces/'.$workspace->id.'/conversations/'.$conversation->id.'/files/'.$attachment->id.'/download');

        $response->assertStatus(403);
    }
}
