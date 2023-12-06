import type { User } from '@supabase/supabase-js'

export const useUsername = (user?: User | null) => {
	if (user && user.user_metadata) {
		if (user.user_metadata.user_name) return user.user_metadata.user_name
		if (user.user_metadata.nickname) return user.user_metadata.nickname
		if (user.user_metadata.custom_claims.global_name) return user.user_metadata.custom_claims.global_name
	}
}