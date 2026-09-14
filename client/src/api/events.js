import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const API_URL = `${BASE_URL}/api/events`

const getAuthConfig = () => {
  return {
    withCredentials: true,
  }
}

export const fetchEvents = async () => {
  const { data } = await axios.get(API_URL, getAuthConfig())
  return data
}

export const fetchEventById = async (id) => {
  const { data } = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  )
  return data
}

export const createEvent = async (event) => {
  const { data } = await axios.post(
    API_URL,
    event,
    getAuthConfig()
  )
  return data
}

export const updateEvent = async (id, event) => {
  const { data } = await axios.put(
    `${API_URL}/${id}`,
    event,
    getAuthConfig()
  )
  return data
}

export const deleteEvent = async (id) => {
  const { data } = await axios.delete(
    `${API_URL}/${id}`,
    getAuthConfig()
  )
  return data
}

export const registerForEvent = async (id) => {
  const { data } = await axios.post(
    `${API_URL}/${id}/register`,
    {},
    getAuthConfig()
  )
  return data
}

export const unregisterFromEvent = async (id) => {
  const { data } = await axios.post(
    `${API_URL}/${id}/unregister`,
    {},
    getAuthConfig()
  )
  return data
}