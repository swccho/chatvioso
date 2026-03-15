"use client";

import { MessageSquarePlus, Users, Hash, Plus } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";

export interface ConversationPanelActionsProps {
  onNewDM?: () => void;
  onNewGroup?: () => void;
  onNewChannel?: () => void;
}

export function ConversationPanelActions({
  onNewDM,
  onNewGroup,
  onNewChannel,
}: ConversationPanelActionsProps) {
  const hasAny = onNewDM || onNewGroup || onNewChannel;
  if (!hasAny) return null;

  return (
    <Dropdown
      align="end"
      contentClassName="bg-panel border-border-panel text-primary-inverse"
      trigger={
        <IconButton
          icon={<Plus className="size-5" />}
          aria-label="New conversation"
          variant="ghost"
          size="sm"
          className="text-primary-inverse hover:bg-panel-selected"
        />
      }
    >
      {onNewDM && (
        <DropdownItem onClick={onNewDM} className="flex items-center gap-2">
          <MessageSquarePlus className="size-4 shrink-0" />
          New DM
        </DropdownItem>
      )}
      {onNewGroup && (
        <DropdownItem onClick={onNewGroup} className="flex items-center gap-2">
          <Users className="size-4 shrink-0" />
          New group
        </DropdownItem>
      )}
      {onNewChannel && (
        <DropdownItem onClick={onNewChannel} className="flex items-center gap-2">
          <Hash className="size-4 shrink-0" />
          New channel
        </DropdownItem>
      )}
    </Dropdown>
  );
}
