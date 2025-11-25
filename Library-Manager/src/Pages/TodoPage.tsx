import NavBar from '../components/NavBar'
import '../styles/TodoPage.css'
import { useEffect, useState } from 'react'
import storage from '../lib/storage'
import { useNavigate } from 'react-router-dom'

type TodoAchievement = {
    id: string
    name: string
    game?: string
    description?: string
    reason?: string
    image?: string | null
}

function Todo() {
    const navigate = useNavigate()

    const [items, setItems] = useState<TodoAchievement[]>(() => {
        const raw = storage.getString('todoAchievements')
        return raw ? JSON.parse(raw) : []
    })

    useEffect(() => {
        storage.setString('todoAchievements', JSON.stringify(items))

    }, [items])

    function remove(id: string) {
        setItems((s) => s.filter((i) => i.id !== id))
    }

    return (
        <div>
            <NavBar />
            <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
                <h1 className="text-3xl font-semibold mb-8 page-title">Todo Achievements</h1>
                {items.length === 0 ? (
                    <p className="text-gray-400">No todo achievements yet. Use the "Suggest 4" button on a game page to add some.</p>
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {items.map((ach) => (
                            <article
                                key={ach.id}
                                className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-md flex flex-col cursor-pointer hover:shadow-lg"
                                onClick={() => {
                                    const q = encodeURIComponent(`${ach.name} ${ach.game ?? ''}`.trim())
                                    navigate(`/youtube?q=${q}`)
                                }}
                            >
                                <div className="bg-gray-700 flex items-center justify-center h-40">
                                    {ach.image ? (
                                        <img src={ach.image} alt={ach.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="text-gray-300">{ach.game ?? 'Game'}</div>
                                    )}
                                </div>
                                <div className="p-4 flex-0">
                                    <h2 className="text-lg font-medium">{ach.name}</h2>
                                    {ach.description && <p className="text-sm text-gray-300 mt-2">{ach.description}</p>}
                                    {ach.reason && <p className="text-xs text-gray-400 mt-2 italic">{ach.reason}</p>}
                                    <div className="mt-3">
                                        <button
                                            className="text-sm text-red-400 cursor-pointer hover:underline"
                                            onClick={(e) => { e.stopPropagation(); remove(ach.id) }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    )
}

export default Todo