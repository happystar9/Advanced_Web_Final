import { useContext } from "react";
import AiContext from './AiContextDef'

export function useAiContext() {
  const context = useContext(AiContext)
  if (!context) {
    throw new Error('useAiContext must be used within an AiContextProvider')
  }
  return context
}