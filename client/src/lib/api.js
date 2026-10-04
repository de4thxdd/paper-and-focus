import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('diary_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function request(promise) {
  try { return (await promise).data }
  catch (err) { throw new Error(err.response?.data?.error || 'Something went wrong') }
}
