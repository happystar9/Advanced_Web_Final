import { createContext } from "react";

export interface AiContext {
	isEnabled?: boolean
	model?: string
	openChat?: (prompt?: string) => void
	auth?: unknown
}

export const AiContext = createContext<AiContext | undefined>(undefined)

export default AiContext