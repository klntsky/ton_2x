import i18n from 'i18next'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { SDKProvider } from '@tma.js/sdk-react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'

import { App } from './App.tsx'
import { loadLocalizationResources } from './i18n/utils'

import './index.css'
import './constants/mockEnv.ts'

const queryClient = new QueryClient()

const manifestURL = new URL(
  'tonconnect-manifest.json',
  window.location.href,
).toString()

const root = document.getElementById('root')
const langCode = navigator?.language?.split?.('-')?.[0] === 'ru' ? 'ru' : 'en'

const init = async () => {
  await i18n.use(initReactI18next).init({
    resources: {
      [langCode]: {
        translation: await loadLocalizationResources(langCode),
      },
    },
    lng: langCode,
    interpolation: {
      escapeValue: false,
    },
  })

  if (!root) return

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <TonConnectUIProvider manifestUrl={manifestURL}>
          <SDKProvider debug={false}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </SDKProvider>
        </TonConnectUIProvider>
      </I18nextProvider>
    </React.StrictMode>,
  )
}

void init()
