import { Database } from './database.types'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Profile type based on the database schema
export type Profile = Tables['profiles']['Row']