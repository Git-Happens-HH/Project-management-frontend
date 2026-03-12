import type {appUser} from './types'

interface userPayload {
    userName: string,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string
}

export async function registerHandler(data:userPayload): Promise<Response> {
    const response = await fetch(api_url + '/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Error occured while creating user')
    } 
    return await response.json()
}

export async function loginHandler(): Promise<appUser>{
    const response = await fetch(api_url + '/api/login')
    if(!response.ok) {
        throw new Error('Error occured signing in')
    }
    const jsonData: appUser = await response.json()
    return jsonData;
}