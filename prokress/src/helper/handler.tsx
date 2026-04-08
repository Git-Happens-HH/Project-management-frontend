import type { appUser } from './types'
import { useJwt } from "react-jwt"

interface userPayload {
    userName: string,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string
}

// Function for sending new Users registerations into backend.
export async function registerHandler(data: userPayload): Promise<Response> {
    const response = await fetch("https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/users", {
        //const response = await fetch(api_url + '/api/register', {
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

// Funtion for getting all users.
export async function loginHandler(email: string, password: string): Promise<string> {
    // --OLD loginHandling
    //const response = await fetch("https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/users")
    //if (!response.ok) {
    //	throw new Error('Error occured signing in')
    //}
    //const jsonData: appUser[] = await response.json();
    //console.log(password)
    //for (const user of jsonData) {
    //	if (user.email == email) {
    //		return user
    //        //localStorage.setItem('appUser', JSON.stringify(user))
    //	}
    //}
    // --Login handling with
    try {
        const response = await fetch("http://localhost:8080/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email.trim(), passwordHash: password.trim() })
        });
        if (!response.ok) {
            throw new Error('Error occured while creating user')
        }
        const tokenData = await response.text();
        console.log(tokenData)
        return tokenData;
    } catch (error) {
        console.error('Error fetching token: ', error);
        throw error;
    }
}

// Fetch all project logged in user is part of.
export async function getProjectsForUser(token: string): Promise<Response> {
    const response = await fetch(`https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/projects/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    if (!response.ok) {
        throw new Error('Error occured fetching projects')
    }
    const jsonData = await response.json()
    return jsonData;
}

// decoder for userWebToken
export async function decodeUserWebToken(token: string) {
    const { decodedToken, isExpired } = useJwt(token);
    return { decodedToken, isExpired }
}
