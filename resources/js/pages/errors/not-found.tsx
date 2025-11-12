import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangleIcon, HomeIcon, RefreshCcwIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
  { title: 'Not Found', href: '#' },
];

export default function NotFound() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Page Not Found" />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <AlertTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
          <p className="mb-6 text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
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