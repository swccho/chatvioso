<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\AttachmentResource;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $reactionsList = [];
        $currentUserReacted = [];
        if ($this->relationLoaded('reactions')) {
            $currentUserId = $request->user()?->id;
            $grouped = $this->reactions->groupBy('emoji');
            foreach ($grouped as $emoji => $group) {
                $userIds = $group->pluck('user_id')->values()->all();
                $reactionsList[] = ['emoji' => $emoji, 'count' => count($userIds), 'user_ids' => $userIds];
                if ($currentUserId && in_array($currentUserId, $userIds, true)) {
                    $currentUserReacted[] = $emoji;
                }
            }
        }

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'user_id' => $this->user_id,
            'body' => $this->body,
            'parent_id' => $this->parent_id,
            'type' => $this->type,
            'pinned_at' => $this->pinned_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
            'parent' => $this->whenLoaded('parent', fn () => new MessageResource($this->parent)),
            'attachments' => $this->whenLoaded('attachments', fn () => AttachmentResource::collection($this->attachments)),
            'reactions' => $reactionsList,
            'current_user_reacted' => $currentUserReacted,
        ];
    }
}
