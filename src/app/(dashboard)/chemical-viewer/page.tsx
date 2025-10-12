"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

// Default 12 chemicals that are always visible
const defaultChemicals = [
  {
    name: "Water",
    formula: "H2O",
    molecularWeight: "18.015",
    physicalState: "Liquid",
    iupacName: "oxidane",
    cid: 962,
  },
  {
    name: "Oxygen",
    formula: "O2",
    molecularWeight: "31.999",
    physicalState: "Gas",
    iupacName: "dioxygen",
    cid: 977,
  },
  {
    name: "Carbon Dioxide",
    formula: "CO2",
    molecularWeight: "44.009",
    physicalState: "Gas",
    iupacName: "carbon dioxide",
    cid: 280,
  },
  {
    name: "Methane",
    formula: "CH4",
    molecularWeight: "16.043",
    physicalState: "Gas",
    iupacName: "methane",
    cid: 297,
  },
  {
    name: "Ethanol",
    formula: "C2H5OH",
    molecularWeight: "46.07",
    physicalState: "Liquid",
    iupacName: "ethanol",
    cid: 702,
  },
  {
    name: "Glucose",
    formula: "C6H12O6",
    molecularWeight: "180.16",
    physicalState: "Solid",
    iupacName: "D-glucose",
    cid: 5793,
  },
  {
    name: "Ammonia",
    formula: "NH3",
    molecularWeight: "17.031",
    physicalState: "Gas",
    iupacName: "ammonia",
    cid: 222,
  },
  {
    name: "Sulfuric Acid",
    formula: "H2SO4",
    molecularWeight: "98.079",
    physicalState: "Liquid",
    iupacName: "sulfuric acid",
    cid: 1118,
  },
  {
    name: "Sodium Chloride",
    formula: "NaCl",
    molecularWeight: "58.44",
    physicalState: "Solid",
    iupacName: "sodium chloride",
    cid: 5234,
  },
  {
    name: "Hydrochloric Acid",
    formula: "HCl",
    molecularWeight: "36.46",
    physicalState: "Gas",
    iupacName: "hydrogen chloride",
    cid: 313,
  },
  {
    name: "Acetone",
    formula: "C3H6O",
    molecularWeight: "58.08",
    physicalState: "Liquid",
    iupacName: "propan-2-one",
    cid: 180,
  },
  {
    name: "Benzene",
    formula: "C6H6",
    molecularWeight: "78.11",
    physicalState: "Liquid",
    iupacName: "benzene",
    cid: 241,
  },
];

type Chemical = {
  name: string;
  formula: string;
  molecularWeight: string;
  physicalState: string;
  iupacName: string;
  cid: number;
};

export default function ChemicalViewerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Chemical[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPubChem(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchPubChem = async (query: string) => {
    setIsSearching(true);
    try {
      // Simple direct name search
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,IUPACName,Title/JSON`
      );
      
      if (!response.ok) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const data = await response.json();
      const properties = data.PropertyTable?.Properties || [];

      const results: Chemical[] = properties.slice(0, 15).map((prop: any) => ({
        name: prop.Title || prop.IUPACName || prop.MolecularFormula || "Unknown",
        formula: prop.MolecularFormula || "N/A",
        molecularWeight: prop.MolecularWeight ? parseFloat(prop.MolecularWeight).toFixed(3) : "N/A",
        physicalState: "Unknown",
        iupacName: prop.IUPACName || "N/A",
        cid: prop.CID,
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("PubChem search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter default chemicals based on search term
  const filteredDefaults = useMemo(() => {
    if (!searchTerm.trim()) {
      return defaultChemicals;
    }
    return defaultChemicals.filter(chemical =>
      chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.formula.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Combine filtered defaults with search results (avoid duplicates)
  const displayedChemicals = useMemo(() => {
    if (!searchTerm.trim()) {
      return defaultChemicals;
    }

    // Show filtered defaults first, then unique search results
    const defaultCids = new Set(filteredDefaults.map(c => c.cid));
    const uniqueSearchResults = searchResults.filter(c => !defaultCids.has(c.cid));
    
    return [...filteredDefaults, ...uniqueSearchResults];
  }, [searchTerm, filteredDefaults, searchResults]);

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Chemical Viewer</h1>
        <p className="text-muted-foreground">Look up detailed information about chemical compounds.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Chemical Database</CardTitle>
          <CardDescription>
            Search for chemicals by name or formula. Results are fetched from PubChem.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a chemical..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedChemicals.length > 0 ? (
              displayedChemicals.map((chemical) => (
                <Card key={chemical.cid} className="bg-card hover:shadow-lg transition-shadow animate-in fade-in-0 slide-in-from-bottom-4">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{chemical.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <p className="font-medium text-muted-foreground">Formula:</p>
                      <p className="text-right font-mono">{chemical.formula}</p>
                      
                      <p className="font-medium text-muted-foreground">Molecular Weight:</p>
                      <p className="text-right font-mono">{chemical.molecularWeight} g/mol</p>
                      
                      <p className="font-medium text-muted-foreground">Physical State:</p>
                      <p className="text-right">{chemical.physicalState}</p>
                      
                      <p className="font-medium text-muted-foreground col-span-2 pt-2 border-t mt-2">IUPAC Name:</p>
                      <p className="text-sm col-span-2 break-words">{chemical.iupacName}</p>
                      
                      <p className="font-medium text-muted-foreground col-span-2 pt-2 border-t mt-2">PubChem CID:</p>
                      <p className="text-right col-span-2">
                        <a 
                          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${chemical.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {chemical.cid}
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">
                  {isSearching ? "Searching..." : `No chemicals found for "${searchTerm}"`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}