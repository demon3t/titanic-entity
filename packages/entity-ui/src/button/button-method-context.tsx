import { createContext, useContext, type ReactNode } from "react";

export type ButtonMethodRunner = (name: string, ...args: unknown[]) => Promise<unknown>;

const ButtonMethodContext = createContext<ButtonMethodRunner | null>(null);

export interface ButtonMethodProviderProps {
  children?: ReactNode;
  runMethod: ButtonMethodRunner;
}

export function ButtonMethodProvider({ children, runMethod }: ButtonMethodProviderProps) {
  return <ButtonMethodContext.Provider value={runMethod}>{children}</ButtonMethodContext.Provider>;
}

export function useButtonMethodRunner(): ButtonMethodRunner | null {
  return useContext(ButtonMethodContext);
}
