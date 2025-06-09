import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePickerWithRange from "@/components/ui/DatePickerWithRange";

// Import the printGatepass logic from utils (or copy the function if not exported)
import { printGatepass } from "@/utils/print";

const GatepassReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [department, setDepartment] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [gatepasses, setGatepasses] = useState([]);
  const [averageHours, setAverageHours] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:3001/employees").then(res => setEmployees(res.data || []));
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      setDepartment(selectedEmployee.department);
    } else {
      setDepartment("");
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee && dateRange.from && dateRange.to) {
      axios.get("http://localhost:3001/gatepasses").then(res => {
        const filtered = res.data.filter(gp =>
          gp.employees?.includes(`${selectedEmployee.firstName} ${selectedEmployee.lastName}`) &&
          new Date(gp.dateTimeRange.from) >= dateRange.from &&
          new Date(gp.dateTimeRange.to) <= dateRange.to
        );
        setGatepasses(filtered);
        // Calculate average hours per gatepass
        let totalHours = 0;
        filtered.forEach(gp => {
          const from = new Date(gp.dateTimeRange.from);
          const to = new Date(gp.dateTimeRange.to);
          const hours = (to - from) / (1000 * 60 * 60);
          totalHours += hours;
        });
        setAverageHours(filtered.length ? (totalHours / filtered.length).toFixed(2) : 0);
      });
    } else {
      setGatepasses([]);
      setAverageHours(0);
    }
  }, [selectedEmployee, dateRange]);

  // Print the report fields (header + body, with formatted dates, portrait)
  const handleGenerate = () => {
    if (gatepasses.length === 0) return;
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    const style = `
      <style>
        @page { size: A4 portrait; margin: 1.5cm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: Arial, sans-serif; width: 100%; height: 100%; margin: 0; padding: 0; }
        .report-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
        .report-header img { height: 45px; width: auto; }
        .header-text { text-align: left; }
        .report-title { font-size: 16px; font-weight: bold; line-height: 1.2; }
        .report-subtitle { font-size: 13px; margin-top: 2px; line-height: 1.2; }
        .summary { margin-bottom: 20px; }
        .info-block { margin-bottom: 16px; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    `;
    let tableRows = gatepasses.map(gp => {
      const from = new Date(gp.dateTimeRange.from);
      const to = new Date(gp.dateTimeRange.to);
      const hours = ((to - from) / (1000 * 60 * 60)).toFixed(2);
      return `<tr><td>${from.toLocaleString()}</td><td>${to.toLocaleString()}</td><td>${hours}</td><td>${gp.destination}</td><td>${gp.purpose}</td></tr>`;
    }).join('');
    const html = `
      <div class="report-header">
        <img src="/src/assets/LOGO.svg" alt="Logo">
        <div class="header-text">
          <div class="report-title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
          <div class="report-subtitle">GATEPASS REPORT</div>
        </div>
      </div>
      <div class="info-block"><strong>Employee Name:</strong> ${selectedEmployee ? selectedEmployee.firstName + ' ' + selectedEmployee.lastName : ''}</div>
      <div class="info-block"><strong>Department:</strong> ${department}</div>
      <div class="summary"><strong>Average Hour(s) per Gatepass:</strong> ${averageHours}</div>
      <table>
        <thead>
          <tr><th>Date (From)</th><th>Date (To)</th><th>Hours</th><th>Destination</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Gatepass Report</title>${style}</head><body>${html}<script>window.onload = function() { window.print(); };</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-2xl px-4">
        <Card className="animate-in slide-in-from-top duration-500">
          <CardHeader>
            <CardTitle>Gatepass Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Employee Name</Label>
                <Select
                  value={selectedEmployee?.id || ""}
                  onValueChange={val => {
                    const emp = employees.find(e => e.id === val);
                    setSelectedEmployee(emp);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={department} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label>Date Range</Label>
                <DatePickerWithRange
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Average Hour(s) per Gatepass</Label>
                <Input value={averageHours} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label>Gatepass Records</Label>
                <ul className="list-disc pl-5">
                  {gatepasses.length > 0 ? gatepasses.map((gp, i) => {
                    const from = new Date(gp.dateTimeRange.from);
                    const to = new Date(gp.dateTimeRange.to);
                    const hours = ((to - from) / (1000 * 60 * 60)).toFixed(2);
                    return (
                      <li key={gp.id}>
                        <strong>{from.toLocaleString()} - {to.toLocaleString()}</strong> | Hours: {hours} | Destination: {gp.destination} | Purpose: {gp.purpose}
                      </li>
                    );
                  }) : <li className="text-muted-foreground">No records found.</li>}
                </ul>
              </div>
              <Button className="mt-4 w-full print:hidden" onClick={handleGenerate} type="button" disabled={gatepasses.length === 0}>
                Generate Printable Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GatepassReport;