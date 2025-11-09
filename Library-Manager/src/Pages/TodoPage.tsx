import NavBar from '../components/NavBar'
import '../styles/TodoPage.css'

type Achievement = {
    id: string
    name: string
    imageUrl?: string
}

const PLACEHOLDER_ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', name: 'First Blood' },
    { id: 'a2', name: 'Collector' },
    { id: 'a3', name: 'Speed Runner' },
    { id: 'a4', name: 'Master Explorer' },
    { id: 'a5', name: 'Sharpshooter' },
    { id: 'a6', name: 'Completionist' },
]

function Todo() {
    return (
        <div>
            <NavBar />
            <main className="container mx-auto px-6 py-12 max-w-6xl">
                <h1 className="text-3xl font-semibold mb-8 page-title">Achievements</h1>
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {PLACEHOLDER_ACHIEVEMENTS.map((ach) => (
                        <article
                            key={ach.id}
                            className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-md flex flex-col"
                        >
                            <div className="bg-gray-700 flex items-center justify-center h-40">
                                {/* Image placeholder (replace with <img src={ach.imageUrl} /> when available) */}
                                <div className="text-gray-300">Image Placeholder</div>
                            </div>
                            <div className="p-4 flex-0">
                                <h2 className="text-lg font-medium">{ach.name}</h2>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export default Todo