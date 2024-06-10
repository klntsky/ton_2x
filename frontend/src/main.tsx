import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { SDKProvider } from '@tma.js/sdk-react';

import './index.css';

const manifestURL = new URL(
  'tonconnect-manifest.json',
  window.location.href,
).toString();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestURL}>
      <SDKProvider debug={false}>
        <App />
      </SDKProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
);
