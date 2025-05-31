"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ChevronDown, ChevronUp, Search, Plus, Save } from "lucide-react";
import readXlsxFile from "read-excel-file";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OpeningStockEntry() {
  const [items, setItems] = useState([
    {
      partNumber: "",
      makeCompany: "",
      description: "",
      unit: "Pieces",
      packing: "1x1",
      unitPrice: 0,
      quantity: 0,
    },
  ]);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const itemsPerPage = 10;

  // State for new item entry in dialog
  const [newItem, setNewItem] = useState({
    partNumber: "",
    makeCompany: "",
    description: "",
    unit: "Pieces",
    packing: "1x1",
    unitPrice: 0,
    quantity: 0,
  });

  // Group items by makeCompany, excluding empty or falsy makeCompany values
  const groupedItems = items.reduce((acc, item) => {
    const company = item.makeCompany?.trim();
    if (!company) return acc; // Skip items with no makeCompany
    acc[company] = acc[company] || [];
    acc[company].push(item);
    return acc;
  }, {});

  // Calculate total value for each company
  const companyTotals = Object.fromEntries(
    Object.entries(groupedItems).map(([company, companyItems]) => [
      company,
      companyItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2),
    ])
  );

  // Calculate grand total across all companies
  const grandTotal = Object.values(companyTotals).reduce((sum, total) => sum + parseFloat(total), 0).toFixed(2);

  // Filter items based on company search term
  const filterItems = (items, company) =>
    items.filter((item) =>
      item.makeCompany.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // State for expanded categories and pagination
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryPages, setCategoryPages] = useState({});

  // Toggle category expansion
  const toggleCategory = (company) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [company]: !prev[company],
    }));
  };

  // Handle page navigation for a category
  const handlePageChange = (company, page) => {
    setCategoryPages((prev) => ({
      ...prev,
      [company]: page,
    }));
  };

  // Handle manual input changes in table
  const handleInputChange = (company, index, field, value) => {
    const updatedItems = [...items];
    const globalIndex = items.findIndex(
      (item, i) => i === Object.values(groupedItems).flat().indexOf(items[i]) && items[i].makeCompany === company
    ) + index;
    if (field === "packing") {
      const packingMatch = value.match(/^(\d+)x(\d+)$/);
      if (packingMatch) {
        updatedItems[globalIndex][field] = value;
      } else if (value === "") {
        updatedItems[globalIndex][field] = "";
      } else {
        updatedItems[globalIndex][field] = items[globalIndex][field];
      }
    } else {
      updatedItems[globalIndex][field] = value;
    }
    setItems(updatedItems);
  };

  // Remove a row
  const removeRow = (company, index) => {
    const globalIndex = items.findIndex(
      (item, i) => i === Object.values(groupedItems).flat().indexOf(items[i]) && items[i].makeCompany === company
    ) + index;
    const updatedItems = items.filter((_, i) => i !== globalIndex);
    setItems(updatedItems);
  };

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);

    readXlsxFile(file).then((rows) => {
      if (!rows || rows.length <= 1) {
        alert("The Excel file is empty or has no data.");
        setProcessing(false);
        return;
      }

      const headers = rows[0].map((header) => header?.toString().trim().toLowerCase());
      console.log("Excel Headers:", headers);

      const headerMapping = {
        partNumber: ["part number", "partnumber", "part no", "partno", "pn", "item number"],
        makeCompany: ["make/company", "makecompany", "make", "company", "manufacturer", "brand", "vendor", "supplier", "make company name"],
        description: ["description", "desc", "details", "item description", "product description", "item details", "product details"],
        unit: ["unit", "uom", "unit of measure", "measurement"],
        packing: ["packing", "pack", "pack size", "package", "pkg"],
        unitPrice: ["unit price", "unitprice", "price", "cost", "rate"],
        quantity: ["quantity", "qty", "amount", "stock", "count", "number", "total", "no of units"],
        totalValue: ["total value", "totalvalue", "total", "value", "total cost", "total price"],
      };

      const headerIndices = {};
      Object.keys(headerMapping).forEach((field) => {
        const variations = headerMapping[field];
        const foundHeader = headers.find((header) => variations.includes(header));
        if (foundHeader) {
          headerIndices[field] = headers.indexOf(foundHeader);
        }
      });

      const requiredFields = ["partNumber", "unit", "packing", "unitPrice", "makeCompany"];
      const missingRequiredHeaders = requiredFields.filter((field) => headerIndices[field] === undefined);
      if (missingRequiredHeaders.length > 0) {
        alert(
          `Excel file is missing the following required headers: ${missingRequiredHeaders.join(", ")}. Expected headers (case-insensitive): Part Number, Make Company Name, Item Description, Unit, Packing, Unit Price, No of Units`
        );
        setProcessing(false);
        return;
      }

      const optionalFields = ["description", "quantity", "totalValue"];
      const missingOptionalHeaders = optionalFields.filter((field) => headerIndices[field] === undefined);
      if (missingOptionalHeaders.length > 0) {
        console.log("Optional headers missing (using defaults):", missingOptionalHeaders);
      }

      if (headerIndices.totalValue !== undefined) {
        console.log("Warning: 'Total Value' column found in Excel. It will be ignored, and Total Value will be calculated as Unit Price * Quantity.");
      }

      const unitMapping = {
        "pcs": "Pieces",
        "pkt": "Packets",
        "roll": "ROLL",
        "box": "Boxes",
        "pack": "PACK",
        "set": "SET",
      };

      const mappedData = rows.slice(1).map((row) => {
        const unitValue = row[headerIndices.unit]?.toString().trim().toLowerCase();
        const selectedUnit = unitMapping[unitValue] || (unitValue && !Object.keys(unitMapping).includes(unitValue) ? unitValue : "Pieces");
        return {
          partNumber: row[headerIndices.partNumber]?.toString() || "",
          makeCompany: row[headerIndices.makeCompany]?.toString() || "",
          description: headerIndices.description !== undefined ? row[headerIndices.description]?.toString() || "" : "",
          unit: selectedUnit,
          packing: row[headerIndices.packing]?.toString() || "1x1",
          unitPrice: parseFloat(row[headerIndices.unitPrice]) || 0,
          quantity: headerIndices.quantity !== undefined ? parseInt(row[headerIndices.quantity]) || 0 : 0,
        };
      });

      if (mappedData.some(item => !Object.values(unitMapping).includes(item.unit) && item.unit !== "Pieces")) {
        console.log("Warning: Some unit values from Excel were not recognized or mapped. Valid mappings are: PCS->Pieces, PKT->Packets, ROLL->ROLL, BOX->Boxes, PACK->PACK, SET->SET. Unmapped units default to 'Pieces'.");
      }

      console.log("Parsed Excel Data:", mappedData);
      setItems(mappedData);
      setExpandedCategories((prev) => {
        const newExpanded = { ...prev };
        Object.keys(groupedItems).forEach((company) => (newExpanded[company] = true));
        return newExpanded;
      });
      setProcessing(false);
    }).catch((error) => {
      alert("Error parsing Excel file: " + error.message);
      setProcessing(false);
    });
  };

  // Handle adding a new item via dialog
  const handleAddItem = () => {
    if (!newItem.partNumber || !newItem.makeCompany || !newItem.unit || !newItem.packing || newItem.unitPrice <= 0) {
      alert("Please fill in all required fields (Part Number, Company, Unit, Packing, Unit Price)");
      return;
    }

    const updatedItems = [...items, { ...newItem }];
    setItems(updatedItems);
    setExpandedCategories((prev) => ({
      ...prev,
      [newItem.makeCompany]: true, // Expand the company table after adding
    }));
    setShowAddItemDialog(false);
    setNewItem({
      partNumber: "",
      makeCompany: "",
      description: "",
      unit: "Pieces",
      packing: "1x1",
      unitPrice: 0,
      quantity: 0,
    });
    alert(`Item added successfully to ${newItem.makeCompany}`);
  };

  return (
    <>
      {/* Opening Stock Total Value */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold">Opening Stock Total Value: ${grandTotal}</h2>
      </div>

      {/* Import from Excel Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Import from Excel</h2>
        <div className="flex items-center gap-4 mb-2">
          <Input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="w-full max-w-xs"
            disabled={processing}
          />
          <Button
            variant="outline"
            className="bg-gray-100"
            disabled={processing}
          >
            {processing ? "Processing..." : "Upload Excel"}
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddItemDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="relative mt-4 w-full max-w-md">
          <Input
            type="text"
            placeholder="Search by Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Categorized Entry Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Stock Entry</h2>
        {Object.entries(groupedItems).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No stock entries found.</p>
            <p className="text-sm">Please upload an Excel file or add an item manually.</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([company, companyItems]) => {
            const filteredItems = filterItems(companyItems, company);
            if (searchTerm && !company.toLowerCase().includes(searchTerm.toLowerCase())) {
              return null; // Hide non-matching companies
            }
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            const currentPage = categoryPages[company] || 1;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = filteredItems.slice(startIndex, endIndex);

            return (
              <div key={company} className="mb-4 border rounded-lg">
                <div
                  className="flex items-center justify-between p-2 bg-gray-100 cursor-pointer"
                  onClick={() => toggleCategory(company)}
                >
                  <h3 className="text-md font-medium">
                    {company} ({filteredItems.length} items)
                  </h3>
                  {expandedCategories[company] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                {expandedCategories[company] && (
                  <>
                    <div className="p-2 bg-gray-50">
                      <p className="text-sm font-medium">Company Total Value: ${companyTotals[company]}</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Packing</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={item.partNumber}
                                onChange={(e) => handleInputChange(company, index, "partNumber", e.target.value)}
                                placeholder="Part No."
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.description}
                                onChange={(e) => handleInputChange(company, index, "description", e.target.value)}
                                placeholder="Description"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.unit}
                                onValueChange={(value) => handleInputChange(company, index, "unit", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pieces">Pieces</SelectItem>
                                  <SelectItem value="Packets">Packets</SelectItem>
                                  <SelectItem value="ROLL">ROLL</SelectItem>
                                  <SelectItem value="Boxes">Boxes</SelectItem>
                                  <SelectItem value="PACK">PACK</SelectItem>
                                  <SelectItem value="SET">SET</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={item.packing}
                                onChange={(e) => handleInputChange(company, index, "packing", e.target.value)}
                                placeholder="e.g., 1x6"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleInputChange(company, index, "unitPrice", parseFloat(e.target.value) || 0)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleInputChange(company, index, "quantity", parseInt(e.target.value) || 0)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              {(item.unitPrice * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeRow(company, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredItems.length > itemsPerPage && (
                      <div className="flex justify-between items-center mt-2 p-2">
                        <Button
                          onClick={() => handlePageChange(company, currentPage - 1)}
                          disabled={currentPage === 1}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                          Previous
                        </Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button
                          onClick={() => handlePageChange(company, currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stock Item</DialogTitle>
            <DialogDescription>Enter the details to add a new stock item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Part Number *</label>
                <Input
                  value={newItem.partNumber}
                  onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                  placeholder="Enter Part Number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company *</label>
                <Input
                  value={newItem.makeCompany}
                  onChange={(e) => setNewItem({ ...newItem, makeCompany: e.target.value })}
                  placeholder="Enter Company Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enter Description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit *</label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pieces">Pieces</SelectItem>
                    <SelectItem value="Packets">Packets</SelectItem>
                    <SelectItem value="ROLL">ROLL</SelectItem>
                    <SelectItem value="Boxes">Boxes</SelectItem>
                    <SelectItem value="PACK">PACK</SelectItem>
                    <SelectItem value="SET">SET</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Packing *</label>
                <Input
                  value={newItem.packing}
                  onChange={(e) => setNewItem({ ...newItem, packing: e.target.value })}
                  placeholder="e.g., 1x6"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price *</label>
                <Input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter Unit Price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter Quantity"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              <Save className="h-4 w-4 mr-2" />
              Save Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}