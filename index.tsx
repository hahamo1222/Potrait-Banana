
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { AppProvider } from './store/AppContext';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/demo/generations', lazy: async () => ({
      Component: (await import('./routes/DemoGenerations')).DemoGenerations,
    })
  },
  { path: '/demo/generations/:id', lazy: async () => ({
      Component: (await import('./routes/DemoGenerationDetail')).DemoGenerationDetail,
    })
  },
  { path: '/demo/subscribe', lazy: async () => ({
      Component: (await import('./routes/DemoSubscribe')).DemoSubscribe,
    })
  },
  { path: '/demo/contact', lazy: async () => ({
      Component: (await import('./routes/DemoContact')).DemoContact,
    })
  },
  { path: '/demo/orders', lazy: async () => ({
      Component: (await import('./routes/DemoOrders')).DemoOrders,
    })
  },
]);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>
);
