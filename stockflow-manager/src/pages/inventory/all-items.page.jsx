"use client";

import { useState, useEffect } from "react";
import { useGetAllPurchaseEntriesQuery, useGetAllIssuesQuery } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("partNumber");
  const {
    data: purchaseEntries = [],
    error: purchaseError,
    isLoading: isPurchasesLoading,
  } = useGetAllPurchaseEntriesQuery();
  const {
    data: issues = [],
    error: issuesError,
    isLoading: isIssuesLoading,
  } = useGetAllIssuesQuery();

  // Aggregate inventory data
  const [inventoryData, setInventoryData] = useState([]);
  useEffect(() => {
    if (purchaseError || issuesError) return;
    if (isPurchasesLoading || isIssuesLoading) return;

    const purchases = purchaseEntries.flatMap((entry) =>
      entry.items.map((item) => ({
        ...item,
        poNumber: entry.poNumber,
        purchaseDate: entry.purchaseDate,
        transactionType: "purchase",
        issueDate: null,
        projectName: null,
      }))
    );

    const issuesData = issues.flatMap((issue) =>
      issue.projects.map((proj) => ({
        partNumber: issue.partNumber,
        makeCompany: purchases.find((p) => p.partNumber === issue.partNumber)?.makeCompany || "N/A",
        purchaseDate: purchases.find((p) => p.partNumber === issue.partNumber)?.purchaseDate || null,
        quantity: -proj.quantity, // Store as negative for issues
        unit: purchases.find((p) => p.partNumber === issue.partNumber)?.unit || "N/A",
        unitPrice: purchases.find((p) => p.partNumber === issue.partNumber)?.unitPrice || 0,
        poNumber: issue.poNumber,
        transactionType: "issue",
        issueDate: issue.dateIssued,
        projectName: proj.projectName,
      }))
    );

    const allTransactions = [...purchases, ...issuesData].sort((a, b) => new Date(a.purchaseDate || b.issueDate) - new Date(b.purchaseDate || a.issueDate));
    setInventoryData(allTransactions);
  }, [purchaseEntries, issues, purchaseError, issuesError, isPurchasesLoading, isIssuesLoading]);

  // Filter inventory data
  const filteredInventory = inventoryData.filter((item) => {
    if (filterType === "partNumber") {
      return item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (filterType === "poNumber") {
      return item.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (filterType === "makeCompany") {
      return item.makeCompany.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Calculate running stock
  const calculateRunningStock = (items) => {
    let stock = 0;
    return items.map((item, index) => {
      // Add quantity for purchases, subtract absolute value for issues
      stock += item.transactionType === "purchase" ? item.quantity : -Math.abs(item.quantity);
      return { ...item, runningStock: stock };
    });
  };

  const displayedInventory = calculateRunningStock(filteredInventory);

  const handleRefresh = () => {
    refetchPurchases();
    refetchIssues();
  };

  if (isPurchasesLoading || isIssuesLoading) return <div>Loading...</div>;
  if (purchaseError || issuesError) return <div>Error loading data: {(purchaseError || issuesError)?.message}</div>;

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">Inventory Management</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partNumber">Part Number</SelectItem>
                <SelectItem value="poNumber">PO Number</SelectItem>
                <SelectItem value="makeCompany">Make Company</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${filterType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="border-b p-2 text-left font-semibold">Part Number</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Make Company</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Purchase Date</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">PO Number</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Unit</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Quantity</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Unit Price</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Transaction Type</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Issue Date</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Project Name</TableHead>
                  <TableHead className="border-b p-2 text-left font-semibold">Running Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedInventory.map((item, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="border-b p-2">{item.partNumber}</TableCell>
                    <TableCell className="border-b p-2">{item.makeCompany}</TableCell>
                    <TableCell className="border-b p-2">
                      {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="border-b p-2">{item.poNumber}</TableCell>
                    <TableCell className="border-b p-2">{item.unit}</TableCell>
                    <TableCell className="border-b p-2">
                      {Math.abs(item.quantity)} {/* Display absolute value */}
                    </TableCell>
                    <TableCell className="border-b p-2">{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="border-b p-2">{item.transactionType}</TableCell>
                    <TableCell className="border-b p-2">
                      {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="border-b p-2">{item.projectName || "N/A"}</TableCell>
                    <TableCell className="border-b p-2 font-medium">{item.runningStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}