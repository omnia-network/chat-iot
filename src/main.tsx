import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import theme from './theme.ts'
import './index.css'

console.log('Version:', import.meta.env.VITE_COMMIT_HASH)

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
