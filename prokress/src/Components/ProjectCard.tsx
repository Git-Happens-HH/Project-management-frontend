import { useState } from 'react';
import { deleteProject } from '../helper/handler';
import type { projectType } from '../helper/types'

type projectCardProps = {
    project: projectType;
    index: number;
}

function ProjectCard({ project, index }: projectCardProps) {
    return (
        <div className="flex flex-col">
            <a href={`/project/${project.projectId}`}>
                <div id={index.toString()} className="w-80 h-55 rounded-lg mt-4 m-2 p-2 bg-(--prokress-beige-0) text-(--prokress-black-700) shadow-md grid content-between gap-4">
                    <p className="text-2xl">{project.title}</p>
                    <div>
                        <p>{project.description}</p>
                        <p>{project.createdAt}</p>
                    </div>
                </div>
            </a>
        </div>
    )
}
export default ProjectCard
