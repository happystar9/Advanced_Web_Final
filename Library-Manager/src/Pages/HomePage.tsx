import { useDisplayName } from '../hooks/useDisplayName'
import { toast, Toaster } from 'react-hot-toast'
import '../App.css'
import NavBar from '../components/NavBar'



function Home() {
  const { displayName, isAuthenticated } = useDisplayName()

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-8 pt-20">
        <h1 className="text-2xl font-semibold mt-6 mb-4">
          {isAuthenticated ? `Welcome${displayName ? `, ${displayName}` : ''}` : 'Welcome please sign in'}
        </h1>
        <div className="card">
          <button
            onClick={() => {
              toast.error('Test error')
            }}
            style={{ marginLeft: 12 }}
          >
            Trigger error toast
          </button>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

export default Home