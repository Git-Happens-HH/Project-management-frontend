import React, { useState, type SubmitEvent } from 'react'


// interface ProjectPayload {
//     name: string
//     description?: string | undefined
// }

interface Props {
    isOpen: boolean
    toggleDialog: () => void
    //onCreate: (payload: ProjectPayload) => Promise<void> | void
}

const AddMemberDialog: React.FC<Props> = ({ isOpen, toggleDialog }) => {
    // const [form, setForm] = useState<ProjectPayload>({ name: "", description: "" })
    const [username, setUsername] = useState<string>("")
    if (!isOpen) return null

    const handleSearch = async (e: SubmitEvent) => {
        e.preventDefault()
        try {

            // hakumetodi tähän: Määrittele handlerissa?

            toggleDialog()
        } catch (err) {
            console.error('Search failed', err)
        }
    }

    return (
        <div
            onClick={toggleDialog}
            className="fixed inset-0 z-999 grid h-screen w-screen place-items-center bg-opacity-60 backdrop-blur-xs transition-opacity duration-300"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative mx-auto w-full max-w-md rounded-lg overflow-hidden shadow-sm bg-white"
            >
                <form onSubmit={handleSearch} className="relative flex flex-col bg-white">
                    <div className="relative m-2.5 items-center flex justify-center text-white h-20 rounded-md bg-(--prokress-violet)">
                        <h3 className="text-2xl font-semibold">Search users</h3>
                    </div>

                    <div className="flex flex-col gap-4 p-6">
                        <div className="w-full max-w-full">
                            <label className="block mb-2 text-sm text-slate-600 font-medium">Username</label>
                            <input
                                required
                                type="text"
                                value={username}
                                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                                onChange={(e) => setUsername(e.target.value )}
                            />
                        </div>       

                    </div>

                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-violet) transition-all"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={toggleDialog}
                            className="flex-1 rounded-md border border-slate-300 py-2.5 px-4 text-center text-sm font-semibold text-slate-800 hover:opacity-90"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddMemberDialog
