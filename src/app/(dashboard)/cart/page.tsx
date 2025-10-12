
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore } from '@/contexts/FirestoreContext';
import { Download, ShoppingCart, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const LOW_STOCK_THRESHOLD = 50;
const SUGGESTED_REORDER_QUANTITY = 500;

const sellers = [
    { id: 'seller-1', name: 'ChemSupply Co.' },
    { id: 'seller-2', name: 'Global Lab Solutions' },
    { id: 'seller-3', name: 'American Scientific' }
]

export default function CartPage() {
    const { chemicals, loading } = useFirestore();
    const lowStockItems = useMemo(() => 
        chemicals.filter(c => c.quantity < LOW_STOCK_THRESHOLD)
    , [chemicals]);

    const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        lowStockItems.forEach(item => {
            initialState[item.id] = true; // Select all by default
        });
        return initialState;
    });
    
    const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};
        lowStockItems.forEach(item => {
            initialState[item.id] = String(SUGGESTED_REORDER_QUANTITY);
        });
        return initialState;
    });

    const [selectedSeller, setSelectedSeller] = useState<string>('');
    const { toast } = useToast();

    const handleSelectAll = (checked: boolean) => {
        const newSelectedItems: Record<string, boolean> = {};
        lowStockItems.forEach(item => {
            newSelectedItems[item.id] = checked;
        });
        setSelectedItems(newSelectedItems);
    }
    
    const handleSelectItem = (id: string, checked: boolean) => {
        setSelectedItems(prev => ({...prev, [id]: checked}));
    }
    
    const handleQuantityChange = (id: string, value: string) => {
        setOrderQuantities(prev => ({...prev, [id]: value}));
    }

    const itemsToOrder = useMemo(() => {
        return lowStockItems.filter(item => selectedItems[item.id]);
    }, [lowStockItems, selectedItems]);
    
    const allSelected = useMemo(() => {
        return lowStockItems.length > 0 && lowStockItems.every(item => selectedItems[item.id]);
    }, [lowStockItems, selectedItems]);

    const downloadList = () => {
        if (itemsToOrder.length === 0) {
            toast({ variant: 'destructive', title: "No items selected", description: "Please select items to download."});
            return;
        }

        const csvRows = [
            ["ID", "Name", "Formula", "CAS Number", "Current Quantity", "Unit", "Order Quantity"],
            ...itemsToOrder.map(item => [
                item.id,
                item.name,
                item.formula,
                item.casNumber,
                item.quantity,
                item.unit,
                orderQuantities[item.id] || ''
            ])
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "chemical_order_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const placeOrder = () => {
        if (itemsToOrder.length === 0) {
             toast({ variant: 'destructive', title: "No items selected", description: "Please select items to order."});
             return;
        }
        if (!selectedSeller) {
            toast({ variant: 'destructive', title: "No seller selected", description: "Please select a seller to place the order."});
            return;
        }
        
        // In a real app, this would trigger an API call
        toast({ title: "Order Placed!", description: `Your order for ${itemsToOrder.length} items has been sent to ${sellers.find(s => s.id === selectedSeller)?.name}.`});
    }

    return (
        <div className="flex flex-col gap-8">
             <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
                <p className="text-muted-foreground">Review and order low-stock chemicals.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Loading cart...</p>
              </div>
            ) : (
            <Card>
                <CardHeader>
                    <CardTitle>Low & Out of Stock Items</CardTitle>
                    <CardDescription>
                       These items are running low. Select items and specify quantities to reorder.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={allSelected}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Current Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[150px]">Order Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.length > 0 ? lowStockItems.map(item => (
                                    <TableRow key={item.id} data-state={selectedItems[item.id] && "selected"}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedItems[item.id] || false}
                                                onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                                                aria-label={`Select ${item.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name} <span className="text-muted-foreground text-xs">({item.formula})</span></TableCell>
                                        <TableCell className={item.quantity === 0 ? "text-destructive" : "text-amber-500"}>
                                            {item.quantity.toFixed(2)} {item.unit}
                                        </TableCell>
                                        <TableCell>
                                            {item.quantity === 0 ? 
                                                <span className="font-semibold text-destructive">Out of Stock</span> :
                                                <span className="font-semibold text-amber-500">Low Stock</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    value={orderQuantities[item.id] || ''}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    placeholder="Qty"
                                                    aria-label={`Order quantity for ${item.name}`}
                                                    />
                                                <span>{item.unit}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Your inventory is well-stocked! No items are running low.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={downloadList} disabled={itemsToOrder.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Download List
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={itemsToOrder.length === 0}>
                               <ShoppingCart className="mr-2 h-4 w-4" /> Place Order
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to place an order for {itemsToOrder.length} item(s). Please select a seller.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Select onValueChange={setSelectedSeller} value={selectedSeller}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a seller..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sellers.map(seller => (
                                            <SelectItem key={seller.id} value={seller.id}>
                                                {seller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={placeOrder} disabled={!selectedSeller}>
                                    Confirm Order
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
            )}
        </div>
    );
}

    