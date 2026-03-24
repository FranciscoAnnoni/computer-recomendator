"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Laptop } from "@/types/laptop";

export function ResultLaptopCard({ laptop }: { laptop: Laptop }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card>
      {laptop.image_url && !imgError ? (
        <img
          src={laptop.image_url}
          alt={laptop.name}
          className="w-full h-48 object-cover rounded-t-xl"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-48 bg-muted rounded-t-xl flex items-center justify-center text-muted-foreground text-sm">
          {laptop.brand}
        </div>
      )}
      <CardContent>
        <h3 className="text-body font-medium text-foreground">{laptop.name}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {laptop.simplified_tags.map((tag) => (
            <span
              key={tag}
              className="text-small bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-small text-muted-foreground mt-2">
          ${laptop.price.toLocaleString()}
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/catalog?laptop=${laptop.id}`}
          className="text-primary text-body hover:underline"
        >
          Ver mas
        </Link>
      </CardFooter>
    </Card>
  );
}
