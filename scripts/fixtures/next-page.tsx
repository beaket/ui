import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Blockquote } from "@/components/ui/blockquote";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableTable,
} from "@/components/ui/data-table";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Navigation,
  NavigationItem,
  NavigationLink,
  NavigationList,
} from "@/components/ui/navigation";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { Pagination, PaginationItem } from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Deliberately a server page: wrapping this page in "use client" hides RSC failures.
export default function Page() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-8">
      <h1>Every registry component in a server page</h1>
      <Alert>
        <AlertTitle>Ready</AlertTitle>
        <AlertDescription>Server-rendered components</AlertDescription>
      </Alert>
      <Avatar>
        <AvatarFallback>BK</AvatarFallback>
      </Avatar>
      <Badge>Preview</Badge>
      <Blockquote author="Beaket">Own your components.</Blockquote>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button>Server page button</Button>
      <Card>
        <CardHeader>
          <CardTitle>Card</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
      <Checkbox aria-label="Accept terms" />
      <DataTable columns={[{ accessorKey: "name", header: "Name" }]} data={[{ name: "Beaket" }]}>
        <DataTableTable>
          <DataTableHead />
          <DataTableBody />
        </DataTableTable>
      </DataTable>
      <Dialog trigger={<Button>Open dialog</Button>}>
        <DialogTitle>Dialog</DialogTitle>
        <DialogDescription>Dialog description</DialogDescription>
        <DialogClose>
          <Button>Done</Button>
        </DialogClose>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </div>
      <Navigation value="/">
        <NavigationList>
          <NavigationItem>
            <NavigationLink href="/" value="/">
              Home
            </NavigationLink>
          </NavigationItem>
        </NavigationList>
      </Navigation>
      <NavigationProgress active aria-label="Loading navigation" />
      <Pagination page={1} totalPages={2}>
        <PaginationItem page={1} asChild>
          <a href="?page=1">1</a>
        </PaginationItem>
        <PaginationItem page={2} asChild>
          <a href="?page=2">2</a>
        </PaginationItem>
      </Pagination>
      <RadioGroup defaultValue="one" aria-label="Choice">
        <RadioGroupItem value="one" aria-label="One" />
        <RadioGroupItem value="two" aria-label="Two" />
      </RadioGroup>
      <Select defaultValue="one">
        <SelectTrigger aria-label="Choose">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>
      <Separator />
      <Sheet trigger={<Button>Open sheet</Button>}>
        <SheetTitle>Sheet</SheetTitle>
        <SheetDescription>Sheet description</SheetDescription>
        <SheetClose>
          <Button>Done</Button>
        </SheetClose>
      </Sheet>
      <Skeleton className="h-4 w-32" />
      <Switch aria-label="Notifications" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Beaket</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">First tab</TabsTrigger>
          <TabsTrigger value="two">Second tab</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
      <Textarea aria-label="Notes" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Tooltip trigger</Button>
          </TooltipTrigger>
          <TooltipContent>Helpful text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </main>
  );
}
