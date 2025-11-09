import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'

type SavedItem = {
    id: string
    title: string
    videoUrl?: string
}

const PLACEHOLDERS: SavedItem[] = [
    { id: '1', title: 'Example Game 1' },
    { id: '2', title: 'Example Game 2' },
    { id: '3', title: 'Example Game 3' },
]

function SavedVideos() {
    return (
        <div>
            <NavBar />
            <main className="container mx-auto px-6 py-12 max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">Saved Videos</h1>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {PLACEHOLDERS.map((item) => (
                        <article
                            key={item.id}
                            className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col hover:scale-[1.01] transition-transform duration-200"
                        >
                            <div className="p-6">
                                <h2 className="text-xl md:text-2xl font-medium">{item.title}</h2>
                            </div>

                            {/* Video placeholder replace with iframe/embed */}
                            <div className="bg-black flex items-center justify-center flex-1 min-h-[220px] sm:min-h-[260px] md:min-h-[320px]">
                                <div className="text-gray-300">Video Placeholder</div>
                            </div>

                            <div className="p-4 flex justify-end">
                                <button className="text-sm text-yellow-400 hover:underline">View</button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export default SavedVideos