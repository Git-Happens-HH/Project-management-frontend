export type projectType = {
   projectId: string,
   title: string,
   description: string,
   createdAt: string,
   isShared: boolean,
}

export type appUser = {
    appUserId: string,
    userName: string,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    registeredAt: Date
}
