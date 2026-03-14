<?php

namespace App\Http\Controllers\Api;

use App\Events\ReactionUpdated;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageReactionController extends ApiController
{
    public function store(Request $request, Workspace $workspace, Conversation $conversation, Message $message): JsonResponse
    {
        if ($conversation->workspace_id !== $workspace->id || $message->conversation_id !== $conversation->id) {
            return $this->notFound();
        }
        $this->authorize('view', $conversation);

        $emoji = $request->input('emoji');
        if (! is_string($emoji) || strlen($emoji) > 20) {
            return $this->validationError(['emoji' => ['Invalid emoji.']]);
        }

        $existing = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $request->user()->id)
            ->where('emoji', $emoji)
            ->first();

        if ($existing) {
            $existing->delete();
            $message->load(['user', 'parent', 'attachments', 'reactions.user']);
            $payload = $this->reactionsPayload($message, $request->user()->id);
            broadcast(new ReactionUpdated($message, $payload))->toOthers();
            return $this->success($payload, 'Reaction removed.');
        }

        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $request->user()->id,
            'emoji' => $emoji,
        ]);
        $message->load(['user', 'parent', 'attachments', 'reactions.user']);
        $payload = $this->reactionsPayload($message, $request->user()->id);
        broadcast(new ReactionUpdated($message, $payload))->toOthers();
        return $this->success($payload, 'Reaction added.', 201);
    }

    private function reactionsPayload(Message $message, int $currentUserId): array
    {
        $reactions = $message->reactions->groupBy('emoji');
        $list = [];
        $currentUserReacted = [];
        foreach ($reactions as $emoji => $group) {
            $userIds = $group->pluck('user_id')->values()->all();
            $list[] = ['emoji' => $emoji, 'count' => count($userIds), 'user_ids' => $userIds];
            if (in_array($currentUserId, $userIds, true)) {
                $currentUserReacted[] = $emoji;
            }
        }
        return [
            'message_id' => $message->id,
            'reactions' => $list,
            'current_user_reacted' => $currentUserReacted,
        ];
    }
}
