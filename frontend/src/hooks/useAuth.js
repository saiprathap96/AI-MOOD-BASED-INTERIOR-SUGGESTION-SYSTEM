import { useContext } from 'react';
import { AuthContext } from '../App';

/**
 * useAuth — access the current authenticated user and logout handler
 * from any component inside the app.
 *
 * Returns: { authUser, handleLogout }
 *   authUser  — { username, role } or null if unauthenticated
 *   handleLogout — function to log the user out
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Gracefully return null values when called outside AuthContext
    // (e.g. on the Login page where AuthContext is not provided)
    return { authUser: null, handleLogout: () => {} };
  }
  return context;
}
