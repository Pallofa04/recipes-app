import { useAuth } from '../api/AuthContext';
const { signOut } = useAuth();
<button onClick={signOut}>Cerrar sesión</button>