import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'

function SavedVideos() {
    return (
        <>
            <NavBar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-semibold mb-4 page-title">Saved Videos</h1>

                <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <p className="text-gray-600">You haven't saved any videos yet.</p>
                    </div>
                </section>
            </main>
        </>
    )
}

export default SavedVideos