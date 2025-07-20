import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import 'virtual:uno.css';
import 'uno.css';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';

import FallbackRender from '../ErrorBoundary.tsx';

import { setupI18n } from './locales';
import { store } from './store/index.ts';

function setupApp() {
  setupI18n();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary fallbackRender={FallbackRender}>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );
}

setupApp();
