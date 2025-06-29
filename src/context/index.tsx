'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit, useAppKitTheme } from '@reown/appkit/react'
import { baseSepolia, base } from '@reown/appkit/networks'
import React, { ReactNode, useEffect } from 'react'
import { cookieToInitialState, WagmiProvider} from 'wagmi'
import { useTheme } from 'next-themes'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'basevoice',
  description: 'Anonymous Feedback for Base',
  url: 'https://base-voice.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia, base],
  defaultNetwork: base,
  metadata: metadata,
  themeVariables: {
    '--w3m-accent': '#121212',
    '--w3m-border-radius-master': '0.5px'
  }
})

// Theme synchronization component
function ThemeSynchronizer() {
  const { resolvedTheme } = useTheme()
  console.log(resolvedTheme)
  const { setThemeMode } = useAppKitTheme()
  
  useEffect(() => {
    if (resolvedTheme) {
      setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light')
    }
  }, [resolvedTheme, setThemeMode])
  
  return null
}

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeSynchronizer />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider