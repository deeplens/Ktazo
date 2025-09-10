import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M11 18a7 7 0 1 1 4.59-13.41" />
      <path d="M18 11.01V21" />
      <path d="M21 18h-6" />
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
              <CrossIcon className="h-8 w-8 text-primary" />
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
