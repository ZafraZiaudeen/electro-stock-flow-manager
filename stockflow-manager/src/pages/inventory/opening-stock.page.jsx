"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import readXlsxFile from "read-excel-file";

export default function OpeningStockEntry() {
  const [items, setItems] = useState([
    {
      partNumber: "",
      makeCompany: "",
      description: "",
      unit: "Pieces",
      packing: 1,
      unitPrice: 0,
      quantity: 0,
    },
  ]);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination details
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Handle page navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle manual input changes
  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    const globalIndex = startIndex + index; // Adjust index for the full items array
    updatedItems[globalIndex][field] = value;
    setItems(updatedItems);
  };

  // Add a new row
  const addRow = () => {
    setItems([
      ...items,
      {
        partNumber: "",
        makeCompany: "",
        description: "",
        unit: "Pieces",
        packing: 1,
        unitPrice: 0,
        quantity: 0,
      },
    ]);
  };

  // Remove a row
  const removeRow = (index) => {
    const globalIndex = startIndex + index; // Adjust index for the full items array
    const updatedItems = items.filter((_, i) => i !== globalIndex);
    setItems(updatedItems);
    // Adjust current page if necessary
    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);

    readXlsxFile(file).then((rows) => {
      // Check if rows contain data
      if (!rows || rows.length <= 1) {
        alert("The Excel file is empty or has no data.");
        setProcessing(false);
        return;
      }

      // Headers are the first row
      const headers = rows[0].map((header) => header?.toString().trim().toLowerCase());
      console.log("Excel Headers:", headers); // Debug log to inspect headers

      // Define expected headers with possible variations
      const headerMapping = {
        partNumber: ["part number", "partnumber", "part no", "partno", "pn", "item number"],
        makeCompany: ["make/company", "makecompany", "make", "company", "manufacturer", "brand", "vendor", "supplier", "make company name"],
        description: ["description", "desc", "details", "item description", "product description", "item details", "product details"],
        unit: ["unit", "uom", "unit of measure", "measurement"],
        packing: ["packing", "pack", "pack size", "package", "pkg"],
        unitPrice: ["unit price", "unitprice", "price", "cost", "rate"],
        quantity: ["quantity", "qty", "amount", "stock", "count", "number", "total", "no of units"],
      };

      // Map Excel headers to internal field names
      const headerIndices = {};
      Object.keys(headerMapping).forEach((field) => {
        const variations = headerMapping[field];
        const foundHeader = headers.find((header) =>
          variations.includes(header)
        );
        if (foundHeader) {
          headerIndices[field] = headers.indexOf(foundHeader);
        }
      });

      // Validate required headers
      const requiredFields = ["partNumber", "unit", "packing", "unitPrice"];
      const missingRequiredHeaders = requiredFields.filter(
        (field) => headerIndices[field] === undefined
      );
      if (missingRequiredHeaders.length > 0) {
        alert(
          `Excel file is missing the following required headers: ${missingRequiredHeaders.join(", ")}. Expected headers (case-insensitive): Part Number, Make Company Name, Item Description, Unit, Packing, Unit Price, No of Units`
        );
        setProcessing(false);
        return;
      }

      // Log optional headers that are missing
      const optionalFields = ["makeCompany", "description", "quantity"];
      const missingOptionalHeaders = optionalFields.filter(
        (field) => headerIndices[field] === undefined
      );
      if (missingOptionalHeaders.length > 0) {
        console.log("Optional headers missing (using defaults):", missingOptionalHeaders);
      }

      // Unit mapping from Excel abbreviations to dropdown values
      const unitMapping = {
        "pcs": "Pieces",
        "pkt": "Packets",
        "roll": "ROLL",
        "box": "Boxes",
        "pack": "PACK",
        "set": "SET",
      };

      // Map rows to items (skip header row)
      const mappedData = rows.slice(1).map((row) => {
        const unitValue = row[headerIndices.unit]?.toString().trim().toLowerCase();
        const selectedUnit = unitMapping[unitValue] || (unitValue && !Object.keys(unitMapping).includes(unitValue) ? unitValue : "Pieces");
        return {
          partNumber: row[headerIndices.partNumber]?.toString() || "",
          makeCompany: headerIndices.makeCompany !== undefined ? row[headerIndices.makeCompany]?.toString() || "" : "",
          description: headerIndices.description !== undefined ? row[headerIndices.description]?.toString() || "" : "",
          unit: selectedUnit,
          packing: parseInt(row[headerIndices.packing]) || 1,
          unitPrice: parseFloat(row[headerIndices.unitPrice]) || 0,
          quantity: headerIndices.quantity !== undefined ? parseInt(row[headerIndices.quantity]) || 0 : 0,
        };
      });

      if (mappedData.some(item => !Object.values(unitMapping).includes(item.unit) && item.unit !== "Pieces")) {
        console.log("Warning: Some unit values from Excel were not recognized or mapped. Valid mappings are: PCS->Pieces, PKT->Packets, ROLL->ROLL, BOX->Boxes, PACK->PACK, SET->SET. Unmapped units default to 'Pieces'.");
      }

      console.log("Parsed Excel Data:", mappedData); // Debug log
      setItems(mappedData);
      setCurrentPage(1); // Reset to first page after upload
      setProcessing(false);
    }).catch((error) => {
      alert("Error parsing Excel file: " + error.message);
      setProcessing(false);
    });
  };

  // Handle save items (simulated)
  const handleSave = () => {
    console.log("Saving items:", items);
    alert("Items saved successfully!");
  };

  return (
    <>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Excel file should contain columns with these headers (case-insensitive): Part Number, Make Company Name, Item Description, Unit, Packing, Unit Price, No of Units
        </p>
      </div>

      {/* Manual Entry Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Manual Entry</h2>
        <div className="overflow-x-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Make Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Packing</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => (
                <TableRow key={startIndex + index}>
                  <TableCell className="min-w-0">
                    <Input
                      value={item.partNumber}
                      onChange={(e) =>
                        handleInputChange(index, "partNumber", e.target.value)
                      }
                      placeholder="Part No."
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Input
                      value={item.makeCompany}
                      onChange={(e) =>
                        handleInputChange(index, "makeCompany", e.target.value)
                      }
                      placeholder="Company"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Select
                      value={item.unit}
                      onValueChange={(value) =>
                        handleInputChange(index, "unit", value)
                      }
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
                  <TableCell className="min-w-0">
                    <Input
                      type="number"
                      value={item.packing}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "packing",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="min-w-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {items.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Next
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button onClick={addRow} className="bg-blue-600 hover:bg-blue-700">
            Add Row
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Items
          </Button>
        </div>
      </div>
    </>
  );
}