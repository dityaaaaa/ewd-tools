import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    isLoading?: boolean;
}

export function RejectionModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
}: RejectionModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Alasan penolakan wajib diisi');
            return;
        }
        onSubmit(reason);
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tolak Laporan</DialogTitle>
                    <DialogDescription>
                        Berikan alasan penolakan untuk laporan ini. Pembuat
                        laporan akan melihat alasan ini dan dapat memperbaiki
                        laporan.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Alasan Penolakan{' '}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError('');
                            }}
                            placeholder="Jelaskan alasan penolakan secara detail..."
                            rows={5}
                            disabled={isLoading}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Tolak Laporan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
