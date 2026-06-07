import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/app/lib/query-client'
import { RouterProvider } from 'react-router'
import { router } from '@/app/routes/router'

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
    </QueryClientProvider>
  )
}

export default App
