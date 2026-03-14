<?php

namespace App\Http\Controllers\Api;

use App\Events\MessagePinned;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class MessagePinController extends ApiController
{
    public function store(Workspace $workspace, Conversation $conversation, Message $message): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id || $message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $message->update(['pinned_at' => now()]);
        $message->load(['user', 'parent', 'attachments', 'reactions']);
        broadcast(new MessagePinned($message, $conversation))->toOthers();
        return $this->success(new MessageResource($message), 'Message pinned.');
    }

    public function destroy(Workspace $workspace, Conversation $conversation, Message $message): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id || $message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $message->update(['pinned_at' => null]);
        $message->load(['user', 'parent', 'attachments', 'reactions']);
        broadcast(new MessagePinned($message, $conversation))->toOthers();
        return $this->success(new MessageResource($message), 'Message unpinned.');
    }
}
