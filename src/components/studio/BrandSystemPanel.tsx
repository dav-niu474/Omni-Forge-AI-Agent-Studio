// ============================================================================
// AI Agent Studio - BrandSystemPanel Component
// Open Design pattern: minimal, accent-tinted — polished
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import {
  Shield,
  Edit3,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";

const DEFAULT_BRAND_MD = `# Brand System

## Colors
- Primary: ...
- Accent: ...

## Typography
- Headings: ...
- Body: ...

## Voice & Tone
- Professional yet approachable

## Components
- Buttons: ...
- Cards: ...

## Motion
- Duration: 200ms
- Easing: ease-out
`;

export function BrandSystemPanel() {
  const { activeBrandSystem, setActiveBrandSystem, brandSystems, setBrandSystems } = useStudioStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const handleEdit = useCallback(() => {
    setEditContent(activeBrandSystem?.content || DEFAULT_BRAND_MD);
    setIsEditing(true);
  }, [activeBrandSystem]);

  const handleSave = useCallback(() => {
    const system = activeBrandSystem
      ? { ...activeBrandSystem, content: editContent, updatedAt: Date.now() }
      : { id: crypto.randomUUID(), name: "Custom Brand System", content: editContent, isActive: true, updatedAt: Date.now() };
    setActiveBrandSystem(system);
    const existing = brandSystems.find((s) => s.id === system.id);
    if (existing) {
      setBrandSystems(brandSystems.map((s) => (s.id === system.id ? system : s)));
    } else {
      setBrandSystems([...brandSystems, system]);
    }
    setIsEditing(false);
  }, [activeBrandSystem, editContent, brandSystems, setActiveBrandSystem, setBrandSystems]);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <span
          className="text-[9px] uppercase tracking-widest font-semibold px-1"
          style={{ color: "var(--text-faint)" }}
        >
          Brand System
        </span>
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[80px] text-[11px] font-mono"
          style={{ borderColor: "var(--border)" }}
          placeholder="Write your BRAND.md..."
        />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            className="h-6 text-[10px] gap-1 bg-accent text-accent-foreground hover:bg-accent-hover"
            onClick={handleSave}
          >
            <Save className="size-2.5" /> Save
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span
          className="text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--text-faint)" }}
        >
          Brand
        </span>
        {activeBrandSystem && (
          <button
            onClick={handleEdit}
            className="text-[9px] hover:text-accent transition-colors"
            style={{ color: "var(--text-faint)" }}
          >
            Edit
          </button>
        )}
      </div>
      {activeBrandSystem ? (
        <div
          className="px-2 py-1.5 rounded-md text-[11px] flex items-center gap-1.5"
          style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
        >
          <Shield className="size-3" />
          <span className="truncate">{activeBrandSystem.name}</span>
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] hover:text-accent hover:bg-[var(--accent-tint)] transition-colors w-full text-left"
          style={{ color: "var(--text-faint)" }}
        >
          <Edit3 className="size-3" />
          Create BRAND.md
        </button>
      )}
    </div>
  );
}
