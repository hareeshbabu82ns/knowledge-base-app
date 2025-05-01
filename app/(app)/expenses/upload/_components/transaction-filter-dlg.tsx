"use client";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Prisma } from "@/app/generated/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigAddTagForm from "../../accounts/_components/config-add-tag-form";
import ConfigAddIgnoreForm from "../../accounts/_components/config-add-ignore-form";
import AccountTagFieldsTable from "../../accounts/_components/config-tags-table";
import AccountIgnoreFieldsTable from "../../accounts/_components/config-ignore-fields-table";
import TagsTable from "../../accounts/_components/tags-table";

interface TransactionFilterDlgProps {
  rowData: Prisma.ExpenseTransactionCreateManyInput;
}

export function TransactionFilterDlg( { rowData }: TransactionFilterDlgProps ) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.add className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Add Filters</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="tagFilters">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tagFilters">Tag Filter</TabsTrigger>
            <TabsTrigger value="ignoreScope">Ignore Scope</TabsTrigger>
            <TabsTrigger value="configTags">Config Tags</TabsTrigger>
            <TabsTrigger value="configIgnore">Config Ignores</TabsTrigger>
            <TabsTrigger value="tagsTable">Tags Table</TabsTrigger>
          </TabsList>
          <TabsContent value="tagFilters" className="min-h-[400px]">
            <Card className="border-0">
              <CardContent className="space-y-2">
                <ConfigAddTagForm rowData={rowData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ignoreScope" className="min-h-[400px]">
            <Card className="border-0">
              <CardContent className="space-y-2">
                <ConfigAddIgnoreForm rowData={rowData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="configTags" className="min-h-[400px]">
            <Card className="border-0">
              <CardContent>
                <AccountTagFieldsTable accountId={rowData.account} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="configIgnore" className="min-h-[400px]">
            <Card className="border-0">
              <CardContent>
                <AccountIgnoreFieldsTable accountId={rowData.account} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tagsTable" className="min-h-[400px]">
            <Card className="border-0">
              <CardContent>
                <TagsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
