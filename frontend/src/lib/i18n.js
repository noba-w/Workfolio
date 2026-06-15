export const translations = {
  es: {
    // ── login ──────────────────────────────────────────────
    taglineLogin: "Bienvenido de vuelta.",
    taglineRegister: "Crea tu cuenta.",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    email: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    confirmEmail: "Confirmar correo",
    confirmEmailPlaceholder: "Repite tu correo",
    password: "Contraseña",
    passwordPlaceholder: "••••••••",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Repite tu contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    submitLogin: "Iniciar sesión",
    submitRegister: "Crear cuenta",
    noAccount: "¿No tienes cuenta?",
    signUp: "Regístrate",
    haveAccount: "¿Ya tienes cuenta?",
    signIn: "Inicia sesión",
    errorEmailMismatch: "Los correos electrónicos no coinciden.",
    errorPasswordMismatch: "Las contraseñas no coinciden.",
    errorPasswordShort: "La contraseña debe tener al menos 6 caracteres.",
    errRateLimit: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    errInvalidCredentials: "Correo o contraseña incorrectos.",
    errAlreadyRegistered: "Ya existe una cuenta con ese correo.",
    errGeneric: "Ha ocurrido un error. Inténtalo de nuevo.",

    // ── nav ────────────────────────────────────────────────
    navHome: "Inicio",
    navClients: "Clientes",
    navProjects: "Proyectos",
    navIncome: "Ingresos",

    // ── dashboard ──────────────────────────────────────────
    welcome: "Bienvenido",
    comingSoon: "Próximamente.",

    // ── pages ──────────────────────────────────────────────
    pageClients: "Clientes",
    pageProjects: "Proyectos",
    pageIncome: "Ingresos",

    // ── clients ────────────────────────────────────────────
    clientsSearchPlaceholder: "Buscar por nombre o empresa…",
    clientsAddButton: "Añadir cliente",
    clientsEmpty: "No hay clientes.",
    clientsNoResults: "Sin resultados para esa búsqueda.",

    // ── settings ───────────────────────────────────────────
    settingsTitle: "Ajustes",
    settingsAccount: "Cuenta",
    settingsLogout: "Cerrar sesión",
  },
  en: {
    // ── login ──────────────────────────────────────────────
    taglineLogin: "Welcome back.",
    taglineRegister: "Create your account.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    confirmEmail: "Confirm email",
    confirmEmailPlaceholder: "Repeat your email",
    password: "Password",
    passwordPlaceholder: "••••••••",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    forgotPassword: "Forgot password?",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    errorEmailMismatch: "Emails don't match.",
    errorPasswordMismatch: "Passwords don't match.",
    errorPasswordShort: "Password must be at least 6 characters.",
    errRateLimit: "Too many attempts. Please wait a moment and try again.",
    errInvalidCredentials: "Invalid email or password.",
    errAlreadyRegistered: "An account with this email already exists.",
    errGeneric: "Something went wrong. Please try again.",

    // ── nav ────────────────────────────────────────────────
    navHome: "Home",
    navClients: "Clients",
    navProjects: "Projects",
    navIncome: "Income",

    // ── dashboard ──────────────────────────────────────────
    welcome: "Welcome",
    comingSoon: "Coming soon.",

    // ── pages ──────────────────────────────────────────────
    pageClients: "Clients",
    pageProjects: "Projects",
    pageIncome: "Income",

    // ── clients ────────────────────────────────────────────
    clientsSearchPlaceholder: "Search by name or company…",
    clientsAddButton: "Add client",
    clientsEmpty: "No clients yet.",
    clientsNoResults: "No results for that search.",

    // ── settings ───────────────────────────────────────────
    settingsTitle: "Settings",
    settingsAccount: "Account",
    settingsLogout: "Log out",
  },
};

export function translateServerError(message, t) {
  const m = message.toLowerCase();
  if (m.includes("rate limit")) return t.errRateLimit;
  if (m.includes("invalid credentials") || m.includes("invalid login")) return t.errInvalidCredentials;
  if (m.includes("already registered") || m.includes("user already")) return t.errAlreadyRegistered;
  return t.errGeneric;
}
