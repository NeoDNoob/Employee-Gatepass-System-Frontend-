"use client"

// React and core dependencies
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"

// UI Components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

// Icons
import { Check, ChevronsUpDown, Printer } from "lucide-react"

// Utilities
import { cn } from "@/lib/utils"

// Print function for leave request
const printLeaveRequest = (leave) => {
  if (!leave) return;
  const formatDate = (date) => date ? format(new Date(date), "PPP") : "N/A";
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Leave Request ${leave.id}</title>
      <style>
        @page { size: A4; margin: 1cm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .leave-container { max-width: 800px; margin: 0 auto; padding: 32px; border: 1px solid #ccc; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .header img { height: 45px; }
        .header-text { }
        .title { font-size: 20px; font-weight: bold; }
        .subtitle { font-size: 14px; margin-top: 2px; }
        .section { margin-bottom: 24px; }
        .row { display: flex; margin-bottom: 10px; }
        .label { font-weight: bold; width: 180px; }
        .value { flex: 1; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
        .signature-box { text-align: center; width: 220px; }
        .signature-line { border-top: 1px solid #000; width: 100%; margin: 20px 0 5px 0; }
        .signature-title { margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="leave-container">
        <div class="header">
          <img src="/src/assets/LOGO.svg" alt="Logo">
          <div class="header-text">
            <div class="title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
            <div class="subtitle">EMPLOYEE LEAVE REQUEST</div>
            <div class="subtitle">Reference No: ${leave.id}</div>
          </div>
        </div>
        <div class="section">
          <div class="row"><div class="label">Employee Name:</div><div class="value">${leave.name}</div></div>
          <div class="row"><div class="label">I.D. No.:</div><div class="value">${leave.idNumber || "N/A"}</div></div>
          <div class="row"><div class="label">Date Range:</div><div class="value">From: ${formatDate(leave.from)} To: ${formatDate(leave.to)}</div></div>
          <div class="row"><div class="label">Shift:</div><div class="value">${leave.shift}</div></div>
          <div class="row"><div class="label">Total Days:</div><div class="value">${leave.totalDays}</div></div>
          <div class="row"><div class="label">Leave Type:</div><div class="value">${leave.type === "Others" ? leave.othersType : leave.type}</div></div>
        </div>
        <div class="section">
          <div class="row"><div class="label">Prepared by:</div><div class="value">${leave.preparedBy}</div></div>
          <div class="row"><div class="label">Recommending Approval:</div><div class="value">${leave.recommendingApproval}</div></div>
        </div>
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Employee Signature</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Approver Signature</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Form validation schema
const leaveRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  from: z.date(),
  to: z.date(),
  type: z.string().min(1, "Leave type is required"),
  shift: z.string().min(1, "Shift is required"),
  totalDays: z.string().min(1, "Total days is required"),
  preparedBy: z.string().min(1, "Prepared by is required"),
  recommendingApproval: z.string().min(1, "Recommending approval is required"),
});

const LeaveRequestForm = ({ setOpen, user }) => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      from: new Date(),
      to: new Date(),
      type: "",
      shift: "",
      totalDays: "",
      preparedBy: `${user?.firstName || ""} ${user?.lastName || ""}`,
      recommendingApproval: "",
    },
    resolver: zodResolver(leaveRequestSchema),
    mode: "onChange",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalDays, setTotalDays] = useState("");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [dayType, setDayType] = useState("whole");
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [recommendingApprovalOptions, setRecommendingApprovalOptions] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [createdLeave, setCreatedLeave] = useState(null);

  const name = watch("name");
  const recommendingApproval = watch("recommendingApproval");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:3001/employees");
        const employees = response.data.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
        }));
        setEmployeeOptions(employees);
        
        const departmentHeads = response.data
          .filter(emp => 
            emp.position?.toLowerCase().includes("manager") || 
            emp.position?.toLowerCase().includes("head") ||
            emp.position?.toLowerCase().includes("supervisor")
          )
          .map(emp => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
          }));
        setRecommendingApprovalOptions(departmentHeads);
      } catch (error) {
        setEmployeeOptions([]);
        setRecommendingApprovalOptions([]);
      }
    };
    fetchEmployees();
  }, []);

  const calculateTotalDays = (start, end, type) => {
    if (!start || !end) return 0;
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    const numberOfDays = Math.round(daysDiff) + 1;
    return type === "half" ? Math.max(0, numberOfDays - 0.5) : Math.max(0, numberOfDays);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setValue("from", date);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range.from && range.to) {
      const totalDays = calculateTotalDays(range.from, range.to, dayType);
      setTotalDays(totalDays);
      setValue("from", range.from);
      setValue("to", range.to);
    }
  };

  const handleDayTypeChange = (newDayType) => {
    setDayType(newDayType);
    if (dateRange.from && dateRange.to) {
      const totalDays = calculateTotalDays(dateRange.from, dateRange.to, newDayType);
      setTotalDays(totalDays);
    }
  };

  const onSubmit = async (data) => {
    try {
      leaveRequestSchema.parse(data);
      const res = await axios.get("http://localhost:3001/leaveRequests");
      const leaveRequests = res.data;
      let newId = "LR-0001";
      if (leaveRequests.length > 0) {
        const last = leaveRequests[leaveRequests.length - 1];
        let lastNum = 0;
        if (last.id && last.id.startsWith("LR-")) {
          lastNum = parseInt(last.id.replace("LR-", ""), 10);
        } else if (typeof last.id === "number") {
          lastNum = last.id;
        }
        newId = `LR-${String(lastNum + 1).padStart(4, "0")}`;
      }
      const processedData = {
        ...data,
        id: newId,
        from: new Date(data.from).toISOString(),
        to: new Date(data.to).toISOString(),
        totalDays: Number(totalDays),
        status: "Pending",
      };
      if (data.othersType) {
        processedData.othersType = data.othersType;
      }
      await axios.post("http://localhost:3001/leaveRequests", processedData);
      setCreatedLeave(processedData);
      setAlertSuccess(true);
      setAlertOpen(true);
    } catch (error) {
      setAlertSuccess(false);
      setAlertOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between animate-in fade-in duration-500">
          <div className="relative w-full">
            <Label className="block text-xs font-medium mb-1">Employee Name</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {name || "Select employee..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search employees..." />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    {employeeOptions.map((employee) => (
                      <CommandItem
                        key={employee.id}
                        value={employee.id}
                        onSelect={() => setValue("name", employee.name)}
                      >
                        <Check className={cn("mr-2 h-4 w-4", name === employee.name ? "opacity-100" : "opacity-0")} />
                        {employee.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-xs font-medium mb-2">Date Range</Label>
            <DatePickerWithRange className="flex-1" onChange={handleDateRangeChange} />
            <RadioGroup value={dayType} onValueChange={handleDayTypeChange} className="flex items-center mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whole" id="whole-day" />
                <Label htmlFor="whole-day">Whole Day</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="half" id="half-day" />
                <Label htmlFor="half-day">Half Day</Label>
              </div>
            </RadioGroup>
            {errors.from && <span className="text-red-500 text-xs">{errors.from.message}</span>}
          </div>
          <div>
            <Label className="block text-xs font-medium mb-2">I.D. No.</Label>
            <Input type="text" name="idNumber" value={user?.id || ""} readOnly />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="block text-xs font-medium mb-2">Shift</Label>
            <Input type="text" {...register("shift")} placeholder="e.g., Morning" />
            {errors.shift && <span className="text-red-500 text-xs">{errors.shift.message}</span>}
          </div>
          <div>
            <Label className="block text-xs font-medium mb-2">Total Days</Label>
            <Input type="number" {...register("totalDays")} value={totalDays} readOnly />
          </div>
          <div>
            <Label className="block text-xs font-medium mb-2">Leave Type</Label>
            <RadioGroup value={watch("type")} onValueChange={(value) => setValue("type", value)}>
              <div className="grid grid-cols-2 gap-2">
                {["Sick Leave", "Maternity / Paternity Leave", "Bereavement", "Vacation Leave", "Birthday Leave", "Others"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {watch("type") === "Others" && (
              <div className="mt-2">
                <Label className="block text-xs font-medium">Specify</Label>
                <Input type="text" {...register("othersType")} />
              </div>
            )}
            {errors.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-xs font-medium mb-2">Prepared by</Label>
            <Input type="text" {...register("preparedBy")} value={`${user?.firstName || ""} ${user?.lastName || ""}`} readOnly />
            <div className="text-center text-xs mt-1">Employee</div>
          </div>
          <div>
            <Label className="block text-xs font-medium mb-2">Recommending Approval</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {recommendingApproval || "Select approver..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search approvers..." />
                  <CommandList>
                    <CommandEmpty>No approver found.</CommandEmpty>
                    {recommendingApprovalOptions.map((approver) => (
                      <CommandItem
                        key={approver.id}
                        value={approver.id}
                        onSelect={() => setValue("recommendingApproval", approver.name)}
                      >
                        <Check className={cn("mr-2 h-4 w-4", recommendingApproval === approver.name ? "opacity-100" : "opacity-0")} />
                        {approver.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="text-center text-xs mt-1">Department Head / Area Manager</div>
            {errors.recommendingApproval && <span className="text-red-500 text-xs">{errors.recommendingApproval.message}</span>}
          </div>
        </div>
        <div className="flex justify-end mt-6 flex-row gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/leave-request")}
          >
            Cancel
          </Button>
          <Button type="submit">
            Submit Request
          </Button>
        </div>
      </form>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertSuccess ? "Leave Request Submitted" : "Submission Failed"}</AlertDialogTitle>
          </AlertDialogHeader>
          <p>{alertSuccess ? "Your leave request has been submitted successfully." : "There was an error submitting your leave request. Please try again."}</p>
          {alertSuccess && createdLeave && (
            <div className="flex justify-center my-4">
              <Button onClick={() => printLeaveRequest(createdLeave)} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Leave Request
              </Button>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              navigate("/leave-request");
              setAlertOpen(false);
              if (alertSuccess && typeof setOpen === "function") setOpen(false);
            }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeaveRequestForm; 
