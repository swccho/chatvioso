"use client";

import { createContext, useContext, useCallback } from "react";

export interface ShellActions {
  openNewWorkspace: () => void;
  openNewDM: () => void;
  openNewGroup: () => void;
  openNewChannel: () => void;
}

const ShellActionsContext = createContext<ShellActions | null>(null);

export function useShellActions(): ShellActions | null {
  return useContext(ShellActionsContext);
}

export function ShellActionsProvider({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: ShellActions;
}) {
  return (
    <ShellActionsContext.Provider value={actions}>
      {children}
    </ShellActionsContext.Provider>
  );
}
