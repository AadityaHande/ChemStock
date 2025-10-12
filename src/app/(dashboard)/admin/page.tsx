"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirestore } from '@/contexts/FirestoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Edit, Save, X, Trash2, Search, Plus, Download, Upload, 
  AlertTriangle, CheckCircle, Loader2, Lock, Users 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EditingState = {
  id: string;
  field: string;
  value: string;
};

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { chemicals, equipment, updateChemical, updateEquipment, loading: dataLoading } = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [editingCell, setEditingCell] = useState<EditingState | null>(null);
  const [searchChemical, setSearchChemical] = useState('');
  const [searchEquipment, setSearchEquipment] = useState('');

  // Redirect if not admin
  if (!authLoading && !isAdmin) {
    router.push('/dashboard');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin permissions.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const handleStartEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field, value: String(currentValue) });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleSaveChemical = async (id: string) => {
    if (!editingCell) return;

    try {
      const updateData: any = {};
      
      if (editingCell.field === 'quantity') {
        const qty = parseFloat(editingCell.value);
        if (isNaN(qty) || qty < 0) {
          toast({ variant: "destructive", title: "Invalid quantity", description: "Please enter a valid number" });
          return;
        }
        updateData.quantity = qty;
      } else if (editingCell.field === 'unit') {
        updateData.unit = editingCell.value;
      } else if (editingCell.field === 'formula') {
        updateData.formula = editingCell.value;
      } else if (editingCell.field === 'casNumber') {
        updateData.casNumber = editingCell.value;
      } else if (editingCell.field === 'category') {
        updateData.category = editingCell.value;
      }

      await updateChemical(id, updateData);
      
      toast({
        title: "✅ Updated Successfully",
        description: `Chemical ${editingCell.field} has been updated.`,
      });
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating chemical:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update chemical. Please try again.",
      });
    }
  };

  const handleSaveEquipment = async (id: string) => {
    if (!editingCell) return;

    try {
      const updateData: any = {};
      
      if (editingCell.field === 'totalQuantity') {
        const qty = parseInt(editingCell.value);
        if (isNaN(qty) || qty < 0) {
          toast({ variant: "destructive", title: "Invalid quantity", description: "Please enter a valid number" });
          return;
        }
        updateData.totalQuantity = qty;
        updateData.availableQuantity = qty; // Reset available when total changes
      } else if (editingCell.field === 'condition') {
        updateData.condition = editingCell.value;
      } else if (editingCell.field === 'category') {
        updateData.category = editingCell.value;
      }

      await updateEquipment(id, updateData);
      
      toast({
        title: "✅ Updated Successfully",
        description: `Equipment ${editingCell.field} has been updated.`,
      });
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update equipment. Please try again.",
      });
    }
  };

  const filteredChemicals = useMemo(() => {
    return chemicals.filter(c =>
      c.name.toLowerCase().includes(searchChemical.toLowerCase()) ||
      c.formula.toLowerCase().includes(searchChemical.toLowerCase()) ||
      c.casNumber.toLowerCase().includes(searchChemical.toLowerCase())
    );
  }, [chemicals, searchChemical]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(e =>
      e.name.toLowerCase().includes(searchEquipment.toLowerCase()) ||
      e.category.toLowerCase().includes(searchEquipment.toLowerCase())
    );
  }, [equipment, searchEquipment]);

  const exportChemicalsCSV = () => {
    const headers = ['Name', 'Formula', 'CAS Number', 'Quantity', 'Unit', 'Category'];
    const rows = chemicals.map(c => [
      c.name,
      c.formula,
      c.casNumber,
      c.quantity,
      c.unit,
      c.category
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chemicals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEquipmentCSV = () => {
    const headers = ['Name', 'Total Quantity', 'Available Quantity', 'Category', 'Condition'];
    const rows = equipment.map(e => [
      e.name,
      e.totalQuantity,
      e.availableQuantity,
      e.category,
      e.condition
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderEditableCell = (
    id: string,
    field: string,
    value: any,
    onSave: (id: string) => void
  ) => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            className="h-8 w-32"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(id);
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onSave(id)}>
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span>{value}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleStartEdit(id, field, value)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
  <div className="flex flex-col gap-6 p-2 sm:p-4 md:p-6">
      {/* Header */}
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage inventory, users, and system settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
          <Badge variant="outline">{user?.email}</Badge>
        </div>
      </div>

      {/* Stats Overview */}
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chemicals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chemicals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chemicals.filter(c => c.quantity > 0 && c.quantity < 50).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="chemicals" className="w-full">
        <TabsList className="flex w-full overflow-x-auto gap-2 rounded-md bg-muted p-1">
          <TabsTrigger value="chemicals" className="flex-1 min-w-[100px]">Chemicals</TabsTrigger>
          <TabsTrigger value="equipment" className="flex-1 min-w-[100px]">Equipment</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-w-[100px]">Settings</TabsTrigger>
        </TabsList>

        {/* Chemicals Tab */}
        <TabsContent value="chemicals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chemicals Inventory</CardTitle>
                  <CardDescription>Edit quantities, formulas, CAS numbers, and more</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportChemicalsCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chemicals by name, formula, or CAS..."
                    value={searchChemical}
                    onChange={(e) => setSearchChemical(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Formula</TableHead>
                        <TableHead>CAS Number</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChemicals.map((chemical) => (
                        <TableRow key={chemical.id}>
                          <TableCell className="font-medium">{chemical.name}</TableCell>
                          <TableCell>
                            {renderEditableCell(chemical.id, 'formula', chemical.formula, handleSaveChemical)}
                          </TableCell>
                          <TableCell>
                            {renderEditableCell(chemical.id, 'casNumber', chemical.casNumber, handleSaveChemical)}
                          </TableCell>
                          <TableCell>
                            {renderEditableCell(chemical.id, 'quantity', chemical.quantity.toFixed(3), handleSaveChemical)}
                          </TableCell>
                          <TableCell>
                            {renderEditableCell(chemical.id, 'unit', chemical.unit, handleSaveChemical)}
                          </TableCell>
                          <TableCell>
                            {renderEditableCell(chemical.id, 'category', chemical.category, handleSaveChemical)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={chemical.quantity === 0 ? 'destructive' : chemical.quantity < 50 ? 'warning' : 'default'}>
                              {chemical.quantity === 0 ? 'Out of Stock' : chemical.quantity < 50 ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment Inventory</CardTitle>
                  <CardDescription>Edit quantities, conditions, and categories</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportEquipmentCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment by name or category..."
                    value={searchEquipment}
                    onChange={(e) => setSearchEquipment(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Total Quantity</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEquipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            {renderEditableCell(item.id, 'totalQuantity', item.totalQuantity, handleSaveEquipment)}
                          </TableCell>
                          <TableCell>{item.availableQuantity}</TableCell>
                          <TableCell>
                            {renderEditableCell(item.id, 'category', item.category, handleSaveEquipment)}
                          </TableCell>
                          <TableCell>
                            {renderEditableCell(item.id, 'condition', item.condition, handleSaveEquipment)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.availableQuantity === 0 ? 'destructive' : 'default'}>
                              {item.availableQuantity === 0 ? 'None Available' : `${item.availableQuantity} Available`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Admin Users</h3>
                <p className="text-sm text-muted-foreground">
                  Current admin: {user?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  To add more admins, update the NEXT_PUBLIC_ADMIN_EMAILS in .env.local
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Low Stock Threshold</h3>
                <p className="text-sm text-muted-foreground">
                  Current threshold: 50 units
                </p>
                <p className="text-sm text-muted-foreground">
                  Chemicals below this quantity will be marked as low stock
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Backup & Export</h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
                  <Button variant="outline" onClick={exportChemicalsCSV} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Chemicals
                  </Button>
                  <Button variant="outline" onClick={exportEquipmentCSV} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Equipment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
