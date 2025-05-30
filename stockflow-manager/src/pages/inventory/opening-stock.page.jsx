"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

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

  // Handle manual input changes
  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
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
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate headers
      const requiredHeaders = [
        "Part Number",
        "Make/Company",
        "Description",
        "Unit",
        "Packing",
        "Unit Price",
        "Quantity",
      ];
      const headers = Object.keys(jsonData[0] || {});
      const hasRequiredHeaders = requiredHeaders.every((header) =>
        headers.includes(header)
      );

      if (!hasRequiredHeaders) {
        alert(
          "Excel file must contain the following headers: Part Number, Make/Company, Description, Unit, Packing, Unit Price, Quantity"
        );
        return;
      }

      // Map Excel data to table format
      const mappedData = jsonData.map((row) => ({
        partNumber: row["Part Number"] || "",
        makeCompany: row["Make/Company"] || "",
        description: row["Description"] || "",
        unit: row["Unit"] || "Pieces",
        packing: parseInt(row["Packing"]) || 1,
        unitPrice: parseFloat(row["Unit Price"]) || 0,
        quantity: parseInt(row["Quantity"]) || 0,
      }));

      setItems(mappedData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle save items (simulated)
  const handleSave = () => {
    console.log("Saving items:", items);
    alert("Items saved successfully!");
  };

  return (
    <>
      

      {/* Import from Excel Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border w-11/12">
        <h2 className="text-lg font-semibold mb-4">Import from Excel</h2>
        <div className="flex items-center gap-4 mb-2">
          <Input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="w-64"
          />
          <Button variant="outline" className="bg-gray-100">
            Upload Excel
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Excel file should contain columns with these headers (or similar names): Part Number, Make/Company, Description, Unit, Packing, Unit Price, Quantity
        </p>
      </div>

      {/* Manual Entry Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm border w-11/12">
        <h2 className="text-lg font-semibold mb-4">Manual Entry</h2>
        <div className="overflow-x-auto w-11/12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Make/Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Packing</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.partNumber}
                      onChange={(e) =>
                        handleInputChange(index, "partNumber", e.target.value)
                      }
                      placeholder="Part No."
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.makeCompany}
                      onChange={(e) =>
                        handleInputChange(index, "makeCompany", e.target.value)
                      }
                      placeholder="Company"
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="w-48"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.unit}
                      onValueChange={(value) =>
                        handleInputChange(index, "unit", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                        <SelectItem value="Boxes">Boxes</SelectItem>
                        <SelectItem value="Packets">Packets</SelectItem>
                        <SelectItem value="Each">Each</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
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
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
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
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
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
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
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