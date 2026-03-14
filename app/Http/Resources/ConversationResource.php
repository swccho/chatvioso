<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'type' => $this->type,
            'name' => $this->name,
            'created_by' => $this->created_by,
            'is_private' => $this->is_private,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'unread_count' => $user
                ? ($this->resource->getAttribute('cached_unread_count') ?? $this->resource->unreadCountForUser($user))
                : 0,
            'members' => ConversationMemberResource::collection($this->whenLoaded('members')),
            'workspace' => $this->whenLoaded('workspace', fn () => new WorkspaceResource($this->workspace)),
        ];
    }
}
