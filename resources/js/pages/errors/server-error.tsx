import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircleIcon, HomeIcon, RefreshCcwIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
  { title: 'Error', href: '#' },
];

export default function ServerError() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Server Error" />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-muted-foreground">An unexpected error occurred. Try reloading or return home.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href={dashboard().url}>
              <Button>
                <HomeIcon className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcwIcon className="mr-2 h-4 w-4" />
              Reload
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}