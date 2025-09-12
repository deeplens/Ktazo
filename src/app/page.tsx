import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

function OpenBibleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
                <OpenBibleIcon className="h-8 w-8 text-primary" />
                Ktazo Weekly
                </h1>
                <p className="text-balance text-muted-foreground text-sm">Learning beyond the pulpit</p>
            </div>
            <p className="text-balance text-muted-foreground pt-4">
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
          src="https://picsum.photos/seed/new_growth/1920/1080"
          alt="A nature scene representing growth and newness."
          data-ai-hint="growth newness"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
