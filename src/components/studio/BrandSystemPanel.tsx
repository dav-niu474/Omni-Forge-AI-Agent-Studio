// ============================================================================
// AI Agent Studio - BrandSystemPanel Component
// Claude-inspired: minimal, clean edit/preview toggle
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import {
  Shield,
  Edit3,
  Save,
  Eye,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";

const DEFAULT_BRAND_MD = `# Brand System

## Colors
- Primary: ...
- Secondary: ...
- Accent: ...

## Typography
- Headings: ...
- Body: ...

## Voice & Tone
- Professional yet approachable
- Clear and concise

## Components
- Buttons: ...
- Cards: ...

## Spacing
- Base unit: 4px

## Icons
- Style: outlined

## Motion
- Duration: 200ms
- Easing: ease-out

## Audio Guidelines
- Tone: ...
- Pace: ...

## Video Guidelines
- Aspect ratio: ...

## 3D Guidelines
- Style: ...
`;

export function BrandSystemPanel() {
  const { activeBrandSystem, setActiveBrandSystem, brandSystems, setBrandSystems } =
    useStudioStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const handleEdit = useCallback(() => {
    setEditContent(activeBrandSystem?.content || DEFAULT_BRAND_MD);
    setIsEditing(true);
    setIsPreview(false);
  }, [activeBrandSystem]);

  const handleSave = useCallback(() => {
    const system = activeBrandSystem
      ? { ...activeBrandSystem, content: editContent, updatedAt: Date.now() }
      : {
          id: crypto.randomUUID(),
          name: "Custom Brand System",
          content: editContent,
          isActive: true,
          updatedAt: Date.now(),
        };

    setActiveBrandSystem(system);
    const existing = brandSystems.find((s) => s.id === system.id);
    if (existing) {
      setBrandSystems(brandSystems.map((s) => (s.id === system.id ? system : s)));
    } else {
      setBrandSystems([...brandSystems, system]);
    }
    setIsEditing(false);
  }, [activeBrandSystem, editContent, brandSystems, setActiveBrandSystem, setBrandSystems]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent("");
  }, []);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          Brand System
        </span>
        <div className="flex items-center gap-1">
          <button
            className={cn("px-2 py-1 rounded text-[11px] transition-colors", !isPreview ? "bg-accent text-accent-foreground" : "text-muted-foreground/50 hover:text-foreground")}
            onClick={() => setIsPreview(false)}
          >
            Edit
          </button>
          <button
            className={cn("px-2 py-1 rounded text-[11px] transition-colors", isPreview ? "bg-accent text-accent-foreground" : "text-muted-foreground/50 hover:text-foreground")}
            onClick={() => setIsPreview(true)}
          >
            Preview
          </button>
        </div>
        {isPreview ? (
          <ScrollArea className="max-h-36">
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground/60 font-mono">
              {editContent}
            </pre>
          </ScrollArea>
        ) : (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] text-xs font-mono border-border/60"
            placeholder="Write your BRAND.md..."
          />
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 text-[11px] gap-1" onClick={handleSave}>
            <Save className="size-3" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          Brand System
        </span>
        {activeBrandSystem && (
          <button
            onClick={handleEdit}
            className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {activeBrandSystem ? (
        <div className="px-2.5 py-2 rounded-md bg-accent/50 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-muted-foreground/40" />
            <span className="text-muted-foreground/70">{activeBrandSystem.name}</span>
            <span className="text-[10px] text-muted-foreground/30 ml-auto">
              {activeBrandSystem.content.split("\n").length} lines
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-3">
          <p className="text-[11px] text-muted-foreground/40">No brand system active</p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 border-border/40"
            onClick={handleEdit}
          >
            <Edit3 className="size-3" />
            Create
          </Button>
        </div>
      )}
    </div>
  );
}
