<?php

namespace App\Notifications;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class WorkspaceInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public WorkspaceInvitation $invitation
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $workspace = $this->invitation->workspace;
        $inviter = $this->invitation->inviter;
        return [
            'type' => 'workspace_invitation',
            'title' => 'Workspace invitation',
            'body' => ($inviter ? $inviter->name : 'Someone').' invited you to '.($workspace ? $workspace->name : 'a workspace'),
            'link' => '/app/workspaces/'.$this->invitation->workspace_id.'/invitations',
            'workspace_id' => $this->invitation->workspace_id,
            'invitation_id' => $this->invitation->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
