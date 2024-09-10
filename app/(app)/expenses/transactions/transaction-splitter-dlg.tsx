"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExpenseTransactionWithAccount } from "./columns";
import { Icons } from "@/components/shared/icons";
import { Row } from "@tanstack/react-table";
import { useState } from "react";

interface CompProps {
  row: Row<Partial<ExpenseTransactionWithAccount>>;
  onSave?: (splits: number[]) => void;
}
export function TransactionAmountSplitter({ row, onSave }: CompProps) {
  const amount = row.original.amount || 0.1;
  const [splits, setSplits] = useState<number[]>([amount, 0]);
  const remaining = calculateRemaining(splits, amount);

  if (!row.original.amount || row.original.amount <= 0.0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="size-8 p-2"
          title="Split Transaction"
        >
          <Icons.split className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Split Transaction
              <span className="text-muted-foreground text-sm">
                ( Total: {row.original.amount} )
              </span>
            </h4>
          </div>
          <div className="grid gap-2">
            {splits.map((split, idx) => (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`split-${row.id}-${idx}`}>Split {idx}</Label>
                <Input
                  id={`split-${row.id}-${idx}`}
                  type="number"
                  inputMode="decimal"
                  value={split}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    const newSplits = [...splits];
                    newSplits[idx] = val;
                    setSplits(newSplits);
                  }}
                  className="col-span-2 h-8"
                />
                <div className="flex flex-row">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={remaining <= 0.0}
                    onClick={() => {
                      setSplits([
                        ...splits.slice(0, idx + 1),
                        remaining,
                        ...splits.slice(idx + 1),
                      ]);
                    }}
                  >
                    <Icons.add className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={splits.length === 1 && splits.length === idx + 1}
                    onClick={() => {
                      const newSplits = splits.filter((_, i) => i !== idx);
                      setSplits(newSplits);
                    }}
                  >
                    <Icons.close className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remaining">Remaining</Label>
              <Input
                id={`split-${row.id}-remaining`}
                value={Number(remaining).toFixed(2)}
                readOnly
                className="col-span-2 h-8"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={!isValidSplits(splits, amount) || !onSave}
                onClick={() => onSave && onSave(splits)}
              >
                <Icons.save className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const calculateRemaining = (splits: number[], total: number) =>
  total - splits.reduce((acc, split) => acc + split, 0);

const isValidSplits = (splits: number[], total: number) =>
  splits.filter((s) => s !== 0.0).reduce((acc, split) => acc + split, 0) ===
  total;
