import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

function SermonSeedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-8" />
      <path d="M6 14h12" />
      <path d="M12 14a6 6 0 0 0 6-6V6a6 6 0 0 0-12 0v2a6 6 0 0 0 6 6Z" />
      <circle cx="8" cy="7" r="1" fill="currentColor" />
      <circle cx="16" cy="7" r="1" fill="currentColor" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
              <SermonSeedIcon className="h-8 w-8 text-primary" />
              Ktazo Weekly
            </h1>
            <p className="text-balance text-muted-foreground">
              Sign in to your congregation's account
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="#" className="underline">
              Contact your administrator
            </a>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/ktazo1/1920/1080"
          alt="Abstract image representing community and faith"
          data-ai-hint="abstract spiritual"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
