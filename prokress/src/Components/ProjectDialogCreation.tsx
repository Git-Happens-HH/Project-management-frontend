import React, { useState, type SubmitEvent } from 'react'
import {createNewProject} from '../helper/handler.tsx'

interface ProjectPayload {
    name: string
    description?: string
}

interface Props {
    isOpen: boolean
    toggleDialog: () => void
    //onCreate: (payload: ProjectPayload) => Promise<void> | void
    is_shared: boolean
}

const ProjectDialogCreation: React.FC<Props> = ({ isOpen, toggleDialog, is_shared }) => {
    const [form, setForm] = useState<ProjectPayload>({ name: "", description: "" })
    if (!isOpen) return null

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        try {
            //onCreate({ ...form, name: form.name.trim() })
            //console.log(form)
            createNewProject(form.name, form.description, is_shared)
            toggleDialog()
        } catch (err) {
            console.error('Project create failed', err)
        }
    }

    return (
        <div
            onClick={toggleDialog}
            className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-opacity-60 backdrop-blur-xs transition-opacity duration-300"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative mx-auto w-full max-w-[28rem] rounded-lg overflow-hidden shadow-sm bg-white"
            >
                <form onSubmit={handleSubmit} className="relative flex flex-col bg-white">
                    <div className="relative m-2.5 items-center flex justify-center text-white h-20 rounded-md bg-(--prokress-violet)">
                        <h3 className="text-2xl font-semibold">Create Project</h3>
                    </div>

                    <div className="flex flex-col gap-4 p-6">
                        <div className="w-full max-w-full">
                            <label className="block mb-2 text-sm text-slate-600 font-medium">Project Name</label>
                            <input
                                required
                                type="text"
                                value={form.name}
                                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="w-full max-w-full">
                            <label className="block mb-2 text-sm text-slate-600 font-medium">Description</label>
                            <textarea
                                value={form.description}
                                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950 resize-y"
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                    </div>

                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-violet) transition-all"
                        >
                            Create
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

export default ProjectDialogCreation
