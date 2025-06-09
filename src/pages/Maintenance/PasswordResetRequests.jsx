//React and code dependencies
import React, { useState, useEffect } from "react";
import axios from "axios";

//UI components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";

//Icons
import { Eye, EyeOff, CloudAlert } from "lucide-react";


const PasswordResetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState("");
    const [actionRequest, setActionRequest] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://localhost:3001/forgotPasswordRequests");
                setRequests(response.data || []);
            } catch (error) {
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    const handleViewPassword = (request) => {
        setSelectedRequest(request);
        setShowPassword(false);
        setDialogOpen(true);
    };

    const handleApprove = (request) => {
        setActionType("approve");
        setActionRequest(request);
        setActionDialogOpen(true);
    };

    const handleDecline = (request) => {
        setActionType("decline");
        setActionRequest(request);
        setActionDialogOpen(true);
    };

    //Handle approve and decline
    const handleActionConfirm = async () => {
        if (!actionRequest) return;
        if (actionType === "approve") {
            try {
                // 1. Find the user by username
                const usersRes = await axios.get("http://localhost:3001/users?username=" + encodeURIComponent(actionRequest.username));
                const user = usersRes.data[0];
                if (!user) {
                    alert("User not found!");
                    return;
                }

                // 2. Update the user's password
                await axios.patch(`http://localhost:3001/users/${user.id}`, {
                    password: actionRequest.newPassword,
                });

                // 3. Remove the password reset request
                await axios.delete(`http://localhost:3001/forgotPasswordRequests/${actionRequest.id}`);

                // 4. Remove from UI
                setRequests((prev) => prev.filter((r) => r.id !== actionRequest.id));
                setActionDialogOpen(false);
                setActionRequest(null);
            } catch (err) {
                alert("Failed to approve and update password. Please try again.");
            }
        } else if (actionType === "decline") {
            // Just remove the request
            try {
                await axios.delete(`http://localhost:3001/forgotPasswordRequests/${actionRequest.id}`);
                setRequests((prev) => prev.filter((r) => r.id !== actionRequest.id));
                setActionDialogOpen(false);
                setActionRequest(null);
            } catch (err) {
                alert("Failed to decline request. Please try again.");
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="animate-in slide-in-from-top duration-500">
                <h2 className="text-2xl font-bold tracking-tight">Password Reset Requests</h2>
                <p className="text-muted-foreground">Manage pending password reset requests</p>
            </div>
            <div className="w-full overflow-auto rounded-md border animate-in slide-in-from-left duration-500">
                <Table>
                    <TableHeader className="bg-black dark:bg-gray-50">
                        <TableRow>
                            <TableHead className="text-white font-bold w-[200px]">Username</TableHead>
                            <TableHead className="text-white font-bold w-[200px]">New Password</TableHead>
                            <TableHead className="text-white font-bold w-[120px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? (
                            requests.map((req, idx) => (
                                <TableRow key={req.id} className={idx % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : ""}>
                                    <TableCell>{req.username}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => handleViewPassword(req)}>
                                            View
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => handleApprove(req)}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleDecline(req)}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    {/* No password reset requests found */}
                                    <div className="flex flex-col items-center justify-center">
                                        <CloudAlert className="h-25 w-25 text-muted-foreground" />
                                        <p className="text-muted-foreground">No password reset requests found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>View Password</DialogTitle>
                        <DialogDescription>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">New Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={selectedRequest?.newPassword || ""}
                                        readOnly
                                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={selectedRequest?.newPassword || ""}
                                        readOnly
                                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-900"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex items-center gap-2 w-fit"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showPassword ? "Hide Passwords" : "Show Passwords"}
                                </Button>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "approve" ? "Approve" : "Decline"} Password Reset Request
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionType} this password reset request for <b>{actionRequest?.username}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleActionConfirm}
                        >
                            {actionType === "approve" ? "Approve" : "Decline"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PasswordResetRequests; 