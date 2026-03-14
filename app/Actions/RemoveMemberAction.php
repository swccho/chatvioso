<?php

namespace App\Actions;

use App\Models\Workspace;
use App\Models\WorkspaceMember;

final class RemoveMemberAction
{
    public function execute(Workspace $workspace, WorkspaceMember $member): void
    {
        if ($member->isOwner()) {
            $ownerCount = $workspace->members()->where('role', WorkspaceMember::ROLE_OWNER)->count();
            if ($ownerCount <= 1) {
                throw new \InvalidArgumentException('Cannot remove the last owner.');
            }
        }

        $member->delete();
    }
}
