// ============================================================================
// AI Agent Studio - BrandSystemPanel Component
// Brand system editor (BRAND.md) with live preview
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
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
- ...

## Components
- Buttons: ...
- Cards: ...
- ...

## Spacing
- Base unit: 4px
- ...

## Icons
- Style: outlined
- ...

## Motion
- Duration: 200ms
- Easing: ease-out
- ...

## Audio Guidelines
- Tone: ...
- Pace: ...

## Video Guidelines
- Aspect ratio: ...
- ...

## 3D Guidelines
- Style: ...
- ...
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

    // Update in brand systems list
    const existing = brandSystems.find((s) => s.id === system.id);
    if (existing) {
      setBrandSystems(
        brandSystems.map((s) => (s.id === system.id ? system : s))
      );
    } else {
      setBrandSystems([...brandSystems, system]);
    }

    setIsEditing(false);
  }, [activeBrandSystem, editContent, brandSystems, setActiveBrandSystem, setBrandSystems]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent("");
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Brand System
        </span>
        <div className="flex items-center gap-1">
          {activeBrandSystem && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={handleEdit}
              title="Edit brand system"
            >
              <Edit3 className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-2">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant={isPreview ? "ghost" : "secondary"}
                size="sm"
                className="h-6 text-[10px] gap-1"
                onClick={() => setIsPreview(false)}
              >
                <Edit3 className="size-3" />
                Edit
              </Button>
              <Button
                variant={isPreview ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[10px] gap-1"
                onClick={() => setIsPreview(true)}
              >
                <Eye className="size-3" />
                Preview
              </Button>
            </div>

            {isPreview ? (
              <ScrollArea className="max-h-48">
                <div className="prose prose-invert prose-xs max-w-none text-xs">
                  <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground font-mono">
                    {editContent}
                  </pre>
                </div>
              </ScrollArea>
            ) : (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px] text-xs font-mono"
                placeholder="Write your BRAND.md..."
              />
            )}

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-6 text-[10px] gap-1"
                onClick={handleSave}
              >
                <Save className="size-3" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1"
                onClick={handleCancel}
              >
                <X className="size-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : activeBrandSystem ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-violet-500/20 bg-violet-500/10">
              <Shield className="size-3.5 text-violet-400 shrink-0" />
              <span className="text-xs text-violet-300 truncate">
                {activeBrandSystem.name}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {activeBrandSystem.content.split("\n").length} lines
              </span>
            </div>
            <ScrollArea className="max-h-32">
              <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap px-1">
                {activeBrandSystem.content.slice(0, 500)}
                {activeBrandSystem.content.length > 500 ? "..." : ""}
              </pre>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <FileText className="size-6 text-muted-foreground/30" />
            <p className="text-[11px] text-muted-foreground text-center">
              No brand system active
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={handleEdit}
            >
              <Edit3 className="size-3" />
              Create BRAND.md
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
