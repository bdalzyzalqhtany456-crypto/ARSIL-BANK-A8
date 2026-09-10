import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, useGetCurrentUser } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Admin from '@/pages/admin';
import AdminUsers from '@/pages/admin-users';
import Dashboard from '@/pages/dashboard';
import Notifications from '@/pages/notifications';
import NotFound from '@/pages/not-found';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#000000',
    colorForeground: '#000000',
    colorMutedForeground: '#666666',
    colorDanger: '#000000',
    colorBackground: '#ffffff',
    colorInput: '#ffffff',
    colorInputForeground: '#000000',
    colorNeutral: '#d4d4d4',
    fontFamily: 'IBM Plex Sans Arabic, sans-serif',
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-black/10',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: '!text-black font-bold',
    headerSubtitle: '!text-neutral-600',
    socialButtonsBlockButtonText: '!text-black',
    formFieldLabel: '!text-black',
    footerActionLink: '!text-black font-bold',
    footerActionText: '!text-neutral-600',
    dividerText: '!text-neutral-500',
    logoBox: 'mb-2',
    logoImage: 'h-10',
    socialButtonsBlockButton: '!border-black/15 !bg-white hover:!bg-neutral-50',
    formButtonPrimary: '!bg-black !text-white hover:!bg-neutral-800',
    formFieldInput: '!border-black/15 !bg-white !text-black focus:!border-black',
    footerAction: '!bg-transparent',
    dividerLine: '!bg-black/10',
    alert: '!border-black/15 !bg-neutral-50',
    alertText: '!text-black',
    main: 'bg-white',
  },
};

function Landing() {
  return (
    <main className="surface-grid flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-h-[520px] flex-col justify-between bg-black p-8 text-white sm:p-12">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black text-black">أ</span>
              <div><p className="font-display text-xl font-extrabold">أرسيل</p><p className="text-[10px] tracking-[0.24em] text-white/55" dir="ltr">ARSIL BANK</p></div>
            </div>
            <div>
              <p className="mb-4 text-sm font-bold text-white/60">نظام النقاط الموثق</p>
              <h1 className="max-w-lg font-display text-4xl font-extrabold leading-[1.15] sm:text-6xl">نقاطك، تحت سيطرتك.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">ادخل إلى لوحة أرسيل لإدارة الحوالات والأرصدة من مساحة آمنة وواضحة.</p>
            </div>
            <p className="text-xs text-white/45">تسجيل الدخول محمي بواسطة Clerk</p>
          </div>
          <div className="flex min-h-[520px] flex-col justify-center p-8 sm:p-12">
            <p className="text-sm font-bold text-muted-foreground">مرحباً بعودتك</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">ادخل إلى حسابك</h2>
             <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">استخدم بريدك للدخول إلى محفظتك، ويمنح البريد الإداري المحدد صلاحية المشرف فقط.</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/sign-in" className="flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white transition-transform hover:-translate-y-0.5" data-testid="link-sign-in">تسجيل الدخول</Link>
              <Link href="/sign-up" className="flex h-12 items-center justify-center rounded-xl border border-black/15 bg-white text-sm font-bold text-black transition-colors hover:bg-neutral-50" data-testid="link-sign-up">إنشاء حساب جديد</Link>
            </div>
             <p className="mt-6 text-center text-xs text-muted-foreground">تُحفظ بيانات الحساب والحركات بعد تسجيل الدخول الموثق.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      {mode === 'sign-in' ? (
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      ) : (
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">جارٍ التحقق من الحساب...</div>;
  if (!isSignedIn) return <Redirect to="/" />;
  return <>{children}</>;
}

function SignedInHome() {
  const { isLoaded, isSignedIn } = useAuth();
  const userQuery = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), enabled: isLoaded && Boolean(isSignedIn) },
  });
  if (!isLoaded || (isSignedIn && userQuery.isLoading)) {
    return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">جارٍ تجهيز مساحتك...</div>;
  }
  if (!isSignedIn) return <Landing />;
  return <Redirect to={userQuery.data?.role === 'admin' ? '/admin' : '/dashboard'} />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const userQuery = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), enabled: isLoaded && Boolean(isSignedIn) },
  });
  if (!isLoaded || (isSignedIn && userQuery.isLoading)) {
    return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">جارٍ التحقق من صلاحيات الحساب...</div>;
  }
  if (!isSignedIn) return <Redirect to="/" />;
  if (userQuery.data?.role !== 'admin') return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
      <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
      <Route path="/" component={SignedInHome} />
      <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/admin"><AdminRoute><AppShell><Admin /></AppShell></AdminRoute></Route>
      <Route path="/admin/users"><AdminRoute><AppShell><AdminUsers /></AppShell></AdminRoute></Route>
      <Route path="/notifications"><ProtectedRoute><AppShell><Notifications /></AppShell></ProtectedRoute></Route>
      <Route path="/settings"><ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute></Route>
      <Route><AppShell><NotFound /></AppShell></Route>
    </Switch>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  useEffect(() => addListener(({ user }) => { if (!user) client.clear(); }), [addListener, client]);
  return null;
}

function App() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'مرحباً بعودتك', subtitle: 'سجل الدخول للوصول إلى حسابك' } },
        signUp: { start: { title: 'أنشئ حسابك', subtitle: 'ابدأ استخدام أرسيل اليوم' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function RootApp() {
  return (
    <WouterRouter base={basePath}>
      <ErrorBoundary><App /></ErrorBoundary>
    </WouterRouter>
  );
}