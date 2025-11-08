"use client";

import { useState, useEffect } from "react";
import { useGetAllPurchaseEntriesQuery, useGetAllIssuesQuery, useGetAllOpeningStockQuery } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Download, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CSVLink } from "react-csv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Autosuggest from "react-autosuggest";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedParts, setExpandedParts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: purchaseEntries = [],
    error: purchaseError,
    isLoading: isPurchasesLoading,
    refetch: refetchPurchases,
  } = useGetAllPurchaseEntriesQuery();
  const {
    data: issues = [],
    error: issuesError,
    isLoading: isIssuesLoading,
    refetch: refetchIssues,
  } = useGetAllIssuesQuery();
  const {
    data: openingStock = [],
    error: openingStockError,
    isLoading: isOpeningStockLoading,
    refetch: refetchOpeningStock,
  } = useGetAllOpeningStockQuery();

  // Aggregate inventory data
  const [summaryData, setSummaryData] = useState([]);
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    if (purchaseError || issuesError || openingStockError) return;
    if (isPurchasesLoading || isIssuesLoading || isOpeningStockLoading) return;

    // Process opening stock
    const openingStockData = openingStock.map((entry) => ({
      partNumber: entry.partNumber,
      makeCompany: entry.makeCompany,
      quantity: entry.quantity,
      unit: entry.unit,
      unitPrice: entry.unitPrice,
      poNumber: `OPENING-${entry._id}`,
      transactionType: "opening",
    }));

    // Process purchases
    const purchases = purchaseEntries.flatMap((entry) =>
      entry.items.map((item) => ({
        partNumber: item.partNumber,
        makeCompany: item.makeCompany,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        poNumber: entry.poNumber,
        transactionType: "purchase",
      }))
    );

    // Process issues
    const issuesData = issues.flatMap((issue) =>
      issue.projects.map((proj) => {
        const matchingPurchase = purchases.find(
          (p) => p.partNumber === issue.partNumber && p.poNumber === issue.poNumber
        );
        const matchingOpeningStock = openingStockData.find(
          (o) => o.partNumber === issue.partNumber && o.poNumber === issue.poNumber
        );
        return {
          partNumber: issue.partNumber,
          makeCompany: matchingPurchase?.makeCompany || matchingOpeningStock?.makeCompany || "N/A",
          quantity: -proj.quantity,
          unit: matchingPurchase?.unit || matchingOpeningStock?.unit || "N/A",
          unitPrice: matchingPurchase?.unitPrice || matchingOpeningStock?.unitPrice || 0,
          poNumber: issue.poNumber,
          transactionType: "issue",
        };
      })
    );

    // Prepare search data for autosuggest
    const searchItems = [
      ...new Set([
        ...openingStockData.map((o) => ({ type: "partNumber", value: o.partNumber })),
        ...purchases.map((p) => ({ type: "partNumber", value: p.partNumber })),
        ...openingStockData.map((o) => ({ type: "makeCompany", value: o.makeCompany })),
        ...purchases.map((p) => ({ type: "makeCompany", value: p.makeCompany })),
      ]),
    ].filter((item) => item.value && item.value !== "N/A");
    setSearchData(searchItems);

    // Combine and aggregate by partNumber and makeCompany
    const partCompanySummary = {};
    const allTransactions = [...openingStockData, ...purchases, ...issuesData];

    allTransactions.forEach((item) => {
      const key = `${item.partNumber}-${item.makeCompany}`;
      if (!partCompanySummary[key]) {
        partCompanySummary[key] = {
          partNumber: item.partNumber,
          makeCompany: item.makeCompany,
          unit: item.unit,
          totalPurchases: 0,
          totalIssues: 0,
          totalStock: 0,
          totalValue: 0,
        };
      }

      if (item.transactionType === "issue") {
        partCompanySummary[key].totalIssues += Math.abs(item.quantity);
        partCompanySummary[key].totalStock -= Math.abs(item.quantity);
        partCompanySummary[key].totalValue -= Math.abs(item.quantity) * item.unitPrice;
      } else {
        partCompanySummary[key].totalPurchases += item.quantity;
        partCompanySummary[key].totalStock += item.quantity;
        partCompanySummary[key].totalValue += item.quantity * item.unitPrice;
      }
    });

    // Group by partNumber for top-level display
    const groupedByPart = Object.values(partCompanySummary).reduce((acc, item) => {
      if (!acc[item.partNumber]) {
        acc[item.partNumber] = {
          partNumber: item.partNumber,
          companies: [],
          totalStock: 0,
          totalValue: 0,
        };
      }
      acc[item.partNumber].companies.push({
        makeCompany: item.makeCompany,
        unit: item.unit,
        totalPurchases: item.totalPurchases,
        totalIssues: item.totalIssues,
        totalStock: item.totalStock,
        totalValue: item.totalValue,
      });
      acc[item.partNumber].totalStock += item.totalStock;
      acc[item.partNumber].totalValue += item.totalValue;
      return acc;
    }, {});

    setSummaryData(Object.values(groupedByPart));
  }, [
    purchaseEntries,
    issues,
    openingStock,
    purchaseError,
    issuesError,
    openingStockError,
    isPurchasesLoading,
    isIssuesLoading,
    isOpeningStockLoading,
  ]);

  // Prepare CSV data for export
  const csvData = summaryData.flatMap((part) =>
    part.companies.map((company) => ({
      PartNumber: part.partNumber,
      Company: company.makeCompany,
      TotalPurchases: company.totalPurchases,
      TotalIssues: company.totalIssues,
      NetStock: company.totalStock,
      Unit: company.unit,
      TotalValue: company.totalValue.toFixed(2),
    }))
  );

  // Filter summary data
  const filteredSummary = summaryData.filter((item) => {
    if (searchTerm) {
      return (
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companies.some((company) =>
          company.makeCompany.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (activeFilter === "lowStock") {
      return item.companies.some((company) => company.totalStock > 0 && company.totalStock < 10);
    }
    if (activeFilter === "negativeStock") {
      return item.companies.some((company) => company.totalStock < 0);
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSummary.length / itemsPerPage);
  const paginatedSummary = filteredSummary.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const togglePartExpansion = (partNumber) => {
    setExpandedParts((prev) => ({
      ...prev,
      [partNumber]: !prev[partNumber],
    }));
  };

  const handleRefresh = () => {
    refetchPurchases();
    refetchIssues();
    refetchOpeningStock();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Autosuggest handlers
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    return inputValue.length === 0
      ? []
      : searchData.filter((item) =>
          item.value.toLowerCase().includes(inputValue)
        ).slice(0, 5);
  };

  const getSuggestionValue = (suggestion) => suggestion.value;

  const renderSuggestion = (suggestion) => (
    <div className="px-3 py-2 text-sm">
      <span className="font-medium">{suggestion.value}</span>
      <span className="text-xs text-gray-500 ml-2">({suggestion.type})</span>
    </div>
  );

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setSearchTerm(suggestion.value);
  };

  if (isPurchasesLoading || isIssuesLoading || isOpeningStockLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-4 bg-gray-200" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <div className="p-4 flex justify-between items-center">
                <Skeleton className="h-6 w-32 bg-gray-200" />
                <Skeleton className="h-6 w-24 bg-gray-200" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (purchaseError || issuesError || openingStockError) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Card className="w-full shadow-sm">
          <CardContent className="p-4 text-red-600">
            Error loading data: {(purchaseError || issuesError || openingStockError)?.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto relative">
      <Tabs defaultValue="overview" className="mb-4">
        <TabsList className="grid grid-cols-2 w-full max-w-xs bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="company" className="text-sm">
            Company Breakdown
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="relative w-full max-w-md">
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                onSuggestionSelected={onSuggestionSelected}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: "Search part number or company...",
                  value: searchTerm,
                  onChange: (e, { newValue }) => setSearchTerm(newValue),
                  className:
                    "w-full h-10 pl-10 pr-4 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm",
                }}
                theme={{
                  container: "relative",
                  suggestionsContainer:
                    "absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg",
                  suggestion: "cursor-pointer hover:bg-gray-100",
                  suggestionHighlighted: "bg-gray-200",
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                className={`h-8 text-xs ${activeFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
              >
                All
              </Button>
              <Button
                variant={activeFilter === "lowStock" ? "default" : "outline"}
                onClick={() => setActiveFilter("lowStock")}
                className={`h-8 text-xs ${activeFilter === "lowStock" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
              >
                Low Stock
              </Button>
              <Button
                variant={activeFilter === "negativeStock" ? "default" : "outline"}
                onClick={() => setActiveFilter("negativeStock")}
                className={`h-8 text-xs ${activeFilter === "negativeStock" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
              >
                Negative Stock
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {paginatedSummary.map((summary) => (
              <Card
                key={summary.partNumber}
                className="border shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 cursor-pointer"
                  onClick={() => togglePartExpansion(summary.partNumber)}
                >
                  <div className="flex flex-col mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-base">{summary.partNumber}</h3>
                      {summary.companies.some((c) => c.totalStock < 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Negative stock detected
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {summary.companies.length} {summary.companies.length === 1 ? "Company" : "Companies"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={summary.totalStock > 0 ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {summary.totalStock}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ${summary.totalValue.toFixed(2)}
                    </Badge>
                    {expandedParts[summary.partNumber] ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                {expandedParts[summary.partNumber] && (
                  <div className="p-3 border-t border-gray-200">
                    <ul className="space-y-2">
                      {summary.companies.map((company) => (
                        <li
                          key={company.makeCompany}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 sm:mb-0">
                            <span className="font-medium text-sm">{company.makeCompany}</span>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      variant={company.totalStock > 0 ? "success" : "destructive"}
                                      className="text-xs cursor-help"
                                    >
                                      {company.totalStock} {company.unit}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Purchases: {company.totalPurchases} {company.unit}
                                    <br />
                                    Issues: {company.totalIssues} {company.unit}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Badge variant="secondary" className="text-xs">
                                ${company.totalValue.toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            Net: {company.totalStock} {company.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="company">
          <div className="space-y-3">
            {paginatedSummary.map((summary) => (
              <Card
                key={summary.partNumber}
                className="border shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <CardHeader className="p-3">
                  <h3 className="font-medium text-base">{summary.partNumber}</h3>
                  <p className="text-xs text-gray-500">
                    Total Stock: {summary.totalStock} | Total Value: ${summary.totalValue.toFixed(2)}
                  </p>
                </CardHeader>
                <CardContent className="p-3">
                  <ul className="space-y-2">
                    {summary.companies.map((company) => (
                      <li
                        key={company.makeCompany}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 sm:mb-0">
                          <span className="font-medium text-sm">{company.makeCompany}</span>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant={company.totalStock > 0 ? "success" : "destructive"}
                                    className="text-xs cursor-help"
                                  >
                                    {company.totalStock} {company.unit}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Purchases: {company.totalPurchases} {company.unit}
                                  <br />
                                  Issues: {company.totalIssues} {company.unit}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Badge variant="secondary" className="text-xs">
                              ${company.totalValue.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>Purchases: {company.totalPurchases} {company.unit}</div>
                          <div>Issues: {company.totalIssues} {company.unit}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {filteredSummary.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 text-xs bg-white text-gray-800 hover:bg-gray-100"
          >
            Previous
          </Button>
          <span className="text-xs">Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 text-xs bg-white text-gray-800 hover:bg-gray-100"
          >
            Next
          </Button>
        </div>
      )}
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Button
          onClick={handleRefresh}
          className="h-10 w-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <CSVLink
          data={csvData}
          filename={`inventory_summary_${new Date().toISOString().slice(0, 10)}.csv`}
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        >
          <Download className="h-5 w-5" />
        </CSVLink>
      </div>
    </div>
  );
}