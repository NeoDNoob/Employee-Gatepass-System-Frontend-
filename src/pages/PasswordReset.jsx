import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Eye, EyeOff } from "lucide-react";

const PasswordReset = () => {
  const [form, setForm] = useState({ username: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      // Fetch existing requests for this username
      const res = await axios.get("http://localhost:3001/forgotPasswordRequests?username=" + encodeURIComponent(form.username));
      const existing = res.data.find(r => r.status === "Pending");
      if (existing) {
        setError("A password reset request for this account is already pending approval. Please contact the admin or wait for approval.");
        return;
      }

      await axios.post("http://localhost:3001/forgotPasswordRequests", {
        id: `FPR-${Date.now()}`,
        username: form.username,
        newPassword: form.newPassword,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      setShowDialog(true);
    } catch (err) {
      setError("Failed to submit request. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-md px-4">
        <Card className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle>Password Reset Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md animate-in fade-in duration-500">{error}</div>}
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded mb-2">
                <b>Note:</b> This will not automatically change your password. Your request will be subject to admin approval. Please contact the admin for approval and support.
              </div>
              <Button type="submit" className="w-full">Submit Request</Button>
              <Button type="button"  variant="outline" className="w-full" onClick={() => navigate("/login")}>Cancel</Button>
            </form>
          </CardContent>
        </Card>
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Password Reset Request Submitted</AlertDialogTitle>
              <AlertDialogDescription>
                Your password reset request has been submitted and is pending admin approval. Please contact the admin for support.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {setShowDialog(false); navigate("/login");}}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PasswordReset; 