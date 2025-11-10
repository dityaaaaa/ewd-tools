import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import type { DataPaginationProps, PaginationData } from '@/types';

export default function DataPagination({
    paginationData,
    className = '',
    showPerPageSelector = true,
    perPageOptions = [10, 15, 25, 50, 100],
}: DataPaginationProps) {
    // Handle null or undefined paginationData
    if (!paginationData) {
        return null;
    }

    const { current_page, last_page, prev_page_url, next_page_url, from, to, total, per_page, path } = paginationData;

    // Handle invalid pagination data
    if (!current_page || !last_page || last_page < 1) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= last_page && page !== current_page) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', page.toString());
            router.get(url.toString(), {}, { preserveState: true, preserveScroll: true });
        }
    };

    const handlePerPageChange = (newPerPage: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('per_page', newPerPage);
        url.searchParams.delete('page'); // Reset to first page when changing per_page
        router.get(url.toString(), {}, { preserveState: true, preserveScroll: true });
    };

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;

        // Additional safety check
        if (!last_page || last_page < 1) {
            return [1];
        }

        if (last_page <= maxVisiblePages) {
            // Show all pages if total pages is less than or equal to maxVisiblePages
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current_page <= 4) {
                // Show pages 2, 3, 4, 5 and ellipsis
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
            } else if (current_page >= last_page - 3) {
                // Show ellipsis and last 4 pages
                pages.push('ellipsis');
                for (let i = last_page - 4; i <= last_page - 1; i++) {
                    pages.push(i);
                }
            } else {
                // Show ellipsis, current page with neighbors, ellipsis
                pages.push('ellipsis');
                for (let i = current_page - 1; i <= current_page + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
            }

            // Always show last page (if not already included)
            if (!pages.includes(last_page)) {
                pages.push(last_page);
            }
        }

        return pages;
    };

    if (last_page <= 1) {
        return null; // Don't show pagination if there's only one page
    }

    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            {/* Results info */}
            <div className="text-sm text-muted-foreground">
                Showing {from || 0} to {to || 0} of {total || 0} results
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Per page selector */}
                {showPerPageSelector && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
                        <Select value={(per_page || 15).toString()} onValueChange={handlePerPageChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {perPageOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">per page</span>
                    </div>
                )}

                {/* Pagination controls */}
                <Pagination>
                    <PaginationContent>
                        {/* Previous button */}
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(current_page - 1)}
                                size="default"
                                className={!prev_page_url ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'}
                            />
                        </PaginationItem>

                        {/* Page numbers */}
                        {generatePageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                                {page === 'ellipsis' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        onClick={() => handlePageChange(page as number)}
                                        isActive={page === current_page}
                                        size="default"
                                        className="cursor-pointer hover:bg-accent"
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {/* Next button */}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(current_page + 1)}
                                size="default"
                                className={!next_page_url ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
