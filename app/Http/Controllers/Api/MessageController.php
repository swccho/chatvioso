<?php

namespace App\Http\Controllers\Api;

use App\Actions\SendMessageAction;
use App\Events\ConversationUpdated;
use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Notifications\MentionNotification;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Attachment;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends ApiController
{
    public function __construct(
        private SendMessageAction $sendMessage
    ) {}

    public function index(Request $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $perPage = min((int) $request->get('per_page', 20), 50);
        $messages = $conversation->messages()
            ->with(['user', 'parent.user', 'attachments.message.conversation', 'reactions'])
            ->latest()
            ->cursorPaginate($perPage);

        return $this->success([
            'messages' => MessageResource::collection($messages->getCollection())->resolve(),
            'next_cursor' => $messages->nextCursor()?->encode(),
            'prev_cursor' => $messages->previousCursor()?->encode(),
        ]);
    }

    public function store(StoreMessageRequest $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $body = is_string($request->input('body')) ? $request->input('body') : $request->validated('body');
        if (empty($body)) {
            return $this->validationError(['body' => ['The body field is required.']]);
        }

        try {
            $message = $this->sendMessage->execute(
                $conversation,
                $request->user(),
                $body,
                $request->validated('parent_id')
            );

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('attachments/'.$message->id, 'local');
                    Attachment::create([
                        'message_id' => $message->id,
                        'user_id' => $request->user()->id,
                        'storage_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }
            }

            $message->load(['user', 'parent', 'attachments.message.conversation', 'reactions']);
            $conversation->touch();
            $this->dispatchMentionNotifications($message);
            broadcast(new MessageSent($message))->toOthers();
            broadcast(new ConversationUpdated($conversation, Str::limit($message->body, 80)))->toOthers();
            return $this->success(new MessageResource($message), 'Message sent.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->validationError(['body' => [$e->getMessage()]]);
        }
    }

    public function update(UpdateMessageRequest $request, Workspace $workspace, Conversation $conversation, Message $message): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id || $message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('update', $message);

        $message->update(['body' => $request->validated('body')]);
        $message->load(['user', 'parent', 'attachments.message.conversation', 'reactions']);
        broadcast(new MessageUpdated($message))->toOthers();
        return $this->success(new MessageResource($message));
    }

    public function destroy(Workspace $workspace, Conversation $conversation, Message $message): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id || $message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('delete', $message);

        $messageId = $message->id;
        $conversationId = $message->conversation_id;
        $message->delete();
        broadcast(new MessageDeleted($messageId, $conversationId))->toOthers();
        return $this->success(null, 'Message deleted.');
    }

    public function pinned(Request $request, Workspace $workspace, Conversation $conversation): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->whereNotNull('pinned_at')
            ->with(['user', 'parent.user', 'attachments.message.conversation', 'reactions'])
            ->orderBy('pinned_at', 'desc')
            ->get();

        return $this->success(MessageResource::collection($messages));
    }

    private function dispatchMentionNotifications(Message $message): void
    {
        if (! preg_match_all('/@(\d+)/', $message->body, $matches)) {
            return;
        }
        $mentionedIds = array_unique(array_map('intval', $matches[1]));
        $memberIds = $message->conversation->members()->pluck('user_id')->all();
        $senderId = $message->user_id;
        foreach ($mentionedIds as $userId) {
            if ($userId === $senderId || ! in_array($userId, $memberIds, true)) {
                continue;
            }
            $user = \App\Models\User::find($userId);
            if ($user) {
                $user->notify(new MentionNotification($message, $message->user));
            }
        }
    }
}
