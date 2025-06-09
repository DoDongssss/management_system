import { useState, useMemo, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import clsx from "clsx";

import AppLayout from "@/layouts/app-layout";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectItem, SelectContent,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Pencil, Trash } from "lucide-react";

import ShowBooking from "./showBooking";

import { type BreadcrumbItem } from "@/types";
import { type Tenant, TenantPaginatedResponse } from "@/types/tenant";

// import CreateUpdate from "./createUpdate";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Tenant", href: "/tenant" }];
const statuses = [
  { value: "all", label: "All" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const emptyTenant: Tenant = {
  id: null,
  name: "",
  contact: "",
  address: "",
  is_active: 1,
};

interface Props {
  tenants: TenantPaginatedResponse;
  sort?: string;
  direction?: "asc" | "desc";
  search?: string;
  activeStatus?: string | boolean | number;
}

export default function Index({ tenants, sort = "id", direction = "desc", search = "", activeStatus }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState("all");
  const [tenantToUpdate, setTenantToUpdate] = useState<Tenant>(emptyTenant);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    router.get("/tenant", { search: debouncedSearch, sort, direction, status }, { preserveState: true, replace: true });
  }, [debouncedSearch, sort, direction, status]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredTenants = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    const items = Array.isArray(tenants?.data) ? tenants.data : [];

    return items.filter(({ name, contact }) =>
      [name, contact].some(
        (field) => typeof field === "string" && field.toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [search, tenants]);

  const handleSort = (column: string) => {
    const newDirection = sort === column && direction === "asc" ? "desc" : "asc";
    router.get("/tenant", { sort: column, direction: newDirection }, { preserveState: true });
  };

  const handleDelete = (id: any) => {
    router.delete(`/tenant/${id}`, {
      onSuccess: () => toast.success("Tenant deleted successfully!"),
      onError: (error) => {
        console.error("Error deleting tenant:", error);
        toast.error("Failed to delete tenant. Please try again.");
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tenant" />
      <div className="flex flex-1 flex-col gap-3 p-6 items-center">
        <div className="flex justify-between items-center mb-3 w-full">
          <div className="flex items-center gap-2 min-w-[420px]">
            <Input
              type="text"
              placeholder="Search tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setIsModalOpen(true); setTenantToUpdate(emptyTenant); }} variant="default">
            Create Tenant
          </Button>
        </div>

        {filteredTenants.length > 0 ? (
          <div className="overflow-hidden border border-blue-700 rounded-lg w-full">
            <Table className="w-full">
              <TableHeader className="border-b bg-blue-700 group">
                <TableRow>
                  <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">ID</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Name</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Contact</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Address</TableHead>
                  <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Is Active</TableHead>
                  <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="px-4 py-1 text-center">{tenant.id}</TableCell>
                    <TableCell className="px-4 py-1">{tenant.name}</TableCell>
                    <TableCell className="px-4 py-1">{tenant.contact}</TableCell>
                    <TableCell className="px-4 py-1">{tenant.address ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1 text-center">
                      <span className={clsx("px-2 py-1 rounded text-xs font-medium", tenant.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {tenant.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1 flex justify-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => { setSelectedTenant(tenant); setIsBookingDialogOpen(true); }}>
                        <Calendar size={14} className="text-blue-700"/>
                      </Button>
                      {/* <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash size={14} className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Tenant Delete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{tenant.name} (ID: {tenant.id})</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tenant.id)}>Confirm</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No tenants found.</p>
        )}

        <div className="flex justify-end w-full">
          {(tenants?.links?.length || 0) > 0 && (
            <div className="flex justify-end mt-3 space-x-2">
              {tenants.links.map(({ url, label, active }, index) =>
                url && (
                  <Button key={index} variant={active ? "default" : "outline"} className="px-4 rounded-md text-xs" onClick={() => router.get(url)}>
                    {label?.replace("&laquo;", "«").replace("&raquo;", "»")}
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <ShowBooking
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        tenant={selectedTenant}
      />
      
    </AppLayout>
  );
}
