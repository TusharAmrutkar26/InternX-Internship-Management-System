import { api } from '../api/client'
export const getAnalytics=()=>api('/analytics/overview')
