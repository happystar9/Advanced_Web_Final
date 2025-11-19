import { type ReactNode, useMemo } from "react";
import { useAuth } from 'react-oidc-context';
import AiContext from './AiContextDef'

export const AiContextProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth()

  const value: AiContext = useMemo(() => ({
    isEnabled: true,
    model: 'gpt-5-mini',
    openChat: (prompt?: string) => {
      console.debug('AiContextProvider.openChat', prompt)
    },
    auth
  }), [auth])

  return (
    <AiContext.Provider value={value}>
      {children}
    </AiContext.Provider>
  )
}

export default AiContextProvider