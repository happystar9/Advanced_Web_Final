import NavBar from '../components/NavBar'
import '../styles/TodoPage.css'

function Todo() {
    return (
        <>
            <NavBar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-semibold mb-4 page-title">Todo</h1>

                <section className="space-y-4">
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <p className="text-gray-600">No tasks yet. Add a task to get started.</p>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Todo