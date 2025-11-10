import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import divisions from "@/routes/divisions";
import { BreadcrumbItem } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "react-toastify";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: dashboard().url
    },
    {
        title: "Divisi",
        href: divisions.index().url
    },
    {
        title: "Tambah Divisi",
        href: divisions.create().url
    }
];

export default function DivisionCreate() {
    const defaultValues = { code: "", name: "" };
    const { data, setData, post, reset, processing, errors, isDirty } = useForm(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(divisions.store().url, {
            onSuccess: () => {
                toast.success("Divisi berhasil ditambahkan.");
                router.visit(divisions.index().url, {
                    preserveScroll: true,
                });
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                })
            },
        })
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Divisi" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">Tambah Divisi</CardTitle>
                            <Link href={divisions.index().url}>
                                <Button variant={"outline"}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Kode Divisi</Label>
                                    <Input 
                                        id="code" 
                                        value={data.code} 
                                        onChange={(e) => setData("code", e.target.value)}
                                        placeholder="Masukkan kode divisi"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Divisi</Label>
                                    <Input 
                                        id="name" 
                                        value={data.name} 
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Masukkan nama divisi"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-4">
                                {isDirty && (
                                    <Button
                                        type="button"
                                        variant={"outline"}
                                        onClick={() => reset()}
                                    >
                                        Reset
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={!isDirty || processing}
                                >
                                    Simpan
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}