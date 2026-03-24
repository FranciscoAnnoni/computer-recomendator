"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, Monitor, Battery, MemoryStick } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface CatalogCardProps {
  laptop: Laptop;
  onVerMas: (laptopId: string) => void;
}

export function CatalogCard({ laptop, onVerMas }: CatalogCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="relative hover:shadow-md transition-shadow duration-150">
      {/* Product image */}
      {laptop.image_url && !imgError ? (
        <img
          src={laptop.image_url}
          alt={laptop.name}
          className="w-full aspect-square object-cover rounded-t-xl"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full aspect-square bg-muted rounded-t-xl flex items-center justify-center text-muted-foreground text-sm">
          {laptop.brand}
        </div>
      )}

      {/* Star badge - only when influencer_note is truthy */}
      {laptop.influencer_note !== null && laptop.influencer_note.length > 0 && (
        <span
          className="absolute top-2 right-2 text-primary text-lg leading-none select-none"
          aria-label="Recomendado por experto"
        >
          ★
        </span>
      )}

      {/* Card content */}
      <CardContent className="p-4">
        {/* Laptop name */}
        <h3 className="text-[17px] font-medium leading-[1.4] text-foreground">
          {laptop.name}
        </h3>

        {/* Price */}
        <p className="text-[12px] text-muted-foreground mt-2">
          ${laptop.price.toLocaleString()}
        </p>

        {/* Tag pills row */}
        {laptop.simplified_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {laptop.simplified_tags.map((tag) => (
              <span
                key={tag}
                className="text-[12px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Tech spec grid */}
        <div className="grid grid-cols-2 gap-1 mt-4">
          {laptop.cpu && (
            <div className="flex items-center gap-1">
              <Cpu size={16} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate">{laptop.cpu}</span>
            </div>
          )}
          {laptop.ram && (
            <div className="flex items-center gap-1">
              <MemoryStick size={16} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate">{laptop.ram}</span>
            </div>
          )}
          {laptop.storage && (
            <div className="flex items-center gap-1">
              <HardDrive size={16} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate">{laptop.storage}</span>
            </div>
          )}
          {laptop.gpu && (
            <div className="flex items-center gap-1">
              <Monitor size={16} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate">{laptop.gpu}</span>
            </div>
          )}
          {laptop.battery && (
            <div className="flex items-center gap-1">
              <Battery size={16} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate">{laptop.battery}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer with Ver mas button */}
      <CardFooter className="p-4">
        <Button
          variant="outline"
          className="w-full h-11 border-primary text-primary hover:bg-primary/10"
          onClick={() => onVerMas(laptop.id)}
        >
          Ver mas
        </Button>
      </CardFooter>
    </Card>
  );
}
