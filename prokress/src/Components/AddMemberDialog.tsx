import React, { useState, type SubmitEvent } from 'react'
import { searchUsers, addMemberToProject } from '../helper/handler'
import type { AppUserSummary } from '../helper/types'


// interface ProjectPayload {
//     name: string
//     description?: string | undefined
// }

interface Props {
    isOpen: boolean
    projectId: string | undefined
    toggleDialog: () => void
    onMemberAdded?: () => Promise<void> | void
    //onCreate: (payload: ProjectPayload) => Promise<void> | void
}

const AddMemberDialog: React.FC<Props> = ({ isOpen, projectId, toggleDialog, onMemberAdded }) => {
    // const [form, setForm] = useState<ProjectPayload>({ name: "", description: "" })
    const [username, setUsername] = useState<string>("")
    const [searchResults, setSearchResults] = useState<AppUserSummary[]>([])
    if (!isOpen) return null

    const handleSearch = async (e: SubmitEvent) => {
        try {
            e.preventDefault()
            const results = await searchUsers(username.trim())
            setSearchResults(results)
            if (results.length === 0) {
                alert("No users found");
            }
        } catch (err) {
            console.error('Search failed', err)
        }
    }

    const addMember = async (user: AppUserSummary ) => {
        const userId = user.appUserId;
        if (!projectId) {
            console.error('Project ID is undefined');
            return;
        }

        try {
            await addMemberToProject(projectId, userId.toString());
            await onMemberAdded?.();
        } catch (err) {
            console.error('Failed to add member', err);
            alert('Could not add member to project');
        }
    }

    if (!projectId) {
        console.error("Missing projectId");
        return null;
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
                        <div max-h-1="true" >
                            <ul role="list" className="divide-y divide-slate-200/70">
                            {(searchResults).map((user: AppUserSummary) => {
                            return (
                                <li
                                            key={user.appUserId}
                                            className="px-4 py-3 hover:bg-(--prokress-beige-50) transition-colors duration-150"
                                        >
                                            <div className="flex items-center justify-between gap-3">  
                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--prokress-violet)/10 text-(--prokress-violet)">
                                                    {user.firstName?.[0] ?? "?"}
                                                    {user.lastName?.[0] ?? ""}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-(--prokress-black-700)">
                                                        {user.username}
                                                    </p>
                                                    <p className="text-sm font-semibold text-(--prokress-black-700)">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        {user.email}
                                                    </p>

                                                    </div>
                                                </div>

                                            <button
                                                type="button"
                                                onClick={() => addMember(user)}
                                                className="ml-auto flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
                                                >
                                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                                </button>

                                    </div>
                                </li>
                                );
                                })}
                            </ul>
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
