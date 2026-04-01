import type { appUser } from './types'

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
export async function loginHandler(email: string, password: string): Promise<appUser> {
	const response = await fetch("https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/users")
	if (!response.ok) {
		throw new Error('Error occured signing in')
	}
	const jsonData: appUser[] = await response.json();

	for (const user of jsonData) {
		if (user.email == email && user.passwordHash === password) {
			return user.appUserId
		}
	}
	return jsonData;
}

// Fetch all project logged in user is part of.
export async function getProjectsForUser(appUserId: string): Promise<Response> {
	const response = await fetch(`https://project-management-backend-prokress-backend.2.rahtiapp.fi/api/users/` + appUserId)
	if (!response.ok) {
		throw new Error('Error occured signing in')
	}
	const jsonData: appUser = await response.json()
	return jsonData.projects;
}
