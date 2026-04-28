import TaskList from "../Components/TaskList.tsx";
import Task from "../Components/Task.tsx";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    createNewTasklist,
    deleteTasklist,
    transformTaskLists,
} from "../helper/handler.tsx";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import TaskDialog from "../Components/TaskDialog.tsx";

interface TaskList {
    taskListId: number;
    projectId: string;
    title: string;
    tasks: string[];
}

type TaskListsState = Record<string, TaskList>;

function ProjectPage() {
    let { id } = useParams<{ id: string }>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [taskListId, setTaskListId] = useState<number>();
    const [projectId, setProjectId] = useState<string>();

    let stompClient = useRef<Client | null>(null);
    let subscription = useRef<StompSubscription | null>(null);
    const [taskLists, setTaskLists] = useState<TaskListsState>({});

    const newTaskList = () => {
        const token = localStorage.getItem("token");
        let taskListTitle = prompt("New TaskList title", "TODO");
        if (token && id && taskListTitle) {
            createNewTasklist(token, id, taskListTitle);
        }
    };

    const deleteTaskList = (taskListId: number) => {
        const token = localStorage.getItem("token");
        if (token && id) {
            if (confirm("Do you really want to delete!")) {
                deleteTasklist(token, id, taskListId);
            }
        }
    };

    const openProject = async (projectId: string) => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch(
            `https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/projects/${projectId}/tasklists`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer: ${token}`,
                },
            },
        );
        const data = await res.json();
        const transformed: TaskListsState = transformTaskLists(data);
        setTaskLists(transformed);

        if (!stompClient.current) {
            const socket = new SockJS(
                "https://project-management-backend-prokress-backend.2.rahtiapp.fi/ws",
            );

            const client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => console.log(str),
                onConnect: () => {
                    subscribeToProject(projectId);
                },
                onStompError: (frame) => {
                    console.error(frame);
                },
            });

            client.activate();
            stompClient.current = client;
        } else {
            subscribeToProject(projectId);
        }
    };

    function subscribeToProject(projectId: string) {
        if (!stompClient.current) return;

        subscription.current?.unsubscribe();

        subscription.current = stompClient.current.subscribe(
            `/topic/project/${projectId}`,
            (msg: IMessage) => {
                const transformed: TaskListsState = transformTaskLists(
                    JSON.parse(msg.body),
                );
                setTaskLists(transformed);
            },
        );
    }
    useEffect(() => {
        if (id) {
            openProject(id);
        }
        return () => {
            subscription.current?.unsubscribe();
            stompClient.current?.deactivate();
        };
    }, [id]);

    return (
        <div className="flex flex-col min-h-screen items-center bg-(--prokress-beige-100)">
            <div
                id="projectButtons"
                className="flex flex-row h-20 w-[75%] p-2 items-center justify-between"
            >
                <div className="flex frex-row gap-2">
                    <a
                        href="/projects"
                        className="w-14 bg-(--prokress-violet) hover:bg-(--prokress-orange) text-white font-bold py-2 px-4 rounded"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#e3e3e3"
                        >
                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                    </a>
                    <button
                        onClick={newTaskList}
                        className="w-20 bg-(--prokress-violet) hover:bg-(--prokress-orange) text-white font-bold py-2 px-4 rounded"
                    >
                        Add
                    </button>
                </div>
                <button className="border-2 rounded-full w-14 h-14 px-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#000000"
                    >
                        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
                    </svg>
                </button>
            </div>
            <div
                id="taskListContainer"
                className="flex min-h-[70%] w-[76%] gap-2 p-3 overflow-auto bg-(--prokress-beige-50) rounded-2xl shadow"
            >
                {Object.entries(taskLists).map(([column, taskList]) => (
                    <TaskList key={column} id={column}>
                        {taskList.tasks.map((id, index) => (
                            <Task key={id} id={id} index={index} column={column} />
                        ))}
                        <div className="absolute top-[88%] flex flex-row gap-2">
                            <div
                                onClick={() => {
                                    deleteTaskList(taskList.taskListId);
                                }}
                                className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-red-500"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#e3e3e3"
                                >
                                    <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
                                </svg>
                            </div>
                            <div
                                onClick={() => {
                                    setIsDialogOpen(true);
                                    setTaskListId(taskList.taskListId);
                                    setProjectId(id)
                                }}
                                className=" text-white font-bold py-2 px-2 rounded-full w-10 h-10 bg-(--prokress-black-500) hover:bg-red-500"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#fff"
                                >
                                    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                                </svg>{" "}
                            </div>
                        </div>
                    </TaskList>
                ))}
            </div>

            <TaskDialog
                isOpen={isDialogOpen}
                taskListId={taskListId}
                toggleDialog={() => setIsDialogOpen(false)}
                projectId={projectId}
            />
        </div>
    );
}

export default ProjectPage;
