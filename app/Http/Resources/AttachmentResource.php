<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $message = $this->message;
        $conversation = $message->conversation;
        $path = "/workspaces/{$conversation->workspace_id}/conversations/{$conversation->id}/files/{$this->id}/download";

        return [
            'id' => $this->id,
            'message_id' => $this->message_id,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'download_url' => $path,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
